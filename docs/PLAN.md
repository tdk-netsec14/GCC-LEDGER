# GCC Ledger Implementation Plan

## Overview
GCC Ledger is an evidence-graded intelligence platform for Global Capability Centres (GCCs) in India. Every figure, record, rule, and signal carries an evidence grade (A, B, C, D) and can be flagged as relayed. The platform enforces deterministic scoring engines, an Evidence Floor, Direct-sources filtering, and grounded AI retrieval that never invents data.

## Delivery Phases and Order of Work

### Phase 1: Foundations
- **Monorepo Layout**: `apps/api`, `apps/web`, `data/seed`, `data/snapshots`, `eval`, `tests`, `docs`.
- **Infrastructure**: `docker-compose.yml` (API, Web, shared data volume), `.env.example` with all configuration variables, task runner / Makefile (`setup`, `dev`, `test`, `lint`, `seed`, `eval`, `build`).
- **Database & Data Model**: SQLAlchemy 2.0 models in `apps/api/app/models/entities.py` for all 18 tables defined in section 6 of BUILD_DOCUMENT.md (`source`, `source_snapshot`, `claim`, `company`, `gcc_record`, `state`, `city`, `incentive`, `rule`, `contradiction`, `contradiction_claim`, `signal_def`, `signal_observation`, `provider`, `engagement`, `review_task`, `doc_chunk`, `qa_log`, `audit_log`).
- **Database Constraints & Validation**:
  - No approved claim without source and snapshot.
  - Grade A only from government or regulator publisher with a verified snapshot.
  - Engagements verified only when `footprint_checked` and `client_confirmed` are both true.
  - Public leads start at grade D and `captive_status = 'unreviewed'`.
- **Alembic Migrations**: Generate and run migration `001_initial_schema`.
- **Idempotent Seed Loader**: `apps/api/app/seed.py` reading versioned JSON/CSV files in `data/seed/`:
  - `sources.json`, `counts.json`, `companies.json`, `states.json`, `cities.json`, `incentives.json`, `rules.json`, `contradictions.json`, `signals.json`, `providers.json`, `roadmap.json`, `docs.json`.
- **Verification**: `python -m app.seed` populates database idempotently. Git commit for Phase 1.

### Phase 2: Deterministic Engines (Pure Functions, Fully Typed)
- Strict typing and pure functions in `apps/api/app/engines/`:
  - `evidence.py`: Evidence floor filtering (A-D hierarchy) and direct-only filtering, tracking `hidden_count`.
  - `reconcile.py`: Range calculation (min, max), grade-weighted centre (weights A=4, B=3, C=2, D=1), best grade in play, single-source notice, empty state handling.
  - `city_score.py`: Four pillars: Setup cost (inverted min-max), Senior salary (inverted min-max), Documented incentives (30 policy, 25 capital, 20 employment, 25 other concessions), Ecosystem density (linear to max GCC count). Presets (Balanced, Small centre, Ecosystem first), zero-weight safety, data gap handling.
  - `simulate.py`: Headcount, 70/30 running/setup split ($v = 0.70 \times b_{50} / 50$, $S = 0.30 \times b_{50} \times (0.5 + 0.5 \times N / 50)$), 9.8% yearly pay rise, cost advantage over HQ, 12% hidden allowance, 60-month cumulative curves, break-even month, INR crore conversion.
  - `rule_fit.py`: Evaluator checking conditional logic for setup rules based on city, headcount, function selections, and entity structure.
  - `radar.py`: Signal grouping by cluster, sorting by weight, cluster discount of 0.6 for repeat signals in cluster, noisy-OR probability calculation ($1 - \prod (1 - w_{adj})$), probability bands (Watch <25%, Warming <55%, Likely <80%, Near-certain >=80%), best next check recommendation.
  - `proof.py`: Provider proof ratio $((verified + 1) / (claimed + 2))$, sorting by proof ratio vs. fee tier.
