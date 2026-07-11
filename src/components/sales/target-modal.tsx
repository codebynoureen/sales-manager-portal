"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

interface BookerOption {
  id: string;
  name: string;
}

function monthOption(offset: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
  return { value, label };
}

export function TargetModal({ mode, target, open, onOpenChange }: TargetModalProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [bookers, setBookers] = useState<BookerOption[]>([]);

  const months = [monthOption(0), monthOption(1)];

  const [bookerUserId, setBookerUserId] = useState(target?.bookerUserId ?? "");
  const [targetMonth, setTargetMonth] = useState(target?.targetMonth ?? months[0].value);
  const [pkrTarget, setPkrTarget] = useState(target ? String(target.pkrTargetPaisa / 100) : "");
  const [newOutletTarget, setNewOutletTarget] = useState(target ? String(target.newOutletTarget) : "");

  useEffect(() => {
    if (!open || mode !== "create") return;
    fetch("/api/sales/bookers")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setBookers(json.data);
      })
      .catch(() => null);
  }, [open, mode]);

  useEffect(() => {
    setBookerUserId(target?.bookerUserId ?? "");
    setTargetMonth(target?.targetMonth ?? months[0].value);
    setPkrTarget(target ? String(target.pkrTargetPaisa / 100) : "");
    setNewOutletTarget(target ? String(target.newOutletTarget) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, open]);

  async function handleSave() {
    if (!bookerUserId) {
      toast.error("Please select a booker");
      return;
    }
    const pkrValue = Number(pkrTarget.replace(/,/g, ""));
    if (!pkrValue || pkrValue <= 0) {
      toast.error("Please enter a valid PKR target");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/sales/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookerUserId,
          targetMonth,
          pkrTargetPaisa: Math.round(pkrValue * 100),
          newOutletTarget: Number(newOutletTarget || 0),
        }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to save target");
        return;
      }

      onOpenChange(false);
      toast.success(mode === "create" ? "Target set successfully" : "Target updated");
      router.refresh();
    } finally {
      setSaving(false);
    }
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
              <Select value={bookerUserId} onChange={(e) => setBookerUserId(e.target.value)}>
                <option value="">Select booker…</option>
                {bookers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}
          {mode === "create" && (
            <FormField label="Target Month">
              <Select value={targetMonth} onChange={(e) => setTargetMonth(e.target.value)}>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </FormField>
          )}
          <FormField label="Total PKR Target" required>
            <Input
              type="text"
              className="font-mono"
              placeholder="e.g. 1500000"
              value={pkrTarget}
              onChange={(e) => setPkrTarget(e.target.value)}
            />
          </FormField>
          <FormField label="New Outlet Acquisition Target">
            <Input
              type="number"
              placeholder="e.g. 4"
              value={newOutletTarget}
              onChange={(e) => setNewOutletTarget(e.target.value)}
            />
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