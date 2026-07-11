"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, Textarea } from "@/components/ui/form-field";

export function RejectOutletModal({
  outletId,
  open,
  onOpenChange,
  onRejected,
}: {
  outletId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRejected: () => void;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleReject() {
    if (!outletId) return;
    if (!reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/booker/outlets/${outletId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "REJECT", rejectionReason: reason.trim() }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to reject outlet");
        return;
      }

      onOpenChange(false);
      setReason("");
      onRejected();
      toast.error("Outlet registration rejected — booker notified");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-danger">Reject Outlet Registration</DialogTitle>
        </DialogHeader>

        <FormField label="Rejection Reason" required>
          <Textarea placeholder="e.g. Duplicate outlet, incomplete documentation…" value={reason} onChange={(e) => setReason(e.target.value)} />
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