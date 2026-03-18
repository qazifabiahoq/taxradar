from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pypdf
import openpyxl
import csv
import io
from agents import run_analysis

app = FastAPI(title="TaxRadar API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024       # 50 MB per file
MAX_COMBINED_TEXT_CHARS = 500_000            # ~500 KB of combined extracted text


@app.get("/")
@app.get("/health")
@app.get("/healthz")
def health_check():
    return {"status": "ok", "service": "TaxRadar API"}


@app.post("/api/analyze")
async def analyze_documents(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="At least one file must be provided.")

    extracted_texts = []

    for upload in files:
        content = await upload.read()

        # Enforce 50 MB per-file limit
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File '{upload.filename}' exceeds the 50 MB size limit.",
            )

        fname = upload.filename.lower()

        if fname.endswith(".pdf"):
            try:
                reader = pypdf.PdfReader(io.BytesIO(content))
                text = "\n".join(page.extract_text() or "" for page in reader.pages)
                extracted_texts.append(f"[FILE: {upload.filename}]\n{text}")
            except Exception as e:
                extracted_texts.append(f"[FILE: {upload.filename}] (PDF extraction failed: {str(e)})")

        elif fname.endswith(".xlsx") or fname.endswith(".xls"):
            try:
                def _parse_xlsx(raw: bytes, data_only: bool) -> tuple[list[str], int]:
                    """Extract all sheets; return (lines, value_count)."""
                    wb = openpyxl.load_workbook(io.BytesIO(raw), data_only=data_only)
                    lines: list[str] = []
                    value_count = 0
                    for sheet in wb.worksheets:
                        lines.append(f"\n[Sheet: {sheet.title}]")
                        for row in sheet.iter_rows(values_only=True):
                            formatted: list[str] = []
                            for v in row:
                                if v is None:
                                    continue
                                elif isinstance(v, bool):
                                    formatted.append(str(v))
                                elif isinstance(v, float):
                                    formatted.append(f"{v:,.2f}")
                                elif isinstance(v, int):
                                    formatted.append(f"{v:,}")
                                elif hasattr(v, "strftime"):
                                    formatted.append(v.strftime("%Y-%m-%d"))
                                else:
                                    s = str(v).strip()
                                    if s:
                                        formatted.append(s)
                            if not formatted:
                                continue
                            value_count += len(formatted)
                            if len(formatted) == 2:
                                lines.append(f"  {formatted[0]}: {formatted[1]}")
                            else:
                                lines.append("  " + " | ".join(formatted))
                    return lines, value_count

                # Try cached formula results first; fall back if cells are mostly None
                lines, val_count = _parse_xlsx(content, data_only=True)
                if val_count < 10:
                    # data_only=True returned almost nothing — likely uncached formulas
                    # Retry without it (formula cells return formula text instead of None)
                    lines, _ = _parse_xlsx(content, data_only=False)

                extracted_texts.append(f"[FILE: {upload.filename}]\n" + "\n".join(lines))
            except Exception as e:
                extracted_texts.append(f"[FILE: {upload.filename}] (Excel extraction failed: {str(e)})")

        elif fname.endswith(".csv"):
            try:
                text = content.decode("utf-8", errors="replace")
                reader = csv.reader(io.StringIO(text))
                lines = ["\t".join(row) for row in reader if any(row)]
                extracted_texts.append(f"[FILE: {upload.filename}]\n" + "\n".join(lines))
            except Exception as e:
                extracted_texts.append(f"[FILE: {upload.filename}] (CSV extraction failed: {str(e)})")

        else:
            extracted_texts.append(f"[FILE: {upload.filename}] (unsupported file type, skipped)")

    combined_text = "\n\n---\n\n".join(extracted_texts)

    # Guard against extremely large inputs (protects Gemini token limits)
    if len(combined_text) > MAX_COMBINED_TEXT_CHARS:
        combined_text = combined_text[:MAX_COMBINED_TEXT_CHARS]

    report = await run_analysis(combined_text)

    # Return 500 if the pipeline itself failed (error sentinel in response)
    if report.get("risk_level") == "unknown":
        raise HTTPException(
            status_code=500,
            detail=report.get("executive_summary", "Analysis pipeline failed. Please try again."),
        )

    return report
