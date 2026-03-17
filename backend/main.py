from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pdfplumber
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
        if upload.content_type == "application/pdf" or upload.filename.lower().endswith(".pdf"):
            try:
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    text = "\n".join(page.extract_text() or "" for page in pdf.pages)
                extracted_texts.append(f"[FILE: {upload.filename}]\n{text}")
            except Exception as e:
                extracted_texts.append(f"[FILE: {upload.filename}] (PDF extraction failed: {str(e)})")
        else:
            extracted_texts.append(f"[FILE: {upload.filename}] (non-PDF file uploaded, manual review required)")
    combined_text = "\n\n---\n\n".join(extracted_texts)
    report = await run_analysis(combined_text)
    return report
