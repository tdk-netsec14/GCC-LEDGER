"use client";

import { useEffect, useState } from "react";
import { api, ProviderItem } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  ShieldCheck,
  TrendingDown,
  Award,
  SlidersHorizontal,
  X,
  FileCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Info
} from "lucide-react";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [sort, setSort] = useState<"proof" | "tier">("proof");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Engagement Verification Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [clientName, setClientName] = useState("");
  const [scope, setScope] = useState("");
  const [year, setYear] = useState("2024");
  const [footprintUrl, setFootprintUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Slide-over Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"methodology" | "audit">("audit");
  const [activeAuditProvider, setActiveAuditProvider] = useState<ProviderItem | null>(null);

  const fetchProviders = () => {
    setLoading(true);
    api.getProviders(sort)
      .then((res) => {
        setProviders(res.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load provider directory");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProviders();
  }, [sort]);

  const handleOpenVerifyModal = (provider: ProviderItem) => {
    setSelectedProvider(provider);
    setSubmitSuccess(null);
    setShowModal(true);
  };

  const handleOpenAuditDrawer = (provider: ProviderItem) => {
    setActiveAuditProvider(provider);
    setDrawerMode("audit");
    setDrawerOpen(true);
  };

  const handleOpenMethodologyDrawer = () => {
    setDrawerMode("methodology");
    setDrawerOpen(true);
  };

  const handleSubmitEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    setSubmitting(true);
    try {
      await api.submitEngagement(selectedProvider.id, {
        client_name: clientName,
        scope,
        year: year ? parseInt(year, 10) : undefined,
        footprint_url: footprintUrl || undefined,
      });
      setSubmitSuccess("Engagement proof submitted for editorial review.");
      setTimeout(() => {
        setShowModal(false);
        fetchProviders();
      }, 1500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalVerified = providers.reduce((acc, p) => acc + (p.verified_engagements || 0), 0);
  const avgProof = providers.length
    ? Math.round((providers.reduce((acc, p) => acc + (p.proof_ratio || 0), 0) / providers.length) * 100)
    : 0;
  const topProvider = providers[0];

  return (
    <div className="space-y-8 animate-fade-in max-w-[1280px]">
      {/* Header Context & Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[var(--color-outline)]">
              Section 04 // Empirical Pedigree
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-outline-variant)]" />
            <Badge variant="warning" size="sm">
              Fictional Sample Providers for Demonstration
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
            Which service providers have verifiable captive setup pedigree?
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-on-surface-variant)] leading-relaxed">
            Empirical audit of advisory, legal, and BOT partners benchmarked against statutory footprint discoveries.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 shrink-0">
          <button
            type="button"
            id="toggle-proof-ratio"
            onClick={() => setSort("proof")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              sort === "proof"
                ? "bg-[var(--color-surface-container-high)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
            Sort by Proof Ratio
          </button>
          <button
            type="button"
            id="toggle-fee-tier"
            onClick={() => setSort("tier")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              sort === "tier"
                ? "bg-[var(--color-surface-container-high)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Sort by Fee Tier
          </button>
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Audited Providers</span>
            <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-on-surface)]">
              {providers.length} <span className="text-base font-medium text-[var(--color-on-surface-variant)]">firms</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Indexed against bilateral regulatory disclosures
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
            <span>Advisory, BOT &amp; Regulatory Legal Specialists</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Average Proof Ratio</span>
            <TrendingDown className="w-5 h-5 text-[var(--color-tertiary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-tertiary)]">
              {avgProof}%
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Laplace-smoothed against unverified marketing claims
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-tertiary)]" />
            <span>Formula: (Verified + 1) / (Claimed + 2)</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Verified Footprints</span>
            <Award className="w-5 h-5 text-[var(--color-secondary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-secondary)]">
              {totalVerified} <span className="text-base font-medium text-[var(--color-on-surface-variant)]">setups</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Direct statutory records confirmed under empirical audit
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
            <span>MCA-21, EPFO &amp; SEZ dual verified</span>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden border border-[var(--color-outline-variant)]/20 shadow-md">
        <div className="px-5 py-4 bg-[var(--color-surface-container-low)] border-b border-[var(--color-surface-container-high)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--color-on-surface)]">
              Audited Service Providers ({providers.length})
            </h2>
            <Badge variant="neutral" size="sm">Active Roster</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenMethodologyDrawer}
              className="text-xs"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1 text-[var(--color-primary)]" />
              How pedigree is verified
            </Button>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-[var(--color-error)]">
            {error}
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-outline)] animate-pulse">
            Loading verified provider audits…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="provider-table">
              <thead>
                <tr className="bg-[var(--color-surface-container-lowest)] text-[var(--color-outline)] font-mono text-[11px] uppercase tracking-wider border-b border-[var(--color-surface-container-high)]">
                  <th className="py-3 px-5" scope="col">Provider &amp; Category</th>
                  <th className="py-3 px-4" scope="col">Fee Tier</th>
                  <th className="py-3 px-4 text-right" scope="col">Claimed</th>
                  <th className="py-3 px-4 text-right" scope="col">Verified</th>
                  <th className="py-3 px-4 w-52" scope="col">Proof Ratio</th>
                  <th className="py-3 px-4" scope="col">Evidence Grade</th>
                  <th className="py-3 px-5 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-container-high)]/40 text-xs text-[var(--color-on-surface)] font-sans">
                {providers.map((p, idx) => {
                  const pct = Math.round((p.proof_ratio || 0) * 100);
                  const isHigh = pct >= 70;
                  const isMid = pct >= 40 && pct < 70;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--color-surface-container)]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[var(--color-surface-container-high)] flex items-center justify-center font-mono font-bold text-xs text-[var(--color-primary)]">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5">
                              {p.name}
                              {isHigh && (
                                <ShieldCheck className="w-4 h-4 text-[var(--color-secondary)] inline" />
                              )}
                            </div>
                            <div className="text-xs text-[var(--color-outline)]">
                              {p.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]">
                          {p.fee_tier || "Tier 2"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-[var(--color-on-surface)]">
                        {p.claimed_engagements}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--color-secondary)]">
                        {p.verified_engagements}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[var(--color-surface-container-highest)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isHigh
                                  ? "bg-[var(--color-secondary)]"
                                  : isMid
                                  ? "bg-[var(--color-primary)]"
                                  : "bg-[var(--color-error)]"
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-xs font-bold w-12 text-right ${
                              isHigh
                                ? "text-[var(--color-secondary)]"
                                : isMid
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-error)]"
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <GradeStamp
                          grade={isHigh ? "A" : isMid ? "B" : "C"}
                          size="sm"
                          showLabel
                        />
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAuditDrawer(p)}
                            className="text-xs"
                          >
                            Audit trail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenVerifyModal(p)}
                            className="text-xs"
                          >
                            Verify
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 bg-[var(--color-surface-container-low)] border-t border-[var(--color-surface-container-high)] flex items-center justify-between text-xs text-[var(--color-outline)] font-mono">
          <span>Tri-source match verification guaranteed: MCA-21, EPFO workforce rosters, and SEZ registrations.</span>
          <span>Laplace Smoothing (k=1)</span>
        </div>
      </Card>

      {/* Slide-over Audit Trail / Methodology Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[var(--color-surface-container-lowest)] border-l border-[var(--color-outline-variant)]/20 shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-5 bg-[var(--color-surface-container-low)] border-b border-[var(--color-surface-container-high)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[var(--color-primary)]" />
                  <h3 className="font-bold text-base text-[var(--color-on-surface)]">
                    {drawerMode === "methodology" ? "Verification Methodology" : "Provider Audit Record"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[var(--color-on-surface)]">
                {drawerMode === "methodology" ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 space-y-2">
                      <span className="font-mono text-[11px] font-bold uppercase text-[var(--color-primary)]">
                        Protocol Standard v4.2
                      </span>
                      <h4 className="font-bold text-sm text-[var(--color-on-surface)]">
                        Laplace Smoothed Proof Ratio
                      </h4>
                      <p className="font-mono text-[11px] p-2 bg-[var(--color-surface-container-lowest)] rounded border border-[var(--color-outline-variant)]/30 text-[var(--color-secondary)]">
                        Proof Ratio = (Verified Engagements + 1) / (Claimed Engagements + 2)
                      </p>
                      <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
                        Prevents marketing distortion where an unvetted firm with a single claimed engagement claims 100% success.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-mono text-[11px] font-bold uppercase text-[var(--color-outline)]">
                        Verification Gate Criteria
                      </h5>
                      <div className="p-3 rounded-lg bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/10 space-y-1">
                        <span className="font-bold text-[var(--color-secondary)]">1. MCA-21 Regulatory Match</span>
                        <p className="text-[var(--color-on-surface-variant)]">
                          Articles of Association or Director filings formally confirming captive incorporation scope.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/10 space-y-1">
                        <span className="font-bold text-[var(--color-primary)]">2. EPFO Payroll Activation</span>
                        <p className="text-[var(--color-on-surface-variant)]">
                          Electronic challan records proving real workforce operations exceeding threshold headcount.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/10 space-y-1">
                        <span className="font-bold text-[var(--color-tertiary)]">3. SEZ / STPI Commercial Registration</span>
                        <p className="text-[var(--color-on-surface-variant)]">
                          Operational lease and customs bond approvals under Special Economic Zone authority.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : activeAuditProvider ? (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold uppercase text-[var(--color-outline)]">
                          Firm Pedigree
                        </span>
                        <Badge variant="primary" size="sm">ISO-27001 Validated</Badge>
                      </div>
                      <h4 className="text-base font-bold text-[var(--color-on-surface)]">
                        {activeAuditProvider.name}
                      </h4>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-mono text-2xl font-black text-[var(--color-secondary)]">
                          {Math.round((activeAuditProvider.proof_ratio || 0) * 100)}%
                        </span>
                        <span className="text-xs text-[var(--color-outline)]">Empirical Proof Ratio</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-mono text-[11px] font-bold uppercase text-[var(--color-outline)]">
                        Audit Reconciliation Breakdown
                      </h5>
                      <div className="p-3 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-between">
                        <span className="text-[var(--color-on-surface-variant)]">Claimed Setups</span>
                        <span className="font-mono font-bold text-[var(--color-on-surface)]">{activeAuditProvider.claimed_engagements}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-between">
                        <span className="text-[var(--color-on-surface-variant)]">Verified Statutory Charters</span>
                        <span className="font-mono font-bold text-[var(--color-secondary)]">{activeAuditProvider.verified_engagements}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-between">
                        <span className="text-[var(--color-on-surface-variant)]">Discrepancy / Relayed Scopes</span>
                        <span className="font-mono font-bold text-[var(--color-outline)]">
                          {activeAuditProvider.claimed_engagements - activeAuditProvider.verified_engagements}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--color-surface-container-high)]/40 border border-[var(--color-outline-variant)]/20 text-[var(--color-outline)] flex items-start gap-2">
                      <Info className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <span>All records verified under ISO-27001 evidentiary standard. Data immutable on GCC ledger state register.</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-[var(--color-surface-container-low)] border-t border-[var(--color-surface-container-high)] flex items-center justify-between">
                <span className="font-mono text-[11px] text-[var(--color-outline)]">IMMUTABLE LOG</span>
                <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Lead Modal */}
      <Modal
        isOpen={showModal && !!selectedProvider}
        onClose={() => setShowModal(false)}
        title={`Submit Engagement Proof: ${selectedProvider?.name}`}
      >
        <form onSubmit={handleSubmitEngagement} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[var(--color-on-surface)] block mb-1">
              GCC Client Organization Name
            </label>
            <Input
              required
              placeholder="e.g. Acme Global Technology Captive"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-[var(--color-on-surface)] block mb-1">
              Engagement Scope &amp; Deliverable
            </label>
            <Input
              required
              placeholder="e.g. Turnkey SEZ setup, incorporation, EPFO onboarding"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[var(--color-on-surface)] block mb-1">
                Calendar Year
              </label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div>
              <label className="font-semibold text-[var(--color-on-surface)] block mb-1">
                Proof Document URL (optional)
              </label>
              <Input
                type="url"
                placeholder="https://mca.gov.in/..."
                value={footprintUrl}
                onChange={(e) => setFootprintUrl(e.target.value)}
              />
            </div>
          </div>

          {submitSuccess && (
            <div className="p-3 bg-[var(--color-secondary-container)]/20 border border-[var(--color-secondary)]/30 text-[var(--color-secondary)] rounded-lg font-medium">
              {submitSuccess}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Proof"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
