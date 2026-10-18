"use client";

import React from "react";
import { FilterX } from "lucide-react";
import { useEvidence } from "@/lib/evidence-context";

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  onLowerFloor?: () => void;
  onDisableDirectOnly?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No evidence meets the current standard",
  message,
  description,
  onLowerFloor,
  onDisableDirectOnly,
}) => {
  const { setFloor, setDirectOnly, floor, directOnly } = useEvidence();
  const text = description || message || "No claims or records survive your selected evidence floor and direct-source criteria. Lowering your evidence floor or permitting relayed sources will reveal available industry estimates.";

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
        <FilterX className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">{text}</p>
      <div className="flex items-center gap-3">
        {directOnly && (
          <button
            type="button"
            onClick={() => setDirectOnly(false)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
          >
            Allow Relayed Sources
          </button>
        )}
        {floor !== "D" && (
          <button
            type="button"
            onClick={() => setFloor("D")}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800"
          >
            Lower Floor to Grade D
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
