"use client";

import React, { useEffect, useState } from "react";
import { api, Contradiction, GradeMixItem, LedgerCountsResponse } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { RangeChart } from "@/components/RangeChart";
import { ContradictionCard } from "@/components/ContradictionCard";
import { HiddenCount } from "@/components/HiddenCount";
import { EmptyState } from "@/components/EmptyState";
import { GradeStamp } from "@/components/GradeStamp";
import { AlertCircle, HelpCircle, Info, RefreshCw } from "lucide-react";

export default function LedgerPage() {
  const { floor, directOnly } = useEvidence();

  const [ledgerData, setLedgerData] = useState<LedgerCountsResponse | null>(null);
  const [mixData, setMixData] = useState<GradeMixItem[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [countsRes, mixRes, contRes] = await Promise.all([
        api.getLedgerCounts({ floor, direct_only: directOnly }),
        api.getLedgerMix(),
        api.getContradictions({ floor, direct_only: directOnly }),
      ]);
      setLedgerData(countsRes);
      setMixData(mixRes.mix);
      setContradictions(contRes.items);
    } catch (err: any) {
      setError(err?.message || "Failed to load ledger data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [floor, directOnly]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title & Intro */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How Many GCCs Does India Have?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Published figures from government replies, industry bodies, advisory reports, and vendor platforms disagree significantly. GCC Ledger reconciles these figures according to your active evidence standard.
        </p>
      </div>

      {/* Hidden Count Banner */}
      {ledgerData && <HiddenCount count={ledgerData.hidden_count} itemName="count claims" />}

      {/* Loading & Error States */}
      {loading && (
        <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-400 mr-2" />
          <span className="text-xs text-slate-500">Reconciling published claims...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>Error loading ledger data: {error}</span>
          <button
            type="button"
            onClick={loadData}
            className="px-2.5 py-1 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 rounded font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reconciled Range Chart & Table */}
      {!loading && !error && ledgerData && (
        <>
          {ledgerData.status === "empty" ? (
            <EmptyState
              title="No count claims pass your evidence standard"
              message="No published GCC count claims meet your current floor and direct-source criteria. Lower your evidence floor or disable Direct sources only to view secondary figures."
            />
          ) : (
            <RangeChart
              claims={ledgerData.claims}
              minValue={ledgerData.min_value}
              maxValue={ledgerData.max_value}
              weightedCentre={ledgerData.weighted_centre}
              bestGrade={ledgerData.best_grade}
            />
          )}

          {/* Explanation Panel: Why Counts Disagree */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Unit of Count</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Certain publications tally distinct registered Indian legal entities (holding unique CIN / PAN registrations), whereas others tally physical operating facilities across multi-city hubs. A single corporate parent frequently operates 3 to 5 delivery facilities.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>Date of Count</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Published counts reflect reporting snapshots ranging from calendar year 2024 through late 2026. Rapid expansion in Tier-1 and Tier-2 centers means figures published even twelve months apart represent different baseline realities.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Info className="w-4 h-4 text-emerald-500" />
                <span>Definition of a GCC</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                A genuine GCC is a wholly owned captive unit delivering internal software, operations, or R&D for its global parent. Commercial IT vendors and third-party outsourcing delivery centers are often erroneously conflated into aggregate numbers.
              </p>
            </div>
          </div>

          {/* Overall Dataset Grade Mix */}
          {mixData.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Platform Evidence Grade Mix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribution of all verified claims and records across the platform. Primary Grade A records remain scarce by design.
                  </p>
                </div>
              </div>

              {/* Stacked bar */}
              <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                {mixData.map((m) => {
                  const colors: Record<string, string> = {
                    A: "bg-emerald-500",
                    B: "bg-blue-500",
                    C: "bg-amber-500",
                    D: "bg-slate-400",
                  };
                  return (
                    <div
                      key={m.grade}
                      style={{ width: `${m.percentage}%` }}
                      className={`${colors[m.grade]} h-full transition-all`}
                      title={`Grade ${m.grade}: ${m.count} records (${m.percentage}%)`}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                {mixData.map((m) => (
                  <div key={m.grade} className="flex items-center gap-2">
                    <GradeStamp grade={m.grade} size="sm" />
                    <span className="text-slate-700 dark:text-slate-300">
                      <strong>{m.count}</strong> records ({m.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registered Contradictions Section */}
          <div className="space-y-4 pt-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Contradiction Register
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Public sources frequently disagree. Rather than inventing an average, GCC Ledger documents the conflict side-by-side with the primary legal document required to settle it.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {contradictions.map((c) => (
                <ContradictionCard key={c.id} contradiction={c} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
