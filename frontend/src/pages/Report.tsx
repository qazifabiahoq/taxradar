import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import * as XLSX from "xlsx";
import Navbar from "@/components/Navbar";

interface IncomeSource { source: string; amount: number; status: "consistent" | "flagged"; notes: string; }
interface RiskItem { category: string; description: string; risk_level: "high" | "medium" | "low"; }
interface Deduction { category: string; amount: number; risk_level: "high" | "medium" | "low"; notes: string; }
interface MissingDocument { document: string; reason: string; impact: "critical" | "important" | "minor"; }
interface Report {
  client_name?: string; tax_year?: string; analysis_date?: string;
  executive_summary: string; audit_risk_score: number;
  risk_distribution: { high: number; medium: number; low: number };
  income_sources: IncomeSource[]; top_risks: RiskItem[]; deductions: Deduction[];
  missing_documents: MissingDocument[]; cpa_memo: string;
}

const MOCK: Report = {
  client_name: "Johnson and Associates LLC", tax_year: "2024", analysis_date: "March 17, 2026",
  executive_summary: "The 2024 tax filing for Johnson and Associates LLC presents several areas requiring attention prior to submission. The analysis identified inconsistencies in reported self-employment income across multiple 1099 forms and the primary Schedule C filing. Additionally, home office deductions exceed industry benchmarks for the reported business type, creating elevated audit exposure.",
  audit_risk_score: 67, risk_distribution: { high: 3, medium: 5, low: 4 },
  income_sources: [
    { source: "W-2 Wages (Employer: Acme Corp)", amount: 145000, status: "consistent", notes: "Matches employer records" },
    { source: "1099-NEC (Client A)", amount: 28500, status: "flagged", notes: "Discrepancy of $4,200 vs Schedule C" },
    { source: "1099-NEC (Client B)", amount: 15200, status: "consistent", notes: "Matches Schedule C" },
    { source: "1099-INT (First National Bank)", amount: 1840, status: "consistent", notes: "Matches bank statement" },
    { source: "1099-DIV (Vanguard)", amount: 3200, status: "flagged", notes: "Qualified dividend classification unclear" },
  ],
  top_risks: [
    { category: "Home Office Deduction", description: "Claimed home office square footage represents 42% of total residence, exceeding IRS safe harbor guidelines.", risk_level: "high" },
    { category: "Income Discrepancy", description: "1099-NEC income from Client A does not reconcile with Schedule C gross receipts. Difference of $4,200.", risk_level: "high" },
    { category: "Vehicle Business Use", description: "100% business use claimed for personal vehicle without mileage log documentation.", risk_level: "high" },
  ],
  deductions: [
    { category: "Home Office", amount: 18400, risk_level: "high", notes: "42% of residence claimed - exceeds typical thresholds" },
    { category: "Vehicle and Transportation", amount: 12600, risk_level: "high", notes: "100% business use without mileage log" },
    { category: "Meals and Entertainment", amount: 8200, risk_level: "medium", notes: "Some receipts missing business purpose documentation" },
    { category: "Travel Expenses", amount: 6800, risk_level: "medium", notes: "International travel requires additional substantiation" },
    { category: "Professional Development", amount: 4100, risk_level: "low", notes: "Well-documented with receipts" },
    { category: "Office Supplies", amount: 2800, risk_level: "low", notes: "Receipts provided and amounts reasonable" },
  ],
  missing_documents: [
    { document: "Vehicle Mileage Log", reason: "Required to substantiate 100% business use vehicle deduction claim.", impact: "critical" },
    { document: "Home Office Measurement Documentation", reason: "Floor plan required to support square footage calculation.", impact: "critical" },
    { document: "1099-DIV Form from Vanguard", reason: "Original form needed to confirm qualified dividend classification.", impact: "important" },
  ],
  cpa_memo: `TAX READINESS MEMO\n\nClient: Johnson and Associates LLC\nTax Year: 2024\nRisk Level: HIGH (Score: 67/100)\n\nEXECUTIVE SUMMARY\n\nThree high-risk items, five medium-risk items, and four low-risk items were identified. Immediate action is required on two missing documents before this return can be filed safely.\n\nACTION ITEMS BEFORE FILING\n\n- Obtain vehicle mileage log covering all of 2024\n- Provide home office floor plan or measurement documentation\n- Resolve 1099-NEC discrepancy with Client A\n- Retrieve original 1099-DIV from Vanguard`,
};

const RISK_COLORS = { high: "#EF4444", medium: "#F59E0B", low: "#34D399" };

