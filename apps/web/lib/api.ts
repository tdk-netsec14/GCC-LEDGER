const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type Grade = "A" | "B" | "C" | "D";

export interface EvidenceParams {
  floor?: Grade;
  direct_only?: boolean;
}

export interface CountClaim {
  id: number;
  publisher: string;
  value_number: number;
  unit_of_count: string | null;
  as_of_date: string | null;
  grade: Grade;
  relayed: boolean;
  source_url?: string | null;
}

export interface LedgerCountsResponse {
  min_value: number;
  max_value: number;
  weighted_centre: number;
  best_grade: Grade | null;
  status: string;
  message: string | null;
  claims: CountClaim[];
  hidden_count: number;
  total_count: number;
}

export interface GradeMixItem {
  grade: Grade;
  count: number;
  percentage: number;
}

export interface GradeMixResponse {
  total_records: number;
  mix: GradeMixItem[];
}

export interface ContradictionClaim {
  id: number;
  publisher: string;
  text: string;
  grade: Grade;
  relayed: boolean;
}

export interface Contradiction {
  id: number;
  title: string;
  reading: string;
  to_settle: string;
  last_checked_on: string | null;
  claims: ContradictionClaim[];
}

export interface ContradictionsResponse {
  items: Contradiction[];
  total: number;
  hidden_count: number;
}

export interface GCCRecord {
  id: number;
  city_name: string;
  status: string;
  note: string | null;
}

export interface Company {
  id: number;
  name: string;
  hq_country: string | null;
  sector: string | null;
  captive_status: "yes" | "no" | "unreviewed";
  captive_reason: string | null;
  records: GCCRecord[];
  grade: Grade;
  relayed: boolean;
}

export interface PaginatedCompanies {
  items: Company[];
  total: number;
  page: number;
  page_size: number;
  hidden_count: number;
}

export interface PillarScores {
  cost_score: number;
  salary_score: number;
  incentive_score: number;
  ecosystem_score: number;
}

export interface RankedCity {
  id: number;
  name: string;
  state_name: string;
  rank: number;
  total_score: number;
  pillars: PillarScores;
  year1_cost_midpoint: number | null;
  senior_salary_midpoint: number | null;
  gcc_count: number;
  incentive_score: number;
  is_data_gap: boolean;
  cost_grade: Grade;
  incentive_grade: Grade;
}

export interface CityRankResponse {
  items: RankedCity[];
  preset_applied: string | null;
  hidden_count: number;
  total_cities: number;
}

export interface CityDetail {
  id: number;
  name: string;
  state_name: string;
  year1_cost_low_usd_m: number | null;
  year1_cost_high_usd_m: number | null;
  senior_salary_low_lakh: number | null;
  senior_salary_high_lakh: number | null;
  gcc_count: number | null;
  policy_name: string | null;
  incentive_score: number;
  is_data_gap: boolean;
  cost_grade: Grade;
  ecosystem_grade: Grade;
}

export interface StatePolicy {
  id: number;
  name: string;
  code: string;
  has_gcc_policy: boolean | null;
  policy_status: string;
  incentives: Array<{
    id: number;
    policy_name: string;
    valid_from: string | null;
    valid_to: string | null;
    policy_fraction: number;
    capital_fraction: number;
    employment_fraction: number;
    other_fraction: number;
    eligibility_text: string | null;
    min_headcount: number | null;
    location_scope: string | null;
  }>;
}

export interface MonthlyCurvePoint {
  month: number;
  gcc_cumulative_usd_m: number;
  hq_cumulative_usd_m: number;
  gcc_cumulative_inr_cr: number;
  hq_cumulative_inr_cr: number;
}

export interface RuleFitItem {
  code: string;
  title: string;
  text: string;
  grade: Grade;
  status: "Applies" | "Check" | "Closed" | "Does not fit" | "Opportunity";
  reason: string | null;
}

export interface SimulateResponse {
  year1_gcc_usd_m: number;
  five_year_gcc_usd_m: number;
  five_year_hq_usd_m: number;
  five_year_saving_usd_m: number;
  year1_gcc_inr_cr: number;
  five_year_gcc_inr_cr: number;
  five_year_hq_inr_cr: number;
  five_year_saving_inr_cr: number;
  break_even_month: number | null;
  monthly_curves: MonthlyCurvePoint[];
  rule_fits: RuleFitItem[];
  hidden_count: number;
}

export interface RoadmapStep {
  step_number: number;
  title: string;
  timing_days: string;
  description: string;
  grade: Grade;
  portal_url: string | null;
}

export interface SignalDef {
  id: number;
  cluster: string;
  text: string;
  weight: number;
  grade: Grade;
  lead_note: string | null;
  relayed: boolean;
}

export interface RadarScoreResponse {
  probability: number;
  band: "Watch" | "Warming" | "Likely" | "Near-certain";
  cluster_counts: Record<string, number>;
  adjusted_weights: Record<string, number>;
  best_next_signal: SignalDef | null;
  hidden_count: number;
}

