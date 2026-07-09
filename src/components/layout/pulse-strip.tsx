import { AlertCircle, ShieldAlert, Building2, Clock, RefreshCw } from "lucide-react";

interface PulseStripProps {
  zeroOrderBookers: number;
  shopsOnHold: number;
  outletsPending: number;
  targetPct: number;
  dayOfMonth: number;
  lastSyncedLabel: string;
}

export function PulseStrip({
  zeroOrderBookers,
  shopsOnHold,
  outletsPending,
  targetPct,
  dayOfMonth,
  lastSyncedLabel,
}: PulseStripProps) {
  return (
    <div className="fixed left-[250px] right-0 top-16 z-[99] flex h-12 items-center gap-8 overflow-hidden border-b border-white/10 bg-secondary px-5">
      {zeroOrderBookers > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-danger/[0.18] px-2.5 py-1">
          <AlertCircle className="h-3.5 w-3.5 animate-pulse text-danger" strokeWidth={2.5} />
          <span className="text-sm font-medium text-white">
            {zeroOrderBookers} booker{zeroOrderBookers > 1 ? "s" : ""} with zero orders today
          </span>
        </div>
      )}
      {shopsOnHold > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-warning/[0.18] px-2.5 py-1">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" strokeWidth={2.5} />
          <span className="text-sm font-medium text-white">{shopsOnHold} shops on credit hold</span>
        </div>
      )}
      {outletsPending > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-warning/[0.18] px-2.5 py-1">
          <Building2 className="h-3.5 w-3.5 text-warning" strokeWidth={2.5} />
          <span className="text-sm font-medium text-white">{outletsPending} outlets pending approval</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-[#5B8DB8]" strokeWidth={2} />
        <span className="text-sm text-[#8BAAD0]">
          Team at {targetPct}% of monthly target by Day {dayOfMonth}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 text-sm text-[#64748B]">
        <RefreshCw className="h-3 w-3" strokeWidth={2} />
        Last synced: {lastSyncedLabel}
      </div>
    </div>
  );
}