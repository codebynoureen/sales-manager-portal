import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

/** PATCH /api/schemes/:id/extend — pushes endDate 3 days further out. */
export const PATCH = withErrorHandling(async (_req, ctx) => {
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;
  const session = await requireRole("SALES_MGR", "ADMIN");

  const scheme = await prisma.scheme.findFirst({
    where: { id, tenantId: session.tenantId, isDeleted: false },
  });
  if (!scheme) throw new Error("Scheme not found in this tenant");

  const newEndDate = new Date(scheme.endDate);
  newEndDate.setDate(newEndDate.getDate() + 3);

  const updated = await prisma.scheme.update({
    where: { id },
    data: { endDate: newEndDate, active: true },
  });

  return ok(updated, "Scheme extended by 3 days");
});