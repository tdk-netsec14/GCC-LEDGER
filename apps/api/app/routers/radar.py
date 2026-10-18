from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_evidence_params
from app.engines.evidence import filter_evidence
from app.engines.radar import RadarSignalItem, compute_radar_score
from app.models.entities import SignalDefinition, SignalObservation
from app.schemas import (
    RadarScoreRequest,
    RadarScoreResponse,
    SignalDefSchema,
)

router = APIRouter(prefix="/radar", tags=["Radar"])


@router.get("/signals", response_model=list[SignalDefSchema])
def get_signals(
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> list[SignalDefSchema]:
    floor, direct_only = evidence
    stmt = select(SignalDefinition).order_by(SignalDefinition.cluster.asc(), SignalDefinition.weight.desc())
    signals = db.execute(stmt).scalars().all()

    items = [
        RadarSignalItem(
            id=s.id,
            cluster=s.cluster,
            text=s.text,
            weight=s.weight,
            grade=s.grade.value,
            lead_note=s.lead_note,
            relayed=False,
        )
        for s in signals
    ]

    passed, _ = filter_evidence(items, floor=floor, direct_only=direct_only)

    return [
        SignalDefSchema(
            id=s.id,
            cluster=s.cluster,
            text=s.text,
            weight=s.weight,
            grade=s.grade,
            lead_note=s.lead_note,
            relayed=s.relayed,
        )
        for s in passed
    ]


@router.post("/score", response_model=RadarScoreResponse)
def score_signals(
    payload: RadarScoreRequest,
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> RadarScoreResponse:
    floor, direct_only = evidence

    stmt = select(SignalDefinition)
    all_defs = db.execute(stmt).scalars().all()
    all_items = [
        RadarSignalItem(
            id=s.id,
            cluster=s.cluster,
            text=s.text,
            weight=s.weight,
            grade=s.grade.value,
            lead_note=s.lead_note,
            relayed=False,
        )
        for s in all_defs
    ]
    defs_by_id = {s.id: s for s in all_items}

    ticked_ids = set(payload.signal_ids)

    # If company_id is provided, include observed signals for company
    if payload.company_id:
        obs_stmt = select(SignalObservation).where(SignalObservation.company_id == payload.company_id)
        obs = db.execute(obs_stmt).scalars().all()
        for o in obs:
            ticked_ids.add(o.signal_id)

    ticked_items = [defs_by_id[sid] for sid in ticked_ids if sid in defs_by_id]

    res = compute_radar_score(
        ticked_signals=ticked_items,
        all_available_signals=all_items,
        floor=floor,
        direct_only=direct_only,
    )

    best_next_schema = None
    if res.best_next_signal:
        best_next_schema = SignalDefSchema(
            id=res.best_next_signal.id,
            cluster=res.best_next_signal.cluster,
            text=res.best_next_signal.text,
            weight=res.best_next_signal.weight,
            grade=res.best_next_signal.grade,
            lead_note=res.best_next_signal.lead_note,
            relayed=res.best_next_signal.relayed,
        )

    return RadarScoreResponse(
        probability=res.probability,
        band=res.band,
        cluster_counts=res.cluster_counts,
        adjusted_weights=res.adjusted_weights,
        best_next_signal=best_next_schema,
        hidden_count=res.hidden_count,
    )
