import math

import pytest
from app.engines.city_score import (
    CityInput,
    CityWeights,
    score_and_rank_cities,
)
from app.engines.evidence import filter_evidence
from app.engines.proof import (
    ProviderInput,
    calculate_proof_ratio,
    rank_providers,
)
from app.engines.radar import (
    RadarSignalItem,
    compute_radar_score,
)
from app.engines.reconcile import (
    CountClaimInput,
    reconcile_counts,
)
from app.engines.rule_fit import (
    RuleEvaluationInput,
    evaluate_rule_fit,
)
from app.engines.simulate import (
    SimulatorInputs,
    run_simulation,
)
from hypothesis import given
from hypothesis import strategies as st

# --- 1. Ledger Reconcile Tests (Section 13.1) ---

@pytest.fixture
def sample_count_claims() -> list[CountClaimInput]:
    return [
        CountClaimInput(id=1, publisher="Vendor A", value_number=1600.0, unit_of_count="companies", as_of_date="2025-12-31", grade="D", relayed=False, source_url=None),
        CountClaimInput(id=2, publisher="Vendor B", value_number=1700.0, unit_of_count="companies", as_of_date="2026-03-31", grade="D", relayed=False, source_url=None),
        CountClaimInput(id=3, publisher="Govt Reply", value_number=1760.0, unit_of_count="operating units", as_of_date="2026-06-30", grade="A", relayed=True, source_url=None),
        CountClaimInput(id=4, publisher="Platform C", value_number=2000.0, unit_of_count="operating units", as_of_date="2026-05-15", grade="D", relayed=False, source_url=None),
        CountClaimInput(id=5, publisher="Advisory Firm", value_number=2117.0, unit_of_count="operating units", as_of_date="2026-08-31", grade="B", relayed=True, source_url=None),
    ]


def test_reconcile_floor_d_direct_off(sample_count_claims: list[CountClaimInput]) -> None:
    res = reconcile_counts(sample_count_claims, floor="D", direct_only=False)
    assert res.status == "reconciled"
    assert res.min_value == 1600.0
    assert res.max_value == 2117.0
    assert round(res.weighted_centre) == 1869
    assert res.best_grade == "A"
    assert res.hidden_count == 0


def test_reconcile_floor_b_direct_off(sample_count_claims: list[CountClaimInput]) -> None:
    res = reconcile_counts(sample_count_claims, floor="B", direct_only=False)
    assert res.status == "reconciled"
    assert res.min_value == 1760.0
    assert res.max_value == 2117.0
    assert round(res.weighted_centre) == 1913
    assert res.best_grade == "A"
    assert res.hidden_count == 3  # three D claims hidden


def test_reconcile_floor_b_direct_on(sample_count_claims: list[CountClaimInput]) -> None:
    res = reconcile_counts(sample_count_claims, floor="B", direct_only=True)
    assert res.status == "empty"
    assert res.min_value == 0.0
    assert res.max_value == 0.0
    assert res.weighted_centre == 0.0
    assert res.best_grade is None
    assert res.hidden_count == 5


def test_reconcile_floor_a_direct_off(sample_count_claims: list[CountClaimInput]) -> None:
    res = reconcile_counts(sample_count_claims, floor="A", direct_only=False)
    assert res.status == "single_source"
    assert res.min_value == 1760.0
    assert res.max_value == 1760.0
    assert res.weighted_centre == 1760.0
    assert res.best_grade == "A"
    assert "single source" in (res.message or "").lower()
    assert res.hidden_count == 4


# --- 2. Setup Simulator Tests (Section 13.1) ---

def test_simulator_golden_values() -> None:
    inputs = SimulatorInputs(
        b50_usd_m=2.0,
        headcount=150,
        cost_advantage=0.40,
        hidden_allowance=0.12,
        exchange_rate=85.0,
    )
    res = run_simulation(inputs)

    # Golden values from Section 13.1:
    # Year-one spend about US$6.05M
    assert math.isclose(res.year1_gcc_usd_m, 6.048, abs_tol=0.01)
    assert round(res.year1_gcc_usd_m, 2) == 6.05

    # Five-year GCC spend about US$29.9M
    assert math.isclose(res.five_year_gcc_usd_m, 29.948, abs_tol=0.05)
    assert round(res.five_year_gcc_usd_m, 1) == 29.9

    # Same team at headquarters about US$42.6M
    assert math.isclose(res.five_year_hq_usd_m, 42.566, abs_tol=0.05)
    assert round(res.five_year_hq_usd_m, 1) == 42.6

    # Saving about US$12.6M
    assert math.isclose(res.five_year_saving_usd_m, 12.618, abs_tol=0.05)
    assert round(res.five_year_saving_usd_m, 1) == 12.6

    # Break-even in month 8
    assert res.break_even_month == 8

    # Rupee crore conversion check: 29.948 * 85 / 10 = ~254.56 Cr
    assert math.isclose(res.five_year_gcc_inr_cr, (res.five_year_gcc_usd_m * 8.5), rel_tol=0.01)


