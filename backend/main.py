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

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze_documents(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="At least one file must be provided.")
    extracted_texts = []
    for upload in files:
        content = await upload.read()
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
                wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
                lines = []
                for sheet in wb.worksheets:
                    lines.append(f"[Sheet: {sheet.title}]")
                    for row in sheet.iter_rows(values_only=True):
                        row_text = "\t".join("" if v is None else str(v) for v in row)
                        if row_text.strip():
                            lines.append(row_text)
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
    report = await run_analysis(combined_text)
    return report
