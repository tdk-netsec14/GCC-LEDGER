"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FloorBar } from "./FloorBar";
import {
  BarChart3,
  BookOpen,
  Building2,
  CheckSquare,
  Compass,
  FileCheck2,
  FileText,
  HelpCircle,
  Landmark,
  MapPin,
  Menu,
  Radio,
  Home,
  ShieldCheck,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/ledger", label: "Ledger", icon: BarChart3 },
  { href: "/directory", label: "Directory", icon: Building2 },
  { href: "/cities", label: "City Lab", icon: MapPin },
  { href: "/simulate", label: "Setup Simulator", icon: Compass },
  { href: "/radar", label: "Signal Radar", icon: Radio },
  { href: "/providers", label: "Provider Proof", icon: ShieldCheck },
  { href: "/ask", label: "Ask the Ledger", icon: HelpCircle },
  { href: "/sources", label: "Sources", icon: BookOpen },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/states", label: "States", icon: Landmark },
  { href: "/review", label: "Review Queue", icon: FileCheck2 },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold flex items-center justify-center text-sm shadow">
                GL
              </span>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-slate-700 dark:group-hover:text-slate-200">
                  GCC Ledger
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                  Evidence Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Evidence Floor Bar in Header */}
          <div className="hidden lg:block">
            <FloorBar />
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/60">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="px-2">
              <FloorBar />
            </div>
            <div className="grid grid-cols-2 gap-1 px-2 pt-2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