export default function Report() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<Report | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [memo, setMemo] = useState("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("reportData");
    const report = stored ? JSON.parse(stored) : MOCK;
    setData(report);
    setMemo(report.cpa_memo);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) setShowDownloadMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const downloadExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryRows = [
      ["Tax Readiness Report"],
      ["Client", data.client_name || ""],
      ["Tax Year", data.tax_year || ""],
      ["Analysis Date", data.analysis_date || ""],
      ["Audit Risk Score", data.audit_risk_score],
      ["Risk Level", data.audit_risk_score >= 70 ? "HIGH" : data.audit_risk_score >= 40 ? "MEDIUM" : "LOW"],
      [],
      ["Risk Distribution"],
      ["High Risk Items", data.risk_distribution.high],
      ["Medium Risk Items", data.risk_distribution.medium],
      ["Low Risk Items", data.risk_distribution.low],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "Summary");

    // Income Sources sheet
    const incomeData = [
      ["Source Document", "Amount ($)", "Status", "Notes"],
      ...data.income_sources.map((s: any) => [
        s.source || s.type || "",
        Number(s.amount ?? 0),
        s.status === "consistent" ? "Consistent" : "Flagged",
        s.notes || "",
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incomeData), "Income Sources");

    // Deductions sheet
    const deductionData = [
      ["Category", "Amount ($)", "Risk Level", "Notes / Flag Reason", "Recommendation"],
      ...data.deductions.map((d: any) => [
        d.category || d.deduction_type || "",
        Number(d.amount ?? d.amount_claimed ?? 0),
        (d.risk_level || "").toUpperCase(),
        d.notes || d.flag_reason || "",
        d.recommendation || "",
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deductionData), "Deductions");

    // Missing Documents sheet
    const missingData = [
      ["Document / Form", "Reason Required", "Consequence / Impact"],
      ...data.missing_documents.map((doc: any) => [
        doc.document || doc.form_name || "",
        doc.reason || doc.reason_required || "",
        doc.consequence || doc.impact || doc.risk_of_absence || "",
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(missingData), "Missing Documents");

    // Top Risks sheet
    const risksData = [
      ["Risk Category", "Risk Level", "Description"],
      ...data.top_risks.map((r: any) => [
        r.category || r.title || "",
        (r.risk_level || "HIGH").toUpperCase(),
        r.description || r.explanation || "",
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(risksData), "Top Risks");

    const filename = `TaxRadar_Report_${data.client_name || "Client"}_${data.tax_year || ""}.xlsx`.replace(/\s+/g, "_");
    XLSX.writeFile(wb, filename);
    setShowDownloadMenu(false);
  };

  if (!data) return null;

  const chartData = [
    { name: "High Risk", value: data.risk_distribution.high, color: RISK_COLORS.high },
    { name: "Medium Risk", value: data.risk_distribution.medium, color: RISK_COLORS.medium },
    { name: "Low Risk", value: data.risk_distribution.low, color: RISK_COLORS.low },
  ].filter(d => d.value > 0);

  const riskScore = data.audit_risk_score;
  const scoreColor = riskScore >= 70 ? "#EF4444" : riskScore >= 40 ? "#F59E0B" : "#34D399";
  const statusLabel = riskScore >= 70 ? "High Risk" : riskScore >= 40 ? "Review Required" : "Ready to File";

  return (
    <div style={{ minHeight: "100vh", background: "#0A1628", color: "#fff" }}>
      <Navbar />

      <div style={{ position: "sticky", top: 72, zIndex: 40, background: "hsla(218,58%,16%,0.95)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 0", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700 }}>Tax Readiness Report</h1>
              <p style={{ fontSize: 13, color: "#8892B0" }}>{data.client_name} - Tax Year {data.tax_year} - {data.analysis_date}</p>
            </div>
            <span style={{ background: scoreColor, color: "#0A1628", fontWeight: 700, fontSize: 12, padding: "4px 12px", borderRadius: 999 }}>{statusLabel}</span>
            <span style={{ color: scoreColor, fontWeight: 800, fontSize: 20 }}>{riskScore}/100</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigator.clipboard.writeText(memo)} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontWeight: 500 }}>Copy Memo</button>
            <div ref={downloadRef} style={{ position: "relative" }}>
              <button onClick={() => setShowDownloadMenu(p => !p)} style={{ background: "#10B981", color: "#0A1628", padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                Download Report <span style={{ fontSize: 10 }}>▼</span>
              </button>
              {showDownloadMenu && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#112240", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden", minWidth: 160, zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                  <button onClick={() => { setShowDownloadMenu(false); window.print(); }} style={{ width: "100%", padding: "12px 16px", background: "transparent", color: "#fff", border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: 16 }}>📄</span> PDF
                  </button>
                  <button onClick={downloadExcel} style={{ width: "100%", padding: "12px 16px", background: "transparent", color: "#fff", border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontSize: 16 }}>📊</span> Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 2rem", display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
          <div style={{ background: "#112240", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, width: "100%", textAlign: "left" }}>Audit Risk Score</h3>
            <div style={{ position: "relative", width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={58} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#112240", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} itemStyle={{ color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: scoreColor }}>{riskScore}</span>
                <span style={{ fontSize: 12, color: "#8892B0" }}>/ 100</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 13, fontWeight: 500 }}>
              {[["#EF4444", `${data.risk_distribution.high} High`], ["#F59E0B", `${data.risk_distribution.medium} Med`], ["#34D399", `${data.risk_distribution.low} Low`]].map(([color, label]) => (
                <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color as string }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#112240", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: "#10B981" }}>Executive Summary</h3>
            <p style={{ color: "#8892B0", lineHeight: 1.8 }}>{data.executive_summary}</p>
            {data.missing_documents.length > 0 && (
              <div style={{ marginTop: 24, padding: 16, background: "hsla(0,84%,60%,0.1)", border: "1px solid hsla(0,84%,60%,0.2)", borderRadius: 12 }}>
                <p style={{ color: "#EF4444", fontWeight: 600, fontSize: 14 }}>Missing Documents Action Required</p>
                <p style={{ color: "hsla(0,84%,60%,0.8)", fontSize: 13, marginTop: 4 }}>There are {data.missing_documents.length} missing documents preventing safe filing. Please request these immediately.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#EF4444" }}>&#9888;</span> Top Audit Risks Identified
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {data.top_risks.map((risk: any, i) => (
              <div key={i} style={{ background: "#112240", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,0.05)", borderTop: "4px solid #EF4444", position: "relative" }}>
                <span style={{ position: "absolute", top: 16, right: 16, background: "hsla(0,84%,60%,0.15)", color: "#EF4444", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>HIGH RISK</span>
                <h4 style={{ fontWeight: 700, marginBottom: 10, paddingRight: 80 }}>{risk.category || risk.title || ''}</h4>
                <p style={{ color: "#8892B0", fontSize: 13, lineHeight: 1.7 }}>{risk.description || risk.explanation || ''}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#112240", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ fontWeight: 700 }}>Income Cross-Check</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "hsla(216,60%,10%,0.5)", color: "#8892B0" }}>
                {["Source Document", "Amount", "Status", "Notes"].map(h => <th key={h} style={{ padding: "14px 24px", textAlign: "left", fontWeight: 500 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.income_sources.map((s: any, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "14px 24px", fontWeight: 500 }}>{s.source || s.type || 'Unknown'}</td>
                  <td style={{ padding: "14px 24px" }}>${Number(s.amount ?? 0).toLocaleString()}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: s.status === "consistent" ? "hsla(158,64%,52%,0.1)" : "hsla(38,92%,50%,0.1)", color: s.status === "consistent" ? "#34D399" : "#F59E0B", border: `1px solid ${s.status === "consistent" ? "hsla(158,64%,52%,0.2)" : "hsla(38,92%,50%,0.2)"}` }}>
                      {s.status === "consistent" ? "Consistent" : "Flagged"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 24px", color: "#8892B0" }}>{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Deduction Analysis</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.deductions.map((d: any, i) => {
              const color = d.risk_level === "high" ? "#EF4444" : d.risk_level === "medium" ? "#F59E0B" : "#34D399";
              const detail = d.notes || d.flag_reason || '';
              const recommendation = d.recommendation || '';
              const hasDetail = !!(detail || recommendation);
              return (
                <div key={i} onClick={() => hasDetail && setExpandedRows(p => ({ ...p, [i]: !p[i] }))} style={{ background: "#112240", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", borderLeft: `4px solid ${color}`, cursor: hasDetail ? "pointer" : "default" }}>
                  <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{d.category || (d as any).deduction_type || 'Unknown'}</div>
                      <div style={{ fontSize: 13, color: "#8892B0", marginTop: 2 }}>${Number(d.amount ?? (d as any).amount_claimed ?? 0).toLocaleString()}</div>
                    </div>
                    <span style={{ background: `${color}20`, color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase" }}>{d.risk_level} Risk</span>
                  </div>
                  {expandedRows[i] && hasDetail && (
                    <div style={{ padding: "0 24px 16px 24px", color: "#8892B0", fontSize: 13, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      {detail && <p style={{ paddingTop: 12 }}>{detail}</p>}
                      {recommendation && <p style={{ paddingTop: 8, color: "#10B981" }}>Recommendation: {recommendation}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {data.missing_documents.length > 0 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Missing Required Documentation</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              {data.missing_documents.map((doc: any, i) => (
                <div key={i} style={{ background: "#0A1628", borderRadius: 14, padding: 20, border: "1px solid hsla(0,84%,60%,0.3)", display: "flex", gap: 16 }}>
                  <div style={{ background: "hsla(0,84%,60%,0.1)", borderRadius: 10, padding: 8, flexShrink: 0, height: 40 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, marginBottom: 6 }}>{doc.document || doc.form_name || ''}</h4>
                    <p style={{ color: "#8892B0", fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{doc.reason || doc.reason_required || ''}</p>
                    {(doc.consequence || doc.impact || doc.risk_of_absence) && (
                      <span style={{ background: "hsla(0,84%,60%,0.1)", color: "#EF4444", border: "1px solid hsla(0,84%,60%,0.3)", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                        Impact: {doc.consequence || doc.impact || doc.risk_of_absence}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: "#112240", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700 }}>Generated CPA Memo</h3>
            <button onClick={() => navigator.clipboard.writeText(memo)} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 13 }}>Copy Memo</button>
          </div>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            style={{ width: "100%", height: 384, background: "#0A1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 24, color: "#fff", fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
