"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";

export function NewSchemeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [saving, setSaving] = useState(false);

  async function handleLaunch() {
    setSaving(true);
    // POST /api/schemes — eligibility rules + reward config + quota limits (Section 4.5)
    await fetch("/api/schemes", { method: "POST" }).catch(() => null);
    setSaving(false);
    onOpenChange(false);
    toast.success("Scheme created and pushed to eligible bookers");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[780px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">Create New Scheme</DialogTitle>
        </DialogHeader>

        <div className="mb-5 grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <FormField label="Scheme Name" required>
              <Input placeholder="e.g. Eid Bonanza Offer" />
            </FormField>
          </div>
          <FormField label="Scheme Type" required>
            <Select defaultValue="Buy-X-Get-Y Free Goods">
              <option>Buy-X-Get-Y Free Goods</option>
              <option>Volume Slab Discount</option>
              <option>Fixed Price Promotion</option>
              <option>Bundle / Combo Deal</option>
              <option>Cash Discount</option>
              <option>Happy Hour</option>
              <option>New Outlet Scheme</option>
            </Select>
          </FormField>
          <FormField label="Funding Type" required>
            <Select defaultValue="Self-Funded">
              <option>Self-Funded</option>
              <option>Principal-Funded</option>
              <option>Split</option>
            </Select>
          </FormField>
          <FormField label="Applicable SKU" required>
            <Select defaultValue="Lays Classic 15g × 24">
              <option>Lays Classic 15g × 24</option>
              <option>Pepsi 250ml × 24</option>
              <option>Cheetos Crunchy 18g × 24</option>
            </Select>
          </FormField>
          <div />
          <FormField label="Buy Quantity (Ctns)">
            <Input type="number" placeholder="e.g. 30" />
          </FormField>
          <FormField label="Free Quantity (Ctns)">
            <Input type="number" placeholder="e.g. 4" />
          </FormField>
          <FormField label="Start Date">
            <Input type="date" defaultValue="2026-07-01" />
          </FormField>
          <FormField label="End Date">
            <Input type="date" defaultValue="2026-07-15" />
          </FormField>
        </div>

        <DialogFooter className="gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Save as Draft
          </Button>
          <Button onClick={handleLaunch} disabled={saving}>
            {saving ? "Launching…" : "Launch Scheme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
