"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TerritoryMap } from "@/components/sales/territory-map";
import { ExceptionModal } from "@/components/sales/exception-modal";
import { BookerStatusTable } from "@/components/sales/booker-status-table";
import type { TerritoryDashboardData } from "@/types/sales";

export function TerritoryScreen({ data }: { data: TerritoryDashboardData }) {
  const [selectedException, setSelectedException] = useState<TerritoryDashboardData["livePositions"][number] | null>(null);
  const router = useRouter();

  async function handleMessageBooker(bookerUserId: string) {
    // Enqueues a WhatsApp notification via BullMQ — see /api/sales/broadcast worker
    await fetch(`/api/booker/${bookerUserId}/notify`, { method: "POST" });
    toast.success("WhatsApp sent to booker");
    setSelectedException(null);
  }

  async function handleEscalate(bookerUserId: string) {
    await fetch(`/api/booker/${bookerUserId}/escalate`, { method: "POST" });
    toast.warning("Escalated to Regional Manager");
    setSelectedException(null);
  }

  async function handleRefresh() {
    router.refresh();
  }

  return (
    <>
      <div className="mb-5 rounded-lg border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <div className="font-display text-lg font-semibold text-text">Live Booker Positions</div>
            <div className="text-sm text-text-muted">Lahore Territory — updated every 60 seconds</div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex h-10 items-center gap-2 rounded-md border-[1.5px] border-border-strong px-5 text-base font-medium text-primary transition-colors hover:border-primary hover:bg-primary-subtle"
          >
            Refresh GPS
          </button>
        </div>
        <div className="p-4">
          <TerritoryMap positions={data.livePositions} onExceptionClick={setSelectedException} />
        </div>
      </div>

      <BookerStatusTable rows={data.bookerStats} />

      <ExceptionModal
        booker={selectedException}
        onClose={() => setSelectedException(null)}
        onMessageBooker={handleMessageBooker}
        onEscalate={handleEscalate}
      />
    </>
  );
}