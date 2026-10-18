from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_evidence_params
from app.engines.reconcile import CountClaimInput, reconcile_counts
from app.models.entities import Claim, Source
from app.schemas import CountClaimSchema, GradeMixItem, GradeMixResponse, LedgerCountsResponse

router = APIRouter(prefix="/ledger", tags=["Ledger"])


@router.get("/counts", response_model=LedgerCountsResponse)
def get_ledger_counts(
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> LedgerCountsResponse:
    floor, direct_only = evidence

    # Query approved count claims
    stmt = (
        select(Claim, Source.url.label("source_url"), Source.publisher)
        .outerjoin(Source, Claim.source_id == Source.id)
        .where(Claim.metric == "count", Claim.status == "approved")
        .order_by(Claim.value_number.asc())
    )
    rows = db.execute(stmt).all()

    engine_inputs: list[CountClaimInput] = []
    for claim, source_url, publisher in rows:
        engine_inputs.append(
            CountClaimInput(
                id=claim.id,
                publisher=publisher or "Unknown Source",
                value_number=claim.value_number or 0.0,
                unit_of_count=claim.unit_of_count or "operating units",
                as_of_date=claim.as_of_date.isoformat() if claim.as_of_date else None,
                grade=claim.grade.value,
                relayed=claim.relayed,
                source_url=source_url,
            )
        )

    res = reconcile_counts(engine_inputs, floor=floor, direct_only=direct_only)

    schema_claims = [
        CountClaimSchema(
            id=c.id,
            publisher=c.publisher,
            value_number=c.value_number,
            unit_of_count=c.unit_of_count,
            as_of_date=c.as_of_date,  # type: ignore[arg-type]
            grade=c.grade,
            relayed=c.relayed,
            source_url=c.source_url,
        )
        for c in res.passed_claims
    ]

    return LedgerCountsResponse(
        min_value=res.min_value,
        max_value=res.max_value,
        weighted_centre=res.weighted_centre,
        best_grade=res.best_grade,
        status=res.status,
        message=res.message,
        claims=schema_claims,
        hidden_count=res.hidden_count,
        total_count=res.total_count,
    )


@router.get("/mix", response_model=GradeMixResponse)
def get_grade_mix(db: Session = Depends(get_db)) -> GradeMixResponse:
    # Query count of claims per grade
    stmt = select(Claim.grade, func.count(Claim.id)).group_by(Claim.grade)
    counts = dict(db.execute(stmt).all())

    total = sum(counts.values()) or 1
    items: list[GradeMixItem] = []
    for g in ["A", "B", "C", "D"]:
        cnt = counts.get(g, 0)
        items.append(
            GradeMixItem(
                grade=g,
                count=cnt,
                percentage=round((cnt / total) * 100.0, 1),
            )
        )

    return GradeMixResponse(total_records=total, mix=items)
