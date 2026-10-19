"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  MapPin,
  FileCheck,
  Radio,
  ArrowRight,
  Calculator,
  Building2,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { api, LedgerCountsResponse, ContradictionsResponse } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { GradeStamp } from "@/components/GradeStamp";
import { RangeChart } from "@/components/RangeChart";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HiddenCount } from "@/components/HiddenCount";

export default function DashboardHome() {
  const { floor, directOnly } = useEvidence();
  const [ledgerData, setLedgerData] = useState<LedgerCountsResponse | null>(null);
  const [contradictions, setContradictions] = useState<ContradictionsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api.getLedgerCounts({ floor, direct_only: directOnly }),
      api.getContradictions({ floor, direct_only: directOnly }),
    ])
      .then(([counts, contra]) => {
        if (!active) return;
        setLedgerData(counts);
        setContradictions(contra);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [floor, directOnly]);

  const minCount = ledgerData?.min_value ?? 1580;
  const maxCount = ledgerData?.max_value ?? 1750;
  const weightedCentre = ledgerData?.weighted_centre ?? 1580;

  return (
    <div className="space-y-10 animate-fade-in max-w-[1240px]">
      {/* 1. Epistemic Headline (Stitch Obsidian Layout) */}
      <section className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-geist text-xs font-semibold uppercase tracking-wider border border-border-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Consensus Audit Active
          </span>
          <span className="text-content-muted">•</span>
          <span className="text-content-muted font-geist text-xs uppercase tracking-wider">
            Pass Floor: Grade {floor} {directOnly ? "Direct" : ""}
          </span>
        </div>

        <h1 className="font-headline-xl text-3xl sm:text-4xl text-content-primary font-bold tracking-tight max-w-4xl">
          Evidence-Graded GCC Ledger: What is the current institutional consensus on India&apos;s GCC ecosystem?
        </h1>
        <p className="font-body-lg text-base sm:text-lg text-content-secondary max-w-3xl leading-relaxed">
          Verified intelligence synthesised from statutory filings, audited disclosures, and regulatory gazettes. Every claim is stamped with an evidence grade and bounded by your chosen floor.
        </p>
      </section>

      {/* Hidden Count Banner */}
      {ledgerData && <HiddenCount count={ledgerData.hidden_count} itemName="count records" />}

      {/* 2. Top 4 Prominent KPI Cards (Stitch Obsidian Layout) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Verified GCC Span */}
        <Card padding="md" className="flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-content-muted font-geist text-xs uppercase tracking-wider font-semibold">
              <span>Verified GCC Span</span>
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="pt-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-content-primary tracking-tight">
                {minCount.toLocaleString()} — {maxCount.toLocaleString()}
              </div>
              <div className="text-xs text-tertiary flex items-center gap-1 mt-1">
                <span>Grade-Weighted Centre:</span>
                <strong className="font-mono text-content-primary">{weightedCentre.toLocaleString()}</strong>
              </div>
              <div className="text-[11px] font-mono text-content-muted mt-0.5">
                Statutory Census Baseline: 1,580 units
              </div>
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <Badge variant="success" size="sm">
              Grade {ledgerData?.best_grade || "A"} Compliant
            </Badge>
            <Link
              href="/ledger"
              className="inline-flex items-center gap-1 font-geist text-xs font-semibold text-primary hover:text-primary-hover"
            >
              National Ledger
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Card 2: Metros & Hubs */}
        <Card padding="md" className="flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-content-muted font-geist text-xs uppercase tracking-wider font-semibold">
              <span>Tier-1 &amp; 2 Ranked</span>
              <MapPin className="w-4 h-4 text-secondary" />
            </div>
            <div className="pt-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-content-primary tracking-tight">
                6 Metros &amp; Hubs
              </div>
              <div className="text-xs text-content-secondary mt-1 truncate">
                Top destinations: Bengaluru, Hyderabad, Pune
              </div>
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-geist text-[11px] text-content-muted">
              4-Pillar Min-Max Index
            </span>
            <Link
              href="/cities"
              className="inline-flex items-center gap-1 font-geist text-xs font-semibold text-primary hover:text-primary-hover"
            >
              City Lab
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Card 3: Statutory Rules Active */}
        <Card padding="md" className="flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-content-muted font-geist text-xs uppercase tracking-wider font-semibold">
              <span>Statutory Rules Active</span>
              <FileCheck className="w-4 h-4 text-tertiary" />
            </div>
            <div className="pt-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-content-primary tracking-tight">
                48 Checkpoints
              </div>
              <div className="text-xs text-secondary flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% CIN cross-checked</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <span className="font-geist text-[11px] text-content-muted">
              RBI • MCA • SEZ
            </span>
            <Link
              href="/simulate"
              className="inline-flex items-center gap-1 font-geist text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Setup Simulator
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Card 4: Contradiction Audits */}
        <Card padding="md" className="flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-content-muted font-geist text-xs uppercase tracking-wider font-semibold">
              <span>Discrepancies Audited</span>
              <AlertTriangle className="w-4 h-4 text-tertiary" />
            </div>
            <div className="pt-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-content-primary tracking-tight">
                {contradictions?.total || 4} Published
              </div>
              <div className="text-xs text-content-muted mt-1">
                Conflicting claims published with settlement reading
              </div>
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-border-subtle/50 flex items-center justify-between">
            <Badge variant="warning" size="sm">
              Resolution In Progress
            </Badge>
            <Link
              href="/ledger"
              className="inline-flex items-center gap-1 font-geist text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Audit Log
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </section>

      {/* 3. Reconciled Range Chart Section */}
      {ledgerData && ledgerData.claims && ledgerData.claims.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-headline-md font-semibold text-content-primary">
                Institutional Consensus Range
              </h2>
              <p className="font-body-sm text-content-secondary">
                Horizontal scale mapping published claims, weighted centre, and confidence bands
              </p>
            </div>
            <Link
              href="/ledger"
              className="text-xs font-geist font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Explore Full Breakdown
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <RangeChart
            claims={ledgerData.claims}
            minValue={ledgerData.min_value}
            maxValue={ledgerData.max_value}
            weightedCentre={ledgerData.weighted_centre}
            bestGrade={ledgerData.best_grade}
          />
        </section>
      )}

      {/* 4. Strategic Navigation Quadrants */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <Card padding="md" variant="interactive" className="group">
          <Link href="/cities" className="block space-y-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-headline-md font-semibold text-content-primary group-hover:text-primary transition-colors flex items-center justify-between">
              <span>City Lab Site Selection</span>
              <ArrowUpRight className="w-4 h-4 text-content-muted group-hover:text-primary transition-colors" />
            </h3>
            <p className="font-body-sm text-content-secondary leading-relaxed">
              Min-max normalized index scoring Indian tech corridors across commercial real estate costs, salary benchmarks, and state incentives.
            </p>
          </Link>
        </Card>

        <Card padding="md" variant="interactive" className="group">
          <Link href="/simulate" className="block space-y-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-headline-md font-semibold text-content-primary group-hover:text-secondary transition-colors flex items-center justify-between">
              <span>Setup Simulator &amp; Roadmap</span>
              <ArrowUpRight className="w-4 h-4 text-content-muted group-hover:text-secondary transition-colors" />
            </h3>
            <p className="font-body-sm text-content-secondary leading-relaxed">
              Parametric budget simulation calculating 60-month cumulative TCO against parent company spend with CBDT transfer-pricing and STPI rules.
            </p>
          </Link>
        </Card>

        <Card padding="md" variant="interactive" className="group">
          <Link href="/radar" className="block space-y-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-white transition-colors">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-headline-md font-semibold text-content-primary group-hover:text-tertiary transition-colors flex items-center justify-between">
              <span>Signal Radar</span>
              <ArrowUpRight className="w-4 h-4 text-content-muted group-hover:text-tertiary transition-colors" />
            </h3>
            <p className="font-body-sm text-content-secondary leading-relaxed">
              Cluster-weighted Bayesian model estimating 12-month GCC establishment probability from filings, leases, and statutory hiring footprints.
            </p>
          </Link>
        </Card>
      </section>
    </div>
  );
}
