import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ⚠️ CHANGE THESE TWO before running:
const TENANT_ID = "tenant_demo"; // must match the tenantId in your Supabase app_metadata claim
const SALES_MANAGER_AUTH_UID = "PASTE-YOUR-SUPABASE-AUTH-UID-HERE"; // Supabase dashboard → Authentication → Users → copy the UID
const SALES_MANAGER_EMAIL = "manager@example.com"; // must match the account you log in with

async function main() {
  // ── Tenant ──────────────────────────────────────────────
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: { id: TENANT_ID, name: "Scale Up Brands Demo Tenant" },
  });

  // ── Sales Manager (id MUST equal the Supabase Auth UID) ──
  await prisma.user.upsert({
    where: { id: SALES_MANAGER_AUTH_UID },
    update: {},
    create: {
      id: SALES_MANAGER_AUTH_UID,
      tenantId: TENANT_ID,
      role: "SALES_MGR",
      email: SALES_MANAGER_EMAIL,
      name: "Farhan Yousuf",
      active: true,
    },
  });

  // ── Bookers ─────────────────────────────────────────────
  const bookerData = [
    { id: "booker_usman", name: "Usman Khan", beat: "Model Town" },
    { id: "booker_naveed", name: "Naveed Ahmed", beat: "DHA Phase 5" },
    { id: "booker_sara", name: "Sara Malik", beat: "Johar Town" },
    { id: "booker_bilal", name: "Bilal Hussain", beat: "Wapda Town" },
    { id: "booker_tanveer", name: "Tanveer Hussain", beat: "Iqbal Town" },
    { id: "booker_asif", name: "Asif Mehmood", beat: "Gulberg III" },
  ];

  for (const b of bookerData) {
    await prisma.user.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        tenantId: TENANT_ID,
        role: "BOOKER",
        email: `${b.id}@demo.local`,
        name: b.name,
        assignedBeat: b.beat,
        mobile: "+923004471882",
        active: true,
      },
    });
  }

  // ── Products ────────────────────────────────────────────
  const productData = [
    { id: "prod_lays", name: "Lays Classic 15g x 24", pricePaisa: 96000 },
    { id: "prod_pepsi", name: "Pepsi 250ml x 24", pricePaisa: 144000 },
    { id: "prod_cheetos", name: "Cheetos Crunchy 18g x 24", pricePaisa: 108000 },
  ];
  for (const p of productData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, tenantId: TENANT_ID, name: p.name, pricePaisa: p.pricePaisa },
    });
  }

  // ── Outlets (active) ────────────────────────────────────
  const outletData = [
    { id: "outlet_alnoor", name: "Al-Noor General Store", area: "Model Town", booker: "booker_usman" },
    { id: "outlet_hafeez", name: "Hafeez Cold Store", area: "Model Town", booker: "booker_usman" },
    { id: "outlet_saleem", name: "Saleem Kirana", area: "Johar Town", booker: "booker_sara" },
    { id: "outlet_rehman", name: "Rehman Brothers", area: "DHA Phase 5", booker: "booker_naveed" },
    { id: "outlet_faisal", name: "Faisal Traders", area: "DHA Phase 5", booker: "booker_naveed" },
    { id: "outlet_citymart", name: "City Mart Superstore", area: "Wapda Town", booker: "booker_bilal" },
  ];
  for (const o of outletData) {
    await prisma.outlet.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        tenantId: TENANT_ID,
        name: o.name,
        area: o.area,
        address: `${o.area}, Lahore`,
        shopType: "General Store",
        mobile: "+923214471882",
        creditLimitPaisa: 500000_00,
        approvalStatus: "ACTIVE",
        submittedByUserId: o.booker,
        gpsLat: 31.48 + Math.random() * 0.06,
        gpsLng: 74.28 + Math.random() * 0.1,
      },
    });
  }

  // ── One pending outlet (New Outlet Approval screen) ─────
  await prisma.outlet.upsert({
    where: { id: "outlet_pending_star" },
    update: {},
    create: {
      id: "outlet_pending_star",
      tenantId: TENANT_ID,
      name: "Star Cash & Carry",
      area: "Model Town",
      ownerName: "Waseem Akhtar",
      mobile: "+923215589012",
      address: "Block C, Model Town, Lahore",
      shopType: "Cash & Carry",
      estMonthlyPurchasePaisa: 240000_00,
      approvalStatus: "PENDING",
      submittedByUserId: "booker_usman",
      gpsLat: 31.4805,
      gpsLng: 74.3255,
      creditLimitPaisa: 0,
    },
  });

  // ── Credit hold on one outlet ────────────────────────────
  await prisma.creditHold.upsert({
    where: { id: "hold_saleem_1" },
    update: {},
    create: {
      id: "hold_saleem_1",
      tenantId: TENANT_ID,
      outletId: "outlet_saleem",
      reason: "Over credit limit (102%)",
      active: true,
      placedByUserId: SALES_MANAGER_AUTH_UID,
    },
  });

  // ── Targets (current month) ──────────────────────────────
  const now = new Date();
  const targetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const targetData = [
    { booker: "booker_usman", target: 1500000_00 },
    { booker: "booker_naveed", target: 1510000_00 },
    { booker: "booker_sara", target: 1300000_00 },
    { booker: "booker_bilal", target: 1290000_00 },
    { booker: "booker_tanveer", target: 1260000_00 },
    { booker: "booker_asif", target: 1280000_00 },
  ];
  for (const t of targetData) {
    await prisma.target.upsert({
      where: { bookerUserId_targetMonth: { bookerUserId: t.booker, targetMonth } },
      update: {},
      create: {
        tenantId: TENANT_ID,
        bookerUserId: t.booker,
        targetMonth,
        pkrTargetPaisa: t.target,
        newOutletTarget: 4,
      },
    });
  }

  // ── A confirmed order today, attributed to a booker (for achievement %) ──
  const order = await prisma.order.upsert({
    where: { id: "order_demo_1" },
    update: {},
    create: {
      id: "order_demo_1",
      tenantId: TENANT_ID,
      outletId: "outlet_alnoor",
      bookerUserId: "booker_usman",
      status: "CONFIRMED",
      totalPaisa: 84200_00,
    },
  });
  await prisma.orderItem.upsert({
    where: { id: "orderitem_demo_1" },
    update: {},
    create: {
      id: "orderitem_demo_1",
      orderId: order.id,
      productId: "prod_lays",
      name: "Lays Classic 15g x 24",
      quantity: 40,
      pricePaisa: 96000,
    },
  });

  // ── Today's beat visits (Territory dashboard) ────────────
  const today = new Date(now.toISOString().slice(0, 10));
  const visits = [
    { booker: "booker_usman", outlet: "outlet_alnoor", status: "COMPLETED" as const },
    { booker: "booker_usman", outlet: "outlet_hafeez", status: "CHECKED_IN" as const },
    { booker: "booker_naveed", outlet: "outlet_rehman", status: "COMPLETED" as const },
    { booker: "booker_naveed", outlet: "outlet_faisal", status: "COMPLETED" as const },
    { booker: "booker_tanveer", outlet: "outlet_alnoor", status: "PLANNED" as const }, // no-show example
  ];
  for (const v of visits) {
    await prisma.beatVisit.upsert({
      where: { id: `visit_${v.booker}_${v.outlet}` },
      update: {},
      create: {
        id: `visit_${v.booker}_${v.outlet}`,
        tenantId: TENANT_ID,
        bookerUserId: v.booker,
        outletId: v.outlet,
        visitDate: today,
        status: v.status,
        checkinAt: v.status !== "PLANNED" ? new Date() : null,
      },
    });
  }

  // ── PJP weekly route for one booker ──────────────────────
  const pjp = await prisma.pjp.upsert({
    where: { id: "pjp_usman" },
    update: {},
    create: { id: "pjp_usman", tenantId: TENANT_ID, bookerUserId: "booker_usman", active: true },
  });
  const pjpAssignments: { day: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT"; outlet: string }[] = [
    { day: "MON", outlet: "outlet_alnoor" },
    { day: "MON", outlet: "outlet_hafeez" },
    { day: "WED", outlet: "outlet_alnoor" },
    { day: "FRI", outlet: "outlet_hafeez" },
  ];
  for (const a of pjpAssignments) {
    await prisma.pjpAssignment.upsert({
      where: { id: `pjpassign_${pjp.id}_${a.day}_${a.outlet}` },
      update: {},
      create: {
        id: `pjpassign_${pjp.id}_${a.day}_${a.outlet}`,
        tenantId: TENANT_ID,
        pjpId: pjp.id,
        bookerUserId: "booker_usman",
        outletId: a.outlet,
        day: a.day,
        frequency: "WEEKLY",
      },
    });
  }

  // ── Scheme (Scheme Management screen) ────────────────────
  const scheme = await prisma.scheme.upsert({
    where: { id: "scheme_lays_bogo" },
    update: {},
    create: {
      id: "scheme_lays_bogo",
      tenantId: TENANT_ID,
      name: "Buy 30 Get 4 Free — Lays Classic",
      type: "BUY_X_GET_Y",
      fundingType: "SELF_FUNDED",
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 2),
      active: true,
      skuConditions: [{ productId: "prod_lays", minQty: 30 }],
      rewardSkuId: "prod_lays",
      rewardQty: 4,
    },
  });
  await prisma.schemeSku.upsert({
    where: { id: "schemesku_lays_bogo" },
    update: {},
    create: { id: "schemesku_lays_bogo", schemeId: scheme.id, productId: "prod_lays" },
  });

  // ── A sample broadcast ────────────────────────────────────
  const broadcast = await prisma.broadcast.upsert({
    where: { id: "broadcast_demo_1" },
    update: {},
    create: {
      id: "broadcast_demo_1",
      tenantId: TENANT_ID,
      message: "New scheme: Buy 30 Get 4 Free on Lays Classic — live now",
      sentByUserId: SALES_MANAGER_AUTH_UID,
      targetLabel: "All Bookers in Zone (6)",
    },
  });
  for (const b of bookerData) {
    await prisma.broadcastReceipt.upsert({
      where: { id: `receipt_${broadcast.id}_${b.id}` },
      update: {},
      create: { id: `receipt_${broadcast.id}_${b.id}`, broadcastId: broadcast.id, bookerUserId: b.id, status: "SENT" },
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });