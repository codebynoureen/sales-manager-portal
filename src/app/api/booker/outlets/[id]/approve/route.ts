import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, requireField, withErrorHandling } from "@/lib/api-response";
import { enqueueWhatsApp } from "@/lib/queue";

interface ApproveBody {
  decision: "APPROVE" | "REJECT";
  creditLimitPaisa?: number; // required when decision === "APPROVE"
  assignedBeat?: string;
  rejectionReason?: string; // required when decision === "REJECT"
}

/**
 * PATCH /api/booker/outlets/:id/approve — approve/reject a pending outlet,
 * set credit limit + beat, notify the submitting booker via WhatsApp.
 */
export const PATCH = withErrorHandling(async (req, ctx) => {
const { id } = await (ctx as { params: Promise<{ id: string }> }).params;  const session = await requireRole("SALES_MGR", "ADMIN");
  const body = (await req.json()) as ApproveBody;

  const decision = requireField(body.decision, "decision");
  if (decision !== "APPROVE" && decision !== "REJECT") {
    throw new Error("decision must be APPROVE or REJECT");
  }

  const outlet = await prisma.outlet.findFirst({
    where: { id, tenantId: session.tenantId, approvalStatus: "PENDING", isDeleted: false } as never,
  });
  if (!outlet) throw new Error("Pending outlet not found in this tenant");

  let updated;
  let templateName: "OUTLET_APPROVED" | "OUTLET_REJECTED";
  let variables: Record<string, string>;

  if (decision === "APPROVE") {
    const creditLimitPaisa = requireField(body.creditLimitPaisa, "creditLimitPaisa");
    if (!Number.isInteger(creditLimitPaisa) || creditLimitPaisa < 0) {
      throw new Error("creditLimitPaisa must be a non-negative integer (paisa)"); // RULE 2
    }

    updated = await prisma.outlet.update({
      where: { id },
      data: {
        approvalStatus: "ACTIVE",
        creditLimitPaisa,
        assignedBeat: body.assignedBeat ?? outlet.assignedBeat,
        approvedByUserId: session.userId,
        approvedAt: new Date(),
      } as never,
    });
    templateName = "OUTLET_APPROVED";
    variables = { shopName: outlet.name, creditLimit: String(creditLimitPaisa / 100) };
  } else {
    const rejectionReason = requireField(body.rejectionReason, "rejectionReason");
    updated = await prisma.outlet.update({
      where: { id },
      data: { approvalStatus: "REJECTED", rejectionReason } as never,
    });
    templateName = "OUTLET_REJECTED";
    variables = { shopName: outlet.name, reason: rejectionReason };
  }

  if (outlet.submittedByUserId) {
    const booker = await prisma.user.findUnique({
      where: { id: outlet.submittedByUserId },
      select: { mobile: true },
    });
    if (booker?.mobile) {
      await enqueueWhatsApp({
        tenantId: session.tenantId,
        toUserId: outlet.submittedByUserId,
        toPhone: booker.mobile,
        templateName,
        variables,
      });
    }
  }

  return ok(
    updated,
    decision === "APPROVE" ? "Outlet approved — booker notified" : "Outlet registration rejected — booker notified"
  );
});
