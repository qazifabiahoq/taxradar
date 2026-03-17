import { AnalysisReport } from "@workspace/api-client-react";

export const mockReportData: AnalysisReport = {
  client_name: "Johnson & Associates LLC",
  tax_year: "2024",
  analysis_date: "March 17, 2026",
  executive_summary: "The 2024 tax filing for Johnson and Associates LLC presents several areas requiring attention prior to submission. The analysis identified inconsistencies in reported self-employment income across multiple 1099 forms and the primary Schedule C filing. Additionally, home office deductions exceed industry benchmarks for the reported business type, creating elevated audit exposure. Three required supporting documents are absent from the provided materials, which must be obtained before filing.",
  audit_risk_score: 67,
  risk_distribution: { high: 3, medium: 5, low: 4 },
  income_sources: [
    { source: "W-2 Wages (Employer: Acme Corp)", amount: 145000, status: "consistent", notes: "Matches employer records" },
    { source: "1099-NEC (Client A)", amount: 28500, status: "flagged", notes: "Discrepancy of $4,200 vs Schedule C reported income" },
    { source: "1099-NEC (Client B)", amount: 15200, status: "consistent", notes: "Matches Schedule C" },
    { source: "1099-INT (First National Bank)", amount: 1840, status: "consistent", notes: "Matches bank statement" },
    { source: "1099-DIV (Vanguard)", amount: 3200, status: "flagged", notes: "Qualified dividend classification unclear" }
  ],
  top_risks: [
    { category: "Home Office Deduction", description: "Claimed home office square footage represents 42% of total residence, exceeding IRS safe harbor guidelines and creating significant audit risk.", risk_level: "high" },
    { category: "Income Discrepancy", description: "1099-NEC income from Client A does not reconcile with Schedule C gross receipts. Difference of $4,200 must be explained and documented.", risk_level: "high" },
    { category: "Vehicle Business Use", description: "100% business use claimed for personal vehicle without mileage log documentation. IRS requires contemporaneous mileage records.", risk_level: "high" }
  ],
  deductions: [
    { category: "Home Office", amount: 18400, risk_level: "high", notes: "42% of residence claimed - exceeds typical thresholds" },
    { category: "Vehicle and Transportation", amount: 12600, risk_level: "high", notes: "100% business use without mileage log" },
    { category: "Meals and Entertainment", amount: 8200, risk_level: "medium", notes: "Some receipts missing business purpose documentation" },
    { category: "Travel Expenses", amount: 6800, risk_level: "medium", notes: "International travel requires additional substantiation" },
    { category: "Professional Development", amount: 4100, risk_level: "low", notes: "Well-documented with receipts" },
    { category: "Office Supplies", amount: 2800, risk_level: "low", notes: "Receipts provided and amounts reasonable" },
    { category: "Professional Services", amount: 5500, risk_level: "low", notes: "Invoices on file, amounts consistent" },
    { category: "Health Insurance Premiums", amount: 9600, risk_level: "medium", notes: "Self-employed health insurance - verify S-corp eligibility" }
  ],
  missing_documents: [
    { document: "Vehicle Mileage Log", reason: "Required to substantiate 100% business use vehicle deduction claim. IRS requires contemporaneous records.", impact: "critical" },
    { document: "Home Office Measurement Documentation", reason: "Floor plan or measurement records required to support square footage calculation used for home office deduction.", impact: "critical" },
    { document: "1099-DIV Form from Vanguard", reason: "Original 1099-DIV needed to confirm qualified dividend classification and applicable tax rates.", impact: "important" }
  ],
  cpa_memo: "TAX READINESS MEMO\n\nClient: Johnson and Associates LLC\nTax Year: 2024\nPrepared: March 17, 2026\nRisk Level: HIGH (Score: 67/100)\n\nEXECUTIVE SUMMARY\n\nThis memo summarizes the findings from the TaxRadar automated document review for the 2024 tax year. Three high-risk items, five medium-risk items, and four low-risk items were identified. Immediate action is required on two missing documents before this return can be filed safely.\n\nHIGH PRIORITY ITEMS\n\n1. Home Office Deduction (HIGH RISK)\nThe claimed home office deduction of $18,400 is based on 42% business use of the residence. This percentage significantly exceeds the IRS safe harbor threshold and will likely attract scrutiny. Recommend reducing the claimed percentage to a defensible level with supporting documentation, or prepare detailed substantiation records.\n\n2. Income Reconciliation Required (HIGH RISK)\nA discrepancy of $4,200 exists between 1099-NEC income reported by Client A ($28,500) and the amount reflected on Schedule C ($24,300). This must be reconciled prior to filing. Either obtain a corrected 1099 or document the adjustment with a written explanation.\n\n3. Vehicle Mileage Documentation (HIGH RISK)\nThe 100% business use claim for the personal vehicle requires a contemporaneous mileage log. No such log was provided. Without this documentation, the entire vehicle deduction of $12,600 is at risk of disallowance.\n\nACTION ITEMS BEFORE FILING\n\n- Obtain vehicle mileage log covering all of 2024\n- Provide home office floor plan or measurement documentation\n- Resolve 1099-NEC discrepancy with Client A (obtain corrected form or written explanation)\n- Retrieve original 1099-DIV from Vanguard to confirm dividend classification\n\nCONCLUSION\n\nThis return is not ready for filing in its current state. The missing documents and identified discrepancies create unacceptable audit exposure. Once the action items above are completed, a revised analysis should be performed before submission."
};
