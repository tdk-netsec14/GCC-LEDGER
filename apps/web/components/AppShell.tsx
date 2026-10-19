"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  MapPin,
  Compass,
  Radio,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  FileText,
  Landmark,
  FileCheck2,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Shield,
  Layers,
  Component,
} from "lucide-react";
import { FloorBar } from "./FloorBar";
import { useTheme } from "@/lib/theme-context";

interface NavGroup {
  group: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/ledger", label: "National Ledger", icon: BarChart3 },
    ],
  },
  {
    group: "Explore",
    items: [
      { href: "/directory", label: "Directory", icon: Building2 },
      { href: "/cities", label: "City Lab", icon: MapPin },
    ],
  },
  {
    group: "Plan",
    items: [
      { href: "/simulate", label: "Setup Simulator", icon: Compass },
      { href: "/documents", label: "Setup Guide", icon: FileText },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { href: "/radar", label: "Signal Radar", icon: Radio },
      { href: "/providers", label: "Provider Proof", icon: ShieldCheck },
      { href: "/ask", label: "Ask the Ledger", icon: HelpCircle },
    ],
  },
  {
    group: "Reference",
    items: [
      { href: "/states", label: "State Register", icon: Landmark },
      { href: "/sources", label: "Source Register", icon: BookOpen },
      { href: "/review", label: "Reviewer Workspace", icon: FileCheck2 },
      { href: "/preview", label: "Component Preview", icon: Component, badge: "DS" },
    ],
  },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-canvas text-content-primary font-sans flex flex-col">
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-surface-container-lowest/95 backdrop-blur-md border-b border-border-subtle">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-border-subtle font-black text-xs">
            GL
          </div>
          <span className="font-headline-md font-semibold text-content-primary tracking-tight">
            GCC Ledger
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-container-high transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-border-subtle text-content-secondary hover:text-content-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Floor Bar */}
      <div className="lg:hidden px-4 py-2 bg-surface-container-low border-b border-border-subtle overflow-x-auto">
        <FloorBar compact />
      </div>

      {/* Desktop Fixed Left Sidebar (260px) */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-surface-container-lowest border-r border-border-subtle flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.35)]
          transition-transform duration-200 ease-obsidian
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="px-space-lg pt-space-lg pb-space-md flex flex-col gap-space-xs bg-surface-container-lowest border-b border-border-subtle/50">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-space-sm group">
                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-border-subtle group-hover:scale-105 transition-transform">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-headline-md text-headline-md tracking-tight font-semibold text-content-primary">
                  GCC Ledger
                </span>
              </Link>
              <span className="font-geist text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-content-secondary">
                v4.2
              </span>
            </div>
            <div className="flex items-center gap-1.5 pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="font-geist text-[10px] uppercase text-content-muted tracking-wider">
                Evidentiary Audit
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-space-md scrollbar-none">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                <span className="px-space-sm font-geist text-[11px] uppercase tracking-wider text-content-muted block font-semibold">
                  {group.group}
                </span>
                <nav className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center justify-between px-space-sm py-1.5 rounded-lg text-xs font-geist font-medium transition-all duration-150
                          ${
                            isActive
                              ? "bg-primary text-white font-semibold shadow-sm"
                              : "text-content-secondary hover:bg-surface-container-high hover:text-content-primary"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-content-muted"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                              isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom Audit Verification Card */}
          <div className="p-space-md bg-surface-container-low rounded-t-xl mx-space-sm mb-space-sm border border-border-subtle/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-geist text-[10px] uppercase text-secondary font-bold">
                  Level 3 Verified
                </span>
              </div>
              <span className="font-geist text-[10px] text-content-muted bg-surface-container-high px-1.5 py-0.5 rounded">
                ISO-27001
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="font-mono text-[10px] text-content-muted truncate max-w-[140px]">
                SHA-256: 9b2d...f41a
              </span>
              <Shield className="w-3 h-3 text-content-muted" />
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Container Wrapper */}
      <div className="lg:pl-[260px] flex-1 flex flex-col">
        {/* Top Header Bar for Desktop (64px) */}
        <header className="hidden lg:flex fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-border-subtle z-30 items-center justify-between px-space-lg shadow-sm">
          {/* Left: Breadcrumbs & Evidence Floor */}
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-1.5 text-content-muted font-geist text-xs">
              <span>Audits</span>
              <span className="text-content-muted/60">/</span>
              <span className="text-content-primary font-medium">GCC Ledger Console</span>
            </div>

            <div className="h-4 w-px bg-border-subtle" />

            {/* Global Evidence Floor Controller */}
            <FloorBar />
          </div>

          {/* Right: Search, Notifications, Theme, User */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme mode"
              className="p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-container-high transition-colors"
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-warning" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* Notification Trigger */}
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-container-high transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-tertiary" />
              </button>
            </div>

            {/* User Avatar */}
            <Link
              href="/review"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-geist font-bold shadow-sm hover:ring-2 hover:ring-primary/40 transition-all"
              title="Reviewer Workspace"
            >
              AD
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 lg:pt-16 p-4 sm:p-6 lg:p-space-xl max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
