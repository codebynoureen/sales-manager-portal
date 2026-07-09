"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AddShopModal } from "@/components/sales/add-shop-modal";
import type { PjpShopAssignment, Weekday } from "@/types/sales";

const DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PjpGrid({ initialAssignments }: { initialAssignments: PjpShopAssignment[] }) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [addDay, setAddDay] = useState<Weekday | null>(null);

  function removeShop(day: Weekday, shopId: string) {
    setAssignments((prev) => prev.filter((a) => !(a.day === day && a.shopId === shopId)));
    toast.warning("Shop removed from route");
  }

  function addShop(day: Weekday, shopName: string) {
    setAssignments((prev) => [...prev, { day, shopId: `new-${Date.now()}`, shopName }]);
  }

  async function handleSavePjp() {
    // POST /api/sales/pjp — see Student Build Guide Section 4.3
    await fetch("/api/sales/pjp", { method: "POST" }).catch(() => null);
    toast.success('PJP saved — auto-generates daily visit lists');
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">PJP Route Builder</h2>
          <p className="mt-1 text-base text-text-muted">Permanent Journey Plan — weekly route per booker, system auto-generates daily visit lists</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="h-10 w-[220px] rounded-sm border-[1.5px] border-border bg-surface2 px-3 text-base text-text outline-none">
            <option>Usman Khan — Model Town</option>
            <option>Naveed Ahmed — DHA Phase 5</option>
            <option>Sara Malik — Johar Town</option>
          </select>
          <button onClick={handleSavePjp} className="flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-white transition-colors hover:bg-primary-hover">
            Save PJP
          </button>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-lg border border-info/20 bg-info-subtle px-5 py-4 text-sm text-info">
        Click any cell to assign shops to that day. The system auto-generates each booker&apos;s daily &quot;My Beat Today&quot; list from this weekly plan.
      </div>

      <div className="mb-6 grid grid-cols-[140px_repeat(6,1fr)] gap-px overflow-hidden rounded-lg border border-border bg-border">
        <div className="flex items-center justify-center bg-surface2 p-3 text-sm font-semibold text-text-dim">Shops / Day</div>
        {DAYS.map((d) => (
          <div key={d} className="flex items-center justify-center bg-surface2 p-3 text-sm font-semibold text-text-dim">{d}</div>
        ))}

        <div className="flex items-center bg-surface2 p-3 text-sm font-semibold text-text-dim">Visit Frequency</div>
        {DAYS.map((day) => (
          <div key={day} className="min-h-[90px] bg-surface p-3">
            {assignments
              .filter((a) => a.day === day)
              .map((a) => (
                <button
                  key={a.shopId}
                  onClick={() => removeShop(day, a.shopId)}
                  className="mb-1 block w-full rounded-sm bg-primary-subtle px-1.5 py-0.5 text-left text-[10px] font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                  title="Click to remove"
                >
                  {a.shopName}
                </button>
              ))}
            <button
              onClick={() => setAddDay(day)}
              className="flex w-full items-center justify-center gap-1 rounded-sm border-[1.5px] border-dashed border-border-strong py-0.5 text-[10px] text-text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-2.5 w-2.5" /> Add Shop
            </button>
          </div>
        ))}
      </div>

      <AddShopModal day={addDay} open={addDay !== null} onOpenChange={(o) => !o && setAddDay(null)} onAdd={(name) => addDay && addShop(addDay, name)} />
    </>
  );
}
