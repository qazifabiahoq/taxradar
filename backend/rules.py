"""
Deterministic IRS rule engine.

Runs fast (~1ms) threshold checks on structured data from the data_extractor agent.
Produces pre-computed flags that are injected into the LLM agents as context,
so they don't have to re-discover obvious violations from scratch.

Structured layer  →  Rules (this file)
Unstructured layer →  LLM agents (agents.py)
"""
from typing import Any


def _safe_float(val: Any, default: float = 0.0) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def _find(d: dict, keys: list[str]) -> Any:
    """Case-insensitive dict lookup for any of the given key variants."""
    lower_d = {k.lower(): v for k, v in d.items()}
    for key in keys:
        result = lower_d.get(key.lower())
        if result is not None:
            return result
    return None


def run_rules(extractor_output: dict) -> list[dict]:
    """
    Runs deterministic IRS threshold checks on structured extracted data.

    Args:
        extractor_output: JSON dict from the data_extractor agent.

    Returns:
        List of flag dicts: [{"rule": str, "severity": "high|medium|low", "detail": str}]
    """
    flags: list[dict] = []

    total_gross = _safe_float(extractor_output.get("total_gross_income"))
    total_deductions = _safe_float(extractor_output.get("total_deductions_claimed"))
    extracted = extractor_output.get("extracted_financials") or []

    # Accumulate summary numbers across all documents
    home_office_amount = 0.0
    meals_amount = 0.0
    vehicle_pct_found: float | None = None
    schedule_c_net: float | None = None
    rental_losses = 0.0
    charitable_amount = 0.0
    has_k1 = False
    has_1099b = False
    has_schedule_c = False
    has_schedule_e = False
    has_form8949 = False

    for item in extracted:
        doc_type = (item.get("document_type") or "").lower()
        fields = {k.lower(): v for k, v in (item.get("fields") or {}).items()}
        amounts = {k.lower(): v for k, v in (item.get("amounts") or {}).items()}
        combined = {**fields, **amounts}

        # Track document types present
        if "k-1" in doc_type or "k1" in doc_type:
            has_k1 = True
        if "1099-b" in doc_type:
            has_1099b = True
        if "schedule-c" in doc_type or "schedule c" in doc_type:
            has_schedule_c = True
            net = _find(combined, [
                "net profit or loss", "net profit", "net loss",
                "net_profit_loss", "net_profit", "net_loss",
            ])
            if net is not None:
                schedule_c_net = _safe_float(net)
        if "schedule-e" in doc_type or "schedule e" in doc_type:
            has_schedule_e = True
        if "form-8949" in doc_type or "8949" in doc_type or "form 8949" in doc_type:
            has_form8949 = True

        # Home office
        ho = _find(combined, [
            "home office", "home_office", "form 8829",
            "office in home", "home office deduction",
        ])
        if ho:
            home_office_amount += _safe_float(ho)

        # Meals & entertainment
        me = _find(combined, [
            "meals", "meals and entertainment", "meals & entertainment",
            "entertainment", "meals_entertainment",
        ])
        if me:
            meals_amount += _safe_float(me)

        # Vehicle business use percentage
        vb = _find(combined, [
            "vehicle business use", "business use percentage",
            "vehicle_business_pct", "auto business use",
            "business use %", "vehicle business use %",
        ])
        if vb is not None:
            vehicle_pct_found = _safe_float(vb)

        # Rental losses (Schedule E)
        if "schedule-e" in doc_type or "schedule e" in doc_type:
            net_rental = _find(combined, [
                "net rental income", "rental net", "net rental",
                "net rental income or loss",
            ])
            if net_rental is not None:
                val = _safe_float(net_rental)
                if val < 0:
                    rental_losses += abs(val)

        # Charitable donations
        ch = _find(combined, [
            "charitable", "charitable donations", "charitable contributions",
            "donations", "charity",
        ])
        if ch:
            charitable_amount += _safe_float(ch)

    # ─── Apply rules ────────────────────────────────────────────────────────

    # Rule 1: Home office > 15% of gross income
    if home_office_amount > 0 and total_gross > 0:
        pct = home_office_amount / total_gross
        if pct > 0.40:
            flags.append({
                "rule": "HOME_OFFICE_EXCESSIVE",
                "severity": "high",
                "detail": (
                    f"Home office (${home_office_amount:,.0f}) is {pct:.0%} of gross income — "
                    f"far above IRS 15% threshold; expect Form 8829 scrutiny"
                ),
            })
        elif pct > 0.15:
            flags.append({
                "rule": "HOME_OFFICE_ELEVATED",
                "severity": "medium",
                "detail": (
                    f"Home office (${home_office_amount:,.0f}) is {pct:.0%} of gross income — "
                    f"above IRS 15% audit threshold"
                ),
            })

    # Rule 2: Vehicle business use ≥ 80%
    if vehicle_pct_found is not None:
        if vehicle_pct_found >= 100:
            flags.append({
                "rule": "VEHICLE_100PCT_BUSINESS",
                "severity": "high",
                "detail": "Vehicle claimed at 100% business use — mileage log required to substantiate",
            })
        elif vehicle_pct_found >= 80:
            flags.append({
                "rule": "VEHICLE_HIGH_BUSINESS_USE",
                "severity": "medium",
                "detail": (
                    f"Vehicle claimed at {vehicle_pct_found:.0f}% business use — "
                    f"detailed mileage log and business purpose documentation recommended"
                ),
            })

    # Rule 3: Meals & entertainment > 2% of gross income
    if meals_amount > 0 and total_gross > 0 and meals_amount / total_gross > 0.02:
        flags.append({
            "rule": "MEALS_ENTERTAINMENT_HIGH",
            "severity": "medium",
            "detail": (
                f"Meals & entertainment (${meals_amount:,.0f}) exceed 2% of gross income "
                f"({meals_amount / total_gross:.1%}) — IRS scrutinizes these closely"
            ),
        })

    # Rule 4: Charitable donations > 5% of income
    if charitable_amount > 0 and total_gross > 0 and charitable_amount / total_gross > 0.05:
        flags.append({
            "rule": "CHARITABLE_DONATIONS_HIGH",
            "severity": "medium",
            "detail": (
                f"Charitable donations (${charitable_amount:,.0f}) exceed 5% of income — "
                f"all amounts over $500 require Form 8283 and receipts"
            ),
        })

    # Rule 5: Schedule C net loss
    if schedule_c_net is not None and schedule_c_net < 0:
        flags.append({
            "rule": "SCHEDULE_C_NET_LOSS",
            "severity": "medium",
            "detail": (
                f"Schedule C shows net loss of ${abs(schedule_c_net):,.0f} — "
                f"IRS may invoke hobby loss rules (IRC §183) if losses are recurring"
            ),
        })

    # Rule 6: Total deductions-to-income ratio
    if total_gross > 0 and total_deductions > 0:
        ratio = total_deductions / total_gross
        if ratio > 0.70:
            flags.append({
                "rule": "DEDUCTIONS_VERY_HIGH",
                "severity": "high",
                "detail": (
                    f"Total deductions ({ratio:.0%} of gross income) are exceptionally high — "
                    f"strong audit risk; all deductions need documentation"
                ),
            })
        elif ratio > 0.50:
            flags.append({
                "rule": "DEDUCTIONS_HIGH",
                "severity": "medium",
                "detail": (
                    f"Total deductions ({ratio:.0%} of gross income) are above average — "
                    f"verify documentation for all major items"
                ),
            })

    # Rule 7: Rental losses > $25,000
    if rental_losses > 25_000:
        flags.append({
            "rule": "RENTAL_LOSS_OVER_THRESHOLD",
            "severity": "medium",
            "detail": (
                f"Rental losses (${rental_losses:,.0f}) exceed $25,000 IRS threshold — "
                f"active participation must be documented for full deductibility"
            ),
        })

    # Rule 8: K-1 present but Schedule E missing
    if has_k1 and not has_schedule_e:
        flags.append({
            "rule": "MISSING_SCHEDULE_E_FOR_K1",
            "severity": "high",
            "detail": "K-1 found but Schedule E not present — Schedule E is required to report K-1 pass-through income",
        })

    # Rule 9: 1099-B present but Form 8949 missing
    if has_1099b and not has_form8949:
        flags.append({
            "rule": "MISSING_FORM_8949_FOR_1099B",
            "severity": "high",
            "detail": "1099-B found but Form 8949 not present — Form 8949 is required to report capital gains and losses",
        })

    return flags


def format_flags_for_prompt(flags: list[dict]) -> str:
    """Format rule flags as readable text for injection into LLM agent prompts."""
    if not flags:
        return "RULE ENGINE PRE-CHECK: No threshold violations detected by deterministic rules."
    lines = ["RULE ENGINE PRE-CHECK (deterministic IRS threshold violations — address each):"]
    for f in flags:
        lines.append(f"  [{f['severity'].upper()}] {f['rule']}: {f['detail']}")
    return "\n".join(lines)
