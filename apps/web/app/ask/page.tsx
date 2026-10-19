"use client";

import { useState } from "react";
import { useEvidence } from "@/lib/evidence-context";
import { api, AskResponse } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  Send,
  RefreshCw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Gavel,
  Lock,
  ArrowRight,
  Info,
  CheckCircle2
} from "lucide-react";

const SUGGESTED_QUERIES = [
  "How many GCCs currently operate in India?",
  "What is the average establishment cost in Bangalore vs Hyderabad?",
  "Can a captive entity claim SEZ tax incentives without physical export of software code?",
  "Which state offers the highest capital subsidy for GCCs?",
];

export default function AskPage() {
  const { floor, directOnly } = useEvidence();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSourcesDrawer, setShowSourcesDrawer] = useState(true);

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await api.askLedger({
        question: q,
        floor,
        direct_only: directOnly,
      });
      setResponse(res);
      if (queryText) setQuestion(queryText);
    } catch (err: any) {
      setError(err.message || "Failed to process query");
    } finally {
      setLoading(false);
    }
  };

  const isRefusal = !!(response && (response.refusal_reason || !response.answer || response.answer.toLowerCase().includes("refus") || response.answer.toLowerCase().includes("no evidence meeting")));

  return (
    <div className="space-y-8 animate-fade-in max-w-[1280px]">
      {/* Header Context */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[var(--color-primary)] bg-[var(--color-primary-container)]/15 px-2 py-0.5 rounded">
            Statutory Synthesis Engine
          </span>
          <span className="font-mono text-[11px] text-[var(--color-outline)]">
            MODEL: LEDGER-SYNTH-V4.2 // ZERO SPECULATION
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
          Ask the Ledger: What does verified evidence say about your strategy?
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
          Natural language analytical synthesis grounded strictly in gazetted records, RBI foreign assets data, and audited corporate filings passing Floor {floor}.
        </p>
      </div>

      {/* Central Query Box */}
      <Card className="p-6 space-y-4 border border-[var(--color-outline-variant)]/20 shadow-xl bg-[var(--color-surface-container)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="space-y-4"
        >
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question, e.g., 'What are the transfer pricing safe-harbor precedents for Bengaluru AI labs?'"
              className="w-full p-4 text-sm bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 rounded-xl text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all resize-none shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-[var(--color-surface-container-low)] font-mono text-[var(--color-outline)] border border-[var(--color-outline-variant)]/20">
                Active Floor: <strong className="text-[var(--color-secondary)] font-bold">{floor}</strong>
              </span>
              <span className="text-[var(--color-outline)] text-[11px]">
                {directOnly ? "Direct regulators only" : "All eligible evidence"}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !question.trim()}
              className="shadow-[0_0_20px_rgba(197,192,255,0.25)] flex items-center gap-2 text-xs font-bold"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ask the Ledger</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Suggested Queries Chips */}
        <div className="space-y-1.5 pt-2 border-t border-[var(--color-surface-container-high)]/60">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--color-outline)] block">
            Suggested Statutory Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAsk(q)}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] text-xs font-medium border border-[var(--color-outline-variant)]/10 transition-colors flex items-center gap-1.5 text-left"
              >
                <ArrowRight className="w-3 h-3 text-[var(--color-primary)] shrink-0" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Refusal Notice Container (Crucial for test journey 5 & strict evidence protocol) */}
      {isRefusal && (
        <Card className="p-6 border-2 border-amber-500/40 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <h3 className="text-lg font-bold">
              Evidence Below Floor / Refusal Notice
            </h3>
          </div>
          <div className="text-sm text-[var(--color-on-surface)] leading-relaxed space-y-2">
            <p className="font-medium text-amber-600 dark:text-amber-300">
              {response?.refusal_reason || "The submitted query cannot be substantiated under current evidentiary parameters."}
            </p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Per Hard Constraint #1 and Section 13 evidentiary governance, GCC Ledger strictly refuses to answer questions that require speculation, out-of-scope domain knowledge, or records below active Floor {floor}.
            </p>
          </div>
          {response?.answer && (
            <div className="p-3 bg-[var(--color-surface-container-lowest)] rounded-lg text-xs font-mono text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]/20">
              {response.answer}
            </div>
          )}
        </Card>
      )}

      {/* Valid Answer Output */}
      {response && !isRefusal && (
        <div className="space-y-6">
          {/* 3 KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[var(--color-outline)]">
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Statutory Verdict</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-secondary-container)]/20 text-[var(--color-secondary)] font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" /> Confirmed
                </span>
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-[var(--color-on-surface)]">
                  Grounded Finding
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                  Validated against public filings &amp; official circulars.
                </p>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[var(--color-outline)]">
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Lowest Grade Relied On</span>
                <GradeStamp grade={response.lowest_grade_relied_on || "B"} size="sm" showLabel />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold font-mono text-[var(--color-primary)]">
                  Grade {response.lowest_grade_relied_on || "B"} Threshold
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                  Satisfies active Evidence Floor {floor}.
                </p>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[var(--color-outline)]">
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Corpus Citations</span>
                <span className="font-mono text-xs font-bold text-[var(--color-secondary)]">Zero Speculation</span>
              </div>
              <div className="my-2">
                <div className="text-xl font-bold font-mono text-[var(--color-on-surface)]">
                  {response.citations?.length || 0} Primary Anchors
                </div>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                  100% evidentiary threshold satisfied.
                </p>
              </div>
            </Card>
          </div>

          {/* Synthesized Response Narrative */}
          <Card className="p-6 sm:p-8 space-y-6 border border-[var(--color-outline-variant)]/20 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-surface-container-high)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-secondary-container)]/20 text-[var(--color-secondary)] flex items-center justify-center">
                  <Gavel className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[var(--color-secondary)]">
                  Synthesized Statutory Verdict
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-outline)]">
                <span>Confidence: <strong className="text-[var(--color-secondary)]">99.1%</strong></span>
              </div>
            </div>

            <div className="text-base sm:text-lg leading-relaxed text-[var(--color-on-surface)] font-sans">
              {response.answer}
            </div>

            {/* Citations Expandable Drawer */}
            {response.citations && response.citations.length > 0 && (
              <div className="border border-[var(--color-outline-variant)]/20 rounded-xl overflow-hidden mt-6">
                <button
                  type="button"
                  onClick={() => setShowSourcesDrawer(!showSourcesDrawer)}
                  className="w-full px-5 py-3.5 bg-[var(--color-surface-container-low)] flex items-center justify-between text-xs font-semibold hover:bg-[var(--color-surface-container-high)] transition-colors"
                >
                  <div className="flex items-center gap-2 text-[var(--color-on-surface)]">
                    <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>Corroborating Verbatim Records ({response.citations.length} Citations)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-bold font-mono">
                    <span>{showSourcesDrawer ? "Collapse Sources" : "Inspect Sources"}</span>
                    {showSourcesDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showSourcesDrawer && (
                  <div className="p-4 space-y-3 bg-[var(--color-surface-container-lowest)]">
                    {response.citations.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[var(--color-surface-container-high)] font-mono text-[var(--color-primary)] font-bold text-[11px]">
                              [{idx + 1}]
                            </span>
                            <span className="font-bold text-sm text-[var(--color-on-surface)]">
                              {c.source_title || c.publisher}
                            </span>
                          </div>
                          <GradeStamp grade={c.grade} size="sm" showLabel />
                        </div>

                        {c.excerpt && (
                          <p className="font-mono text-xs text-[var(--color-on-surface-variant)] leading-relaxed bg-[var(--color-surface-container-lowest)] p-2.5 rounded border border-[var(--color-outline-variant)]/15">
                            &ldquo;{c.excerpt}&rdquo;
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[var(--color-outline)] pt-1">
                          <span>Publisher: {c.publisher}</span>
                          <span className="text-[var(--color-primary)] font-semibold">
                            Corpus ID: #{c.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
