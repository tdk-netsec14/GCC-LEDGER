"use client";

import React, { useEffect, useState } from "react";
import { api, Contradiction, GradeMixItem, LedgerCountsResponse, CountClaim } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { RangeChart } from "@/components/RangeChart";
import { ContradictionCard } from "@/components/ContradictionCard";
import { HiddenCount } from "@/components/HiddenCount";
import { EmptyState } from "@/components/EmptyState";
import { GradeStamp } from "@/components/GradeStamp";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { SourceLink } from "@/components/SourceLink";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Info,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LedgerPage() {
  const { floor, directOnly } = useEvidence();

  const [ledgerData, setLedgerData] = useState<LedgerCountsResponse | null>(null);
  const [mixData, setMixData] = useState<GradeMixItem[]>([]);
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Progressive Disclosure Toggles
  const [showTable, setShowTable] = useState(true);
  const [showContradictions, setShowContradictions] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [countsRes, mixRes, contRes] = await Promise.all([
        api.getLedgerCounts({ floor, direct_only: directOnly }),
        api.getLedgerMix(),
        api.getContradictions({ floor, direct_only: directOnly }),
      ]);
      setLedgerData(countsRes);
      setMixData(mixRes.mix);
      setContradictions(contRes.items);
    } catch (err: any) {
      setError(err?.message || "Failed to load ledger data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [floor, directOnly]);

  const claimColumns: Column<CountClaim>[] = [
    {
      key: "publisher",
      header: "Publisher & Institution",
      sortable: true,
      render: (r) => (
        <div className="space-y-0.5">
          <span className="font-geist font-semibold text-content-primary">{r.publisher}</span>
          {r.source_url && (
            <div className="pt-0.5">
              <SourceLink url={r.source_url} label="Official Filing / Release" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "value_number",
      header: "Claimed Count",
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-base font-bold text-content-primary">
          {r.value_number.toLocaleString()}
        </span>
      ),
    },
    {
      key: "unit_of_count",
      header: "Unit of Count",
      render: (r) => (
        <span className="font-geist text-xs text-content-secondary capitalize">
          {r.unit_of_count || "operating units"}
        </span>
      ),
    },
    {
      key: "as_of_date",
      header: "As of Date",
      align: "center",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs text-content-muted">
          {r.as_of_date || "—"}
        </span>
      ),
    },
    {
      key: "grade",
      header: "Grade Stamp",
      align: "center",
      render: (r) => <GradeStamp grade={r.grade} relayed={r.relayed} size="sm" showLabel />,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-[1240px]">
      {/* 1. Epistemic Headline */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-geist text-xs font-semibold uppercase text-primary tracking-wider">
            National Ledger // Cross-Publisher Reconciliation
          </span>
          <span className="text-content-muted">•</span>
          <span className="font-geist text-xs text-content-muted font-mono">SEC-5.1-CONSENSUS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-headline-xl text-content-primary font-bold tracking-tight">
          How many GCCs currently operate in India?
        </h1>
        <p className="text-body-md text-content-secondary max-w-3xl leading-relaxed">
          Reconciling published claims across statutory registers, industry bodies, and market research firms. Floor filtering excludes unvetted or low-evidence estimates from consensus calculations.
        </p>
      </div>

      {/* Hidden Count Banner */}
      {ledgerData && <HiddenCount count={ledgerData.hidden_count} itemName="count claims" />}

      {/* 2. Top 4 KPI Cards (Stitch Obsidian Layout) */}
      {ledgerData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Published Span
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-content-primary">
                {ledgerData.min_value
                  ? `${ledgerData.min_value.toLocaleString()} – ${ledgerData.max_value.toLocaleString()}`
                  : "—"}
              </div>
              <div className="text-xs text-content-muted mt-1">
                Bounds of claims passing floor
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "65%" }} />
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Grade-Weighted Centre
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-primary">
                {ledgerData.weighted_centre ? ledgerData.weighted_centre.toLocaleString() : "—"}
              </div>
              <div className="text-xs text-content-muted mt-1">
                Weighted by evidence rigor (A=4, B=3, C=2, D=1)
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: "80%" }} />
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Active Claims
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-content-primary">
                {ledgerData.claims ? ledgerData.claims.length : 0} Sources
              </div>
              <div className="text-xs text-content-muted mt-1">
                Passing Floor {floor} {directOnly ? "(Direct only)" : ""}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-content-secondary">
              <span>Best Grade:</span>
              <GradeStamp grade={ledgerData.best_grade || "A"} size="sm" />
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Contradictions
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-tertiary">
                {contradictions.length} Active Audits
              </div>
              <div className="text-xs text-content-muted mt-1">
                Documented publisher conflicts
              </div>
            </div>
            <Badge variant="warning" size="sm">
              Readings Available
            </Badge>
          </Card>
        </div>
      )}

      {/* 3. Range Chart Visualization */}
      {ledgerData && ledgerData.claims && ledgerData.claims.length > 0 && (
        <section className="space-y-4">
          <RangeChart
            claims={ledgerData.claims}
            minValue={ledgerData.min_value}
            maxValue={ledgerData.max_value}
            weightedCentre={ledgerData.weighted_centre}
            bestGrade={ledgerData.best_grade}
          />
        </section>
      )}

      {/* 4. Grade Mix Breakdown Bar */}
      {mixData && mixData.length > 0 && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-geist text-xs font-semibold uppercase tracking-wider text-content-secondary">
              Total Dataset Rigor Mix (Honest Grade Breakdown)
            </span>
            <span className="text-xs text-content-muted font-mono">
              {mixData.reduce((acc, m) => acc + m.count, 0)} total records
            </span>
          </div>

          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex border border-border-subtle/50">
            {mixData.map((item) => {
              const bg =
                item.grade === "A"
                  ? "bg-secondary"
                  : item.grade === "B"
                  ? "bg-primary"
                  : item.grade === "C"
                  ? "bg-tertiary"
                  : "bg-content-muted";
              return (
                <div
                  key={item.grade}
                  style={{ width: `${item.percentage}%` }}
                  className={`${bg} h-full transition-all`}
                  title={`Grade ${item.grade}: ${item.count} records (${item.percentage.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-geist text-xs">
            {mixData.map((m) => (
              <div key={m.grade} className="flex items-center gap-2">
                <GradeStamp grade={m.grade} size="sm" />
                <span className="text-content-secondary">
                  <strong>{m.count}</strong> records ({m.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. Claims Table */}
      {ledgerData && ledgerData.claims && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-headline-md font-semibold text-content-primary">
                Published Count Claims Register
              </h2>
              <p className="font-body-sm text-content-secondary">
                Direct statutory citations and secondary research reports supporting consensus numbers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              className="text-xs font-geist font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>{showTable ? "Hide Register" : "Show Register"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTable ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showTable && (
            <Table
              columns={claimColumns}
              data={ledgerData.claims}
              keyField="id"
              sortKey="value_number"
              sortDirection="desc"
            />
          )}
        </section>
      )}

      {/* 6. Contradiction Register */}
      {contradictions && contradictions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-headline-md font-semibold text-content-primary">
                Contradiction Audits ({contradictions.length})
              </h2>
              <p className="font-body-sm text-content-secondary">
                Where market research and government gazettes disagree, claims are published side-by-side with resolving citations
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowContradictions(!showContradictions)}
              className="text-xs font-geist font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>{showContradictions ? "Collapse Audits" : "Expand Audits"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showContradictions ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showContradictions && (
            <div className="space-y-4">
              {contradictions.map((contra) => (
                <ContradictionCard key={contra.id} contradiction={contra} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
