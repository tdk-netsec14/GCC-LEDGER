# GCC Ledger: Comprehensive UI/UX Redesign Plan

## 1. Executive Summary & Inputs
This redesign plan maps the entire front-end user experience of **GCC Ledger** to the **Obsidian Ledger** design system created in the Stitch project **"GCC Ledger UI/UX System"** (`projects/16618240316943021035`).

### Inputs & Discovery Verification
- **Stitch Project:** `projects/16618240316943021035` ("GCC Ledger UI/UX System")
- **Stitch MCP Tools:** `list_projects`, `get_project`, `list_screens`, `get_screen`, `list_design_systems`, `get_design_system`, `edit_screens`
- **Specification:** `docs/BUILD_DOCUMENT.md` (Version 1.0)
- **Target Application:** `apps/web` (Next.js 14, TypeScript, Tailwind CSS)
- **All Screens & Assets:** Retrieved and archived locally under `docs/stitch_screens/` with both high-resolution layout renders and production-tested HTML/CSS templates.

---

## 2. Design Tokens: Obsidian Ledger

### 2.1 Theme & Colors
The design system operates on dual themes (Deep Obsidian Dark and High-Clarity Light) anchored in CSS variables and mapped into Tailwind tokens.

| Token | Dark Theme Value | Light Theme Value | Usage |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#0B1118` | `#F8FAFC` | Primary viewport background |
| `--bg-subtle` | `#0F1722` | `#F1F5F9` | Sidebar and section backing |
| `--surface-card` | `#151D28` | `#FFFFFF` | Standard card and table containers |
| `--surface-card-elevated`| `#1A2332` | `#FFFFFF` | Hover cards, modals, popovers |
| `--border-subtle` | `#222F40` | `#E2E8F0` | Structural contours and grid dividers |
| `--border-active` | `#33445C` | `#CBD5E1` | Focused inputs, active tabs |
| `--primary` | `#7C71F5` | `#6366F1` | Electric Indigo: primary actions & key metrics |
| `--primary-hover` | `#8B80F9` | `#4F46E5` | Interactive hover |
| `--primary-subtle` | `rgba(124, 113, 245, 0.15)` | `rgba(99, 102, 241, 0.1)` | Active item tint |
| `--secondary` / `--success` | `#10B981` | `#059669` | Emerald: verified status, Grade A |
| `--secondary-subtle` | `rgba(16, 185, 129, 0.14)` | `rgba(5, 150, 105, 0.1)` | Verified chip background |
| `--warning` / `--tertiary` | `#F59E0B` | `#D97706` | Amber: cautionary thresholds, Grade C |
| `--warning-subtle` | `rgba(245, 158, 11, 0.14)` | `rgba(217, 119, 6, 0.1)` | Warning badge background |
| `--danger` / `--error` | `#EF4444` | `#DC2626` | Coral: failed checks, exclusions |
| `--danger-subtle` | `rgba(239, 68, 68, 0.14)` | `rgba(220, 38, 38, 0.1)` | Danger badge background |
| `--text-primary` | `#F8FAFC` | `#0F172A` | Headlines, primary metrics |
| `--text-secondary` | `#94A3B8` | `#475569` | Column headers, descriptions |
| `--text-muted` | `#64748B` | `#94A3B8` | Inactive states, placeholders |

### 2.2 Typography Hierarchy
- **Primary Typeface:** `Inter` (neutral geometric clarity for metrics, headlines, and narrative copy).
- **Secondary Typeface:** `Geist` (crisp technical legibility for micro-badges, uppercase tracking, tags, and monospaced codes).
- **Tabular Figures:** `font-variant-numeric: tabular-nums` enforced on all numbers, tables, timestamps, and financial readouts.

| Style Name | Size | Line Height | Weight | Tracking | Font Family |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 3.00rem (48px) | 1.15 | 700 | -0.03em | Inter |
| `headline-xl` | 2.00rem (32px) | 1.25 | 600 | -0.025em | Inter |
| `headline-xl-mobile` | 1.50rem (24px) | 1.30 | 600 | -0.02em | Inter |
| `headline-lg` | 1.25rem (20px) | 1.35 | 600 | -0.015em | Inter |
| `headline-md` | 1.125rem (18px) | 1.40 | 500 | -0.01em | Inter |
| `body-lg` | 1.00rem (16px) | 1.50 | 400 | 0.00em | Inter |
| `body-md` | 0.875rem (14px) | 1.50 | 400 | 0.00em | Inter |
| `body-sm` | 0.75rem (12px) | 1.50 | 400 | 0.01em | Inter |
| `label-lg` | 0.875rem (14px) | 1.25 | 500 | 0.00em | Geist |
| `label-md` | 0.75rem (12px) | 1.20 | 500 | 0.02em | Geist |
| `label-caps` | 0.6875rem (11px)| 1.15 | 600 | 0.06em uppercase | Geist |

