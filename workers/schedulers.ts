/**
 * Run once (e.g. `npm run worker:schedule`) to register the repeatable
 * jobs. BullMQ persists the repeat schedule in Redis, so this doesn't
 * need to run continuously — just once per deploy/schedule change.
 */
import { beatGenerationQueue, schemeExpiryQueue } from "../src/lib/queue";

async function main() {
  // Every day at 00:15 (Asia/Karachi) — after midnight, ahead of the
  // Booker App's first "My Beat" fetch of the day.
  await beatGenerationQueue.add(
    "generate-daily",
    {},
    {
      repeat: { pattern: "15 0 * * *", tz: "Asia/Karachi" },
      jobId: "beat-generation-daily",
    }
  );

  // Every day at 00:05 — sweep expired schemes before the day's orders start.
  await schemeExpiryQueue.add(
    "expire-daily",
    {},
    {
      repeat: { pattern: "5 0 * * *", tz: "Asia/Karachi" },
      jobId: "scheme-expiry-daily",
    }
  );

  console.log("Repeatable jobs registered: beat-generation-daily, scheme-expiry-daily");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
