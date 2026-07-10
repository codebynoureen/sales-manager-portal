/**
 * Run separately: `npm run worker:scheme-expiry`.
 * Daily job (Section 4.5, item 22) — never rely on the frontend to hide
 * expired schemes; flip `active: false` server-side once endDate passes.
 */
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "../src/lib/prisma";
import { QUEUE_NAMES } from "../src/lib/queue";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  QUEUE_NAMES.SCHEME_EXPIRY,
  async () => {
    const result = await prisma.scheme.updateMany({
      where: { active: true, isDeleted: false, endDate: { lt: new Date() } },
      data: { active: false },
    });
    console.log(`[scheme-expiry.worker] deactivated ${result.count} expired schemes`);
    return { deactivated: result.count };
  },
  { connection, concurrency: 1 }
);

worker.on("failed", (job, err) => {
  console.error(`[scheme-expiry.worker] job ${job?.id} failed:`, err.message);
});

console.log("[scheme-expiry.worker] listening for jobs...");
