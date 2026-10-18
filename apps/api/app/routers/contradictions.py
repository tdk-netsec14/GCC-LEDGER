from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_evidence_params
from app.engines.evidence import grade_satisfies_floor
from app.models.entities import Contradiction
from app.schemas import (
    ContradictionClaimSchema,
    ContradictionSchema,
    ContradictionsResponse,
)

router = APIRouter(prefix="/contradictions", tags=["Contradictions"])


@router.get("", response_model=ContradictionsResponse)
def get_contradictions(
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> ContradictionsResponse:
    floor, direct_only = evidence
    stmt = select(Contradiction).order_by(Contradiction.id.asc())
    contradictions = db.execute(stmt).scalars().all()

    items: list[ContradictionSchema] = []
    total_hidden = 0

    for c in contradictions:
        claim_schemas: list[ContradictionClaimSchema] = []
        for cl in c.claims:
            passes_floor = grade_satisfies_floor(cl.grade.value, floor)
            passes_direct = not (direct_only and cl.relayed)
            if passes_floor and passes_direct:
                claim_schemas.append(
                    ContradictionClaimSchema(
                        id=cl.id,
                        publisher=cl.source.publisher if cl.source else "Secondary Report",
                        text=cl.value_text or f"{cl.value_number} {cl.unit or ''}",
                        grade=cl.grade.value,
                        relayed=cl.relayed,
                    )
                )
            else:
                total_hidden += 1

        items.append(
            ContradictionSchema(
                id=c.id,
                title=c.title,
                reading=c.reading,
                to_settle=c.to_settle,
                last_checked_on=c.last_checked_on,
                claims=claim_schemas,
            )
        )

    return ContradictionsResponse(items=items, total=len(items), hidden_count=total_hidden)
