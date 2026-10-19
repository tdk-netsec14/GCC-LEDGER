"use client";

import React, { useEffect, useState } from "react";
import {
  api,
  SimulateResponse,
  RoadmapStep,
  RuleFitItem,
} from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { GradeStamp } from "@/components/GradeStamp";
import { HiddenCount } from "@/components/HiddenCount";
import { CostChart } from "@/components/CostChart";
import { Checklist } from "@/components/Checklist";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import {
  Calculator,
  Sliders,
  DollarSign,
  TrendingDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Building,
  Users,
  ShieldCheck,
  ArrowRight,
  FileText,
  MapPin,
} from "lucide-react";

const FUNCTIONS = [
  { id: "tech", label: "Technology & Software", default: true },
  { id: "finance", label: "Finance & Accounting", default: true },
  { id: "data", label: "Data & AI/ML", default: true },
  { id: "erd", label: "Engineering R&D", default: false },
  { id: "cx", label: "Customer Experience", default: false },
  { id: "hr", label: "HR & Global Payroll", default: false },
];

export default function SetupSimulatorPage() {
  const { floor, directOnly } = useEvidence();

  // Simulator Inputs (Default calibrated per Section 5.5 and Golden Case)
  const [cityName, setCityName] = useState<string>("Bengaluru");
  const [headcount, setHeadcount] = useState<number>(150);
  const [costAdvantage, setCostAdvantage] = useState<number>(0.4);
  const [hiddenCostAllowance, setHiddenCostAllowance] = useState<number>(0.12);
  const [exchangeRate, setExchangeRate] = useState<number>(85.0);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([
    "tech",
    "finance",
    "data",
  ]);

  // Currency view toggle
  const [currency, setCurrency] = useState<"usd" | "inr">("usd");
  const [activeTab, setActiveTab] = useState<"overview" | "rules" | "roadmap">("roadmap");

  // Data states
  const [simData, setSimData] = useState<SimulateResponse | null>(null);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, steps] = await Promise.all([
        api.simulate(
          {
            headcount,
            cost_advantage: costAdvantage,
            hidden_allowance: hiddenCostAllowance,
            exchange_rate: exchangeRate,
            functions: selectedFunctions,
          },
          { floor, direct_only: directOnly }
        ),
        api.getRoadmap({ floor, direct_only: directOnly }),
      ]);
      setSimData(res);
      setRoadmapSteps(steps);
    } catch (err: any) {
      setError(err?.message || "Failed to calculate simulation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [
    cityName,
    headcount,
    costAdvantage,
    hiddenCostAllowance,
    exchangeRate,
    selectedFunctions,
    floor,
    directOnly,
  ]);

  const toggleFunction = (fnId: string) => {
    setSelectedFunctions((prev) =>
      prev.includes(fnId) ? prev.filter((f) => f !== fnId) : [...prev, fnId]
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1240px]">
      {/* 1. Header with Plain Headline and Stitch Context */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-geist text-xs font-semibold uppercase text-secondary tracking-wider">
            Setup Simulator // 60-Month TCO Model
          </span>
          <span className="text-content-muted">/</span>
          <span className="font-geist text-xs text-content-muted font-mono">SIM-TCO-2026-Q4</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-headline-xl text-content-primary font-bold tracking-tight">
          Setup Simulator: What is your 5-year captive TCO versus HQ spend?
        </h1>
        <p className="text-body-md text-content-secondary max-w-3xl leading-relaxed">
          Calibrated financial model comparing direct Indian GCC establishment and talent ramp-up against retained organic headquarters spend, with CBDT safe-harbor transfer pricing and STPI tax guidelines.
        </p>
      </div>

      {/* Hidden Count Banner */}
      {simData && <HiddenCount count={simData.hidden_count} itemName="statutory rules" />}

      {/* 2. Top 4 KPI Cards (Stitch Obsidian Layout) */}
      {simData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Year 1 Setup */}
          <Card padding="md" className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-content-muted text-xs font-geist uppercase font-semibold tracking-wider">
              <span>Year 1 Spend</span>
              <Building className="w-4 h-4 text-content-muted" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-bold font-mono text-content-primary tracking-tight">
                {currency === "usd"
                  ? `US$${simData.year1_gcc_usd_m.toFixed(2)}M`
                  : `₹${simData.year1_gcc_inr_cr.toFixed(1)}Cr`}
              </div>
              <div className="text-xs text-content-muted mt-1">
                Capex &amp; running cost for {headcount} FTEs
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: "32%" }} />
            </div>
          </Card>

          {/* Card 2: 5-Year Cumulative TCO */}
          <Card padding="md" className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-content-muted text-xs font-geist uppercase font-semibold tracking-wider">
              <span>5-Year Cumulative TCO</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-bold font-mono text-content-primary tracking-tight">
                {currency === "usd"
                  ? `US$${simData.five_year_gcc_usd_m.toFixed(2)}M`
                  : `₹${simData.five_year_gcc_inr_cr.toFixed(1)}Cr`}
              </div>
              <div className="text-xs text-content-muted mt-1">
                vs{" "}
                <span className="font-mono text-content-secondary font-medium">
                  {currency === "usd"
                    ? `US$${simData.five_year_hq_usd_m.toFixed(2)}M`
                    : `₹${simData.five_year_hq_inr_cr.toFixed(1)}Cr`}
                </span>{" "}
                HQ spend
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "42%" }} />
            </div>
          </Card>

          {/* Card 3: 5-Year Net Saving */}
          <Card padding="md" className="flex flex-col justify-between border-secondary/30 bg-surface-card relative overflow-hidden">
            <div className="flex items-center justify-between text-secondary text-xs font-geist uppercase font-semibold tracking-wider">
              <span>5-Year Net Saving</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono text-[10px] font-bold">
                {((simData.five_year_saving_usd_m / simData.five_year_hq_usd_m) * 100).toFixed(0)}% delta
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-bold font-mono text-secondary tracking-tight">
                {currency === "usd"
                  ? `US$${simData.five_year_saving_usd_m.toFixed(2)}M`
                  : `₹${simData.five_year_saving_inr_cr.toFixed(1)}Cr`}
              </div>
              <div className="text-xs text-content-muted mt-1">
                Direct margin lift over 60 months
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-secondary font-geist font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>
                +${(simData.five_year_saving_usd_m / 5).toFixed(2)}M net run-rate / yr
              </span>
            </div>
          </Card>

          {/* Card 4: Break-Even Horizon */}
          <Card padding="md" className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-tertiary text-xs font-geist uppercase font-semibold tracking-wider">
              <span>Break-Even Horizon</span>
              <Calendar className="w-4 h-4 text-tertiary" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-bold font-mono text-tertiary tracking-tight">
                {simData.break_even_month ? `Month ${simData.break_even_month}` : "None in 60m"}
              </div>
              <div className="text-xs text-content-muted mt-1">
                STPI capex &amp; fitout amortization
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-tertiary h-full rounded-full"
                style={{ width: `${((simData.break_even_month || 12) / 60) * 100}%` }}
              />
            </div>
          </Card>
        </div>
      )}

      {/* 3. Parameter Controls Collapsible Card */}
      <details className="group bg-surface-card border border-border-subtle rounded-2xl overflow-hidden transition-all shadow-sm">
        <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-surface-container/50 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-geist font-semibold text-sm text-content-primary">
                Simulation Assumptions &amp; Model Inputs
              </span>
              <span className="text-xs text-content-muted font-mono px-2 py-0.5 rounded bg-surface-container-high">
                {cityName} · {headcount} FTEs · {(costAdvantage * 100).toFixed(0)}% advantage · ₹{exchangeRate}/$
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-primary text-xs font-geist font-medium">
            <span className="group-open:hidden">Modify Inputs</span>
            <span className="hidden group-open:inline">Collapse</span>
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </div>
        </summary>

        <div className="p-6 pt-2 border-t border-border-subtle/80 bg-surface-container-low/50 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-geist font-medium text-content-secondary uppercase tracking-wider mb-1.5">
                Target Metro Hub
              </label>
              <select
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className="w-full h-9 rounded-lg bg-surface-container-low border border-border-subtle px-3 text-xs font-sans text-content-primary focus:border-primary focus:outline-none"
              >
                <option value="Bengaluru">Bengaluru (Tier 1 Metros)</option>
                <option value="Hyderabad">Hyderabad (Tier 1 Metros)</option>
                <option value="Pune">Pune (Tech Metros)</option>
                <option value="Chennai">Chennai (Tier 1 Metros)</option>
                <option value="NCR (Gurugram/Noida)">NCR (Gurugram / Noida)</option>
                <option value="Coimbatore">Coimbatore (Tier 2 Growth)</option>
              </select>
            </div>

            <Slider
              label="Headcount (FTEs)"
              value={headcount}
              min={25}
              max={500}
              step={25}
              unit=" pax"
              onChange={setHeadcount}
            />
          </div>

          <div className="space-y-4">
            <Slider
              label="Cost Advantage vs. HQ"
              value={Math.round(costAdvantage * 100)}
              min={20}
              max={65}
              step={5}
              unit="%"
              onChange={(v) => setCostAdvantage(v / 100)}
            />
            <Slider
              label="Hidden Expat / Legal Allowance"
              value={Math.round(hiddenCostAllowance * 100)}
              min={5}
              max={25}
              step={1}
              unit="%"
              onChange={(v) => setHiddenCostAllowance(v / 100)}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-geist font-medium text-content-secondary uppercase tracking-wider">
              Core GCC Functional Scope
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FUNCTIONS.map((fn) => {
                const isSelected = selectedFunctions.includes(fn.id);
                return (
                  <button
                    key={fn.id}
                    type="button"
                    onClick={() => toggleFunction(fn.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-geist font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-white shadow-sm font-semibold"
                        : "bg-surface-container-high text-content-secondary hover:text-content-primary hover:bg-surface-container-highest"
                    }`}
                  >
                    {fn.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </details>

      {/* 4. Cumulative Expenditure Curve */}
      {simData && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="space-y-0.5">
              <h3 className="font-headline-md font-semibold text-content-primary">
                60-Month Cumulative Expenditure Trajectory
              </h3>
              <p className="font-body-sm text-content-secondary">
                India GCC spend curve versus equivalent headcount retained at parent headquarters
              </p>
            </div>

            {/* Currency Switcher */}
            <div className="inline-flex rounded-lg p-0.5 bg-surface-container-high border border-border-subtle text-xs font-geist">
              <button
                type="button"
                onClick={() => setCurrency("usd")}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  currency === "usd"
                    ? "bg-primary text-white shadow-sm"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("inr")}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  currency === "inr"
                    ? "bg-primary text-white shadow-sm"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>

          <CostChart
            curves={simData.monthly_curves}
            breakEvenMonth={simData.break_even_month}
            currency={currency}
          />
        </Card>
      )}

      {/* 5. Navigation Tabs for Rules Fit & 90-Day Plan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 text-xs font-geist font-semibold rounded-lg transition-colors ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-sm"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-container"
              }`}
            >
              Statutory Rules Fit ({simData?.rule_fits?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("roadmap")}
              className={`px-3 py-1.5 text-xs font-geist font-semibold rounded-lg transition-colors ${
                activeTab === "roadmap"
                  ? "bg-primary text-white shadow-sm"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-container"
              }`}
            >
              90-Day Setup Checklist ({roadmapSteps.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Statutory Rules Fit Matrix */}
        {activeTab === "overview" && simData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simData.rule_fits.map((r) => {
              const statusStyles: Record<string, { badge: any; border: string }> = {
                Applies: { badge: "success", border: "border-secondary/30" },
                Check: { badge: "warning", border: "border-tertiary/30" },
                Closed: { badge: "danger", border: "border-danger/30" },
                "Does not fit": { badge: "neutral", border: "border-border-subtle" },
                Opportunity: { badge: "primary", border: "border-primary/30" },
              };
              const style = statusStyles[r.status] || statusStyles.Check;

              return (
                <Card
                  key={r.code}
                  padding="md"
                  className={`flex flex-col justify-between space-y-3 ${style.border}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-content-muted">
                          {r.code}
                        </span>
                        <h4 className="font-geist font-semibold text-xs text-content-primary">
                          {r.title}
                        </h4>
                      </div>
                      <Badge variant={style.badge} size="sm">
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-content-secondary leading-relaxed font-sans">
                      {r.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 text-[11px]">
                    <div className="text-content-muted italic">
                      {r.reason ? `Condition: ${r.reason}` : "General statutory baseline"}
                    </div>
                    <GradeStamp grade={r.grade} size="sm" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tab 2: 90-Day Execution Roadmap Checklist */}
        {activeTab === "roadmap" && (
          <div className="space-y-4">
            <h3 className="font-headline-md font-semibold text-content-primary">
              90-Day Setup Checklist (MCA SPICe+ &amp; RBI Filings)
            </h3>
            <Checklist steps={roadmapSteps} />
          </div>
        )}
      </div>
    </div>
  );
}
