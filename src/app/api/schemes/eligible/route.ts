import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, withErrorHandling } from "@/lib/api-response";
import type { Scheme } from "@prisma/client";

interface SkuCondition {
  productId: string;
  minQty?: number;
}

interface AppliedScheme {
  schemeId: string;
  name: string;
  type: string;
  benefitPaisa: number;
  reason: string;
}

interface LineResult {
  productId: string;
  quantity: number;
  appliedSchemes: AppliedScheme[];
  blockedSchemes: { schemeId: string; name: string; reason: string }[];
}

/** Estimated PKR benefit of applying `scheme` to a line of `quantity` units at `unitPricePaisa`. */
function estimateBenefitPaisa(scheme: Scheme, quantity: number, unitPricePaisa: number): number {
  const lineTotal = quantity * unitPricePaisa;
  switch (scheme.type) {
    case "FIXED_PRICE":
      if (scheme.fixedPricePaisa == null) return 0;
      return Math.max(unitPricePaisa - scheme.fixedPricePaisa, 0) * quantity;
    case "VOLUME_SLAB":
    case "CASH_DISCOUNT":
    case "CHANNEL":
    case "HAPPY_HOUR":
      return scheme.discountPct ? Math.round((lineTotal * scheme.discountPct) / 100) : 0;
    case "BUY_X_GET_Y":
    case "COMBO":
    case "NEW_OUTLET":
      // Free-goods value approximated as reward qty * this line's unit price —
      // callers with an exact reward SKU price can refine this client-side.
      return scheme.rewardQty ? scheme.rewardQty * unitPricePaisa : 0;
    default:
      return 0;
  }
}

/**
 * GET /api/schemes/eligible?shopId&orderId — the engine the Order Booker
 * app calls at order entry to resolve which schemes apply (Section 4.5).
 *
 * Stack-resolution rule (documented for the Lead Developer's review, per
 * Section 4.5's "read carefully" note):
 *   For each order line, gather every ACTIVE scheme whose skuConditions
 *   match that product and whose minQty is met.
 *     - If none are flagged non-stackable: ALL matching schemes combine
 *       (their benefits are summed) — that's the "stack".
 *     - If one or more are flagged non-stackable: compare the single best
 *       non-stackable scheme's benefit against the combined benefit of all
 *       stackable matches. Whichever total is larger wins; if a
 *       non-stackable scheme wins, it applies ALONE and every other
 *       matching scheme for that line is blocked (returned separately,
 *       with a reason, for receipt transparency).
 */
export const GET = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN", "BOOKER");
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get("shopId");
  const orderId = searchParams.get("orderId");

  if (!shopId || !orderId) {
    throw new Error("shopId and orderId query params are required");
  }

  const [outlet, order] = await Promise.all([
    prisma.outlet.findFirst({
      where: { id: shopId, tenantId: session.tenantId, isDeleted: false },
      select: { id: true, shopType: true },
    }),
    prisma.order.findFirst({
      where: { id: orderId, tenantId: session.tenantId, outletId: shopId, isDeleted: false },
      include: { items: { select: { productId: true, quantity: true, pricePaisa: true } } },
    }),
  ]);

  if (!outlet) throw new Error("Shop not found in this tenant");
  if (!order) throw new Error("Order not found for this shop");

  const now = new Date();
  const productIds = order.items.map((i) => i.productId);

  const candidateSchemes = await prisma.scheme.findMany({
    where: {
      tenantId: session.tenantId,
      active: true,
      isDeleted: false,
      startDate: { lte: now },
      endDate: { gte: now },
      applicableSkus: { some: { productId: { in: productIds } } },
    },
  });

  const lines: LineResult[] = order.items.map((item) => {
    const skuConditions = (candidateSchemes as unknown as (Scheme & { skuConditions: SkuCondition[] })[])
      .map((s) => ({ scheme: s, conditions: s.skuConditions as unknown as SkuCondition[] }));

    const matches = skuConditions
      .filter(({ conditions }) => {
        const cond = conditions.find((c) => c.productId === item.productId);
        return cond && item.quantity >= (cond.minQty ?? 0);
      })
      .filter(({ scheme }) => !outlet.shopType || !scheme.eligibleChannels || matchesChannel(scheme, outlet.shopType))
      .map(({ scheme }) => scheme);

    if (matches.length === 0) {
      return { productId: item.productId, quantity: item.quantity, appliedSchemes: [], blockedSchemes: [] };
    }

    const withBenefit = matches.map((s) => ({
      scheme: s,
      benefit: estimateBenefitPaisa(s, item.quantity, item.pricePaisa),
    }));

    const stackable = withBenefit.filter((m) => !m.scheme.nonStackable);
    const nonStackable = withBenefit.filter((m) => m.scheme.nonStackable);

    const stackableTotal = stackable.reduce((sum, m) => sum + m.benefit, 0);
    const bestNonStackable = nonStackable.sort((a, b) => b.benefit - a.benefit)[0];

    let appliedSchemes: AppliedScheme[];
    let blockedSchemes: LineResult["blockedSchemes"];

    if (bestNonStackable && bestNonStackable.benefit >= stackableTotal) {
      appliedSchemes = [
        {
          schemeId: bestNonStackable.scheme.id,
          name: bestNonStackable.scheme.name,
          type: bestNonStackable.scheme.type,
          benefitPaisa: bestNonStackable.benefit,
          reason: "Non-stackable scheme with the highest benefit — blocks all other matching schemes",
        },
      ];
      blockedSchemes = withBenefit
        .filter((m) => m.scheme.id !== bestNonStackable.scheme.id)
        .map((m) => ({
          schemeId: m.scheme.id,
          name: m.scheme.name,
          reason: `Blocked by non-stackable scheme "${bestNonStackable.scheme.name}"`,
        }));
    } else {
      appliedSchemes = stackable.map((m) => ({
        schemeId: m.scheme.id,
        name: m.scheme.name,
        type: m.scheme.type,
        benefitPaisa: m.benefit,
        reason: "Stackable scheme combined with other matching schemes",
      }));
      blockedSchemes = nonStackable.map((m) => ({
        schemeId: m.scheme.id,
        name: m.scheme.name,
        reason: "Non-stackable scheme's benefit was lower than the combined stackable total",
      }));
    }

    return { productId: item.productId, quantity: item.quantity, appliedSchemes, blockedSchemes };
  });

  const totalDiscountPaisa = lines.reduce(
    (sum, line) => sum + line.appliedSchemes.reduce((s, a) => s + a.benefitPaisa, 0),
    0
  );

  return ok({ orderId, shopId, lines, totalDiscountPaisa });
});

function matchesChannel(scheme: Scheme, shopType: string): boolean {
  const channels = scheme.eligibleChannels as unknown as string[] | null;
  if (!channels || channels.length === 0) return true;
  return channels.includes(shopType);
}
