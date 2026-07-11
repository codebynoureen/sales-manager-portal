import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, requireField, withErrorHandling } from "@/lib/api-response";
import { enqueueBroadcastFanout } from "@/lib/queue";
import type { BroadcastMessage } from "@/types/sales";

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const hrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  return `${days} days ago`;
}

/** GET broadcast history (Section 4.7) */
export const GET = withErrorHandling(async () => {
  const session = await requireRole("SALES_MGR", "ADMIN");

  const broadcasts = await prisma.broadcast.findMany({
    where: { tenantId: session.tenantId, isDeleted: false },
    include: { receipts: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const rows: BroadcastMessage[] = broadcasts.map((b) => ({
    broadcastId: b.id,
    message: b.message,
    recipients: b.receipts.length,
    delivered: b.receipts.filter((r) => r.status === "DELIVERED" || r.status === "SENT" || r.status === "READ").length,
    sentAgo: timeAgo(b.createdAt),
  }));

  return ok(rows);
});

interface BroadcastBody {
  message: string;
  targetLabel: string; // e.g. "All Bookers in Zone (8)", shown back in the UI
  bookerUserIds?: string[]; // explicit recipient list; omit to target every active booker in tenant
}

/**
 * POST /api/sales/broadcast — fan out an announcement to targeted bookers
 * (push/in-app immediate + WhatsApp via BullMQ using an approved template).
 */
export const POST = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const body = (await req.json()) as BroadcastBody;

  const message = requireField(body.message, "message");
  const targetLabel = requireField(body.targetLabel, "targetLabel");

  const bookers = body.bookerUserIds?.length
    ? await prisma.user.findMany({
        where: { id: { in: body.bookerUserIds }, tenantId: session.tenantId, role: "BOOKER" } as never,
        select: { id: true },
      })
    : await prisma.user.findMany({
        where: { tenantId: session.tenantId, role: "BOOKER", active: true } as never,
        select: { id: true },
      });

  if (bookers.length === 0) throw new Error("No matching bookers to broadcast to");

  const broadcast = await prisma.$transaction(async (tx) => {
    const created = await tx.broadcast.create({
      data: { tenantId: session.tenantId, message, sentByUserId: session.userId, targetLabel },
    });

    await tx.broadcastReceipt.createMany({
      data: bookers.map((b) => ({ broadcastId: created.id, bookerUserId: b.id, status: "QUEUED" })),
    });

    return created;
  });

  // TODO: fire an immediate push/in-app notification here (provider TBD).
  // WhatsApp leg + delivery-receipt tracking always goes through BullMQ.
  await enqueueBroadcastFanout({
    tenantId: session.tenantId,
    broadcastId: broadcast.id,
    bookerUserIds: bookers.map((b) => b.id),
    message,
  });

  return ok(broadcast, `Broadcast sent to ${bookers.length} bookers`);
});
