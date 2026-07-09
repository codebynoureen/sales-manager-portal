import type {
  BookerTarget,
  PjpShopAssignment,
  PjpAdherenceRow,
  CreditHoldShop,
  PendingOutlet,
  Scheme,
  BroadcastMessage,
  Weekday,
} from "@/types/sales";

// ═══════════════════════════════════════════════════════════
// All functions below return mock data matching the mockup 1:1.
// TODO(backend intern): swap each for the real fetch once its
// route from the Student Build Guide (Section 4) is live.
// ═══════════════════════════════════════════════════════════

/** GET /api/sales/targets/achievement (Section 4.2) */
export async function getBookerTargets(): Promise<BookerTarget[]> {
  return [
    { bookerUserId: "b2", bookerName: "Naveed Ahmed", targetMonth: "June 2026", pkrTargetPaisa: 15_10_000_00, pkrAchievedPaisa: 14_20_000_00, newOutletTarget: 4, newOutletActual: 5, status: "EXCEEDING" },
    { bookerUserId: "b1", bookerName: "Usman Khan", targetMonth: "June 2026", pkrTargetPaisa: 15_00_000_00, pkrAchievedPaisa: 11_70_000_00, newOutletTarget: 4, newOutletActual: 3, status: "ON_TRACK" },
    { bookerUserId: "b3", bookerName: "Sara Malik", targetMonth: "June 2026", pkrTargetPaisa: 13_00_000_00, pkrAchievedPaisa: 8_30_000_00, newOutletTarget: 3, newOutletActual: 2, status: "WATCH" },
    { bookerUserId: "b4", bookerName: "Bilal Hussain", targetMonth: "June 2026", pkrTargetPaisa: 12_90_000_00, pkrAchievedPaisa: 7_50_000_00, newOutletTarget: 3, newOutletActual: 2, status: "WATCH" },
    { bookerUserId: "b6", bookerName: "Asif Mehmood", targetMonth: "June 2026", pkrTargetPaisa: 12_80_000_00, pkrAchievedPaisa: 5_90_000_00, newOutletTarget: 3, newOutletActual: 1, status: "BEHIND" },
    { bookerUserId: "b5", bookerName: "Tanveer Hussain", targetMonth: "June 2026", pkrTargetPaisa: 12_60_000_00, pkrAchievedPaisa: 4_40_000_00, newOutletTarget: 3, newOutletActual: 0, status: "BEHIND" },
  ];
}

/** POST /api/sales/pjp (Section 4.3) — weekly route per booker */
export async function getPjpAssignments(): Promise<PjpShopAssignment[]> {
  const rows: [Weekday, string, string][] = [
    ["Mon", "s1", "Al-Noor General Store"], ["Mon", "s2", "Hafeez Cold Store"], ["Mon", "s3", "Saleem Kirana"],
    ["Tue", "s4", "Rehman Brothers"], ["Tue", "s5", "Faisal Traders"],
    ["Wed", "s1", "Al-Noor General Store"], ["Wed", "s6", "City Mart Superstore"], ["Wed", "s7", "Khan Provision Store"],
    ["Thu", "s2", "Hafeez Cold Store"], ["Thu", "s8", "Madina Super Store"],
    ["Fri", "s3", "Saleem Kirana"], ["Fri", "s4", "Rehman Brothers"], ["Fri", "s5", "Faisal Traders"],
    ["Sat", "s6", "City Mart Superstore"],
  ];
  return rows.map(([day, shopId, shopName]) => ({ day, shopId, shopName }));
}

/** GET /api/sales/pjp/adherence (Section 4.3) */
export async function getPjpAdherence(): Promise<PjpAdherenceRow[]> {
  return [
    { bookerUserId: "b2", bookerName: "Naveed Ahmed", plannedVisits: 98, actualVisits: 94, adherencePct: 96, status: "EXCELLENT" },
    { bookerUserId: "b1", bookerName: "Usman Khan", plannedVisits: 84, actualVisits: 71, adherencePct: 85, status: "GOOD" },
    { bookerUserId: "b5", bookerName: "Tanveer Hussain", plannedVisits: 90, actualVisits: 52, adherencePct: 58, status: "NEGLECTED" },
  ];
}

/** GET /api/credit/shops?status=HOLD (Section 4.4) */
export async function getCreditHolds(): Promise<CreditHoldShop[]> {
  return [
    { shopId: "s3", shopName: "Saleem Kirana", bookerName: "Sara Malik", outstandingPaisa: 1_52_400_00, holdReason: "Over credit limit (102%)", heldSinceDaysAgo: 5 },
    { shopId: "s9", shopName: "Tariq Brothers", bookerName: "Usman Khan", outstandingPaisa: 3_80_000_00, holdReason: "78 days overdue invoice", heldSinceDaysAgo: 12 },
    { shopId: "s7", shopName: "Khan Provision Store", bookerName: "Usman Khan", outstandingPaisa: 2_15_000_00, holdReason: "38 days overdue invoice", heldSinceDaysAgo: 3 },
    { shopId: "s8", shopName: "Madina Super Store", bookerName: "Naveed Ahmed", outstandingPaisa: 1_68_500_00, holdReason: "35 days overdue invoice", heldSinceDaysAgo: 2 },
  ];
}

