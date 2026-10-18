from dataclasses import dataclass

from app.engines.evidence import GRADE_ORDER, filter_evidence


@dataclass(frozen=True)
class CountClaimInput:
    id: int
    publisher: str
    value_number: float
    unit_of_count: str
    as_of_date: str | None
    grade: str
    relayed: bool
    source_url: str | None


@dataclass(frozen=True)
class ReconciledResult:
    passed_claims: list[CountClaimInput]
    min_value: float
    max_value: float
    weighted_centre: float
    best_grade: str | None
    status: str
    message: str | None
    hidden_count: int
    total_count: int


def reconcile_counts(
    claims: list[CountClaimInput],
    floor: str = "D",
    direct_only: bool = False,
) -> ReconciledResult:
    total_count = len(claims)
    passed, hidden_count = filter_evidence(claims, floor=floor, direct_only=direct_only)

    if not passed:
        return ReconciledResult(
            passed_claims=[],
            min_value=0.0,
            max_value=0.0,
            weighted_centre=0.0,
            best_grade=None,
            status="empty",
            message="No claims meet the selected evidence criteria. Lower the evidence floor or disable Direct sources only to view available figures.",
            hidden_count=hidden_count,
            total_count=total_count,
        )

    values = [c.value_number for c in passed]
    min_val = min(values)
    max_val = max(values)

    best_item = max(passed, key=lambda c: GRADE_ORDER.get(c.grade.upper(), 0))
    best_grade = best_item.grade

    total_weight = sum(GRADE_ORDER.get(c.grade.upper(), 1) for c in passed)
    weighted_sum = sum(GRADE_ORDER.get(c.grade.upper(), 1) * c.value_number for c in passed)
    weighted_centre = round(weighted_sum / total_weight, 2) if total_weight > 0 else 0.0

    if len(passed) == 1:
        return ReconciledResult(
            passed_claims=passed,
            min_value=min_val,
            max_value=max_val,
            weighted_centre=weighted_centre,
            best_grade=best_grade,
            status="single_source",
            message="A single source, treat as unconfirmed.",
            hidden_count=hidden_count,
            total_count=total_count,
        )

    return ReconciledResult(
        passed_claims=passed,
        min_value=min_val,
        max_value=max_val,
        weighted_centre=weighted_centre,
        best_grade=best_grade,
        status="reconciled",
        message=None,
        hidden_count=hidden_count,
        total_count=total_count,
    )