# --- 3. Signal Radar Tests (Section 13.1) ---

def test_radar_different_clusters() -> None:
    signals = [
        RadarSignalItem(id=1, cluster="Filings", text="New Indian subsidiary", weight=0.50, grade="A"),
        RadarSignalItem(id=2, cluster="Hiring", text="10+ roles posted", weight=0.30, grade="C"),
        RadarSignalItem(id=3, cluster="Real estate", text="Occupier requirement 50k sq ft", weight=0.45, grade="C"),
        RadarSignalItem(id=4, cluster="Investor", text="Earnings call expansion mentions", weight=0.35, grade="B"),
    ]
    res = compute_radar_score(signals)
    # (1 - 0.50)(1 - 0.30)(1 - 0.45)(1 - 0.35) = 0.50 * 0.70 * 0.55 * 0.65 = 0.125125
    # 1 - 0.125125 = 0.874875 -> ~87%
    assert math.isclose(res.probability, 0.875, abs_tol=0.01)
    assert res.band == "Near-certain"


def test_radar_same_cluster_repeat_discount() -> None:
    signals = [
        RadarSignalItem(id=1, cluster="Filings", text="Signal A", weight=0.50, grade="A"),
        RadarSignalItem(id=2, cluster="Filings", text="Signal B", weight=0.55, grade="A"),
    ]
    res = compute_radar_score(signals, repeat_discount=0.60)
    # Sorted: 0.55, 0.50. First = 0.55, second = 0.50 * 0.60 = 0.30.
    # 1 - (1 - 0.55)(1 - 0.30) = 1 - 0.45 * 0.70 = 1 - 0.315 = 0.685 -> ~69%
    assert math.isclose(res.probability, 0.685, abs_tol=0.005)
    assert int(res.probability * 100 + 0.5) == 69
    assert res.band == "Likely"


# --- 4. Provider Proof Tests (Section 13.1) ---

def test_provider_proof_ratio_golden_values() -> None:
    cases = [
        (40, 31, 0.762),
        (120, 38, 0.320),
        (60, 51, 0.839),
        (200, 44, 0.223),
        (25, 22, 0.852),
        (35, 16, 0.459),
    ]

    for claimed, verified, expected_ratio in cases:
        ratio = calculate_proof_ratio(verified, claimed)
        assert math.isclose(ratio, expected_ratio, abs_tol=0.002)

    providers = [
        ProviderInput(id=1, name="P40", category="Advisory", fee_tier="Tier 1", profile_url=None, claimed_engagements=40, verified_engagements=31),
        ProviderInput(id=2, name="P120", category="Real Estate", fee_tier="Tier 1", profile_url=None, claimed_engagements=120, verified_engagements=38),
        ProviderInput(id=3, name="P60", category="Legal", fee_tier="Tier 2", profile_url=None, claimed_engagements=60, verified_engagements=51),
        ProviderInput(id=4, name="P200", category="Recruiting", fee_tier="Tier 1", profile_url=None, claimed_engagements=200, verified_engagements=44),
        ProviderInput(id=5, name="P25", category="Incubator", fee_tier="Tier 3", profile_url=None, claimed_engagements=25, verified_engagements=22),
        ProviderInput(id=6, name="P35", category="Payroll", fee_tier="Tier 2", profile_url=None, claimed_engagements=35, verified_engagements=16),
    ]

    ranked = rank_providers(providers, sort_by="proof")
    ordered_names = [p.name for p in ranked]
    # Expected order: P25 (0.852), P60 (0.839), P40 (0.762), P35 (0.459), P120 (0.320), P200 (0.223)
    assert ordered_names == ["P25", "P60", "P40", "P35", "P120", "P200"]


# --- 5. City Scoring & Zero-Weights Safety Tests (Section 13.1) ---

def test_city_scoring_zero_weights_safety() -> None:
    cities = [
        CityInput(
            id=1,
            name="City A",
            state_name="State A",
            year1_cost_low_usd_m=1.8,
            year1_cost_high_usd_m=2.2,
            senior_salary_low_lakh=20.0,
            senior_salary_high_lakh=30.0,
            gcc_count=500,
            policy_fraction=1.0,
            capital_fraction=0.8,
            employment_fraction=0.7,
            other_fraction=0.8,
            has_policy_doc=True,
        )
    ]
    zero_weights = CityWeights(cost=0.0, salary=0.0, incentives=0.0, ecosystem=0.0)
    ranked = score_and_rank_cities(cities, weights=zero_weights)
    assert len(ranked) == 1
    # Specification 13.1: "Total weight is treated as 1 so there is no divide-by-zero; every score is 0"
    assert ranked[0].total_score == 0.0


# --- 6. Rule Fit Evaluator Tests ---

