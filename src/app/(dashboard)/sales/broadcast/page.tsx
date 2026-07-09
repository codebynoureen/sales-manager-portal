import { BroadcastScreen } from "@/components/sales/broadcast-screen";
import { getBroadcasts } from "@/lib/api/sales";

export default async function BroadcastPage() {
  const broadcasts = await getBroadcasts();

  return <BroadcastScreen broadcasts={broadcasts} />;
}