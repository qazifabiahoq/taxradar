# TaxRadar

AI-powered multi-agent tax readiness platform for CPAs and accounting professionals.

Live Demo: [your-demo-url-here]

## The Problem

Tax readiness review is one of the most tedious and error-prone tasks in public accounting. Before a CPA can file a return, someone has to collect every document, cross-check income across W-2s and 1099s, score each deduction against IRS audit thresholds, identify what is missing, and write a memo explaining the risk picture to the client. On a complex individual return with self-employment income, investments, and rental properties, that process can take two to four hours of billable time.

The problem is not that CPAs lack the knowledge to do it. The problem is that the first pass is mechanical work. Every deduction gets checked against the same IRS thresholds every time. Every income discrepancy gets flagged the same way every time. Every missing form triggers the same consequence every time. That mechanical work does not require judgment. It requires consistency and speed, and humans are neither as fast nor as consistent at it as software.

TaxRadar automates the entire first-pass tax readiness review. The CPA uploads the client documents, and within two minutes receives a structured report with an audit risk score, a complete income cross-check, a deduction risk breakdown, a list of missing required documents, and a full CPA memo written in professional language ready to review and edit.

## What TaxRadar Does

TaxRadar takes a collection of client tax documents in PDF or Excel format and runs them through a two-layer analysis system. The first layer is a deterministic rule engine that checks every extracted number against known IRS audit thresholds immediately, without any AI inference. The second layer is a six-agent AI pipeline built on Google Gemini 2.5 Flash that classifies documents, extracts financial data, validates income, scores deductions, detects missing forms, and synthesizes everything into a final report.

The output is a structured report with an audit risk score from 0 to 100, a risk distribution showing how many high, medium, and low risk issues were found, an income cross-check table showing every income source and whether it reconciles across documents, a deduction analysis with expandable detail and IRS threshold explanations, a missing documents section organized by impact level, and a generated CPA memo in plain formal text that can be edited and sent directly to the client.

The report can be exported as a PDF through the browser print function or as an Excel workbook with five separate sheets covering summary, income sources, deductions, missing documents, and top risks.

## How Document Processing Works

### PDF Files

PDF files are processed using pypdf. The library reads each page and extracts the raw text layer. All pages are concatenated in order and passed downstream. For scanned PDFs without a text layer, the extraction returns an empty or minimal string, which the AI pipeline handles by noting the limitation. Text-layer PDFs, which covers the vast majority of digitally generated tax forms, extract cleanly.

### Excel Files

Excel extraction is more involved because the format has several ways data can be stored that all look the same on screen but behave differently when read programmatically.

The extraction uses openpyxl and reads every worksheet in the workbook, not just the first tab. A workbook with six sheets covering a W-2, a 1099-NEC, a Schedule C, a 1099-B brokerage summary, a bank statement, and an audit risk summary will have all six sheets extracted and concatenated.

For each sheet, every row is processed cell by cell. None values are skipped entirely rather than included as empty columns, which eliminates the problem of tab-separated output with long stretches of whitespace that confuses language models. Numeric values are formatted with comma separators and two decimal places so that 187500.0 becomes 187,500.00 and the AI recognizes it as a dollar amount rather than a dimensionless float. Date and datetime values are formatted as YYYY-MM-DD. Boolean values are converted to their string representation.

After processing each row, if exactly two non-empty values remain, the row is written as Key: Value on a single line. This is the format most tax spreadsheets use. A row containing Box 1 - Wages Tips Other Compensation in column A and 187,500.00 in column B becomes Box 1 - Wages Tips Other Compensation: 187,500.00. This is immediately readable as a W-2 field by any language model trained on tax documents.

The extraction uses a two-pass strategy to handle formula cells. The first pass uses openpyxl's data_only mode, which reads cached formula results rather than formula strings. This is the preferred mode because it returns the actual computed values. However, if a workbook was created programmatically or has never been opened and saved in Excel, the formula cache may be empty, which causes formula cells to return None. If the first pass returns fewer than ten total cell values across all sheets, the extraction retries without data_only mode, which returns the formula text itself rather than None. This is less ideal than the actual computed value but gives the AI something to work with rather than nothing.

The combined text from all files is assembled with clear file and sheet separators before being passed to the analysis pipeline.

## The Rule Engine

Before any AI inference happens, TaxRadar runs a deterministic rule engine written in pure Python that checks the structured financial data from the extraction step against hardcoded IRS audit thresholds. This layer runs in under a millisecond and produces a set of pre-computed flags that are injected into the context of every subsequent AI agent.

The rule engine currently enforces nine checks.

Home office deduction as a percentage of gross income. If the claimed home office amount exceeds 15 percent of gross income, the engine flags it as medium severity. If it exceeds 40 percent, it escalates to high severity with a note that Form 8829 scrutiny is likely.

Vehicle business use percentage. If a vehicle is claimed at 80 percent or more business use, the engine flags it as medium severity with a note that a detailed mileage log is recommended. If it is claimed at 100 percent, it escalates to high severity and notes that a mileage log is required to substantiate the deduction.

