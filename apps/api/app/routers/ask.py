from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_evidence_params
from app.schemas import AskRequest, AskResponse

router = APIRouter(prefix="/ask", tags=["Ask the Ledger"])


@router.post("", response_model=AskResponse)
def ask_the_ledger(
    payload: AskRequest,
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> AskResponse:
    floor, direct_only = evidence
    # Ensure floor from query or payload is respected
    active_floor = payload.floor.upper() if payload.floor else floor
    active_direct = payload.direct_only or direct_only

    from app.ai.ask_service import ask_ledger_pipeline

    return ask_ledger_pipeline(
        question=payload.question,
        floor=active_floor,
        direct_only=active_direct,
        db=db,
    )