- **Unit and Property Tests**: `tests/unit/test_engines.py` verifying exact golden values from Section 13.1 of the specification:
  - Ledger reconcile cases (D floor = 1600-2117 centre ~1869; B floor = 1760-2117 centre ~1913; B direct-only = empty; A floor = single source).
  - 150-person simulator case: Year-1 spend ~$6.05M, 5-year spend ~$29.9M, HQ ~$42.6M, saving ~$12.6M, break-even month 8.
  - Radar cases: 4 different clusters = ~87% Near-certain; 2 signals in 1 cluster (0.50, 0.55) = ~69%.
  - Provider proof ratio ranking test.
  - City ranking with zero-weights safety.
  - Directory invalid link sanitization.
  - Property tests with Hypothesis (score boundedness 0-100, monotonicity, scale invariance).
- **Verification**: `pytest tests/unit` and `mypy apps/api/app/engines --strict`. Git commit for Phase 2.

### Phase 3: API Layer
- FastAPI application in `apps/api/app/main.py` with standard middleware:
  - Error envelope with machine-readable error codes.
  - CORS middleware configured via environment.
  - Rate limiting (stricter on `/ask` and `/directory/leads`).
  - Request size limits (64KB default).
  - Structured JSON logging with request IDs (no PII).
  - Evidence query parameter dependency (`floor`, `direct_only`) injecting filtered views and returning `hidden_count`.
- Routers:
  - `routers/ledger.py`: `GET /ledger/counts`, `GET /ledger/mix`
  - `routers/contradictions.py`: `GET /contradictions`
  - `routers/directory.py`: `GET /directory`, `POST /directory/leads`
  - `routers/cities.py`: `GET /cities/rank`, `GET /cities/{id}`
  - `routers/states.py`: `GET /states`
  - `routers/simulate.py`: `POST /simulate`
  - `routers/roadmap.py`: `GET /roadmap`
  - `routers/radar.py`: `GET /signals`, `POST /radar/score`
  - `routers/providers.py`: `GET /providers`, `POST /providers/{id}/engagements`, `POST /engagements/{id}/confirm`
  - `routers/sources.py`: `GET /sources`, `GET /documents`
  - `routers/review.py`: `GET /review/tasks`, `POST /review/tasks/{id}/decision` (authenticated reviewer session)
  - `routers/ingest.py`: `POST /ingest/run/{job}`
- **Verification**: API tests in `tests/contract/test_api.py`. OpenAPI schema generation and validation. Git commit for Phase 3.

### Phase 4: Frontend Application
- Next.js (App Router) + TypeScript + Tailwind CSS in `apps/web/`:
  - Global Evidence Floor state synced with URL query parameters (`floor=A|B|C|D`, `direct_only=true|false`).
  - Shared Components:
    - `Header` & `FloorBar` (A-D selector, direct-only toggle, mobile responsive).
    - `DataStatusBanner` on all pages (data status notice, not legal/tax advice).
    - `GradeStamp` (letter in color badge, dashed outline when relayed).
    - `RangeChart` (SVG range bar with source points, diamond centre, faded points below floor).
    - `ScoreBars` (stacked pillar bars for cities).
    - `CostChart` (60-month cumulative curves with break-even indicator).
    - `ProbabilityMeter` (radial or linear band meter).
    - `RuleItem` (status tags: Applies, Check, Closed, Does not fit, Opportunity).
    - `SourceLink` (verified badge, last checked date).
    - `HiddenCount` & `EmptyState` notifications.
    - `ContradictionCard` (side-by-side claims with "To settle it").
    - `Checklist` (interactive first 90 days with progress bar).
  - Screens/Pages:
    - `/` or `/ledger`: Count claims range chart, weighted centre, grade mix, contradiction register.
    - `/directory`: Directory of GCCs with captive indicator, search, filters, hide counts, lead submission modal.
    - `/cities`: City Lab ranking, customizable weights, 3 presets, incentive component breakdown.
    - `/simulate`: Setup simulator with headcount, cost advantage, function toggles, cost charts, break-even month, rule-fit panel, 90-day checklist.
    - `/radar`: Signal Radar with cluster checklist, custom company assessment, probability meter, next best check.
    - `/providers`: Provider Proof with proof ratio ranking vs. fee-tier sorting, verification explanation.
    - `/ask`: Ask the Ledger chat interface with evidence floor controls, citations, lowest-grade line, refusal displays.
    - `/sources`: Source register with status, grades, last-checked dates.
    - `/documents`: Document library for statutory forms and templates.
    - `/states`: State policy register and incentive coverage.
    - `/review`: Review queue for submitted leads, extracted claims, and audit logs.
  - Accessibility: WCAG 2.1 AA compliant, keyboard navigability, high contrast in light/dark themes, typographic quotes/apostrophes.
