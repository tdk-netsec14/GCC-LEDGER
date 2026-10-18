from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import State
from app.schemas import IncentiveSchema, StateSchema

router = APIRouter(prefix="/states", tags=["States"])


@router.get("", response_model=list[StateSchema])
def get_states(db: Session = Depends(get_db)) -> list[StateSchema]:
    stmt = select(State).order_by(State.name.asc())
    states = db.execute(stmt).scalars().all()

    results: list[StateSchema] = []
    for s in states:
        inc_schemas = [
            IncentiveSchema(
                id=inc.id,
                policy_name=inc.policy_name,
                valid_from=inc.valid_from,
                valid_to=inc.valid_to,
                policy_fraction=inc.policy_fraction,
                capital_fraction=inc.capital_fraction,
                employment_fraction=inc.employment_fraction,
                other_fraction=inc.other_fraction,
                eligibility_text=inc.eligibility_text,
                min_headcount=inc.min_headcount,
                location_scope=inc.location_scope,
            )
            for inc in s.incentives
        ]
        results.append(
            StateSchema(
                id=s.id,
                name=s.name,
                code=s.code,
                has_gcc_policy=s.has_gcc_policy,
                policy_status=s.policy_status,
                incentives=inc_schemas,
            )
        )

    return results
