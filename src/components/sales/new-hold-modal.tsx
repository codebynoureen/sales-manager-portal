"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Select, Textarea } from "@/components/ui/form-field";

interface OutletOption {
  id: string;
  name: string;
  area: string | null;
}

export function NewHoldModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [outlets, setOutlets] = useState<OutletOption[]>([]);
  const [shopId, setShopId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/outlets")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setOutlets(json.data);
      })
      .catch(() => null);
  }, [open]);

  async function handlePlaceHold() {
    if (!shopId) {
      toast.error("Please select a shop");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/credit/shops/${shopId}/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PLACE", reason: reason.trim() }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to place hold");
        return;
      }

      onOpenChange(false);
      setShopId("");
      setReason("");
      toast.error("Credit hold placed — WhatsApp sent to shop and booker");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">Place New Credit Hold</DialogTitle>
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
          <FormField label="Reason" required>
            <Textarea
              placeholder="Reason for placing this shop on hold…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormField>
        </div>

        <DialogFooter className="mt-5 gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-danger text-white hover:bg-[#A93226]" onClick={handlePlaceHold} disabled={saving}>
            {saving ? "Placing…" : "Place Hold"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}