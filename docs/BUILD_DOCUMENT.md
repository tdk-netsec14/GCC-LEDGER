# GCC Ledger: Complete Build Document

*Product requirements, system design and build plan for an evidence-graded intelligence platform for Global Capability Centres in India*

Prepared for the AI Engineer Intern assessment · Version 1.0 · 19 October 2026

## 1. Purpose and scope

India hosts well over a thousand Global Capability Centres (GCCs), the captive offshore centres that global companies run for technology, finance, operations and research. The ecosystem is fragmented. Counts of GCCs disagree between publishers, nobody can reliably say which companies those are, state incentives are quoted differently by different sources, and service providers are chosen on referral because their delivery record is not visible.

GCC Ledger is a single, neutral reference for this ecosystem. Its central idea is that **every number, record and rule carries a grade for how close it sits to a primary source, and the reader sets the minimum grade they are willing to accept.** The product never hides uncertainty and never invents a figure. If the evidence for a question sits below the reader’s chosen floor, the product says so.

This document specifies everything needed to build the product from scratch: users, features, the logic behind each feature, data model, APIs, the AI layer, the data pipeline, the Indian regulatory process the product must represent, state-by-state policy coverage, a build plan, tests and deployment.

### 1.1 Deliverables of the assessment this document supports

- A deck covering the problem, the opportunities, the solution and the positioning (outline in section 16).
- A working prototype. It does not need to be complete, it needs to work (scope in section 14).

### 1.2 Users, in priority order

| User | What they need | Why they come |
| --- | --- | --- |
| First customer: a foreign company planning a centre of 5 to 300 people | Cost, location, rules and a sequenced setup plan | Neutral numbers with visible evidence, instead of advisor referrals |
| Advisors, lawyers, auditors | A defensible reference for client conversations | Traceable sources and a list of known contradictions |
| Real estate and workspace firms | Which companies are likely to arrive, and where | Early, corroborated demand signals |
| State governments and investment agencies | To see how their policy is documented and compared | A fair, evidence-based view and a channel to correct records |
| Service providers | To be judged on delivery | A proof-based ranking instead of a paid-tier ranking |

## 2. Core concepts

### 2.1 Evidence grades

Every claim, record, signal and rule is stamped with one grade.

| Grade | Meaning | Weight |
| --- | --- | --- |
| A | Primary record that the team opened: statute, official notification, regulatory filing, government release | 4 |
| B | Industry body or professional-firm report (consulting, audit, law, real estate advisory) | 3 |
| C | Press or other secondary reporting | 2 |
| D | Vendor, platform or unsourced claim | 1 |

A claim can also be **relayed**: it was read on another page and the original was not opened. A relayed claim keeps the grade of its original source but is drawn with a dashed edge and can be excluded with the Direct sources only switch.

### 2.2 Evidence floor

A global control, always visible in the header. The reader picks A, B, C or D. Any item with a grade below the floor is hidden or dimmed everywhere: the headline count, the directory, city scores, setup rules, radar signals and AI answers. A second switch, **Direct sources only**, additionally removes relayed items. Every screen shows how many items were hidden by the floor so that nothing disappears silently.

### 2.3 Rules the product follows

1. No unsourced number is ever shown as fact. A missing figure displays as Data unavailable.
2. Missing data is not a verdict. A state with no documented incentives scores as a data gap, not as zero merit.
3. Contradictions are published, with the claims side by side, a reading, and the document that would settle it.
4. Providers cannot buy rank.
5. Nothing in the product is legal or tax advice, and the interface says so.

## 3. Technology stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Backend and AI services | Python 3.11 with FastAPI, Pydantic v2, SQLAlchemy | Typed APIs, automatic OpenAPI docs, native fit for the AI toolchain |
| Frontend | Next.js (React) with TypeScript and Tailwind CSS | Component model, typed client, fast iteration on dashboards |
| Charts | Recharts or hand-written SVG | Range chart, cumulative cost chart and score bars are simple enough to draw directly |
| Primary database | SQLite for the prototype, with a clean migration path to PostgreSQL | Zero setup for a demo, same schema later |
| Retrieval | Chroma or FAISS vector index over source documents | Retrieval-augmented answers with citations |
| LLM provider | OpenAI API (chat model for answers and extraction, embedding model for retrieval) | Strong structured-output support |
| Background jobs | APScheduler for the prototype, a queue worker later | Scheduled ingestion and link checks |
| Testing | pytest, Playwright, a small evaluation harness for the AI layer | Covered in section 13 |
| Packaging | Docker Compose with two services (api, web) | One command to run |

The API key is read from an environment variable and never reaches the browser. All LLM calls go through the backend.

## 4. System overview

```
Sources (official sites, filings, reports, press)
   -> Ingestion jobs (fetch, parse, snapshot)
   -> Extraction (rules first, LLM-assisted, schema-validated)
   -> Review queue (a human assigns the grade and approves)
   -> Ledger database (claims, entities, rules, signals, providers)
   -> Index (embeddings of approved source passages)
   -> FastAPI (query endpoints, scoring engines, Ask service)
   -> Next.js app (ledger, directory, city lab, simulator, radar, provider proof, ask)
```

Two principles shape the design. First, **scoring is deterministic code**; the LLM never calculates a score or a cost. Second, **the LLM only reads approved, graded passages** and must cite them, so the AI layer inherits the evidence discipline of the rest of the product.

## 5. Feature specifications

Each feature below states its purpose, inputs, exact logic, outputs and edge cases. The numeric defaults are starting priors for the prototype and are listed as configuration so they can be calibrated.

### 5.1 Ledger: how many GCCs does India have

**Purpose.** Show that published counts disagree, why they disagree, and what range survives a given evidence standard.

**Data.** A table of count claims. Each has a publisher, a value, what was counted (companies or operating units), the date of the count, a grade, a relayed flag and a source URL.

**Logic.** Let P be the claims that pass the floor, and also pass the relayed filter when Direct sources only is on.

- Range = minimum to maximum of the values in P.
- Weighted centre = sum of (grade weight × value) divided by the sum of grade weights.
- Best grade in play = the highest grade present in P.
- If P has one member, show “a single source, treat as unconfirmed”. If P is empty, show an explanation and how to lower the floor.

**Display.** A range chart on a horizontal scale with one marker per source, a shaded band for the range, a diamond for the weighted centre, hollow markers for claims below the floor, dashed rings for relayed claims, and a table beneath it. A panel explains why the counts differ: unit of count, date of count and definition of a GCC (a wholly owned captive versus IT-services delivery centres).

**Grade mix.** A stacked bar showing how many records of each grade exist in the whole dataset. It is deliberately honest that few records reach A.

### 5.2 Contradiction register

**Purpose.** Turn disagreement into a feature.

