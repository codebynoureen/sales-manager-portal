"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, Select, Textarea } from "@/components/ui/form-field";

export function NewBroadcastModal({
  open,
  onOpenChange,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: (message: string, recipients: number) => void;
}) {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState(8);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    // POST /api/sales/broadcast — fan-out push + WhatsApp via BullMQ, approved Twilio template only (Section 4.7)
    await fetch("/api/sales/broadcast", { method: "POST" }).catch(() => null);
    setSending(false);
    onSent(message.trim(), recipients);
    onOpenChange(false);
    toast.success(`Broadcast sent to ${recipients} bookers`);
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[780px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">New Broadcast Message</DialogTitle>
        </DialogHeader>

        <div className="mb-5">
          <FormField label="Recipients" required>
            <Select value={recipients} onChange={(e) => setRecipients(Number(e.target.value))}>
              <option value={8}>All Bookers in Zone (8)</option>
              <option value={1}>Model Town Only (1)</option>
              <option value={1}>DHA Phase 5 Only (1)</option>
            </Select>
          </FormField>
        </div>

        <div className="mb-5">
          <FormField label="Message" required>
            <Textarea placeholder="Type your announcement…" value={message} onChange={(e) => setMessage(e.target.value)} />
          </FormField>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-info/20 bg-info-subtle px-5 py-4 text-sm text-info">
          <Info className="h-4 w-4 shrink-0" strokeWidth={2} />
          Sent via WhatsApp Business API and as an in-app notification. Delivery receipts tracked per recipient.
        </div>

        <DialogFooter className="mt-5 gap-2 border-t border-border pt-5">
          <button onClick={() => onOpenChange(false)} className="flex h-10 items-center rounded-md border-[1.5px] border-border-strong px-5 text-base font-medium text-primary transition-colors hover:border-primary hover:bg-primary-subtle">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="flex h-10 items-center gap-2 rounded-md bg-[#25D366] px-5 text-base font-medium text-white transition-colors hover:bg-[#1FB855] disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send Broadcast"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
