"use client";

import React from "react";
import { CountClaim } from "@/lib/api";
import { GradeStamp } from "./GradeStamp";

export interface RangeChartProps {
  claims: CountClaim[];
  minValue: number;
  maxValue: number;
  weightedCentre: number;
  bestGrade: string | null;
}

export const RangeChart: React.FC<RangeChartProps> = ({
  claims,
  minValue,
  maxValue,
  weightedCentre,
  bestGrade,
}) => {
  if (claims.length === 0) {
    return null;
  }

  // Determine global visual bounds for scale
  const allVals = claims.map((c) => c.value_number);
  const minBound = Math.floor(Math.min(...allVals) / 100) * 100 - 50;
  const maxBound = Math.ceil(Math.max(...allVals) / 100) * 100 + 50;
  const rangeSpan = maxBound - minBound || 1;

  const getPercent = (val: number) => {
    return Math.max(5, Math.min(95, ((val - minBound) / rangeSpan) * 100));
  };

  const minPct = getPercent(minValue);
  const maxPct = getPercent(maxValue);
  const centrePct = getPercent(weightedCentre);

  return (
    <div className="w-full bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <div className="space-y-1">
          <span className="font-geist text-[11px] uppercase tracking-wider text-content-secondary font-semibold">
            Reconciled Published GCC Counts
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold font-mono text-content-primary">
              {minValue === maxValue
                ? minValue.toLocaleString()
                : `${minValue.toLocaleString()} – ${maxValue.toLocaleString()}`}
            </h2>
            <span className="text-xs text-content-muted font-geist">operating units</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-geist">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45 bg-primary inline-block rounded-xs shadow-sm" />
            <span className="text-content-secondary">
              Grade-Weighted Centre: <strong className="text-content-primary font-mono">{weightedCentre.toLocaleString()}</strong>
            </span>
          </div>
          {bestGrade && (
            <div className="flex items-center gap-1.5">
              <span className="text-content-muted">Best Grade:</span>
              <GradeStamp grade={bestGrade} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Range Visualization Bar */}
      <div className="relative pt-6 pb-6 px-4">
        {/* Track Container */}
        <div className="relative w-full h-8 flex items-center">
          {/* Base Recessed Track Line */}
          <div className="w-full h-2 bg-surface-container-high rounded-full border border-border-subtle/40" />

          {/* Shaded Confidence Range Band */}
          {minValue !== maxValue && (
            <div
              className="absolute h-3.5 bg-primary/20 border border-primary/40 rounded-full pointer-events-none"
              style={{
                left: `${minPct}%`,
                width: `${Math.max(2, maxPct - minPct)}%`,
              }}
            />
          )}

          {/* Weighted Centre Diamond Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 group cursor-pointer"
            style={{ left: `${centrePct}%` }}
          >
            <div className="w-4 h-4 rotate-45 bg-primary border-2 border-surface-card shadow-md transition-transform group-hover:scale-125" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
              <div className="bg-surface-card-elevated border border-border-active text-content-primary text-[11px] font-mono font-bold px-2 py-1 rounded shadow-elevated whitespace-nowrap">
                Centre: {weightedCentre.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Individual Claim Markers */}
          {claims.map((c) => {
            const pct = getPercent(c.value_number);
            const isRelayed = c.relayed;

            return (
              <div
                key={c.id}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer z-10"
                style={{ left: `${pct}%` }}
              >
                <div
                  className={`
                    w-3 h-3 rounded-full transition-transform group-hover:scale-150
                    ${
                      c.grade === "A"
                        ? "bg-secondary"
                        : c.grade === "B"
                        ? "bg-primary"
                        : c.grade === "C"
                        ? "bg-tertiary"
                        : "bg-content-muted"
                    }
                    ${isRelayed ? "ring-2 ring-white/60 ring-offset-1 ring-offset-surface-card" : "border-2 border-surface-card"}
                  `}
                />

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div className="bg-surface-card-elevated border border-border-active text-content-primary text-xs rounded-lg p-2.5 shadow-elevated whitespace-nowrap space-y-1">
                    <div className="font-semibold text-content-primary">{c.publisher}</div>
                    <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-content-muted">
                      <span>Value: <strong className="text-content-primary">{c.value_number.toLocaleString()}</strong></span>
                      <GradeStamp grade={c.grade} relayed={c.relayed} size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Axis Ticks & Scale Markers */}
        <div className="relative w-full flex justify-between text-[11px] font-mono text-content-muted pt-2 border-t border-border-subtle/50">
          <span>{minBound.toLocaleString()}</span>
          <span>{Math.round(minBound + rangeSpan * 0.25).toLocaleString()}</span>
          <span>{Math.round(minBound + rangeSpan * 0.5).toLocaleString()}</span>
          <span>{Math.round(minBound + rangeSpan * 0.75).toLocaleString()}</span>
          <span>{maxBound.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default RangeChart;
