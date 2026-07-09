// import { TargetsScreen } from "@/components/sales/targets-screen";
import { TargetsScreen } from "@/components/sales/targets-screen";
import { getBookerTargets } from "@/lib/api/sales";

export default async function TargetsPage() {
  const targets = await getBookerTargets();

  return (
    <TargetsScreen targets={targets} />
  );
}