"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AddShopModal } from "@/components/sales/add-shop-modal";
import type { PjpShopAssignment, Weekday } from "@/types/sales";

const DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type Frequency = "WEEKLY" | "TWICE_WEEKLY" | "BI_WEEKLY";
type Assignment = PjpShopAssignment & { frequency: Frequency };

interface BookerOption {
  id: string;
  name: string;
  area: string | null;
}

export function PjpGrid({ initialAssignments }: { initialAssignments: PjpShopAssignment[] }) {
  const [bookers, setBookers] = useState<BookerOption[]>([]);
  const [selectedBookerId, setSelectedBookerId] = useState<string>("");
  const [assignments, setAssignments] = useState<Assignment[]>(
    initialAssignments.map((a) => ({ ...a, frequency: "WEEKLY" }))
  );
  const [addDay, setAddDay] = useState<Weekday | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAssignments(initialAssignments.map((a) => ({ ...a, frequency: "WEEKLY" })));
  }, [initialAssignments]);

  useEffect(() => {
    fetch("/api/sales/bookers")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.length) {
          setBookers(json.data);
          setSelectedBookerId((prev) => prev || json.data[0].id);
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedBookerId) return;
    fetch(`/api/sales/pjp?bookerUserId=${selectedBookerId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setAssignments(json.data.map((a: PjpShopAssignment) => ({ ...a, frequency: "WEEKLY" })));
        }
      })
      .catch(() => null);
  }, [selectedBookerId]);

  function removeShop(day: Weekday, shopId: string) {
    setAssignments((prev) => prev.filter((a) => !(a.day === day && a.shopId === shopId)));
    toast.warning("Shop removed — click Save PJP to persist it");
  }

  function addShop(day: Weekday, shop: { shopId: string; shopName: string; frequency: Frequency }) {
    setAssignments((prev) => {
      const withoutDupe = prev.filter((a) => !(a.day === day && a.shopId === shop.shopId));
      return [...withoutDupe, { day, shopId: shop.shopId, shopName: shop.shopName, frequency: shop.frequency }];
    });
  }

  async function handleSavePjp() {
    if (!selectedBookerId) {
      toast.error("Select a booker first");
      return;
    }
    if (assignments.length === 0) {
      toast.error("Add at least one shop before saving");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/sales/pjp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookerUserId: selectedBookerId,
          assignments: assignments.map((a) => ({ shopId: a.shopId, day: a.day, frequency: a.frequency })),
        }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to save route");
        return;
      }

      const refreshed = await fetch(`/api/sales/pjp?bookerUserId=${selectedBookerId}`);
      const refreshedJson = await refreshed.json();
      if (refreshedJson.data) {
        setAssignments(refreshedJson.data.map((a: PjpShopAssignment) => ({ ...a, frequency: "WEEKLY" })));
      }

      toast.success("PJP saved — auto-generates daily visit lists");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">PJP Route Builder</h2>
          <p className="mt-1 text-base text-text-muted">Permanent Journey Plan — weekly route per booker, system auto-generates daily visit lists</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedBookerId}
            onChange={(e) => setSelectedBookerId(e.target.value)}
            className="h-10 w-[220px] rounded-sm border-[1.5px] border-border bg-surface2 px-3 text-base text-text outline-none"
          >
            {bookers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.area ? ` — ${b.area}` : ""}
              </option>
            ))}
          </select>
          <button
            onClick={handleSavePjp}
            disabled={saving}
            className="flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save PJP"}
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

      <AddShopModal
        day={addDay}
        open={addDay !== null}
        onOpenChange={(o) => !o && setAddDay(null)}
        onAdd={(shop) => addDay && addShop(addDay, shop)}
      />
    </>
  );
}