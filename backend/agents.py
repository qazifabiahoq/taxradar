import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash-preview-04-17")


def call_agent(system_prompt: str, user_content: str) -> dict:
    prompt = f"{system_prompt}\n\nINPUT:\n{user_content}\n\nRespond with valid JSON only. No markdown. No explanation. No code blocks."
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        return {"error": str(e)}


def agent_1_classifier(extracted_text: str) -> dict:
    system_prompt = """You are a senior tax document classification specialist at a Big 4 accounting firm.

Your task is to analyze raw text extracted from tax documents and identify each document present.

For each document found return:
- document_type: one of [W-2, 1099-NEC, 1099-MISC, 1099-B, 1099-INT, 1099-DIV, K-1, Schedule-C, Schedule-E, Form-8949, bank-statement, receipt, invoice, unknown]
- tax_year: the tax year as a string e.g. 2024 or unknown
- taxpayer_name: name of the taxpayer or entity or unknown
- issuer_name: name of employer, payer, or financial institution or unknown
- confidence: high, medium, or low

Return this exact JSON structure:
{
  "documents": [
    {
      "document_type": "",
      "tax_year": "",
      "taxpayer_name": "",
      "issuer_name": "",
      "confidence": ""
    }
  ],
  "total_documents_found": 0,
  "tax_years_present": [],
  "primary_taxpayer": ""
}"""
    return call_agent(system_prompt, extracted_text)


def agent_2_extractor(extracted_text: str, document_manifest: dict) -> dict:
    system_prompt = """You are a senior tax data extraction specialist at a Big 4 accounting firm.

You have already classified the documents. Now extract specific financial fields from each document type.

Extract the following per document type:
- W-2: wages box 1, federal tax withheld box 2, state tax withheld, employer name
- 1099-NEC: nonemployee compensation amount, payer name
- 1099-MISC: miscellaneous income amount, payer name
- 1099-B: total proceeds, total cost basis, net gain or loss
- 1099-INT: interest income amount, institution name
- 1099-DIV: ordinary dividends, qualified dividends, institution name
- K-1: ordinary business income, self-employment income, partnership or S-corp name
- Schedule-C: gross receipts, total expenses, net profit or loss, business name
- Schedule-E: rental income, rental expenses, net rental income
- bank-statement: total deposits, total withdrawals, account institution
- receipt: amount, category, vendor name
- invoice: amount, service description, vendor name

Return this exact JSON structure:
{
  "extracted_financials": [
    {
      "document_type": "",
      "issuer": "",
      "fields": {},
      "amounts": {}
    }
  ],
  "total_gross_income": 0,
  "total_tax_withheld": 0,
  "income_sources": [
    {
      "source": "",
      "type": "",
      "amount": 0
    }
  ],
  "total_deductions_claimed": 0
}"""
    combined_input = f"DOCUMENT MANIFEST:\n{json.dumps(document_manifest, indent=2)}\n\nRAW TEXT:\n{extracted_text}"
    return call_agent(system_prompt, combined_input)


def agent_3_income_validator(extracted_financials: dict) -> dict:
    system_prompt = """You are a senior tax compliance specialist at a Big 4 accounting firm.

Your task is to cross-validate income reported across all tax documents and identify discrepancies that could trigger an IRS audit.

Check for:
1. Total income on W-2 plus all 1099s should be internally consistent
2. K-1 income should be accounted for in total income
3. Bank deposit totals that significantly exceed reported income
4. Multiple 1099s from the same payer that might indicate splitting
5. Schedule C income that is inconsistent with business receipts or invoices
6. Missing withholding on significant income sources

Risk thresholds:
- Discrepancy over 10 percent of total income: HIGH risk
- Discrepancy between 5 and 10 percent: MEDIUM risk
- Discrepancy under 5 percent: LOW risk
- Unexplained bank deposits over 20 percent of reported income: HIGH risk

Return this exact JSON structure:
{
  "income_validation": {
    "total_reported_income": 0,
    "total_from_documents": 0,
    "discrepancy_amount": 0,
    "discrepancy_percentage": 0,
    "validation_status": "consistent or flagged"
  },
  "income_sources": [
    {
      "source": "",
      "document_type": "",
      "amount": 0,
      "status": "verified or flagged",
      "flag_reason": ""
    }
  ],
  "cross_check_flags": [
    {
      "flag": "",
      "severity": "high, medium, or low",
      "explanation": "",
      "recommendation": ""
    }
  ],
  "income_risk_score": 0
}"""
    return call_agent(system_prompt, json.dumps(extracted_financials, indent=2))


def agent_4_deduction_scorer(extracted_financials: dict) -> dict:
    system_prompt = """You are a senior IRS audit risk specialist at a Big 4 accounting firm.

Your task is to evaluate all deductions and expenses claimed and score each one based on known IRS audit trigger thresholds.

Apply these IRS audit risk thresholds:
1. Home office deduction over 15 percent of gross income: HIGH risk
2. Vehicle business use claimed over 80 percent: HIGH risk
3. Meals and entertainment over 2 percent of gross income: MEDIUM risk
4. Charitable donations over 5 percent of adjusted gross income: MEDIUM risk
5. Schedule C losses for 3 or more consecutive years: HIGH risk
6. Business travel expenses that appear excessive relative to income: MEDIUM risk
7. Large miscellaneous deductions with no supporting documentation evident: HIGH risk
8. Home office claimed by W-2 employee post 2018 tax law: HIGH risk
9. Alimony deductions on post 2018 agreements: HIGH risk
10. Rental losses over 25000 dollars without active participation evidence: MEDIUM risk
11. Net operating loss carryforwards without clear documentation: MEDIUM risk
12. Casualty or theft losses without clear documentation: HIGH risk

Return this exact JSON structure:
{
  "deductions_analyzed": [
    {
      "deduction_type": "",
      "amount_claimed": 0,
      "risk_level": "high, medium, or low",
      "irs_threshold": "",
      "flag_reason": "",
      "recommendation": ""
    }
  ],
  "high_risk_count": 0,
  "medium_risk_count": 0,
  "low_risk_count": 0,
  "deduction_risk_score": 0,
  "top_deduction_risks": [
    {
      "deduction": "",
      "risk_level": "",
      "one_line_summary": ""
    }
  ]
}"""
    return call_agent(system_prompt, json.dumps(extracted_financials, indent=2))


