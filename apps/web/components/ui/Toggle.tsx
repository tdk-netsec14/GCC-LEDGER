"use client";

import React from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}) => {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : "toggle");

  return (
    <label
      htmlFor={toggleId}
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`
            w-9 h-5 rounded-full transition-colors duration-150 ease-in-out border
            ${
              checked
                ? "bg-primary border-primary"
                : "bg-surface-container-high border-border-subtle hover:border-border-active"
            }
          `}
        />
        <div
          className={`
            absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-150 ease-in-out shadow-sm
            ${checked ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-geist font-medium text-content-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-content-muted leading-tight">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};
