import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async () => {
  const session = await requireRole("SALES_MGR", "ADMIN");

  const products = await prisma.product.findMany({
    where: { tenantId: session.tenantId, isDeleted: false },
    select: { id: true, name: true, pricePaisa: true },
    orderBy: { name: "asc" },
  });

  return ok(products);
});