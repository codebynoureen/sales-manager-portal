import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const QUEUE_NAMES = {
  WHATSAPP: "whatsapp-send",
  BEAT_GENERATION: "beat-generation",
  SCHEME_EXPIRY: "scheme-expiry",
  BROADCAST_FANOUT: "broadcast-fanout",
} as const;

// Singleton pattern, same reasoning as prisma.ts — avoid re-creating
// queue instances (and Redis connections) on every hot reload/request.
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

/** Enqueue a WhatsApp send — never call Twilio directly from a route (Golden Rule 4). */
export async function enqueueWhatsApp(data: WhatsAppJobData) {
  await whatsappQueue.add("send", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}

export interface BroadcastFanoutJobData {
  tenantId: string;
  broadcastId: string;
  bookerUserIds: string[];
  message: string;
}

export async function enqueueBroadcastFanout(data: BroadcastFanoutJobData) {
  await broadcastFanoutQueue.add("fanout", data, { attempts: 3 });
}