Meals and entertainment against gross income. If the total meals and entertainment claimed exceeds 2 percent of gross income, the engine flags it as medium severity. The IRS scrutinizes this category closely because it is one of the most commonly abused deductions.

Charitable donations against gross income. If total charitable donations exceed 5 percent of income, the engine flags it as medium severity and notes that all amounts over 500 dollars require Form 8283 and supporting receipts.

Schedule C net loss. If the Schedule C shows a net loss for the year, the engine flags it as medium severity with a note that the IRS may invoke hobby loss rules under IRC Section 183 if losses are recurring across multiple years.

Total deductions to gross income ratio. If total deductions exceed 50 percent of gross income, the engine flags medium severity. If they exceed 70 percent, it escalates to high severity with a note that all deductions will need documentation.

Rental losses over 25,000 dollars. If Schedule E rental losses exceed the IRS passive activity threshold of 25,000 dollars, the engine flags it as medium severity and notes that active participation must be documented for the full deduction to be available.

K-1 without Schedule E. If a K-1 is found in the documents but no Schedule E is present, the engine flags it as high severity. Schedule E is required to report K-1 pass-through income on the return.

1099-B without Form 8949. If a 1099-B is found but Form 8949 is absent, the engine flags it as high severity. Form 8949 is required by the IRS to report capital gains and losses from brokerage transactions.

All flags from the rule engine are formatted as readable text and injected into the input context for the income validator, deduction scorer, missing document detector, and report synthesizer agents. This means the AI does not have to re-derive obvious threshold violations from scratch. The violations are already named, labeled by severity, and explained in the prompt. The AI builds on them rather than duplicating the work.

## The Six AI Agents

TaxRadar uses a pipeline of six specialized agents, each built with Google ADK's LlmAgent and Runner pattern and running on Gemini 2.5 Flash. Each agent has a single responsibility, a strict output format, and a custom instruction set that defines exactly what it must and must not do.

Agent 1 is the Document Classifier. It receives the raw extracted text from all uploaded files and identifies every tax document present. For each document it finds, it returns the document type from a fixed list of fourteen categories including W-2, 1099-NEC, 1099-MISC, 1099-B, 1099-INT, 1099-DIV, K-1, Schedule C, Schedule E, Form 8949, bank statement, receipt, invoice, and unknown. It also extracts the tax year, taxpayer name, issuer name, and a confidence level. This agent runs first and sequentially. Everything downstream depends on its classification output.

Agent 2 is the Data Extractor. It receives the document classification alongside the raw text and extracts specific financial fields from each document type. For W-2s it extracts Box 1 wages, federal and state withholding, and employer name. For 1099-NECs it extracts the nonemployee compensation amount and payer. For Schedule C documents it extracts gross receipts, total expenses, net profit or loss, vehicle business use percentage, home office amount, and meals and entertainment. The output is a structured JSON with all extracted amounts, a total gross income figure, and a list of income sources. This agent also runs sequentially because its structured output is what the rule engine operates on.

After the rule engine processes the Data Extractor output, the next three agents run in parallel using asyncio.gather, which cuts the wall-clock time roughly in thirds for this portion of the pipeline.

Agent 3 is the Income Validator. It receives the classification output, the extracted financials, the rule engine flags, and the raw documents. It cross-validates income across all documents, checking whether W-2 wages plus all 1099 income is internally consistent, whether K-1 income is accounted for, whether bank deposit totals significantly exceed reported income, and whether Schedule C receipts reconcile with 1099s from the same clients. Discrepancies over 10 percent of total income are flagged as high risk. Discrepancies between 5 and 10 percent are flagged as medium. Unexplained bank deposits exceeding 20 percent of reported income are flagged as high risk regardless of the percentage threshold.

Agent 4 is the Deduction Scorer. It receives the same parallel input as the income validator plus the rule engine flags with all pre-computed threshold violations already labeled. It evaluates every deduction and expense claimed against twelve IRS audit risk thresholds. These include home office over 15 percent of gross income, vehicle business use over 80 percent, meals and entertainment over 2 percent of gross, charitable donations over 5 percent of adjusted gross income, Schedule C losses for three or more consecutive years, large miscellaneous deductions without supporting documentation, home office claimed by a W-2 employee after the 2018 tax law change, alimony deductions on post-2018 agreements, rental losses over 25,000 dollars without active participation evidence, net operating loss carryforwards without clear documentation, and casualty or theft losses without documentation. Each deduction is scored as high, medium, or low risk with a specific IRS threshold explanation and a remediation recommendation.

Agent 5 is the Missing Document Detector. It also runs in parallel. It checks the document set against twelve tax filing completeness rules. If a K-1 is present, Schedule E should be present. If a 1099-B is present, Form 8949 and Schedule D should be present. If Schedule C is present, Schedule SE should be present. If a home office deduction is claimed, Form 8829 should be present. If a vehicle deduction is claimed, Form 4562 should be present. If significant interest or dividend income appears, Schedule B should be present. If business income exceeds 157,500 dollars, Form 8995 may apply. If charitable donations are claimed, receipts or Form 8283 are required for amounts over 500 dollars. Retirement contributions require Form 5498. Estimated tax payments require 1040-ES records. Each missing document is categorized as critical, important, or minor impact.