**Data.** Each contradiction has a title, two or more conflicting claims (publisher, text, grade), a reading, and a “to settle it” note naming the primary document that would resolve it.

**Examples the register should hold.** State capital-subsidy figures quoted differently by different publishers; whether a tax holiday still exists for new units; the commencement date and issuing ministry for the data protection rules; a worked tax example that breaks its own salary cap.

**Behaviour.** Claims below the floor appear dimmed rather than removed, so the reader sees what was set aside. Every entry shows the date it was last checked.

### 5.3 Directory: which GCCs exist and which are coming

**Fields.** Company, headquarters country, city, status (Announced, Landed, Expanding, Not a captive), a captive test (Yes, No, Unreviewed), a note, a source label, a source URL, a grade and a relayed flag.

**Captive test.** A GCC is a wholly owned captive serving its parent. IT-services firms and outsourcers running delivery centres for clients are flagged Not a captive and kept in the list, visibly, so they do not inflate counts.

**Filters.** Text search, city, status; records below the floor are hidden and the screen states how many were hidden.

**Lead submission.** A visitor can propose a company with a city, status and an optional source link. Only http and https links are accepted. New leads enter at grade D, captive status Unreviewed, and join the review queue. A reviewer promotes a lead only after finding a primary record.

### 5.4 City Lab: where to set up

**Pillars and scoring.** Each city is scored 0 to 100 on four pillars, then combined with user-set weights.

- **Setup cost:** 100 × (highest year-one cost − this city’s midpoint) ÷ (highest − lowest). Cheaper scores higher.
- **Salary level:** same inverted min-max on the senior-engineer midpoint.
- **Documented incentives:** 30 for a GCC-specific policy, 25 for quantified capital support, 20 for employment-linked support, 25 for other concessions such as power, stamp duty, land or rent. Each component is a fraction from 0 to 1 supplied by the reviewed policy record.
- **Ecosystem density:** 100 × (GCC count in the city) ÷ (highest count among cities).
- Total = sum of (pillar score × weight) divided by the sum of weights.

**Presets.** Balanced (cost 20, salary 10, incentives 25, ecosystem 45), Small centre with 5 to 100 seats (30, 15, 35, 20), and Ecosystem first (10, 5, 10, 75). Weights are sliders in steps of five.

**Honesty rules.** A state whose incentives are not documented in reviewed sources is marked Data gap and is not treated as having no incentives. If the floor is above the grade of the cost data, cost and salary figures are shown faded with a notice. A city with incentive data but no cost data is not ranked.

**Output per city.** Rank, stacked score bar by pillar, total, year-one cost for 50 people, senior engineer pay, claimed GCC count, incentive score with its grade, and a note on scope (for example, which districts or headcounts the incentive applies to).

### 5.5 Setup simulator: what a GCC costs and which rules apply

**Inputs.** City, target headcount (default 150), cost advantage over the same team at headquarters (default 40%), hidden-cost allowance (default 12%), exchange rate (default 85 rupees per US dollar), and the functions the centre will run (technology, finance and accounting, data and analytics, engineering R&D, customer experience, HR and payroll).

**Cost model.** For a city with a year-one benchmark b50 for 50 people (low, middle and high values):

1. Per-person running cost v = 0.70 × b50 ÷ 50.
2. One-time setup S = 0.30 × b50 × (0.5 + 0.5 × headcount ÷ 50).
3. Running cost in year i (i = 0 to 4) = v × headcount × 1.098^i, a pay rise of 9.8% a year.
4. Same team at headquarters in year i = running cost ÷ (1 − cost advantage).
5. Five-year GCC spend = (S + sum of five years of running cost) × (1 + allowance).
6. Monthly cumulative curves for 60 months; break-even is the first month where cumulative headquarters cost reaches cumulative GCC cost, or none within 60 months.
7. Currency display: rupees crore = US$ million × rate ÷ 10.

The page shows year-one spend, five-year GCC spend, five-year spend at headquarters, five-year saving, break-even month and a two-line chart. The model is intentionally plain; every assumption is a control or is printed under the chart.

**Rule-fit panel.** Rules are stored as records with a status (Applies, Check, Closed, Does not fit, Opportunity), text, grade and a condition. The engine evaluates conditions against the inputs. Examples: automatic-route foreign investment for IT and ITeS; STPI registration; zero-rated export of services with a Letter of Undertaking; transfer pricing; a tax holiday that is closed to new units; the employee-cost deduction that does not fit if blended salary exceeds its cap; R&D deduction if Engineering R&D is selected; night-shift rules if Customer experience is selected; a labour-code retrenchment threshold compared with headcount; and the state incentive note for the chosen city. Section 10 lists the official sources each rule points to.

### 5.6 First 90 days

A checklist of dated steps with grade stamps. The reader ticks steps off and sees progress. The sequence is indicative: entity structure and board approval, incorporation and tax numbers, bank account and inward remittance reporting, indirect tax registration and Letter of Undertaking, STPI registration, intercompany services agreement and transfer-pricing method, workspace, employee registrations (provident fund, state insurance, shops and establishments), data protection processes, first offers. Section 10 expands each step.

### 5.7 Signal Radar: who is coming next

**Purpose.** Estimate the probability that a named company will announce a GCC within twelve months, from public signals, before it announces.

**Signals.** Each has a cluster, weight, grade and optional lead-time note.

| Cluster | Signal | Weight | Grade |
| --- | --- | --- | --- |
| Filings | New Indian subsidiary with foreign parent on the company registry | 0.50 | A |
| Filings | Provident fund establishment registration by a foreign-parent-linked entity | 0.55 | A |
| Filings | New STPI unit registration | 0.50 | A |
| Filings | New GST registration in IT and ITeS category | 0.30 | A |
| Government | State agency release or MoU naming the company | 0.60 | A |
| Real estate | Occupier requirement of 50,000+ sq ft in a new city | 0.45 | C |
| Real estate | Leasing absorption spike in a commercial park | 0.20 | C |
| Hiring | 10+ roles posted in a city with no prior presence | 0.30 | C |
| Hiring | First campus drive at a local engineering college | 0.20 | C |
| Hiring | Staffing firm opens a branch for a client mandate | 0.25 | D |
| Investor | India expansion named on earnings calls two quarters running | 0.35 | B |
| Investor | Annual report lists a new India subsidiary | 0.45 | B |
| Informal | Employee-forum posts about a new office | 0.10 | D |
| Informal | City-specific domain registered | 0.08 | D |

**Formula.** Group the ticked signals by cluster. Within a cluster, sort weights from highest to lowest; the first counts at full weight and every further one at 0.6 of its weight. Probability = 1 − product over all counted signals of (1 − adjusted weight). Bands: below 25% Watch, below 55% Warming, below 80% Likely, otherwise Near-certain.

