"use client";

import React from "react";
import { PillarScores } from "@/lib/api";

export interface ScoreBarsProps {
  pillars: PillarScores;
  totalScore: number;
}

export const ScoreBars: React.FC<ScoreBarsProps> = ({ pillars, totalScore }) => {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-geist">
        <span className="font-semibold text-content-primary">
          Index Score: <strong className="font-mono text-primary font-bold">{(totalScore * 100).toFixed(1)}</strong> / 100
        </span>
      </div>

      {/* Stacked Pillar Bar */}
      <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden flex border border-border-subtle/50">
        <div
          style={{ width: `${pillars.cost_score * 0.2}%` }}
          className="bg-secondary h-full transition-all"
          title={`Setup Cost: ${pillars.cost_score.toFixed(1)}`}
        />
        <div
          style={{ width: `${pillars.salary_score * 0.1}%` }}
          className="bg-primary h-full transition-all"
          title={`Salary Level: ${pillars.salary_score.toFixed(1)}`}
        />
        <div
          style={{ width: `${pillars.incentive_score * 0.25}%` }}
          className="bg-tertiary h-full transition-all"
          title={`Documented Incentives: ${pillars.incentive_score.toFixed(1)}`}
        />
        <div
          style={{ width: `${pillars.ecosystem_score * 0.45}%` }}
          className="bg-primary-hover h-full transition-all"
          title={`Ecosystem Density: ${pillars.ecosystem_score.toFixed(1)}`}
        />
      </div>

      {/* Legend with Scores */}
      <div className="grid grid-cols-4 gap-1 text-[10px] text-content-muted font-mono pt-0.5">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
          <span>Cost {pillars.cost_score.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          <span>Pay {pillars.salary_score.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0" />
          <span>Sub {pillars.incentive_score.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-hover shrink-0" />
          <span>Eco {pillars.ecosystem_score.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBars;
