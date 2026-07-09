import { CreditHoldScreen } from "@/components/sales/credit-hold-screen";
import { getCreditHolds } from "@/lib/api/sales";


export default async function CreditHoldsPage() {
  const shops = await getCreditHolds();

  return (
    <CreditHoldScreen shops={shops} />
  );
}
