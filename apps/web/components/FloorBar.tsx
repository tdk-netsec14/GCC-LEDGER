"use client";

import React, { useState } from "react";
import { Grade } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { Filter, Layers, Info, X } from "lucide-react";

export const GRADES: Array<{ grade: Grade; label: string; desc: string }> = [
  { grade: "A", label: "Grade A", desc: "Statutes, official gazettes, regulatory filings" },
  { grade: "B", label: "Grade B", desc: "Industry & professional firm reports" },
  { grade: "C", label: "Grade C", desc: "News media & published interviews" },
  { grade: "D", label: "Grade D", desc: "Vendor claims & unverified estimates" },
];

export interface FloorBarProps {
  passCount?: number;
  totalCount?: number;
  compact?: boolean;
  className?: string;
}

export const FloorBar: React.FC<FloorBarProps> = ({
  passCount = 1428,
  totalCount = 1850,
  compact = false,
  className = "",
}) => {
  const { floor, directOnly, setFloor, setDirectOnly } = useEvidence();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div
      role="region"
      aria-label="Evidence Floor Controller"
      className={`relative inline-flex flex-wrap items-center gap-2.5 bg-surface-container-low border border-border-subtle rounded-xl p-1.5 shadow-sm text-xs font-geist ${className}`}
    >
      {/* Floor Label */}
      <div className="flex items-center gap-1.5 px-2 text-content-secondary font-medium text-[11px] uppercase tracking-wider select-none">
        <Filter className="w-3.5 h-3.5 text-primary" />
        <span className="hidden sm:inline">Evidence Floor</span>
        <span className="sm:hidden">Floor</span>
      </div>

      {/* Segmented Buttons for Grade A, B, C, D */}
      <div
        className="inline-flex rounded-lg bg-surface-container-high/60 p-0.5 border border-border-subtle shadow-inner"
        role="group"
        aria-label="Evidence Floor Selection"
      >
        {GRADES.map((item) => {
          const isActive = floor === item.grade;
          return (
            <button
              key={item.grade}
              type="button"
              onClick={() => setFloor(item.grade)}
              title={`${item.label} — ${item.desc}`}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
                isActive
                  ? "bg-primary text-white shadow-sm font-bold"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-container-high"
              }`}
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.grade}</span>
            </button>
          );
        })}
      </div>

      {/* Direct sources only switch */}
      <label className="flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 rounded-lg hover:bg-surface-container-high/50 transition-colors">
        <input
          type="checkbox"
          checked={directOnly}
          onChange={(e) => setDirectOnly(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-border-subtle bg-surface-container-low text-primary focus:ring-primary accent-primary"
        />
        <span className="text-[11px] font-medium text-content-primary flex items-center gap-1">
          <Layers className="w-3 h-3 text-secondary" />
          <span className="hidden md:inline">Direct sources only</span>
          <span className="md:hidden">Direct only</span>
        </span>
      </label>

      {/* X of Y Pass Count Indicator */}
      <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-[11px] border border-border-subtle/50">
        <span className="font-mono font-bold text-secondary">
          {passCount.toLocaleString()} / {totalCount.toLocaleString()}
        </span>
        <span className="text-content-muted">pass floor</span>
      </div>

      {/* Info Popover Button */}
      <button
        type="button"
        onClick={() => setInfoOpen(!infoOpen)}
        className="p-1 rounded text-content-muted hover:text-content-primary transition-colors"
        title="View Evidence Floor methodology"
        aria-label="Evidence Floor information"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Methodology Popover Modal */}
      {infoOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setInfoOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-xl bg-surface-card-elevated border border-border-active shadow-elevated z-50 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="font-semibold text-content-primary flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-primary" />
                Evidence Floor Methodology
              </span>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                className="text-content-muted hover:text-content-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-content-secondary leading-relaxed">
              Every data point, record, and rule carries a statutory grade.
              Records below Floor <strong>{floor}</strong> are hidden to prevent unconfirmed noise.
            </p>
            <div className="space-y-1.5 pt-1">
              {GRADES.map((g) => (
                <div
                  key={g.grade}
                  onClick={() => {
                    setFloor(g.grade);
                    setInfoOpen(false);
                  }}
                  className={`p-2 rounded-lg cursor-pointer border transition-colors flex items-start gap-2 ${
                    floor === g.grade
                      ? "bg-primary/10 border-primary/30"
                      : "border-transparent hover:bg-surface-container"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                      g.grade === "A"
                        ? "bg-secondary/15 text-secondary"
                        : g.grade === "B"
                        ? "bg-primary/15 text-primary"
                        : g.grade === "C"
                        ? "bg-tertiary/15 text-tertiary"
                        : "bg-surface-container-high text-content-secondary"
                    }`}
                  >
                    {g.grade}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-content-primary">{g.label}</span>
                    <span className="text-[10px] text-content-muted">{g.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FloorBar;
