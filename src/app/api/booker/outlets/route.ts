import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import type { PendingOutlet } from "@/types/sales";

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const hrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs} hrs ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/** GET /api/booker/outlets?status=PENDING — booker-submitted new outlet registrations. */
export const GET = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") ?? "PENDING") as "PENDING" | "APPROVED" | "REJECTED";
  const dbStatus = status === "APPROVED" ? "ACTIVE" : status;

  const outlets = await prisma.outlet.findMany({
    where: { tenantId: session.tenantId, approvalStatus: dbStatus, isDeleted: false } as never,
    orderBy: { createdAt: "desc" },
  });

  const bookerIds = [...new Set(outlets.map((o) => (o as unknown as { submittedByUserId?: string }).submittedByUserId).filter(Boolean))] as string[];
  const bookers = await prisma.user.findMany({ where: { id: { in: bookerIds } }, select: { id: true, name: true } });
  const bookerNameById = new Map(bookers.map((b) => [b.id, b.name ?? "Unknown"]));

  const rows: PendingOutlet[] = outlets.map((o) => {
    const outlet = o as unknown as {
      id: string;
      name: string;
      area: string | null;
      ownerName: string | null;
      mobile: string | null;
      address: string | null;
      shopType: string | null;
      gpsLat: number | null;
      gpsLng: number | null;
      estMonthlyPurchasePaisa: number | null;
      submittedByUserId: string | null;
      createdAt: Date;
      approvalStatus: "PENDING" | "ACTIVE" | "REJECTED";
    };

    return {
      outletId: outlet.id,
      shopName: outlet.name,
      bookerName: outlet.submittedByUserId ? bookerNameById.get(outlet.submittedByUserId) ?? "—" : "—",
      area: outlet.area ?? "—",
      ownerName: outlet.ownerName ?? "—",
      mobile: outlet.mobile ?? "—",
      address: outlet.address ?? "—",
      shopType: outlet.shopType ?? "—",
      gpsLat: outlet.gpsLat ? Number(outlet.gpsLat) : 0,
      gpsLng: outlet.gpsLng ? Number(outlet.gpsLng) : 0,
      estMonthlyPurchasePaisa: outlet.estMonthlyPurchasePaisa ?? 0,
      submittedAgo: timeAgo(outlet.createdAt),
      status: outlet.approvalStatus === "ACTIVE" ? "APPROVED" : outlet.approvalStatus,
    };
  });

  return ok(rows);
});
