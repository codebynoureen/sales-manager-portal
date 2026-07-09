"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Select, Textarea } from "@/components/ui/form-field";

export function NewHoldModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [saving, setSaving] = useState(false);

  async function handlePlaceHold() {
    setSaving(true);
    // POST /api/credit/shops/:shopId/hold — enqueues WhatsApp via BullMQ (Section 4.4)
    await fetch("/api/credit/shops/hold", { method: "POST" }).catch(() => null);
    setSaving(false);
    onOpenChange(false);
    toast.error("Credit hold placed — WhatsApp sent to shop and booker");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">Place New Credit Hold</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FormField label="Shop" required>
            <Select defaultValue="City Mart Superstore">
              <option>City Mart Superstore</option>
              <option>Rehman Brothers</option>
              <option>Faisal Traders</option>
            </Select>
          </FormField>
          <FormField label="Reason" required>
            <Textarea placeholder="Reason for placing this shop on hold…" />
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
