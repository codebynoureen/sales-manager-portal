import { Users, CheckCircle2, Wallet, AlertTriangle, RefreshCw } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";
import { TerritoryScreen } from "@/components/sales/territory-screen";
import { getTerritoryDashboard } from "@/lib/api/dashboard";

export default async function TerritoryOverviewPage() {
  const data = await getTerritoryDashboard();

  if (!data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-border bg-surface text-center">
        <h3 className="font-display text-lg font-semibold text-text-dim">No dashboard data yet</h3>
        <p className="mt-2 max-w-xs text-base text-text-muted">
          GPS and order data will appear here once your bookers start checking in today.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-text">Territory Overview Dashboard</h2>
          <p className="mt-1 text-base text-text-muted">
            Real-time GPS positions of all order bookers — shops visited, orders placed, collections so far
          </p>
        </div>
        <button className="flex h-10 items-center gap-2 rounded-md border-[1.5px] border-border-strong px-5 text-base font-medium text-primary transition-colors hover:border-primary hover:bg-primary-subtle">
          <RefreshCw className="h-4 w-4" strokeWidth={2} />
          Refresh GPS
        </button>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-5">
        <KpiCard
          icon={Users}
          iconColorClass="text-primary"
          iconBgClass="bg-primary-subtle"
          value={data.activeBookersToday}
          label="Active Bookers Today"
          delta={{ text: `${data.bookersOnRoute} on route, ${data.bookersIdle} idle`, direction: "up" }}
        />
        <KpiCard
          icon={CheckCircle2}
          iconColorClass="text-success"
          iconBgClass="bg-success-subtle"
          value={data.shopsVisitedToday}
          label="Shops Visited Today"
          delta={{
            text: `of ${data.shopsPlannedToday} planned (${Math.round((data.shopsVisitedToday / data.shopsPlannedToday) * 100)}%)`,
            direction: "up",
          }}
        />
        <KpiCard
          icon={Wallet}
          iconColorClass="text-primary"
          iconBgClass="bg-primary-subtle"
          value={`${(data.ordersTodayPaisa / 100 / 100000).toFixed(1)}L`}
          label="Orders Placed Today (PKR)"
        />
        <KpiCard
          icon={AlertTriangle}
          iconColorClass="text-danger"
          iconBgClass="bg-danger-subtle"
          value={data.exceptionAlertsCount}
          label="Exception Alerts"
          delta={{ text: "No-shows / zero orders", direction: "down" }}
          accentBorderClass="border-l-4 border-l-danger"
        />
      </div>

      <TerritoryScreen data={data} />
    </div>
  );
}