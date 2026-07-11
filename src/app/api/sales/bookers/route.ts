import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

/** GET /api/sales/bookers — lightweight booker list for <select> dropdowns. */
export const GET = withErrorHandling(async () => {
  const session = await requireRole("SALES_MGR", "ADMIN");

  const bookers = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: "BOOKER", active: true } as never,
    select: { id: true, name: true, assignedBeat: true },
    orderBy: { name: "asc" },
  });

  return ok(bookers.map((b) => ({ id: b.id, name: b.name ?? "Unnamed Booker", area: b.assignedBeat })));
});