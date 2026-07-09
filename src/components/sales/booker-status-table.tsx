"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { BookerDailyStats } from "@/types/sales";

const STATUS_BADGE: Record<BookerDailyStats["status"], { label: string; className: string }> = {
  ON_ROUTE: { label: "On Route", className: "bg-success-subtle text-success" },
  ZERO_ORDERS: { label: "Zero Orders", className: "bg-danger-subtle text-danger" },
  IDLE: { label: "Idle", className: "bg-danger-subtle text-danger" },
};

function formatPaisa(paisa: number) {
  return (paisa / 100).toLocaleString("en-PK");
}

const columns: DataTableColumn<BookerDailyStats>[] = [
  { key: "bookerName", header: "Booker", sortable: true, sortValue: (r) => r.bookerName, render: (r) => <span className="font-medium">{r.bookerName}</span> },
  { key: "area", header: "Area", render: (r) => <span className="text-sm">{r.area}</span> },
  { key: "stopsDone", header: "Stops Done", align: "right", sortable: true, sortValue: (r) => r.stopsDone, render: (r) => <span className="font-mono">{r.stopsDone} / {r.stopsPlanned}</span> },
  {
    key: "ordersCount",
    header: "Orders",
    align: "right",
    sortable: true,
    sortValue: (r) => r.ordersCount,
    render: (r) => <span className={cn("font-mono", r.ordersCount === 0 ? "font-bold text-danger" : "")}>{r.ordersCount}</span>,
  },
  { key: "collectionsPaisa", header: "Collections (PKR)", align: "right", sortable: true, sortValue: (r) => r.collectionsPaisa, render: (r) => <span className="font-mono">{formatPaisa(r.collectionsPaisa)}</span> },
  {
    key: "status",
    header: "Status",
    render: (r) => {
      const badge = STATUS_BADGE[r.status];
      return (
        <span className={cn("inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold", badge.className)}>
          {badge.label}
        </span>
      );
    },
  },
];

export function BookerStatusTable({ rows }: { rows: BookerDailyStats[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowId={(r) => r.bookerUserId}
      searchPlaceholder="Search booker or area…"
      searchFn={(r, q) => r.bookerName.toLowerCase().includes(q.toLowerCase()) || r.area.toLowerCase().includes(q.toLowerCase())}
      filters={[
        { label: "On Route", predicate: (r) => r.status === "ON_ROUTE" },
        { label: "Zero Orders", predicate: (r) => r.status === "ZERO_ORDERS" },
        { label: "Idle", predicate: (r) => r.status === "IDLE" },
      ]}
      rowClassName={(r) => (r.status !== "ON_ROUTE" ? "bg-danger-subtle" : "")}
      emptyMessage="No bookers match your search or filter."
    />
  );
}
