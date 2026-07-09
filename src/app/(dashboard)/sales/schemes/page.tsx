import { SchemesScreen } from "@/components/sales/schemes-screen";
import { getSchemes } from "@/lib/api/sales";

export default async function SchemesPage() {
  const schemes = await getSchemes();

  return <SchemesScreen schemes={schemes} />;
}