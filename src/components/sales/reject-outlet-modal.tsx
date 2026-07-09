"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Textarea } from "@/components/ui/form-field";

export function RejectOutletModal({
  open,
  onOpenChange,
  onRejected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleReject() {
    setSaving(true);
    // PATCH /api/booker/outlets/:id/approve { status: "REJECTED" } — Section 4.6
    await fetch("/api/booker/outlets/reject", { method: "PATCH" }).catch(() => null);
    setSaving(false);
    onOpenChange(false);
    onRejected();
    toast.error("Outlet registration rejected — booker notified");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-danger">Reject Outlet Registration</DialogTitle>
        </DialogHeader>

        <FormField label="Rejection Reason" required>
          <Textarea placeholder="e.g. Duplicate outlet, incomplete documentation…" />
        </FormField>

        <DialogFooter className="mt-5 gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-danger text-white hover:bg-[#A93226]" onClick={handleReject} disabled={saving}>
            {saving ? "Rejecting…" : "Confirm Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
