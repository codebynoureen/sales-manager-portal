import { requireRole } from "../auth";
import { prisma } from "../prisma";
import { serverFetch } from "./server-fetch";
import type {
  BookerTarget,
  PjpShopAssignment,
  PjpAdherenceRow,
  CreditHoldShop,
  PendingOutlet,
  Scheme,
  BroadcastMessage,
} from "@/types/sales";

// ═══════════════════════════════════════════════════════════
// Every function below calls the real API route first; mock data
// (matching the mockup 1:1) is only used as a fallback if the route
// is unreachable/erroring — e.g. during early setup before .env is
// configured. Once the DB has real rows, real data always wins.
// ═══════════════════════════════════════════════════════════

interface BookerOption {
  id: string;
  name: string;
  area: string | null;
}

/** GET /api/sales/bookers — real booker list. */
export async function getBookers(): Promise<BookerOption[]> {
  const { data } = await serverFetch<BookerOption[]>("/api/sales/bookers");
  return data ?? [];
}

/** GET /api/sales/targets/achievement (Section 4.2) */
export async function getBookerTargets(): Promise<BookerTarget[]> {
  const { data } = await serverFetch<BookerTarget[]>("/api/sales/targets/achievement");
  return data ?? [];
}
/** GET /api/credit/shops?status=HOLD (Section 4.4) */
export async function getCreditHolds(): Promise<CreditHoldShop[]> {
  const { data } = await serverFetch<CreditHoldShop[]>("/api/credit/shops?status=HOLD");
  return data ?? [];
}

/** GET /api/credit/shops/stats — released-this-week count */
export async function getCreditHoldStats(): Promise<{ releasedThisWeek: number }> {
  const { data } = await serverFetch<{ releasedThisWeek: number }>("/api/credit/shops/stats");
  return data ?? { releasedThisWeek: 0 };
}
const MOCK_PJP: PjpShopAssignment[] = [
  { day: "Mon", shopId: "s1", shopName: "Al-Noor General Store" }, { day: "Mon", shopId: "s2", shopName: "Hafeez Cold Store" }, { day: "Mon", shopId: "s3", shopName: "Saleem Kirana" },
  { day: "Tue", shopId: "s4", shopName: "Rehman Brothers" }, { day: "Tue", shopId: "s5", shopName: "Faisal Traders" },
  { day: "Wed", shopId: "s1", shopName: "Al-Noor General Store" }, { day: "Wed", shopId: "s6", shopName: "City Mart Superstore" }, { day: "Wed", shopId: "s7", shopName: "Khan Provision Store" },
  { day: "Thu", shopId: "s2", shopName: "Hafeez Cold Store" }, { day: "Thu", shopId: "s8", shopName: "Madina Super Store" },
  { day: "Fri", shopId: "s3", shopName: "Saleem Kirana" }, { day: "Fri", shopId: "s4", shopName: "Rehman Brothers" }, { day: "Fri", shopId: "s5", shopName: "Faisal Traders" },
  { day: "Sat", shopId: "s6", shopName: "City Mart Superstore" },
];

/** GET /api/sales/pjp (Section 4.3) — weekly route for a booker */
export async function getPjpAssignments(): Promise<PjpShopAssignment[]> {
  const { data } = await serverFetch<PjpShopAssignment[]>("/api/sales/pjp");
  return data ?? MOCK_PJP;
}

const MOCK_ADHERENCE: PjpAdherenceRow[] = [
  { bookerUserId: "b2", bookerName: "Naveed Ahmed", plannedVisits: 98, actualVisits: 94, adherencePct: 96, status: "EXCELLENT" },
  { bookerUserId: "b1", bookerName: "Usman Khan", plannedVisits: 84, actualVisits: 71, adherencePct: 85, status: "GOOD" },
  { bookerUserId: "b5", bookerName: "Tanveer Hussain", plannedVisits: 90, actualVisits: 52, adherencePct: 58, status: "NEGLECTED" },
];

/** GET /api/sales/pjp/adherence (Section 4.3) */
export async function getPjpAdherence(): Promise<PjpAdherenceRow[]> {
  const { data } = await serverFetch<PjpAdherenceRow[]>("/api/sales/pjp/adherence");
  return data ?? MOCK_ADHERENCE;
}

const MOCK_CREDIT_HOLDS: CreditHoldShop[] = [
  { shopId: "s3", shopName: "Saleem Kirana", bookerName: "Sara Malik", outstandingPaisa: 1_52_400_00, holdReason: "Over credit limit (102%)", heldSinceDaysAgo: 5 },
  { shopId: "s9", shopName: "Tariq Brothers", bookerName: "Usman Khan", outstandingPaisa: 3_80_000_00, holdReason: "78 days overdue invoice", heldSinceDaysAgo: 12 },
  { shopId: "s7", shopName: "Khan Provision Store", bookerName: "Usman Khan", outstandingPaisa: 2_15_000_00, holdReason: "38 days overdue invoice", heldSinceDaysAgo: 3 },
  { shopId: "s8", shopName: "Madina Super Store", bookerName: "Naveed Ahmed", outstandingPaisa: 1_68_500_00, holdReason: "35 days overdue invoice", heldSinceDaysAgo: 2 },
];

