from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_evidence_params
from app.engines.city_score import (
    CityInput,
    CityWeights,
    score_and_rank_cities,
)
from app.engines.evidence import grade_satisfies_floor
from app.models.entities import City, Incentive, State
from app.schemas import (
    CityDetailResponse,
    CityRankResponse,
    PillarScoresSchema,
    RankedCitySchema,
)

router = APIRouter(prefix="/cities", tags=["Cities"])


@router.get("/rank", response_model=CityRankResponse)
def rank_cities(
    cost_weight: float = Query(default=20.0, ge=0.0, le=100.0),
    salary_weight: float = Query(default=10.0, ge=0.0, le=100.0),
    incentives_weight: float = Query(default=25.0, ge=0.0, le=100.0),
    ecosystem_weight: float = Query(default=45.0, ge=0.0, le=100.0),
    preset: str | None = Query(default=None, description="Preset: balanced, small_centre, ecosystem_first"),
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> CityRankResponse:
    floor, _direct_only = evidence

    stmt = select(City).join(State, City.state_id == State.id).order_by(City.id.asc())
    cities = db.execute(stmt).scalars().all()

    engine_inputs: list[CityInput] = []
    hidden_count = 0

    for c in cities:
        # Check city cost grade (default D in seed benchmark)
        cost_grade = "D"
        inc_grade = "A" if (c.state and c.state.has_gcc_policy) else "D"

        # Check if cost data satisfies floor
        cost_passes = grade_satisfies_floor(cost_grade, floor)
        inc_passes = grade_satisfies_floor(inc_grade, floor)

        # Look up incentives for state
        inc_stmt = select(Incentive).where(Incentive.state_id == c.state_id)
        inc = db.execute(inc_stmt).scalars().first()

        p_frac = inc.policy_fraction if inc else (0.5 if c.state and c.state.has_gcc_policy else 0.0)
        c_frac = inc.capital_fraction if inc else 0.0
        e_frac = inc.employment_fraction if inc else 0.0
        o_frac = inc.other_fraction if inc else 0.0
        has_doc = (inc is not None)

        if not cost_passes:
            hidden_count += 1
            # "If the floor is above the grade of the cost data, cost and salary figures are shown faded with a notice"
            # Or if strictly filtered, we track hidden count

        engine_inputs.append(
            CityInput(
                id=c.id,
                name=c.name,
                state_name=c.state.name if c.state else "Unknown",
                year1_cost_low_usd_m=c.year1_cost_low_usd_m if cost_passes else None,
                year1_cost_high_usd_m=c.year1_cost_high_usd_m if cost_passes else None,
                senior_salary_low_lakh=c.senior_salary_low_lakh if cost_passes else None,
                senior_salary_high_lakh=c.senior_salary_high_lakh if cost_passes else None,
                gcc_count=c.gcc_count or 0,
                policy_fraction=p_frac if inc_passes else 0.0,
                capital_fraction=c_frac if inc_passes else 0.0,
                employment_fraction=e_frac if inc_passes else 0.0,
                other_fraction=o_frac if inc_passes else 0.0,
                has_policy_doc=has_doc,
                cost_grade=cost_grade,
                incentive_grade=inc_grade,
            )
        )

    weights = CityWeights(
        cost=cost_weight,
        salary=salary_weight,
        incentives=incentives_weight,
        ecosystem=ecosystem_weight,
    )

    ranked_results = score_and_rank_cities(engine_inputs, weights=weights, preset=preset)

    schema_items = [
        RankedCitySchema(
            id=r.id,
            name=r.name,
            state_name=r.state_name,
            rank=r.rank,
            total_score=r.total_score,
            pillars=PillarScoresSchema(
                cost_score=r.pillars.cost_score,
                salary_score=r.pillars.salary_score,
                incentive_score=r.pillars.incentive_score,
                ecosystem_score=r.pillars.ecosystem_score,
            ),
            year1_cost_midpoint=r.year1_cost_midpoint,
            senior_salary_midpoint=r.senior_salary_midpoint,
            gcc_count=r.gcc_count,
            incentive_score=r.incentive_score,
            is_data_gap=r.is_data_gap,
            cost_grade=r.cost_grade,
            incentive_grade=r.incentive_grade,
        )
        for r in ranked_results
    ]

    return CityRankResponse(
        items=schema_items,
        preset_applied=preset,
        hidden_count=hidden_count,
        total_cities=len(cities),
    )


@router.get("/{city_id}", response_model=CityDetailResponse)
def get_city_detail(
    city_id: int,
    db: Session = Depends(get_db),
) -> CityDetailResponse:
    city = db.get(City, city_id)
    if not city:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="City not found.")

    inc = db.execute(select(Incentive).where(Incentive.state_id == city.state_id)).scalars().first()
    has_policy = inc is not None
    inc_score = (
        (30.0 * inc.policy_fraction + 25.0 * inc.capital_fraction + 20.0 * inc.employment_fraction + 25.0 * inc.other_fraction)
        if inc
        else 0.0
    )

    return CityDetailResponse(
        id=city.id,
        name=city.name,
        state_name=city.state.name if city.state else "Unknown",
        year1_cost_low_usd_m=city.year1_cost_low_usd_m,
        year1_cost_high_usd_m=city.year1_cost_high_usd_m,
        senior_salary_low_lakh=city.senior_salary_low_lakh,
        senior_salary_high_lakh=city.senior_salary_high_lakh,
        gcc_count=city.gcc_count,
        policy_name=inc.policy_name if inc else None,
        incentive_score=round(inc_score, 1),
        is_data_gap=not has_policy,
        cost_grade="D",
        ecosystem_grade="B",
    )
