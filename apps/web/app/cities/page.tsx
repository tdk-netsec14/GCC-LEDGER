"use client";

import React, { useEffect, useState } from "react";
import { api, CityDetail, CityRankResponse, RankedCity } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { ScoreBars } from "@/components/ScoreBars";
import { GradeStamp } from "@/components/GradeStamp";
import { HiddenCount } from "@/components/HiddenCount";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  ExternalLink,
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function CitiesPage() {
  const { floor, directOnly } = useEvidence();

  const [data, setData] = useState<CityRankResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Weights (steps of 5) – bounded to 100% total
  const [costWeight, setCostWeight] = useState(20);
  const [salaryWeight, setSalaryWeight] = useState(10);
  const [incentivesWeight, setIncentivesWeight] = useState(25);
  const [ecosystemWeight, setEcosystemWeight] = useState(45);
  const [activePreset, setActivePreset] = useState<string>("balanced");

  // Custom weight slider drawer
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityDetail | null>(null);
  const [loadingCity, setLoadingCity] = useState(false);

  const adjustWeight = (key: string, value: number) => {
    const weights = {
      cost: costWeight,
      salary: salaryWeight,
      incentives: incentivesWeight,
      ecosystem: ecosystemWeight,
    };
    const totalOther = Object.entries(weights)
      .filter(([k]) => k !== key)
      .reduce((sum, [, v]) => sum + v, 0);
    const maxAllowed = 100 - totalOther;
    const bounded = Math.min(value, maxAllowed);
    switch (key) {
      case "cost":
        setCostWeight(bounded);
        break;
      case "salary":
        setSalaryWeight(bounded);
        break;
      case "incentives":
        setIncentivesWeight(bounded);
        break;
      case "ecosystem":
        setEcosystemWeight(bounded);
        break;
    }
    setActivePreset("custom");
  };

  const applyPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (presetName === "balanced") {
      setCostWeight(20);
      setSalaryWeight(10);
      setIncentivesWeight(25);
      setEcosystemWeight(45);
    } else if (presetName === "cost_first") {
      setCostWeight(30);
      setSalaryWeight(15);
      setIncentivesWeight(35);
      setEcosystemWeight(20);
    } else if (presetName === "ecosystem_first") {
      setCostWeight(10);
      setSalaryWeight(5);
      setIncentivesWeight(10);
      setEcosystemWeight(75);
    }
  };

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCitiesRank({
        cost_weight: costWeight,
        salary_weight: salaryWeight,
        incentives_weight: incentivesWeight,
        ecosystem_weight: ecosystemWeight,
        floor,
        direct_only: directOnly,
      });
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load city rankings.");
    } finally {
      setLoading(false);
    }
  };

  const openCityDrawer = async (cityId: number) => {
    setLoadingCity(true);
    try {
      const detail = await api.getCityDetail(cityId);
      setSelectedCity(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCity(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [costWeight, salaryWeight, incentivesWeight, ecosystemWeight, floor, directOnly]);

  const topCity = data?.items?.[0];

  const columns: Column<RankedCity>[] = [
    {
      key: "rank",
      header: "Rank",
      align: "center",
      render: (r) => (
        <span
          className={`font-mono text-xs font-bold w-6 h-6 rounded-full inline-flex items-center justify-center ${
            r.rank === 1
              ? "bg-primary text-white"
              : r.rank <= 3
              ? "bg-surface-container-high text-content-primary"
              : "text-content-muted"
          }`}
        >
          #{r.rank}
        </span>
      ),
    },
    {
      key: "name",
      header: "Metro Corridor",
      sortable: true,
      render: (r) => (
        <div
          onClick={() => openCityDrawer(r.id)}
          className="space-y-0.5 cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 font-geist font-semibold text-content-primary group-hover:text-primary transition-colors">
            <span>{r.name}</span>
            <ExternalLink className="w-3 h-3 text-content-muted group-hover:text-primary opacity-60" />
          </div>
          <span className="text-[11px] text-content-muted">{r.state_name}</span>
        </div>
      ),
    },
    {
      key: "total_score",
      header: "Pillar Score Breakdown",
      render: (r) => <ScoreBars pillars={r.pillars} totalScore={r.total_score} />,
    },
    {
      key: "year1_cost_midpoint",
      header: "Yr 1 Cost (50 FTE)",
      align: "right",
      render: (r) => (
        <div className="text-right">
          <span className="font-mono text-xs font-bold text-content-primary">
            {r.year1_cost_midpoint ? `$${r.year1_cost_midpoint.toFixed(2)}M` : "—"}
          </span>
          <div className="text-[10px] text-content-muted">midpoint benchmark</div>
        </div>
      ),
    },
    {
      key: "senior_salary_midpoint",
      header: "Senior Pay",
      align: "right",
      render: (r) => (
        <div className="text-right">
          <span className="font-mono text-xs font-bold text-content-primary">
            {r.senior_salary_midpoint ? `₹${r.senior_salary_midpoint.toFixed(1)}L` : "—"}
          </span>
          <div className="text-[10px] text-content-muted">annual base / FTE</div>
        </div>
      ),
    },
    {
      key: "gcc_count",
      header: "Ecosystem Scale",
      align: "right",
      render: (r) => (
        <div className="text-right">
          <span className="font-mono text-xs font-bold text-content-primary">
            {r.gcc_count || 0}
          </span>
          <div className="text-[10px] text-content-muted">operating centres</div>
        </div>
      ),
    },
    {
      key: "cost_grade",
      header: "Rigor",
      align: "center",
      render: (r) => <GradeStamp grade={r.cost_grade} size="sm" />,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-[1240px]">
      {/* 1. Epistemic Headline */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-geist text-xs font-semibold uppercase text-secondary tracking-wider">
            Site Selection // 4-Pillar Normalization
          </span>
          <span className="text-content-muted">•</span>
          <span className="font-geist text-xs text-content-muted font-mono">LAB-INDEX-4P</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-headline-xl text-content-primary font-bold tracking-tight">
          City Lab: Which Indian city is best suited for your GCC?
        </h1>
        <p className="text-body-md text-content-secondary max-w-3xl leading-relaxed">
          Min-max normalized 4-pillar index comparing commercial real estate, salaries, state incentives, and ecosystem scale across Tier-1 metros and emerging Tier-2 hubs.
        </p>
      </div>

      {/* Hidden Count Banner */}
      {data && <HiddenCount count={data.hidden_count} itemName="city datapoints" />}

      {/* 2. Top 3 KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Top Ranked City
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-primary">
                {topCity ? topCity.name : "—"}
              </div>
              <div className="text-xs text-content-muted mt-1">
                Index Score:{" "}
                <strong className="font-mono text-content-primary font-bold">
                  {topCity ? (topCity.total_score * 100).toFixed(1) : 0} / 100
                </strong>
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "90%" }} />
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Active Evaluation Profile
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold capitalize text-content-primary font-geist">
                {activePreset.replace("_", " ")}
              </div>
              <div className="text-xs text-content-muted mt-1">
                {ecosystemWeight}% Ecosystem · {incentivesWeight}% Subsidies
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: "65%" }} />
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Hubs Evaluated
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-content-primary">
                {data.items?.length || 6} Cities
              </div>
              <div className="text-xs text-content-muted mt-1">
                Tier-1 metros &amp; high-growth Tier-2 corridors
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-content-secondary">
              <span>Rigor:</span>
              <GradeStamp grade="A" size="sm" />
            </div>
          </Card>
        </div>
      )}

      {/* 3. Preset Quick Selector Bar */}
      <Card padding="sm" className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-geist text-xs font-semibold uppercase text-content-muted tracking-wider pr-1">
            Weight Preset:
          </span>
          {[
            { id: "balanced", label: "Balanced (45% Eco, 25% Sub)" },
            { id: "cost_first", label: "Cost-first" },
            { id: "ecosystem_first", label: "Talent & Scale First" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-geist font-semibold transition-colors ${
                activePreset === p.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-container-high"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowWeightSliders(!showWeightSliders)}
          className="flex items-center gap-1.5 text-xs font-geist font-semibold text-primary hover:text-primary-hover"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showWeightSliders ? "Hide Custom Sliders" : "Custom Sliders"}</span>
        </button>
      </Card>

      {/* 4. Custom Sliders Drawer */}
      {showWeightSliders && (
        <Card padding="md" className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-surface-container-low/50">
          <Slider
            label="Setup Cost"
            value={costWeight}
            min={0}
            max={50}
            step={5}
            onChange={(v) => adjustWeight("cost", v)}
          />
          <Slider
            label="Salary Level"
            value={salaryWeight}
            min={0}
            max={50}
            step={5}
            onChange={(v) => adjustWeight("salary", v)}
          />
          <Slider
            label="Incentives"
            value={incentivesWeight}
            min={0}
            max={50}
            step={5}
            onChange={(v) => adjustWeight("incentives", v)}
          />
          <Slider
            label="Ecosystem Density"
            value={ecosystemWeight}
            min={0}
            max={80}
            step={5}
            onChange={(v) => adjustWeight("ecosystem", v)}
          />
        </Card>
      )}

      {/* 5. Ranked Cities Table */}
      {data && (
        <section className="space-y-4">
          <Table
            columns={columns}
            data={data.items}
            keyField="id"
            sortKey="total_score"
            sortDirection="desc"
          />
        </section>
      )}

      {/* 6. City Detail Flyout Drawer */}
      {selectedCity && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-card-elevated border-l border-border-active h-full p-6 overflow-y-auto space-y-6 shadow-elevated animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="space-y-1">
                <span className="font-mono text-xs uppercase font-bold text-secondary">
                  Corridor Profile
                </span>
                <h3 className="font-headline-lg font-bold text-content-primary">
                  {selectedCity.name}
                </h3>
                <span className="text-xs text-content-muted">{selectedCity.state_name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCity(null)}
                className="p-1 rounded-lg text-content-muted hover:text-content-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Card padding="md" className="space-y-2">
                <span className="font-geist text-xs uppercase text-content-muted font-semibold">
                  Year-1 Setup Cost Range (50 FTEs)
                </span>
                <div className="text-xl font-bold font-mono text-content-primary">
                  ${selectedCity.year1_cost_low_usd_m?.toFixed(2)}M — ${selectedCity.year1_cost_high_usd_m?.toFixed(2)}M
                </div>
              </Card>

              <Card padding="md" className="space-y-2">
                <span className="font-geist text-xs uppercase text-content-muted font-semibold">
                  Senior Engineer Salary (Base)
                </span>
                <div className="text-xl font-bold font-mono text-content-primary">
                  ₹{selectedCity.senior_salary_low_lakh?.toFixed(1)}L — ₹{selectedCity.senior_salary_high_lakh?.toFixed(1)}L
                </div>
              </Card>

              <Card padding="md" className="space-y-2">
                <span className="font-geist text-xs uppercase text-content-muted font-semibold">
                  State Policy &amp; Subsidies
                </span>
                <div className="text-sm font-geist font-semibold text-content-primary">
                  {selectedCity.policy_name || "State Industrial GCC Concession"}
                </div>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-content-muted">Incentive Score:</span>
                  <span className="font-mono font-bold text-primary">
                    {(selectedCity.incentive_score * 100).toFixed(0)}/100
                  </span>
                </div>
              </Card>

              {selectedCity.is_data_gap && (
                <div className="p-3 rounded-xl bg-tertiary/15 border border-tertiary/30 text-tertiary text-xs">
                  <strong>Notice:</strong> Documented incentives for this state have data gaps in verified gazettes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
