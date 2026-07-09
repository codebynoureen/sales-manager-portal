import { Award, Wallet, TrendingUp, Clock } from "lucide-react";
import { KpiCard } from "@/components/sales/kpi-card";
import { SchemesScreen } from "@/components/sales/schemes-screen";
import { getSchemes } from "@/lib/api/sales";
import { daysUntil } from "@/lib/dates";

function fmtLakh(paisa: number) {
  return `${(paisa / 100 / 100000).toFixed(2)}L`;
}

export default async function SchemesPage() {
  const schemes = await getSchemes();
  const active = schemes.filter((s) => s.status === "ACTIVE");
  const totalCost = schemes.reduce((s, x) => s + x.costSoFarPaisa, 0);
  const avgUptake = Math.round(active.reduce((s, x) => s + (x.eligibleShops > 0 ? x.uptakeShops / x.eligibleShops : 0), 0) / (active.length || 1) * 100);
  const expiringSoon = active.filter((s) => daysUntil(s.endDate) < 3).length;

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-5">
        <KpiCard icon={Award} iconColorClass="text-gold" iconBgClass="bg-gold-subtle" value={active.length} label="Active Schemes" />
        <KpiCard icon={Wallet} iconColorClass="text-primary" iconBgClass="bg-primary-subtle" value={fmtLakh(totalCost)} label="Scheme Cost (June)" />
        <KpiCard icon={TrendingUp} iconColorClass="text-success" iconBgClass="bg-success-subtle" value={`${avgUptake}%`} label="Avg. Eligible Shop Uptake" />
        <KpiCard icon={Clock} iconColorClass="text-danger" iconBgClass="bg-danger-subtle" value={expiringSoon} label="Expiring <3 Days" accentBorderClass="border-l-4 border-l-danger" />
      </div>

      <SchemesScreen schemes={schemes} />
    </div>
  );
}
