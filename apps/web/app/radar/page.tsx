"use client";

import React, { useEffect, useState } from "react";
import { useEvidence } from "@/lib/evidence-context";
import { api, SignalDef, RadarScoreResponse } from "@/lib/api";
import { GradeStamp } from "@/components/GradeStamp";
import { ProbabilityMeter } from "@/components/ProbabilityMeter";
import { HiddenCount } from "@/components/HiddenCount";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Radio,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function RadarPage() {
  const { floor, directOnly, evidenceParams } = useEvidence();
  const [signals, setSignals] = useState<SignalDef[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [scoreResult, setScoreResult] = useState<RadarScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getSignals(evidenceParams)
      .then((data) => {
        if (!active) return;
        setSignals(data);
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
    api.scoreRadar({ signal_ids: selectedIds }, evidenceParams)
      .then((res) => {
        if (!active) return;
        setScoreResult(res);
        setScoring(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setScoring(false);
      });
    return () => {
      active = false;
    };
  }, [selectedIds, evidenceParams]);

  const toggleSignal = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const probPercent = scoreResult ? Math.round(scoreResult.probability * 100) : 0;

  // Group signals by cluster
  const clusters = Array.from(new Set(signals.map((s) => s.cluster)));

  return (
    <div className="space-y-8 animate-fade-in max-w-[1240px]">
      {/* 1. Header with Plain Headline */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-geist text-xs font-semibold uppercase text-tertiary tracking-wider">
            Predictive Intelligence // Bayesian Model
          </span>
          <span className="text-content-muted">•</span>
          <span className="font-geist text-xs text-content-muted font-mono">RADAR-PROB-OR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-headline-xl text-content-primary font-bold tracking-tight">
          Signal Radar: Is a prospective enterprise preparing to land a GCC in India?
        </h1>
        <p className="text-body-md text-content-secondary max-w-3xl leading-relaxed">
          Pre-incorporation arrival detection estimating 12-month GCC announcement probability. Grouped signals from different clusters corroborate each other, while repeated signals within the same cluster carry diminishing weights.
        </p>
      </div>

      {/* Hidden Count Banner */}
      {scoreResult && <HiddenCount count={scoreResult.hidden_count} itemName="signal indicators" />}

      {/* 2. Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card padding="md" className="flex flex-col justify-between">
          <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
            Establishment Probability
          </span>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-primary">
              {probPercent}%
            </div>
            <div className="text-xs text-content-muted mt-1">
              Active Band:{" "}
              <strong className="text-content-primary capitalize font-geist">
                {scoreResult?.band || "Watch"}
              </strong>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${probPercent}%` }}
            />
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
            Observed Corroboration
          </span>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-content-primary">
              {selectedIds.length} Signals
            </div>
            <div className="text-xs text-content-muted mt-1">
              Across {Object.keys(scoreResult?.cluster_counts || {}).length} independent clusters
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-content-secondary">
            <span>Rigor Floor:</span>
            <GradeStamp grade={floor} size="sm" />
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <span className="text-xs font-geist font-semibold uppercase tracking-wider text-tertiary">
            Recommended Next Check
          </span>
          <div className="my-2">
            <div className="text-sm font-geist font-semibold text-content-primary line-clamp-2">
              {scoreResult?.best_next_signal?.text || "Explore unselected high-weight statutory filings"}
            </div>
          </div>
          <div className="text-xs text-content-muted">
            Weight lift:{" "}
            <strong className="font-mono text-secondary">
              +{scoreResult?.best_next_signal ? (scoreResult.best_next_signal.weight * 100).toFixed(0) : 0}%
            </strong>
          </div>
        </Card>
      </div>

      {/* 3. Primary Probability Meter Gauge */}
      {scoreResult && (
        <ProbabilityMeter
          probability={scoreResult.probability}
          band={scoreResult.band}
        />
      )}

      {/* 4. Grouped Signals Catalogue */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="font-headline-md font-semibold text-content-primary">
              Signal Observation Checklist ({signals.length} Active Indicators)
            </h2>
            <p className="font-body-sm text-content-secondary">
              Check observed footprints across company registries, labour portals, leasing absorptions, and campus drives
            </p>
          </div>
          {selectedIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              Reset Selections
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {clusters.map((clusterName) => {
            const clusterSignals = signals.filter((s) => s.cluster === clusterName);
            const clusterSelectedCount = clusterSignals.filter((s) => selectedIds.includes(s.id)).length;

            return (
              <Card key={clusterName} padding="md" className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h3 className="font-geist font-semibold text-sm text-content-primary uppercase tracking-wider">
                      {clusterName} Cluster
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-content-muted">
                    {clusterSelectedCount} of {clusterSignals.length} observed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {clusterSignals.map((signal) => {
                    const isChecked = selectedIds.includes(signal.id);
                    return (
                      <label
                        key={signal.id}
                        className={`
                          flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-150
                          ${
                            isChecked
                              ? "bg-primary/10 border-primary/40 shadow-sm"
                              : "bg-surface-container-low border-border-subtle hover:border-border-active hover:bg-surface-container"
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSignal(signal.id)}
                          className="mt-0.5 w-4 h-4 rounded border-border-subtle text-primary focus:ring-primary accent-primary"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-geist font-medium text-content-primary leading-snug">
                              {signal.text}
                            </span>
                            <GradeStamp grade={signal.grade} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-content-muted">
                            <span>Base Weight: {(signal.weight * 100).toFixed(0)}%</span>
                            {signal.lead_note && (
                              <>
                                <span>•</span>
                                <span>{signal.lead_note}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
