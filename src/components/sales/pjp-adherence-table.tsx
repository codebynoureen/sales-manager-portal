"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { PjpAdherenceRow } from "@/types/sales";

const STATUS_BADGE: Record<PjpAdherenceRow["status"], { label: string; className: string }> = {
  EXCELLENT: { label: "Excellent", className: "bg-success-subtle text-success" },
  GOOD: { label: "Good", className: "bg-success-subtle text-success" },
  NEGLECTED: { label: "2+ Cycles Neglected", className: "bg-danger-subtle text-danger" },
};

const columns: DataTableColumn<PjpAdherenceRow>[] = [
  { key: "bookerName", header: "Booker", sortable: true, sortValue: (r) => r.bookerName, render: (r) => <span className="font-medium">{r.bookerName}</span> },
  { key: "plannedVisits", header: "Planned Visits", align: "right", render: (r) => <span className="font-mono">{r.plannedVisits}</span> },
  { key: "actualVisits", header: "Actual Visits", align: "right", render: (r) => <span className={cn("font-mono", r.status === "NEGLECTED" && "text-danger")}>{r.actualVisits}</span> },
  {
    key: "adherencePct",
    header: "Adherence",
    sortable: true,
    sortValue: (r) => r.adherencePct,
    render: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-[60px] overflow-hidden rounded-full bg-surface3">
          <div className={cn("h-full rounded-full", r.adherencePct >= 75 ? "bg-success" : "bg-danger")} style={{ width: `${r.adherencePct}%` }} />
        </div>
        <span className={cn("text-sm font-semibold", r.adherencePct >= 75 ? "text-success" : "text-danger")}>{r.adherencePct}%</span>
      </div>
    ),
  },
  { key: "status", header: "Status", render: (r) => <span className={cn("inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold", STATUS_BADGE[r.status].className)}>{STATUS_BADGE[r.status].label}</span> },
];

export function PjpAdherenceTable({ rows }: { rows: PjpAdherenceRow[] }) {
  return (
    <div className="mt-6 rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="border-b border-border p-5">
        <span className="font-display text-lg font-semibold text-text">PJP Adherence Report</span>
        <div className="text-sm text-text-muted">Planned vs actual visits — last 7 days</div>
      </div>
<DataTable
  rows={rows}
  columns={columns}
  getRowId={(r) => r.bookerUserId}
  rowClassName={(r) => (r.status === "NEGLECTED" ? "bg-danger-subtle" : "")}
  searchPlaceholder="Search booker…"
  searchFn={(r, q) => r.bookerName.toLowerCase().includes(q.toLowerCase())}
  filters={[
    { label: "Neglected", predicate: (r) => r.status === "NEGLECTED" },
    { label: "Good/Excellent", predicate: (r) => r.status === "GOOD" || r.status === "EXCELLENT" },
  ]}
/>    </div>
  );
}
