import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, requireField, withErrorHandling, ValidationError } from "@/lib/api-response";
interface SetTargetBody {
  bookerUserId: string;
  targetMonth: string; // "2026-07"
  pkrTargetPaisa: number;
  newOutletTarget?: number;
  skuTargets?: unknown; // SKU-wise / category-wise breakdown, opaque JSON
}

/** POST /api/sales/targets — create/update a booker's monthly target. */
export const POST = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const body = (await req.json()) as SetTargetBody;

  const bookerUserId = requireField(body.bookerUserId, "bookerUserId");
  const targetMonth = requireField(body.targetMonth, "targetMonth");
  const pkrTargetPaisa = requireField(body.pkrTargetPaisa, "pkrTargetPaisa");

  const MAX_INT4 = 2_147_483_647; // Postgres Int column limit
if (!Number.isInteger(pkrTargetPaisa) || pkrTargetPaisa < 0) {
  throw new ValidationError("pkrTargetPaisa must be a non-negative integer (paisa)");
}
if (pkrTargetPaisa > MAX_INT4) {
  throw new ValidationError(
    `PKR target too large — max allowed is PKR ${(MAX_INT4 / 100).toLocaleString("en-PK")}`
  );
}
  // RULE 1: booker must belong to this manager's tenant.
  const booker = await prisma.user.findFirst({
    where: { id: bookerUserId, tenantId: session.tenantId, role: "BOOKER" } as never,
    select: { id: true },
  });
  if (!booker) throw new Error("Booker not found in this tenant");

  const target = await prisma.target.upsert({
    where: { bookerUserId_targetMonth: { bookerUserId, targetMonth } },
    create: {
      tenantId: session.tenantId,
      bookerUserId,
      targetMonth,
      pkrTargetPaisa,
      newOutletTarget: body.newOutletTarget ?? 0,
      skuTargets: body.skuTargets as never,
    },
    update: {
      pkrTargetPaisa,
      newOutletTarget: body.newOutletTarget ?? 0,
      skuTargets: body.skuTargets as never,
    },
  });

  return ok(target, "Target set successfully");
});
