"use client";

import React from "react";
import { EyeOff, ArrowDown } from "lucide-react";
import { useEvidence } from "@/lib/evidence-context";

export interface HiddenCountProps {
  count: number;
  itemName?: string;
  itemLabel?: string;
  onLowerFloor?: () => void;
  onDisableDirectOnly?: () => void;
  className?: string;
}

export const HiddenCount: React.FC<HiddenCountProps> = ({
  count,
  itemName = "records",
  itemLabel,
  className = "",
}) => {
  const label = itemLabel || itemName;
  const { floor, setFloor, directOnly, setDirectOnly } = useEvidence();

  if (count <= 0) return null;

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-xl text-xs text-content-secondary shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
          <EyeOff className="w-3.5 h-3.5 shrink-0" />
        </div>
        <span>
          <strong className="text-content-primary font-mono">{count}</strong> {label} hidden by Floor{" "}
          <strong className="text-content-primary font-mono">{floor}</strong>
          {directOnly ? " and Direct sources only" : ""}.
        </span>
      </div>

      <div className="flex items-center gap-3">
        {directOnly && (
          <button
            type="button"
            onClick={() => setDirectOnly(false)}
            className="text-xs text-primary hover:text-primary-hover font-geist font-medium transition-colors"
          >
            Show relayed
          </button>
        )}
        {floor !== "D" && (
          <button
            type="button"
            onClick={() => setFloor("D")}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-geist font-medium transition-colors"
          >
            <ArrowDown className="w-3 h-3" />
            Lower to Grade D
          </button>
        )}
      </div>
    </div>
  );
};

export default HiddenCount;