export interface ProviderItem {
  id: number;
  name: string;
  category: string;
  fee_tier: string | null;
  profile_url: string | null;
  claimed_engagements: number;
  verified_engagements: number;
  proof_ratio: number;
  rank: number;
}

export interface ProvidersResponse {
  items: ProviderItem[];
  sort_applied: "proof" | "tier";
  hidden_count: number;
}

export interface SourceItem {
  id: number;
  publisher: string;
  publisher_type: string;
  title: string;
  url: string;
  published_on: string | null;
  last_checked_on: string | null;
  default_grade: Grade;
}

export interface DocumentItem {
  id: number;
  group: string;
  title: string;
  issuing_authority: string;
  purpose: string;
  step: string;
  portal_url: string | null;
  grade: Grade;
  last_checked_on: string | null;
}

export interface AskCitation {
  id: number;
  source_title: string;
  publisher: string;
  grade: Grade;
  excerpt: string;
}

export interface AskResponse {
  answer: string;
  claims: Array<{ chunk_id: number; text: string }>;
  citations: AskCitation[];
  lowest_grade_relied_on: Grade | null;
  refused: boolean;
  refusal_reason: string | null;
  latency_ms: number;
}

export interface ReviewTask {
  id: number;
  kind: string;
  payload: Record<string, any>;
  assigned_to: string | null;
  state: string;
  decision: string | null;
  reason: string | null;
  created_at: string;
}

function buildQuery(params?: Record<string, any>): string {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      query.set(k, String(v));
    }
  }
  const qStr = query.toString();
  return qStr ? `?${qStr}` : "";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errMessage = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        errMessage = errJson.error.message;
      }
    } catch {
      // Fallback
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  getLedgerCounts: (params?: EvidenceParams) =>
    request<LedgerCountsResponse>(`/ledger/counts${buildQuery(params)}`),

  getLedgerMix: () =>
    request<GradeMixResponse>("/ledger/mix"),

  getContradictions: (params?: EvidenceParams) =>
    request<ContradictionsResponse>(`/contradictions${buildQuery(params)}`),

  getDirectory: (params?: EvidenceParams & { q?: string; city?: string; status?: string; page?: number; page_size?: number }) =>
    request<PaginatedCompanies>(`/directory${buildQuery(params)}`),

  submitLead: (data: { company_name: string; city: string; status?: string; source_url?: string }) =>
    request<{ id: number; company_name: string; status: string; message: string }>("/directory/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCitiesRank: (params?: EvidenceParams & { preset?: string; cost_weight?: number; salary_weight?: number; incentives_weight?: number; ecosystem_weight?: number }) =>
    request<CityRankResponse>(`/cities/rank${buildQuery(params)}`),

  getCityDetail: (cityId: number) =>
    request<CityDetail>(`/cities/${cityId}`),

  getStates: () =>
    request<StatePolicy[]>("/states"),

  simulate: (data: {
    city_id?: number;
    b50_usd_m?: number;
    headcount?: number;
    cost_advantage?: number;
    hidden_allowance?: number;
    exchange_rate?: number;
    functions?: string[];
  }, params?: EvidenceParams) =>
    request<SimulateResponse>(`/simulate${buildQuery(params)}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRoadmap: (params?: EvidenceParams) =>
    request<RoadmapStep[]>(`/roadmap${buildQuery(params)}`),

  getSignals: (params?: EvidenceParams) =>
    request<SignalDef[]>(`/radar/signals${buildQuery(params)}`),

  scoreRadar: (data: { signal_ids: number[]; company_id?: number }, params?: EvidenceParams) =>
    request<RadarScoreResponse>(`/radar/score${buildQuery(params)}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProviders: (sort: "proof" | "tier" = "proof") =>
    request<ProvidersResponse>(`/providers?sort=${sort}`),

  submitEngagement: (providerId: number, data: { client_name: string; scope: string; city_id?: number; year?: number; footprint_url?: string }) =>
    request<{ message: string; engagement_id: string }>(`/providers/${providerId}/engagements`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSources: (params?: EvidenceParams) =>
    request<SourceItem[]>(`/sources${buildQuery(params)}`),

  getDocuments: (params?: EvidenceParams) =>
    request<DocumentItem[]>(`/documents${buildQuery(params)}`),

  askLedger: (data: { question: string; floor?: Grade; direct_only?: boolean }) =>
    request<AskResponse>("/ask", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  loginReviewer: (data: { username: string; password: string }) =>
    request<{ access_token: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getReviewTasks: (token: string, state: string = "open") =>
    request<ReviewTask[]>(`/review/tasks?state=${state}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  submitReviewDecision: (token: string, taskId: number, data: { decision: "approved" | "rejected"; reason: string; grade?: Grade }) =>
    request<{ message: string }>(`/review/tasks/${taskId}/decision`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
};
