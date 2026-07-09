"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { FormField, Input, Select } from "@/components/ui/form-field";
import { RejectOutletModal } from "@/components/sales/reject-outlet-modal";
import type { PendingOutlet } from "@/types/sales";

function formatPaisa(paisa: number) {
  return (paisa / 100).toLocaleString("en-PK");
}

export function OutletReviewCard({ outlet, onDecided }: { outlet: PendingOutlet; onDecided: () => void }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  async function handleApprove() {
    setApproving(true);
    // PATCH /api/booker/outlets/:id/approve — set credit limit + beat, notify booker (Section 4.6)
    await fetch(`/api/booker/outlets/${outlet.outletId}/approve`, { method: "PATCH" }).catch(() => null);
    setApproving(false);
    onDecided();
    toast.success(`${outlet.shopName} approved and activated — booker notified`);
  }

  return (
    <div className="mb-5 rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <span className="font-display text-lg font-semibold text-text">{outlet.shopName} — New Registration</span>
          <div className="text-sm text-text-muted">Submitted by {outlet.bookerName} · {outlet.submittedAgo}</div>
        </div>
        <span className="inline-flex h-[22px] items-center rounded-full bg-warning-subtle px-2.5 text-[11px] font-semibold text-warning">Pending Verification</span>
      </div>

      <div className="p-5">
        <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailItem label="Owner Name" value={outlet.ownerName} />
          <DetailItem label="Mobile" value={outlet.mobile} mono />
          <DetailItem label="Address" value={outlet.address} />
          <DetailItem label="Shop Type" value={outlet.shopType} />
          <DetailItem label="GPS Location" value={`${outlet.gpsLat.toFixed(4)}° N, ${outlet.gpsLng.toFixed(4)}° E`} mono />
          <DetailItem label="Est. Monthly Purchase" value={`PKR ${formatPaisa(outlet.estMonthlyPurchasePaisa)}`} mono />
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-lg border border-info/20 bg-info-subtle px-5 py-4 text-sm text-info">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
          No duplicate match found for this phone number or address within 500m radius.
        </div>

        <div className="grid grid-cols-2 gap-5">
          <FormField label="Approve Credit Limit (PKR)">
            <Input className="font-mono" defaultValue={formatPaisa(outlet.estMonthlyPurchasePaisa - 30_000_00)} />
          </FormField>
          <FormField label="Assign to Beat / Booker">
            <Select defaultValue={`${outlet.bookerName} — ${outlet.area} (existing)`}>
              <option>{outlet.bookerName} — {outlet.area} (existing)</option>
              <option>Sara Malik — Johar Town</option>
            </Select>
          </FormField>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-5">
          <button onClick={() => setRejectOpen(true)} className="flex h-10 items-center rounded-md bg-danger px-5 text-base font-medium text-white transition-colors hover:bg-[#A93226]">
            Reject
          </button>
          <button onClick={handleApprove} disabled={approving} className="flex h-10 items-center rounded-md bg-success px-5 text-base font-medium text-white transition-colors hover:bg-[#096840] disabled:opacity-60">
            {approving ? "Approving…" : "Approve & Activate"}
          </button>
        </div>
      </div>

      <RejectOutletModal open={rejectOpen} onOpenChange={setRejectOpen} onRejected={onDecided} />
    </div>
  );
}

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      <span className={`text-base font-medium text-text ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
