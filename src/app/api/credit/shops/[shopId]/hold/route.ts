import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, requireField, withErrorHandling } from "@/lib/api-response";
import { enqueueWhatsApp } from "@/lib/queue";

interface HoldBody {
  action: "PLACE" | "RELEASE";
  reason?: string; // required when action === "PLACE"
}

/**
 * POST /api/credit/shops/:shopId/hold — place or lift a credit hold.
 * NOTE: this record is shared with the Finance panel — field names on
 * CreditHold (outletId, reason, active, placedByUserId, releasedAt) must
 * not be renamed without coordinating with that team (Section 4.4, item 16).
 */
export const POST = withErrorHandling(async (req, ctx) => {
  const { shopId } = (ctx as { params: { shopId: string } }).params;
  const session = await requireRole("SALES_MGR", "ADMIN");
  const body = (await req.json()) as HoldBody;

  const action = requireField(body.action, "action");
  if (action !== "PLACE" && action !== "RELEASE") {
    throw new Error("action must be PLACE or RELEASE");
  }

  const outlet = await prisma.outlet.findFirst({
    where: { id: shopId, tenantId: session.tenantId, isDeleted: false },
    select: {
      id: true,
      name: true,
      mobile: true,
      submittedByUserId: true,
    },
  });
  if (!outlet) throw new Error("Shop not found in this tenant");

  let hold;

  if (action === "PLACE") {
    const reason = requireField(body.reason, "reason");
    hold = await prisma.creditHold.create({
      data: {
        tenantId: session.tenantId,
        outletId: shopId,
        reason,
        active: true,
        placedByUserId: session.userId,
      },
    });
  } else {
    const existing = await prisma.creditHold.findFirst({
      where: { tenantId: session.tenantId, outletId: shopId, active: true, isDeleted: false },
    });
    if (!existing) throw new Error("No active hold found for this shop");

    hold = await prisma.creditHold.update({
      where: { id: existing.id },
      data: { active: false, releasedAt: new Date() },
    });
  }

  // Notify shop + assigned booker via WhatsApp — always via BullMQ,
  // never awaited directly in the route (Golden Rule 4).
  const bookerUserId = outlet.submittedByUserId ?? undefined;
  const booker = bookerUserId
    ? await prisma.user.findUnique({ where: { id: bookerUserId }, select: { mobile: true } })
    : null;

  const templateName = action === "PLACE" ? "CREDIT_HOLD_PLACED" : "CREDIT_HOLD_RELEASED";
  const variables = { shopName: outlet.name, reason: body.reason ?? "" };

  if (outlet.mobile) {
    await enqueueWhatsApp({
      tenantId: session.tenantId,
      toPhone: outlet.mobile,
      templateName,
      variables,
    });
  }
  if (booker?.mobile) {
    await enqueueWhatsApp({
      tenantId: session.tenantId,
      toUserId: bookerUserId,
      toPhone: booker.mobile,
      templateName,
      variables,
    });
  }

  return ok(
    hold,
    action === "PLACE" ? "Credit hold placed — WhatsApp sent to shop and booker" : "Credit hold released"
  );
});
