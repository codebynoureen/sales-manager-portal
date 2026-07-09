import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysUntil } from "@/lib/dates";
import type { Scheme } from "@/types/sales";

const FUNDING_LABEL: Record<Scheme["fundingType"], { label: string; className: string }> = {
  SELF_FUNDED: { label: "Self-Funded", className: "bg-warning-subtle text-warning" },
  PRINCIPAL_FUNDED: { label: "Principal-Funded", className: "bg-info-subtle text-info" },
  SPLIT: { label: "Split", className: "bg-primary-subtle text-primary" },
};

function formatPaisa(paisa: number) {
  return (paisa / 100).toLocaleString("en-PK");
}

export function SchemeCard({ scheme, onManage }: { scheme: Scheme; onManage: () => void }) {
  const days = daysUntil(scheme.endDate);
  const uptakePct = scheme.eligibleShops > 0 ? Math.round((scheme.uptakeShops / scheme.eligibleShops) * 100) : 0;
  const funding = FUNDING_LABEL[scheme.fundingType];

  return (
    <div className={cn("relative overflow-hidden rounded-lg border bg-surface p-5", scheme.status === "ACTIVE" ? "border-[1.5px] border-success" : "border-border")}>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-subtle">
          <Award className="h-5 w-5 text-gold" strokeWidth={2} />
        </div>
        {scheme.status === "ACTIVE" && (
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", days <= 3 ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success")}>
            {days === 0 ? "Expires today" : `Expires in ${days} day${days > 1 ? "s" : ""}`}
          </span>
        )}
        {scheme.status === "EXPIRED" && <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-text-muted">Expired</span>}
        {scheme.status === "DRAFT" && <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-text-muted">Draft</span>}
      </div>

      <div className="font-display text-lg font-bold text-text">{scheme.name}</div>
      <div className="mt-0.5 text-sm text-text-muted">{scheme.skuLabel}</div>

      <div className="my-4 border-t border-border" />

      <div className="mb-2 flex justify-between">
        <span className="text-sm text-text-muted">Funding</span>
        <span className={cn("inline-flex h-[18px] items-center rounded-full px-2 text-[10px] font-semibold", funding.className)}>{funding.label}</span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="text-sm text-text-muted">Uptake</span>
        <span className="font-mono text-sm font-semibold">{uptakePct}% ({scheme.uptakeShops}/{scheme.eligibleShops})</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-text-muted">Cost So Far</span>
        <span className="font-mono text-sm font-semibold">PKR {formatPaisa(scheme.costSoFarPaisa)}</span>
      </div>

      <button onClick={onManage} className="mt-4 flex h-8 w-full items-center justify-center rounded-md border-[1.5px] border-border-strong text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary-subtle">
        Manage
      </button>
    </div>
  );
}
