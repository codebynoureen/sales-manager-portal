"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField, Select, Textarea } from "@/components/ui/form-field";

interface BookerOption {
  id: string;
  name: string;
}

export function NewBroadcastModal({
  open,
  onOpenChange,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: (message: string, recipients: number) => void;
}) {
  const router = useRouter();
  const [bookers, setBookers] = useState<BookerOption[]>([]);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("ALL");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/sales/bookers")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setBookers(json.data);
      })
      .catch(() => null);
  }, [open]);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const isAll = target === "ALL";
      const res = await fetch("/api/sales/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          targetLabel: isAll ? `All Bookers in Zone (${bookers.length})` : bookers.find((b) => b.id === target)?.name ?? "Selected Booker",
          bookerUserIds: isAll ? undefined : [target],
        }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to send broadcast");
        return;
      }

      const recipients = isAll ? bookers.length : 1;

      onOpenChange(false);
      onSent?.(message.trim(), recipients);
      toast.success(json.message ?? "Broadcast sent");
      setMessage("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[780px]  rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">New Broadcast Message</DialogTitle>
        </DialogHeader>

        <div className="mb-5">
          <FormField label="Recipients" required>
            <Select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="ALL">All Bookers in Zone ({bookers.length})</option>
              {bookers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} only
                </option>
              ))}
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
