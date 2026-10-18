import React from "react";
import { Grade } from "@/lib/api";

interface GradeStampProps {
  grade: Grade | string;
  relayed?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const GRADE_DESCRIPTIONS: Record<string, string> = {
  A: "Grade A — Primary statute, regulatory filing, or official gazette record opened directly.",
  B: "Grade B — Industry association or professional firm report (audit, legal, real estate).",
  C: "Grade C — Secondary press or news media reporting.",
  D: "Grade D — Vendor directory, platform estimate, or unverified lead claim.",
};

export const GradeStamp: React.FC<GradeStampProps> = ({
  grade,
  relayed = false,
  size = "md",
  showLabel = false,
}) => {
  const g = grade.toUpperCase();
  const desc = GRADE_DESCRIPTIONS[g] || `Grade ${g}`;

  const colorStyles: Record<string, string> = {
    A: "bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500",
    B: "bg-blue-50 text-blue-800 border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500",
    C: "bg-amber-50 text-amber-800 border-amber-500 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500",
    D: "bg-slate-100 text-slate-700 border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-500",
  };

  const sizeStyles: Record<string, string> = {
    sm: "w-5 h-5 text-xs font-semibold",
    md: "w-6 h-6 text-xs font-bold",
    lg: "w-8 h-8 text-sm font-bold",
  };

  const styleClass = colorStyles[g] || colorStyles.D;
  const sizeClass = sizeStyles[size];

  return (
    <span
      className="inline-flex items-center gap-1.5 align-middle select-none"
      title={`${desc}${relayed ? " (Relayed claim: cited from secondary page without opening original)" : ""}`}
    >
      <span
        className={`inline-flex items-center justify-center rounded ${sizeClass} ${styleClass} ${
          relayed ? "border-2 border-dashed" : "border"
        }`}
      >
        {g}
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Grade {g} {relayed && "(Relayed)"}
        </span>
      )}
    </span>
  );
};

export default GradeStamp;
