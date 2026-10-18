"use client";

import React, { useEffect, useState } from "react";
import { api, Company, PaginatedCompanies } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { GradeStamp } from "@/components/GradeStamp";
import { HiddenCount } from "@/components/HiddenCount";
import { EmptyState } from "@/components/EmptyState";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

export default function DirectoryPage() {
  const { floor, directOnly } = useEvidence();

  const [data, setData] = useState<PaginatedCompanies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Lead Submission Modal
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadCompany, setLeadCompany] = useState("");
  const [leadCity, setLeadCity] = useState("Bengaluru");
  const [leadStatus, setLeadStatus] = useState("announced");
  const [leadUrl, setLeadUrl] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccessMsg, setLeadSuccessMsg] = useState<string | null>(null);

  const fetchDirectory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDirectory({
        floor,
        direct_only: directOnly,
        q: search || undefined,
        city: cityFilter || undefined,
        status: statusFilter || undefined,
        page,
        page_size: 20,
      });
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [floor, directOnly, cityFilter, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDirectory();
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCompany || !leadCity) return;
    setSubmittingLead(true);
    try {
      const res = await api.submitLead({
        company_name: leadCompany,
        city: leadCity,
        status: leadStatus,
        source_url: leadUrl || undefined,
      });
      setLeadSuccessMsg(res.message);
      setLeadCompany("");
      setLeadUrl("");
      setTimeout(() => {
        setLeadModalOpen(false);
        setLeadSuccessMsg(null);
        fetchDirectory();
      }, 2500);
    } catch (err: any) {
      alert(err?.message || "Lead submission failed.");
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Lead Action */}
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            GCC Directory
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Directory of active, expanding, and announced captive centers in India, with rigorous captive validation to exclude third-party IT outsourcing delivery hubs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLeadModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Submit a Lead
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company name, sector, or reason..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="">All Cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Chennai">Chennai</option>
            <option value="Gurugram">Gurugram</option>
            <option value="Noida">Noida</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="">All Presence Statuses</option>
            <option value="landed">Landed</option>
            <option value="expanding">Expanding</option>
            <option value="announced">Announced</option>
            <option value="not_captive">Not a Captive</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Hidden Count Alert */}
      {data && <HiddenCount count={data.hidden_count} itemName="companies" />}

      {/* Main Directory Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-400 mr-2" />
          <span className="text-xs text-slate-500">Loading verified directory records...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-xs text-red-700 rounded-lg">{error}</div>
      ) : data?.items.length === 0 ? (
        <EmptyState
          title="No companies match the current criteria"
          message="No directory entries match your search filters and evidence floor. Try broadening your query or lowering the evidence floor."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">HQ & Sector</th>
                  <th className="py-3 px-4">Captive Test Status</th>
                  <th className="py-3 px-4">Indian Footprint</th>
                  <th className="py-3 px-4">Evidence Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.items.map((company) => {
                  const isCaptive = company.captive_status === "yes";
                  const isNotCaptive = company.captive_status === "no";

                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {company.name}
                        </div>
                        {company.captive_reason && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1" title={company.captive_reason}>
                            {company.captive_reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <div>{company.hq_country || "Global"}</div>
                        <div className="text-[11px] text-slate-400">{company.sector || "Enterprise"}</div>
                      </td>

                      <td className="py-3 px-4">
                        {isCaptive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Wholly Owned Captive
                          </span>
                        ) : isNotCaptive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <ShieldAlert className="w-3 h-3" />
                            Not a Captive (Services)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                            Unreviewed Lead
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {company.records.map((r) => (
                            <span
                              key={r.id}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {r.city_name} · <span className="capitalize">{r.status}</span>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <GradeStamp grade={company.grade} relayed={company.relayed} size="sm" showLabel />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Submission Modal */}
      {leadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit a GCC Directory Lead
              </h3>
              <button
                type="button"
                onClick={() => setLeadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {leadSuccessMsg ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{leadSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    placeholder="e.g. Acme Tech Solutions India"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={leadCity}
                      onChange={(e) => setLeadCity(e.target.value)}
                      placeholder="e.g. Hyderabad"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={leadStatus}
                      onChange={(e) => setLeadStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="announced">Announced</option>
                      <option value="landed">Landed</option>
                      <option value="expanding">Expanding</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supporting Source Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={leadUrl}
                    onChange={(e) => setLeadUrl(e.target.value)}
                    placeholder="https://... (http/https only; others sanitized)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Only http and https links are accepted. Leads start at Grade D (Unreviewed).
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setLeadModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submittingLead ? "Submitting..." : "Submit to Review Queue"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
