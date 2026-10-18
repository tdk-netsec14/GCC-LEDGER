"use client";

import { useEffect, useState, useMemo } from "react";
import { useEvidence } from "@/lib/evidence-context";
import { api, DocumentItem } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import SourceLink from "@/components/SourceLink";
import EmptyState from "@/components/EmptyState";
import { FileText, Search, ExternalLink, AlertCircle, Filter } from "lucide-react";

export default function DocumentsPage() {
  const { evidenceParams, setFloor, setDirectOnly } = useEvidence();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getDocuments(evidenceParams)
      .then((data) => {
        if (!active) return;
        setDocuments(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load document library");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [evidenceParams]);

  const groups = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => set.add(d.group));
    return ["All", ...Array.from(set)];
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      const matchGroup = selectedGroup === "All" || d.group === selectedGroup;
      const matchSearch =
        search === "" ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.issuing_authority.toLowerCase().includes(search.toLowerCase()) ||
        d.purpose.toLowerCase().includes(search.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [documents, selectedGroup, search]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Document Library
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Standard statutory forms, filings, and regulatory templates required during incorporation,
          RBI capitalisation, SEZ admission, and transfer pricing compliance.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex flex-wrap gap-1">
            {groups.map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedGroup === grp
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {grp}
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
            placeholder="Search forms, authorities…"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
          Loading statutory forms and compliance documentation…
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title="No regulatory documents match your filter"
          description="Try broadening your search or adjusting the Evidence Floor."
          onLowerFloor={() => setFloor("D")}
          onDisableDirectOnly={() => setDirectOnly(false)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {doc.group} &bull; {doc.step}
                  </span>
                  <GradeStamp grade={doc.grade} size="sm" />
                </div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {doc.title}
                </h2>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Authority: <span className="text-slate-700 dark:text-slate-300">{doc.issuing_authority}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {doc.purpose}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Verified: {doc.last_checked_on || "—"}</span>
                {doc.portal_url && (
                  <SourceLink url={doc.portal_url} label="Official Portal" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
