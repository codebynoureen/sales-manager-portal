import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: LucideIcon;
  iconColorClass: string; // e.g. "text-primary"
  iconBgClass: string; // e.g. "bg-primary-subtle"
  value: string | number;
  label: string;
  delta?: { text: string; direction: "up" | "down" };
  accentBorderClass?: string; // e.g. "border-l-4 border-l-danger" for alert KPIs
}

export function KpiCard({
  icon: Icon,
  iconColorClass,
  iconBgClass,
  value,
  label,
  delta,
  accentBorderClass,
}: KpiCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5 shadow-card", accentBorderClass)}>
      <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-md", iconBgClass)}>
        <Icon className={cn("h-5 w-5", iconColorClass)} strokeWidth={2} />
      </div>
      <div className="font-display text-hero font-extrabold leading-[1.1] text-text">{value}</div>
      <div className="mt-1 text-sm font-medium uppercase tracking-wide text-text-muted">{label}</div>
      {delta && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-sm font-medium",
            delta.direction === "up" ? "text-success" : "text-danger"
          )}
        >
          {delta.text}
        </div>
      )}
    </div>
  );
}