import React from "react";
import { AlertCircle } from "lucide-react";

export const DataStatusBanner: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Data Status Notice:</strong> Figures are claims read from public sources on the date shown and are not independently verified unless graded A. This product provides information only and is not legal, tax, or financial advice. Sample providers in the seed data are fictional.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataStatusBanner;
