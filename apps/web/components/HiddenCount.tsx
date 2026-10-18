"use client";

import React from "react";
import { EyeOff } from "lucide-react";
import { useEvidence } from "@/lib/evidence-context";

interface HiddenCountProps {
  count: number;
  itemName?: string;
  itemLabel?: string;
  onLowerFloor?: () => void;
  onDisableDirectOnly?: () => void;
}

export const HiddenCount: React.FC<HiddenCountProps> = ({
  count,
  itemName = "records",
  itemLabel,
  onLowerFloor,
  onDisableDirectOnly,
}) => {
  const label = itemLabel || itemName;
  const { floor, setFloor, directOnly, setDirectOnly } = useEvidence();

  if (count <= 0) return null;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 mb-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <EyeOff className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>{count}</strong> {label} hidden by Floor <strong>{floor}</strong>
          {directOnly ? " and Direct sources only" : ""}.
        </span>
      </div>
      <div className="flex items-center gap-2">
        {directOnly && (
          <button
            type="button"
            onClick={() => setDirectOnly(false)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Show relayed
          </button>
        )}
        {floor !== "D" && (
          <button
            type="button"
            onClick={() => setFloor("D")}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Lower to Grade D
          </button>
        )}
      </div>
    </div>
  );
};

export default HiddenCount;
