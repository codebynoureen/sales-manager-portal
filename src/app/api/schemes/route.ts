import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, requireField, withErrorHandling } from "@/lib/api-response";
import type { FundingType, SchemeType } from "@prisma/client";
import type { Scheme as SchemeRow } from "@/types/sales";

interface SkuCondition {
  productId: string;
  minQty?: number;
}

/**
 * GET /api/schemes — list all schemes (Section 4.5 list view).
 *
 * NOTE / gap: `eligibleShops` is approximated as "active outlets in tenant
 * matching eligibleChannels" since there's no explicit shop-tier list per
 * scheme. `uptakeShops` and `costSoFarPaisa` are 0 for now — there's no
 * redemption-tracking table yet (a scheme "used" event isn't recorded
 * anywhere when an order applies it). Add a SchemeRedemption model + write
 * to it from wherever the Order Booker app actually submits an order using
 * GET /api/schemes/eligible's result, then wire these up for real.
 */
export const GET = withErrorHandling(async () => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const now = new Date();

  const schemes = await prisma.scheme.findMany({
    where: { tenantId: session.tenantId, isDeleted: false },
    orderBy: { createdAt: "desc" },
  });

  const outletCount = await prisma.outlet.count({
    where: { tenantId: session.tenantId, approvalStatus: "ACTIVE", isDeleted: false } as never,
  });

  const rows: SchemeRow[] = await Promise.all(
    schemes.map(async (s) => {
      const skuConditions = s.skuConditions as unknown as SkuCondition[];
      const firstProductId = skuConditions?.[0]?.productId;
      const firstProduct = firstProductId
        ? await prisma.product.findUnique({ where: { id: firstProductId }, select: { name: true } })
        : null;

      const status: SchemeRow["status"] = !s.active
        ? "EXPIRED"
        : s.startDate > now
          ? "DRAFT"
          : s.endDate < now
            ? "EXPIRED"
            : "ACTIVE";

      return {
        schemeId: s.id,
        name: s.name,
        type: s.type,
        skuLabel: firstProduct?.name ?? "—",
        fundingType: s.fundingType,
        startDate: s.startDate.toISOString().slice(0, 10),
        endDate: s.endDate.toISOString().slice(0, 10),
        eligibleShops: outletCount, // TODO: narrow by eligibleTiers/eligibleChannels
        uptakeShops: 0, // TODO: needs a SchemeRedemption model
        costSoFarPaisa: 0, // TODO: needs a SchemeRedemption model
        status,
      };
    })
  );

  return ok(rows);
});

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
