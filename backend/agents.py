import os
import json
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

document_classifier = LlmAgent(
  name='document_classifier',
  model='gemini-2.5-flash',
  description=(
      'Classifies tax documents and identifies document types present in the submission.'
  ),
  sub_agents=[],
  instruction='You are a senior tax document classification specialist at a Big 4 accounting firm.\n\nAnalyze raw text extracted from tax documents and identify each document present.\n\nFor each document found return:\n- document_type: one of [W-2, 1099-NEC, 1099-MISC, 1099-B, 1099-INT, 1099-DIV, K-1, Schedule-C, Schedule-E, Form-8949, bank-statement, receipt, invoice, unknown]\n- tax_year: the tax year as a string e.g. 2024 or unknown\n- taxpayer_name: name of the taxpayer or entity or unknown\n- issuer_name: name of employer, payer, or financial institution or unknown\n- confidence: high, medium, or low\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  \"documents\": [\n    {\n      \"document_type\": \"\",\n      \"tax_year\": \"\",\n      \"taxpayer_name\": \"\",\n      \"issuer_name\": \"\",\n      \"confidence\": \"\"\n    }\n  ],\n  \"total_documents_found\": 0,\n  \"tax_years_present\": [],\n  \"primary_taxpayer\": \"\"\n}',
  tools=[],
)
data_extractor = LlmAgent(
  name='data_extractor',
  model='gemini-2.5-flash',
  description=(
      'Extracts specific financial fields and dollar amounts from each identified tax document.'
  ),
  sub_agents=[],
  instruction='You are a senior tax data extraction specialist at a Big 4 accounting firm.\n\nExtract specific financial fields from the tax documents in the input.\n\nExtract the following per document type:\n- W-2: wages box 1, federal tax withheld box 2, state tax withheld, employer name\n- 1099-NEC: nonemployee compensation amount, payer name\n- 1099-MISC: miscellaneous income amount, payer name\n- 1099-B: total proceeds, total cost basis, net gain or loss\n- 1099-INT: interest income amount, institution name\n- 1099-DIV: ordinary dividends, qualified dividends, institution name\n- K-1: ordinary business income, self-employment income, partnership or S-corp name\n- Schedule-C: gross receipts, total expenses, net profit or loss, business name\n- Schedule-E: rental income, rental expenses, net rental income\n- bank-statement: total deposits, total withdrawals, account institution\n- receipt: amount, category, vendor name\n- invoice: amount, service description, vendor name\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  \"extracted_financials\": [\n    {\n      \"document_type\": \"\",\n      \"issuer\": \"\",\n      \"fields\": {},\n      \"amounts\": {}\n    }\n  ],\n  \"total_gross_income\": 0,\n  \"total_tax_withheld\": 0,\n  \"income_sources\": [\n    {\n      \"source\": \"\",\n      \"type\": \"\",\n      \"amount\": 0\n    }\n  ],\n  \"total_deductions_claimed\": 0\n}',
  tools=[],
)
income_validator = LlmAgent(
  name='income_validator',
  model='gemini-2.5-flash',
  description=(
      'Cross-validates income across all tax documents and flags discrepancies that could trigger an IRS audit.'
  ),
  sub_agents=[],
  instruction='You are a senior tax compliance specialist at a Big 4 accounting firm.\n\nCross-validate income reported across all tax documents and identify discrepancies.\n\nCheck for:\n1. Total income on W-2 plus all 1099s should be internally consistent\n2. K-1 income should be accounted for in total income\n3. Bank deposit totals that significantly exceed reported income\n4. Multiple 1099s from the same payer that might indicate splitting\n5. Schedule C income that is inconsistent with business receipts or invoices\n6. Missing withholding on significant income sources\n\nRisk thresholds:\n- Discrepancy over 10 percent of total income: HIGH risk\n- Discrepancy between 5 and 10 percent: MEDIUM risk\n- Discrepancy under 5 percent: LOW risk\n- Unexplained bank deposits over 20 percent of reported income: HIGH risk\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  \"income_validation\": {\n    \"total_reported_income\": 0,\n    \"total_from_documents\": 0,\n    \"discrepancy_amount\": 0,\n    \"discrepancy_percentage\": 0,\n    \"validation_status\": \"consistent or flagged\"\n  },\n  \"income_sources\": [\n    {\n      \"source\": \"\",\n      \"document_type\": \"\",\n      \"amount\": 0,\n      \"status\": \"verified or flagged\",\n      \"flag_reason\": \"\"\n    }\n  ],\n  \"cross_check_flags\": [\n    {\n      \"flag\": \"\",\n      \"severity\": \"high, medium, or low\",\n      \"explanation\": \"\",\n      \"recommendation\": \"\"\n    }\n  ],\n  \"income_risk_score\": 0\n}',
  tools=[],
)
deduction_scorer = LlmAgent(
  name='deduction_scorer',
  model='gemini-2.5-flash',
  description=(
      'Evaluates all deductions against IRS audit trigger thresholds and assigns risk scores.'
  ),
  sub_agents=[],
  instruction='You are a senior IRS audit risk specialist at a Big 4 accounting firm.\n\nEvaluate all deductions and expenses claimed against known IRS audit trigger thresholds.\n\nApply these IRS audit risk thresholds:\n1. Home office deduction over 15 percent of gross income: HIGH risk\n2. Vehicle business use claimed over 80 percent: HIGH risk\n3. Meals and entertainment over 2 percent of gross income: MEDIUM risk\n4. Charitable donations over 5 percent of adjusted gross income: MEDIUM risk\n5. Schedule C losses for 3 or more consecutive years: HIGH risk\n6. Business travel expenses that appear excessive relative to income: MEDIUM risk\n7. Large miscellaneous deductions with no supporting documentation evident: HIGH risk\n8. Home office claimed by W-2 employee post 2018 tax law: HIGH risk\n9. Alimony deductions on post 2018 agreements: HIGH risk\n10. Rental losses over 25000 dollars without active participation evidence: MEDIUM risk\n11. Net operating loss carryforwards without clear documentation: MEDIUM risk\n12. Casualty or theft losses without clear documentation: HIGH risk\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  \"deductions_analyzed\": [\n    {\n      \"deduction_type\": \"\",\n      \"amount_claimed\": 0,\n      \"risk_level\": \"high, medium, or low\",\n      \"irs_threshold\": \"\",\n      \"flag_reason\": \"\",\n      \"recommendation\": \"\"\n    }\n  ],\n  \"high_risk_count\": 0,\n  \"medium_risk_count\": 0,\n  \"low_risk_count\": 0,\n  \"deduction_risk_score\": 0,\n  \"top_deduction_risks\": [\n    {\n      \"deduction\": \"\",\n      \"risk_level\": \"\",\n      \"one_line_summary\": \"\"\n    }\n  ]\n}',
  tools=[],
)
missing_document_detector = LlmAgent(
  name='missing_document_detector',
  model='gemini-2.5-flash',
  description=(
      'Identifies required tax forms that are missing from the client submission based on what was found.'
  ),
  sub_agents=[],
  instruction='You are a senior tax completeness specialist at a Big 4 accounting firm.\n\nIdentify tax forms and documents that should be present but are missing from the client submission.\n\nApply these tax filing rules:\n1. If K-1 is present then Schedule E should also be present\n2. If 1099-B is present then Form 8949 and Schedule D should be present\n3. If Schedule C is present then Schedule SE should be present\n4. If home office deduction is claimed then Form 8829 should be present\n5. If vehicle deduction is claimed then Form 4562 should be present\n6. If significant interest income then Schedule B should be present\n7. If significant dividend income then Schedule B should be present\n8. If foreign accounts or assets then FinCEN 114 may be required\n9. If business income over 157500 dollars then Form 8995 may apply\n10. If charitable donations are claimed then receipts or Form 8283 for over 500 dollars\n11. If retirement contributions then Form 5498 should be present\n12. If estimated tax payments were made then Form 1040-ES records should be present\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  \"missing_documents\": [\n    {\n      \"form_name\": \"\",\n      \"reason_required\": \"\",\n      \"triggered_by\": \"\",\n      \"risk_of_absence\": \"high, medium, or low\",\n      \"consequence\": \"\"\n    }\n  ],\n  \"missing_count\": 0,\n  \"critical_missing\": [],\n  \"completeness_score\": 0\n}',
  tools=[],
)
report_synthesizer = LlmAgent(
  name='report_synthesizer',
  model='gemini-2.5-flash',
  description=(
      'Synthesizes all agent outputs into a final CPA-ready tax readiness report with audit risk score and professional memo.'
  ),
  sub_agents=[],
  instruction='You are a senior tax manager at a Big 4 accounting firm writing a formal tax readiness memo.\n\nYou will receive the complete analysis from all specialist agents. Synthesize everything into a final professional report.\n\nCalculate the composite audit risk score 0 to 100 using this weighted formula:\n- Income risk score: 35 percent weight\n- Deduction risk score: 35 percent weight\n- Missing documents penalty: 30 percent weight where each critical missing document adds 10 points and each medium adds 5 points\n\nDetermine overall risk level:\n- Score 0 to 30: LOW\n- Score 31 to 60: MEDIUM\n- Score 61 to 100: HIGH\n\nWrite the executive summary in 3 to 4 sentences covering the biggest concerns found.\n\nWrite the CPA memo in formal professional language that a senior manager at KPMG would send to a client. Include:\n- Overview of documents reviewed\n- Key income findings\n- Deduction risk summary\n- Missing document requirements\n- Recommended actions before filing\n\nOutput ONLY a valid JSON object with no explanation, no markdown, no backticks:\n{\n  \"audit_risk_score\": 0,\n  \"risk_level\": \"low, medium, or high\",\n  \"executive_summary\": \"\",\n  \"risk_distribution\": {\n    \"high\": 0,\n    \"medium\": 0,\n    \"low\": 0\n  },\n  \"income_sources\": [],\n  \"top_risks\": [\n    {\n      \"title\": \"\",\n      \"risk_level\": \"\",\n      \"explanation\": \"\"\n    }\n  ],\n  \"deductions\": [],\n  \"missing_documents\": [],\n  \"cpa_memo\": \"\"\n}',
  tools=[],
)
root_agent = LlmAgent(
  name='TaxRadar_Orchestrator',
  model='gemini-2.5-flash',
  description=(
      'Coordinates all TaxRadar sub-agents to analyze tax documents and deliver a structured audit risk report with CPA memo.'
  ),
  sub_agents=[document_classifier, data_extractor, income_validator, deduction_scorer, missing_document_detector, report_synthesizer],
  instruction='You are TaxRadar, an intelligent tax document analysis orchestrator for CPA firms and tax professionals.\n\nYou receive raw text extracted from client tax documents and coordinate six specialized sub-agents to analyze it.\n\nFollow this exact sequence:\n\n1. Call Document Classifier first — it identifies what documents are present and classifies each one by type, tax year, and taxpayer.\n\n2. Call Data Extractor next — it extracts specific financial fields and dollar amounts from each document type identified.\n\n3. Call Income Validator next — it cross-checks income across all documents and flags discrepancies that could trigger an IRS audit.\n\n4. Call Deduction Scorer next — it evaluates every deduction against IRS audit trigger thresholds and assigns risk levels.\n\n5. Call Missing Document Detector next — it identifies required forms that are absent from the submission based on what was found.\n\n6. Call Report Synthesizer last — it takes all outputs and produces the final audit risk score and CPA memo.\n\nAlways return the final JSON report from Report Synthesizer as your output.\nNever skip any agent in the sequence.\nNever return partial results.',
  tools=[],
)


def run_analysis(extracted_text: str) -> dict:
    try:
        session_service = InMemorySessionService()
        session_service.create_session(
            app_name='taxradar',
            user_id='cpa_user',
            session_id='analysis_session',
        )
        runner = Runner(
            agent=root_agent,
            app_name='taxradar',
            session_service=session_service,
        )
        message = types.Content(
            role='user',
            parts=[types.Part(text=extracted_text)],
        )
        final_response = None
        for event in runner.run(
            user_id='cpa_user',
            session_id='analysis_session',
            new_message=message,
        ):
            if event.is_final_response():
                final_response = event.content.parts[0].text
                break
        if not final_response:
            raise Exception('No response from agent pipeline')
        text = final_response.strip()
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f'Pipeline error: {str(e)}')
        return {
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
