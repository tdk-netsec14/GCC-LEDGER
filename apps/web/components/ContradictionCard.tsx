"use client";

import React from "react";
import { Contradiction } from "@/lib/api";
import { GradeStamp } from "./GradeStamp";
import { Card } from "./ui/Card";
import { Sparkles, AlertTriangle } from "lucide-react";

export interface ContradictionCardProps {
  contradiction: Contradiction;
  className?: string;
}

export const ContradictionCard: React.FC<ContradictionCardProps> = ({
  contradiction,
  className = "",
}) => {
  return (
    <Card padding="md" className={`space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold text-tertiary bg-tertiary/15 border border-tertiary/25">
            <AlertTriangle className="w-3 h-3" />
            Registered Contradiction #{contradiction.id}
          </span>
          <h3 className="font-headline-md font-semibold text-content-primary">
            {contradiction.title}
          </h3>
        </div>
        {contradiction.last_checked_on && (
          <span className="text-[11px] font-mono text-content-muted shrink-0">
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
              className="p-3.5 rounded-xl border border-border-subtle bg-surface-container-low space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-geist font-semibold text-content-primary">
                  {cl.publisher}
                </span>
                <GradeStamp grade={cl.grade} relayed={cl.relayed} size="sm" />
              </div>
              <p className="text-xs text-content-secondary font-mono leading-relaxed bg-surface-card p-2 rounded-lg border border-border-subtle/50">
                “{cl.text}”
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reading / Analysis */}
      <div className="text-xs text-content-secondary leading-relaxed border-t border-border-subtle/80 pt-3">
        <strong className="text-content-primary font-geist font-semibold">Reading: </strong>
        {contradiction.reading}
      </div>

      {/* To Settle It Primary Document Callout */}
      <div className="flex items-start gap-2.5 bg-primary/10 border border-primary/25 rounded-xl p-3 text-xs text-content-primary font-sans">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-primary font-geist font-semibold">To settle it: </strong>
          <span className="text-content-secondary">{contradiction.to_settle}</span>
        </div>
      </div>
    </Card>
  );
};

export default ContradictionCard;
