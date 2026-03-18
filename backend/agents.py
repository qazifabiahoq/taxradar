import os
import json
import re
import uuid
import asyncio
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from rules import run_rules, format_flags_for_prompt

# Resolve API key — support both variable names
_api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY", "")
if _api_key:
    os.environ["GOOGLE_API_KEY"] = _api_key
    os.environ["GEMINI_API_KEY"] = _api_key

MODEL = 'gemini-2.5-flash'

_agents_cache: dict = {}


def _make_agents() -> dict:
    if _agents_cache:
        return _agents_cache
    _agents_cache['document_classifier'] = LlmAgent(
        name='document_classifier',
        model=MODEL,
        description='Classifies tax documents and identifies document types present in the submission.',
        instruction='You are a senior tax document classification specialist at a Big 4 accounting firm.\n\nAnalyze raw text extracted from tax documents and identify each document present.\n\nFor each document found return:\n- document_type: one of [W-2, 1099-NEC, 1099-MISC, 1099-B, 1099-INT, 1099-DIV, K-1, Schedule-C, Schedule-E, Form-8949, bank-statement, receipt, invoice, unknown]\n- tax_year: the tax year as a string e.g. 2024 or unknown\n- taxpayer_name: name of the taxpayer or entity or unknown\n- issuer_name: name of employer, payer, or financial institution or unknown\n- confidence: high, medium, or low\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "documents": [\n    {\n      "document_type": "",\n      "tax_year": "",\n      "taxpayer_name": "",\n      "issuer_name": "",\n      "confidence": ""\n    }\n  ],\n  "total_documents_found": 0,\n  "tax_years_present": [],\n  "primary_taxpayer": ""\n}',
    )
    _agents_cache['data_extractor'] = LlmAgent(
        name='data_extractor',
        model=MODEL,
        description='Extracts specific financial fields and dollar amounts from each identified tax document.',
        instruction='You are a senior tax data extraction specialist at a Big 4 accounting firm.\n\nExtract specific financial fields from the tax documents in the input.\n\nExtract the following per document type:\n- W-2: wages box 1, federal tax withheld box 2, state tax withheld, employer name\n- 1099-NEC: nonemployee compensation amount, payer name\n- 1099-MISC: miscellaneous income amount, payer name\n- 1099-B: total proceeds, total cost basis, net gain or loss\n- 1099-INT: interest income amount, institution name\n- 1099-DIV: ordinary dividends, qualified dividends, institution name\n- K-1: ordinary business income, self-employment income, partnership or S-corp name\n- Schedule-C: gross receipts, total expenses, net profit or loss, business name, vehicle business use percentage, home office amount, meals and entertainment amount\n- Schedule-E: rental income, rental expenses, net rental income, net rental income or loss\n- bank-statement: total deposits, total withdrawals, account institution\n- receipt: amount, category, vendor name\n- invoice: amount, service description, vendor name\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "extracted_financials": [\n    {\n      "document_type": "",\n      "issuer": "",\n      "fields": {},\n      "amounts": {}\n    }\n  ],\n  "total_gross_income": 0,\n  "total_tax_withheld": 0,\n  "income_sources": [\n    {\n      "source": "",\n      "type": "",\n      "amount": 0\n    }\n  ],\n  "total_deductions_claimed": 0\n}',
    )
    _agents_cache['income_validator'] = LlmAgent(
        name='income_validator',
        model=MODEL,
        description='Cross-validates income across all tax documents and flags discrepancies that could trigger an IRS audit.',
        instruction='You are a senior tax compliance specialist at a Big 4 accounting firm.\n\nCross-validate income reported across all tax documents and identify discrepancies.\n\nCheck for:\n1. Total income on W-2 plus all 1099s should be internally consistent\n2. K-1 income should be accounted for in total income\n3. Bank deposit totals that significantly exceed reported income\n4. Multiple 1099s from the same payer that might indicate splitting\n5. Schedule C income that is inconsistent with business receipts or invoices\n6. Missing withholding on significant income sources\n\nAlso review the RULE ENGINE PRE-CHECK flags in the input and incorporate them into your analysis.\n\nRisk thresholds:\n- Discrepancy over 10 percent of total income: HIGH risk\n- Discrepancy between 5 and 10 percent: MEDIUM risk\n- Discrepancy under 5 percent: LOW risk\n- Unexplained bank deposits over 20 percent of reported income: HIGH risk\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "income_validation": {\n    "total_reported_income": 0,\n    "total_from_documents": 0,\n    "discrepancy_amount": 0,\n    "discrepancy_percentage": 0,\n    "validation_status": "consistent or flagged"\n  },\n  "income_sources": [\n    {\n      "source": "",\n      "document_type": "",\n      "amount": 0,\n      "status": "verified or flagged",\n      "flag_reason": ""\n    }\n  ],\n  "cross_check_flags": [\n    {\n      "flag": "",\n      "severity": "high, medium, or low",\n      "explanation": "",\n      "recommendation": ""\n    }\n  ],\n  "income_risk_score": 0\n}',
    )
    _agents_cache['deduction_scorer'] = LlmAgent(
        name='deduction_scorer',
        model=MODEL,
        description='Evaluates all deductions against IRS audit trigger thresholds and assigns risk scores.',
        instruction='You are a senior IRS audit risk specialist at a Big 4 accounting firm.\n\nEvaluate all deductions and expenses claimed against known IRS audit trigger thresholds.\n\nAlso review the RULE ENGINE PRE-CHECK flags in the input — these are deterministic threshold violations you must incorporate.\n\nApply these IRS audit risk thresholds:\n1. Home office deduction over 15 percent of gross income: HIGH risk\n2. Vehicle business use claimed over 80 percent: HIGH risk\n3. Meals and entertainment over 2 percent of gross income: MEDIUM risk\n4. Charitable donations over 5 percent of adjusted gross income: MEDIUM risk\n5. Schedule C losses for 3 or more consecutive years: HIGH risk\n6. Business travel expenses that appear excessive relative to income: MEDIUM risk\n7. Large miscellaneous deductions with no supporting documentation evident: HIGH risk\n8. Home office claimed by W-2 employee post 2018 tax law: HIGH risk\n9. Alimony deductions on post 2018 agreements: HIGH risk\n10. Rental losses over 25000 dollars without active participation evidence: MEDIUM risk\n11. Net operating loss carryforwards without clear documentation: MEDIUM risk\n12. Casualty or theft losses without clear documentation: HIGH risk\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "deductions_analyzed": [\n    {\n      "deduction_type": "",\n      "amount_claimed": 0,\n      "risk_level": "high, medium, or low",\n      "irs_threshold": "",\n      "flag_reason": "",\n      "recommendation": ""\n    }\n  ],\n  "high_risk_count": 0,\n  "medium_risk_count": 0,\n  "low_risk_count": 0,\n  "deduction_risk_score": 0,\n  "top_deduction_risks": [\n    {\n      "deduction": "",\n      "risk_level": "",\n      "one_line_summary": ""\n    }\n  ]\n}',
    )
    _agents_cache['missing_document_detector'] = LlmAgent(
        name='missing_document_detector',
        model=MODEL,
        description='Identifies required tax forms that are missing from the client submission based on what was found.',
        instruction='You are a senior tax completeness specialist at a Big 4 accounting firm.\n\nIdentify tax forms and documents that should be present but are missing from the client submission.\n\nAlso review the RULE ENGINE PRE-CHECK flags in the input for missing document violations.\n\nApply these tax filing rules:\n1. If K-1 is present then Schedule E should also be present\n2. If 1099-B is present then Form 8949 and Schedule D should be present\n3. If Schedule C is present then Schedule SE should be present\n4. If home office deduction is claimed then Form 8829 should be present\n5. If vehicle deduction is claimed then Form 4562 should be present\n6. If significant interest income then Schedule B should be present\n7. If significant dividend income then Schedule B should be present\n8. If foreign accounts or assets then FinCEN 114 may be required\n9. If business income over 157500 dollars then Form 8995 may apply\n10. If charitable donations are claimed then receipts or Form 8283 for over 500 dollars\n11. If retirement contributions then Form 5498 should be present\n12. If estimated tax payments were made then Form 1040-ES records should be present\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  "missing_documents": [\n    {\n      "form_name": "",\n      "reason_required": "",\n      "triggered_by": "",\n      "risk_of_absence": "high, medium, or low",\n      "consequence": ""\n    }\n  ],\n  "missing_count": 0,\n  "critical_missing": [],\n  "completeness_score": 0\n}',
    )
    _agents_cache['report_synthesizer'] = LlmAgent(
        name='report_synthesizer',
        model=MODEL,
        description='Synthesizes all agent outputs into a final CPA-ready tax readiness report with audit risk score and professional memo.',
        instruction='''You are a senior tax manager at a Big 4 accounting firm writing a formal tax readiness memo.

You will receive the complete analysis from all specialist agents including deterministic rule engine flags. Synthesize everything into a final professional report.

Calculate the composite audit risk score 0 to 100 using this weighted formula:
- Income risk score: 35 percent weight
- Deduction risk score: 35 percent weight
- Missing documents penalty: 30 percent weight where each critical missing document adds 10 points and each medium adds 5 points

Determine overall risk level:
- Score 0 to 30: LOW
- Score 31 to 60: MEDIUM
- Score 61 to 100: HIGH

Write the executive summary in 3 to 4 sentences covering the biggest concerns found.

Write the CPA memo in formal professional language that a senior tax manager would send to a client. Use plain text only — no markdown, no asterisks, no bold formatting, no bullet symbols like * or **. Use numbered lists (1. 2. 3.) and section headers in plain capitals. Include:
- Overview of documents reviewed
- Key income findings
- Deduction risk summary
- Missing document requirements
- Recommended actions before filing

CRITICAL: Use EXACTLY these field names in the output JSON — the frontend depends on them:
- income_sources items must have: source, amount, status (exactly "consistent" or "flagged"), notes
- top_risks items must have: category, risk_level (exactly "high", "medium", or "low"), description
- deductions items must have: category, amount, risk_level (exactly "high", "medium", or "low"), notes, recommendation
- missing_documents items must have: document, reason, impact (exactly "critical", "important", or "minor")

Output ONLY a valid JSON object with no explanation, no markdown, no backticks:
{
  "audit_risk_score": 0,
  "risk_level": "low, medium, or high",
  "executive_summary": "",
  "risk_distribution": {
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "income_sources": [
    {
      "source": "",
      "amount": 0,
      "status": "consistent or flagged",
      "notes": ""
    }
  ],
  "top_risks": [
    {
      "category": "",
      "risk_level": "high, medium, or low",
      "description": ""
    }
  ],
  "deductions": [
    {
      "category": "",
      "amount": 0,
      "risk_level": "high, medium, or low",
      "notes": "",
      "recommendation": ""
    }
  ],
  "missing_documents": [
    {
      "document": "",
      "reason": "",
      "impact": "critical, important, or minor"
    }
  ],
  "cpa_memo": ""
}''',
    )
    return _agents_cache


