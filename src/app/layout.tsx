import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PulseStrip } from "@/components/layout/pulse-strip";
import { getPulseSummary } from "@/lib/api/dashboard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side fetch, scoped to the caller's tenant/territory via JWT — see lib/api/dashboard.ts
  const pulse = await getPulseSummary();

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Topbar />
      <PulseStrip
        zeroOrderBookers={pulse.zeroOrderBookers}
        shopsOnHold={pulse.shopsOnHold}
        outletsPending={pulse.outletsPending}
        targetPct={pulse.targetPct}
        dayOfMonth={pulse.dayOfMonth}
        lastSyncedLabel={pulse.lastSyncedLabel}
      />
      <main className="ml-[250px] mt-28 min-h-[calc(100vh-112px)] p-6">{children}</main>
    </div>
  );
}