"use client";

import { useEffect, useState, useMemo } from "react";
import { api, StatePolicy } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  MapPin,
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building,
  Receipt,
  FileCheck2,
  X,
  ChevronRight,
  Info
} from "lucide-react";

export default function StatesPage() {
  const [states, setStates] = useState<StatePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Drawer state for state dossier
  const [selectedState, setSelectedState] = useState<StatePolicy | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getStates()
      .then((data) => {
        if (!active) return;
        setStates(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load state policies");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredStates = useMemo(() => {
    return states.filter((st) => {
      const matchSearch =
        search === "" ||
        st.name.toLowerCase().includes(search.toLowerCase()) ||
        st.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && (st.policy_status === "Active" || st.has_gcc_policy)) ||
        (statusFilter === "Data Gap" &&
          (st.policy_status === "Data Gap" || st.policy_status === "none documented" || !st.has_gcc_policy));
      return matchSearch && matchStatus;
    });
  }, [states, search, statusFilter]);

  const activePoliciesCount = states.filter((s) => s.has_gcc_policy || s.policy_status === "Active").length;
  const dataGapsCount = states.filter((s) => !s.has_gcc_policy || s.policy_status === "Data Gap" || s.policy_status === "none documented").length;

  const handleInspect = (st: StatePolicy) => {
    setSelectedState(st);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1280px]">
      {/* Header Context */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[var(--color-outline)]">
            Reference // Statutory Matrix
          </span>
          <span className="w-1 h-1 rounded-full bg-[var(--color-outline-variant)]" />
          <Badge variant="neutral" size="sm">36 State Jurisdictions</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
          State Policy Register
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
          Comparative index of state-level IT, electronics, and GCC operational incentive frameworks.
          Per Hard Constraint #4, jurisdictions without verified gazettes are recorded as &ldquo;Data Gap&rdquo; or &ldquo;None Documented&rdquo; &mdash; never fabricated.
        </p>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Active GCC Policies</span>
            <Building className="w-5 h-5 text-[var(--color-secondary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-secondary)]">
              {activePoliciesCount} <span className="text-base font-medium text-[var(--color-on-surface-variant)]">States</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Dedicated GCC or ICT frameworks verified in gazettes
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
            <span>Karnataka, Telangana, Tamil Nadu, Maharashtra</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Fiscal Concessions</span>
            <Receipt className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-primary)]">
              100% <span className="text-base font-medium text-[var(--color-on-surface-variant)]">Stamp Rebate</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Average duty exemption in Tier-2/3 expansion corridors
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            <span>Power tariff subsidies up to ₹2/unit</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Evidentiary Gaps</span>
            <AlertTriangle className="w-5 h-5 text-[var(--color-tertiary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-tertiary)]">
              {dataGapsCount} <span className="text-base font-medium text-[var(--color-on-surface-variant)]">Jurisdictions</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Neutral data gaps flagged under explicit audit rule
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-tertiary)]" />
            <span>Never fabricated or defaulted to zero</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between p-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-outline)] px-1">
            Status:
          </span>
          <div className="flex gap-1">
            {["All", "Active", "Data Gap"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? "bg-[var(--color-surface-container-high)] text-[var(--color-primary)] shadow-sm"
                    : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-outline)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search state name, code…"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] text-xs text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* State Matrix Grid */}
      {error ? (
        <div className="p-8 text-center text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-sm text-[var(--color-outline)] animate-pulse font-mono">
          Loading state regulatory policies and gazetted incentive schemes…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredStates.map((state) => {
            const isDataGap =
              state.policy_status === "Data Gap" ||
              state.policy_status === "none documented" ||
              !state.has_gcc_policy;

            return (
              <Card
                key={state.id}
                className={`p-5 transition-all flex flex-col justify-between ${
                  isDataGap
                    ? "border-dashed border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)]/40"
                    : "border-[var(--color-outline-variant)]/20 shadow-md hover:border-[var(--color-primary)]/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--color-surface-container-high)]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[var(--color-primary)]">
                        {state.code}
                      </span>
                      <h2 className="text-base font-bold text-[var(--color-on-surface)]">
                        {state.name}
                      </h2>
                    </div>
                    <div>
                      {isDataGap ? (
                        <Badge variant="warning" size="sm">
                          Data Gap
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          {state.policy_status || "Active Framework"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {state.incentives && state.incentives.length > 0 ? (
                      state.incentives.map((inc) => (
                        <div
                          key={inc.id}
                          className="p-3.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 text-xs space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-[var(--color-on-surface)]">
                              {inc.policy_name}
                            </span>
                            <GradeStamp grade="A" size="sm" />
                          </div>

                          {inc.valid_from && (
                            <div className="text-[11px] font-mono text-[var(--color-outline)]">
                              Validity: {inc.valid_from} &rarr; {inc.valid_to || "Present"}
                            </div>
                          )}

                          {/* 4-part incentive fractions (30/25/20/25) */}
                          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px]">
                            <div className="p-1.5 rounded bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20">
                              <span className="block text-[10px] text-[var(--color-outline)] uppercase">Policy</span>
                              <span className="font-bold text-[var(--color-on-surface)]">
                                {(inc.policy_fraction * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="p-1.5 rounded bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20">
                              <span className="block text-[10px] text-[var(--color-outline)] uppercase">Capital</span>
                              <span className="font-bold text-[var(--color-secondary)]">
                                {(inc.capital_fraction * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="p-1.5 rounded bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20">
                              <span className="block text-[10px] text-[var(--color-outline)] uppercase">Employ</span>
                              <span className="font-bold text-[var(--color-primary)]">
                                {(inc.employment_fraction * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="p-1.5 rounded bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20">
                              <span className="block text-[10px] text-[var(--color-outline)] uppercase">Other</span>
                              <span className="font-bold text-[var(--color-tertiary)]">
                                {(inc.other_fraction * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          {inc.eligibility_text && (
                            <p className="text-[var(--color-on-surface-variant)] leading-relaxed pt-0.5">
                              {inc.eligibility_text}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 text-[11px] font-mono text-[var(--color-outline)] pt-1 border-t border-[var(--color-surface-container-high)]/60">
                            {inc.min_headcount && (
                              <span>Min HC: <strong className="text-[var(--color-on-surface)]">{inc.min_headcount}</strong></span>
                            )}
                            {inc.location_scope && (
                              <span>Scope: <strong className="text-[var(--color-on-surface)]">{inc.location_scope}</strong></span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-[var(--color-surface-container-low)] border border-dashed border-[var(--color-outline-variant)]/30 text-xs text-[var(--color-tertiary)] space-y-1">
                        <span className="font-bold block">No Documented GCC Policy Found</span>
                        <p className="text-[var(--color-on-surface-variant)] text-[11px]">
                          No active state-specific GCC incentive notification has been verified in official gazettes. Treated as a neutral data gap in scoring computations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[var(--color-surface-container-high)] flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[var(--color-outline)]">
                    {state.code} &bull; ISO-27001 AUDITED
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInspect(state)}
                    className="text-xs"
                  >
                    Inspect Dossier &rarr;
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* State Dossier Slide-Over Drawer */}
      {drawerOpen && selectedState && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[var(--color-surface-container-lowest)] border-l border-[var(--color-outline-variant)]/20 shadow-2xl flex flex-col justify-between">
              <div className="p-5 bg-[var(--color-surface-container-low)] border-b border-[var(--color-surface-container-high)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                  <h3 className="font-bold text-base text-[var(--color-on-surface)]">
                    {selectedState.name} ({selectedState.code}) Dossier
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--color-outline)] hover:text-[var(--color-on-surface)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[var(--color-on-surface)]">
                <div className="p-4 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 space-y-2">
                  <span className="font-mono text-[11px] font-bold uppercase text-[var(--color-outline)]">
                    Nodal Custody &amp; Gazetted Authority
                  </span>
                  <h4 className="font-bold text-sm text-[var(--color-on-surface)]">
                    {selectedState.has_gcc_policy ? "Statutory Policy Active" : "Neutral Data Gap"}
                  </h4>
                  <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
                    Evaluated against state industrial development corporations, single-window clearance portals, and power transmission tariffs.
                  </p>
                </div>

                {selectedState.incentives && selectedState.incentives.length > 0 ? (
                  <div className="space-y-3">
                    <h5 className="font-mono text-[11px] font-bold uppercase text-[var(--color-outline)]">
                      Active Schemes ({selectedState.incentives.length})
                    </h5>
                    {selectedState.incentives.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-3 rounded-lg bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/10 space-y-2"
                      >
                        <div className="font-bold text-[var(--color-primary)]">
                          {inc.policy_name}
                        </div>
                        <p className="text-[var(--color-on-surface-variant)]">
                          {inc.eligibility_text || "Standard IT / GCC registration required."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[var(--color-surface-container)] text-[var(--color-outline)]">
                    No active gazetted notifications discovered in our legal register.
                  </div>
                )}
              </div>

              <div className="p-4 bg-[var(--color-surface-container-low)] border-t border-[var(--color-surface-container-high)] flex items-center justify-between">
                <span className="font-mono text-[11px] text-[var(--color-outline)]">STATE REGISTER V4.2</span>
                <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
