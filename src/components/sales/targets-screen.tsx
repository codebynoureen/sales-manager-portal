"use client";



import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { TargetModal } from "@/components/sales/target-modal";
import { TargetBarRow } from "@/components/sales/target-bar-row";
import { cn } from "@/lib/utils";
import type { BookerTarget } from "@/types/sales";
import { Wallet, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";

const STATUS_BADGE: Record<BookerTarget["status"], { label: string; className: string }> = {
  EXCEEDING: { label: "Exceeding", className: "bg-success-subtle text-success" },
  ON_TRACK: { label: "On Track", className: "bg-success-subtle text-success" },
  WATCH: { label: "Watch", className: "bg-warning-subtle text-warning" },
  BEHIND: { label: "Behind Target", className: "bg-danger-subtle text-danger" },
};

function formatPaisa(paisa: number) {
  return (paisa / 100).toLocaleString("en-PK");
}

function fmtLakh(paisa: number) {
  return `${(paisa / 100 / 100000).toFixed(1)}L`;
}


export function TargetsScreen({ targets }: { targets: BookerTarget[] }) {
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<BookerTarget | null>(null);
const teamTargetPaisa = targets.reduce(
 (s,t)=>s+t.pkrTargetPaisa,0
);

const achievedPaisa = targets.reduce(
 (s,t)=>s+t.pkrAchievedPaisa,0
);

const pct = teamTargetPaisa
 ? (achievedPaisa/teamTargetPaisa)*100
 : 0;

const remainingPaisa = teamTargetPaisa-achievedPaisa;

const daysRemaining = 1;
  const columns: DataTableColumn<BookerTarget>[] = [
    { key: "bookerName", header: "Booker", sortable: true, sortValue: (r) => r.bookerName, render: (r) => <span className="font-medium">{r.bookerName}</span> },
    { key: "pkrTarget", header: "PKR Target", align: "right", render: (r) => <span className="font-mono">{formatPaisa(r.pkrTargetPaisa)}</span> },
    { key: "outletTarget", header: "New Outlets Target", align: "right", render: (r) => <span className="font-mono">{r.newOutletTarget}</span> },
    {
      key: "outletActual",
      header: "New Outlets Actual",
      align: "right",
      render: (r) => (
        <span className={cn("font-mono", r.newOutletActual >= r.newOutletTarget ? "text-success" : "")}>{r.newOutletActual}</span>
      ),
    },
    { key: "status", header: "Status", render: (r) => <span className={cn("inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold", STATUS_BADGE[r.status].className)}>{STATUS_BADGE[r.status].label}</span> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <button
          onClick={() => { setSelected(r); setModalMode("edit"); }}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface3 hover:text-text"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">Order Booker Target Management</h2>
          <p className="mt-1 text-base text-text-muted">Monthly sales targets per booker — total PKR, SKU-wise, and new outlet acquisition</p>
        </div>
        <button
          onClick={() => { setSelected(null); setModalMode("create"); }}
          className="flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Set New Target
        </button>
      </div>
       <div className="mb-6 grid grid-cols-4 gap-5">

    <KpiCard
      icon={Wallet}
      iconColorClass="text-primary"
      iconBgClass="bg-primary-subtle"
      value={fmtLakh(teamTargetPaisa)}
      label="Team Target (June)"
    />

    <KpiCard
      icon={TrendingUp}
      iconColorClass="text-success"
      iconBgClass="bg-success-subtle"
      value={fmtLakh(achievedPaisa)}
      label="Achieved So Far"
      delta={{
        text: `${pct.toFixed(1)}% of target`,
        direction: "up"
      }}
    />

    <KpiCard
      icon={Clock}
      iconColorClass="text-warning"
      iconBgClass="bg-warning-subtle"
      value={daysRemaining}
      label="Days Remaining"
    />

    <KpiCard
      icon={AlertTriangle}
      iconColorClass="text-danger"
      iconBgClass="bg-danger-subtle"
      value={fmtLakh(Math.round(remainingPaisa / daysRemaining))}
      label="Daily Run-Rate Needed"
      accentBorderClass="border-l-4 border-l-danger"
    />

  </div>


      <div className="mb-5 rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="border-b border-border p-5">
          <span className="font-display text-lg font-semibold text-text">Target vs Achievement — By Booker</span>
        </div>
        <div className="p-5">
          {targets.map((t) => (
            <TargetBarRow key={t.bookerUserId} label={t.bookerName} achievedPaisa={t.pkrAchievedPaisa} targetPaisa={t.pkrTargetPaisa} />
          ))}
        </div>
      </div>

      <DataTable
        rows={targets}
        columns={columns}
        getRowId={(r) => r.bookerUserId}
        searchPlaceholder="Search booker name…"
        searchFn={(r, q) => r.bookerName.toLowerCase().includes(q.toLowerCase())}
        filters={[{ label: "⚠ Behind Target", predicate: (r) => r.status === "BEHIND" }, { label: "On Track", predicate: (r) => r.status === "ON_TRACK" || r.status === "EXCEEDING" }]}
        rowClassName={(r) => (r.status === "BEHIND" ? "bg-danger-subtle" : "")}
      />

      <TargetModal mode={modalMode ?? "create"} target={selected} open={modalMode !== null} onOpenChange={(o) => !o && setModalMode(null)} />
    </>
  );
}
