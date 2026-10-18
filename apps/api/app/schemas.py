from datetime import date, datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

# --- Common Envelope & Error Models ---

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Any | None = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    hidden_count: int = 0


class EvidenceQueryParams(BaseModel):
    floor: str = Field(default="D", pattern="^(A|B|C|D|a|b|c|d)$")
    direct_only: bool = False


# --- Ledger Schemas ---

class CountClaimSchema(BaseModel):
    id: int
    publisher: str
    value_number: float
    unit_of_count: str | None
    as_of_date: date | None
    grade: str
    relayed: bool
    source_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class LedgerCountsResponse(BaseModel):
    min_value: float
    max_value: float
    weighted_centre: float
    best_grade: str | None
    status: str
    message: str | None
    claims: list[CountClaimSchema]
    hidden_count: int
    total_count: int


class GradeMixItem(BaseModel):
    grade: str
    count: int
    percentage: float


class GradeMixResponse(BaseModel):
    total_records: int
    mix: list[GradeMixItem]


class ContradictionClaimSchema(BaseModel):
    id: int
    publisher: str
    text: str
    grade: str
    relayed: bool


class ContradictionSchema(BaseModel):
    id: int
    title: str
    reading: str
    to_settle: str
    last_checked_on: date | None
    claims: list[ContradictionClaimSchema] = []

    model_config = ConfigDict(from_attributes=True)


class ContradictionsResponse(BaseModel):
    items: list[ContradictionSchema]
    total: int
    hidden_count: int = 0


# --- Directory Schemas ---

class GCCRecordSchema(BaseModel):
    id: int
    city_name: str
    status: str
    note: str | None

    model_config = ConfigDict(from_attributes=True)


class CompanySchema(BaseModel):
    id: int
    name: str
    hq_country: str | None
    sector: str | None
    captive_status: str
    captive_reason: str | None
    records: list[GCCRecordSchema] = []
    grade: str = "D"
    relayed: bool = False

    model_config = ConfigDict(from_attributes=True)


