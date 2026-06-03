/* eslint-disable no-console */
/**
 * Surgical seed for the `client` document type (homepage Clients ticker).
 * Creates one doc per brand with a deterministic `_id` (client-{slug}) so
 * re-running overwrites just these docs and never touches anything else.
 * Logos are uploaded per-client in Studio (the ticker shows the name as text
 * until then). Brands + URLs supplied by the client.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=skXXXX npm run seed:clients
 */
import { createClient } from "@sanity/client";

const CLIENTS: { name: string; website: string }[] = [
  { name: "Meta", website: "https://about.meta.com" },
  { name: "Instagram", website: "https://instagram.com" },
  { name: "Pacífico Business School", website: "https://pbs.edu.pe" },
  { name: "Parque Arauco", website: "https://parauco.com" },
  { name: "CaixaBank Payments & Consumer", website: "https://caixabankpc.com" },
  { name: "Casaideas", website: "https://casaideas.com" },
  { name: "Walmart", website: "https://corporate.walmart.com" },
  { name: "ISEG Perú", website: "https://isegcorp.com" },
  { name: "Ricoh", website: "https://ricoh.com" },
  { name: "E-Show Madrid", website: "https://eshow.es" },
  { name: "Gloria Pets", website: "https://gloriapets.com" },
  { name: "IskayPet", website: "https://iskaypet.com" },
  { name: "Sam's Club", website: "https://corporate.samsclub.com" },
  { name: "Bayer", website: "https://bayer.com" },
  { name: "H-E-B", website: "https://heb.com" },
  { name: "NielsenIQ", website: "https://nielseniq.com" },
  { name: "ANSA Venezuela", website: "https://ansa.org.ve" },
  { name: "Asociación Española del Retail (AER)", website: "https://asociacionretail.com" },
  { name: "Coppel", website: "https://coppel.com" },
  { name: "Dragonfruit AI", website: "https://dragonfruit.ai" },
  { name: "Michael Page", website: "https://michaelpage.com" },
  { name: "Kimberly-Clark", website: "https://kimberly-clark.com" },
  { name: "Numerator", website: "https://numerator.com" },
  { name: "Market Performance Group (MPG)", website: "https://marketperformancegroup.com" },
  { name: "The Retail Chamber of Commerce", website: "https://theretailchamber.com" },
];

/** Slugify a brand name into a stable, path-safe id segment. */
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN. Run:\n\n    SANITY_WRITE_TOKEN=skXXXX npm run seed:clients\n"
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
    `→ Seeding ${CLIENTS.length} clients to project ${projectId} / dataset ${dataset}\n`
  );
  const tx = client.transaction();
  CLIENTS.forEach((c, i) => {
    tx.createOrReplace({
      _id: `client-${slugify(c.name)}`,
      _type: "client",
      name: c.name,
      website: c.website,
      order: i + 1,
    });
  });
  await tx.commit();
  CLIENTS.forEach((c) => console.log(`  ✓ client-${slugify(c.name)}`));
  console.log(
    "\n✓ Done. Open Studio → Clients to upload each brand's logo (dark + light)."
  );
}

run().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
