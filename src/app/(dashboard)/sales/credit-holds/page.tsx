import { CreditHoldScreen } from "@/components/sales/credit-hold-screen";
import { getCreditHolds, getCreditHoldStats } from "@/lib/api/sales";

export default async function CreditHoldsPage() {
  const [shops, stats] = await Promise.all([getCreditHolds(), getCreditHoldStats()]);

  return <CreditHoldScreen shops={shops} releasedThisWeek={stats.releasedThisWeek} />;
}