Agent 6 is the Report Synthesizer. This is the final sequential step and runs only after all five preceding agents have completed. It receives the full output of every agent along with the rule engine flags. It computes a composite audit risk score from 0 to 100 using a weighted formula: income risk contributes 35 percent, deduction risk contributes 35 percent, and missing documents contribute 30 percent where each critical missing document adds 10 points and each medium-impact missing document adds 5 points. Scores from 0 to 30 are classified as low risk, 31 to 60 as medium, and 61 to 100 as high. The synthesizer then writes the executive summary covering the three to four biggest concerns in plain language, compiles the structured report sections, and generates the full CPA memo in formal professional text with no markdown, no bullet symbols, and no formatting characters. The memo uses plain capitals for section headers and numbered lists for action items, matching the format a senior tax manager would actually send to a client.

Each agent has a per-call timeout of 120 seconds enforced by asyncio.wait_for. If an agent does not respond within that window, the pipeline continues with whatever partial output is available.

## Pipeline Architecture

The six agents run in a specific sequence designed to minimize total time while ensuring each agent has the context it needs.

The Document Classifier runs first and alone. The Data Extractor runs second and alone, receiving the classifier output. Once the Data Extractor returns its structured JSON, the rule engine processes it synchronously in under a millisecond. Then the Income Validator, Deduction Scorer, and Missing Document Detector all fire simultaneously in parallel, each receiving the same combined input containing the classifier output, the extracted financials, the rule engine flags, and the raw documents. The Report Synthesizer fires last, after all three parallel agents have returned, and receives everything.

The parallel step is what makes the two-minute turnaround possible. Instead of waiting for income validation, then deduction scoring, then missing document detection in sequence, those three analyses happen at the same time. The only sequential bottlenecks are the two agents that require prior output as input, and the final synthesizer that requires everything.

## Technical Stack

The frontend is a React 18 single-page application written in TypeScript, built with Vite, and styled with Tailwind CSS 4.0. Routing is handled by Wouter. Risk distribution is visualized with Recharts. Animations use Framer Motion. Excel export is handled client-side using SheetJS, which generates a multi-sheet workbook directly in the browser. The frontend is developed and hosted on Replit.

The backend is Python with FastAPI and served by Uvicorn. It handles multipart file uploads, runs the extraction pipeline, calls the AI agent pipeline, and returns a single JSON response. All AI orchestration runs through Google ADK using the LlmAgent and Runner classes with InMemorySessionService for session isolation per request. Every agent runs on Google Gemini 2.5 Flash via the Vertex AI backend. The backend is deployed on Render.

Document processing uses pypdf for PDF text extraction and openpyxl for Excel parsing. The rule engine is pure Python with no external dependencies.

The OpenAPI specification for the API is maintained in a separate package alongside Zod schema generation via Orval, keeping the type contract between frontend and backend explicit and versioned.

| Layer | Technology |
|---|---|
| Frontend framework | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 4.0 |
| Routing | Wouter |
| Charts | Recharts |
| Animations | Framer Motion |
| Excel export | SheetJS (XLSX) |
| Package manager | pnpm |
| Backend framework | Python, FastAPI, Uvicorn |
| AI orchestration | Google ADK, LlmAgent, Runner |
| AI model | Google Gemini 2.5 Flash |
| PDF extraction | pypdf |
| Excel extraction | openpyxl |
| Rule engine | Pure Python |
| Frontend hosting | Replit |
| Backend hosting | Render |

## The Bigger Picture

Tax preparation firms collectively spend enormous amounts of analyst time on work that is fundamentally mechanical. The same twelve deduction thresholds get checked on every Schedule C return. The same income cross-check gets performed on every client with both W-2 and 1099 income. The same set of missing form triggers gets evaluated every time a K-1 shows up in a document package. None of that work requires judgment. It requires consistency, and it takes time.

The hybrid architecture in TaxRadar reflects a specific view of where AI adds value in this workflow. The rule engine handles the parts that are entirely deterministic. There is no ambiguity about whether home office at 42 percent of gross income exceeds the 15 percent IRS threshold. That check does not benefit from a language model and does not need one. Running it as code means it runs in under a millisecond, produces the same result every time, and never hallucinates.

The AI agents handle the parts that require reading and reasoning over unstructured document text. Determining that a particular dollar figure on page three of a Schedule C corresponds to the home office deduction, and then comparing it against a gross income figure extracted from a W-2 in a separate file, is not a rule. It requires understanding document structure, recognizing accounting field labels, and synthesizing information across multiple sources. That is where the language model earns its role.

The result is a system where the deterministic layer catches what it can instantly and with certainty, and the AI layer handles what requires reasoning, with the flags from the first layer already in context so the second layer can focus on explanation, synthesis, and judgment rather than arithmetic.

A tax readiness review that used to take two to four hours of first-pass analyst work now takes two minutes. That is the whole point.
