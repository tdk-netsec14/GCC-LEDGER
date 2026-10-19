"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Toast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { GradeStamp } from "@/components/GradeStamp";
import { FloorBar } from "@/components/FloorBar";
import { HiddenCount } from "@/components/HiddenCount";
import { SourceLink } from "@/components/SourceLink";
import { EmptyState } from "@/components/EmptyState";
import { DataStatusBanner } from "@/components/DataStatusBanner";
import { useTheme } from "@/lib/theme-context";
import {
  Sun,
  Moon,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

interface SampleRow {
  id: number;
  entity: string;
  city: string;
  grade: string;
  relayed: boolean;
  count: number;
}

export default function ComponentPreviewPage() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();

  // State controls for interactive preview
  const [sliderVal, setSliderVal] = useState(45);
  const [toggleVal, setToggleVal] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pill_1");
  const [showToast, setShowToast] = useState(false);

  const sampleData: SampleRow[] = [
    { id: 1, entity: "Google India Tech Services", city: "Bengaluru", grade: "A", relayed: false, count: 4800 },
    { id: 2, entity: "JPMorgan Chase Global Services", city: "Hyderabad", grade: "A", relayed: false, count: 6200 },
    { id: 3, entity: "Goldman Sachs India Services", city: "Bengaluru", grade: "B", relayed: true, count: 3100 },
    { id: 4, entity: "Amazon Development Centre", city: "Pune", grade: "C", relayed: false, count: 2400 },
    { id: 5, entity: "Acme Cloud GCC (Unverified)", city: "Gurugram", grade: "D", relayed: true, count: 150 },
  ];

  const columns: Column<SampleRow>[] = [
    {
      key: "entity",
      header: "Entity Name",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{r.entity}</span>
        </div>
      ),
    },
    { key: "city", header: "Location Hub", sortable: true },
    {
      key: "grade",
      header: "Grade Stamp",
      align: "center",
      render: (r) => <GradeStamp grade={r.grade} relayed={r.relayed} size="sm" showLabel />,
    },
    {
      key: "count",
      header: "Seat Capacity",
      align: "right",
      sortable: true,
      render: (r) => <span className="font-mono font-medium">{r.count.toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-12 pb-16 animate-fade-in max-w-[1200px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-geist text-xs font-semibold uppercase tracking-wider">
              Design System Showcase
            </span>
            <span className="text-content-muted text-xs">•</span>
            <span className="text-content-muted text-xs font-geist">Obsidian Ledger v4.2</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-content-primary tracking-tight">
            Component System & Token Inventory
          </h1>
          <p className="font-body-md text-content-secondary max-w-2xl">
            Storybook-style interactive verification suite displaying each shared component across all operational states, interaction modes, and theme variations.
          </p>
        </div>

        {/* Theme Controller */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-card border border-border-subtle shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`px-3 py-1.5 rounded-lg text-xs font-geist font-medium flex items-center gap-1.5 transition-colors ${
              theme === "light"
                ? "bg-primary text-white shadow-sm font-semibold"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`px-3 py-1.5 rounded-lg text-xs font-geist font-medium flex items-center gap-1.5 transition-colors ${
              theme === "dark"
                ? "bg-primary text-white shadow-sm font-semibold"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Dark
          </button>
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`px-3 py-1.5 rounded-lg text-xs font-geist font-medium transition-colors ${
              theme === "system"
                ? "bg-primary text-white shadow-sm font-semibold"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            System
          </button>
        </div>
      </div>

      {/* 1. Evidence Floor & Global Controllers */}
      <section className="space-y-4">
        <h2 className="font-headline-lg font-semibold text-content-primary flex items-center gap-2">
          <span>1. Evidence Floor Control & Indicators</span>
        </h2>
        <Card padding="md" className="space-y-4">
          <div className="space-y-2">
            <span className="font-geist text-xs font-medium text-content-secondary uppercase tracking-wider block">
              FloorBar with Segmented Grade Selection, Direct Switch & Pass Ratio:
            </span>
            <FloorBar passCount={1428} totalCount={1850} />
          </div>

          <div className="space-y-2 pt-2">
            <span className="font-geist text-xs font-medium text-content-secondary uppercase tracking-wider block">
              HiddenCount Notification (Dynamic Floor Exclusions):
            </span>
            <HiddenCount count={422} itemName="claims" />
          </div>

          <div className="space-y-2 pt-2">
            <span className="font-geist text-xs font-medium text-content-secondary uppercase tracking-wider block">
              Statutory Data Status Notice:
            </span>
            <DataStatusBanner />
          </div>
        </Card>
      </section>

      {/* 2. Grade Stamp System */}
      <section className="space-y-4">
        <h2 className="font-headline-lg font-semibold text-content-primary">
          2. GradeStamp Variations (Direct vs Relayed, 3 Sizing Tiers)
        </h2>
        <Card padding="md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-surface-container-low border border-border-subtle">
              <span className="font-geist text-xs font-bold text-secondary uppercase block">Grade A (Primary)</span>
              <div className="flex items-center gap-3">
                <GradeStamp grade="A" size="sm" />
                <GradeStamp grade="A" size="md" />
                <GradeStamp grade="A" size="lg" />
              </div>
              <div className="pt-2 border-t border-border-subtle/60">
                <span className="text-[10px] text-content-muted block mb-1">Relayed Variant (Dashed):</span>
                <GradeStamp grade="A" relayed size="md" showLabel />
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-surface-container-low border border-border-subtle">
              <span className="font-geist text-xs font-bold text-primary uppercase block">Grade B (Advisory)</span>
              <div className="flex items-center gap-3">
                <GradeStamp grade="B" size="sm" />
                <GradeStamp grade="B" size="md" />
                <GradeStamp grade="B" size="lg" />
              </div>
              <div className="pt-2 border-t border-border-subtle/60">
                <span className="text-[10px] text-content-muted block mb-1">Relayed Variant (Dashed):</span>
                <GradeStamp grade="B" relayed size="md" showLabel />
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-surface-container-low border border-border-subtle">
              <span className="font-geist text-xs font-bold text-tertiary uppercase block">Grade C (Press)</span>
              <div className="flex items-center gap-3">
                <GradeStamp grade="C" size="sm" />
                <GradeStamp grade="C" size="md" />
                <GradeStamp grade="C" size="lg" />
              </div>
              <div className="pt-2 border-t border-border-subtle/60">
                <span className="text-[10px] text-content-muted block mb-1">Relayed Variant (Dashed):</span>
                <GradeStamp grade="C" relayed size="md" showLabel />
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-surface-container-low border border-border-subtle">
              <span className="font-geist text-xs font-bold text-content-secondary uppercase block">Grade D (Vendor)</span>
              <div className="flex items-center gap-3">
                <GradeStamp grade="D" size="sm" />
                <GradeStamp grade="D" size="md" />
                <GradeStamp grade="D" size="lg" />
              </div>
              <div className="pt-2 border-t border-border-subtle/60">
                <span className="text-[10px] text-content-muted block mb-1">Relayed Variant (Dashed):</span>
                <GradeStamp grade="D" relayed size="md" showLabel />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Button & Action Triggers */}
      <section className="space-y-4">
        <h2 className="font-headline-lg font-semibold text-content-primary">
          3. Button Matrix (Variants, Sizing, Loading, Icons)
        </h2>
        <Card padding="md" className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary Indigo</Button>
            <Button variant="secondary">Secondary Dark</Button>
            <Button variant="outline">Outlined Border</Button>
            <Button variant="ghost">Ghost Trigger</Button>
            <Button variant="danger">Danger Coral</Button>
            <Button variant="primary" loading>Loading State</Button>
            <Button variant="primary" disabled>Disabled State</Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border-subtle">
            <span className="text-xs font-geist font-medium text-content-secondary w-full block">Sizing Scale:</span>
            <Button variant="primary" size="sm">Small (28px)</Button>
            <Button variant="primary" size="md">Medium (36px)</Button>
            <Button variant="primary" size="lg">Large (44px)</Button>
          </div>
        </Card>
      </section>

      {/* 4. Form Controls & Sliders */}
      <section className="space-y-4">
        <h2 className="font-headline-lg font-semibold text-content-primary">
          4. Form Inputs, Sliders & Toggles
        </h2>
        <Card padding="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Input label="Company Search" placeholder="e.g. JPMorgan, Google, Airbus..." icon={<Search className="w-4 h-4" />} />
              <Input label="With Error Validation" value="Invalid URL" error="Only secure HTTPS urls are accepted" />
            </div>

            <div className="space-y-5">
              <Slider
                label="Weight Allocation"
                value={sliderVal}
                min={0}
                max={100}
                step={5}
                onChange={setSliderVal}
              />
              <Slider
                label="Headcount Target"
                value={150}
                min={20}
                max={500}
                step={10}
                unit=" seats"
                onChange={() => {}}
              />
            </div>

            <div className="space-y-4 p-4 rounded-xl bg-surface-container-low border border-border-subtle">
              <span className="font-geist text-xs font-semibold uppercase tracking-wider text-content-secondary block">
                Toggles & Direct Sources Switch
              </span>
              <Toggle
                checked={toggleVal}
                onChange={setToggleVal}
                label="Direct sources only"
                description="Exclude secondary citations without original records"
              />
              <Toggle
                checked={false}
                onChange={() => {}}
                label="SEZ Tax Holiday Exemption"
                description="Evaluate closed units under Section 10AA"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* 5. Enterprise Data Table */}
      <section className="space-y-4">
        <h2 className="font-headline-lg font-semibold text-content-primary">
          5. Enterprise Table (Sticky Header, Tabular Figures & Row Dimming)
        </h2>
        <Table
          columns={columns}
          data={sampleData}
          keyField="id"
          sortKey="count"
          sortDirection="desc"
          isRowDimmed={(row) => row.grade === "D"}
        />
      </section>

      {/* 6. Tabs, Badges & Interactive Overlays */}
      <section className="space-y-4">
        <h2 className="font-headline-lg font-semibold text-content-primary">
          6. Tabs, Status Badges, Modals & Notifications
        </h2>
        <Card padding="md" className="space-y-6">
          <div className="space-y-2">
            <span className="font-geist text-xs font-medium text-content-secondary block">Pill Segmented Control:</span>
            <Tabs
              variant="pill"
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: "pill_1", label: "Consensus Claims", count: 18 },
                { id: "pill_2", label: "State Policies", count: 6 },
                { id: "pill_3", label: "Contradiction Audits", count: 4 },
              ]}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <span className="font-geist text-xs font-medium text-content-secondary block">Status Pills & Badges:</span>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary" dot>Primary Active</Badge>
              <Badge variant="success" dot>Statutory Verified</Badge>
              <Badge variant="warning" dot>Pending Review</Badge>
              <Badge variant="danger" dot>Excluded by Floor</Badge>
              <Badge variant="neutral">Wholly-Owned Captive</Badge>
              <Badge variant="outline">ISO-27001 Graded</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border-subtle">
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              Open Demonstration Modal
            </Button>
            <Button variant="secondary" onClick={() => setShowToast(!showToast)}>
              Toggle Toast Notification
            </Button>
            <SourceLink url="https://mca.gov.in" label="Ministry of Corporate Affairs Portal" />
          </div>

          {showToast && (
            <div className="pt-2">
              <Toast
                type="success"
                title="Lead Record Submitted"
                message="Your GCC submission has entered the Level-1 triage review queue with draft Grade D."
                onClose={() => setShowToast(false)}
              />
            </div>
          )}
        </Card>
      </section>

      {/* 7. Skeleton Shimmer & State Views */}
      <section className="space-y-4">
        <h2 className="font-headline-lg font-semibold text-content-primary">
          7. Shimmer Skeletons, Empty & Error States
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="md" className="space-y-3">
            <span className="font-geist text-xs font-bold text-content-muted uppercase">Shimmer Skeletons:</span>
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton variant="card" className="h-20" />
          </Card>

          <EmptyState title="No verified claims at Grade A" description="Raise your floor to Grade B or allow relayed citations." />

          <ErrorState title="API Connection Interrupted" message="Unable to fetch statutory policy data." onRetry={() => {}} />
        </div>
      </section>

      {/* Modal Demonstration */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Institutional Review Verification"
        description="Verify this claim against statutory gazettes before publishing to the National Ledger."
      >
        <div className="space-y-4 py-2">
          <p className="font-body-sm text-content-secondary leading-relaxed">
            Every entity addition must cite an active Indian Registrar of Companies (RoC) Corporate Identity Number (CIN) or an official gazette notification.
          </p>
          <div className="p-3 rounded-lg bg-surface-container-low border border-border-subtle font-mono text-xs space-y-1">
            <div className="text-content-muted">Subject: <span className="text-content-primary">Airbus India Research Hub</span></div>
            <div className="text-content-muted">Location: <span className="text-content-primary">Bengaluru, Karnataka</span></div>
            <div className="text-content-muted">Assigned Grade: <span className="text-secondary font-bold">Grade A</span></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm &amp; Publish</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
