from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.engines.proof import ProviderInput, rank_providers
from app.models.entities import Engagement, Provider, ReviewTask
from app.schemas import (
    EngagementSubmissionRequest,
    ProviderSchema,
    ProvidersResponse,
)

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("", response_model=ProvidersResponse)
def get_providers(
    sort: Literal["proof", "tier"] = Query(default="proof", description="Sort by 'proof' or 'tier'"),
    db: Session = Depends(get_db),
) -> ProvidersResponse:
    stmt = select(Provider).order_by(Provider.id.asc())
    providers = db.execute(stmt).scalars().all()

    engine_inputs: list[ProviderInput] = []
    for p in providers:
        # Calculate claimed and verified counts from engagements
        claimed = len(p.engagements)
        verified = sum(1 for e in p.engagements if e.is_verified)

        engine_inputs.append(
            ProviderInput(
                id=p.id,
                name=p.name,
                category=p.category,
                fee_tier=p.fee_tier,
                profile_url=p.profile_url,
                claimed_engagements=claimed,
                verified_engagements=verified,
            )
        )

    ranked_results = rank_providers(engine_inputs, sort_by=sort)

    items = [
        ProviderSchema(
            id=r.id,
            name=r.name,
            category=r.category,
            fee_tier=r.fee_tier,
            profile_url=r.profile_url,
            claimed_engagements=r.claimed_engagements,
            verified_engagements=r.verified_engagements,
            proof_ratio=r.proof_ratio,
            rank=r.rank,
        )
        for r in ranked_results
    ]

    return ProvidersResponse(items=items, sort_applied=sort, hidden_count=0)


@router.post("/{provider_id}/engagements", status_code=status.HTTP_201_CREATED)
def submit_engagement(
    provider_id: int,
    payload: EngagementSubmissionRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    prov = db.get(Provider, provider_id)
    if not prov:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found.")

    eng = Engagement(
        provider_id=prov.id,
        client_name=payload.client_name,
        scope=payload.scope,
        city_id=payload.city_id,
        year=payload.year,
        footprint_url=payload.footprint_url,
        footprint_checked=False,
        client_confirmed=False,
    )
    db.add(eng)
    db.flush()

    # Create Review Task
    task = ReviewTask(
        kind="engagement",
        payload={
            "engagement_id": eng.id,
            "provider_name": prov.name,
            "client_name": eng.client_name,
            "scope": eng.scope,
            "footprint_url": eng.footprint_url,
        },
        state="open",
        reason="Awaiting footprint verification and client confirmation.",
    )
    db.add(task)
    db.commit()

    return {"message": "Engagement delivery claim submitted and placed in review queue.", "engagement_id": str(eng.id)}


@router.post("/engagements/{engagement_id}/confirm")
def confirm_engagement(
    engagement_id: int,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    eng = db.get(Engagement, engagement_id)
    if not eng:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Engagement not found.")

    eng.client_confirmed = True
    db.commit()

    return {
        "message": "Engagement client confirmation recorded successfully.",
        "verified_now": "true" if eng.is_verified else "false (footprint check still pending)",
    }