**Design notes.** Signals from different clusters corroborate each other, repeats inside a cluster count for less, signals below the floor are disabled, and the page suggests the best next signal to check. The weights are priors that must be calibrated against announcements that actually happened; section 13 defines the back-test.

### 5.8 Provider Proof: who actually delivers

**Purpose.** Rank advisors, real estate firms, recruiters, payroll and employer-of-record providers, legal and audit firms by what they have delivered.

**Engagement lifecycle.** The provider lists a delivery (client, city, scope, year). The ledger looks for a public footprint such as a company filing or registration that matches. The client then confirms scope and outcome. Footprint plus confirmation counts as proof; a claim with neither stays a claim.

**Score.** Proof ratio = (verified engagements + 1) ÷ (claimed engagements + 2). The added constants keep providers with very few claims from jumping to the top or bottom. The page can show the same providers sorted by proof ratio and, for contrast, by paid tier, to demonstrate how different the order is.

**Rules.** Fee tier is stored but never used in the default ranking. Sample providers in the prototype are fictional and labelled so.

### 5.9 Ask the Ledger

A question box that returns answers carrying their grade. It is retrieval-augmented: it reads only approved passages and records, cites each, states the lowest grade it relied on, and refuses when the best evidence is below the floor. Full design in section 8.

### 5.10 Review and admin workspace

A protected area where reviewers see the queue of extracted claims and submitted leads, open the source snapshot, assign a grade, mark relayed or direct, approve or reject, and publish contradictions. Every change is logged with user, time and reason. A link checker runs weekly and flags dead or moved government URLs.

## 6. Data model

The prototype uses SQLite. Every table has an id, created and updated timestamps. Foreign keys are enforced.

| Table | Key fields | Purpose |
| --- | --- | --- |
| source | id, publisher, publisher\_type (government, regulator, industry body, professional firm, press, vendor), title, url, published\_on, last\_checked\_on, default\_grade | One row per document or page the product relies on |
| source\_snapshot | id, source\_id, fetched\_at, content\_hash, stored\_text\_path | Frozen copy of what was read, so a claim can always be traced back |
| claim | id, subject, metric, value\_number, value\_text, unit, unit\_of\_count, as\_of\_date, grade, relayed, source\_id, snapshot\_id, status (draft, approved, rejected) | Any figure or statement the product shows |
| company | id, name, hq\_country, parent\_company\_id, sector, captive\_status (yes, no, unreviewed), captive\_reason | A company in the directory |
| gcc\_record | id, company\_id, city\_id, status (announced, landed, expanding, not\_captive), note, claim\_id | A company’s presence in a city, tied to the claim that supports it |
| state | id, name, code, has\_gcc\_policy, policy\_status (in force, draft, none documented), policy\_claim\_id | Indian state or union territory |
| city | id, name, state\_id, year1\_cost\_low\_usd\_m, year1\_cost\_high\_usd\_m, senior\_salary\_low\_lakh, senior\_salary\_high\_lakh, gcc\_count, cost\_claim\_id, ecosystem\_claim\_id | City benchmarks for 50 people |
| incentive | id, state\_id, policy\_name, valid\_from, valid\_to, policy\_fraction, capital\_fraction, employment\_fraction, other\_fraction, eligibility\_text, min\_headcount, location\_scope, claim\_id | The four components that feed the incentive pillar |
| rule | id, code, title, text, status\_logic (json), grade, official\_source\_id, applies\_if (json), last\_reviewed\_on | A central or state rule used by the simulator |
| contradiction | id, title, reading, to\_settle, last\_checked\_on | A registered disagreement |
| contradiction\_claim | contradiction\_id, claim\_id | Links the conflicting claims |
| signal\_def | id, cluster, text, weight, grade, lead\_note | The radar signal catalogue |
| signal\_observation | id, company\_id, signal\_id, observed\_on, evidence\_url, snapshot\_id | A signal actually seen for a company |
| provider | id, name, category, fee\_tier, profile\_url | Service provider |
| engagement | id, provider\_id, client\_name, city\_id, scope, year, footprint\_url, footprint\_checked (bool), client\_confirmed (bool) | A claimed delivery and its proof state |
| review\_task | id, kind (claim, lead, engagement, contradiction), payload (json), assigned\_to, state, decision, reason | Human review queue |
| doc\_chunk | id, source\_id, snapshot\_id, chunk\_text, grade, embedding\_id | Passages indexed for retrieval |
| qa\_log | id, question, floor, direct\_only, answer, cited\_chunk\_ids, lowest\_grade\_used, refused, latency\_ms | Every Ask answer, for audit and evaluation |
| audit\_log | id, actor, action, table, row\_id, before, after, at | Change history |

**Constraints worth enforcing.** A claim cannot be approved without a source and a snapshot. A claim cannot carry grade A unless its source publisher\_type is government or regulator and the snapshot proves it was opened. An engagement counts as verified only when both footprint\_checked and client\_confirmed are true. A lead from the public form is created with grade D and captive\_status unreviewed.

## 7. API design

All endpoints return JSON, accept the evidence settings as query parameters (floor = A, B, C or D, direct\_only = true or false), and include in the response how many items were hidden by those settings.

| Method and path | Purpose |
| --- | --- |
| GET /ledger/counts | Count claims, reconciled range, weighted centre, best grade |
| GET /ledger/mix | Number of records per grade across the dataset |
| GET /contradictions | Register of contradictions with claims and readings |
| GET /directory | Search and filter companies (q, city, status) |
| POST /directory/leads | Submit a lead; validates the link scheme; creates a review task |
| GET /cities/rank | Rank cities; takes the four weights and an optional preset name |
| GET /cities/{id} | One city with pillar scores, evidence and notes |
| GET /states | All states with policy status and incentive components |
| POST /simulate | Takes the simulator inputs, returns KPIs, monthly curves, rule-fit items |
| GET /roadmap | The 90-day steps with grades |
| GET /signals | The radar catalogue |
| POST /radar/score | Takes a list of signal ids or a company id, returns probability, band, cluster count, best next check |
| GET /providers | Providers, with sort=proof or sort=tier |
| POST /providers/{id}/engagements | A provider submits a delivery claim |
| POST /engagements/{id}/confirm | Client confirmation by signed link |
| POST /ask | Question in, graded and cited answer or refusal out |
| GET /sources | The source register with last-checked dates |
| Admin: GET /review/tasks, POST /review/tasks/{id}/decision | Review workflow |
| Admin: POST /ingest/run/{job} | Trigger an ingestion job |

**Conventions.** Pydantic models define every request and response. Errors use one envelope with a machine-readable code. Admin routes need an authenticated reviewer role. Rate limiting is applied to the public routes, and the Ask route has a stricter limit and a daily cost cap.

