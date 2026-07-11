"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Select } from "@/components/ui/form-field";
import type { Weekday } from "@/types/sales";

interface OutletOption {
  id: string;
  name: string;
  area: string | null;
}

interface AddShopModalProps {
  day: Weekday | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (shop: { shopId: string; shopName: string; frequency: "WEEKLY" | "TWICE_WEEKLY" | "BI_WEEKLY" }) => void;
}

export function AddShopModal({ day, open, onOpenChange, onAdd }: AddShopModalProps) {
  const [outlets, setOutlets] = useState<OutletOption[]>([]);
  const [shopId, setShopId] = useState("");
  const [frequency, setFrequency] = useState<"WEEKLY" | "TWICE_WEEKLY" | "BI_WEEKLY">("WEEKLY");

  useEffect(() => {
    if (!open) return;
    fetch("/api/outlets")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setOutlets(json.data);
      })
      .catch(() => null);
  }, [open]);

  function handleAdd() {
    const outlet = outlets.find((o) => o.id === shopId);
    if (!outlet) {
      toast.error("Please select a shop");
      return;
    }
    onAdd({ shopId: outlet.id, shopName: outlet.name, frequency });
    setShopId("");
    setFrequency("WEEKLY");
    onOpenChange(false);
    toast.success("Shop added to route — click Save PJP to persist it");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">Add Shop to Route — {day}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FormField label="Shop" required>
            <Select value={shopId} onChange={(e) => setShopId(e.target.value)}>
              <option value="">Select shop…</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                  {o.area ? ` — ${o.area}` : ""}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Visit Frequency">
            <Select value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)}>
              <option value="WEEKLY">Weekly</option>
              <option value="TWICE_WEEKLY">Twice a week</option>
              <option value="BI_WEEKLY">Bi-weekly</option>
            </Select>
          </FormField>
        </div>

        <DialogFooter className="mt-5 gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add to Route</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}