"use client";

import { useEffect, useState, useMemo } from "react";
import { useEvidence } from "@/lib/evidence-context";
import { api, DocumentItem } from "@/lib/api";
import GradeStamp from "@/components/GradeStamp";
import SourceLink from "@/components/SourceLink";
import EmptyState from "@/components/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  Search,
  ExternalLink,
  AlertCircle,
  Filter,
  Milestone,
  Clock,
  CheckCircle,
  FileCode2,
  Building,
  ArrowRight
} from "lucide-react";

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
    <div className="space-y-8 animate-fade-in max-w-[1280px]">
      {/* Header Context */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[var(--color-secondary)] bg-[var(--color-surface-container-high)] px-2 py-0.5 rounded">
            Statutory Protocol · MCA &amp; RBI Verified
          </span>
          <span className="font-mono text-[11px] text-[var(--color-outline)]">
            DOC-ID: GCC-IN-REG-2024
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
          What is the statutory sequence to incorporate and operationalise a captive?
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-on-surface-variant)] max-w-3xl leading-relaxed">
          Setup guide and regulatory document repository from foreign parent board resolution to SEZ/STPI bonded warehouse green-channeling. All statutory filings mapped to gazetted circulars.
        </p>
      </div>

      {/* 3 KPI Roadmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Statutory Steps</span>
            <Milestone className="w-5 h-5 text-[var(--color-secondary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-secondary)]">
              {documents.length || 20} <span className="text-base font-medium text-[var(--color-on-surface-variant)]">Filings</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              End-to-end regulatory compliance roadmap
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]" />
            <span>Pre-incorporation through SEZ activation</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Median Duration</span>
            <Clock className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-primary)]">
              90 <span className="text-base font-medium text-[var(--color-on-surface-variant)]">Days</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Statutory timeline with parallel processing
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
            <span>SPICe+ MCA-21 fast-track pipeline</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--color-outline)]">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">Digital Execution</span>
            <CheckCircle className="w-5 h-5 text-[var(--color-tertiary)]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black font-mono text-[var(--color-tertiary)]">
              100% <span className="text-base font-medium text-[var(--color-on-surface-variant)]">Online</span>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Direct digital submission on central statutory portals
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-[var(--color-outline)] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-tertiary)]" />
            <span>MCA-21, FIRMS RBI, STPI, EPFO</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between p-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--color-outline)] px-1 shrink-0">
            Phase:
          </span>
          <div className="flex gap-1">
            {groups.map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGroup === grp
                    ? "bg-[var(--color-surface-container-high)] text-[var(--color-primary)] shadow-sm"
                    : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-outline)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms, authorities…"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] text-xs text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {error ? (
        <div className="p-8 text-center text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-sm text-[var(--color-outline)] animate-pulse font-mono">
          Loading statutory sequence and regulatory documentation…
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title="No regulatory documents match your filter"
          description="Try broadening your search or adjusting the Evidence Floor."
          onLowerFloor={() => setFloor("D")}
          onDisableDirectOnly={() => setDirectOnly(false)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDocs.map((doc) => (
            <Card
              key={doc.id}
              className="p-5 flex flex-col justify-between border-[var(--color-outline-variant)]/20 shadow-md hover:border-[var(--color-primary)]/40 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-[var(--color-surface-container-high)] text-[var(--color-primary)]">
                      {doc.step ? `Step ${doc.step}` : "Milestone"}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {doc.group}
                    </Badge>
                  </div>
                  <GradeStamp grade={doc.grade} size="sm" showLabel />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[var(--color-on-surface)]">
                    {doc.title}
                  </h2>
                  <div className="text-xs font-mono text-[var(--color-outline)] mt-1">
                    Authority: <span className="text-[var(--color-on-surface)] font-semibold">{doc.issuing_authority}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                  {doc.purpose}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-surface-container-high)] flex items-center justify-between text-xs font-mono text-[var(--color-outline)]">
                <span>Verified: {doc.last_checked_on || "2024-Q3"}</span>
                {doc.portal_url && (
                  <SourceLink url={doc.portal_url} label="Official Portal" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
