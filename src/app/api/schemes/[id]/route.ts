import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

/**
 * DELETE /api/schemes/:id — "Expire Now". Per Golden Rule 3 (soft-delete
 * only, never hard-delete a scheme — history matters for performance
 * reviews), this never removes the row. It just flips active:false and
 * pulls endDate to now, so it shows as EXPIRED everywhere immediately.
 */
export const DELETE = withErrorHandling(async (_req, ctx) => {
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
  const session = await requireRole("SALES_MGR", "ADMIN");

  const scheme = await prisma.scheme.findFirst({
    where: { id, tenantId: session.tenantId, isDeleted: false },
  });
  if (!scheme) throw new Error("Scheme not found in this tenant");

  const updated = await prisma.scheme.update({
    where: { id },
    data: { active: false, endDate: new Date() },
  });

  return ok(updated, "Scheme expired immediately");
});