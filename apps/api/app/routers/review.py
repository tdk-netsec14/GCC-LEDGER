from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_reviewer
from app.models.entities import AuditLog, Company, ReviewerUser, ReviewTask
from app.schemas import ReviewDecisionRequest, ReviewTaskSchema

router = APIRouter(prefix="/review", tags=["Review & Admin Workspace"])


@router.get("/tasks", response_model=list[ReviewTaskSchema])
def list_review_tasks(
    state: str | None = Query(default="open"),
    reviewer: ReviewerUser = Depends(get_current_reviewer),
    db: Session = Depends(get_db),
) -> list[ReviewTaskSchema]:
    stmt = select(ReviewTask).order_by(ReviewTask.id.desc())
    if state:
        stmt = stmt.where(ReviewTask.state == state)
    tasks = db.execute(stmt).scalars().all()
    return [ReviewTaskSchema.model_validate(t) for t in tasks]


@router.post("/tasks/{task_id}/decision")
def record_review_decision(
    task_id: int,
    payload: ReviewDecisionRequest,
    reviewer: ReviewerUser = Depends(get_current_reviewer),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    task = db.get(ReviewTask, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review task not found.")

    before_state = {"state": task.state, "decision": task.decision, "payload": task.payload}

    task.state = "closed"
    task.decision = payload.decision
    task.reason = payload.reason
    task.assigned_to = reviewer.username

    # If reviewing a lead, update company captive status if approved
    if task.kind == "lead" and payload.decision == "approved":
        comp_name = task.payload.get("company_name")
        comp = db.execute(select(Company).where(Company.name == comp_name)).scalar_one_or_none()
        if comp:
            comp.captive_status = "yes"
            comp.captive_reason = f"Verified by reviewer {reviewer.username}: {payload.reason}"

    after_state = {"state": task.state, "decision": task.decision, "reason": task.reason}

    # Write to Audit Log
    audit = AuditLog(
        actor=reviewer.username,
        action=f"review_{payload.decision}",
        table_name="review_task",
        row_id=str(task.id),
        before=before_state,
        after=after_state,
    )
    db.add(audit)
    db.commit()

    return {"message": f"Task {task_id} marked as {payload.decision} and logged in audit register."}
