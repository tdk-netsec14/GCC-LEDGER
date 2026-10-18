"use client";

import { useEffect, useState, useMemo } from "react";
import { api, StatePolicy } from "@/lib/api";
import { MapPin, Search, ShieldAlert, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";

export default function StatesPage() {
  const [states, setStates] = useState<StatePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

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
        (statusFilter === "Active" && st.policy_status === "Active") ||
        (statusFilter === "Data Gap" &&
          (st.policy_status === "Data Gap" || st.policy_status === "none documented"));
      return matchSearch && matchStatus;
    });
  }, [states, search, statusFilter]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            State Policy Register
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Comparative index of state-level IT, electronics, and GCC operational incentive frameworks.
          Per Hard Constraint #4, jurisdictions without verified gazettes are recorded as
          &ldquo;Data Gap&rdquo; or &ldquo;None Documented&rdquo; &mdash; never fabricated or defaulted to zero.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Policy Status:
          </span>
          <div className="flex gap-1">
            {["All", "Active", "Data Gap"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search state name, code…"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
          Loading state regulatory policies and incentive schemes…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStates.map((state) => {
            const isDataGap =
              state.policy_status === "Data Gap" ||
              state.policy_status === "none documented" ||
              !state.has_gcc_policy;

            return (
              <div
                key={state.id}
                className={`p-5 rounded-xl border transition-all ${
                  isDataGap
                    ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80"
                    : "bg-white dark:bg-slate-900 border-indigo-100 dark:border-slate-800 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {state.code}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {state.name}
                    </h2>
                  </div>
                  <div>
                    {isDataGap ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Data Gap</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{state.policy_status}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {state.incentives && state.incentives.length > 0 ? (
                    state.incentives.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2"
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {inc.policy_name}
                        </div>
                        {inc.valid_from && (
                          <div className="text-[11px] font-mono text-slate-500">
                            Validity: {inc.valid_from} &rarr; {inc.valid_to || "Present"}
                          </div>
                        )}

                        {/* Four-part incentive component breakdown (30/25/20/25) */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
                          <div className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                            <span className="block text-[10px] text-slate-400">Policy</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {(inc.policy_fraction * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                            <span className="block text-[10px] text-slate-400">Capital</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {(inc.capital_fraction * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                            <span className="block text-[10px] text-slate-400">Employ</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {(inc.employment_fraction * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                            <span className="block text-[10px] text-slate-400">Other</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {(inc.other_fraction * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {inc.eligibility_text && (
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                            {inc.eligibility_text}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                          {inc.min_headcount && (
                            <span>Min headcount: <strong>{inc.min_headcount}</strong></span>
                          )}
                          {inc.location_scope && (
                            <span>Scope: <strong>{inc.location_scope}</strong></span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-dashed border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                      <span className="font-semibold block">No Documented GCC Policy Found</span>
                      <p>
                        No active state-specific GCC incentive notification has been verified in official gazettes.
                        Treated as a neutral data gap in scoring computations.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
