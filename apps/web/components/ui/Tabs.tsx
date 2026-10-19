"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "pill",
  className = "",
}) => {
  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center gap-1 p-1 rounded-xl bg-surface-container-low border border-border-subtle ${className}`}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 text-xs font-geist font-medium rounded-lg transition-all duration-150
                ${
                  isActive
                    ? "bg-primary text-white shadow-sm font-semibold"
                    : "text-content-secondary hover:text-content-primary hover:bg-surface-container"
                }
              `}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`
                    px-1.5 py-0.2 rounded-full text-[10px] font-mono
                    ${isActive ? "bg-white/20 text-white" : "bg-surface-container-high text-content-muted"}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant
  return (
    <div className={`flex border-b border-border-subtle gap-6 ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 pb-3 text-xs font-geist font-medium border-b-2 transition-all duration-150
              ${
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-content-secondary hover:text-content-primary hover:border-border-active"
              }
            `}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-surface-container-high text-content-muted">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
