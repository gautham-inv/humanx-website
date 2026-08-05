/* eslint-disable no-console */
/**
 * Surgical seed: updates ONLY the `event-retail-media-summit-2026` document,
 * leaving every other event/testimonial/insight untouched. Re-uses
 * `buildEvents()` from sanity-seed-content.ts (one source of truth).
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=skXXXX npm run seed:retail-media-summit
 */
import { createClient } from "@sanity/client";
import { buildEvents } from "./sanity-seed-content";

const TARGET_ID = "event-retail-media-summit-2026";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN. Run:\n\n" +
      "    SANITY_WRITE_TOKEN=skXXXX npm run seed:retail-media-summit\n"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-12-01",
  token,
  useCdn: false,
});

async function run() {
  const doc = buildEvents().find((d) => d._id === TARGET_ID);

  if (!doc) {
    console.error(`✗ Could not find ${TARGET_ID} in buildEvents().`);
    process.exit(1);
  }

  console.log(`→ Seeding ${TARGET_ID} to project ${projectId} / dataset ${dataset}\n`);

  const clean = Object.fromEntries(
    Object.entries(doc).filter(([, v]) => v !== undefined)
  );
  await client.createOrReplace(clean as typeof doc);

  console.log(`  ✓ ${TARGET_ID}`);
  console.log("\n✓ Done.");
}

run().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
