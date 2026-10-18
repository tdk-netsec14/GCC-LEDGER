"use client";

import React, { useEffect, useState } from "react";
import { api, RoadmapStep, RuleFitItem, SimulateResponse } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { CostChart } from "@/components/CostChart";
import { Checklist } from "@/components/Checklist";
import { GradeStamp } from "@/components/GradeStamp";
import { HiddenCount } from "@/components/HiddenCount";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  HelpCircle,
  Layers,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

const FUNCTION_OPTIONS = [
  "Technology",
  "Finance and accounting",
  "Data and analytics",
  "Engineering R&D",
  "Customer experience",
  "HR and payroll",
];

export default function SimulatorPage() {
  const { floor, directOnly } = useEvidence();

  // Inputs
  const [headcount, setHeadcount] = useState(150);
  const [costAdvantage, setCostAdvantage] = useState(0.40);
  const [hiddenAllowance, setHiddenAllowance] = useState(0.12);
  const [exchangeRate, setExchangeRate] = useState(85.0);
  const [b50Cost, setB50Cost] = useState(2.0); // Bengaluru benchmark
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([
    "Technology",
    "Data and analytics",
    "Engineering R&D",
  ]);
  const [currencyMode, setCurrencyMode] = useState<"usd" | "inr">("usd");

  // Output State
  const [simData, setSimData] = useState<SimulateResponse | null>(null);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFunction = (fn: string) => {
    if (selectedFunctions.includes(fn)) {
      setSelectedFunctions(selectedFunctions.filter((f) => f !== fn));
    } else {
      setSelectedFunctions([...selectedFunctions, fn]);
    }
  };

  const runSimulationModel = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, steps] = await Promise.all([
        api.simulate(
          {
            b50_usd_m: b50Cost,
            headcount,
            cost_advantage: costAdvantage,
            hidden_allowance: hiddenAllowance,
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
      setError(err?.message || "Failed to execute simulation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulationModel();
  }, [
    headcount,
    costAdvantage,
    hiddenAllowance,
    exchangeRate,
    b50Cost,
    selectedFunctions,
    floor,
    directOnly,
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Setup Simulator & Rule Fit
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Five-year financial model with transparent assumptions (70/30 running/setup split, 9.8% yearly pay growth, 12% hidden allowance) combined with statutory rule evaluation and the first 90 days roadmap.
        </p>
      </div>

      {/* Simulator Inputs Control Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Setup Assumptions & Parameters
            </h2>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setCurrencyMode("usd")}
              className={`px-3 py-1 rounded-md transition-colors ${
                currencyMode === "usd"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              US$ Million
            </button>
            <button
              type="button"
              onClick={() => setCurrencyMode("inr")}
              className={`px-3 py-1 rounded-md transition-colors ${
                currencyMode === "inr"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              INR Crore (₹)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          {/* Headcount */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Target Headcount</span>
              <span className="font-bold text-slate-900 dark:text-white">{headcount} seats</span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              className="w-full accent-slate-900 dark:accent-white"
            />
            <span className="text-[10px] text-slate-400">Scale impacts upfront setup & running cost</span>
          </div>

          {/* Cost Advantage */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Cost Advantage over HQ</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(costAdvantage * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.75"
              step="0.05"
              value={costAdvantage}
              onChange={(e) => setCostAdvantage(Number(e.target.value))}
              className="w-full accent-slate-900 dark:accent-white"
            />
            <span className="text-[10px] text-slate-400">Savings relative to headquarters baseline</span>
          </div>

          {/* Hidden Allowance */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Hidden-Cost Allowance</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {Math.round(hiddenAllowance * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.00"
              max="0.30"
              step="0.02"
              value={hiddenAllowance}
              onChange={(e) => setHiddenAllowance(Number(e.target.value))}
              className="w-full accent-slate-900 dark:accent-white"
            />
            <span className="text-[10px] text-slate-400">Travel, onboarding & expatriate governance</span>
          </div>

          {/* Benchmark City Cost */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono">
              <span className="font-semibold text-slate-700 dark:text-slate-300">City 50-Seat Baseline</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">${b50Cost.toFixed(2)}M</span>
            </div>
            <select
              value={b50Cost}
              onChange={(e) => setB50Cost(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="2.0">Bengaluru / Gurugram ($2.0M)</option>
              <option value="1.8">Hyderabad ($1.8M)</option>
              <option value="1.7">Pune / Chennai ($1.7M)</option>
              <option value="2.4">Mumbai ($2.4M)</option>
              <option value="1.6">Noida ($1.6M)</option>
              <option value="1.4">Ahmedabad ($1.4M)</option>
              <option value="1.2">Bhubaneswar / Tier-2 ($1.2M)</option>
            </select>
            <span className="text-[10px] text-slate-400">Year-one benchmark midpoint for 50 people</span>
          </div>
        </div>

        {/* Function Scope Selector */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Center Functional Scope (shapes statutory rule applicability)
          </label>
          <div className="flex flex-wrap gap-2">
            {FUNCTION_OPTIONS.map((fn) => {
              const active = selectedFunctions.includes(fn);
              return (
                <button
                  key={fn}
                  type="button"
                  onClick={() => toggleFunction(fn)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border ${
                    active
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {fn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {simData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Year-One Spend</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {currencyMode === "usd" ? `$${simData.year1_gcc_usd_m}M` : `₹${simData.year1_gcc_inr_cr} Cr`}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Includes upfront capex + year-1 payroll</div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">5-Year GCC Spend</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {currencyMode === "usd" ? `$${simData.five_year_gcc_usd_m}M` : `₹${simData.five_year_gcc_inr_cr} Cr`}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">9.8% yearly escalation + 12% allowance</div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">5-Year HQ Retained</span>
            <div className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
              {currencyMode === "usd" ? `$${simData.five_year_hq_usd_m}M` : `₹${simData.five_year_hq_inr_cr} Cr`}
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Equivalent team retained at headquarters</div>
          </div>

          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">5-Year Saving</span>
            <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {currencyMode === "usd" ? `$${simData.five_year_saving_usd_m}M` : `₹${simData.five_year_saving_inr_cr} Cr`}
            </div>
            <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-sans">Cumulative net cash benefit</div>
          </div>

          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-800 dark:text-purple-300">Break-Even Month</span>
            <div className="text-xl font-extrabold text-purple-700 dark:text-purple-300">
              {simData.break_even_month ? `Month ${simData.break_even_month}` : "None in 60M"}
            </div>
            <div className="text-[10px] text-purple-700/80 dark:text-purple-300/80 font-sans">Full capex recoupment horizon</div>
          </div>
        </div>
      )}

      {/* 60-Month Cost Curve */}
      {simData && (
        <CostChart
          curves={simData.monthly_curves}
          breakEvenMonth={simData.break_even_month}
          currency={currencyMode}
        />
      )}

      {/* Rule-Fit Evaluation Panel */}
      {simData && simData.rule_fits && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Statutory Rule-Fit Evaluation
              </h3>
              <p className="text-xs text-slate-500">
                Central and state regulatory triggers evaluated automatically against your headcount ({headcount}) and selected functions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {simData.rule_fits.map((r) => {
              const statusStyles: Record<string, string> = {
                Applies: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700",
                Check: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700",
                Closed: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
                "Does not fit": "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700",
                Opportunity: "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700",
              };

              return (
                <div
                  key={r.code}
                  className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {r.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyles[r.status] || statusStyles.Check}`}>
                        {r.status}
                      </span>
                      <GradeStamp grade={r.grade} size="sm" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {r.text}
                  </p>
                  {r.reason && (
                    <div className="text-[11px] font-mono text-slate-500 pt-0.5">
                      <strong>Trigger: </strong> {r.reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sequenced Checklist */}
      {roadmapSteps.length > 0 && <Checklist steps={roadmapSteps} />}
    </div>
  );
}