## 8. AI layer

The AI work in the product has four jobs. Each has a different risk, so each is built differently.

### 8.1 Ask the Ledger (retrieval-augmented answering)

**Pipeline.**

1. **Intent check.** A short classification call decides whether the question concerns Indian GCCs, incentives, setup rules, costs or providers. Out-of-scope questions get a polite refusal without further calls.
2. **Structured routing.** If the question can be answered by a deterministic engine (for example, “which city is cheapest” or “what is the range of GCC counts”), call that engine and let the model only phrase the result.
3. **Retrieval.** Embed the question and fetch the top 12 chunks from the vector index, filtered by grade at or above the reader’s floor and, if set, by direct sources only. Re-rank to the best 6.
4. **Grounded generation.** The prompt contains only the retrieved chunks, each labelled with an id, source, date and grade. The model must return JSON with: answer text, a list of claims, each with the chunk ids that support it, and an overall confidence.
5. **Verification pass.** Code checks that every cited chunk id exists in the retrieved set, that every number in the answer appears in a cited chunk, and that the answer states the lowest grade relied on. A failed check triggers one retry and then a refusal.
6. **Refusal rule.** If no chunk at or above the floor supports an answer, reply: the best evidence for this question is below your floor, and show its grade and source with a prompt to lower the floor.

**Prompt rules in the system message.** Answer only from the supplied passages. Never use outside knowledge for figures, dates or legal rules. Quote at most a few words and paraphrase otherwise. If sources conflict, present both and point to the contradiction register. State that the answer is information and not legal or tax advice for any question touching tax, law or compliance.

**Output shown to the reader.** The answer, a line such as “Lowest grade relied on: B”, inline numbered citations that open the source, and a button to lower or raise the floor and re-ask.

### 8.2 Extraction assistant (for reviewers, never auto-publishing)

When an ingestion job fetches a page (a state policy PDF, a press release, a filing summary), the model proposes structured claims using a strict JSON schema: subject, metric, value, unit, as-of date, quoted evidence span, and suggested grade. Validation is mechanical: the evidence span must appear verbatim in the snapshot, the value must appear inside that span, and the unit must belong to an allowed list. Proposals go to the review queue as drafts. A human sets the grade and approves. Nothing the model extracts reaches the public database without that decision.

### 8.3 Captive classifier

A small prompt that reads a company description and proposes captive, not captive or unsure, with a reason. It is advisory. The reviewer decides. Known IT-services and outsourcing firms are held in a reviewed allow/deny list that overrides the model.

### 8.4 Contradiction detector

When two approved claims share a subject and metric but differ in value beyond a tolerance, the system opens a draft contradiction for a reviewer. The model may draft the reading and the “to settle it” note, which the reviewer edits.

### 8.5 Guardrails

- Retrieval filters enforce the floor before the model sees anything, so the model cannot cite what the reader has excluded.
- Prompt-injection defence: fetched pages and user questions are treated as data. Instructions found inside a source are ignored, and sources are passed inside clearly delimited blocks.
- No model call computes a score, a cost or a probability. Those come from the engines in section 5.
- Personal data is not sent to the model. The lead form is validated and stripped before any AI step.
- Cost controls: caching of identical questions, a max token limit, and a daily budget with a graceful message when it is reached.

## 9. Data sources and ingestion pipeline

### 9.1 Source tiers

| Tier | Examples | Default grade |
| --- | --- | --- |
| Government and regulator | Acts, rules, notifications, circulars, state policy documents and government orders, official portals, parliamentary replies, company registry and tax filings that are public | A when opened by the team |
| Industry body and professional firms | Industry association reports, audit, tax, law and real estate advisory publications | B |
| Press | News reports, press releases quoted in news | C |
| Vendor and unsourced | Provider marketing pages, directories, forum posts | D |

### 9.2 Jobs

| Job | Frequency | What it does |
| --- | --- | --- |
| fetch\_sources | Daily | Downloads registered pages, hashes content, stores a snapshot only if it changed |
| diff\_alert | Daily | Flags changes in government policy pages and rule sources for reviewer attention |
| extract\_claims | On new snapshot | Runs the extraction assistant and creates review tasks |
| index\_chunks | On approval | Splits approved snapshots into passages and embeds them |
| link\_check | Weekly | Tests every official URL in the source register and flags dead or moved ones |
| recompute | On approval | Refreshes cached rankings, counts and the contradiction detector |
| signal\_scan | Weekly | Looks for signal evidence (registry filings, state releases, hiring and leasing news) for watch-listed companies and creates observations for review |

### 9.3 Seed data for the prototype

The prototype needs only a thin, honest seed set, entered by hand and graded:

- Five or six published GCC count figures with their units, dates and grades.
- Ten to twenty companies, with a few deliberate not-a-captive examples.
- Nine or more cities across at least six states with cost and salary benchmarks marked as grade D unless a better source is found.
- Incentive records for every state in section 11, each with its policy name and an honest data-gap flag where the policy text has not yet been read.
- Four to six contradictions with the claims written out.
- The radar catalogue from section 5.7.
- Five to six fictional providers, labelled fictional.
- The rule set of section 10.

## 10. The Indian setup process the product must represent

This section is the knowledge base behind the setup simulator, the 90-day checklist and the document library. Each item becomes a rule or roadmap record with an official source and a grade. **Legal positions, thresholds and dates below are the starting description and must be re-read against the current official text before any of it is published as grade A.** The product always shows the date a rule was last reviewed.

**Link status convention.** Each portal below is stored in the source register with a last-checked date. The RBI FIRMS address was confirmed on 19 October 2026. All other addresses are to be confirmed by the weekly link checker at build time, and any that fail are fixed before submission.

### 10.1 Central process, step by step

