"use client";

import React from "react";
import { AlertCircle, Shield } from "lucide-react";

export const DataStatusBanner: React.FC = () => {
  return (
    <aside
      aria-label="Statutory and Regulatory Disclaimer"
      className="bg-surface-container-lowest border-b border-border-subtle text-[11px] text-content-secondary py-1.5 px-space-lg select-none"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3 font-geist">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-secondary shrink-0" />
          <span>
            <strong className="text-content-primary font-semibold">Data Status Notice:</strong>{" "}
            Figures are claims read from public sources on the date shown and are not independently verified unless graded A. This product provides information only and is not legal, tax, or financial advice. Sample providers in the seed data are fictional.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-content-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span>ISO-27001 Graded</span>
        </div>
      </div>
    </aside>
  );
};

export default DataStatusBanner;
