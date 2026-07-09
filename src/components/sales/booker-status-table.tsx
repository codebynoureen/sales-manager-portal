"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookerDailyStats } from "@/types/sales";

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<BookerDailyStats["status"], { label: string; className: string }> = {
  ON_ROUTE: { label: "On Route", className: "bg-success-subtle text-success" },
  ZERO_ORDERS: { label: "Zero Orders", className: "bg-danger-subtle text-danger" },
  IDLE: { label: "Idle", className: "bg-danger-subtle text-danger" },
};

function formatPaisa(paisa: number) {
  return (paisa / 100).toLocaleString("en-PK");
}

type SortKey = "bookerName" | "stopsDone" | "ordersCount" | "collectionsPaisa";

export function BookerStatusTable({ rows }: { rows: BookerDailyStats[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookerDailyStats["status"]>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("bookerName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = rows.filter(
      (r) =>
        r.bookerName.toLowerCase().includes(query.toLowerCase()) ||
        r.area.toLowerCase().includes(query.toLowerCase())
    );
    if (statusFilter !== "ALL") result = result.filter((r) => r.status === statusFilter);

    result = [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [rows, query, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="flex h-[52px] items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 min-w-[220px] items-center gap-2 rounded-md border-[1.5px] border-border bg-surface2 px-3">
          <Search className="h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search booker or area…"
            className="w-full bg-transparent text-base text-text outline-none placeholder:text-text-muted"
          />
        </div>
        {(["ALL", "ON_ROUTE", "ZERO_ORDERS", "IDLE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={cn(
              "h-[30px] rounded-full border px-3 text-sm transition-colors",
              statusFilter === s
                ? "border-primary bg-primary-subtle text-primary"
                : "border-border bg-surface2 text-text-dim hover:border-border-strong hover:bg-surface3"
            )}
          >
            {s === "ALL" ? "All" : STATUS_BADGE[s].label}
          </button>
        ))}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="h-10 border-b-[1.5px] border-border-strong bg-surface2">
            <SortableHeader label="Booker" active={sortKey === "bookerName"} dir={sortDir} onClick={() => toggleSort("bookerName")} />
            <th className="px-4 text-left text-sm font-semibold uppercase tracking-wide text-text-muted">Area</th>
            <SortableHeader label="Stops Done" align="right" active={sortKey === "stopsDone"} dir={sortDir} onClick={() => toggleSort("stopsDone")} />
            <SortableHeader label="Orders" align="right" active={sortKey === "ordersCount"} dir={sortDir} onClick={() => toggleSort("ordersCount")} />
            <SortableHeader label="Collections (PKR)" align="right" active={sortKey === "collectionsPaisa"} dir={sortDir} onClick={() => toggleSort("collectionsPaisa")} />
            <th className="px-4 text-left text-sm font-semibold uppercase tracking-wide text-text-muted">Status</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((b) => {
            const badge = STATUS_BADGE[b.status];
            return (
              <tr
                key={b.bookerUserId}
                className={cn(
                  "h-[52px] border-b border-border transition-colors last:border-b-0 hover:bg-surface3",
                  b.status !== "ON_ROUTE" && "bg-danger-subtle"
                )}
              >
                <td className="px-4 text-base font-medium text-text-dim">{b.bookerName}</td>
                <td className="px-4 text-sm text-text-dim">{b.area}</td>
                <td className="px-4 text-right font-mono text-base text-text-dim">
                  {b.stopsDone} / {b.stopsPlanned}
                </td>
                <td
                  className={cn(
                    "px-4 text-right font-mono text-base",
                    b.ordersCount === 0 ? "font-bold text-danger" : "text-text-dim"
                  )}
                >
                  {b.ordersCount}
                </td>
                <td className="px-4 text-right font-mono text-base text-text-dim">{formatPaisa(b.collectionsPaisa)}</td>
                <td className="px-4">
                  <span className={cn("inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold", badge.className)}>
                    {badge.label}
                  </span>
                </td>
              </tr>
            );
          })}
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-text-muted">
                No bookers match your search or filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-border px-5 py-4">
        <span className="text-[13px] text-text-muted">
          Showing {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageRows.length} of {filtered.length} bookers
        </span>
        <div className="flex items-center gap-1">
          <PageBtn label="←" disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <PageBtn key={n} label={String(n)} active={page === n} onClick={() => setPage(n)} />
          ))}
          <PageBtn label="→" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} />
        </div>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  align = "left",
  active,
  dir,
  onClick,
}: {
  label: string;
  align?: "left" | "right";
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className={cn(
        "cursor-pointer select-none whitespace-nowrap px-4 text-sm font-semibold uppercase tracking-wide text-text-muted hover:text-text-dim",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {label} {active && (dir === "asc" ? "↑" : "↓")}
    </th>
  );
}

function PageBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-white"
          : "border-border text-text-muted hover:border-border-strong hover:bg-surface3 disabled:cursor-not-allowed disabled:opacity-40"
      )}
    >
      {label}
    </button>
  );
}