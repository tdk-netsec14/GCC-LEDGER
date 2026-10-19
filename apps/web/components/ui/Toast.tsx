"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type = "info",
  title,
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-tertiary shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-danger shrink-0" />,
    info: <Info className="w-4 h-4 text-primary shrink-0" />,
  };

  const borderColors = {
    success: "border-secondary/40",
    warning: "border-tertiary/40",
    error: "border-danger/40",
    info: "border-primary/40",
  };

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 p-3.5 rounded-xl bg-surface-card-elevated border shadow-elevated
        ${borderColors[type]} text-content-primary max-w-sm w-full animate-fade-in
      `}
    >
      <div className="pt-0.5">{icons[type]}</div>
      <div className="flex-1 space-y-0.5">
        <h4 className="text-xs font-geist font-semibold">{title}</h4>
        {message && <p className="text-[11px] text-content-secondary leading-relaxed">{message}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-content-muted hover:text-content-primary p-0.5"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