| Step | What must be done | Forms and registrations | Official portal | Indicative timing |
| --- | --- | --- | --- | --- |
| 1. Foreign investment route | Confirm that IT and IT-enabled services allow 100% foreign investment under the automatic route, so no prior approval is needed. Check whether any investor belongs to a country sharing a land border with India, which needs government approval under the relevant press note. Check sector-specific conditions if the centre serves banking, insurance or securities functions. | Consolidated FDI policy; Non-Debt Instruments Rules under FEMA | dpiit.gov.in, rbi.org.in | Before board approval |
| 2. Choose the entity | Usual choice is a private limited company wholly owned by the foreign parent. Alternatives: LLP, or a branch, liaison or project office, which require RBI approval and have narrower permitted activity. Compare liability, repatriation, tax and compliance. | Board resolution of parent, authorisation letter | mca.gov.in | Day 0 to 15 |
| 3. Directors and signatories | At least two directors with at least one resident in India for 182 days or more in the year. Foreign directors need a Director Identification Number and digital signature certificate, with notarised and apostilled identity documents. | DIN, DSC, DIR-3 | mca.gov.in | Day 5 to 20 |
| 4. Incorporate | Reserve the name and incorporate through the integrated web form that also applies for PAN, TAN, provident fund, state insurance, GST and a bank account where available. | SPICe+ (INC-32), e-MoA (INC-33), e-AoA (INC-34), AGILE-PRO-S (INC-35), stamp duty under the state stamp act | mca.gov.in | Day 10 to 30 |
| 5. After incorporation, company law | File the registered-office verification, appoint the first auditor, and file the declaration that business has commenced. Hold the first board meeting. | INC-22, ADT-1, INC-20A, first board minutes, share certificates | mca.gov.in | Within 30 days for office and auditor; 180 days for commencement |
| 6. Bank account and capital inflow | Open a current account with an authorised dealer bank. Receive the share subscription as inward remittance in foreign currency. Obtain the foreign inward remittance certificate and the bank’s KYC certificate for the remitter. | FIRC, eBIRC / KYC report | rbi.org.in, bank portal | Day 15 to 45 |
| 7. Report foreign investment to RBI | Register the company as an entity on the Foreign Investment Reporting and Management System, then file the single master form for the issue of shares. Allot shares within the prescribed number of days of receiving funds and report within the prescribed number of days of allotment, otherwise late-submission fees apply. Pricing of shares must meet the valuation guidelines, normally with a valuation certificate. File the annual return on foreign liabilities and assets each year. | Entity master, FC-GPR, FLA return, valuation certificate, statutory auditor certificate | firms.rbi.org.in (confirmed 19 Oct 2026) | Within 30 days of allotment, as per current rules; verify |
| 8. Indirect tax | Register for GST. Export of services is zero-rated, and refunds of input credit require a Letter of Undertaking filed each year. Check carefully whether any service could be classed as an intermediary service, which is treated differently. | GST REG-01, LUT (RFD-11), refund application (RFD-01) | gst.gov.in | Day 20 to 45 |
| 9. Direct tax | Choose the corporate tax regime and confirm the current rate. Set up TDS deduction and deposit. For payments abroad, file the remittance declarations. Treat the in-house R&D deduction as an opportunity only if the centre does approved R&D, and the SEZ income-tax holiday as closed to units that began after the sunset date. | TAN, TDS returns, Form 15CA and 15CB, advance tax challans | incometax.gov.in | Ongoing from first payment |
| 10. Transfer pricing | The intercompany services agreement and pricing method are the single most important tax decision for a captive. Benchmark the margin, document it, obtain an accountant’s report each year, and check whether a safe harbour is available. Also assess permanent-establishment risk for parent employees who travel to India. | Intercompany agreement, benchmarking study, Form 3CEB | incometax.gov.in | Day 30 to 60, then annually |
| 11. Export incentives: STPI, SEZ or IFSC | STPI registration is optional but common for software and IT services exporters. SEZ units are set up with the Development Commissioner, subject to the SEZ rules. A centre doing financial services work may consider an IFSC unit in GIFT City. Compare benefits against compliance cost. | STPI registration, SEZ unit approval, IFSCA authorisation | stpi.in, sezindia.gov.in, ifsca.gov.in | Day 30 to 75 (STPI allow 6 to 8 weeks) |
| 12. Employer registrations | Provident fund registration, state insurance where thresholds apply, state shops and establishments registration, professional tax registration where the state levies it, labour welfare fund where applicable, gratuity and maternity-benefit compliance. | EPFO registration, ESIC registration, shops and establishments licence, professional tax enrolment | epfindia.gov.in, esic.gov.in, labour.gov.in, shramsuvidha.gov.in, state portals | Day 45 to 90 |
| 13. Labour codes | The four labour codes (wages, social security, industrial relations, occupational safety and health) replace many older laws. Confirm the date they came into force, the state rules that complete them, thresholds that affect a centre of your size, and rules on night shifts, contracts and working hours. | Registers, policies, standing orders where required | labour.gov.in and state labour department | Day 45 to 90 |
| 14. Workplace conduct | An internal committee under the sexual-harassment prevention law where the employee threshold is met, with annual reporting to the district authority. | Policy, committee constitution, annual report | wcd.gov.in, state portals | Before first hire |
| 15. Foreign staff | Employment visa for expatriates and a registration with the foreigners regional registration office after arrival, within the time limit on the visa. | Employment visa, e-FRRO registration | indianvisaonline.gov.in, indianfrro.gov.in, boi.gov.in | Start at Day 30 |
| 16. Data protection and cyber security | Build consent, notice, purpose limitation, retention and breach processes for personal data under the data protection act and its rules, whose obligations phase in; confirm the dates from the notification. Follow the national incident-reporting directions for cyber incidents, including reporting windows and log retention. Sector regulators add duties for financial services work. | Privacy notices, data-processing agreements, incident response plan | meity.gov.in, cert-in.org.in | Day 60 to 90 |
| 17. Imports and equipment | If importing equipment, obtain an importer-exporter code and check customs duty exemptions available through STPI or an SEZ. | IEC, bill of entry | dgft.gov.in, icegate.gov.in | As needed |
| 18. Premises | Choose managed space or a lease. Check lease stamp duty and registration, fire safety, occupancy certificate, trade licence and local municipal approvals. These are state and city rules. | Lease deed, fire NOC, occupancy certificate | state and municipal portals | Day 45 to 90 |
| 19. Single-window support | Use the national single window to track applications for clearances, and the state single window for state approvals and incentive claims. | Unified applications | nsws.gov.in, state single-window portals | Throughout |
| 20. Promotion and help | National investment promotion agency for guidance and state liaison. | Enquiry | investindia.gov.in | Before step 2 |

### 10.2 Recurring compliance calendar (indicative)

| When | Obligation |
| --- | --- |
| Monthly | TDS deposit; GST returns; provident fund and state insurance contributions; professional tax where applicable |
| Quarterly | TDS returns; advance tax instalments; board meeting at least once in each period as the Companies Act requires |
| Annually | Annual accounts and annual return with the registrar; director KYC; auditor reappointment as required; income-tax return, with the later due date that applies when international transactions exist; transfer pricing report; annual return on foreign liabilities and assets to RBI; Letter of Undertaking under GST; significant-beneficial-owner declarations; internal committee report under the harassment-prevention law; corporate social responsibility check if thresholds are crossed |
| On events | Change of directors; change of registered office; further share issue (new FIRMS filing); new location (new registrations); cyber incident (report within the national window); data breach (notify as the data protection rules require) |

The product stores each obligation as a rule with a trigger (headcount, turnover, state, function, foreign ownership), so the simulator can say which apply to the chosen setup and the 90-day checklist can be generated from them.

## 11. State-by-state policy coverage

