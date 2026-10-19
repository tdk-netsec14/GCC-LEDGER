"use client";

import React, { useEffect, useState } from "react";
import { api, Company, PaginatedCompanies } from "@/lib/api";
import { useEvidence } from "@/lib/evidence-context";
import { GradeStamp } from "@/components/GradeStamp";
import { HiddenCount } from "@/components/HiddenCount";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Building2,
  Search,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";

export default function DirectoryPage() {
  const { floor, directOnly } = useEvidence();

  const [data, setData] = useState<PaginatedCompanies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

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
        page,
        page_size: pageSize,
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
  }, [search, cityFilter, page, floor, directOnly]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      await api.submitLead({
        company_name: leadCompany,
        city: leadCity,
        status: leadStatus,
        source_url: leadUrl || undefined,
      });
      setLeadSuccessMsg("Lead submitted to reviewer queue with draft Grade D.");
      setLeadCompany("");
      setLeadUrl("");
      setTimeout(() => {
        setLeadModalOpen(false);
        setLeadSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmittingLead(false);
    }
  };

  const columns: Column<Company>[] = [
    {
      key: "name",
      header: "Entity & Parent Company",
      sortable: true,
      render: (r) => (
        <div className="space-y-0.5">
          <span className="font-geist font-semibold text-content-primary">{r.name}</span>
          <div className="text-[11px] text-content-muted font-geist flex items-center gap-1.5">
            <span>HQ: {r.hq_country || "Global"}</span>
            {r.sector && (
              <>
                <span>•</span>
                <span>{r.sector}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "records",
      header: "Indian Hubs",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.records && r.records.length > 0 ? (
            r.records.map((rec) => (
              <span
                key={rec.id}
                className="px-2 py-0.5 rounded bg-surface-container-high text-[11px] text-content-secondary font-mono border border-border-subtle"
              >
                {rec.city_name} ({rec.status})
              </span>
            ))
          ) : (
            <span className="text-content-muted text-xs">—</span>
          )}
        </div>
      ),
    },
    {
      key: "captive_status",
      header: "Captive Test",
      align: "center",
      render: (r) => {
        const isCaptive = r.captive_status === "yes";
        const isNotCaptive = r.captive_status === "no";

        return (
          <Badge
            variant={isCaptive ? "success" : isNotCaptive ? "danger" : "neutral"}
            size="sm"
            dot
          >
            {isCaptive
              ? "Wholly-Owned Captive"
              : isNotCaptive
              ? "Non-Captive / Outsource"
              : "Unreviewed"}
          </Badge>
        );
      },
    },
    {
      key: "grade",
      header: "Grade Stamp",
      align: "center",
      render: (r) => <GradeStamp grade={r.grade} relayed={r.relayed} size="sm" showLabel />,
    },
  ];

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="space-y-8 animate-fade-in max-w-[1240px]">
      {/* 1. Header with Plain Headline and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-geist text-xs font-semibold uppercase text-secondary tracking-wider">
              Entity Directory // Institutional Footprint
            </span>
            <span className="text-content-muted">•</span>
            <span className="font-geist text-xs text-content-muted font-mono">REG-2026-FTE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-headline-xl text-content-primary font-bold tracking-tight">
            Which global companies operate verified GCCs in India?
          </h1>
          <p className="text-body-md text-content-secondary max-w-3xl leading-relaxed">
            Audited institutional registry tracking wholly owned captives versus third-party IT outsourcing centres. IT delivery centres run for multiple clients are tagged to prevent inflation of official captive statistics.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setLeadModalOpen(true)}
          className="self-start sm:self-auto shrink-0"
        >
          Propose Entity
        </Button>
      </div>

      {/* Hidden Count Banner */}
      {data && <HiddenCount count={data.hidden_count} itemName="entity records" />}

      {/* 2. Top 3 KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Matching Entities
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-content-primary">
                {data.total} Entities
              </div>
              <div className="text-xs text-content-muted mt-1">
                Filtered at Evidence Floor {floor}
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "75%" }} />
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-secondary">
              Captive Test Passed
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-secondary">
                100% Wholly Owned
              </div>
              <div className="text-xs text-content-muted mt-1">
                Servicing parent enterprise exclusively
              </div>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: "100%" }} />
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <span className="text-xs font-geist font-semibold uppercase tracking-wider text-content-muted">
              Active Triage Queue
            </span>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-tertiary">
                Grade D Leads
              </div>
              <div className="text-xs text-content-muted mt-1">
                Submissions awaiting primary gazette verification
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-content-secondary">
              <span>Rigor Floor:</span>
              <GradeStamp grade={floor} size="sm" />
            </div>
          </Card>
        </div>
      )}

      {/* 3. Filter Bar (Obsidian Search & Corridor Filter) */}
      <Card padding="sm" className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <Input
            value={search}
            aria-label="Search by company name, sector or parent entity"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by company name, sector or parent entity..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-48">
          <select
            value={cityFilter}
            aria-label="Filter by tech corridor"
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full h-[38px] rounded-lg bg-surface-container-low text-content-primary border border-border-subtle px-3 text-xs font-sans focus:border-primary focus:outline-none"
          >
            <option value="">All Tech Corridors</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Chennai">Chennai</option>
            <option value="NCR">NCR (Gurugram/Noida)</option>
            <option value="Coimbatore">Coimbatore</option>
          </select>
        </div>

        {(search || cityFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setCityFilter("");
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}
      </Card>

      {/* 4. Enterprise Table */}
      {data && (
        <section className="space-y-4">
          <Table
            columns={columns}
            data={data.items}
            keyField="id"
            emptyMessage="No verified GCC entities matched your filter criteria."
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 text-xs font-geist text-content-secondary">
              <div>
                Showing page <strong className="font-mono text-content-primary">{data.page}</strong> of{" "}
                <strong className="font-mono text-content-primary">{totalPages}</strong> ({data.total} total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. Lead Proposal Modal */}
      <Modal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        title="Propose GCC Entity to Review Queue"
        description="Submit a foreign parent company establishing operations in India. New submissions enter at Grade D with unreviewed captive status."
      >
        <form onSubmit={handleLeadSubmit} className="space-y-4 pt-2">
          {leadSuccessMsg && (
            <div className="p-3 rounded-lg bg-secondary/15 border border-secondary/30 text-secondary text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{leadSuccessMsg}</span>
            </div>
          )}

          <Input
            label="Company Name"
            value={leadCompany}
            onChange={(e) => setLeadCompany(e.target.value)}
            placeholder="e.g. Stripe Technologies, Datadog..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-geist font-medium text-content-secondary uppercase tracking-wider mb-1.5">
                Indian City / Location
              </label>
              <select
                value={leadCity}
                onChange={(e) => setLeadCity(e.target.value)}
                className="w-full h-[38px] rounded-lg bg-surface-container-low border border-border-subtle px-3 text-xs text-content-primary focus:border-primary focus:outline-none"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
                <option value="NCR">NCR (Gurugram/Noida)</option>
                <option value="Coimbatore">Coimbatore</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-geist font-medium text-content-secondary uppercase tracking-wider mb-1.5">
                Establishment Status
              </label>
              <select
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value)}
                className="w-full h-[38px] rounded-lg bg-surface-container-low border border-border-subtle px-3 text-xs text-content-primary focus:border-primary focus:outline-none"
              >
                <option value="announced">Announced (Signal only)</option>
                <option value="landed">Landed (Operational)</option>
                <option value="expanding">Expanding (Scale phase)</option>
              </select>
            </div>
          </div>

          <Input
            label="Public Evidence URL (Optional)"
            type="url"
            value={leadUrl}
            onChange={(e) => setLeadUrl(e.target.value)}
            placeholder="https://mca.gov.in/... or official press link"
            helperText="Only secure HTTP/HTTPS source links are stored."
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
            <Button variant="ghost" type="button" onClick={() => setLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submittingLead}>
              Submit for Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
