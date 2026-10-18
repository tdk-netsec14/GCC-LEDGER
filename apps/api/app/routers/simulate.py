from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_evidence_params
from app.engines.evidence import grade_satisfies_floor
from app.engines.rule_fit import RuleEvaluationInput, evaluate_rule_fit
from app.engines.simulate import SimulatorInputs, run_simulation
from app.models.entities import City, Rule
from app.schemas import (
    MonthlyCurvePointSchema,
    RuleFitItemSchema,
    SimulateRequest,
    SimulateResponse,
)

router = APIRouter(prefix="/simulate", tags=["Simulator"])


@router.post("", response_model=SimulateResponse)
def simulate_setup(
    payload: SimulateRequest,
    evidence: tuple[str, bool] = Depends(get_evidence_params),
    db: Session = Depends(get_db),
) -> SimulateResponse:
    floor, _direct_only = evidence

    # If city_id supplied, resolve benchmark b50 from city midpoint
    b50 = payload.b50_usd_m
    city_name: str | None = None
    if payload.city_id:
        city = db.get(City, payload.city_id)
        if city:
            city_name = city.name
            low = city.year1_cost_low_usd_m
            high = city.year1_cost_high_usd_m
            if low is not None and high is not None:
                b50 = (low + high) / 2.0
            elif low is not None:
                b50 = low
            elif high is not None:
                b50 = high

    sim_inputs = SimulatorInputs(
        b50_usd_m=b50,
        headcount=payload.headcount,
        cost_advantage=payload.cost_advantage,
        hidden_allowance=payload.hidden_allowance,
        exchange_rate=payload.exchange_rate,
        functions=tuple(payload.functions),
    )

    sim_outputs = run_simulation(sim_inputs)

    # Evaluate rules from DB
    rules_stmt = select(Rule).order_by(Rule.id.asc())
    rules = db.execute(rules_stmt).scalars().all()

    rule_fits: list[RuleFitItemSchema] = []
    hidden_count = 0

    for r in rules:
        passes_floor = grade_satisfies_floor(r.grade.value, floor)
        if not passes_floor:
            hidden_count += 1
            continue

        eval_input = RuleEvaluationInput(
            code=r.code,
            title=r.title,
            text=r.text,
            grade=r.grade.value,
            official_source_id=r.official_source_id,
            applies_if=r.applies_if,
            status_logic=r.status_logic,
        )
        eval_res = evaluate_rule_fit(
            eval_input,
            headcount=payload.headcount,
            functions=payload.functions,
            city_name=city_name,
        )
        rule_fits.append(
            RuleFitItemSchema(
                code=eval_res.code,
                title=eval_res.title,
                text=eval_res.text,
                grade=eval_res.grade,
                status=eval_res.status,
                reason=eval_res.reason,
            )
        )

    monthly_schemas = [
        MonthlyCurvePointSchema(
            month=m.month,
            gcc_cumulative_usd_m=m.gcc_cumulative_usd_m,
            hq_cumulative_usd_m=m.hq_cumulative_usd_m,
            gcc_cumulative_inr_cr=m.gcc_cumulative_inr_cr,
            hq_cumulative_inr_cr=m.hq_cumulative_inr_cr,
        )
        for m in sim_outputs.monthly_curves
    ]

    return SimulateResponse(
        year1_gcc_usd_m=sim_outputs.year1_gcc_usd_m,
        five_year_gcc_usd_m=sim_outputs.five_year_gcc_usd_m,
        five_year_hq_usd_m=sim_outputs.five_year_hq_usd_m,
        five_year_saving_usd_m=sim_outputs.five_year_saving_usd_m,
        year1_gcc_inr_cr=sim_outputs.year1_gcc_inr_cr,
        five_year_gcc_inr_cr=sim_outputs.five_year_gcc_inr_cr,
        five_year_hq_inr_cr=sim_outputs.five_year_hq_inr_cr,
        five_year_saving_inr_cr=sim_outputs.five_year_saving_inr_cr,
        break_even_month=sim_outputs.break_even_month,
        monthly_curves=monthly_schemas,
        rule_fits=rule_fits,
        hidden_count=hidden_count,
    )