/** GET /api/booker/outlets?status=PENDING (Section 4.6) */
export async function getPendingOutlets(): Promise<PendingOutlet[]> {
  return [
    { outletId: "o1", shopName: "Madina Super Store", bookerName: "Naveed Ahmed", area: "Iqbal Town", ownerName: "Imran Sheikh", mobile: "0300-4471882", address: "Shop 8, Iqbal Town Market, Lahore", shopType: "General Store", gpsLat: 31.5497, gpsLng: 74.3436, estMonthlyPurchasePaisa: 1_80_000_00, submittedAgo: "2 hrs ago", status: "PENDING" },
    { outletId: "o2", shopName: "Star Cash & Carry", bookerName: "Usman Khan", area: "Model Town", ownerName: "Waseem Akhtar", mobile: "0321-5589012", address: "Block C, Model Town, Lahore", shopType: "Cash & Carry", gpsLat: 31.4805, gpsLng: 74.3255, estMonthlyPurchasePaisa: 2_40_000_00, submittedAgo: "5 hrs ago", status: "PENDING" },
    { outletId: "o3", shopName: "Green Valley Mart", bookerName: "Sara Malik", area: "Johar Town", ownerName: "Nadia Aslam", mobile: "0333-7723456", address: "Phase 2, Johar Town, Lahore", shopType: "General Store", gpsLat: 31.4649, gpsLng: 74.2827, estMonthlyPurchasePaisa: 95_000_00, submittedAgo: "Yesterday", status: "PENDING" },
  ];
}

/** POST /api/schemes (Section 4.5) */
export async function getSchemes(): Promise<Scheme[]> {
  return [
    { schemeId: "sc1", name: "Buy 30 Get 4 Free", type: "BUY_X_GET_Y", skuLabel: "Lays Classic 15g × 24", fundingType: "SELF_FUNDED", startDate: "2026-06-18", endDate: "2026-07-02", eligibleShops: 186, uptakeShops: 138, costSoFarPaisa: 1_84_000_00, status: "ACTIVE" },
    { schemeId: "sc2", name: "Volume Slab Discount", type: "VOLUME_SLAB", skuLabel: "Beverages — 0–99 ctn=0%, 100+=4%", fundingType: "PRINCIPAL_FUNDED", startDate: "2026-06-01", endDate: "2026-07-12", eligibleShops: 186, uptakeShops: 97, costSoFarPaisa: 96_400_00, status: "ACTIVE" },
    { schemeId: "sc3", name: "Happy Hour — 9–11 AM", type: "HAPPY_HOUR", skuLabel: "Near-expiry Kurkure Masala Munch — 10% off", fundingType: "SELF_FUNDED", startDate: "2026-07-01", endDate: "2026-07-10", eligibleShops: 39, uptakeShops: 12, costSoFarPaisa: 8_200_00, status: "ACTIVE" },
    { schemeId: "sc4", name: "Eid Combo Deal", type: "COMBO", skuLabel: "Eid Gift Combo", fundingType: "PRINCIPAL_FUNDED", startDate: "2026-05-20", endDate: "2026-06-15", eligibleShops: 186, uptakeShops: 164, costSoFarPaisa: 2_40_000_00, status: "EXPIRED" },
    { schemeId: "sc5", name: "New Outlet Launch Scheme", type: "NEW_OUTLET", skuLabel: "—", fundingType: "SELF_FUNDED", startDate: "2026-07-01", endDate: "2026-07-31", eligibleShops: 0, uptakeShops: 0, costSoFarPaisa: 0, status: "DRAFT" },
  ];
}

/** GET broadcast history (Section 4.7) */
export async function getBroadcasts(): Promise<BroadcastMessage[]> {
  return [
    { broadcastId: "bc1", message: "New scheme: Buy 30 Get 4 Free on Lays Classic — live now", recipients: 8, delivered: 8, sentAgo: "Today, 9:00 AM" },
    { broadcastId: "bc2", message: "Price update effective tomorrow — Pepsi range +3%", recipients: 8, delivered: 8, sentAgo: "Yesterday, 5:30 PM" },
    { broadcastId: "bc3", message: "Urgent: Stop deliveries to Saleem Kirana — credit hold placed", recipients: 2, delivered: 2, sentAgo: "5 days ago" },
    { broadcastId: "bc4", message: "Team meeting tomorrow 9 AM at warehouse — mandatory attendance", recipients: 8, delivered: 7, sentAgo: "6 days ago" },
  ];
}
