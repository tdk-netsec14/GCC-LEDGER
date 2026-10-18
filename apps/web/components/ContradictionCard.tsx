import React from "react";
import { Contradiction } from "@/lib/api";
import { GradeStamp } from "./GradeStamp";
import { HelpCircle, Sparkles } from "lucide-react";

interface ContradictionCardProps {
  contradiction: Contradiction;
}

export const ContradictionCard: React.FC<ContradictionCardProps> = ({ contradiction }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            Registered Contradiction #{contradiction.id}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {contradiction.title}
          </h3>
        </div>
        {contradiction.last_checked_on && (
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            Checked {contradiction.last_checked_on}
          </span>
        )}
      </div>

      {/* Conflicting Claims Side-by-Side */}
      {contradiction.claims && contradiction.claims.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contradiction.claims.map((cl) => (
            <div
              key={cl.id}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {cl.publisher}
                </span>
                <GradeStamp grade={cl.grade} relayed={cl.relayed} size="sm" />
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                “{cl.text}”
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reading / Analysis */}
      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
        <strong className="text-slate-900 dark:text-slate-200 font-semibold">Reading: </strong>
        {contradiction.reading}
      </div>

      {/* To Settle It */}
      <div className="flex items-start gap-2 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-3 text-xs text-indigo-900 dark:text-indigo-300">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <strong>To settle it: </strong>
          <span>{contradiction.to_settle}</span>
        </div>
      </div>
    </div>
  );
};

export default ContradictionCard;
