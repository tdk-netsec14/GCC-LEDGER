"use client";

import React from "react";
import { Grade } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { Filter, Layers } from "lucide-react";

const GRADES: Array<{ grade: Grade; label: string; desc: string }> = [
  { grade: "A", label: "A — Primary", desc: "Statutes, gazettes, regulatory filings" },
  { grade: "B", label: "B — Advisory", desc: "Industry & professional firm reports" },
  { grade: "C", label: "C — Press", desc: "News media & published interviews" },
  { grade: "D", label: "D — All Sources", desc: "Vendor claims & unverified estimates" },
];

export const FloorBar: React.FC = () => {
  const { floor, directOnly, setFloor, setDirectOnly } = useEvidence();

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 shadow-sm text-sm">
      <div className="flex items-center gap-1.5 px-2 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
        <Filter className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
        <span>Evidence Floor</span>
      </div>

      <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Evidence Floor Selection">
        {GRADES.map((item) => {
          const isActive = floor === item.grade;
          return (
            <button
              key={item.grade}
              type="button"
              onClick={() => setFloor(item.grade)}
              title={item.desc}
              className={`px-3 py-1.5 text-xs font-semibold first:rounded-l-md last:rounded-r-md border transition-colors ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-inner"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {item.grade}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

      <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded">
        <input
          type="checkbox"
          checked={directOnly}
          onChange={(e) => setDirectOnly(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:checked:bg-white dark:checked:border-white"
        />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          Direct sources only
        </span>
      </label>
    </div>
  );
};

export default FloorBar;
