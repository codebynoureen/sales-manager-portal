import { cookies, headers } from "next/headers";
import type { ApiResponse, TerritoryDashboardData } from "@/types/sales";

async function serverFetch<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const cookieStore = await cookies();
    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}${path}`, {
      headers: { cookie: cookieStore.toString() },
      cache: "no-store",
    });

    if (!res.ok) return { data: null, error: `Request failed (${res.status})`, message: null };
    return res.json();
  } catch {
    // Backend route not built yet — caller falls back to mock data
    return { data: null, error: "unreachable", message: null };
  }
}

// Matches distributeos-sales-manager-panel-v1.html mockup numbers exactly.
// TODO(backend intern): remove once GET /api/dashboard (Section 4.1) is live.
const MOCK_TERRITORY_DASHBOARD: TerritoryDashboardData = {
  activeBookersToday: 8,
  bookersOnRoute: 6,
  bookersIdle: 2,
  shopsVisitedToday: 112,
  shopsPlannedToday: 168,
  ordersTodayPaisa: 18_40_000_00,
  exceptionAlertsCount: 2,
  lastSyncedAt: new Date().toISOString(),
  livePositions: [
    { bookerUserId: "b1", bookerName: "Usman Khan", area: "Model Town", lat: 31.4805, lng: 74.3255, isException: false, exceptionLabel: null },
    { bookerUserId: "b2", bookerName: "Naveed Ahmed", area: "DHA Phase 5", lat: 31.4697, lng: 74.4142, isException: false, exceptionLabel: null },
    { bookerUserId: "b3", bookerName: "Sara Malik", area: "Johar Town", lat: 31.4649, lng: 74.2827, isException: false, exceptionLabel: null },
    { bookerUserId: "b4", bookerName: "Bilal Hussain", area: "Wapda Town", lat: 31.4304, lng: 74.2734, isException: false, exceptionLabel: null },
    { bookerUserId: "b5", bookerName: "Tanveer Hussain", area: "Iqbal Town", lat: 31.5075, lng: 74.2789, isException: true, exceptionLabel: "No Orders" },
    { bookerUserId: "b6", bookerName: "Asif Mehmood", area: "Gulberg III", lat: 31.5169, lng: 74.3541, isException: true, exceptionLabel: "Idle 90 min" },
  ],
  bookerStats: [
    { bookerUserId: "b1", bookerName: "Usman Khan", area: "Model Town", stopsDone: 8, stopsPlanned: 14, ordersCount: 6, collectionsPaisa: 84_200_00, status: "ON_ROUTE" },
    { bookerUserId: "b2", bookerName: "Naveed Ahmed", area: "DHA Phase 5", stopsDone: 12, stopsPlanned: 18, ordersCount: 10, collectionsPaisa: 1_42_000_00, status: "ON_ROUTE" },
    { bookerUserId: "b3", bookerName: "Sara Malik", area: "Johar Town", stopsDone: 6, stopsPlanned: 16, ordersCount: 5, collectionsPaisa: 62_400_00, status: "ON_ROUTE" },
    { bookerUserId: "b5", bookerName: "Tanveer Hussain", area: "Iqbal Town", stopsDone: 3, stopsPlanned: 15, ordersCount: 0, collectionsPaisa: 0, status: "ZERO_ORDERS" },
    { bookerUserId: "b6", bookerName: "Asif Mehmood", area: "Gulberg III", stopsDone: 5, stopsPlanned: 14, ordersCount: 3, collectionsPaisa: 28_000_00, status: "IDLE" },
  ],
};

/** Full Territory Overview payload — GET /api/dashboard (Section 4.1) */
export async function getTerritoryDashboard(): Promise<TerritoryDashboardData> {
  const { data } = await serverFetch<TerritoryDashboardData>("/api/dashboard");
  return data ?? MOCK_TERRITORY_DASHBOARD;
}

/** Small derived summary for the PulseStrip, shared across every /sales/* screen */
export async function getPulseSummary() {
  const [dashboard, creditHolds, pendingOutlets, targets] = await Promise.all([
    getTerritoryDashboard(),
    import("./sales").then((m) => m.getCreditHolds()),
    import("./sales").then((m) => m.getPendingOutlets()),
    import("./sales").then((m) => m.getBookerTargets()),
  ]);

  const teamTarget = targets.reduce((s, t) => s + t.pkrTargetPaisa, 0);
  const teamAchieved = targets.reduce((s, t) => s + t.pkrAchievedPaisa, 0);
  const targetPct = teamTarget > 0 ? Math.round((teamAchieved / teamTarget) * 100) : 0;

  return {
    zeroOrderBookers: dashboard.bookerStats.filter((b) => b.status === "ZERO_ORDERS").length,
    shopsOnHold: creditHolds.length,
    outletsPending: pendingOutlets.length,
    targetPct,
    dayOfMonth: new Date().getDate(),
    lastSyncedLabel: "Just now",
  };
}