def test_rule_fit_evaluator() -> None:
    rule_closed = RuleEvaluationInput(
        code="RULE-TAX-10AA",
        title="10AA Sunset",
        text="Sunset in 2020",
        grade="A",
        official_source_id=1,
        applies_if={},
        status_logic={"default": "Closed"},
    )
    res_closed = evaluate_rule_fit(rule_closed, headcount=150, functions=["Technology"])
    assert res_closed.status == "Closed"

    rule_salary = RuleEvaluationInput(
        code="RULE-TAX-80JJAA",
        title="80JJAA",
        text="Salary cap 25k",
        grade="A",
        official_source_id=1,
        applies_if={"salary_cap_exceeded": True},
        status_logic={"default": "Does not fit"},
    )
    res_salary = evaluate_rule_fit(rule_salary, headcount=150, functions=["Technology"])
    assert res_salary.status == "Does not fit"

    rule_headcount = RuleEvaluationInput(
        code="RULE-LABOUR",
        title="Retrenchment",
        text="Permission threshold",
        grade="A",
        official_source_id=1,
        applies_if={"headcount_min": 100},
        status_logic={"default": "Check"},
    )
    res_hc = evaluate_rule_fit(rule_headcount, headcount=150, functions=["Technology"])
    assert res_hc.status == "Check"


# --- 7. Property-Based Tests (Hypothesis) ---

@given(
    headcount=st.integers(min_value=5, max_value=2000),
    b50=st.floats(min_value=0.5, max_value=10.0),
    cost_adv=st.floats(min_value=0.10, max_value=0.80),
    hidden_allw=st.floats(min_value=0.0, max_value=0.30),
)
def test_simulator_properties(headcount: int, b50: float, cost_adv: float, hidden_allw: float) -> None:
    inputs = SimulatorInputs(
        b50_usd_m=b50,
        headcount=headcount,
        cost_advantage=cost_adv,
        hidden_allowance=hidden_allw,
    )
    res = run_simulation(inputs)
    assert res.year1_gcc_usd_m > 0
    assert res.five_year_gcc_usd_m > res.year1_gcc_usd_m
    assert res.five_year_hq_usd_m > 0
    assert len(res.monthly_curves) == 60


@given(
    cost_w=st.floats(min_value=1.0, max_value=100.0),
    sal_w=st.floats(min_value=1.0, max_value=100.0),
    inc_w=st.floats(min_value=1.0, max_value=100.0),
    eco_w=st.floats(min_value=1.0, max_value=100.0),
    scale=st.floats(min_value=0.1, max_value=10.0),
)
def test_city_weights_scale_invariance(
    cost_w: float, sal_w: float, inc_w: float, eco_w: float, scale: float
) -> None:
    cities = [
        CityInput(id=1, name="City A", state_name="S1", year1_cost_low_usd_m=1.0, year1_cost_high_usd_m=1.5, senior_salary_low_lakh=15.0, senior_salary_high_lakh=25.0, gcc_count=300, policy_fraction=1.0, capital_fraction=0.8, employment_fraction=0.8, other_fraction=0.8, has_policy_doc=True),
        CityInput(id=2, name="City B", state_name="S2", year1_cost_low_usd_m=2.0, year1_cost_high_usd_m=2.5, senior_salary_low_lakh=25.0, senior_salary_high_lakh=35.0, gcc_count=600, policy_fraction=0.5, capital_fraction=0.5, employment_fraction=0.5, other_fraction=0.5, has_policy_doc=True),
    ]

    w1 = CityWeights(cost=cost_w, salary=sal_w, incentives=inc_w, ecosystem=eco_w)
    w2 = CityWeights(cost=cost_w * scale, salary=sal_w * scale, incentives=inc_w * scale, ecosystem=eco_w * scale)

    r1 = score_and_rank_cities(cities, weights=w1)
    r2 = score_and_rank_cities(cities, weights=w2)

    assert [c.name for c in r1] == [c.name for c in r2]
    for c1, c2 in zip(r1, r2):
        assert math.isclose(c1.total_score, c2.total_score, abs_tol=0.05)


@given(
    floor_idx=st.integers(min_value=0, max_value=3),
)
def test_floor_monotonicity(floor_idx: int) -> None:
    grades = ["D", "C", "B", "A"]
    chosen_floor = grades[floor_idx]
    lower_floor = grades[max(0, floor_idx - 1)]

    items = [
        RadarSignalItem(id=1, cluster="C1", text="T1", weight=0.5, grade="A"),
        RadarSignalItem(id=2, cluster="C1", text="T2", weight=0.4, grade="B"),
        RadarSignalItem(id=3, cluster="C2", text="T3", weight=0.3, grade="C"),
        RadarSignalItem(id=4, cluster="C2", text="T4", weight=0.2, grade="D"),
    ]

    res_chosen, hidden_chosen = filter_evidence(items, floor=chosen_floor)
    res_lower, hidden_lower = filter_evidence(items, floor=lower_floor)

    # Raising floor never increases visible items
    assert len(res_chosen) <= len(res_lower)
    assert hidden_chosen >= hidden_lower
