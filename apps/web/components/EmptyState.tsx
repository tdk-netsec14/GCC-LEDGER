"use client";

import React from "react";
import { FilterX, ArrowDown } from "lucide-react";
import { useEvidence } from "@/lib/evidence-context";
import { Button } from "./ui/Button";

export interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  onLowerFloor?: () => void;
  onDisableDirectOnly?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No evidence meets the current standard",
  message,
  description,
  className = "",
}) => {
  const { setFloor, setDirectOnly, floor, directOnly } = useEvidence();
  const text =
    description ||
    message ||
    "No claims or records survive your selected evidence floor and direct-source criteria. Lowering your evidence floor or permitting relayed sources will reveal available industry estimates.";

  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center p-8 bg-surface-card border border-border-subtle rounded-2xl text-center max-w-lg mx-auto my-6 space-y-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-content-muted">
        <FilterX className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="font-headline-md font-semibold text-content-primary">
          {title}
        </h3>
        <p className="font-body-sm text-content-secondary leading-relaxed max-w-sm">
          {text}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {directOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDirectOnly(false)}
          >
            Allow Relayed Sources
          </Button>
        )}
        {floor !== "D" && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<ArrowDown className="w-3.5 h-3.5" />}
            onClick={() => setFloor("D")}
          >
            Lower Floor to Grade D
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
