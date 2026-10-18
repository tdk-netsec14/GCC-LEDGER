"use client";

import React, { useState } from "react";
import { RoadmapStep } from "@/lib/api";
import { GradeStamp } from "./GradeStamp";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";

interface ChecklistProps {
  steps: RoadmapStep[];
}

export const Checklist: React.FC<ChecklistProps> = ({ steps }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
      {/* Progress Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            First 90 Days Execution Checklist
          </h3>
          <p className="text-xs text-slate-500">
            Sequenced statutory and operational setup steps with primary evidence stamps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {completedCount} of {steps.length} completed
            </span>
            <div className="text-[10px] text-slate-400 font-mono">{progressPct}% complete</div>
          </div>
          <div className="w-24 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-2">
        {steps.map((s) => {
          const isDone = !!completedSteps[s.step_number];

          return (
            <div
              key={s.step_number}
              onClick={() => toggleStep(s.step_number)}
              className={`py-3.5 px-3 -mx-3 rounded-lg flex items-start gap-3.5 cursor-pointer transition-colors ${
                isDone
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-500"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-900 dark:text-white"
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-emerald-600 focus:outline-none"
                aria-label={`Toggle step ${s.step_number}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Step {s.step_number}.
                    </span>
                    <span className={`text-sm font-semibold ${isDone ? "line-through text-slate-500" : ""}`}>
                      {s.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {s.timing_days}
                    </span>
                    <GradeStamp grade={s.grade} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  {s.description}
                </p>

                {s.portal_url && (
                  <div className="pt-1">
                    <a
                      href={s.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-mono"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {s.portal_url.replace("https://", "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Checklist;
