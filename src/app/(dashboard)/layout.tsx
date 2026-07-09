import { cookies, headers } from "next/headers";
import type { ApiResponse, TerritoryDashboardData } from "@/types/sales";

async function serverFetch<T>(path: string): Promise<ApiResponse<T>> {
  const cookieStore = await cookies();
  const host = (await headers()).get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}${path}`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!res.ok) {
    return { data: null, error: `Request failed (${res.status})`, message: null };
  }
  return res.json();
}

/** Full Territory Overview payload — GET /api/dashboard */
export async function getTerritoryDashboard(): Promise<TerritoryDashboardData | null> {
  const { data } = await serverFetch<TerritoryDashboardData>("/api/dashboard");
  return data;
}

/** Small derived summary for the PulseStrip, shared across every /sales/* screen */
export async function getPulseSummary() {
  const dashboard = await getTerritoryDashboard();

  return {
    zeroOrderBookers: dashboard?.bookerStats.filter((b) => b.status === "ZERO_ORDERS").length ?? 0,
    shopsOnHold: 14, // TODO: replace with GET /api/credit/shops?status=HOLD count once Credit Hold screen ships
    outletsPending: 5, // TODO: replace with GET /api/booker/outlets?status=PENDING count once Outlet Approval screen ships
    targetPct: 68, // TODO: replace with GET /api/sales/targets/achievement team rollup
    dayOfMonth: 30,
    lastSyncedLabel: dashboard ? "1 min ago" : "—",
  };
}