### 2.3 Radii, Spacing & Motion
- **Radii:** `sm: 4px`, `DEFAULT: 8px`, `md: 12px`, `lg: 16px`, `xl: 24px`, `full: 9999px`.
- **Spacing Scale:** `space-xs: 4px`, `space-sm: 8px`, `space-md: 14px`, `space-lg: 20px`, `space-xl: 28px`, `space-2xl: 40px`.
- **Grid Layout:** 12-column fluid grid, `gutter: 20px`, `margin: 28px` (desktop), single-column stacked with horizontal scroll views on mobile.
- **Motion:** 200ms `cubic-bezier(0.16, 1, 0.3, 1)` transitions; strictly disabled when `@media (prefers-reduced-motion: reduce)` is active.

---

## 3. Stitch Screen to Route Mapping

| # | Stitch Screen & ID | Target Route | Page Title / Purpose | Real API Integration |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `d795a66972014a509a082949c0262b60` | `/` | Executive Dashboard & Ecosystem Overview | `GET /ledger/counts`, `GET /cities/rank`, `GET /states`, `GET /contradictions` |
| 2 | `996989769c1347d9bce39e7423625c57` / `6e8f591173ac4f87bd3ca02e0d5837f3` | `/ledger` | National GCC Ledger & Reconciled Range | `GET /ledger/counts`, `GET /ledger/mix`, `GET /contradictions` |
| 3 | `d1bba0190523479a91b81281c0d571f7` | `/directory` | Verified GCC Entity Directory | `GET /directory`, `POST /directory/leads` |
| 4 | `0124ef1bb55c4699a74182633ef97382` | `/cities` | City Lab: 4-Pillar Site Selection | `GET /cities/rank`, `GET /cities/{id}` |
| 5 | `6764893f0a5e414fa1c747cfb3eb8e3f` | `/simulate` | Setup Simulator & 90-Day Roadmap | `POST /simulate`, `GET /roadmap` |
| 6 | `5b77f83ba5ef4e69a36817e942ca76e8` | `/radar` | Signal Radar (Corroborated Probability) | `GET /signals`, `POST /radar/score` |
| 7 | `aba59e7f23a943cebb2db2a45390ecee` | `/providers` | Provider Proof: Track Record Audits | `GET /providers`, `POST /providers/{id}/engagements` |
| 8 | `09a1e59b62264a4facc2dea6132a5604` | `/ask` | Ask the Ledger (Grounded AI with Citations) | `POST /ask` |
| 9 | `b9ffa110be0b492e9072414e8921fdd6` | `/states` | State Policy Register & Subsidies | `GET /states` |
| 10 | `c14883f7ba6b437290e8d46265df5273` | `/documents` | Statutory Filings & Setup Guide Library | `GET /documents`, `GET /roadmap` |
| 11 | Obsidian Design | `/sources` | Audited Source Register & Link Audits | `GET /sources` |
| 12 | Obsidian Design | `/review` | Reviewer Queue & Contradiction Editor | `GET /review/tasks`, `POST /review/tasks/{id}/decision` |
| 13 | Obsidian Design | `/login` (Modal & Route) | Reviewer Authentication | Internal JWT Auth |
| 14 | Obsidian System | `/preview` | Component Showcase (Both Themes, All States) | Static Component Explorer |

---

## 4. Component Inventory

### 4.1 Existing Components to Restyle
- **`AppShell`**: Left sidebar with 5 grouped navigation clusters (`Overview`, `Explore`, `Plan`, `Intelligence`, `Reference`), header with breadcrumbs, compact floor control, search trigger, theme toggle, and mobile sheet.
- **`FloorBar` & `CompactEvidenceFloor`**: Integrated global evidence controller with A/B/C/D segmented trigger, "Direct sources only" switch, "X / Y pass floor" live metric, and explanation drawer.
- **`GradeStamp`**: Letter always printed, 3 size variants (`sm`, `md`, `lg`), solid border for direct, dashed border for relayed.
- **`HiddenCount`**: Obsidian notification badge showing items excluded by floor without silent loss of data.
- **`SourceLink`**: External citation link with primary icon and secure attributes.
- **`RangeChart`**: SVG range visualization matching Stitch with diamond centre, shaded confidence interval, and hollow markers for excluded items.
- **`CostChart`**: 60-month cumulative expenditure curves with break-even marker and tooltip.
- **`ScoreBars`**: Normalized 4-pillar stacked score bar with pillar color tokens.
- **`ProbabilityMeter`**: Radial SVG arc gauge with dynamic probability band styling.
- **`ContradictionCard`**: Side-by-side claim comparison with settlement document citation.
- **`Checklist`**: 90-day procedural milestone list with interactive completion checkboxes.
- **`DataStatusBanner`**: Disclaimer notice ("Not legal or tax advice; based on reviewed evidence").
- **`EmptyState`**: Minimalist empty container with prompt to lower evidence floor.

