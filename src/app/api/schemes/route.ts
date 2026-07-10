import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, requireField, withErrorHandling } from "@/lib/api-response";
import type { FundingType, SchemeType } from "@prisma/client";

interface SkuCondition {
  productId: string;
  minQty?: number;
}

interface CreateSchemeBody {
  name: string;
  type: SchemeType;
  fundingType: FundingType;
  startDate: string;
  endDate: string;
  skuConditions: SkuCondition[];
  eligibleTiers?: string[];
  eligibleChannels?: string[];
  nonStackable?: boolean;
  rewardSkuId?: string;
  rewardQty?: number;
  discountPct?: number; // 0-100 integer
  fixedPricePaisa?: number; // integer paisa, never float (RULE 2)
  maxQtyPerScheme?: number;
  maxQtyPerShop?: number;
}

/** POST /api/schemes — create a scheme of any type with eligibility + reward config. */
export const POST = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const body = (await req.json()) as CreateSchemeBody;

  const name = requireField(body.name, "name");
  const type = requireField(body.type, "type");
  const fundingType = requireField(body.fundingType, "fundingType");
  const startDate = new Date(requireField(body.startDate, "startDate"));
  const endDate = new Date(requireField(body.endDate, "endDate"));
  const skuConditions = requireField(body.skuConditions, "skuConditions");

  if (!Array.isArray(skuConditions) || skuConditions.length === 0) {
    throw new Error("skuConditions must be a non-empty array");
  }
  if (endDate <= startDate) {
    throw new Error("endDate must be after startDate");
  }
  if (body.discountPct !== undefined && (body.discountPct < 0 || body.discountPct > 100)) {
    throw new Error("discountPct must be between 0 and 100");
  }
  if (body.fixedPricePaisa !== undefined && !Number.isInteger(body.fixedPricePaisa)) {
    throw new Error("fixedPricePaisa must be an integer (paisa)"); // RULE 2
  }

  const productIds = [...new Set(skuConditions.map((c) => c.productId))];
  const validProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, tenantId: session.tenantId, isDeleted: false },
    select: { id: true },
  });
  if (validProducts.length !== productIds.length) {
    throw new Error("One or more skuConditions.productId values do not belong to this tenant");
  }

  const scheme = await prisma.$transaction(async (tx) => {
    const created = await tx.scheme.create({
      data: {
        tenantId: session.tenantId,
        name,
        type,
        fundingType,
        startDate,
        endDate,
        active: endDate > new Date(),
        skuConditions: skuConditions as never,
        eligibleTiers: body.eligibleTiers as never,
        eligibleChannels: body.eligibleChannels as never,
        nonStackable: body.nonStackable ?? false,
        rewardSkuId: body.rewardSkuId,
        rewardQty: body.rewardQty,
        discountPct: body.discountPct,
        fixedPricePaisa: body.fixedPricePaisa,
        maxQtyPerScheme: body.maxQtyPerScheme,
        maxQtyPerShop: body.maxQtyPerShop,
      },
    });

    await tx.schemeSku.createMany({
      data: productIds.map((productId) => ({ schemeId: created.id, productId })),
    });

    return created;
  });

  return ok(scheme, "Scheme created and pushed to eligible bookers");
});
