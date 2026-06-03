/* eslint-disable no-console */
/**
 * Surgical seed for the `conference` document type (Major Conferences wall on
 * /on-stage). Deterministic `_id` (conference-{slug}) so re-running overwrites
 * just these docs. Fields are derived from the existing event/insight seed
 * data; websites are only set where an authoritative URL exists (event
 * registration link or the client list). Logos are uploaded in Studio later —
 * the wall shows the conference name as text until then.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=skXXXX npm run seed:conferences
 */
import { createClient } from "@sanity/client";

type Conf = {
  slug: string;
  name: string;
  organization?: string;
  region?: string;
  website?: string;
};

const CONFERENCES: Conf[] = [
  {
    slug: "grand-retail-show",
    name: "Grand Retail Show",
    organization: "Grand Retail Show",
    region: "USA",
    website: "https://grandretailshow.com",
  },
  {
    slug: "expo-retail-iberoamerica",
    name: "Expo Retail Iberoamérica",
    organization: "ExpoRetail Iberoamérica",
    region: "Spain",
  },
  {
    slug: "retail-media-summit",
    name: "Retail Media Summit",
    organization: "Retail Media Summit",
    region: "Chile",
  },
  {
    slug: "congreso-aecoc-empleo-talento",
    name: "Congreso AECOC Empleo y Talento",
    organization: "AECOC",
    region: "Spain",
  },
  {
    slug: "customer-experience-congress-parque-arauco",
    name: "Customer Experience Congress Parque Arauco",
    organization: "Parque Arauco",
    region: "Peru",
    website: "https://parauco.com",
  },
  {
    slug: "congreso-i-seg",
    name: "Congreso i-Seg",
    organization: "ISEG",
    region: "Peru",
    website: "https://isegcorp.com",
  },
  {
    slug: "gondola-conference",
    name: "Góndola Conference",
    organization: "Góndola",
    region: "Colombia",
  },
  {
    slug: "eshow-madrid",
    name: "eShow Madrid",
    organization: "eShow",
    region: "Spain",
    website: "https://eshow.es",
  },
];

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN. Run:\n\n    SANITY_WRITE_TOKEN=skXXXX npm run seed:conferences\n"
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
  console.log(
    `→ Seeding ${CONFERENCES.length} conferences to project ${projectId} / dataset ${dataset}\n`
  );
  const tx = client.transaction();
  CONFERENCES.forEach((c, i) => {
    const doc: Record<string, unknown> = {
      _id: `conference-${c.slug}`,
      _type: "conference",
      name: c.name,
      organization: c.organization,
      region: c.region,
      website: c.website,
      featuredOrder: i + 1,
    };
    // Drop undefined so Sanity doesn't store null fields.
    const clean = Object.fromEntries(
      Object.entries(doc).filter(([, v]) => v !== undefined)
    );
    tx.createOrReplace(clean as { _id: string; _type: string });
  });
  await tx.commit();
  CONFERENCES.forEach((c) => console.log(`  ✓ conference-${c.slug}`));
  console.log(
    "\n✓ Done. Open Studio → Conferences to upload each conference logo."
  );
}

run().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
