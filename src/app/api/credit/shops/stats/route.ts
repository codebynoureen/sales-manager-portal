import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

/** GET /api/credit/shops/stats — released-this-week count for the Credit Hold KPI card. */
export const GET = withErrorHandling(async () => {
  const session = await requireRole("SALES_MGR", "ADMIN");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const releasedThisWeek = await prisma.creditHold.count({
    where: {
      tenantId: session.tenantId,
      active: false,
      releasedAt: { gte: sevenDaysAgo },
      isDeleted: false,
    },
  });

  return ok({ releasedThisWeek });
});