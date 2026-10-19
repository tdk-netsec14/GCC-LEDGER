"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = "", id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-") : autoId);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-geist font-medium text-xs text-content-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-content-muted pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-[38px] rounded-lg bg-surface-container-low text-content-primary placeholder:text-content-muted
              border transition-colors duration-150 text-xs font-sans
              ${icon ? "pl-9" : "pl-3"} pr-3
              ${
                error
                  ? "border-danger focus:border-danger focus:ring-1 focus:ring-danger"
                  : "border-border-subtle hover:border-border-active focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-[11px] text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-content-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
