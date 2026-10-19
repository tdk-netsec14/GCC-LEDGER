"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}) => {
  const variantStyles = {
    default: "bg-surface-card border border-border-subtle shadow-sm",
    elevated: "bg-surface-elevated border border-border-active shadow-elevated",
    subtle: "bg-surface-container-low border border-border-subtle",
    interactive:
      "bg-surface-card border border-border-subtle hover:border-border-active hover:bg-surface-container transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-space-md",
    lg: "p-space-lg",
  };

  return (
    <div
      className={`rounded-xl overflow-hidden ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`flex items-center justify-between pb-3 border-b border-border-subtle ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`font-headline-md font-semibold text-content-primary ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={`font-body-sm text-content-secondary ${className}`} {...props}>
    {children}
  </p>
);