def agent_5_missing_detector(document_manifest: dict, extracted_financials: dict) -> dict:
    system_prompt = """You are a senior tax completeness specialist at a Big 4 accounting firm.

Your task is to identify tax forms and documents that should be present based on what was found but are missing from the client submission.

Apply these tax filing rules:
1. If K-1 is present then Schedule E should also be present
2. If 1099-B is present then Form 8949 and Schedule D should be present
3. If Schedule C is present then Schedule SE should be present
4. If home office deduction is claimed then Form 8829 should be present
5. If vehicle deduction is claimed then Form 4562 should be present
6. If significant interest income then Schedule B should be present
7. If significant dividend income then Schedule B should be present
8. If foreign accounts or assets then FinCEN 114 may be required
9. If business income over 157500 dollars then Form 8995 may apply
10. If charitable donations are claimed then receipts or Form 8283 for over 500 dollars
11. If retirement contributions then Form 5498 should be present
12. If estimated tax payments were made then Form 1040-ES records should be present

Return this exact JSON structure:
{
  "missing_documents": [
    {
      "form_name": "",
      "reason_required": "",
      "triggered_by": "",
      "risk_of_absence": "high, medium, or low",
      "consequence": ""
    }
  ],
  "missing_count": 0,
  "critical_missing": [],
  "completeness_score": 0
}"""
    combined_input = f"DOCUMENT MANIFEST:\n{json.dumps(document_manifest, indent=2)}\n\nEXTRACTED FINANCIALS:\n{json.dumps(extracted_financials, indent=2)}"
    return call_agent(system_prompt, combined_input)


def agent_6_synthesizer(
    document_manifest: dict,
    extracted_financials: dict,
    income_validation: dict,
    deduction_analysis: dict,
    missing_documents: dict
) -> dict:
    system_prompt = """You are a senior tax manager at a Big 4 accounting firm writing a formal tax readiness memo.

You have received the complete analysis from four specialist agents. Your task is to synthesize everything into a final professional report.

Calculate the composite audit risk score 0 to 100 using this weighted formula:
- Income risk score: 35 percent weight
- Deduction risk score: 35 percent weight
- Missing documents penalty: 30 percent weight where each critical missing document adds 10 points and each medium adds 5 points

Determine overall risk level:
- Score 0 to 30: LOW
- Score 31 to 60: MEDIUM
- Score 61 to 100: HIGH

Write the executive summary in 3 to 4 sentences covering the biggest concerns found.

Write the CPA memo in formal professional language that a senior manager at KPMG would send to a client. Include:
- Overview of documents reviewed
- Key income findings
- Deduction risk summary
- Missing document requirements
- Recommended actions before filing

Return this exact JSON structure:
{
  "audit_risk_score": 0,
  "risk_level": "low, medium, or high",
  "executive_summary": "",
  "risk_distribution": {
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "income_sources": [],
  "top_risks": [
    {
      "title": "",
      "risk_level": "",
      "explanation": ""
    }
  ],
  "deductions": [],
  "missing_documents": [],
  "cpa_memo": ""
}"""

    combined_input = f"DOCUMENT MANIFEST:\n{json.dumps(document_manifest, indent=2)}\n\nEXTRACTED FINANCIALS:\n{json.dumps(extracted_financials, indent=2)}\n\nINCOME VALIDATION:\n{json.dumps(income_validation, indent=2)}\n\nDEDUCTION ANALYSIS:\n{json.dumps(deduction_analysis, indent=2)}\n\nMISSING DOCUMENTS:\n{json.dumps(missing_documents, indent=2)}"
    return call_agent(system_prompt, combined_input)


def run_analysis(extracted_text: str) -> dict:
    try:
        print("Agent 1: Classifying documents...")
        document_manifest = agent_1_classifier(extracted_text)
        if "error" in document_manifest:
            raise Exception(f"Agent 1 failed: {document_manifest['error']}")

        print("Agent 2: Extracting financial data...")
        extracted_financials = agent_2_extractor(extracted_text, document_manifest)
        if "error" in extracted_financials:
            raise Exception(f"Agent 2 failed: {extracted_financials['error']}")

        print("Agents 3, 4, 5: Running parallel analysis...")
        income_validation = agent_3_income_validator(extracted_financials)
        deduction_analysis = agent_4_deduction_scorer(extracted_financials)
        missing_documents = agent_5_missing_detector(document_manifest, extracted_financials)

        print("Agent 6: Synthesizing final report...")
        final_report = agent_6_synthesizer(
            document_manifest,
            extracted_financials,
            income_validation,
            deduction_analysis,
            missing_documents
        )
        if "error" in final_report:
            raise Exception(f"Agent 6 failed: {final_report['error']}")

        return final_report

    except Exception as e:
        print(f"Pipeline error: {str(e)}")
        return {
            "executive_summary": f"Analysis encountered an error: {str(e)}",
            "audit_risk_score": 0,
            "risk_level": "unknown",
            "risk_distribution": {"high": 0, "medium": 0, "low": 0},
            "income_sources": [],
            "top_risks": [],
            "deductions": [],
            "missing_documents": [],
            "cpa_memo": "Report generation failed. Please try again."
        }
