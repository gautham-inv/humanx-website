/* eslint-disable no-console */
/**
 * Surgical seed: creates ONLY the five newly-added events, leaving every other
 * document type untouched. Re-uses `buildEvents()` from sanity-seed-content.ts
 * (one source of truth) and filters to the new slugs, so re-running overwrites
 * just these five docs by their deterministic `_id` and never clobbers
 * manually-uploaded images on existing events, recommendations, etc.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=skXXXX npm run seed:events
 */
import { createClient } from "@sanity/client";
import { buildEvents } from "./sanity-seed-content";

const NEW_EVENT_SLUGS = new Set([
  "retail-media-summit-2026",
  "aecoc-empleo-talento-2026",
  "congreso-i-seg-2026",
  "customer-experience-congress-parque-arauco-2025",
  "eshow-madrid-2024",
]);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN. Run:\n\n" +
      "    SANITY_WRITE_TOKEN=skXXXX npm run seed:events\n"
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
  const docs = buildEvents().filter((d) =>
    NEW_EVENT_SLUGS.has(String(d._id).replace(/^event-/, ""))
  );

  if (docs.length !== NEW_EVENT_SLUGS.size) {
    console.warn(
      `⚠  Expected ${NEW_EVENT_SLUGS.size} events, matched ${docs.length}. ` +
        "Check the slugs in buildEvents() match NEW_EVENT_SLUGS."
    );
  }

  console.log(
    `→ Seeding ${docs.length} new event(s) to project ${projectId} / dataset ${dataset}\n`
  );

  const tx = client.transaction();
  for (const doc of docs) {
    const clean = Object.fromEntries(
      Object.entries(doc).filter(([, v]) => v !== undefined)
    );
    tx.createOrReplace(clean as typeof doc);
  }
  await tx.commit();

  for (const d of docs) console.log(`  ✓ ${d._id}`);
  console.log(
    "\n✓ Done. Open Studio → Events to verify and upload a hero image per event."
  );
}

run().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
