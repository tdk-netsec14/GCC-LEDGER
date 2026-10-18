"use client";

import { useEffect, useState, useMemo } from "react";
import { useEvidence } from "@/lib/evidence-context";
import { api, SignalDef, RadarScoreResponse } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import ProbabilityMeter from "@/components/ProbabilityMeter";
import HiddenCount from "@/components/HiddenCount";
import EmptyState from "@/components/EmptyState";
import { Radio, AlertCircle, Sparkles, CheckSquare, Square } from "lucide-react";

export default function RadarPage() {
  const { evidenceParams, setFloor, setDirectOnly } = useEvidence();
  const [signals, setSignals] = useState<SignalDef[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [scoreResult, setScoreResult] = useState<RadarScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch signals on evidence filter change
  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getSignals(evidenceParams)
      .then((data) => {
        if (!active) return;
        setSignals(data);
        // prune selections that are no longer visible under floor
        const visibleIds = new Set(data.map((s) => s.id));
        setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load radar signals");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [evidenceParams]);

  // Recalculate score whenever selected signals change
  useEffect(() => {
    if (selectedIds.length === 0) {
      setScoreResult({
        probability: 0,
        band: "Watch",
        cluster_counts: {},
        adjusted_weights: {},
        best_next_signal: null,
        hidden_count: 0,
      });
      return;
    }

    let active = true;
    setScoring(true);
    api
      .scoreRadar({ signal_ids: selectedIds }, evidenceParams)
      .then((res) => {
        if (active) {
          setScoreResult(res);
          setScoring(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Score error:", err);
          setScoring(false);
        }
      });
    return () => {
      active = false;
    };
  }, [selectedIds, evidenceParams]);

  const toggleSignal = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(signals.map((s) => s.id));
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  // Group signals by cluster
  const groupedSignals = useMemo(() => {
    const map = new Map<string, SignalDef[]>();
    signals.forEach((s) => {
      const list = map.get(s.cluster) || [];
      list.push(s);
      map.set(s.cluster, list);
    });
    return map;
  }, [signals]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Signal Radar
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Track public and commercial breadcrumbs that precede an official GCC establishment.
          Calculates probability via independent noisy-OR combinations with a 0.60 cluster
          discount for repeat observations in the same domain.
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
          Loading signal definitions and evidence grades…
        </div>
      ) : signals.length === 0 ? (
        <EmptyState
          title="No signals available at current Evidence Floor"
          description="Signals may be graded below your threshold or marked as relayed sources."
          onLowerFloor={() => setFloor("D")}
          onDisableDirectOnly={() => setDirectOnly(false)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Signals Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Observed Indicators ({selectedIds.length} of {signals.length} active)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Select all
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {Array.from(groupedSignals.entries()).map(([cluster, items]) => {
                const countInCluster = items.filter((i) => selectedIds.includes(i.id)).length;
                return (
                  <div
                    key={cluster}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{cluster}</span>
                        {countInCluster > 1 && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            Repeat discount applies (×0.60)
                          </span>
                        )}
                      </h2>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {countInCluster}/{items.length} selected
                      </span>
                    </div>

                    <div className="space-y-2">
                      {items.map((signal) => {
                        const isChecked = selectedIds.includes(signal.id);
                        return (
                          <label
                            key={signal.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800"
                                : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSignal(signal.id)}
                              className="sr-only"
                            />
                            <div className="mt-0.5 text-indigo-600 dark:text-indigo-400">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {signal.text}
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                    w={signal.weight.toFixed(2)}
                                  </span>
                                  <GradeStamp grade={signal.grade} relayed={signal.relayed} size="sm" />
                                </div>
                              </div>
                              {signal.lead_note && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                                  {signal.lead_note}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Score & Recommended Signal */}
          <div className="lg:col-span-5 space-y-6 sticky top-20">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Establishment Probability
                </h3>
                {scoring && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 animate-pulse">
                    Computing…
                  </span>
                )}
              </div>

              <ProbabilityMeter
                probability={scoreResult?.probability || 0}
                band={scoreResult?.band || "Watch"}
              />

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  Cluster Breakdown
                </div>
                {scoreResult && Object.keys(scoreResult.cluster_counts).length > 0 ? (
                  <div className="space-y-1.5">
                    {Object.entries(scoreResult.cluster_counts).map(([cl, cnt]) => (
                      <div key={cl} className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>{cl}</span>
                        <span className="font-mono">
                          {cnt} signal{cnt > 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No signals currently selected</p>
                )}
              </div>

              {/* Best next signal recommendation */}
              {scoreResult?.best_next_signal && (
                <div className="p-4 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Highest-Value Missing Signal</span>
                  </div>
                  <p className="text-xs font-medium text-indigo-950 dark:text-indigo-100">
                    &ldquo;{scoreResult.best_next_signal.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300">
                    <span>Cluster: {scoreResult.best_next_signal.cluster}</span>
                    <button
                      type="button"
                      onClick={() => toggleSignal(scoreResult.best_next_signal!.id)}
                      className="font-semibold underline hover:text-indigo-900 dark:hover:text-indigo-100"
                    >
                      + Add to radar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-semibold block text-slate-700 dark:text-slate-300">
                Radar Methodology
              </span>
              <p>
                Signals are combined using independent evidence accumulation:
                P = 1 - ∏(1 - wᵢ). The first signal in any cluster contributes full weight;
                subsequent signals in that same cluster are discounted by 60% (w &times; 0.60) to
                prevent correlated overconfidence.
              </p>
            </div>
          </div>
        </div>
      )}

      {scoreResult && scoreResult.hidden_count > 0 && (
        <HiddenCount
          count={scoreResult.hidden_count}
          itemLabel="signal definition"
          onLowerFloor={() => setFloor("D")}
          onDisableDirectOnly={() => setDirectOnly(false)}
        />
      )}
    </div>
  );
}
