"use client";

import { useEffect, useState } from "react";
import { api, ProviderItem } from "@/lib/api";
import { Award, ShieldCheck, ExternalLink, PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [sort, setSort] = useState<"proof" | "tier">("proof");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Engagement submission modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [clientName, setClientName] = useState("");
  const [scope, setScope] = useState("");
  const [year, setYear] = useState("2024");
  const [footprintUrl, setFootprintUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchProviders = () => {
    setLoading(true);
    api
      .getProviders(sort)
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

  const handleOpenModal = (provider: ProviderItem) => {
    setSelectedProvider(provider);
    setSubmitSuccess(null);
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmitEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    setSubmitting(true);
    setModalError(null);
    try {
      const res = await api.submitEngagement(selectedProvider.id, {
        client_name: clientName,
        scope,
        year: year ? parseInt(year, 10) : undefined,
        footprint_url: footprintUrl || undefined,
      });
      setSubmitSuccess(res.message);
      setClientName("");
      setScope("");
      setFootprintUrl("");
      setTimeout(() => {
        setShowModal(false);
        fetchProviders();
      }, 1500);
    } catch (err: any) {
      setModalError(err.message || "Failed to submit engagement for verification");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Provider Proof
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Neutral, evidence-backed evaluation of setup advisors and legal/real-estate partners.
          Ranks partners by empirical verification ratio using Laplace-smoothed proof:
          (verified + 1) / (claimed + 2).
        </p>
      </div>

      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-semibold block mb-0.5">Fictional Demonstration Notice</span>
          Per hard constraint #4, all advisory entities in the seed dataset are labelled fictional
          to demonstrate verification mechanics without ungrounded endorsements. Engagements only
          transition to &ldquo;verified&rdquo; when public footprint checks and client confirmations are both completed.
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Ranked Advisors ({providers.length})
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Sort by:</span>
          <button
            type="button"
            onClick={() => setSort("proof")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              sort === "proof"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Proof Ratio (Laplace)
          </button>
          <button
            type="button"
            onClick={() => setSort("tier")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              sort === "tier"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Fee Tier
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
          Calculating proof ratios and verifying engagement records…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Advisor / Partner</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fee Tier</th>
                <th className="py-3 px-4 text-center">Claimed</th>
                <th className="py-3 px-4 text-center">Verified</th>
                <th className="py-3 px-4 text-right">Proof Ratio</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {providers.map((p) => {
                const ratioPct = (p.proof_ratio * 100).toFixed(1);
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{p.rank}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                        (Fictional seed entity)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {p.category}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.fee_tier || "Unspecified"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-400">
                      {p.claimed_engagements}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {p.verified_engagements}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                            style={{ width: `${Math.min(100, p.proof_ratio * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 w-12 text-right">
                          {ratioPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(p)}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Verify
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Verification submission modal */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Submit Engagement Proof
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Submitting engagement claim for <strong className="text-slate-900 dark:text-slate-100">{selectedProvider.name}</strong>.
              New submissions start at Grade D in the unreviewed state and require secondary verification.
            </p>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
                {modalError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEngagement} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Client / GCC Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Acme Financial Technologies"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Scope of Engagement *
                </label>
                <input
                  type="text"
                  required
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="e.g. Turnkey 250-seat setup + SEZ compliance"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Year Completed
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min="2015"
                    max="2030"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Public Footprint URL
                  </label>
                  <input
                    type="url"
                    value={footprintUrl}
                    onChange={(e) => setFootprintUrl(e.target.value)}
                    placeholder="https://press-release..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit for Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
