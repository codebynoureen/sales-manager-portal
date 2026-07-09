"use client";

import { useState } from "react";
import { Plus, MessageCircle, CheckCircle2, Users } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { NewBroadcastModal } from "@/components/sales/new-broadcast-modal";
import { cn } from "@/lib/utils";
import type { BroadcastMessage } from "@/types/sales";

export function BroadcastScreen({ broadcasts: initialBroadcasts }: { broadcasts: BroadcastMessage[] }) {
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  function handleSent(message: string, recipients: number) {
    setBroadcasts((prev) => [{ broadcastId: `bc-${Date.now()}`, message, recipients, delivered: recipients, sentAgo: "Just now" }, ...prev]);
    setLastSent(message);
  }

  const columns: DataTableColumn<BroadcastMessage>[] = [
    { key: "message", header: "Message", render: (r) => <span className="font-medium">{r.message}</span> },
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

  <KpiCard
    icon={MessageCircle}
    iconColorClass="text-[#25D366]"
    iconBgClass="bg-[#DCFCE7]"
    value={24}
    label="Broadcasts Sent (June)"
  />

  <KpiCard
    icon={CheckCircle2}
    iconColorClass="text-success"
    iconBgClass="bg-success-subtle"
    value="97%"
    label="Delivery Rate"
  />

  <KpiCard
    icon={Users}
    iconColorClass="text-primary"
    iconBgClass="bg-primary-subtle"
    value={8}
    label="Bookers in Zone"
  />

</div>
      <div className="grid grid-cols-[1fr_380px] gap-5">
        <div className="rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="border-b border-border p-5">
            <span className="font-display text-lg font-semibold text-text">Broadcast History</span>
          </div>
          <DataTable rows={broadcasts} columns={columns} getRowId={(r) => r.broadcastId} rowClassName={(r) => (r.delivered < r.recipients ? "bg-warning-subtle" : "")} />
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="border-b border-border p-5">
            <span className="font-display text-lg font-semibold text-text">Live Preview</span>
          </div>
          <div className="flex flex-col items-end rounded-b-lg bg-[#E5DDD5] p-6">
            <div className="max-w-[280px] rounded-lg rounded-bl-[4px] bg-[#DCF8C6] px-4 py-3 text-sm text-[#1A1A1A]">
              <strong>Sales Manager — Farhan Yousuf</strong>
              <br />
              <br />
              {lastSent ?? "🎉 New scheme live now: Buy 30 Get 4 Free on Lays Classic 15g. Push this to all your outlets today!"}
              <div className="mt-1 text-right text-[10px] text-[#667781]">9:00 AM ✓✓</div>
            </div>
          </div>
        </div>
      </div>

      <NewBroadcastModal open={modalOpen} onOpenChange={setModalOpen} onSent={handleSent} />
    </>
  );
}
