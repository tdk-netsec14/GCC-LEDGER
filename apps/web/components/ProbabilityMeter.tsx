"use client";

import React from "react";
import { Badge } from "./ui/Badge";

export interface ProbabilityMeterProps {
  probability: number;
  band: "Watch" | "Warming" | "Likely" | "Near-certain" | string;
  className?: string;
}

export const ProbabilityMeter: React.FC<ProbabilityMeterProps> = ({
  probability,
  band,
  className = "",
}) => {
  const pct = Math.round(probability * 100);

  const bandStyles: Record<string, { badgeVariant: any; fill: string; border: string }> = {
    Watch: { badgeVariant: "neutral", fill: "bg-content-muted", border: "border-border-subtle" },
    Warming: { badgeVariant: "warning", fill: "bg-tertiary", border: "border-tertiary/40" },
    Likely: { badgeVariant: "primary", fill: "bg-primary", border: "border-primary/40" },
    "Near-certain": { badgeVariant: "success", fill: "bg-secondary", border: "border-secondary/40" },
  };

  const style = bandStyles[band] || bandStyles.Watch;

  return (
    <div
      role="region"
      aria-label={`Arrival Probability Gauge: ${pct}%, Band: ${band}`}
      className={`p-6 rounded-2xl bg-surface-card border ${style.border} shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-geist text-xs uppercase tracking-wider text-content-secondary font-semibold">
          Estimated 12-Month Establishment Probability
        </span>
        <Badge variant={style.badgeVariant} dot size="md">
          {band}
        </Badge>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-extrabold font-mono text-content-primary tracking-tight">
          {pct}%
        </span>
        <span className="text-xs text-content-muted font-geist">
          corroborated pre-announcement signals
        </span>
      </div>

      {/* Progress Bar with Recessed Track */}
      <div className="relative w-full h-3 bg-surface-container-high rounded-full overflow-hidden border border-border-subtle/50">
        <div
          style={{ width: `${pct}%` }}
          className={`h-full ${style.fill} transition-all duration-500 rounded-full`}
        />
      </div>

      <div className="flex justify-between text-[11px] font-mono text-content-muted pt-1">
        <span>0%</span>
        <span>25% Watch</span>
        <span>55% Warming</span>
        <span>80% Likely</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default ProbabilityMeter;
