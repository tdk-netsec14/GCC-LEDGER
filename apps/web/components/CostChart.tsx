"use client";

import React from "react";
import { MonthlyCurvePoint } from "@/lib/api";

export interface CostChartProps {
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

  const width = 860;
  const height = 300;
  const padding = { top: 30, right: 40, bottom: 40, left: 65 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (month: number) => padding.left + ((month - 1) / 59) * plotWidth;
  const getY = (val: number) => padding.top + plotHeight - (val / maxVal) * plotHeight;

  // Generate SVG path strings
  const gccPoints = curves.map((c) => `${getX(c.month)},${getY(c[gccKey])}`).join(" ");
  const hqPoints = curves.map((c) => `${getX(c.month)},${getY(c[hqKey])}`).join(" ");

  const breakEvenX = breakEvenMonth ? getX(breakEvenMonth) : null;
  const breakEvenPoint = breakEvenMonth ? curves[breakEvenMonth - 1] : null;
  const breakEvenY = breakEvenPoint ? getY(breakEvenPoint[gccKey]) : null;

  return (
    <div className="w-full bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="space-y-0.5">
          <h3 className="font-headline-md font-semibold text-content-primary">
            Cumulative Expenditure Trajectory
          </h3>
          <p className="font-body-sm text-content-secondary">
            Baseline comparison factoring talent ramp-up, real estate fitouts, and statutory tax holidays
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs font-geist">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded-full bg-secondary inline-block" />
            <span className="text-content-secondary">India Captive (GCC TCO)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-primary inline-block" />
            <span className="text-content-secondary">HQ Baseline Spend</span>
          </div>
          {breakEvenMonth && (
            <div className="flex items-center gap-1.5 text-tertiary font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-tertiary inline-block animate-pulse" />
              <span>Month {breakEvenMonth} Crossover</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[650px] text-xs font-mono select-none"
        >
          <defs>
            <linearGradient id="gccAreaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
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
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  className="text-[11px]"
                >
                  {isUSD ? `$${val.toFixed(1)}M` : `₹${val.toFixed(0)}Cr`}
                </text>
              </g>
            );
          })}

          {/* Area fill under GCC line */}
          <polygon
            points={`${padding.left},${padding.top + plotHeight} ${gccPoints} ${
              width - padding.right
            },${padding.top + plotHeight}`}
            fill="url(#gccAreaGradient)"
          />

          {/* HQ Line (Dashed) */}
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            points={hqPoints}
          />

          {/* GCC Line (Solid Emerald) */}
          <polyline
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="3.5"
            points={gccPoints}
          />

          {/* Break-even Crossover Marker */}
          {breakEvenX && breakEvenY && (
            <g>
              <line
                x1={breakEvenX}
                y1={padding.top}
                x2={breakEvenX}
                y2={padding.top + plotHeight}
                stroke="var(--tertiary)"
                strokeWidth="1.5"
                strokeDasharray="2 3"
              />
              <circle
                cx={breakEvenX}
                cy={breakEvenY}
                r="6"
                fill="var(--tertiary)"
                stroke="var(--surface-card)"
                strokeWidth="2"
              />
              <rect
                x={breakEvenX - 60}
                y={breakEvenY - 32}
                width="120"
                height="24"
                rx="6"
                fill="var(--surface-card-elevated)"
                stroke="var(--tertiary)"
                strokeWidth="1"
              />
              <text
                x={breakEvenX}
                y={breakEvenY - 16}
                textAnchor="middle"
                fill="var(--tertiary)"
                className="text-[10px] font-bold font-mono"
              >
                MONTH {breakEvenMonth} BREAK-EVEN
              </text>
            </g>
          )}

          {/* Month X-axis ticks */}
          {[1, 12, 24, 36, 48, 60].map((month) => {
            const x = getX(month);
            return (
              <g key={month}>
                <line
                  x1={x}
                  y1={padding.top + plotHeight}
                  x2={x}
                  y2={padding.top + plotHeight + 6}
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + plotHeight + 20}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  className="text-[11px]"
                >
                  {month === 1 ? "M1" : `M${month}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default CostChart;