The product must cover every state that has a dedicated GCC policy, every major hub state, and show an honest status for the rest. As of the reports read on 19 October 2026, dedicated GCC policies were reported for Karnataka, Maharashtra, Haryana, Uttar Pradesh, Gujarat, Rajasthan, Madhya Pradesh and Andhra Pradesh by a real estate advisory report of August 2026, and Odisha’s policy was reported for five years from 31 December 2025 by a law-firm update; Bihar is also reported by law-firm updates; Tamil Nadu was described as having employee-linked incentives; Telangana and Delhi as having frameworks or incentives; and Kerala as having a draft. Because these statuses change, the product stores a status and a source for each, never a hard-coded list.

### 11.1 What is captured for every state

| Field | Notes |
| --- | --- |
| Policy name, notification date, validity period | Primary text if found, else grade of the best secondary source |
| Nodal department and single-window portal | For applications and claims |
| Eligibility | Minimum investment, minimum jobs, minimum period, definition of a GCC, whether IT-services firms qualify |
| Location scope | Which districts or tiers; any carve-out for the main metro; uplift for smaller cities |
| Capital support | Percentage, cap, which assets, conditions |
| Employment-linked support | Per-job payments, provident fund reimbursement, wage support, additional for women or local hires |
| Operating-cost support | Rent, lease, power, stamp-duty or registration refunds, land concessions |
| Skilling and talent | Training subsidies, college partnerships |
| Process | Approval time promised, single window, escalation, clawback rules, transfer of incentives |
| State compliance variables | Shops and establishments rules, professional tax, labour welfare fund, night-shift rules, working hours, lease stamp duty |
| Data status | Documented, partly documented, draft, none documented, or conflicting (links to the contradiction register) |

These map straight onto the incentive pillar: policy existence (30 points), capital support (25), employment-linked support (20), other concessions (25).

### 11.2 State register and official starting points

The addresses below are the starting set to be tested by the link checker. Where a state website has changed, search the state’s home page for the investment or IT department.

| State | Reported GCC policy status | Single-window or investment portal | State home page |
| --- | --- | --- | --- |
| Karnataka | Dedicated policy, 2024 to 2029 | investkarnataka.co.in | karnataka.gov.in |
| Maharashtra | Dedicated policy | maitri.maharashtra.gov.in | maharashtra.gov.in |
| Telangana | Framework; dedicated policy reported as being formulated | ipass.telangana.gov.in | telangana.gov.in |
| Tamil Nadu | Employee-linked incentives | guidance.tn.gov.in | tn.gov.in |
| Andhra Pradesh | Dedicated policy | apindustries.gov.in | ap.gov.in |
| Gujarat | Dedicated policy; GIFT City for financial services | gujaratindustry.gov.in, giftgujarat.in | gujaratindia.gov.in |
| Uttar Pradesh | Dedicated policy, 2024 | invest.up.gov.in, niveshmitra.up.nic.in | up.gov.in |
| Haryana | Dedicated policy | investharyana.in | haryana.gov.in |
| Delhi | Framework or incentives reported | delhi.gov.in | delhi.gov.in |
| Rajasthan | Dedicated policy, with two incentive categories | rajudyogmitra.rajasthan.gov.in | rajasthan.gov.in |
| Madhya Pradesh | Dedicated policy | invest.mp.gov.in | mp.gov.in |
| Odisha | Dedicated policy from 31 December 2025, five years | investodisha.gov.in | odisha.gov.in |
| Bihar | Reported by law-firm updates | state portal | state.bihar.gov.in |
| Kerala | Draft policy reported | industry.kerala.gov.in | kerala.gov.in |
| West Bengal | No dedicated policy documented | wbidc.com | wb.gov.in |
| Punjab | No dedicated policy documented; general IT and industrial policy | investpunjab.gov.in | punjab.gov.in |
| Other states and union territories (Assam, Chhattisgarh, Goa, Himachal Pradesh, Jharkhand, Uttarakhand, Jammu and Kashmir, Puducherry, the north-east states and others) | Mark as none documented until a source is read; capture the general IT, industrial or startup policy where it gives concessions | state portal | state home page |

The prototype ranks only cities for which there is cost data (nine or more across six or more states) and shows every other state in the incentive register with its status, so that no state is invisible.

## 12. Document library (attachments)

The product includes a library of official forms, guides and notifications, each stored with title, issuing authority, purpose, step it belongs to, source link, last-checked date and grade. Where a form can only be downloaded from an official portal, the library links to the portal and stores a checksum and a text snapshot rather than rehosting the file.

| Group | Documents |
| --- | --- |
| Company law | SPICe+ (INC-32) guide, e-MoA (INC-33), e-AoA (INC-34), AGILE-PRO-S (INC-35), DIR-3 / DIN application, INC-22 registered office, ADT-1 auditor appointment, INC-20A commencement, annual forms AOC-4 and MGT-7, beneficial owner forms |
| Foreign exchange | RBI user manual for the single master form, FC-GPR, FC-TRS, FLA return guide, pricing guidelines, FEMA Non-Debt Instruments Rules |
| Tax | GST registration and LUT forms, refund application guide, TDS return guides, Form 15CA/15CB, Form 3CEB and transfer pricing rules |
| Export regimes | STPI registration guide, SEZ unit approval procedure, IFSCA authorisation guide |
| Labour and employment | EPFO and ESIC registration guides, labour codes text and state rules, gratuity and maternity-benefit summaries, internal committee guide |
| Data and cyber | Data protection act and rules, national incident-reporting directions, sector regulator circulars where relevant |
| Immigration | Employment visa guide, e-FRRO guide |
| State | Each state policy document and government order, single-window guides, shops and establishments rules, professional tax and welfare-fund notices |
| Templates written by the team | Intercompany services agreement outline, board resolution for setup, authorisation letter, 90-day plan template, compliance calendar, data-processing addendum outline, offer letter checklist |

Templates are original text written for the product, labelled as illustrative and not legal advice. Nothing is copied from third-party websites.

## 13. Testing and evaluation

### 13.1 Engine tests with known answers

The scoring engines are pure functions, so each gets unit tests with hand-calculated expected values. With the seed data described in section 9.3 and the default settings, the following must hold.

