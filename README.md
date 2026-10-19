# GCC Ledger

> **Statutory Data Status Notice**  
> Figures and statements presented across GCC Ledger are claims read from public sources on the dates indicated. Records are not independently verified unless graded A. Content provided by this platform is for intelligence purposes only and does not constitute legal, tax, or financial advice.

GCC Ledger is a neutral, evidence-graded intelligence platform for Global Capability Centres (GCCs) in India. Every figure, record, rule, and signal carries an evidence grade (A, B, C, or D) and may be flagged as relayed. A global Evidence Floor (A through D) and a &ldquo;Direct sources only&rdquo; switch filter everything on screen and everything the AI assistant is permitted to cite.

---

## Architecture Overview

```
├── apps/
│   ├── api/             # FastAPI backend, pure deterministic engines, SQLAlchemy & Alembic
│   │   ├── app/
│   │   │   ├── ai/      # Grounded LLM generation, prompt defense, verifier, reviewer assist
│   │   │   ├── engines/ # Pure deterministic engines (reconcile, city score, simulate, radar, proof)
│   │   │   ├── ingest/  # APScheduler jobs (fetch, diff, extract, index, link_check, scan)
│   │   │   ├── models/  # 19 SQLAlchemy relational models
│   │   │   ├── routers/ # 13 REST API routers with Pydantic v2 schemas
│   │   │   └── main.py  # Lifespan configuration, rate limiting, and structured logging
│   │   └── alembic/     # Database migrations
│   └── web/             # Next.js 14 App Router, TypeScript (strict), Tailwind CSS
│       ├── app/         # 12 interactive dashboard views (Ledger, City Lab, Simulate, etc.)
│       ├── components/  # GradeStamp, RangeChart, ScoreBars, CostChart, ProbabilityMeter, etc.
│       └── lib/         # EvidenceContext with URL synchronization, API client
├── data/
│   ├── seed/            # Small, honest, versioned seed JSON files (A–D graded)
│   └── snapshots/       # Primary source snapshots with cryptographic content hashes
├── docs/                # Build document, architecture decisions, PostgreSQL migration guide
├── eval/                # 60-question evaluation harness covering 6 testing categories
├── tests/
│   ├── unit/            # Engine golden value tests, property tests (Hypothesis), AI & pipeline tests
│   ├── contract/        # REST API contract and status tests
│   └── e2e/             # Playwright user journey tests
└── scripts/             # Backup and administrative utilities
```

---

## Evidence Grading Framework

Every figure and datum in the platform carries an explicit evidence grade:

- **Grade A (Primary Record)**: Official gazette notification, statutory filing (e.g. MCA, RBI FIRMS, GST, SEZ Act), or primary regulator portal opened directly with a verified local snapshot.
- **Grade B (Professional / Industry Report)**: Formal industry association publication (e.g. Nasscom, Zinnov) or Big 4 / international property consultancy audit report.
- **Grade C (Secondary Press)**: Reputable news media or trade press reporting.
- **Grade D (Unverified / Platform Estimate)**: Public lead submission, unverified vendor claim, or self-reported platform estimate.

### Relayed Flag
When a secondary source cites a primary document without the primary text being opened and verified directly by a reviewer, it is marked as `relayed = true` and rendered with a dashed grade stamp.

---

## Deterministic Engines

All calculations are performed by deterministic code with strict typing. The LLM never computes rankings, costs, or probabilities:

1. **Count Reconciliation**: Grade-weighted center calculation using integer weights \(A=4, B=3, C=2, D=1\), min-max envelope, and best-grade determination.
2. **City Scoring**: Min-max normalized 4-pillar index (Cost, Salary, Incentives, Ecosystem). The incentive pillar decomposes into statutory fractions: policy (30%), capital subsidy (25%), employment subsidy (20%), and other benefits (25%). Missing state policies are scored as neutral data gaps, never penalized as zeroes.
3. **Setup Simulator**: 60-month cumulative operational model utilizing a 70/30 running/setup expenditure split, 9.8% annual salary escalation, hidden offshore allowance, and automated break-even month determination.
4. **Signal Radar**: Pre-incorporation indicator radar combining signals via independent noisy-OR accumulation: \(P = 1 - \prod (1 - w_i)\), applying a 0.60 cluster discount for repeat indicators in the same domain.
5. **Provider Proof**: Neutral ranking of advisory and turnkey partners via Laplace-smoothed proof ratio: \(\text{Proof Ratio} = \frac{\text{verified} + 1}{\text{claimed} + 2}\). Engagements require independent public footprint and client confirmation before verification.

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- SQLite3 or PostgreSQL 15+

### Installation & Setup

1. **Install backend dependencies:**
   ```bash
   pip install -e "apps/api[dev]"
   ```

2. **Install frontend dependencies:**
   ```bash
   cd apps/web && npm install && cd ../..
   ```

3. **Run database migrations:**
   ```bash
   cd apps/api
   $env:PYTHONPATH="."
   alembic upgrade head
   cd ../..
   ```

4. **Seed the database (idempotent):**
   ```bash
   $env:PYTHONPATH="apps/api"
   python -m app.seed
   ```

5. **Start Development Servers:**
   - **Backend API (FastAPI):**
     ```bash
     $env:PYTHONPATH="apps/api"
     python -m uvicorn app.main:app --app-dir apps/api --reload --port 8000
     ```
   - **Frontend UI (Next.js):**
     ```bash
     cd apps/web && npm run dev
     ```
   - Open [http://localhost:3000](http://localhost:3000) to access GCC Ledger.

---

## Running Tests & Quality Checks

- **Full Python Test Suite (Unit, Contract, Pipeline, AI):**
  ```bash
  $env:PYTHONPATH="apps/api"
  python -m pytest tests/
  ```

- **Strict Type Checking (Engines):**
  ```bash
  python -m mypy --strict apps/api/app/engines
  ```

- **Code Linting:**
  ```bash
  python -m ruff check apps/api tests/
  ```

- **AI Evaluation Harness (60 Questions, Mock Provider):**
  ```bash
  $env:PYTHONPATH="apps/api"
  python eval/run_eval.py
  ```

- **Frontend Production Build:**
  ```bash
  cd apps/web && npm run build
  ```

---

## Ingestion Pipeline & Scheduler

The background pipeline runs via APScheduler and supports manual triggering via authenticated reviewer endpoints (`POST /ingest/run/{job}`):

- `fetch_sources`: Checks registered sources and snapshots content with SHA-256 hashes.
- `diff_alert`: Compares sequential snapshot hashes and flags divergences for audit review.
- `extract_claims`: Runs AI extraction assistant with strict verbatim mechanical verification.
- `index_chunks`: Segments snapshot passages into `doc_chunk` records.
- `link_check`: Verifies portal availability and updates audit timestamps.
- `recompute`: Refreshes deterministic engine indices.
- `signal_scan`: Detects emerging breadcrumbs across news and public filings.

---

## Reviewer Queue & Moderation

Public lead submissions, AI-extracted claims, and contradiction settlements are held in `review_task` as unreviewed drafts.
Reviewers authenticate via `/auth/login` to inspect evidence spans, audit diffs, and approve or reject entries with logged justifications.
Default development reviewer account: `admin` / `adminpass123`.

---

## License

Original work developed for GCC Ledger. All rights reserved.
