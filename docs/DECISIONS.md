# Decisions Log

## 2026-10-19 — Repository Initialisation
Git repository has been initialised in the workspace to enable the requested phase commits with clear commit messages after each phase.

## 2026-10-19 — Prototype Vector Retrieval and Mock LLM Provider
To guarantee that CI, contract tests, and the 60-question evaluation harness can run reliably offline without external network dependency or OpenAI API credit consumption, a deterministic mock LLM provider and chunk retriever are provided. When `LLM_PROVIDER=mock`, the system performs grounded keyword/vector chunk matching and generates strict JSON responses satisfying all grounding rules. When `LLM_PROVIDER=openai`, standard OpenAI API endpoints for chat completions and text embeddings are used.

## 2026-10-19 — Policy Seed Evidence Grading
Statutory descriptions and official portal addresses from Section 10 and 11 of the Build Document are stored with their respective starting grades. Only portal URLs verified on 19 October 2026 (such as RBI FIRMS at firms.rbi.org.in) carry verified status; all others are stamped with their last-checked date and audited by the link checker job. Where state policy documents have not been opened directly, they are honest data gaps or grade D draft records.

## 2026-10-19 — Preserving Determinism in Scoring
In accordance with Hard Constraint 5, all calculations for ledger reconciliation, city scoring, simulator cash flows, radar probability, and provider proof ratios are implemented as pure, deterministic Python functions. Under no circumstances does the LLM compute or alter these numbers.
