import json

from sqlalchemy.orm import Session

from app.ai.llm_provider import get_llm_provider
from app.models.entities import Claim, ReviewTask, SourceSnapshot


def run_extraction_assistant(
    snapshot: SourceSnapshot,
    db: Session,
) -> list[ReviewTask]:
    """Extract candidate claims from a snapshot text using LLM assistance.

    Mechanically validates that the extracted evidence span appears VERBATIM
    in the snapshot text. Creates ReviewTask items in 'open' status.
    """
    provider = get_llm_provider()
    system_prompt = (
        "You are an evidence extraction assistant. Extract factual claims "
        "(e.g. GCC counts, dates, cost numbers) from the provided snapshot text. "
        "Return strict JSON with key 'extracted_claims': list of objects with "
        "'claim_text', 'value_number', and 'evidence_span'. The evidence_span MUST be a verbatim quote."
    )
    user_prompt = f"--- BEGIN CONTEXT ---\n{snapshot.snapshot_text}\n--- END CONTEXT ---"

    raw_resp = provider.generate(system_prompt, user_prompt)
    try:
        data = json.loads(raw_resp)
        candidates = data.get("extracted_claims", [])
    except (json.JSONDecodeError, ValueError):
        candidates = []

    created_tasks: list[ReviewTask] = []
    for cand in candidates:
        span = cand.get("evidence_span", "").strip()
        # Mechanical validation: must be verbatim in snapshot
        if not span or span not in snapshot.snapshot_text:
            continue

        payload = {
            "source_id": snapshot.source_id,
            "snapshot_id": snapshot.id,
            "claim_text": cand.get("claim_text"),
            "value_number": cand.get("value_number"),
            "evidence_span": span,
            "suggested_grade": "C",
        }
        task = ReviewTask(
            kind="claim_extraction",
            payload=payload,
            state="open",
        )
        db.add(task)
        created_tasks.append(task)

    db.commit()
    return created_tasks


def run_captive_classifier(
    company_name: str,
    evidence_text: str,
    db: Session,
) -> ReviewTask:
    """Classifies whether an entity is a true captive GCC vs vendor/partner.

    Saves recommendation as a draft in ReviewTask.
    """
    provider = get_llm_provider()
    system_prompt = (
        "You are a captive classifier. Determine if the entity is a true captive "
        "(wholly owned subsidiary delivering internal services to parent) vs vendor. "
        "Return JSON with 'captive': 'yes'|'no', 'rationale', and 'confidence'."
    )
    user_prompt = f"Entity: {company_name}\nEvidence:\n{evidence_text}"

    raw_resp = provider.generate(system_prompt, user_prompt)
    try:
        result = json.loads(raw_resp)
    except (json.JSONDecodeError, ValueError):
        result = {
            "captive": "unreviewed",
            "rationale": "Model output parsing failed",
            "confidence": 0.0,
        }

    task = ReviewTask(
        kind="captive_classification",
        payload={
            "company_name": company_name,
            "classification": result.get("captive", "unreviewed"),
            "rationale": result.get("rationale", ""),
            "confidence": result.get("confidence", 0.0),
        },
        state="open",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def run_contradiction_detector(
    metric_type: str,
    claims: list[Claim],
    db: Session,
) -> list[ReviewTask]:
    """Detects divergent claims (>10% discrepancy) on the same metric/year.

    Generates draft contradiction tasks for reviewer arbitration.
    """
    tasks: list[ReviewTask] = []
    # Compare each pair of claims
    for i in range(len(claims)):
        for j in range(i + 1, len(claims)):
            c1, c2 = claims[i], claims[j]
            if c1.value_number and c2.value_number:
                v1, v2 = float(c1.value_number), float(c2.value_number)
                avg = (v1 + v2) / 2.0
                if avg > 0:
                    diff_pct = abs(v1 - v2) / avg
                    if diff_pct > 0.10:  # > 10% discrepancy
                        payload = {
                            "metric_type": metric_type,
                            "claim_1_id": c1.id,
                            "claim_1_value": v1,
                            "claim_1_publisher": c1.publisher,
                            "claim_2_id": c2.id,
                            "claim_2_value": v2,
                            "claim_2_publisher": c2.publisher,
                            "divergence_pct": round(diff_pct * 100, 1),
                        }
                        task = ReviewTask(
                            kind="contradiction_detection",
                            payload=payload,
                            state="open",
                        )
                        db.add(task)
                        tasks.append(task)

    if tasks:
        db.commit()
    return tasks
