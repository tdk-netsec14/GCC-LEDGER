from dataclasses import dataclass


@dataclass(frozen=True)
class CityInput:
    id: int
    name: str
    state_name: str
    year1_cost_low_usd_m: float | None
    year1_cost_high_usd_m: float | None
    senior_salary_low_lakh: float | None
    senior_salary_high_lakh: float | None
    gcc_count: int | None
    policy_fraction: float
    capital_fraction: float
    employment_fraction: float
    other_fraction: float
    has_policy_doc: bool
    cost_grade: str = "D"
    incentive_grade: str = "A"


@dataclass(frozen=True)
class CityWeights:
    cost: float = 20.0
    salary: float = 10.0
    incentives: float = 25.0
    ecosystem: float = 45.0


PRESETS: dict[str, CityWeights] = {
    "balanced": CityWeights(cost=20.0, salary=10.0, incentives=25.0, ecosystem=45.0),
    "small_centre": CityWeights(cost=30.0, salary=15.0, incentives=35.0, ecosystem=20.0),
    "ecosystem_first": CityWeights(cost=10.0, salary=5.0, incentives=10.0, ecosystem=75.0),
}


@dataclass(frozen=True)
class PillarScores:
    cost_score: float
    salary_score: float
    incentive_score: float
    ecosystem_score: float


@dataclass(frozen=True)
class RankedCity:
    id: int
    name: str
    state_name: str
    rank: int
    total_score: float
    pillars: PillarScores
    year1_cost_midpoint: float | None
    senior_salary_midpoint: float | None
    gcc_count: int
    incentive_score: float
    is_data_gap: bool
    cost_grade: str
    incentive_grade: str


def compute_midpoint(low: float | None, high: float | None) -> float | None:
    if low is None and high is None:
        return None
    if low is None:
        return high
    if high is None:
        return low
    return (low + high) / 2.0


def score_and_rank_cities(
    cities: list[CityInput],
    weights: CityWeights | None = None,
    preset: str | None = None,
) -> list[RankedCity]:
    if preset and preset.lower() in PRESETS:
        active_weights = PRESETS[preset.lower()]
    elif weights is not None:
        active_weights = weights
    else:
        active_weights = PRESETS["balanced"]

    weight_sum = (
        active_weights.cost
        + active_weights.salary
        + active_weights.incentives
        + active_weights.ecosystem
    )

    all_zero_weights = (weight_sum == 0.0)

    # Filter out cities with no cost data (they are not ranked as per specification)
    rankable = [c for c in cities if c.year1_cost_low_usd_m is not None or c.year1_cost_high_usd_m is not None]

    if not rankable:
        return []

    cost_mids = [compute_midpoint(c.year1_cost_low_usd_m, c.year1_cost_high_usd_m) or 0.0 for c in rankable]
    salary_mids = [compute_midpoint(c.senior_salary_low_lakh, c.senior_salary_high_lakh) or 0.0 for c in rankable]
    counts = [float(c.gcc_count or 0) for c in rankable]

    min_cost, max_cost = min(cost_mids), max(cost_mids)
    min_sal, max_sal = min(salary_mids), max(salary_mids)
    max_count = max(counts) if counts and max(counts) > 0 else 1.0

    scored: list[tuple[float, CityInput, PillarScores, float | None, float | None, float, bool]] = []

    for c in rankable:
        c_mid = compute_midpoint(c.year1_cost_low_usd_m, c.year1_cost_high_usd_m)
        s_mid = compute_midpoint(c.senior_salary_low_lakh, c.senior_salary_high_lakh)
        gcc_cnt = c.gcc_count or 0

        # Cost pillar: inverted min-max
        if max_cost == min_cost:
            cost_score = 100.0
        else:
            cost_score = 100.0 * (max_cost - (c_mid or 0.0)) / (max_cost - min_cost)

        # Salary pillar: inverted min-max
        if max_sal == min_sal:
            sal_score = 100.0
        else:
            sal_score = 100.0 * (max_sal - (s_mid or 0.0)) / (max_sal - min_sal)

        # Incentives pillar: 30 policy, 25 capital, 20 employment, 25 other
        inc_score = (
            30.0 * c.policy_fraction
            + 25.0 * c.capital_fraction
            + 20.0 * c.employment_fraction
            + 25.0 * c.other_fraction
        )

        # Ecosystem pillar: linear to max count
        eco_score = 100.0 * gcc_cnt / max_count

        pillars = PillarScores(
            cost_score=round(max(0.0, min(100.0, cost_score)), 2),
            salary_score=round(max(0.0, min(100.0, sal_score)), 2),
            incentive_score=round(max(0.0, min(100.0, inc_score)), 2),
            ecosystem_score=round(max(0.0, min(100.0, eco_score)), 2),
        )

        if all_zero_weights:
            total_score = 0.0
        else:
            w_sum = weight_sum
            weighted_total = (
                pillars.cost_score * active_weights.cost
                + pillars.salary_score * active_weights.salary
                + pillars.incentive_score * active_weights.incentives
                + pillars.ecosystem_score * active_weights.ecosystem
            )
            total_score = round(weighted_total / w_sum, 2)

        is_gap = not c.has_policy_doc
        scored.append((total_score, c, pillars, c_mid, s_mid, inc_score, is_gap))

    # Sort descending by total_score
    scored.sort(key=lambda x: x[0], reverse=True)

    results: list[RankedCity] = []
    for rank_idx, (tot, c, pillars, c_mid, s_mid, inc_score, is_gap) in enumerate(scored, start=1):
        results.append(
            RankedCity(
                id=c.id,
                name=c.name,
                state_name=c.state_name,
                rank=rank_idx,
                total_score=tot,
                pillars=pillars,
                year1_cost_midpoint=round(c_mid, 2) if c_mid is not None else None,
                senior_salary_midpoint=round(s_mid, 2) if s_mid is not None else None,
                gcc_count=c.gcc_count or 0,
                incentive_score=round(inc_score, 2),
                is_data_gap=is_gap,
                cost_grade=c.cost_grade,
                incentive_grade=c.incentive_grade,
            )
        )

    return results
