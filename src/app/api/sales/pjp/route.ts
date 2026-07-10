import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, requireField, withErrorHandling } from "@/lib/api-response";
import type { Weekday } from "@/types/sales";

const WEEKDAY_TO_DB: Record<Weekday, "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT"> = {
  Mon: "MON",
  Tue: "TUE",
  Wed: "WED",
  Thu: "THU",
  Fri: "FRI",
  Sat: "SAT",
};

interface PjpAssignmentInput {
  shopId: string;
  day: Weekday;
  frequency?: "WEEKLY" | "TWICE_WEEKLY" | "BI_WEEKLY";
}

interface SetPjpBody {
  bookerUserId: string;
  assignments: PjpAssignmentInput[];
}

/** POST /api/sales/pjp — create/update a booker's weekly route (PJP). */
export const POST = withErrorHandling(async (req) => {
  const session = await requireRole("SALES_MGR", "ADMIN");
  const body = (await req.json()) as SetPjpBody;

  const bookerUserId = requireField(body.bookerUserId, "bookerUserId");
  const assignments = requireField(body.assignments, "assignments");
  if (!Array.isArray(assignments) || assignments.length === 0) {
    throw new Error("assignments must be a non-empty array");
  }

  const booker = await prisma.user.findFirst({
    where: { id: bookerUserId, tenantId: session.tenantId, role: "BOOKER" } as never,
    select: { id: true },
  });
  if (!booker) throw new Error("Booker not found in this tenant");

  const shopIds = [...new Set(assignments.map((a) => a.shopId))];
  const validShops = await prisma.outlet.findMany({
    where: { id: { in: shopIds }, tenantId: session.tenantId, isDeleted: false },
    select: { id: true },
  });
  if (validShops.length !== shopIds.length) {
    throw new Error("One or more shopId values do not belong to this tenant");
  }

  const pjp = await prisma.$transaction(async (tx) => {
    const existing = await tx.pjp.findFirst({
      where: { tenantId: session.tenantId, bookerUserId, isDeleted: false },
    });

    const pjpRecord =
      existing ??
      (await tx.pjp.create({ data: { tenantId: session.tenantId, bookerUserId, active: true } }));

    // Replace this booker's route wholesale — soft-delete old assignments,
    // insert the new set. Keeps history via isDeleted rather than a hard delete.
    await tx.pjpAssignment.updateMany({
      where: { pjpId: pjpRecord.id, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await tx.pjpAssignment.createMany({
      data: assignments.map((a) => ({
        tenantId: session.tenantId,
        pjpId: pjpRecord.id,
        bookerUserId,
        outletId: a.shopId,
        day: WEEKDAY_TO_DB[a.day],
        frequency: a.frequency ?? "WEEKLY",
      })),
    });

    return pjpRecord;
  });

  return ok(pjp, "Route saved successfully");
});
