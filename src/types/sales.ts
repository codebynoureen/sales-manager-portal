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

// ── Booker Targets (Section 4.2) ──────────────────────────
export interface BookerTarget {
  bookerUserId: string;
  bookerName: string;
  targetMonth: string;
  pkrTargetPaisa: number;
  pkrAchievedPaisa: number;
  newOutletTarget: number;
  newOutletActual: number;
  status: "EXCEEDING" | "ON_TRACK" | "WATCH" | "BEHIND";
}

// ── PJP Route Builder (Section 4.3) ───────────────────────
export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export interface PjpShopAssignment {
  shopId: string;
  shopName: string;
  day: Weekday;
}

export interface PjpAdherenceRow {
  bookerUserId: string;
  bookerName: string;
  plannedVisits: number;
  actualVisits: number;
  adherencePct: number;
  status: "EXCELLENT" | "GOOD" | "NEGLECTED";
}

// ── Credit Hold Management (Section 4.4) ──────────────────
export interface CreditHoldShop {
  shopId: string;
  shopName: string;
  bookerName: string;
  outstandingPaisa: number;
  holdReason: string;
  heldSinceDaysAgo: number;
}

// ── New Outlet Approval (Section 4.6) ─────────────────────
export interface PendingOutlet {
  outletId: string;
  shopName: string;
  bookerName: string;
  area: string;
  ownerName: string;
  mobile: string;
  address: string;
  shopType: string;
  gpsLat: number;
  gpsLng: number;
  estMonthlyPurchasePaisa: number;
  submittedAgo: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

// ── Scheme Management (Section 4.5) ───────────────────────
export type SchemeType =
  | "BUY_X_GET_Y"
  | "VOLUME_SLAB"
  | "FIXED_PRICE"
  | "COMBO"
  | "CASH_DISCOUNT"
  | "CHANNEL"
  | "NEW_OUTLET"
  | "HAPPY_HOUR";

export type FundingType = "SELF_FUNDED" | "PRINCIPAL_FUNDED" | "SPLIT";

export interface Scheme {
  schemeId: string;
  name: string;
  type: SchemeType;
  skuLabel: string;
  fundingType: FundingType;
  startDate: string;
  endDate: string;
  eligibleShops: number;
  uptakeShops: number;
  costSoFarPaisa: number;
  status: "ACTIVE" | "EXPIRED" | "DRAFT";
}

// ── Broadcast Messaging (Section 4.7) ─────────────────────
export interface BroadcastMessage {
  broadcastId: string;
  message: string;
  recipients: number;
  delivered: number;
  sentAgo: string;
}
