import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// CHANGE if your tenant id is different
const TENANT_ID = "tenant_demo";

async function main() {
  const today = new Date(new Date().toISOString().slice(0, 10)); // today, UTC midnight

  // 1. Bump every BeatVisit's visitDate to today (keeps status/GPS/timings as-is)
  const visits = await prisma.beatVisit.updateMany({
    where: { tenantId: TENANT_ID },
    data: { visitDate: today },
  });

  // 2. Bump every Order's createdAt to right now, so "Orders Today" and
  //    target-achievement calculations pick them up too.
  const orders = await prisma.order.updateMany({
    where: { tenantId: TENANT_ID },
    data: { createdAt: new Date() },
  });

  console.log(`Refreshed ${visits.count} BeatVisit rows and ${orders.count} Order rows to today (${today.toISOString().slice(0, 10)}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());