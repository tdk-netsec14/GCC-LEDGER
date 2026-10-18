"use client";

import React from "react";
import { MonthlyCurvePoint } from "@/lib/api";

interface CostChartProps {
  curves: MonthlyCurvePoint[];
  breakEvenMonth: number | null;
  currency: "usd" | "inr";
}

export const CostChart: React.FC<CostChartProps> = ({
  curves,
  breakEvenMonth,
  currency,
}) => {
  if (!curves || curves.length === 0) return null;

  const isUSD = currency === "usd";
  const gccKey = isUSD ? "gcc_cumulative_usd_m" : "gcc_cumulative_inr_cr";
  const hqKey = isUSD ? "hq_cumulative_usd_m" : "hq_cumulative_inr_cr";

  const allVals = curves.flatMap((c) => [c[gccKey], c[hqKey]]);
  const maxVal = Math.max(...allVals) * 1.05 || 1;

  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (month: number) => padding.left + ((month - 1) / 59) * plotWidth;
  const getY = (val: number) => padding.top + plotHeight - (val / maxVal) * plotHeight;

  // Generate SVG paths
  const gccPoints = curves.map((c) => `${getX(c.month)},${getY(c[gccKey])}`).join(" ");
  const hqPoints = curves.map((c) => `${getX(c.month)},${getY(c[hqKey])}`).join(" ");

  const breakEvenX = breakEvenMonth ? getX(breakEvenMonth) : null;
  const breakEvenPoint = breakEvenMonth ? curves[breakEvenMonth - 1] : null;
  const breakEvenY = breakEvenPoint ? getY(breakEvenPoint[gccKey]) : null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            60-Month Cumulative Cost Comparison
          </h3>
          <p className="text-xs text-slate-500">
            India GCC spend vs. equivalent headcount retained at headquarters
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">India GCC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 dark:bg-blue-400 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">Headquarters (HQ)</span>
          </div>
          {breakEvenMonth && (
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 inline-block" />
              <span>Break-even: Month {breakEvenMonth}</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[600px] text-xs font-mono select-none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + plotHeight * (1 - ratio);
            const val = maxVal * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px]"
                >
                  {isUSD ? `$${val.toFixed(1)}M` : `₹${val.toFixed(0)}Cr`}
                </text>
              </g>
            );
          })}

          {/* X Axis Month Ticks */}
          {[1, 12, 24, 36, 48, 60].map((m) => {
            const x = getX(m);
            return (
              <g key={m}>
                <line
                  x1={x}
                  y1={height - padding.bottom}
                  x2={x}
                  y2={height - padding.bottom + 4}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-400"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px]"
                >
                  M{m}
                </text>
              </g>
            );
          })}

          {/* Break-even Vertical Line */}
          {breakEvenX !== null && (
            <g>
              <line
                x1={breakEvenX}
                y1={padding.top}
                x2={breakEvenX}
                y2={height - padding.bottom}
                stroke="#9333ea"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
              <text
                x={breakEvenX}
                y={padding.top - 5}
                textAnchor="middle"
                className="fill-purple-600 dark:fill-purple-400 font-bold text-[10px]"
              >
                Break-even (M{breakEvenMonth})
              </text>
              {breakEvenY !== null && (
                <circle cx={breakEvenX} cy={breakEvenY} r="4" className="fill-purple-600 stroke-white dark:stroke-slate-900" strokeWidth="2" />
              )}
            </g>
          )}

          {/* Curves */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            points={hqPoints}
            className="transition-all"
          />
          <polyline
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            points={gccPoints}
            className="transition-all"
          />
        </svg>
      </div>
    </div>
  );
};

export default CostChart;
