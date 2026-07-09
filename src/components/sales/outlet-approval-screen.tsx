"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { OutletReviewCard } from "@/components/sales/outlet-review-card";
import type { PendingOutlet } from "@/types/sales";

function formatPaisa(paisa: number) {
  return (paisa / 100).toLocaleString("en-PK");
}

const columns: DataTableColumn<PendingOutlet>[] = [
  { key: "shopName", header: "Shop Name", sortable: true, sortValue: (r) => r.shopName, render: (r) => <span className="font-medium">{r.shopName}</span> },
  { key: "bookerName", header: "Booker", render: (r) => <span className="text-sm">{r.bookerName}</span> },
  { key: "area", header: "Area", render: (r) => <span className="text-sm">{r.area}</span> },
  { key: "est", header: "Est. Monthly Purchase", align: "right", render: (r) => <span className="font-mono">{formatPaisa(r.estMonthlyPurchasePaisa)}</span> },
  { key: "status", header: "Status", render: () => <span className="inline-flex h-[22px] items-center rounded-full bg-warning-subtle px-2.5 text-[11px] font-semibold text-warning">Pending</span> },
  { key: "submitted", header: "Submitted", render: (r) => <span className="text-sm text-text-muted">{r.submittedAgo}</span> },
];

export function OutletApprovalScreen({ outlets: initialOutlets }: { outlets: PendingOutlet[] }) {
  const [outlets, setOutlets] = useState(initialOutlets);
  const featured = outlets[0];

  function handleDecided(outletId: string) {
    setOutlets((prev) => prev.filter((o) => o.outletId !== outletId));
  }

  return (
    <>
      {featured && <OutletReviewCard outlet={featured} onDecided={() => handleDecided(featured.outletId)} />}

      <div className="mt-5 rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="border-b border-border p-5">
          <span className="font-display text-lg font-semibold text-text">All Pending Submissions</span>
        </div>
        <DataTable rows={outlets} columns={columns} getRowId={(r) => r.outletId} emptyMessage="No pending outlet registrations." />
      </div>
    </>
  );
}
