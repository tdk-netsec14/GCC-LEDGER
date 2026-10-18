"use client";

import { useEffect, useState } from "react";
import { useEvidence } from "@/lib/evidence-context";
import { api, SourceItem } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import SourceLink from "@/components/SourceLink";
import HiddenCount from "@/components/HiddenCount";
import EmptyState from "@/components/EmptyState";
import { Library, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";

export default function SourcesPage() {
  const { evidenceParams, setFloor, setDirectOnly } = useEvidence();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getSources(evidenceParams)
      .then((data) => {
        if (!active) return;
        setSources(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load source register");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [evidenceParams]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Library className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Source Register
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          The official ledger of primary gazettes, regulatory portals, and secondary publications.
          In accordance with Hard Constraint #6, URLs are stored with verification timestamps, and only
          direct regulator portals (such as RBI FIRMS) are pre-confirmed.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <span className="font-semibold block mb-0.5">Primary Source Verification Protocol</span>
          Grade A records strictly require government or regulator origin paired with an immutable local snapshot.
          Secondary sources (Grades B–D) are retained for industry consensus and contradiction resolution.
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
          Loading verified sources and public registries…
        </div>
      ) : sources.length === 0 ? (
        <EmptyState
          title="No sources at this Evidence Floor"
          description="Adjust your Evidence Floor to include secondary and industry reports."
          onLowerFloor={() => setFloor("D")}
          onDisableDirectOnly={() => setDirectOnly(false)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4">Publisher</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Title / Publication</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4">Last Checked</th>
                <th className="py-3 px-4 text-right">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sources.map((src) => (
                <tr
                  key={src.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {src.publisher}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {src.publisher_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                    {src.title}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <GradeStamp grade={src.default_grade} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {src.published_on || "—"}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {src.last_checked_on || "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <SourceLink url={src.url} label="Visit" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
