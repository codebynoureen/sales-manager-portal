import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import type { BookerDailyStats, BookerLivePosition, TerritoryDashboardData } from "@/types/sales";

// A booker with zero CHECKED_IN (or further) visits by this hour is flagged
// as a no-show exception (Section 4.1, item 4). Configurable via env.
const NO_SHOW_CUTOFF_HOUR = Number(process.env.NO_SHOW_CUTOFF_HOUR ?? 12);

export const GET = withErrorHandling(async () => {
  // RULE 6 / Section 4.1: only Sales Managers see this dashboard.
  const session = await requireRole("SALES_MGR");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Every booker in this manager's tenant (RULE 1: tenantId scoping).
  // Territory is modelled at the tenant level today — if/when a
  // dedicated Territory model is added, add `assignedTerritoryId` here.
  const bookers = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: "BOOKER", active: true} as never,
    select: { id: true, name: true, assignedBeat: true },
  });
  const bookerIds = bookers.map((b) => b.id);

  const visits = await prisma.beatVisit.findMany({
    where: {
      tenantId: session.tenantId,
      bookerUserId: { in: bookerIds },
      visitDate: { gte: startOfDay, lte: endOfDay },
      isDeleted: false,
    },
    include: { outlet: { select: { name: true, area: true, gpsLat: true, gpsLng: true } } },
  });

  const orders = await prisma.order.findMany({
    where: {
      tenantId: session.tenantId,
      bookerUserId: { in: bookerIds },
      createdAt: { gte: startOfDay, lte: endOfDay },
      isDeleted: false,
      status: { not: "CANCELLED" },
    },
    select: { bookerUserId: true, totalPaisa: true },
  });

  const now = new Date();
  const pastCutoff = now.getHours() >= NO_SHOW_CUTOFF_HOUR;

  const livePositions: BookerLivePosition[] = [];
  const bookerStats: BookerDailyStats[] = [];
  let shopsVisitedToday = 0;
  let shopsPlannedToday = 0;
  let bookersOnRoute = 0;
  let bookersIdle = 0;
  let exceptionAlertsCount = 0;

  for (const booker of bookers) {
    const bookerVisits = visits.filter((v) => v.bookerUserId === booker.id);
    const stopsPlanned = bookerVisits.length;
    const stopsDone = bookerVisits.filter((v) => v.status === "COMPLETED" || v.status === "CHECKED_IN").length;
    const checkedIn = bookerVisits.filter((v) => v.status !== "PLANNED").length;
    const bookerOrders = orders.filter((o) => o.bookerUserId === booker.id);
    const ordersCount = bookerOrders.length;
    const collectionsPaisa = 0; // TODO: wire to InvoicePayment once booker-attributed collections exist

    shopsPlannedToday += stopsPlanned;
    shopsVisitedToday += stopsDone;

    const isNoShow = pastCutoff && checkedIn === 0 && stopsPlanned > 0;
    const isIdle = stopsPlanned > 0 && stopsDone === 0 && !isNoShow;

    let status: BookerDailyStats["status"] = "ON_ROUTE";
    if (isNoShow || (ordersCount === 0 && stopsDone > 0)) status = "ZERO_ORDERS";
    if (isIdle) status = "IDLE";

    if (status === "ON_ROUTE") bookersOnRoute++;
    if (isNoShow || isIdle) {
      bookersIdle++;
      exceptionAlertsCount++;
    }

    const lastVisitWithGps = [...bookerVisits].reverse().find((v) => v.outlet.gpsLat && v.outlet.gpsLng);

    if (lastVisitWithGps) {
      livePositions.push({
        bookerUserId: booker.id,
        bookerName: booker.name ?? "Unknown",
        area: lastVisitWithGps.outlet.area ?? booker.assignedBeat ?? "—",
        lat: Number(lastVisitWithGps.outlet.gpsLat),
        lng: Number(lastVisitWithGps.outlet.gpsLng),
        isException: isNoShow || isIdle,
        exceptionLabel: isNoShow ? "No Orders" : isIdle ? "Idle" : null,
      });
    }

    bookerStats.push({
      bookerUserId: booker.id,
      bookerName: booker.name ?? "Unknown",
      area: booker.assignedBeat ?? "—",
      stopsDone,
      stopsPlanned,
      ordersCount,
      collectionsPaisa,
      status,
    });
  }

  const data: TerritoryDashboardData = {
    activeBookersToday: bookers.length,
    bookersOnRoute,
    bookersIdle,
    shopsVisitedToday,
    shopsPlannedToday,
    ordersTodayPaisa: orders.reduce((sum, o) => sum + o.totalPaisa, 0),
    exceptionAlertsCount,
    lastSyncedAt: new Date().toISOString(),
    livePositions,
    bookerStats,
  };

  return ok(data);
});
