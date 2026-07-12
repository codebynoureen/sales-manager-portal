import { BroadcastScreen } from "@/components/sales/broadcast-screen";
import { getBroadcasts, getBookers } from "@/lib/api/sales";
import { getSessionUser } from "@/lib/auth";

export default async function BroadcastPage() {
  const [broadcasts, bookers, session] = await Promise.all([getBroadcasts(), getBookers(), getSessionUser()]);

  const senderName = session.name?.trim() || session.email?.trim() || "Sales Manager (name not set)";

  return <BroadcastScreen broadcasts={broadcasts} bookerCount={bookers.length} senderName={senderName} />;
}