| Engine | Case | Expected result |
| --- | --- | --- |
| Ledger reconcile | Five count figures of 1,600 (D), 1,700 (D), 1,760 (A, relayed), 2,000 (D) and 2,117 (B, relayed); floor D, direct off | Range 1,600 to 2,117; weighted centre about 1,869 |
| Ledger reconcile | Same data, floor B | Range 1,760 to 2,117; centre about 1,913 |
| Ledger reconcile | Same data, floor B, direct sources only | No claim passes; the empty-state message appears |
| Ledger reconcile | Floor A | One claim passes; shown as a single unconfirmed source |
| Setup simulator | City with year-one benchmark midpoint US$2.0M for 50 people, 150 people, 40% advantage, 12% allowance | Year-one spend about US$6.05M; five-year GCC spend about US$29.9M; same team at headquarters about US$42.6M; saving about US$12.6M; break-even in month 8 |
| Signal radar | Signals: subsidiary on registry (0.50), ten-plus roles (0.30), large occupier requirement (0.45), earnings-call mentions (0.35), each in a different cluster | Probability about 87%; band Near-certain |
| Signal radar | Two signals in one cluster, weights 0.50 and 0.55 | Counted as 0.55 and 0.6 × 0.50 = 0.30, giving about 69% |
| Provider proof | Providers with (claimed, verified) of (40, 31), (120, 38), (60, 51), (200, 44), (25, 22), (35, 16) | Order by proof ratio: the 25-claim provider (0.852), the 60-claim provider (0.839), the 40-claim provider (0.762), the 35-claim provider (0.459), the 120-claim provider (0.320), the 200-claim provider (0.223) |
| City ranking | Weights all zero | Total weight is treated as 1 so there is no divide-by-zero; every score is 0 |
| Directory | Lead with a link that does not start with http or https | Link stored empty; lead still created as grade D, unreviewed |

Property tests also run: scores are always between 0 and 100; raising the floor never increases the number of visible items; raising the cost advantage never lowers the five-year saving; weights that are scaled together give the same ranking.

### 13.2 Radar calibration (back-test)

The radar weights are priors, not facts. To calibrate them, assemble a labelled set of companies that announced a GCC in India in the last few years and a comparable set that did not. For each, record which signals were observable in the twelve months before the event. Fit a simple logistic model or tune weights to maximise rank quality, and publish the results with their sample size and the caveat that signals are correlated. Report precision at the top decile and a calibration plot. Until this is done, the interface labels the radar as an uncalibrated estimate.

### 13.3 Evaluation of the AI layer

Create an evaluation set of at least 60 questions with expected behaviour.

| Category | Count | What is checked |
| --- | --- | --- |
| Answerable from approved sources | 25 | Answer is correct, every number appears in a cited chunk, citations are valid |
| Conflicting sources | 10 | Both claims are shown, the contradiction is referenced, no single figure is asserted as fact |
| Below the floor | 10 | The system refuses and names the grade and source of the best evidence |
| Out of scope | 5 | Polite refusal, no retrieval |
| Prompt injection | 5 | Instructions inside a source or a question are ignored |
| Legal or tax advice requests | 5 | The answer gives information, cites sources and includes the not-advice notice |

Metrics: citation validity rate (target 100%), numeric grounding rate (every number found in a cited chunk, target 100%), correct refusal rate on below-floor and out-of-scope questions (target at least 95%), answer correctness judged by a reviewer on a three-point scale, latency and cost per answer. The evaluation runs in the continuous integration job and a drop in any target blocks the build.

### 13.4 Other tests

- API contract tests generated from the OpenAPI schema.
- End-to-end tests (Playwright) for: change the floor and see the headline range change; hide-count messages appear; submit a lead and see it appear as unreviewed; run the simulator and see the break-even; tick signals and see the probability; sort providers by proof and by tier; ask a question and open a citation.
- Accessibility: keyboard navigation of the floor control, tabs, sliders and tables; visible focus; colour is never the only carrier of grade (the letter is always printed); contrast checked in light and dark themes.
- Link health: the weekly checker’s output is a test fixture for the source register.

## 14. Prototype scope: what must work

The assessment asks for a prototype that works rather than a complete product. The minimum that must run end to end:

1. **Header with the evidence floor and the Direct sources only switch**, affecting every screen.
2. **Ledger** with the range chart, weighted centre, grade mix and contradiction register.
3. **Directory** with search, filters, the captive test, hide counts and lead submission.
4. **City Lab** with adjustable weights, three presets and the transparent incentive scoring.
5. **Setup simulator** with the cost model, the two-line chart and the rule-fit panel.
6. **First 90 days** checklist with progress.
7. **Signal Radar** with the catalogue, probability, band, best next check and a demo company.
8. **Provider Proof** with the toggle between proof order and fee-tier order and the explanation of how an engagement becomes proof.
9. **Ask the Ledger** with retrieval, citations, the lowest-grade line and refusal below the floor.
10. **Source register and document library** pages, with grades and last-checked dates.

Nice to have if time allows: the reviewer queue, the weekly ingestion job, a workspace finder for small centres of 5 to 100 seats, and exports of any view to PDF.

**Definition of done.** Everything in the list runs from one command; seed data loads automatically; all tests in section 13 pass; every figure on screen shows a grade and a source; a reviewer can read the data-status disclaimer on every page; no external link points to code repositories or to automatically generated demo sites.

## 15. Frontend, security, deployment and build plan

### 15.1 Frontend design

- **Layout.** A header with the product name, the evidence floor control and the Direct sources only switch, then tabs for Ledger, Directory, City Lab, Setup simulator, Radar, Provider Proof and Ask. The floor control stays visible while scrolling on large screens.
- **State.** The floor and direct-only switch live in a global store and in the URL query string so that any view is shareable. Each tab is its own route.
- **Components.** GradeStamp (letter in a coloured square, dashed edge if relayed), FloorBar, RangeChart, ScoreBars, CostChart, ProbabilityMeter, RuleItem, SourceLink, HiddenCount, EmptyState, ContradictionCard, Checklist.
- **Visual language.** A restrained palette with four grade colours that stay distinguishable in light and dark themes, a monospaced face for figures, and a condensed display face for headings. No decoration that does not carry information.
- **Responsive behaviour.** Tables scroll inside their own container, charts scale with their viewport, and the floor control collapses into a compact bar on phones.
- **Empty and error states.** Every screen explains what happened and how to change the floor or retry.

### 15.2 Security and privacy

- Admin routes use authenticated sessions with role checks; passwords are hashed with a modern algorithm.
- All inputs validated by Pydantic; output escaped on the client; link schemes restricted to http and https.
- API keys in environment variables only; the browser never calls the LLM.
- Rate limits and a daily LLM budget; request size limits.
- Lead submissions collect no personal data beyond what the form asks, and the privacy notice says how it is used. The product follows its own advice on consent, notice and retention.
- Audit log for every data change; backups of the database and the vector index.

### 15.3 Repository layout

