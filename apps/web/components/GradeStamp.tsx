"use client";

import React from "react";
import { Grade } from "@/lib/api";

export interface GradeStampProps {
  grade: Grade | string;
  relayed?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const GRADE_DESCRIPTIONS: Record<string, string> = {
  A: "Grade A — Primary statute, regulatory filing, or official gazette record opened directly.",
  B: "Grade B — Industry association or professional firm report (audit, legal, real estate advisory).",
  C: "Grade C — Secondary press or published news media interview.",
  D: "Grade D — Vendor claims, platform estimates, or unverified directory submissions.",
};

export const GradeStamp: React.FC<GradeStampProps> = ({
  grade,
  relayed = false,
  size = "md",
  showLabel = false,
  className = "",
}) => {
  const g = (grade || "D").toUpperCase();
  const desc = GRADE_DESCRIPTIONS[g] || `Grade ${g}`;

  const colorStyles: Record<string, string> = {
    A: "bg-secondary/15 text-secondary border-secondary/50",
    B: "bg-primary/15 text-primary border-primary/50",
    C: "bg-tertiary/15 text-tertiary border-tertiary/50",
    D: "bg-surface-container-high text-content-secondary border-border-outline/50",
  };

  const sizeStyles: Record<string, string> = {
    sm: "w-5 h-5 text-[11px] font-bold rounded",
    md: "w-6 h-6 text-xs font-bold rounded-md",
    lg: "w-8 h-8 text-sm font-black rounded-lg",
  };

  const styleClass = colorStyles[g] || colorStyles.D;
  const sizeClass = sizeStyles[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle select-none font-geist ${className}`}
      title={`${desc}${relayed ? " (Relayed source: cited from intermediary citation without opening primary record)" : ""}`}
    >
      <span
        aria-label={`Evidence Grade ${g}${relayed ? " Relayed" : " Direct"}`}
        className={`inline-flex items-center justify-center font-mono ${sizeClass} ${styleClass} ${
          relayed ? "border-2 border-dashed" : "border"
        }`}
      >
        {g}
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-content-secondary">
          Grade {g} {relayed && "(Relayed)"}
        </span>
      )}
    </span>
  );
};

export default GradeStamp;