- **Verification**: Frontend build check, component unit tests, accessibility pass. Git commit for Phase 4.

### Phase 5: AI Layer
- Core implementation in `apps/api/app/ai/`:
  - `ask_service.py`:
    1. Intent check (in-scope vs. out-of-scope).
    2. Structured deterministic query routing.
    3. Retrieval over approved `doc_chunk` records strictly filtered by floor and direct-only before the prompt is assembled.
    4. Grounded generation via prompt templates in `apps/api/app/ai/prompts/` demanding JSON with citations.
    5. Mechanical verification pass (citations exist, all numbers appear in cited chunks, lowest grade identified). Retry once on failure, refuse if invalid.
    6. Below-floor refusal naming best available grade and source.
    7. Daily budget tracking (`DAILY_LLM_BUDGET_USD`) and request caching.
    8. Full logging to `qa_log`.
  - `extraction.py`: Reviewer extraction assistant proposing claims with exact snapshot offsets.
  - `classifier.py`: Captive classifier with allow/deny override list.
  - `contradiction_detector.py`: Automated discrepancy detection on identical metric/subject claims.
  - `providers/`: Deterministic mock LLM provider for network-free, cost-free testing & CI; OpenAI provider for production.
- **Verification**: AI verification unit tests. Git commit for Phase 5.

### Phase 6: Pipeline and Background Jobs
- Ingestion jobs in `apps/api/app/ingest/jobs.py` using APScheduler:
  - `fetch_sources`: Polite fetch with `FETCH_USER_AGENT`, content hash, snapshot persistence.
  - `diff_alert`: Detect changes in policy/regulatory texts and queue review tasks.
  - `extract_claims`: Rule-based and LLM-assisted draft claim generation.
  - `index_chunks`: Chunking and embedding approved snapshots.
  - `link_check`: Health check on official URLs, flagging dead links.
  - `recompute`: Refreshing caches and running contradiction checks.
  - `signal_scan`: Weekly scan simulation for watchlisted entities.
  - Manual trigger endpoint `POST /ingest/run/{job}`.
- **Verification**: Job execution tests and idempotency verification. Git commit for Phase 6.

### Phase 7: Regulatory and Policy Content
- Full population from Sections 10, 11, and 12 of `BUILD_DOCUMENT.md`:
  - 20 central setup steps, recurring compliance calendar, statutory forms, and official portals.
  - State policy coverage for all 16+ states (Karnataka, Maharashtra, Telangana, Tamil Nadu, Andhra Pradesh, Gujarat, Uttar Pradesh, Haryana, Delhi, Rajasthan, Madhya Pradesh, Odisha, Bihar, Kerala, West Bengal, Punjab, etc.).
  - Document library templates and guides.
- **Verification**: Seed validation and content completeness checks. Git commit for Phase 7.

### Phase 8: Quality, Hardening & Evaluation
- `eval/runner.py`: 60 evaluation questions across the 6 categories (Answerable, Conflicting, Below-floor, Out-of-scope, Prompt injection, Legal advice disclaimer). Target 100% citation validity, 100% numeric grounding, >=95% refusal rate.
- Playwright E2E tests in `tests/e2e/`.
- OpenAPI contract tests in `tests/contract/`.
- Linters, formatters (`ruff`, `mypy`), and GitHub Actions workflow in `.github/workflows/ci.yml`.
- Security review: rate limiting, input sanitization, security headers, dependency pinning, PostgreSQL migration guide in `docs/POSTGRES_MIGRATION.md`.
- Final verification of definition of done. Git commit for Phase 8.
