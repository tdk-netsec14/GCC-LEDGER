from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_reviewer
from app.ingest.jobs import (
    run_diff_alert,
    run_extract_claims,
    run_fetch_sources,
    run_index_chunks,
    run_link_check,
    run_recompute,
    run_signal_scan,
)
from app.models.entities import AuditLog, ReviewerUser

router = APIRouter(prefix="/ingest", tags=["Ingestion Pipeline"])

JOB_DISPATCH = {
    "fetch_sources": run_fetch_sources,
    "diff_alert": run_diff_alert,
    "extract_claims": run_extract_claims,
    "index_chunks": run_index_chunks,
    "link_check": run_link_check,
    "recompute": run_recompute,
    "signal_scan": run_signal_scan,
}


@router.post("/run/{job}")
def trigger_ingest_job(
    job: str,
    reviewer: ReviewerUser = Depends(get_current_reviewer),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    if job not in JOB_DISPATCH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown job '{job}'. Allowed jobs: {list(JOB_DISPATCH.keys())}",
        )

    # Execute pipeline job
    job_fn = JOB_DISPATCH[job]
    stats = job_fn(db)

    # Audit log entry for administrative accountability
    audit = AuditLog(
        entity_name="ingest_job",
        entity_id=0,
        action=f"trigger_{job}",
        diff_payload={"stats": stats},
        performed_by=reviewer.username,
    )
    db.add(audit)
    db.commit()

    return {
        "job": job,
        "message": f"Job '{job}' triggered successfully by reviewer '{reviewer.username}'.",
        "status": "completed",
        "stats": stats,
    }
