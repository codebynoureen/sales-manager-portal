"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { NewHoldModal } from "@/components/sales/new-hold-modal";
import type { CreditHoldShop } from "@/types/sales";
import { Wallet, CheckCircle2, Clock } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";

function formatPaisa(paisa: number) {
  return (paisa / 100).toLocaleString("en-PK");
}
function fmtLakh(paisa:number){
 return `${(paisa / 100 / 100000).toFixed(1)}L`;
}
export function CreditHoldScreen({ shops: initialShops }: { shops: CreditHoldShop[] }) {
  const [shops, setShops] = useState(initialShops);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleRelease(shop: CreditHoldShop) {
    // POST /api/credit/shops/:shopId/hold — lift hold, notify via WhatsApp (Section 4.4)
    await fetch(`/api/credit/shops/${shop.shopId}/hold`, { method: "POST" }).catch(() => null);
    setShops((prev) => prev.filter((s) => s.shopId !== shop.shopId));
    toast.success(`${shop.shopName} released from credit hold — WhatsApp sent`);
  }

  const columns: DataTableColumn<CreditHoldShop>[] = [
    { key: "shopName", header: "Shop Name", sortable: true, sortValue: (r) => r.shopName, render: (r) => <span className="font-medium">{r.shopName}</span> },
    { key: "bookerName", header: "Booker", render: (r) => <span className="text-sm">{r.bookerName}</span> },
    { key: "outstanding", header: "Outstanding (PKR)", align: "right", sortable: true, sortValue: (r) => r.outstandingPaisa, render: (r) => <span className="font-mono font-semibold text-danger">{formatPaisa(r.outstandingPaisa)}</span> },
    { key: "holdReason", header: "Hold Reason", render: (r) => <span className="text-sm">{r.holdReason}</span> },
    { key: "heldSince", header: "Held Since", render: (r) => <span className="text-sm text-text-muted">{r.heldSinceDaysAgo} days ago</span> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <button onClick={() => handleRelease(r)} className="rounded-md bg-success px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#096840]">
          Release
        </button>
      ),
    },
  ];

return (
<>
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="font-display text-2xl font-bold text-text">
        Credit Hold Management
      </h2>

      <p className="mt-1 text-base text-text-muted">
        View all shops on credit hold — release after payment confirmation, or place new holds
      </p>
    </div>

    <button
      onClick={() => setModalOpen(true)}
      className="flex h-10 items-center gap-2 rounded-md bg-danger px-5 text-base font-medium text-white"
    >
      <ShieldAlert className="h-4 w-4" />
      Place New Hold
    </button>
  </div>


  {/* KPI CARDS HERE */}
  <div className="mb-6 grid grid-cols-4 gap-5">
    <KpiCard
      icon={ShieldAlert}
      iconColorClass="text-danger"
      iconBgClass="bg-danger-subtle"
      value={shops.length}
      label="Shops on Hold"
      accentBorderClass="border-l-4 border-l-danger"
    />

    <KpiCard
      icon={Wallet}
      iconColorClass="text-primary"
      iconBgClass="bg-primary-subtle"
      value={fmtLakh(
        shops.reduce((s,h)=>s+h.outstandingPaisa,0)
      )}
      label="Blocked Order Value"
    />

    <KpiCard
      icon={CheckCircle2}
      iconColorClass="text-success"
      iconBgClass="bg-success-subtle"
      value={6}
      label="Released This Week"
    />

    <KpiCard
      icon={Clock}
      iconColorClass="text-warning"
      iconBgClass="bg-warning-subtle"
      value="3.4 days"
      label="Avg. Days on Hold"
    />
  </div>


  <DataTable
     rows={shops}
     columns={columns}
     getRowId={(r)=>r.shopId}
     searchPlaceholder="Search shop name, booker…"
     searchFn={(r,q)=>
       r.shopName.toLowerCase().includes(q.toLowerCase()) ||
       r.bookerName.toLowerCase().includes(q.toLowerCase())
     }
     emptyMessage="No shops currently on hold."
  />

  <NewHoldModal open={modalOpen} onOpenChange={setModalOpen}/>
</>
)}