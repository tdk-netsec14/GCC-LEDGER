import React from "react";

interface ProbabilityMeterProps {
  probability: number;
  band: "Watch" | "Warming" | "Likely" | "Near-certain" | string;
}

export const ProbabilityMeter: React.FC<ProbabilityMeterProps> = ({ probability, band }) => {
  const pct = Math.round(probability * 100);

  const bandColors: Record<string, { bg: string; text: string; fill: string }> = {
    Watch: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", fill: "bg-slate-500" },
    Warming: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-300", fill: "bg-amber-500" },
    Likely: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-800 dark:text-blue-300", fill: "bg-blue-600" },
    "Near-certain": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-800 dark:text-emerald-300", fill: "bg-emerald-600" },
  };

  const style = bandColors[band] || bandColors.Watch;

  return (
    <div className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 ${style.bg} transition-colors`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
          Estimated 12-Month Arrival Probability
        </span>
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${style.text} bg-white dark:bg-slate-900 border border-current`}>
          {band}
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-2 font-mono">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {pct}%
        </span>
        <span className="text-xs text-slate-500">
          corroborated pre-announcement signals
        </span>
      </div>

      {/* Progress Bar with Band Segments */}
      <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          style={{ width: `${pct}%` }}
          className={`h-full ${style.fill} transition-all duration-500 rounded-full`}
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
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