export async function getOutletApprovalStats() {
  const session = await requireRole("SALES_MGR", "ADMIN");

  const [pending, approved, rejected] = await Promise.all([
    prisma.outlet.count({
      where: {
        tenantId: session.tenantId,
        approvalStatus: "PENDING",
        isDeleted: false,
      },
    }),

    prisma.outlet.count({
      where: {
        tenantId: session.tenantId,
        approvalStatus: "ACTIVE",
        isDeleted: false,
        approvedAt: {
          gte: new Date(new Date().setDate(1)), // current month
        },
      },
    }),

    prisma.outlet.count({
      where: {
        tenantId: session.tenantId,
        approvalStatus: "REJECTED",
        isDeleted: false,
      },
    }),
  ]);

  return {
    pending,
    approved,
    rejected,
  };
}
const MOCK_PENDING_OUTLETS: PendingOutlet[] = [
  { outletId: "o1", shopName: "Madina Super Store", bookerName: "Naveed Ahmed", area: "Iqbal Town", ownerName: "Imran Sheikh", mobile: "0300-4471882", address: "Shop 8, Iqbal Town Market, Lahore", shopType: "General Store", gpsLat: 31.5497, gpsLng: 74.3436, estMonthlyPurchasePaisa: 1_80_000_00, submittedAgo: "2 hrs ago", status: "PENDING" },
  { outletId: "o2", shopName: "Star Cash & Carry", bookerName: "Usman Khan", area: "Model Town", ownerName: "Waseem Akhtar", mobile: "0321-5589012", address: "Block C, Model Town, Lahore", shopType: "Cash & Carry", gpsLat: 31.4805, gpsLng: 74.3255, estMonthlyPurchasePaisa: 2_40_000_00, submittedAgo: "5 hrs ago", status: "PENDING" },
  { outletId: "o3", shopName: "Green Valley Mart", bookerName: "Sara Malik", area: "Johar Town", ownerName: "Nadia Aslam", mobile: "0333-7723456", address: "Phase 2, Johar Town, Lahore", shopType: "General Store", gpsLat: 31.4649, gpsLng: 74.2827, estMonthlyPurchasePaisa: 95_000_00, submittedAgo: "Yesterday", status: "PENDING" },
];

/** GET /api/booker/outlets?status=PENDING (Section 4.6) */
export async function getPendingOutlets(): Promise<PendingOutlet[]> {
  const { data } = await serverFetch<PendingOutlet[]>("/api/booker/outlets?status=PENDING");
  return data ?? MOCK_PENDING_OUTLETS;
}

const MOCK_SCHEMES: Scheme[] = [
  { schemeId: "sc1", name: "Buy 30 Get 4 Free", type: "BUY_X_GET_Y", skuLabel: "Lays Classic 15g × 24", fundingType: "SELF_FUNDED", startDate: "2026-06-18", endDate: "2026-07-02", eligibleShops: 186, uptakeShops: 138, costSoFarPaisa: 1_84_000_00, status: "ACTIVE" },
  { schemeId: "sc2", name: "Volume Slab Discount", type: "VOLUME_SLAB", skuLabel: "Beverages — 0–99 ctn=0%, 100+=4%", fundingType: "PRINCIPAL_FUNDED", startDate: "2026-06-01", endDate: "2026-07-12", eligibleShops: 186, uptakeShops: 97, costSoFarPaisa: 96_400_00, status: "ACTIVE" },
  { schemeId: "sc3", name: "Happy Hour — 9–11 AM", type: "HAPPY_HOUR", skuLabel: "Near-expiry Kurkure Masala Munch — 10% off", fundingType: "SELF_FUNDED", startDate: "2026-07-01", endDate: "2026-07-10", eligibleShops: 39, uptakeShops: 12, costSoFarPaisa: 8_200_00, status: "ACTIVE" },
  { schemeId: "sc4", name: "Eid Combo Deal", type: "COMBO", skuLabel: "Eid Gift Combo", fundingType: "PRINCIPAL_FUNDED", startDate: "2026-05-20", endDate: "2026-06-15", eligibleShops: 186, uptakeShops: 164, costSoFarPaisa: 2_40_000_00, status: "EXPIRED" },
  { schemeId: "sc5", name: "New Outlet Launch Scheme", type: "NEW_OUTLET", skuLabel: "—", fundingType: "SELF_FUNDED", startDate: "2026-07-01", endDate: "2026-07-31", eligibleShops: 0, uptakeShops: 0, costSoFarPaisa: 0, status: "DRAFT" },
];

/** GET /api/schemes (Section 4.5) */
export async function getSchemes(): Promise<Scheme[]> {
  const { data } = await serverFetch<Scheme[]>("/api/schemes");
  return data ?? MOCK_SCHEMES;
}

/** GET /api/sales/broadcast (Section 4.7) */
export async function getBroadcasts(): Promise<BroadcastMessage[]> {
  const { data } = await serverFetch<BroadcastMessage[]>("/api/sales/broadcast");
  return data ?? [];
}