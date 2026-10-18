from dataclasses import dataclass


@dataclass(frozen=True)
class SimulatorInputs:
    b50_usd_m: float
    headcount: int = 150
    cost_advantage: float = 0.40
    hidden_allowance: float = 0.12
    exchange_rate: float = 85.0
    functions: tuple[str, ...] = ("Technology", "Data and analytics")


@dataclass(frozen=True)
class MonthlyPoint:
    month: int
    gcc_cumulative_usd_m: float
    hq_cumulative_usd_m: float
    gcc_cumulative_inr_cr: float
    hq_cumulative_inr_cr: float


@dataclass(frozen=True)
class SimulatorOutputs:
    year1_gcc_usd_m: float
    five_year_gcc_usd_m: float
    five_year_hq_usd_m: float
    five_year_saving_usd_m: float
    year1_gcc_inr_cr: float
    five_year_gcc_inr_cr: float
    five_year_hq_inr_cr: float
    five_year_saving_inr_cr: float
    break_even_month: int | None
    monthly_curves: list[MonthlyPoint]
    one_time_setup_usd_m: float
    annual_running_costs_usd_m: list[float]


def usd_to_inr_crore(usd_m: float, exchange_rate: float) -> float:
    # rupees crore = US$ million * rate / 10
    return round((usd_m * exchange_rate) / 10.0, 2)


def run_simulation(inputs: SimulatorInputs) -> SimulatorOutputs:
    b50 = inputs.b50_usd_m
    N = inputs.headcount
    adv = inputs.cost_advantage
    allowance = inputs.hidden_allowance
    rate = inputs.exchange_rate

    # 1. Per-person running cost v = 0.70 * b50 / 50
    v = (0.70 * b50) / 50.0

    # 2. One-time setup S = 0.30 * b50 * (0.5 + 0.5 * headcount / 50)
    S = 0.30 * b50 * (0.5 + 0.5 * (N / 50.0))

    # 3. Running cost in year i (i = 0 to 4) = v * headcount * (1.098 ^ i)
    annual_running_gcc: list[float] = []
    annual_running_hq: list[float] = []
    for i in range(5):
        run_i = v * N * (1.098 ** i)
        annual_running_gcc.append(run_i)
        # 4. Same team at HQ in year i = running cost / (1 - cost advantage)
        hq_i = run_i / (1.0 - adv) if (1.0 - adv) > 0 else run_i
        annual_running_hq.append(hq_i)

    # Year 1 GCC spend = (S + running_year_0) * (1 + allowance)
    year1_gcc = (S + annual_running_gcc[0]) * (1.0 + allowance)

    # 5. Five-year GCC spend = (S + sum of 5 years running) * (1 + allowance)
    sum_running_gcc = sum(annual_running_gcc)
    five_year_gcc = (S + sum_running_gcc) * (1.0 + allowance)

    # Five-year spend at HQ
    five_year_hq = sum(annual_running_hq)

    # Five-year saving
    five_year_saving = five_year_hq - five_year_gcc

    # 6. Monthly cumulative curves for 60 months
    monthly_curves: list[MonthlyPoint] = []
    cum_gcc = 0.0
    cum_hq = 0.0
    break_even_month: int | None = None

    for m in range(1, 61):
        year_idx = (m - 1) // 12
        monthly_gcc_run = annual_running_gcc[year_idx] / 12.0
        monthly_hq_run = annual_running_hq[year_idx] / 12.0

        if m == 1:
            m_gcc = (S + monthly_gcc_run) * (1.0 + allowance)
        else:
            m_gcc = monthly_gcc_run * (1.0 + allowance)

        m_hq = monthly_hq_run

        cum_gcc += m_gcc
        cum_hq += m_hq

        if break_even_month is None and cum_hq >= cum_gcc:
            break_even_month = m

        monthly_curves.append(
            MonthlyPoint(
                month=m,
                gcc_cumulative_usd_m=round(cum_gcc, 3),
                hq_cumulative_usd_m=round(cum_hq, 3),
                gcc_cumulative_inr_cr=usd_to_inr_crore(cum_gcc, rate),
                hq_cumulative_inr_cr=usd_to_inr_crore(cum_hq, rate),
            )
        )

    return SimulatorOutputs(
        year1_gcc_usd_m=round(year1_gcc, 3),
        five_year_gcc_usd_m=round(five_year_gcc, 3),
        five_year_hq_usd_m=round(five_year_hq, 3),
        five_year_saving_usd_m=round(five_year_saving, 3),
        year1_gcc_inr_cr=usd_to_inr_crore(year1_gcc, rate),
        five_year_gcc_inr_cr=usd_to_inr_crore(five_year_gcc, rate),
        five_year_hq_inr_cr=usd_to_inr_crore(five_year_hq, rate),
        five_year_saving_inr_cr=usd_to_inr_crore(five_year_saving, rate),
        break_even_month=break_even_month,
        monthly_curves=monthly_curves,
        one_time_setup_usd_m=round(S, 3),
        annual_running_costs_usd_m=[round(x, 3) for x in annual_running_gcc],
    )
