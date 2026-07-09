export type BeatVisitStatus = "PLANNED" | "CHECKED_IN" | "COMPLETED" | "SKIPPED";

export interface BookerLivePosition {
  bookerUserId: string;
  bookerName: string;
  area: string;
  lat: number;
  lng: number;
  isException: boolean;
  exceptionLabel: string | null;
}

export interface BookerDailyStats {
  bookerUserId: string;
  bookerName: string;
  area: string;
  stopsDone: number;
  stopsPlanned: number;
  ordersCount: number;
  collectionsPaisa: number;
  status: "ON_ROUTE" | "ZERO_ORDERS" | "IDLE";
}

export interface TerritoryDashboardData {
  activeBookersToday: number;
  bookersOnRoute: number;
  bookersIdle: number;
  shopsVisitedToday: number;
  shopsPlannedToday: number;
  ordersTodayPaisa: number;
  exceptionAlertsCount: number;
  lastSyncedAt: string;
  livePositions: BookerLivePosition[];
  bookerStats: BookerDailyStats[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string | null;
}