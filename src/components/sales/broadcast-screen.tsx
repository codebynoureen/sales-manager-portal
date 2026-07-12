"use client";

import { useEffect, useState } from "react";
import { Plus, MessageCircle, CheckCircle2, Users } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { NewBroadcastModal } from "@/components/sales/new-broadcast-modal";
import { cn } from "@/lib/utils";
import type { BroadcastMessage } from "@/types/sales";

export function BroadcastScreen({
  broadcasts: initialBroadcasts,
  bookerCount,
  senderName,
}: {
  broadcasts: BroadcastMessage[];
  bookerCount: number;
  senderName: string;
}) {
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setBroadcasts(initialBroadcasts);
  }, [initialBroadcasts]);

  const totalRecipients = broadcasts.reduce((sum, b) => sum + b.recipients, 0);
  const totalDelivered = broadcasts.reduce((sum, b) => sum + b.delivered, 0);
  const deliveryRate = totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0;

  // Most recently sent broadcast (API already orders by createdAt desc).
  const lastBroadcast = broadcasts[0] ?? null;

  const columns: DataTableColumn<BroadcastMessage>[] = [
    { key: "message", header: "Message", render: (r) => <span className="font-medium">{r.message}</span> },
    { key: "targetLabel", header: "Sent To", render: (r) => <span className="text-sm text-text-muted">{r.targetLabel}</span> },
    { key: "recipients", header: "Recipients", render: (r) => <span className="font-mono">{r.recipients}</span> },
    {
      key: "delivered",
      header: "Delivered",
      render: (r) => (
        <span className={cn("inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold", r.delivered === r.recipients ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning")}>
          {r.delivered}/{r.recipients}
        </span>
      ),
    },
    { key: "sentAgo", header: "Sent", render: (r) => <span className="text-sm text-text-muted">{r.sentAgo}</span> },
  ];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">Broadcast Messaging</h2>
          <p className="mt-1 text-base text-text-muted">Send announcements to all bookers in your zone — new schemes, price updates, emergencies</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Broadcast
        </button>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-5">
        <KpiCard icon={MessageCircle} iconColorClass="text-[#25D366]" iconBgClass="bg-[#DCFCE7]" value={broadcasts.length} label="Broadcasts Sent" />
        <KpiCard icon={CheckCircle2} iconColorClass="text-success" iconBgClass="bg-success-subtle" value={`${deliveryRate}%`} label="Delivery Rate" />
        <KpiCard icon={Users} iconColorClass="text-primary" iconBgClass="bg-primary-subtle" value={bookerCount} label="Bookers in Zone" />
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-5">
        <div className="rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="border-b border-border p-5">
            <span className="font-display text-lg font-semibold text-text">Broadcast History</span>
          </div>
<DataTable
  rows={broadcasts}
  columns={columns}
  getRowId={(r) => r.broadcastId}
  rowClassName={(r) => (r.delivered < r.recipients ? "bg-warning-subtle" : "")}
  emptyMessage="No broadcasts sent yet."
  searchPlaceholder="Search message, recipient…"
  searchFn={(r, q) => r.message.toLowerCase().includes(q.toLowerCase()) || r.targetLabel.toLowerCase().includes(q.toLowerCase())}
  filters={[
    { label: "Fully Delivered", predicate: (r) => r.delivered === r.recipients },
    { label: "Partial/Pending", predicate: (r) => r.delivered < r.recipients },
  ]}
/>        </div>

        <div className="rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="border-b border-border p-5">
            <span className="font-display text-lg font-semibold text-text">Live Preview</span>
          </div>
          <div className="flex flex-col items-end rounded-b-lg bg-[#E5DDD5] p-6">
            {lastBroadcast ? (
              <div className="w-[250px] rounded-lg rounded-bl-[4px] bg-[#DCF8C6] px-4 py-3 text-sm text-[#1A1A1A]">
               <div className="text-[10px] font-medium uppercase tracking-wide text-[#4A6B57]">Sales Manager</div>
<strong>{senderName}</strong>
<div className="mt-1 text-[11px] font-medium text-[#4A6B57]">To: {lastBroadcast.targetLabel || "Recipient not recorded"}</div>
                {lastBroadcast.message}
                <div className="mt-1 text-right text-[10px] text-[#667781]">
                  {lastBroadcast.sentAgo} {lastBroadcast.delivered === lastBroadcast.recipients ? "✓✓" : "✓"}
                </div>
              </div>
            ) : (
              <div className="max-w-[280px] rounded-lg bg-white/60 px-4 py-3 text-sm text-text-muted">No broadcasts sent yet — send one to see the preview here.</div>
            )}
          </div>
        </div>
      </div>
      <NewBroadcastModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
