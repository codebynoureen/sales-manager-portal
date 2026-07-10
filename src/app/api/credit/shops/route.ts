import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import type { CreditHoldShop } from "@/types/sales";

/** GET /api/credit/shops?status=HOLD — shops currently on credit hold. */
export const GET = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "HOLD";

  if (status !== "HOLD") {
    return ok([]); // only HOLD is meaningful for this panel today
  }

  const holds = await prisma.creditHold.findMany({
    where: { tenantId: session.tenantId, active: true, isDeleted: false },
    include: {
      outlet: {
        select: {
          id: true,
          name: true,
          submittedByUserId: true,
          invoices: {
            where: { isDeleted: false, status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
            select: { totalPaisa: true, paidPaisa: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const bookerIds = [...new Set(holds.map((h) => h.outlet.submittedByUserId).filter(Boolean))] as string[];
  const bookers = await prisma.user.findMany({
    where: { id: { in: bookerIds } },
    select: { id: true, name: true },
  });
  const bookerNameById = new Map(bookers.map((b) => [b.id, b.name ?? "Unassigned"]));

  const rows: CreditHoldShop[] = holds.map((h) => {
    const outstandingPaisa = h.outlet.invoices.reduce((sum, i) => sum + (i.totalPaisa - i.paidPaisa), 0);
    const heldSinceDaysAgo = Math.floor((Date.now() - h.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return {
      shopId: h.outlet.id,
      shopName: h.outlet.name,
      bookerName: h.outlet.submittedByUserId ? bookerNameById.get(h.outlet.submittedByUserId) ?? "—" : "—",
      outstandingPaisa,
      holdReason: h.reason,
      heldSinceDaysAgo,
    };
  });

  return ok(rows);
});
