/**
 * Run separately from the Next.js server: `npm run worker:whatsapp`
 * (see package.json). Never import Next.js server code here.
 */
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "../src/lib/prisma";
import { sendWhatsAppMessage } from "../src/lib/whatsapp/twilio";
import { QUEUE_NAMES, type WhatsAppJobData } from "../src/lib/queue";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker<WhatsAppJobData>(
  QUEUE_NAMES.WHATSAPP,
  async (job) => {
    const { tenantId, toUserId, toPhone, templateName, variables } = job.data;

    const log = await prisma.whatsAppLog.create({
      data: {
        tenantId,
        toUserId,
        toPhone,
        templateName,
        variables,
        status: "QUEUED",
      },
    });

    const result = await sendWhatsAppMessage({
      toPhone,
      templateName: templateName as never,
      variables,
    });

    await prisma.whatsAppLog.update({
      where: { id: log.id },
      data: result.ok
        ? { status: "SENT", messageSid: result.messageSid }
        : { status: "FAILED", errorMessage: result.errorMessage },
    });

    if (!result.ok) {
      // Throwing lets BullMQ apply the exponential backoff retry (max 3, set on enqueue).
      throw new Error(result.errorMessage ?? "WhatsApp send failed");
    }

    return result;
  },
  { connection, concurrency: 5 }
);

worker.on("failed", (job, err) => {
  console.error(`[whatsapp.worker] job ${job?.id} failed after retries:`, err.message);
});

console.log("[whatsapp.worker] listening for jobs...");
