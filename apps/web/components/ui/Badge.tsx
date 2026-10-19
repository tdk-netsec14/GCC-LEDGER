"use client";

import React from "react";

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "outline";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    primary: {
      container: "bg-primary/15 text-primary border border-primary/25",
      dot: "bg-primary",
    },
    success: {
      container: "bg-secondary/15 text-secondary border border-secondary/25",
      dot: "bg-secondary",
    },
    warning: {
      container: "bg-tertiary/15 text-tertiary border border-tertiary/25",
      dot: "bg-tertiary",
    },
    danger: {
      container: "bg-danger/15 text-danger border border-danger/25",
      dot: "bg-danger",
    },
    neutral: {
      container: "bg-surface-container-high text-content-secondary border border-border-subtle",
      dot: "bg-content-muted",
    },
    outline: {
      container: "bg-transparent text-content-secondary border border-border-subtle",
      dot: "bg-content-muted",
    },
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-geist font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant].container} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variantStyles[variant].dot}`} />}
      {children}
    </span>
  );
};
