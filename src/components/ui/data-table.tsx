"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
}

export interface DataTableFilter<T> {
  label: string;
  predicate: (row: T) => boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  filters?: DataTableFilter<T>[];
  rowClassName?: (row: T) => string;
  pageSize?: number;
  toolbarRight?: React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  searchPlaceholder = "Search…",
  searchFn,
  filters = [],
  rowClassName,
  pageSize = 10,
  toolbarRight,
  emptyMessage = "No results match your search or filter.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(0); // 0 = "All"
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = rows;
    if (query && searchFn) result = result.filter((r) => searchFn(r, query));
    if (activeFilter > 0 && filters[activeFilter - 1]) {
      result = result.filter(filters[activeFilter - 1].predicate);
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        result = [...result].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
          return sortDir === "asc" ? cmp : -cmp;
        });
      }
    }
    return result;
  }, [rows, query, activeFilter, sortKey, sortDir, filters, columns, searchFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex h-[52px] items-center gap-3 border-b border-border px-5">
        {searchFn && (
          <div className="flex h-9 min-w-[220px] items-center gap-2 rounded-md border-[1.5px] border-border bg-surface2 px-3">
            <Search className="h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-base text-text outline-none placeholder:text-text-muted"
            />
          </div>
        )}
        {filters.length > 0 && (
          <>
            <FilterChip label="All" active={activeFilter === 0} onClick={() => { setActiveFilter(0); setPage(1); }} />
            {filters.map((f, i) => (
              <FilterChip
                key={f.label}
                label={f.label}
                active={activeFilter === i + 1}
                onClick={() => { setActiveFilter(i + 1); setPage(1); }}
              />
            ))}
          </>
        )}
        {toolbarRight && <div className="ml-auto flex items-center gap-2">{toolbarRight}</div>}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="h-10 border-b-[1.5px] border-border-strong bg-surface2">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                className={cn(
                  "whitespace-nowrap px-4 text-sm font-semibold uppercase tracking-wide text-text-muted",
                  col.align === "right" ? "text-right" : "text-left",
                  col.sortable && "cursor-pointer select-none hover:text-text-dim"
                )}
              >
                {col.header} {col.sortable && sortKey === col.key && (sortDir === "asc" ? "↑" : "↓")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => (
            <tr
              key={getRowId(row)}
              className={cn(
                "h-[52px] border-b border-border transition-colors last:border-b-0 hover:bg-surface3",
                rowClassName?.(row)
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 text-base text-text-dim", col.align === "right" && "text-right")}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-border px-5 py-4">
        <span className="text-[13px] text-text-muted">
          Showing {pageRows.length === 0 ? 0 : (page - 1) * pageSize + 1}–{(page - 1) * pageSize + pageRows.length} of {filtered.length}
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

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-[30px] rounded-full border px-3 text-sm transition-colors",
        active
          ? "border-primary bg-primary-subtle text-primary"
          : "border-border bg-surface2 text-text-dim hover:border-border-strong hover:bg-surface3"
      )}
    >
      {label}
    </button>
  );
}

function PageBtn({ label, active, disabled, onClick }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
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
