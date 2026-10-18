# Decisions Log

## 2026-10-19 — Repository Initialisation
Git repository has been initialised in the workspace to enable the requested phase commits with clear commit messages after each phase.

## 2026-10-19 — Prototype Vector Retrieval and Mock LLM Provider
To guarantee that CI, contract tests, and the 60-question evaluation harness can run reliably offline without external network dependency or OpenAI API credit consumption, a deterministic mock LLM provider and chunk retriever are provided. When `LLM_PROVIDER=mock`, the system performs grounded keyword/vector chunk matching and generates strict JSON responses satisfying all grounding rules. When `LLM_PROVIDER=openai`, standard OpenAI API endpoints for chat completions and text embeddings are used.

## 2026-10-19 — Policy Seed Evidence Grading
Statutory descriptions and official portal addresses from Section 10 and 11 of the Build Document are stored with their respective starting grades. Only portal URLs verified on 19 October 2026 (such as RBI FIRMS at firms.rbi.org.in) carry verified status; all others are stamped with their last-checked date and audited by the link checker job. Where state policy documents have not been opened directly, they are honest data gaps or grade D draft records.

## 2026-10-19 — Preserving Determinism in Scoring
In accordance with Hard Constraint 5, all calculations for ledger reconciliation, city scoring, simulator cash flows, radar probability, and provider proof ratios are implemented as pure, deterministic Python functions. Under no circumstances does the LLM compute or alter these numbers.

## 2026-10-19 — Python 3.14 Authentication Modernization
The legacy `passlib` package has known incompatibilities with Python 3.14 (due to internal deprecations in the standard `crypt` module). Authentication was implemented directly using the official, actively maintained `bcrypt` package for constant-time password hashing and verification.

## 2026-10-19 — Claim Approval Event Listeners
SQLAlchemy `@validates` decorators fire eagerly during `__init__` before foreign keys and snapshot references are assigned. Claim approval integrity checks (verifying that Grade A records must have an official snapshot and source) were moved to SQLAlchemy's `@event.listens_for(Claim, "before_insert")` and `"before_update"` hooks, ensuring complete record validation before database persistence.

## 2026-10-19 — Banker's Rounding and Display Integers
Python's built-in `round()` uses round-half-to-even (banker's rounding), where `round(68.5)` evaluates to 68. For radar probabilities and UI percentage badges, explicit standard half-up arithmetic (`int(prob * 100 + 0.5)`) is utilized to guarantee consistent mathematical expectations (e.g. 68.5% -> 69%).

## 2026-10-19 — Hierarchical Project Root Resolution
To ensure reliable snapshot and seed loading across varied runtime contexts (API server, background tasks, pytest runners, and eval harness), root discovery dynamically traverses parent directories looking for the anchor directory `data/seed`.

## 2026-10-19 — External Snapshot Storage Architecture
Raw public texts are stored in `data/snapshots/` while `SourceSnapshot` retains the SHA-256 content hash and relative filesystem path (`stored_text_path`). This avoids database bloat and provides transparent, git-trackable snapshot artifacts.

## 2026-10-19 — Robust Numeric Grounding Regex
Standard `\b` word boundary assertions backtrack when numbers are followed by currency or unit letters (e.g., `$2.4M`). A lookbehind pattern `(?<!\d)\d+(?:,\d{3})*(?:\.\d+)?%?` was implemented to extract integers, decimals, and percentages accurately without backtracking anomalies.