```
gcc-ledger/
  apps/
    api/            FastAPI application
      engines/      reconcile, city_score, simulate, radar, proof
      routers/      ledger, directory, cities, simulate, radar, providers, ask, review
      ai/           ask_service, extraction, classifier, prompts, verify
      models/       SQLAlchemy models and Pydantic schemas
      ingest/       jobs and parsers
    web/            Next.js application
      app/          routes for each tab
      components/   shared components
      lib/          API client, formatters
  data/
    seed/           graded seed data files
    snapshots/      stored source text
  eval/             evaluation questions and runner
  tests/            unit, contract, end-to-end
  docs/             this document, data dictionary, rule register
  docker-compose.yml
  .env.example
```

### 15.4 Environment variables

| Name | Purpose |
| --- | --- |
| OPENAI\_API\_KEY | LLM and embedding calls |
| DATABASE\_URL | SQLite file path now, PostgreSQL later |
| VECTOR\_INDEX\_PATH | Location of the Chroma or FAISS index |
| ADMIN\_JWT\_SECRET | Signing key for reviewer sessions |
| DAILY\_LLM\_BUDGET\_USD | Cost cap for the Ask route |
| FETCH\_USER\_AGENT | Identifies the ingestion jobs politely to the sites they read |

### 15.5 Build plan

| Phase | Work | Output |
| --- | --- | --- |
| 1. Foundations | Data model, seed data, graded source register, the five engines with unit tests | Engines pass the section 13.1 tests |
| 2. API | Routers, evidence filtering, hide counts, OpenAPI | Every endpoint of section 7 returns correct data |
| 3. Interface | Header, floor control, Ledger, Directory, City Lab, Simulator, Roadmap, Radar, Provider Proof | All screens work with the seed data |
| 4. AI layer | Embedding of approved passages, retrieval with grade filtering, grounded generation, verification, refusal | Ask the Ledger passes the evaluation set |
| 5. Pipeline | Fetch, snapshot, extraction proposals, review queue, link checker | A new source can be added and reviewed end to end |
| 6. Hardening | Accessibility, end-to-end tests, rate limits, error states, performance | Definition of done in section 14 |
| 7. Story | Deck, demo script, data-status page | Submission pack |

For a short assessment window, phases 1 to 4 and 6 are the priority, and phase 5 can be shown as a designed workflow with one job running.

### 15.6 Deployment

Docker Compose with two services and a mounted volume for the database and index. A hosted deployment needs HTTPS, environment secrets, a scheduled job runner and daily backups. The seed loader is idempotent.

## 16. Deck outline for the assessment

| Slide group | Content |
| --- | --- |
| The problem | Define the players (parent companies, advisors, lawyers, auditors, real estate firms, recruiters, payroll and employer-of-record providers, state governments, service providers). Show who is hurt by the information gap and how: new entrants decide on referrals, advisors cannot defend a number, states cannot be compared fairly, providers who deliver lose to providers who market. Show the five different published counts, from about 1,600 to over 2,100, as the proof that even the basics are unsettled. State what people do today: ask peers, buy advisory reports, hire a consultant whose fee depends on the decision. |
| The opportunities | Rank six: (1) a graded registry of GCCs, (2) rule and incentive intelligence with contradictions, (3) location and cost decision tools, (4) pre-announcement signals, (5) provider proof, (6) workspace and talent data. Argue that 1 to 3 matter most because they serve the first customer and build trust, and 5 is the long-term advantage because it cannot be bought. |
| The solution | What is built: the evidence floor, the ledger, the directory with the captive test, City Lab, the simulator and 90-day plan, the radar, Provider Proof, and Ask the Ledger. For whom first: a foreign company planning a centre of 5 to 300 people. |
| The positioning | Neutral, sourced and open about gaps, in a market where advice is often a sales funnel. Why each stakeholder comes: new entrants for numbers they can trust, advisors for a defensible reference, real estate firms for demand signals, states for fair and corrected records, providers for a ranking based on delivery. |
| Demonstration | The two-minute story: raise the floor and watch the headline range narrow; open a contradiction; run a 150-person centre; tick four signals; sort providers by proof; ask a question below the floor and see the refusal. |
| Limits and next steps | Data coverage, calibration of the radar, reviewer capacity, the path to primary-source ingestion, and business model options that do not compromise neutrality. |

## 17. How the project demonstrates AI engineering skills

No job description was supplied with the assessment, so this mapping uses the skills an AI engineer intern role typically asks for. Paste the actual description and this table should be adjusted to match it line by line.

| Skill an intern role usually expects | Where it appears |
| --- | --- |
| Building a working end-to-end product, not a notebook | Full stack in sections 3 to 7 |
| LLM application design with retrieval | Section 8.1 |
| Structured outputs and schema validation | Sections 8.1 to 8.3 |
| Prompt design and injection defence | Sections 8.1 and 8.5 |
| Evaluation of AI behaviour with numbers | Section 13.3 |
| Knowing when not to use a model | Scoring engines are deterministic code; the model never computes figures |
| Data pipelines and quality control | Section 9 and the review queue |
| API design, testing and documentation | Sections 7 and 13 |
| Cost, latency and safety controls | Sections 8.5 and 15.2 |
| Communicating a product idea | Section 16 |

## 18. Risks, legal notice and limitations

| Risk | Mitigation |
| --- | --- |
| Policies change faster than the data | Daily change detection on policy pages, last-reviewed dates on every rule, weekly link checks |
| A wrong figure damages trust | Grades, floor, refusal below the floor, contradiction register, human review before publication |
| Models invent figures | Retrieval limited to approved chunks, numeric grounding check, scores never produced by the model |
| Sparse primary data | The product says so openly; the grade mix chart shows how little is grade A |
| Provider claims are gamed | Footprint and client confirmation required; fee tier excluded from default rank |
| Neutrality is questioned | No paid placement; funding and conflicts disclosed |
| Legal exposure | Every page states that the content is information and not legal, tax or investment advice, and that users should consult a qualified adviser and the official source |

**Notice shown in the product.** Figures are claims read from public sources on the date shown and are not independently verified unless graded A. Sample providers are fictional. Nothing in this product is legal, tax or financial advice.

## Appendix A. Glossary

| Term | Meaning |
| --- | --- |
| GCC | Global Capability Centre: an offshore captive centre owned by a global company to serve itself |
| Captive | A centre that serves its own parent, as opposed to an outsourcer serving clients |
| FDI automatic route | Foreign investment that needs no prior government approval, only reporting |
| FIRMS | The Reserve Bank’s system for reporting foreign investment |
| SPICe+ | The integrated incorporation form on the company registry portal |
| STPI | Software Technology Parks of India, the export promotion body for software and IT services |
| LUT | Letter of Undertaking used by exporters of services to avoid paying tax on exports and to claim refunds |
| EOR | Employer of record: a provider who legally employs staff on a company’s behalf |
| Evidence floor | The lowest grade of evidence a reader accepts |
| Relayed | A claim read on another page without opening the original |
| Proof ratio | Smoothed share of a provider’s claimed deliveries that are verified |
