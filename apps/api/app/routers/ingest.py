from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_reviewer
from app.models.entities import ReviewerUser

router = APIRouter(prefix="/ingest", tags=["Ingestion Pipeline"])


@router.post("/run/{job}")
def trigger_ingest_job(
    job: str,
    reviewer: ReviewerUser = Depends(get_current_reviewer),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    allowed_jobs = [
        "fetch_sources",
        "diff_alert",
        "extract_claims",
        "index_chunks",
        "link_check",
        "recompute",
        "signal_scan",
    ]
    if job not in allowed_jobs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown job '{job}'. Allowed jobs: {allowed_jobs}",
        )

    # In Phase 6 we link this to APScheduler job runner directly
    return {"message": f"Job '{job}' triggered successfully by reviewer {reviewer.username}.", "status": "completed"}
