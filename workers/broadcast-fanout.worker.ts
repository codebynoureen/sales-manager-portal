/**
 * Run separately: `npm run worker:broadcast-fanout`.
 * Sends the WhatsApp leg of a broadcast per booker and updates
 * BroadcastReceipt so the UI's delivery-receipt list stays accurate
 * (Section 4.7, items 26-27). Push/in-app notification fanout can be
 * added here too once that provider is wired up.
 */
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "../src/lib/prisma";
import { QUEUE_NAMES, type BroadcastFanoutJobData } from "../src/lib/queue";
import { sendWhatsAppMessage } from "../src/lib/whatsapp/twilio";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker<BroadcastFanoutJobData>(
  QUEUE_NAMES.BROADCAST_FANOUT,
  async (job) => {
    const { tenantId, broadcastId, bookerUserIds, message } = job.data;

    for (const bookerUserId of bookerUserIds) {
      const booker = await prisma.user.findUnique({
        where: { id: bookerUserId },
        select: { mobile: true, name: true },
      });
      if (!booker?.mobile) continue;

      const receipt = await prisma.broadcastReceipt.findFirst({
        where: { broadcastId, bookerUserId },
      });
      if (!receipt) continue;

      const toPhone = booker.mobile;

      const result = await sendWhatsAppMessage({
        toPhone,
        templateName: "MANAGER_BROADCAST",
        variables: { message },
      });

      await prisma.$transaction([
        prisma.broadcastReceipt.update({
          where: { id: receipt.id },
          data: { status: result.ok ? "SENT" : "FAILED" },
        }),
        prisma.whatsAppLog.create({
          data: {
            tenantId,
            toUserId: bookerUserId,
            toPhone,
            templateName: "MANAGER_BROADCAST",
            variables: { message },
            status: result.ok ? "SENT" : "FAILED",
            messageSid: result.messageSid,
            errorMessage: result.errorMessage,
          },
        }),
      ]);
    }

    return { broadcastId, sent: bookerUserIds.length };
  },
  { connection, concurrency: 3 }
);

worker.on("failed", (job, err) => {
  console.error(`[broadcast-fanout.worker] job ${job?.id} failed:`, err.message);
});

console.log("[broadcast-fanout.worker] listening for jobs...");