class LeadSubmissionRequest(BaseModel):
    company_name: str = Field(min_length=2, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    status: str = Field(default="announced", max_length=32)
    source_url: str | None = None

    @field_validator("source_url")
    @classmethod
    def sanitize_source_url(cls, v: str | None) -> str | None:
        if not v:
            return None
        v_strip = v.strip()
        if not (v_strip.startswith(("http://", "https://"))):
            # Invalid URL scheme: Section 13.1 specifies: Link stored empty; lead still created
            return None
        return v_strip


class LeadSubmissionResponse(BaseModel):
    id: int
    company_name: str
    captive_status: str
    grade: str
    status: str
    message: str


# --- Cities & States Schemas ---

class PillarScoresSchema(BaseModel):
    cost_score: float
    salary_score: float
    incentive_score: float
    ecosystem_score: float


class RankedCitySchema(BaseModel):
    id: int
    name: str
    state_name: str
    rank: int
    total_score: float
    pillars: PillarScoresSchema
    year1_cost_midpoint: float | None
    senior_salary_midpoint: float | None
    gcc_count: int
    incentive_score: float
    is_data_gap: bool
    cost_grade: str
    incentive_grade: str


class CityRankResponse(BaseModel):
    items: list[RankedCitySchema]
    preset_applied: str | None
    hidden_count: int = 0
    total_cities: int


class CityDetailResponse(BaseModel):
    id: int
    name: str
    state_name: str
    year1_cost_low_usd_m: float | None
    year1_cost_high_usd_m: float | None
    senior_salary_low_lakh: float | None
    senior_salary_high_lakh: float | None
    gcc_count: int | None
    policy_name: str | None
    incentive_score: float
    is_data_gap: bool
    cost_grade: str
    ecosystem_grade: str


class IncentiveSchema(BaseModel):
    id: int
    policy_name: str
    valid_from: date | None
    valid_to: date | None
    policy_fraction: float
    capital_fraction: float
    employment_fraction: float
    other_fraction: float
    eligibility_text: str | None
    min_headcount: int | None
    location_scope: str | None

    model_config = ConfigDict(from_attributes=True)


class StateSchema(BaseModel):
    id: int
    name: str
    code: str
    has_gcc_policy: bool | None
    policy_status: str
    incentives: list[IncentiveSchema] = []

    model_config = ConfigDict(from_attributes=True)


# --- Setup Simulator Schemas ---

class SimulateRequest(BaseModel):
    city_id: int | None = None
    b50_usd_m: float = 2.0
    headcount: int = Field(default=150, ge=5, le=5000)
    cost_advantage: float = Field(default=0.40, ge=0.0, le=0.90)
    hidden_allowance: float = Field(default=0.12, ge=0.0, le=0.50)
    exchange_rate: float = Field(default=85.0, ge=1.0)
    functions: list[str] = Field(
        default_factory=lambda: ["Technology", "Data and analytics"]
    )


class MonthlyCurvePointSchema(BaseModel):
    month: int
    gcc_cumulative_usd_m: float
    hq_cumulative_usd_m: float
    gcc_cumulative_inr_cr: float
    hq_cumulative_inr_cr: float


class RuleFitItemSchema(BaseModel):
    code: str
    title: str
    text: str
    grade: str
    status: str
    reason: str | None


class SimulateResponse(BaseModel):
    year1_gcc_usd_m: float
    five_year_gcc_usd_m: float
    five_year_hq_usd_m: float
    five_year_saving_usd_m: float
    year1_gcc_inr_cr: float
    five_year_gcc_inr_cr: float
    five_year_hq_inr_cr: float
    five_year_saving_inr_cr: float
    break_even_month: int | None
    monthly_curves: list[MonthlyCurvePointSchema]
    rule_fits: list[RuleFitItemSchema]
    hidden_count: int = 0


# --- Roadmap & Document Library Schemas ---

class RoadmapStepSchema(BaseModel):
    step_number: int
    title: str
    timing_days: str
    description: str
    grade: str
    portal_url: str | None


class DocumentItemSchema(BaseModel):
    id: int
    group: str
    title: str
    issuing_authority: str
    purpose: str
    step: str
    portal_url: str | None
    grade: str
    last_checked_on: date | None


# --- Signal Radar Schemas ---

class SignalDefSchema(BaseModel):
    id: int
    cluster: str
    text: str
    weight: float
    grade: str
    lead_note: str | None
    relayed: bool = False

    model_config = ConfigDict(from_attributes=True)


class RadarScoreRequest(BaseModel):
    signal_ids: list[int] = []
    company_id: int | None = None


class RadarScoreResponse(BaseModel):
    probability: float
    band: str
    cluster_counts: dict[str, int]
    adjusted_weights: dict[int, float]
    best_next_signal: SignalDefSchema | None
    hidden_count: int


# --- Providers & Engagements Schemas ---

class EngagementSchema(BaseModel):
    id: int
    client_name: str
    scope: str
    year: int | None
    footprint_url: str | None
    footprint_checked: bool
    client_confirmed: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)


class ProviderSchema(BaseModel):
    id: int
    name: str
    category: str
    fee_tier: str | None
    profile_url: str | None
    claimed_engagements: int
    verified_engagements: int
    proof_ratio: float
    rank: int


class ProvidersResponse(BaseModel):
    items: list[ProviderSchema]
    sort_applied: str
    hidden_count: int = 0


class EngagementSubmissionRequest(BaseModel):
    client_name: str = Field(min_length=2, max_length=255)
    scope: str = Field(min_length=5)
    city_id: int | None = None
    year: int | None = None
    footprint_url: str | None = None


class EngagementConfirmRequest(BaseModel):
    token: str


# --- Sources Schemas ---

class SourceSchema(BaseModel):
    id: int
    publisher: str
    publisher_type: str
    title: str
    url: str
    published_on: date | None
    last_checked_on: date | None
    default_grade: str

    model_config = ConfigDict(from_attributes=True)


# --- Auth & Admin Review Schemas ---

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class ReviewTaskSchema(BaseModel):
    id: int
    kind: str
    payload: dict[str, Any]
    assigned_to: str | None
    state: str
    decision: str | None
    reason: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewDecisionRequest(BaseModel):
    decision: str = Field(pattern="^(approved|rejected)$")
    grade: str | None = Field(default=None, pattern="^(A|B|C|D)$")
    reason: str = Field(min_length=3)


# --- Ask the Ledger Schemas ---

class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    floor: str = Field(default="D", pattern="^(A|B|C|D|a|b|c|d)$")
    direct_only: bool = False


class CitedChunkSchema(BaseModel):
    id: int
    source_title: str
    publisher: str
    grade: str
    excerpt: str


class AskResponse(BaseModel):
    answer: str
    claims: list[dict[str, Any]] = []
    citations: list[CitedChunkSchema] = []
    lowest_grade_relied_on: str | None = None
    refused: bool = False
    refusal_reason: str | None = None
    latency_ms: int
