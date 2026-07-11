import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  // maxRetriesPerRequest: null is BullMQ's recommendation for WORKERS (which
  // must stay connected forever). For the producer side (API routes), it
  // means a broken/misconfigured Redis retries forever and hangs the
  // request — so here we fail fast instead.
  maxRetriesPerRequest: 1,
  retryStrategy: () => null, // don't keep retrying the initial connection
  enableOfflineQueue: false, // don't queue commands while disconnected — fail immediately
  connectTimeout: 3000,
  lazyConnect: true, // don't even try connecting until the first command is issued
});

// Redis connection errors are expected during setup (before REDIS_URL is
// configured correctly) — log once, don't crash the process or spam stdout.
let loggedConnectionError = false;
connection.on("error", (err) => {
  if (!loggedConnectionError) {
    console.warn("[redis] connection issue — WhatsApp/queue features are disabled until this is fixed:", err.message);
    loggedConnectionError = true;
  }
});

export const QUEUE_NAMES = {
  WHATSAPP: "whatsapp-send",
  BEAT_GENERATION: "beat-generation",
  SCHEME_EXPIRY: "scheme-expiry",
  BROADCAST_FANOUT: "broadcast-fanout",
} as const;

const globalForQueues = globalThis as unknown as {
  whatsappQueue?: Queue;
  beatGenerationQueue?: Queue;
  schemeExpiryQueue?: Queue;
  broadcastFanoutQueue?: Queue;
};

export const whatsappQueue =
  globalForQueues.whatsappQueue ?? new Queue(QUEUE_NAMES.WHATSAPP, { connection });

export const beatGenerationQueue =
  globalForQueues.beatGenerationQueue ?? new Queue(QUEUE_NAMES.BEAT_GENERATION, { connection });

export const schemeExpiryQueue =
  globalForQueues.schemeExpiryQueue ?? new Queue(QUEUE_NAMES.SCHEME_EXPIRY, { connection });

export const broadcastFanoutQueue =
  globalForQueues.broadcastFanoutQueue ?? new Queue(QUEUE_NAMES.BROADCAST_FANOUT, { connection });

if (process.env.NODE_ENV !== "production") {
  globalForQueues.whatsappQueue = whatsappQueue;
  globalForQueues.beatGenerationQueue = beatGenerationQueue;
  globalForQueues.schemeExpiryQueue = schemeExpiryQueue;
  globalForQueues.broadcastFanoutQueue = broadcastFanoutQueue;
}

export interface WhatsAppJobData {
  tenantId: string;
  toUserId?: string;
  toPhone: string;
  templateName: string;
  variables: Record<string, string>;
}

/**
 * Enqueue a WhatsApp send — never call Twilio directly from a route (Golden Rule 4).
 * Swallows Redis/queue errors so a broken WhatsApp pipeline never blocks or
 * fails the actual business action (placing a hold, approving an outlet, etc).
 */
export async function enqueueWhatsApp(data: WhatsAppJobData) {
  try {
    await whatsappQueue.add("send", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });
  } catch (err) {
    console.warn("[queue] failed to enqueue WhatsApp message (Redis likely unavailable):", err instanceof Error ? err.message : err);
  }
}

export interface BroadcastFanoutJobData {
  tenantId: string;
  broadcastId: string;
  bookerUserIds: string[];
  message: string;
}

export async function enqueueBroadcastFanout(data: BroadcastFanoutJobData) {
  try {
    await broadcastFanoutQueue.add("fanout", data, { attempts: 3 });
  } catch (err) {
    console.warn("[queue] failed to enqueue broadcast fanout (Redis likely unavailable):", err instanceof Error ? err.message : err);
  }
}