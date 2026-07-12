import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PulseStrip } from "@/components/layout/pulse-strip";
import { getPulseSummary } from "@/lib/api/dashboard";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return (email ?? "??").slice(0, 2).toUpperCase();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getSession(); // jo tumhara auth function hai

  const userName = session.name ?? session.email ?? "Unknown User";
  const userInitials = getInitials(session.name, session.email);


  const pendingOutlets = await prisma.outlet.count({
    where: {
      tenantId: session.tenantId,
      approvalStatus: "PENDING",
      isDeleted: false,
    },
  });


  const creditHoldShops = await prisma.creditHold.count({
    where: {
      tenantId: session.tenantId,
      active: true,
      isDeleted: false,
    },
  });

  return (
    <div className="min-h-screen bg-bg">
<Sidebar pendingOutlets={pendingOutlets} creditHoldShops={creditHoldShops}/>
      <Topbar userName={userName} userInitials={userInitials} />
      <PulseStrip
        zeroOrderBookers={pulse.zeroOrderBookers}
        shopsOnHold={pulse.shopsOnHold}
        outletsPending={pulse.outletsPending}
        targetPct={pulse.targetPct}
        dayOfMonth={pulse.dayOfMonth}
        lastSyncedLabel={pulse.lastSyncedLabel}
      
      />
      console.log("PULSE DATA:", pulse);
      <main className="ml-[250px] mt-28 min-h-[calc(100vh-112px)] p-6">{children}</main>
    </div>
  );
}