import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PulseStrip } from "@/components/layout/pulse-strip";
import { getPulseSummary } from "@/lib/api/dashboard";
import { getSessionUser } from "@/lib/auth";

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return (email ?? "??").slice(0, 2).toUpperCase();
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [pulse, session] = await Promise.all([getPulseSummary(), getSessionUser()]);

  const userName = session.name ?? session.email ?? "Unknown User";
  const userInitials = getInitials(session.name, session.email);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar pendingOutlets={pulse.outletsPending} creditHoldShops={pulse.shopsOnHold} />
      <Topbar userName={userName} userInitials={userInitials} />
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