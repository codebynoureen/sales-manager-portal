import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

/**
 * TEMPORARY DEBUG ROUTE — shows exactly what tenantId/role your logged-in
 * session is using, plus counts of matching rows in the DB, so tenantId
 * mismatches are obvious instead of silently returning empty lists.
 * Delete this file once debugging is done — it's not meant for production.
 */
export const GET = withErrorHandling(async () => {
  const session = await getSessionUser();

  const [bookerCount, beatVisitCount, todayBeatVisitCount, outletCount] = await Promise.all([
    prisma.user.count({ where: { tenantId: session.tenantId, role: "BOOKER" } as never }),
    prisma.beatVisit.count({ where: { tenantId: session.tenantId } }),
    prisma.beatVisit.count({
      where: {
        tenantId: session.tenantId,
        visitDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.outlet.count({ where: { tenantId: session.tenantId } }),
  ]);

  // Also show ALL distinct tenantIds that actually exist in the DB, so you
  // can see if your data landed under a different tenantId than your session.
  const allTenantIdsWithBookers = await prisma.user.groupBy({
    by: ["tenantId"],
    where: { role: "BOOKER" } as never,
    _count: { _all: true },
  });

  return ok({
    yourSession: {
      userId: session.userId,
      tenantId: session.tenantId,
      role: session.role,
      email: session.email,
    },
    countsForYourTenantId: {
      bookers: bookerCount,
      totalBeatVisits: beatVisitCount,
      beatVisitsToday: todayBeatVisitCount,
      outlets: outletCount,
    },
    allTenantIdsThatHaveBookersInDb: allTenantIdsWithBookers.map((t) => ({
      tenantId: t.tenantId,
      bookerCount: t._count._all,
    })),
  });
});