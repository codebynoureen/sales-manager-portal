/**
 * Run separately: `npm run worker:beat-generation`.
 * Consumes the daily repeatable "generate-daily" job registered by
 * workers/schedulers.ts (runs once shortly after midnight per tenant).
 *
 * For every active Pjp, finds today's weekday assignments and creates a
 * PLANNED BeatVisit per outlet — this is what the Booker App's "My Beat"
 * screen reads for the day (Section 4.3, item 12).
 */
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "../src/lib/prisma";
import { QUEUE_NAMES } from "../src/lib/queue";
import type { Weekday } from "@prisma/client";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const WEEKDAY_MAP: Weekday[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const worker = new Worker(
  QUEUE_NAMES.BEAT_GENERATION,
  async () => {
    const today = new Date();
    const todayWeekday = WEEKDAY_MAP[today.getDay()];
    const visitDate = new Date(today.toISOString().slice(0, 10)); // midnight UTC, date-only

    const assignments = await prisma.pjpAssignment.findMany({
      where: { day: todayWeekday, isDeleted: false, pjp: { active: true, isDeleted: false } },
      select: { tenantId: true, bookerUserId: true, outletId: true },
    });

    let created = 0;
    for (const a of assignments) {
      // Idempotent: skip if a BeatVisit already exists for this booker/outlet/date
      const existing = await prisma.beatVisit.findFirst({
        where: {
          tenantId: a.tenantId,
          bookerUserId: a.bookerUserId,
          outletId: a.outletId,
          visitDate,
        },
        select: { id: true },
      });
      if (existing) continue;

      await prisma.beatVisit.create({
        data: {
          tenantId: a.tenantId,
          bookerUserId: a.bookerUserId,
          outletId: a.outletId,
          visitDate,
          status: "PLANNED",
        },
      });
      created++;
    }

    console.log(`[beat-generation.worker] created ${created} beat visits for ${todayWeekday}`);
    return { created };
  },
  { connection, concurrency: 1 }
);

worker.on("failed", (job, err) => {
  console.error(`[beat-generation.worker] job ${job?.id} failed:`, err.message);
});

console.log("[beat-generation.worker] listening for jobs...");
