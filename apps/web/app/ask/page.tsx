"use client";

import { useState } from "react";
import { useEvidence } from "@/lib/evidence-context";
import { api, AskResponse } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import { Sparkles, Send, AlertTriangle, ShieldCheck, Clock, BookOpen, Quote } from "lucide-react";

const SUGGESTED_QUERIES = [
  "How many GCCs currently operate in India?",
  "What is the average establishment cost in Bangalore vs Hyderabad?",
  "Which state offers the highest capital subsidy for GCCs?",
  "What regulatory compliance is needed under RBI FDI reporting?",
];

export default function AskPage() {
  const { evidenceParams, floor, directOnly } = useEvidence();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await api.askLedger({
        question: q,
        floor: evidenceParams.floor,
        direct_only: evidenceParams.direct_only,
      });
      setResponse(res);
      if (queryText) setQuestion(queryText);
    } catch (err: any) {
      setError(err.message || "Failed to process query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Evidence-Filtered Grounded Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Ask the Ledger
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Queries are strictly filtered against your Evidence Floor ({floor}) and answered exclusively
          from approved, verified public source snapshots. The model never fabricates figures.
        </p>
      </div>

      {/* Query Input Card */}
      <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask any question regarding GCC counts, state incentives, operational costs, or regulatory compliance…"
              className="w-full p-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 resize-none"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-3 bottom-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
            >
              <span>{loading ? "Grounding…" : "Ask"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => handleAsk(sq)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800 text-slate-700 dark:text-slate-300 transition-colors text-left"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-6">
          {response.refused ? (
            <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Evidence Below Floor / Refusal Notice</span>
              </div>
              <p className="text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
                {response.answer}
              </p>
              {response.refusal_reason && (
                <div className="text-xs text-amber-800 dark:text-amber-300 font-mono pt-2 border-t border-amber-200 dark:border-amber-900/60">
                  Refusal Reason: {response.refusal_reason}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Grounded Answer
                  </span>
                  {response.lowest_grade_relied_on && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-[11px] text-slate-400">Lowest grade relied on:</span>
                      <GradeStamp grade={response.lowest_grade_relied_on} size="sm" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{response.latency_ms} ms</span>
                </div>
              </div>

              {/* Answer content */}
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {response.answer}
              </div>

              {/* Citations section */}
              {response.citations && response.citations.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Citations & Verified Passages ({response.citations.length})</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {response.citations.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {c.source_title} &mdash; <span className="font-normal text-slate-500">{c.publisher}</span>
                          </div>
                          <GradeStamp grade={c.grade} size="sm" />
                        </div>
                        <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 italic">
                          <Quote className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                          <span>&ldquo;{c.excerpt}&rdquo;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