### 4.2 Shared Components to Create
- **`Table`**: Enterprise data table with sticky headers, column sorting, dimmed rows for sub-floor records, and mobile card mode.
- **`Button`**: Primary (electric indigo), Ghost/Outlined, Danger, and Segmented Control states.
- **`Input` & `Textarea`**: 38px height, dark recessed canvas, 2px focus ring, error message states.
- **`Slider`**: Range input with live percentage pill, step constraints, and total-weight limiter.
- **`Toggle`**: Accessible toggle switch for "Direct sources only" and theme switching.
- **`Badge` & `StatusPill`**: Pill-shaped status indicator (`Completed`, `In Progress`, `Warning`, `Overdue`, `Captive`).
- **`Card`**: Surface container with Level 1 (`151D28`) background and 1px `222F40` contour.
- **`Modal` & `Drawer`**: Level 2 elevated flyout with dark backdrop blur and keyboard dismissal.
- **`Toast`**: Transient notification banner for actions (leads submitted, links copied).
- **`Skeleton`**: Recessed shimmering placeholder matching exact card and row geometries.
- **`ErrorState`**: Actionable error container with retry trigger.
- **`ThemeToggle`**: Light/Dark toggle preserving system preference without flash of unstyled content.

---

## 5. Implementation Roadmap & Order of Work

1. **Step 1: Tokens & Foundational System**
   - Create `apps/web/lib/tokens.ts` (TypeScript token definitions) and update `apps/web/app/globals.css` with CSS custom properties.
   - Configure `apps/web/tailwind.config.js` to inherit the Obsidian Ledger color palette, typography scale, and spacing tokens.
   - Embed font fallback declarations for `Inter` and `Geist`.
   - Build all shared components in `apps/web/components/ui/` and create `/preview` testbed route.

2. **Step 2: Navigation & Shell Overhaul**
   - Restyle `AppShell.tsx`, `Header.tsx`, `DataStatusBanner.tsx`, and `CompactEvidenceFloor.tsx` to match the Stitch shell exactly.
   - Ensure complete responsive collapse to mobile drawer (<768px) and desktop sidebar (≥1024px).

3. **Step 3: Core Analytical Screens**
   - **Executive Dashboard (`/`)**: 4 KPI cards, range mini-chart, top hubs, statutory checklist preview.
   - **National Ledger (`/ledger`)**: Reconciled count range chart, claim breakdown table, grade mix bar, contradiction audits.
   - **City Lab (`/cities`)**: 4-pillar index table, weight presets, custom sliders, sliding city detail drawer.
   - **Setup Simulator (`/simulate`)**: Parametric cost engine, 60-month cumulative SVG curve, break-even readout, rule-fit matrix, 90-day MCA roadmap.

4. **Step 4: Intelligence & Reference Screens**
   - **Signal Radar (`/radar`)**: Cluster probability model, signal observation toggles, next-check recommendation.
   - **Provider Proof (`/providers`)**: Verified ratio vs fee tier ranking toggle, client verification indicators.
   - **Ask the Ledger (`/ask`)**: Grounded AI query interface, citation chips, lowest grade tag, floor refusal fallback.
   - **State Register (`/states`)**: Comprehensive state policy matrix and incentive fraction gauges.
   - **Setup Guide & Documents (`/documents`)**: SPICe+ roadmap and statutory document repository.
   - **Source Register (`/sources`)**: Ingested sources, snapshot hashes, and last-checked monitor.
   - **Reviewer Workspace (`/review`)**: Review queue, claim editor, lead promotion, and sign-in modal (`/login`).

5. **Step 5: Accessibility, Responsiveness & Test Verification**
   - Validate touch targets (≥44px), contrast ratios (≥4.5:1), heading levels (`h1` -> `h2` -> `h3`), and ARIA attributes.
   - Run existing Playwright test suite (`npm run test:e2e` / `playwright test`) and ensure 100% pass rate.
   - Add Playwright visual-regression snapshots for each screen in light and dark modes across mobile and desktop.
   - Verify Golden Values (Year 1: ~$6.05M, 5-Year: ~$29.9M, HQ: ~$42.6M, Break-even: Month 8).
   - Ensure strict TypeScript compilation (`npm run build`) and zero console errors.

---

## 6. Risks & Mitigation Strategies
- **Risk:** Next.js static vs dynamic URL param hydration mismatch causing floor flash.
  - *Mitigation:* Ensure `EvidenceContext` initializes safely with client-side detection and `suppressHydrationWarning` on root HTML.
- **Risk:** Visual regression tests failing on font loading timing.
  - *Mitigation:* Use `document.fonts.ready` in Playwright fixtures and test against stable web font fallbacks.
- **Risk:** Existing E2E journey tests failing due to changed DOM text or selectors.
  - *Mitigation:* Preserve all exact text anchors required by tests (`Grade-Weighted Centre`, `1,580`, `hidden by Floor A`, `US$6.05M`, `Month 8`, `90-Day Setup Checklist`, `MCA SPICe+`, `Bengaluru`, `Hyderabad`, `Establishment Probability`, `Evidence Below Floor / Refusal Notice`).
