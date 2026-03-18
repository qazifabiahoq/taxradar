import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

const LOADING_STEPS = [
  "Extracting document text...",
  "Classifying document types...",
  "Cross-checking income sources...",
  "Scoring deduction risks...",
  "Detecting missing documents...",
  "Generating CPA memo...",
];

export default function Upload() {
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const startAnalysis = async () => {
    if (!files.length) return;
    setIsAnalyzing(true);
    setCurrentStep(0);

    const formData = new FormData();
    files.forEach(f => formData.append("files", f));

    // Run animation and API call in parallel
    const [, apiResult] = await Promise.allSettled([
      (async () => {
        for (let i = 0; i < LOADING_STEPS.length; i++) {
          setCurrentStep(i);
          await new Promise(r => setTimeout(r, 800));
        }
      })(),
      API_URL
        ? axios.post(`${API_URL}/api/analyze`, formData)
        : Promise.reject(new Error("No API URL")),
    ]);

    if (apiResult.status === "fulfilled" && apiResult.value?.data) {
      sessionStorage.setItem("reportData", JSON.stringify(apiResult.value.data));
    }
    // If API failed, leave whatever was in sessionStorage (or nothing — report handles it)

    setLocation("/report");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Upload Tax Documents</h1>
          <p style={{ color: "#8892B0" }}>Securely upload client documents for instant AI analysis and risk scoring.</p>
        </div>

        {isAnalyzing ? (
          <div style={{ background: "#112240", borderRadius: 20, padding: 64, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto 32px" }}>
              <svg style={{ animation: "spin 1.5s linear infinite", width: "100%", height: "100%" }} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="rgba(16,185,129,0.2)" strokeWidth="4" fill="none" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="#10B981" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#10B981", fontWeight: 700, fontSize: 18 }}>{Math.round((currentStep / LOADING_STEPS.length) * 100)}%</span>
              </div>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Analyzing Documents</h3>
            <div style={{ maxWidth: 360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
              {LOADING_STEPS.map((step, index) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: 12, opacity: index > currentStep ? 0.3 : 1 }}>
                  {index < currentStep ? (
                    <span style={{ color: "#10B981", fontSize: 18 }}>&#10003;</span>
                  ) : index === currentStep ? (
                    <span style={{ color: "#10B981" }}>&#9679;</span>
                  ) : (
                    <span style={{ color: "#8892B0" }}>&#9675;</span>
                  )}
                  <span style={{ color: index === currentStep ? "#10B981" : "#8892B0", fontWeight: 500 }}>{step}</span>
                </div>
              ))}
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? "#10B981" : "rgba(255,255,255,0.15)"}`,
                borderRadius: 20,
                padding: "64px 48px",
                textAlign: "center",
                cursor: "pointer",
                background: isDragging ? "hsla(160,84%,39%,0.05)" : "hsla(218,58%,16%,0.3)",
                transition: "all 0.2s",
              }}
            >
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv" style={{ display: "none" }} />
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#0A1628", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Drag and drop documents here</h3>
              <p style={{ color: "#8892B0", marginBottom: 24 }}>Accepts PDF, Excel, CSV, JPG, PNG up to 50MB</p>
              <button style={{ background: "rgba(255,255,255,0.08)", color: "#fff", padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500 }}>Browse Files</button>
              <p style={{ color: "#8892B0", fontSize: 13, marginTop: 16 }}>You can upload multiple files at once.</p>
            </div>

            {files.length > 0 && (
              <div style={{ background: "#112240", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: "#8892B0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Selected Files</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 240, overflowY: "auto", marginBottom: 24 }}>
                  {files.map((file, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0A1628", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{file.name}</span>
                        <span style={{ color: "#8892B0", fontSize: 12 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} style={{ background: "none", border: "none", color: "#8892B0", cursor: "pointer", fontSize: 18 }}>x</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
                  <button onClick={startAnalysis} style={{ background: "#10B981", color: "#0A1628", fontWeight: 700, fontSize: 15, padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer" }}>
                    Analyze Documents
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
