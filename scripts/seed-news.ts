/**
 * Surgical seed for the two BULB! press mentions.
 *
 * Deliberately NOT `createOrReplace`: images are uploaded in Studio after
 * seeding, and `enabled` is toggled by hand on publish day. Re-running this
 * script must never clobber either. So we `createIfNotExists` (first run
 * creates the doc) then `patch().set()` only the text fields.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=skXXXX npm run seed:news
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN. Run:\n\n" +
      "    SANITY_WRITE_TOKEN=skXXXX npm run seed:news\n"
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

/** Text fields that are safe to overwrite on every run. */
type NewsSeed = {
  _id: string;
  title: { _type: "localizedString"; en: string; es: string };
  body: { _type: "localizedText"; en: string; es: string };
  source: string;
  articleUrl: string;
  date: { _type: "localizedString"; en: string; es: string };
  publishedAt: string;
};

const NEWS: NewsSeed[] = [
  {
    _id: "news-retail-media-summit-chile-2026",
    title: {
      _type: "localizedString",
      en: "Retail Media Summit Chile 2026",
      es: "Retail Media Summit Chile 2026",
    },
    body: {
      _type: "localizedText",
      en: "At the Retail Media Summit Chile 2026, Ramón Portilla closed the conference with a keynote challenging the industry to look beyond algorithms and first-party data. Through his E.I.A. framework (Emotion, Intelligence & Action), he emphasized that while AI and data have transformed Retail Media, lasting customer loyalty is built through empathy, trust, and genuine human connection. His message reinforced that the future competitive advantage will belong not only to retailers with the best data, but to those who best understand the people behind it (Spanish read).",
      es: "La prestigiada publicación Chilena Bulb!, destaca en su artículo Retail Media Summit Chile 2026, a Ramón Portilla cerrando el evento con una conferencia magistral que invitó a la industria a mirar más allá de los algoritmos y los datos de primera fuente. A través de su marco E.I.A. (Emoción, Inteligencia y Acción), destacó que, si bien la inteligencia artificial y los datos han transformado el Retail Media, la lealtad de los clientes se construye a partir de la empatía, la confianza y las conexiones humanas genuinas. Su mensaje reforzó que la verdadera ventaja competitiva del futuro no pertenecerá únicamente a quienes tengan más datos, sino a quienes mejor comprendan a las personas que hay detrás de ellos.",
    },
    source: "BULB! Marketing Magazine",
    articleUrl:
      "https://bulb.cl/marketing/el-nuevo-oro-utilizacion-del-1st-party-data-del-retailer/",
    date: { _type: "localizedString", en: "August 2026", es: "Agosto 2026" },
    publishedAt: "2026-08-07T09:00:00.000Z",
  },
  {
    _id: "news-bulb-human-vision-retail-media",
    title: {
      _type: "localizedString",
      en: "BULB! Highlights Ramón Portilla's Human Vision for Retail Media",
      es: "BULB! destaca la visión humana de Ramón Portilla para el futuro del Retail Media",
    },
    body: {
      _type: "localizedText",
      en: "Leading Chilean marketing publication BULB! Marketing Magazine featured Ramón Portilla's closing keynote at Retail Media Summit Chile 2026, where he challenged the industry to rethink its future. Rather than asking how much data retailers can collect, he posed a different question: What relationships would never exist if your brand didn't exist?\n\nIntroducing ideas such as Human Incrementality, Portilla argued that the next competitive advantage in Retail Media will not come from more technology alone, but from creating stronger human connections. Read the full article to discover why this perspective is resonating across the industry.",
      es: "La reconocida publicación chilena de marketing BULB! Marketing Magazine destacó la conferencia de clausura de Ramón Portilla en el Retail Media Summit Chile 2026, donde invitó a la industria a replantear su futuro. Más que preguntarse cuántos datos puede recopilar un retailer, propuso una reflexión distinta: ¿Qué relaciones no existirían si tu marca no existiera?\n\nPresentando conceptos como la Incrementalidad Humana, Portilla sostuvo que la próxima gran ventaja competitiva del Retail Media no vendrá únicamente de la tecnología, sino de la capacidad de construir conexiones humanas más profundas. Descubre por qué esta visión está generando conversación en la industria leyendo el artículo completo.",
    },
    source: "BULB! Marketing Magazine",
    articleUrl: "https://bulb.cl/articulos/e-i-a-la-apuesta-humana-del-retail-media/",
    date: { _type: "localizedString", en: "August 2026", es: "Agosto 2026" },
    // One day later than the first article so it sorts above it once both
    // are enabled, matching the intended publish order.
    publishedAt: "2026-08-08T09:00:00.000Z",
  },
];

async function run() {
  console.log(
    `→ Seeding ${NEWS.length} news item(s) to project ${projectId} / dataset ${dataset}\n`
  );

  const tx = client.transaction();
  for (const doc of NEWS) {
    // First run: create the doc, disabled, with no image.
    tx.createIfNotExists({ ...doc, _type: "news", enabled: false });
    // Every run: refresh text only. `image` and `enabled` are deliberately
    // absent so uploads and the live toggle survive a re-run.
    tx.patch(doc._id, {
      set: {
        title: doc.title,
        body: doc.body,
        source: doc.source,
        articleUrl: doc.articleUrl,
        date: doc.date,
        publishedAt: doc.publishedAt,
      },
    });
  }
  await tx.commit();

  for (const d of NEWS) console.log(`  ✓ ${d._id}`);
  console.log(
    "\n✓ Done. Open Studio → News / Press to upload an image for each item.\n" +
      "  Both are seeded with 'Show on site' OFF — turn one on and redeploy to publish."
  );
}

run().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
