import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";
import { OutletApprovalScreen } from "@/components/sales/outlet-approval-screen";
import { getPendingOutlets, getOutletApprovalStats } from "@/lib/api/sales";
export default async function OutletApprovalPage() {
  const outlets = await getPendingOutlets();
  const stats = await getOutletApprovalStats();
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-text">New Outlet Approval Queue</h2>
        <p className="mt-1 text-base text-text-muted">Review outlet registrations submitted by bookers — approve, set credit limit, assign to beat</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-5">
        <KpiCard icon={Clock} iconColorClass="text-warning" iconBgClass="bg-warning-subtle" value={outlets.length} label="Pending Review" accentBorderClass="border-l-4 border-l-warning" />
        <KpiCard icon={CheckCircle2} iconColorClass="text-success" iconBgClass="bg-success-subtle" value={stats.approved} label="Approved This Month" />
        <KpiCard icon={XCircle} iconColorClass="text-danger" iconBgClass="bg-danger-subtle" value={stats.rejected} label="Rejected This Month" />
      </div>

      <OutletApprovalScreen outlets={outlets} />
    </div>
  );
}
