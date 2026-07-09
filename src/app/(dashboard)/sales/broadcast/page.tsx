import { MessageCircle, CheckCircle2, Users } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";
import { BroadcastScreen } from "@/components/sales/broadcast-screen";
import { getBroadcasts } from "@/lib/api/sales";

export default async function BroadcastPage() {
  const broadcasts = await getBroadcasts();

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-5">
        <KpiCard icon={MessageCircle} iconColorClass="text-[#25D366]" iconBgClass="bg-[#DCFCE7]" value={24} label="Broadcasts Sent (June)" />
        <KpiCard icon={CheckCircle2} iconColorClass="text-success" iconBgClass="bg-success-subtle" value="97%" label="Delivery Rate" />
        <KpiCard icon={Users} iconColorClass="text-primary" iconBgClass="bg-primary-subtle" value={8} label="Bookers in Zone" />
      </div>

      <BroadcastScreen broadcasts={broadcasts} />
    </div>
  );
}
