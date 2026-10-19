"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-geist font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none select-none";

    const sizeStyles = {
      sm: "h-7 px-2.5 text-xs gap-1.5",
      md: "h-9 px-3.5 text-xs gap-2",
      lg: "h-11 px-5 text-sm gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-primary hover:bg-primary-hover active:bg-primary/90 text-white shadow-sm border border-transparent",
      secondary:
        "bg-surface-container-high hover:bg-surface-container-highest text-content-primary border border-border-subtle",
      outline:
        "bg-transparent hover:bg-surface-container-high text-content-primary border border-border-subtle hover:border-border-active",
      ghost:
        "bg-transparent hover:bg-surface-container-high text-content-secondary hover:text-content-primary",
      danger:
        "bg-danger hover:bg-danger/90 active:bg-danger/80 text-white border border-transparent",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
