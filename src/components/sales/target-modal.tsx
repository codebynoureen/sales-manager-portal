"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Input, Select } from "@/components/ui/form-field";
import type { BookerTarget } from "@/types/sales";

interface TargetModalProps {
  mode: "create" | "edit";
  target: BookerTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TargetModal({ mode, target, open, onOpenChange }: TargetModalProps) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // POST /api/sales/targets — see Student Build Guide Section 4.2
    await fetch("/api/sales/targets", { method: "POST" }).catch(() => null);
    setSaving(false);
    onOpenChange(false);
    toast.success(mode === "create" ? "Target set successfully" : "Target updated");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[580px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">
            {mode === "create" ? "Set Monthly Target" : `Edit Target — ${target?.bookerName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-5">
          {mode === "create" && (
            <FormField label="Booker" required>
              <Select defaultValue={target?.bookerName}>
                <option>Usman Khan</option>
                <option>Naveed Ahmed</option>
                <option>Sara Malik</option>
                <option>Bilal Hussain</option>
              </Select>
            </FormField>
          )}
          {mode === "create" && (
            <FormField label="Target Month">
              <Select defaultValue="July 2026">
                <option>July 2026</option>
                <option>August 2026</option>
              </Select>
            </FormField>
          )}
          <FormField label="Total PKR Target" required>
            <Input type="text" className="font-mono" placeholder="e.g. 1,500,000" defaultValue={target ? (target.pkrTargetPaisa / 100).toLocaleString("en-PK") : ""} />
          </FormField>
          <FormField label="New Outlet Acquisition Target">
            <Input type="number" placeholder="e.g. 4" defaultValue={target?.newOutletTarget} />
          </FormField>
        </div>

        <DialogFooter className="mt-5 gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : mode === "create" ? "Set Target" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
