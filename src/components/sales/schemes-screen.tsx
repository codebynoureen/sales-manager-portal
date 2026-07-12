"use client";

import { useEffect, useState } from "react";import { Plus, Award, Wallet, TrendingUp, Clock } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";
import { daysUntil } from "@/lib/dates";import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { SchemeCard } from "@/components/sales/scheme-card";
import { SchemeDetailModal } from "@/components/sales/scheme-detail-modal";
import { NewSchemeModal } from "@/components/sales/new-scheme-modal";
import { cn } from "@/lib/utils";
import type { Scheme } from "@/types/sales";

const FUNDING_LABEL: Record<Scheme["fundingType"], { label: string; className: string }> = {
  SELF_FUNDED: { label: "Self-Funded", className: "bg-warning-subtle text-warning" },
  PRINCIPAL_FUNDED: { label: "Principal-Funded", className: "bg-info-subtle text-info" },
  SPLIT: { label: "Split", className: "bg-primary-subtle text-primary" },
};
const STATUS_LABEL: Record<Scheme["status"], { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-success-subtle text-success" },
  EXPIRED: { label: "Expired", className: "bg-[#F1F5F9] text-text-muted" },
  DRAFT: { label: "Draft", className: "bg-[#F1F5F9] text-text-muted" },
};

function formatPaisa(paisa: number) {
  return (paisa / 100).toLocaleString("en-PK");
}
export function SchemesScreen({ schemes: initialSchemes }: { schemes: Scheme[] }) {

const [schemes, setSchemes] = useState(initialSchemes);
useEffect(() => {
  setSchemes(initialSchemes);
}, [initialSchemes]);
const active = schemes.filter((s) => s.status === "ACTIVE");

const totalCost = schemes.reduce(
  (sum, x) => sum + x.costSoFarPaisa,
  0
);

const avgUptake = Math.round(
  active.reduce(
    (sum, x) =>
      sum + (x.eligibleShops > 0 ? x.uptakeShops / x.eligibleShops : 0),
    0
  ) /
    (active.length || 1) *
    100
);

const expiringSoon = active.filter(
  (s) => daysUntil(s.endDate) < 3
).length;
  const [detailScheme, setDetailScheme] = useState<Scheme | null>(null);
  const [newSchemeOpen, setNewSchemeOpen] = useState(false);

  const activeSchemes = schemes.filter((s) => s.status === "ACTIVE");

  const columns: DataTableColumn<Scheme>[] = [
    { key: "name", header: "Scheme Name", sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "type", header: "Type", render: (r) => <span className="text-sm">{r.type.replaceAll("_", "-")}</span> },
    { key: "funding", header: "Funding", render: (r) => <span className={cn("inline-flex h-[18px] items-center rounded-full px-2 text-[10px] font-semibold", FUNDING_LABEL[r.fundingType].className)}>{FUNDING_LABEL[r.fundingType].label}</span> },
    { key: "uptake", header: "Uptake", align: "right", render: (r) => <span className="font-mono">{r.eligibleShops > 0 ? `${Math.round((r.uptakeShops / r.eligibleShops) * 100)}%` : "—"}</span> },
    { key: "cost", header: "Cost (PKR)", align: "right", render: (r) => <span className="font-mono">{formatPaisa(r.costSoFarPaisa)}</span> },
    { key: "status", header: "Status", render: (r) => <span className={cn("inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold", STATUS_LABEL[r.status].className)}>{STATUS_LABEL[r.status].label}</span> },
  ];

  function fmtLakh(paisa: number) {
  return `${(paisa / 100 / 100000).toFixed(2)}L`;
}

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">Scheme Management</h2>
          <p className="mt-1 text-base text-text-muted">Create, edit, and expire schemes — Buy-X-Get-Y, volume slabs, cash discounts, and more</p>
        </div>
        <button onClick={() => setNewSchemeOpen(true)} className="flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Create New Scheme
        </button>
      </div>
<div className="mb-6 grid grid-cols-4 gap-5">

  <KpiCard
    icon={Award}
    iconColorClass="text-gold"
    iconBgClass="bg-gold-subtle"
    value={active.length}
    label="Active Schemes"
  />

  <KpiCard
    icon={Wallet}
    iconColorClass="text-primary"
    iconBgClass="bg-primary-subtle"
    value={fmtLakh(totalCost)}
    label="Scheme Cost (June)"
  />

  <KpiCard
    icon={TrendingUp}
    iconColorClass="text-success"
    iconBgClass="bg-success-subtle"
    value={`${avgUptake}%`}
    label="Avg. Eligible Shop Uptake"
  />

  <KpiCard
    icon={Clock}
    iconColorClass="text-danger"
    iconBgClass="bg-danger-subtle"
    value={expiringSoon}
    label="Expiring <3 Days"
    accentBorderClass="border-l-4 border-l-danger"
  />

</div>
      <div className="mb-6 grid grid-cols-3 gap-5">
        {activeSchemes.map((s) => (
          <SchemeCard key={s.schemeId} scheme={s} onManage={() => setDetailScheme(s)} />
        ))}
      </div>

      <DataTable
        rows={schemes}
        columns={columns}
        getRowId={(r) => r.schemeId}
        filters={[
          { label: "Active", predicate: (r) => r.status === "ACTIVE" },
          { label: "Expired", predicate: (r) => r.status === "EXPIRED" },
          { label: "Draft", predicate: (r) => r.status === "DRAFT" },
        ]}
      />

<SchemeDetailModal scheme={detailScheme} onClose={() => setDetailScheme(null)} />      <NewSchemeModal open={newSchemeOpen} onOpenChange={setNewSchemeOpen} />
    </>
  );
}
