import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

/** GET /api/outlets — lightweight active-outlet list for <select> dropdowns. */
export const GET = withErrorHandling(async () => {
  const session = await requireRole("SALES_MGR", "ADMIN");

  const outlets = await prisma.outlet.findMany({
    where: { tenantId: session.tenantId, approvalStatus: "ACTIVE", isDeleted: false } as never,
    select: { id: true, name: true, area: true },
    orderBy: { name: "asc" },
  });

  return ok(outlets);
});