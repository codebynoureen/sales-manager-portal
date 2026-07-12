"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Scheme } from "@/types/sales";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function SchemeDetailModal({
  scheme,
  onClose,
}: {
  scheme: Scheme | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!scheme) return null;
  const uptakePct = scheme.eligibleShops > 0 ? Math.round((scheme.uptakeShops / scheme.eligibleShops) * 100) : 0;

  async function handleExtend() {
    setBusy(true);
    try {
      const res = await fetch(`/api/schemes/${scheme!.schemeId}/extend`, { method: "PATCH" });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to extend scheme");
        return;
      }

      toast.success("Scheme extended by 3 days");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleExpire() {
    setBusy(true);
    try {
      const res = await fetch(`/api/schemes/${scheme!.schemeId}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? "Failed to expire scheme");
        return;
      }

      onClose();
      toast.error("Scheme expired immediately");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!scheme} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[780px] rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-text">{scheme.name} — {scheme.skuLabel}</DialogTitle>
        </DialogHeader>

        <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4">
          <Detail label="Type" value={scheme.type.replaceAll("_", " ")} />
          <Detail label="Funding" value={scheme.fundingType.replaceAll("_", " ")} />
          <Detail label="Start Date" value={fmtDate(scheme.startDate)} />
          <Detail label="End Date" value={fmtDate(scheme.endDate)} danger />
          <Detail label="Eligible Shops" value={`${scheme.eligibleShops} shops`} />
          <Detail label="Uptake" value={`${scheme.uptakeShops} shops (${uptakePct}%)`} success />
        </div>

        <div className="mb-2 h-2 overflow-hidden rounded-full bg-surface3">
          <div className="h-full rounded-full bg-gold" style={{ width: `${uptakePct}%` }} />
        </div>

        <DialogFooter className="mt-5 gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-warning text-white hover:bg-[#A85A08]" onClick={handleExtend} disabled={busy}>
            {busy ? "Working…" : "Extend 3 Days"}
          </Button>
          <Button className="bg-danger text-white hover:bg-[#A93226]" onClick={handleExpire} disabled={busy}>
            {busy ? "Working…" : "Expire Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value, danger, success }: { label: string; value: string; danger?: boolean; success?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      <span className={`text-base font-medium ${danger ? "text-danger" : success ? "text-success font-mono" : "text-text"}`}>{value}</span>
    </div>
  );
}
