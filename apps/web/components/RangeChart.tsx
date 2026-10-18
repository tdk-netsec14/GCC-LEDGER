"use client";

import React from "react";
import { CountClaim } from "@/lib/api";
import { GradeStamp } from "./GradeStamp";

interface RangeChartProps {
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

  // Determine global visual bounds for scale (e.g. 1500 to 2200)
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
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Reconciled Published GCC Counts
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {minValue === maxValue ? minValue.toLocaleString() : `${minValue.toLocaleString()} – ${maxValue.toLocaleString()}`}
            </h2>
            <span className="text-xs text-slate-500">operating units</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45 bg-indigo-600 dark:bg-indigo-400 inline-block" />
            <span className="text-slate-600 dark:text-slate-400">
              Weighted Centre: <strong>{weightedCentre.toLocaleString()}</strong>
            </span>
          </div>
          {bestGrade && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Best Grade:</span>
              <GradeStamp grade={bestGrade} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* SVG Horizontal Range Scale */}
      <div className="relative pt-6 pb-8 px-2">
        <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
          {/* Axis Base Line */}
          <line x1="5" y1="12" x2="95" y2="12" stroke="currentColor" strokeWidth="0.5" className="text-slate-300 dark:text-slate-700" />

          {/* Shaded Range Band */}
          {minValue !== maxValue && (
            <rect
              x={minPct}
              y="9"
              width={Math.max(1, maxPct - minPct)}
              height="6"
              rx="3"
              className="fill-indigo-100/70 dark:fill-indigo-950/60"
            />
          )}

          {/* Claim Markers */}
          {claims.map((c) => {
            const x = getPercent(c.value_number);
            const isRelayed = c.relayed;

            return (
              <g key={c.id} className="transition-transform hover:scale-125 cursor-pointer">
                <circle
                  cx={x}
                  cy="12"
                  r="2.2"
                  className={
                    c.grade === "A"
                      ? "fill-emerald-500 stroke-emerald-800 dark:stroke-emerald-200"
                      : c.grade === "B"
                      ? "fill-blue-500 stroke-blue-800 dark:stroke-blue-200"
                      : c.grade === "C"
                      ? "fill-amber-500 stroke-amber-800 dark:stroke-amber-200"
                      : "fill-slate-400 stroke-slate-700 dark:stroke-slate-300"
                  }
                  strokeWidth={isRelayed ? "0.6" : "0.3"}
                  strokeDasharray={isRelayed ? "0.8,0.4" : undefined}
                />
              </g>
            );
          })}

          {/* Weighted Centre Diamond Marker */}
          <polygon
            points={`${centrePct},8.5 ${centrePct + 1.2},12 ${centrePct},15.5 ${centrePct - 1.2},12`}
            className="fill-indigo-600 dark:fill-indigo-400 shadow-md"
          />
        </svg>

        {/* Axis Ticks */}
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
          <span>{minBound.toLocaleString()}</span>
          <span>{Math.round((minBound + maxBound) / 2).toLocaleString()}</span>
          <span>{maxBound.toLocaleString()}</span>
        </div>
      </div>

      {/* Claims Breakdown Table */}
      <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <th className="pb-2">Publisher</th>
              <th className="pb-2">Value</th>
              <th className="pb-2">Count Metric</th>
              <th className="pb-2">As of Date</th>
              <th className="pb-2">Evidence Grade</th>
              <th className="pb-2">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {claims.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-2.5 font-sans font-medium text-slate-900 dark:text-white">
                  {c.publisher}
                </td>
                <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                  {c.value_number.toLocaleString()}
                </td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">
                  {c.unit_of_count || "operating units"}
                </td>
                <td className="py-2.5 text-slate-600 dark:text-slate-400">
                  {c.as_of_date || "—"}
                </td>
                <td className="py-2.5">
                  <GradeStamp grade={c.grade} relayed={c.relayed} size="sm" showLabel />
                </td>
                <td className="py-2.5 text-slate-500">
                  {c.relayed ? (
                    <span className="text-amber-600 dark:text-amber-400">Relayed</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">Direct</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RangeChart;
