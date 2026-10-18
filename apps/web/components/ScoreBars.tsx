import React from "react";
import { PillarScores } from "@/lib/api";

interface ScoreBarsProps {
  pillars: PillarScores;
  totalScore: number;
}

export const ScoreBars: React.FC<ScoreBarsProps> = ({ pillars, totalScore }) => {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-slate-900 dark:text-white">
          Score: {totalScore.toFixed(1)} / 100
        </span>
      </div>

      {/* Stacked bar representation */}
      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${pillars.cost_score * 0.2}%` }}
          className="bg-emerald-500 h-full transition-all"
          title={`Setup Cost: ${pillars.cost_score.toFixed(1)}`}
        />
        <div
          style={{ width: `${pillars.salary_score * 0.1}%` }}
          className="bg-blue-500 h-full transition-all"
          title={`Salary Level: ${pillars.salary_score.toFixed(1)}`}
        />
        <div
          style={{ width: `${pillars.incentive_score * 0.25}%` }}
          className="bg-purple-500 h-full transition-all"
          title={`Documented Incentives: ${pillars.incentive_score.toFixed(1)}`}
        />
        <div
          style={{ width: `${pillars.ecosystem_score * 0.45}%` }}
          className="bg-amber-500 h-full transition-all"
          title={`Ecosystem Density: ${pillars.ecosystem_score.toFixed(1)}`}
        />
      </div>

      {/* Pillar Legend with scores */}
      <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Cost {pillars.cost_score.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Salary {pillars.salary_score.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span>Incentives {pillars.incentive_score.toFixed(0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Density {pillars.ecosystem_score.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBars;
