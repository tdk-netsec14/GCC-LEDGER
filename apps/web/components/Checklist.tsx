"use client";

import React, { useState } from "react";
import { RoadmapStep } from "@/lib/api";
import { GradeStamp } from "./GradeStamp";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { Card } from "./ui/Card";

export interface ChecklistProps {
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
    <Card padding="md" className="space-y-6">
      {/* Progress Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="space-y-0.5">
          <h3 className="font-headline-md font-semibold text-content-primary">
            First 90 Days Execution Checklist
          </h3>
          <p className="font-body-sm text-content-secondary">
            Sequenced statutory and operational setup steps with primary evidence stamps
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-content-primary">
              {completedCount} of {steps.length} completed
            </span>
            <div className="text-[11px] text-content-muted font-mono">{progressPct}% complete</div>
          </div>
          <div className="w-28 h-2 bg-surface-container-high rounded-full overflow-hidden border border-border-subtle/50">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-secondary transition-all duration-300 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="divide-y divide-border-subtle/60">
        {steps.map((s) => {
          const isDone = !!completedSteps[s.step_number];

          return (
            <div
              key={s.step_number}
              onClick={() => toggleStep(s.step_number)}
              className={`py-4 px-3 -mx-3 rounded-xl flex items-start gap-4 cursor-pointer transition-colors ${
                isDone
                  ? "bg-secondary/5 text-content-muted"
                  : "hover:bg-surface-container/60 text-content-primary"
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-content-muted hover:text-secondary focus:outline-none transition-colors"
                aria-label={`Toggle step ${s.step_number}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary fill-secondary/20" />
                ) : (
                  <Circle className="w-5 h-5 text-content-muted/60" />
                )}
              </button>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-content-muted">
                      Step {s.step_number}.
                    </span>
                    <span className={`text-sm font-geist font-semibold ${isDone ? "line-through text-content-muted" : "text-content-primary"}`}>
                      {s.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-content-secondary border border-border-subtle">
                      {s.timing_days}
                    </span>
                    <GradeStamp grade={s.grade} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-content-secondary leading-relaxed font-sans">
                  {s.description}
                </p>

                {s.portal_url && (
                  <div className="pt-1">
                    <a
                      href={s.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-geist text-xs text-primary hover:text-primary-hover transition-colors"
                    >
                      <span>Official Registry Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default Checklist;
