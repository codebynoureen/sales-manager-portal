import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import type { PjpAdherenceRow } from "@/types/sales";

function statusFor(pct: number): PjpAdherenceRow["status"] {
  if (pct >= 90) return "EXCELLENT";
  if (pct >= 75) return "GOOD";
  return "NEGLECTED";
}

/** GET /api/sales/pjp/adherence — planned vs actual visit adherence report. */
export const GET = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const { searchParams } = new URL(req.url);

  // Default window: last 30 days.
  const days = Number(searchParams.get("days") ?? 30);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const bookers = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: "BOOKER" } as never,
    select: { id: true, name: true },
  });
  const bookerIds = bookers.map((b) => b.id);

  const visitCounts = await prisma.beatVisit.groupBy({
    by: ["bookerUserId", "status"],
    where: {
      tenantId: session.tenantId,
      bookerUserId: { in: bookerIds },
      visitDate: { gte: since },
      isDeleted: false,
    },
    _count: { _all: true },
  });

  const rows: PjpAdherenceRow[] = bookers
    .map((b) => {
      const forBooker = visitCounts.filter((v) => v.bookerUserId === b.id);
      const plannedVisits = forBooker.reduce((sum, v) => sum + v._count._all, 0);
      const actualVisits = forBooker
        .filter((v) => v.status === "COMPLETED" || v.status === "CHECKED_IN")
        .reduce((sum, v) => sum + v._count._all, 0);
      const adherencePct = plannedVisits > 0 ? Math.round((actualVisits / plannedVisits) * 100) : 0;

      return {
        bookerUserId: b.id,
        bookerName: b.name ?? "Unknown",
        plannedVisits,
        actualVisits,
        adherencePct,
        status: statusFor(adherencePct),
      };
    })
    .sort((a, b) => a.adherencePct - b.adherencePct);

  return ok(rows);
});