async def run_agent(agent: LlmAgent, text: str, timeout: float = 120.0) -> str:
    session_service = InMemorySessionService()
    session_id = str(uuid.uuid4())
    await session_service.create_session(
        app_name='taxradar',
        user_id='cpa_user',
        session_id=session_id,
    )
    runner = Runner(agent=agent, app_name='taxradar', session_service=session_service)
    message = Content(parts=[Part(text=text)])
    result = ''

    async def _collect() -> None:
        nonlocal result
        async for event in runner.run_async(
            user_id='cpa_user',
            session_id=session_id,
            new_message=message,
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    result = ''.join(
                        p.text for p in event.content.parts
                        if hasattr(p, 'text') and p.text
                    )
                break

    try:
        await asyncio.wait_for(_collect(), timeout=timeout)
    except asyncio.TimeoutError:
        print(f'Agent {agent.name} timed out after {timeout}s')

    return result


def extract_json(text: str):
    if not text:
        return None
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass
    match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\})\s*```', text)
    if match:
        try:
            return json.loads(match.group(1))
        except (json.JSONDecodeError, TypeError):
            pass
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group(0))
        except (json.JSONDecodeError, TypeError):
            pass
    return None


async def run_analysis(extracted_text: str) -> dict:
    try:
        agents = _make_agents()

        # Step 1 — Document Classifier
        classifier_raw = await run_agent(agents['document_classifier'], extracted_text)

        # Step 2 — Data Extractor
        extractor_input = f"DOCUMENT CLASSIFICATION:\n{classifier_raw}\n\nRAW DOCUMENTS:\n{extracted_text}"
        extractor_raw = await run_agent(agents['data_extractor'], extractor_input)

        # Rule engine — deterministic checks on structured extracted data (~1ms)
        extractor_data = extract_json(extractor_raw) or {}
        rule_flags = run_rules(extractor_data)
        rule_flags_text = format_flags_for_prompt(rule_flags)

        # Steps 3+4+5 — run in parallel, with rule flags injected as context
        parallel_input = (
            f"DOCUMENT CLASSIFICATION:\n{classifier_raw}\n\n"
            f"EXTRACTED FINANCIALS:\n{extractor_raw}\n\n"
            f"{rule_flags_text}\n\n"
            f"RAW DOCUMENTS:\n{extracted_text}"
        )
        validator_raw, deduction_raw, missing_raw = await asyncio.gather(
            run_agent(agents['income_validator'], parallel_input),
            run_agent(agents['deduction_scorer'], parallel_input),
            run_agent(agents['missing_document_detector'], parallel_input),
        )

        # Step 6 — Report Synthesizer
        synthesizer_input = (
            f"DOCUMENT CLASSIFICATION:\n{classifier_raw}\n\n"
            f"EXTRACTED FINANCIALS:\n{extractor_raw}\n\n"
            f"{rule_flags_text}\n\n"
            f"INCOME VALIDATION:\n{validator_raw}\n\n"
            f"DEDUCTION ANALYSIS:\n{deduction_raw}\n\n"
            f"MISSING DOCUMENTS:\n{missing_raw}"
        )
        final_raw = await run_agent(agents['report_synthesizer'], synthesizer_input)

        if not final_raw:
            raise ValueError('No response from report synthesizer')

        result = extract_json(final_raw)
        if result is None:
            raise ValueError(f'Failed to parse report JSON. Raw output: {final_raw[:500]}')

        return result

    except Exception as e:
        print(f'Pipeline error: {str(e)}')
        return {
            'error': True,
            'executive_summary': f'Analysis encountered an error: {str(e)}',
            'audit_risk_score': 0,
            'risk_level': 'unknown',
            'risk_distribution': {'high': 0, 'medium': 0, 'low': 0},
            'income_sources': [],
            'top_risks': [],
            'deductions': [],
            'missing_documents': [],
            'cpa_memo': 'Report generation failed. Please try again.',
        }
