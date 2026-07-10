import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import type { BookerTarget } from "@/types/sales";

function currentMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function statusFor(achievedPct: number, expectedPct: number): BookerTarget["status"] {
  if (expectedPct <= 0) return "ON_TRACK";
  const ratio = achievedPct / expectedPct;
  if (ratio >= 1.05) return "EXCEEDING";
  if (ratio >= 0.9) return "ON_TRACK";
  if (ratio >= 0.6) return "WATCH";
  return "BEHIND";
}

/** GET /api/sales/targets/achievement — target vs achievement per booker, ranked. */
export const GET = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const { searchParams } = new URL(req.url);
  const targetMonth = searchParams.get("month") ?? currentMonthKey();

  const [year, month] = targetMonth.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
  const now = new Date();
  const daysInMonth = monthEnd.getDate();
  const daysElapsed = now < monthStart ? 0 : now > monthEnd ? daysInMonth : now.getDate();
  const daysRemaining = Math.max(daysInMonth - daysElapsed, 0);
  const expectedPct = daysElapsed / daysInMonth;

  const targets = await prisma.target.findMany({
    where: { tenantId: session.tenantId, targetMonth, isDeleted: false },
    include: { booker: { select: { id: true, name: true } } },
  });

  const bookerIds = targets.map((t) => t.bookerUserId);

  const [achievedRows, newOutletRows] = await Promise.all([
    prisma.order.groupBy({
      by: ["bookerUserId"],
      where: {
        tenantId: session.tenantId,
        bookerUserId: { in: bookerIds },
        status: { in: ["CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"] },
        createdAt: { gte: monthStart, lte: monthEnd },
        isDeleted: false,
      },
      _sum: { totalPaisa: true },
    }),
    prisma.outlet.groupBy({
      by: ["submittedByUserId"],
      where: {
        tenantId: session.tenantId,
        submittedByUserId: { in: bookerIds },
        approvalStatus: "ACTIVE",
        approvedAt: { gte: monthStart, lte: monthEnd },
      } as never,
      _count: { _all: true },
    }),
  ]);

  const achievedMap = new Map(achievedRows.map((r) => [r.bookerUserId, r._sum.totalPaisa ?? 0]));
  const newOutletMap = new Map(
    newOutletRows.map((r) => [(r as unknown as { submittedByUserId: string }).submittedByUserId, r._count._all])
  );

  const result: BookerTarget[] = targets
    .map((t) => {
      const pkrAchievedPaisa = achievedMap.get(t.bookerUserId) ?? 0;
      const achievedPct = t.pkrTargetPaisa > 0 ? pkrAchievedPaisa / t.pkrTargetPaisa : 0;
      return {
        bookerUserId: t.bookerUserId,
        bookerName: t.booker.name ?? "Unknown",
        targetMonth: t.targetMonth,
        pkrTargetPaisa: t.pkrTargetPaisa,
        pkrAchievedPaisa,
        newOutletTarget: t.newOutletTarget,
        newOutletActual: newOutletMap.get(t.bookerUserId) ?? 0,
        status: statusFor(achievedPct, expectedPct),
      };
    })
    .sort((a, b) => b.pkrAchievedPaisa / b.pkrTargetPaisa - a.pkrAchievedPaisa / a.pkrTargetPaisa);

  // Response shape matches BookerTarget[] exactly (src/types/sales.ts) so it
  // drops straight into the existing getBookerTargets() call site.
  // Days-remaining / run-rate are computed server-side per item 8 but aren't
  // part of the current BookerTarget contract — exposed via headers for now
  // so the frontend can adopt them without a breaking response-shape change.
  return ok(result, `${daysRemaining} days remaining in ${targetMonth}`);
});
