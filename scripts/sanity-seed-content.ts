/* eslint-disable no-console */
/**
 * Real-content seed: pushes the actual events, videos, and LinkedIn-post
 * insights into Sanity. Decoupled from `sanity-seed.ts` (which seeds the
 * dict placeholder copy + every singleton) so the two can run independently.
 *
 * What gets created / replaced:
 *
 *   event   × 7   — Grand Retail Show, Women in International Trade,
 *                    ESOMAR webinar, Asociación Española de Retail,
 *                    HumanX Colombia 2023, Empowerment Forum 2025,
 *                    Summit CX Lima 2025.
 *   video   × 4   — The four YouTube talks (Hispanics 2025, Caixa Bank
 *                    Madrid, Pacífico Lima, Pacífico interview).
 *   insight × 6   — Six LinkedIn posts.
 *
 * What gets deleted (cleanup of the prior mis-seeded YouTube events):
 *
 *   event-hispanics-momentum-2025, event-caixa-bank-madrid-2024,
 *   event-pacifico-lima-2024, event-pacifico-interview-2024
 *
 * The dict-placeholder events (event-2026-*) created by `npm run seed` are
 * left in the dataset — open the studio and delete those by hand once
 * you've verified the real content renders.
 *
 * Re-running this script is idempotent because every doc has a
 * deterministic `_id` and the cleanup list is fixed.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=skXXXX npm run seed:content
 */
import { createClient } from "@sanity/client";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN. Create an Editor-role token at " +
      `sanity.io/manage → project ${projectId} → API → Tokens, then run:\n\n` +
      "    SANITY_WRITE_TOKEN=skXXXX npm run seed:content\n"
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

// ---------- shape helpers --------------------------------------------------

const loc = (en: string, es: string) => ({
  _type: "localizedString" as const,
  en,
  es,
});
const locText = (en: string, es: string) => ({
  _type: "localizedText" as const,
  en,
  es,
});

type Doc = Record<string, unknown> & { _id: string; _type: string };

const ROOT = process.cwd();
const uploadedImageRefByPath = new Map<string, string>();

async function maybeUploadImageAsset(relativePath?: string): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } } | undefined> {
  if (!relativePath) return undefined;
  const abs = path.join(ROOT, relativePath);
  try {
    await stat(abs);
  } catch {
    console.warn(`  · image not found, skipping: ${relativePath}`);
    return undefined;
  }

  const cached = uploadedImageRefByPath.get(abs);
  if (cached) {
    return { _type: "image", asset: { _type: "reference", _ref: cached } };
  }

  const filename = path.basename(abs);
  const ext = path.extname(filename).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png" :
    ext === ".webp" ? "image/webp" :
    ext === ".jpeg" || ext === ".jpg" ? "image/jpeg" :
    "application/octet-stream";

  const asset = await client.assets.upload("image", createReadStream(abs), {
    filename,
    contentType,
  });
  uploadedImageRefByPath.set(abs, asset._id);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

// ---------- testimonials ----------------------------------------------------

async function buildTestimonials(): Promise<Doc[]> {
  const items: Array<{
    slug: string;
    quote: string;
    author: string;
    org: string;
    imageFile?: string;
    /** When set, the avatar+name block in the carousel becomes a link. */
    linkedinUrl?: string;
  }> = [
    {
      slug: "paco-underhill",
      author: "Paco Underhill",
      org: "Founder of Envirosell Inc., Global best-selling author, and Futurist",
      quote:
        "One of the best decision Walmart made as it expanded internationally was to harvest the best and brightest and bring them back to Bentonville. Ramon was one their best finds. An Oxford University education, a clear global awareness and gift for management, I was struck as I met him some 20 years ago of the elegance and grace at which both he projected and used in his leadership role. The combination of a big fast brain, a caring heart and ability to listen is a unique combination in modern management. Over the past twenty years he has built a remarkable record of both strategic thinking and hands on accomplishment.",
      imageFile: "paco-underhill.jpg",
      linkedinUrl: "https://www.linkedin.com/in/pacounderhill/",
    },
    {
      slug: "allan-steinmetz",
      author: "Allan Steinmetz",
      org: "CEO, Founder, Inward Strategic Consulting",
      quote:
        "Ramon is a visionary with a knack for uncovering trends and shaping strategy. His ability to distill complex data into clear recommendations is unparalleled. He brings a passionate customer focus to every discussion, driving customer-led decisions. As a servant leader, he inspires teams to align with company's purpose and deliver impactful results through creative execution and ideas. Ramon excels in implementing metrics like NPS to enhance both customer and employee experience and impactful insights. His retail expertise, coupled with technological prowess, accelerates customer-focused strategies locally and globally.",
      imageFile: "allan-steinmitz.jpeg",
    },
    {
      slug: "laureano-turienzo",
      author: "Laureano Turienzo",
      org: "CEO Retail News Trends y Presidente del Círculo Iberoamericano de Retail",
      quote:
        "Ramón es uno de los profesionales más brillantes que he conocido. Un verdadero líder y profesional destacado en el Sector Retail a Nivel Mundial. No solo posee un conocimiento profundo y una experiencia vasta en todas las facetas del sector, sino que también se destaca por su visión de futuro excepcional. Su capacidad para anticipar las tendencias y adaptarse a las dinámicas cambiantes del mercado lo coloca en una posición única como estratega empresarial. Ramón va más allá de los aspectos comerciales; comprende que el sector retail es intrínsecamente humano. Su enfoque humanista centrado en las personas refleja su comprensión de que, en última instancia, se trata de crear momentos significativos para clientes y empleados. Esta perspectiva hace que su liderazgo sea no solo efectivo sino también inspirador.",
      imageFile: "laureano-turienzo.png",
      linkedinUrl: "https://www.linkedin.com/in/laurenturienzo/",
    },
    {
      slug: "carla-giovannetti-dodds",
      author: "Carla Giovannetti Dodds",
      org: "Global Growth and Brand Strategist",
      quote:
        "I can best describe Ramon as an insight retail leader with unique expertise who translates insights to strategy, accelerating customer-focus strategies for higher engagement and revenue growth. I partnered with Ramon during two of my assignments at Walmart US. During my last tenure in Marketing, he provided our team with critical insights to drive our Financial Services business. Previously, as Head of Multicultural for Walmart, he became a key advisor in differentiating insights from the Hispanic customer that fed our multicultural strategy. His work included partnerships with key category brands (P&G, Coca-Cola, Frito Lay, L'Oreal, etc.) that yielded significant growth with the US Hispanic Retail segment.",
      imageFile: "Carla-giovanni.png",
      linkedinUrl: "https://www.linkedin.com/in/carladodds/",
    },
    {
      slug: "dario-brasca",
      author: "Darío Brasca",
      org: "Presidente CYRE, S.A., Argentina",
      quote:
        "Ramón personifica la Experiencia Humana, fusionando valores y propósito para impulsar organizaciones hacia un crecimiento diferenciado. Su visión innovadora y habilidad para inspirar a través de historias cautivan, mientras su liderazgo apasionado nutre equipos centrados en el propósito, elevando cada experiencia del cliente y empleado con una creatividad sin igual. Además, como líder en estrategias de retail, Ramón anticipa tendencias, influyendo en decisiones comerciales y trascendiendo fronteras, especialmente en América Latina y Europa, consolidándolo como un referente en el mundo del retail.",
      imageFile: "dario-brasca.jpg",
      linkedinUrl:
        "https://www.linkedin.com/in/dar%C3%ADo-sebasti%C3%A1n-brasca-0bab78174/",
    },
    {
      slug: "mauricio-sabogal",
      author: "Mauricio Sabogal",
      org: "CEO, Founder, SAB Marketing Connections",
      quote:
        "Ramon Portilla stands out as a visionary leader whose impact transcends our organization to leave a lasting mark on the industry. His commitment to excellence and innovative insights into customer and market dynamics has inspired teams to achieve remarkable goals. I am honored to endorse him as a professional par excellence, confident in his ability to elevate HumanX Insights to unprecedented success. His exceptional leadership and expertise in translating market strategies across diverse regions, especially in leveraging AI for strategic planning, resonate deeply with SAB Marketing Connections' mission.",
      imageFile: "Mauricio Sabogal.jpg",
      // Source URL had a trailing `/in/` (likely typo); LinkedIn rejects it
      // and normalises to the bare `/in/{handle}/` form below.
      linkedinUrl: "https://www.linkedin.com/in/mauriciosabog/",
    },
    {
      slug: "laston-charriez",
      author: "Laston Charriez",
      org: "Colorado State University, Assistant Professor of Practice and Industry Liaison",
      quote:
        "I have known Ramon for many years. He is an Insight Generating machine. Using his tentacles at Wal-Mart, he helped my team and I, justify new investments in Hispanic Shopper marketing. His unique expertise to translate strategy of customer-focus strategies within the US Hispanic Retail segment allowed us to create win-win Shopper programs that had above benchmark ROI.",
    },
    {
      slug: "cesar-enamorado",
      author: "Cesar Enamorado",
      org: "VP Estrategia, DIUNSA, Honduras",
      quote:
        "Mi experiencia con HumanX Insights ha sido excepcional. Su enfoque apasionado por el cliente se refleja en cada interacción comercial. Tienen una capacidad única para influir en decisiones impulsadas por el cliente, ofreciendo soluciones personalizadas que superan expectativas. ¡Recomiendo sus servicios a cualquiera que busque resultados tangibles y una atención centrada en el cliente!.",
      imageFile: "Cesar Enamorado.jpg",
      linkedinUrl: "https://www.linkedin.com/in/cesarenamorado/",
    },
  ];

  const docs: Doc[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const relativePath = it.imageFile ? path.join("public", "testimonials", it.imageFile) : undefined;
    const image = await maybeUploadImageAsset(relativePath);
    docs.push({
      _id: `testimonial-${it.slug}`,
      _type: "testimonial",
      quote: locText(it.quote, it.quote),
      author: loc(it.author, it.author),
      org: loc(it.org, it.org),
      image,
      linkedinUrl: it.linkedinUrl,
      order: i + 1,
    });
  }

  return docs;
}

// ---------- events ----------------------------------------------------------
//
// Each event carries: slug (URL segment), title (loc), venue (loc),
// dateDisplay (loc), startsAt (ISO timestamp used for upcoming/past sort),
// summary (one-line teaser, loc), body (multi-paragraph, loc), optional
// registrationUrl. Images are NOT seeded — authors upload them per event
// via Studio because we don't have the source files on disk.

function buildEvents(): Doc[] {
  type EventSeed = {
    slug: string;
    title: { en: string; es: string };
    venue: { en: string; es: string };
    dateDisplay: { en: string; es: string };
    startsAt: string;
    summary: { en: string; es: string };
    body: { en: string; es: string };
    registrationUrl?: string;
  };

  const events: EventSeed[] = [
    // 1 — Grand Retail Show 2025
    {
      slug: "grand-retail-show-2025",
      title: {
        en: "Seizing the Hispanic Trends: It's now or never.",
        es: "Aprovechando las tendencias hispanas: ahora o nunca.",
      },
      venue: {
        en: "Dulles Expo Center, Chantilly, VA, USA",
        es: "Dulles Expo Center, Chantilly, VA, EE.UU.",
      },
      dateDisplay: { en: "May 20–21, 2025", es: "20–21 de mayo, 2025" },
      startsAt: "2025-05-20T14:00:00.000Z",
      summary: {
        en: "Join us at the Grand Retail Show 2025 to unpack the Hispanic consumer opportunity.",
        es: "Únete a Grand Retail Show 2025 para descubrir la oportunidad del consumidor hispano.",
      },
      body: {
        en:
          "HumanX Insights joins the Grand Retail Show 2025 to share what U.S. retailers " +
          "need to know about the fastest-growing consumer segment in the country.\n\n" +
          "Two days of working sessions on positioning, employee enablement, and the " +
          "Human Experience strategies that turn Hispanic shoppers into long-term customers.",
        es:
          "HumanX Insights participa en el Grand Retail Show 2025 para compartir lo que los " +
          "retailers estadounidenses necesitan saber sobre el segmento de consumidores de mayor " +
          "crecimiento en el país.\n\nDos días de sesiones de trabajo sobre posicionamiento, " +
          "habilitación de los empleados y estrategias de Experiencia Humana que convierten al " +
          "comprador hispano en cliente de largo plazo.",
      },
      registrationUrl: "https://grandretailshow.com",
    },
    // 2 — Women in International Trade · SNT
    {
      slug: "women-international-trade-snt-2024",
      title: {
        en: 'Women in International Trade: new episode of the "SNT" series',
        es: 'Women in International Trade: nuevo episodio de la serie "SNT"',
      },
      venue: { en: "Webinar (OWIT)", es: "Webinar (OWIT)" },
      dateDisplay: { en: "August 29, 2024", es: "29 de agosto, 2024" },
      startsAt: "2024-08-29T15:00:00.000Z",
      summary: {
        en: 'A "Successfully Navigating Trade" webinar with Angela Marshall-Hoffman, Ramon Portilla, and Theresa Barrera-Shaw.',
        es: 'Webinar "Successfully Navigating Trade" con Angela Marshall-Hoffman, Ramon Portilla y Theresa Barrera-Shaw.',
      },
      body: {
        en:
          "Women in International Trade preparing the coming \"Successfully Navigating " +
          "Trade\" episode. This webinar, hosted by Angela Marshall-Hoffman, welcomes Ramon " +
          "Portilla and Theresa Barrera-Shaw.\n\nThis forum allowed us to share with this " +
          "remarkable international group the importance of driving a Human Experience " +
          "strategy across the retail and trade industries.",
        es:
          "Women in International Trade prepara el próximo episodio de \"Successfully " +
          "Navigating Trade\". Este webinar, presentado por Angela Marshall-Hoffman, recibe a " +
          "Ramon Portilla y Theresa Barrera-Shaw.\n\nEste foro nos permitió compartir con este " +
          "destacado grupo internacional la importancia de impulsar una estrategia de " +
          "Experiencia Humana en las industrias del retail y el comercio.",
      },
      registrationUrl:
        "https://owit.org/events/how-to-successfully-navigate-global-trade-august-2024/?occurrence=2024-08-29",
    },
    // 3 — ESOMAR / MRII / CRIC webinar
    {
      slug: "esomar-mrii-cric-webinar-2024",
      title: {
        en: "ESOMAR, MRII and CRIC are hosting this Webinar",
        es: "ESOMAR, MRII y CRIC presentan este webinar",
      },
      venue: { en: "Webinar (ESOMAR)", es: "Webinar (ESOMAR)" },
      dateDisplay: { en: "July 24, 2024", es: "24 de julio, 2024" },
      startsAt: "2024-07-24T15:00:00.000Z",
      summary: {
        en: "A seminar inspiring the research community to lead with Customer and Employee Experience.",
        es: "Un seminario para inspirar a la comunidad de investigación a liderar con experiencia de cliente y empleado.",
      },
      body: {
        en:
          "ESOMAR, MRII and CRIC are hosting this Webinar to inspire the research " +
          "professional community to explore and develop new skills in the arena of " +
          "Customer and Employee Experience.\n\nThe seminar talks about the key role insights " +
          "play to drive the business of service industries, as well as the opportunity to " +
          "lead with technology in our more digitalized world.",
        es:
          "ESOMAR, MRII y CRIC presentan este webinar para inspirar a la comunidad " +
          "profesional de investigación a explorar y desarrollar nuevas habilidades en el " +
          "ámbito de la Experiencia del Cliente y del Empleado.\n\nEl seminario aborda el rol " +
          "clave de los insights para impulsar el negocio de las industrias de servicio, así " +
          "como la oportunidad de liderar con tecnología en un mundo cada vez más digital.",
      },
      registrationUrl:
        "https://event.on24.com/wcc/r/4609112/89A1903FA6D80740C62290B152DA7DD9",
    },
    // 4 — Asociación Española de Retail · Horizons 2025
    {
      slug: "asociacion-espanola-retail-5th-2024",
      title: {
        en: "The Asociación Española de Retail 5th anniversary",
        es: "5.º aniversario de la Asociación Española de Retail",
      },
      venue: { en: "Madrid, Spain · Congress Horizons 2025", es: "Madrid, España · Congreso Horizons 2025" },
      dateDisplay: { en: "June 12, 2024", es: "12 de junio, 2024" },
      startsAt: "2024-06-12T09:00:00.000Z",
      summary: {
        en: "300 retail executives gather in Madrid to discuss the future of the industry.",
        es: "300 ejecutivos del retail se reúnen en Madrid para hablar del futuro de la industria.",
      },
      body: {
        en:
          "The Asociación Española de Retail celebrated its 5th anniversary with the " +
          "Congress Horizons 2025, where nearly 300 executives and leaders of the retail " +
          "industry gathered to talk about the current state and the future of retail.\n\n" +
          "HumanX Insights was present to challenge Spain's top executives to take a " +
          "leadership role in the European Union to drive a better Customer Experience, by " +
          "bringing along their employees, as the formula to ultimately deliver the best " +
          "Human Experiences.",
        es:
          "La Asociación Española de Retail celebró su 5.º aniversario con el Congreso " +
          "Horizons 2025, donde cerca de 300 ejecutivos y líderes de la industria del retail " +
          "se reunieron para hablar del estado actual y del futuro del retail.\n\nHumanX " +
          "Insights estuvo presente para retar a los principales ejecutivos de España a asumir " +
          "un rol de liderazgo en la Unión Europea, impulsando una mejor Experiencia del " +
          "Cliente y llevando consigo a sus empleados como fórmula para entregar la mejor " +
          "Experiencia Humana.",
      },
    },
    // 5 — HumanX Colombia · Iberoamerican retail forum
    {
      slug: "humanx-colombia-2023",
      title: {
        en: "HumanX Insights set the stage to raise the critical role of employees",
        es: "HumanX Insights elevó el rol crítico de los empleados en la industria",
      },
      venue: { en: "Colombia · Iberoamerican retail forum", es: "Colombia · Foro de retail iberoamericano" },
      dateDisplay: { en: "November 16, 2023", es: "16 de noviembre, 2023" },
      startsAt: "2023-11-16T15:00:00.000Z",
      summary: {
        en: "1,500+ professionals from Colombia and Iberoamerica gathered to talk talent as competitive advantage.",
        es: "Más de 1.500 profesionales de Colombia e Iberoamérica reunidos para hablar de talento como ventaja competitiva.",
      },
      body: {
        en:
          "With over 1,500 enthusiast professionals from Colombia and Iberoamerican " +
          "countries, HumanX Insights set the stage to raise the critical role that " +
          "employees play for the success of the retail industry in an economy that has " +
          "been under a lot of economic pressure.\n\nOur insights stressed the unique " +
          "attributes of the Colombian talent as a competitive advantage when leaders dare " +
          "to invest resources in their workforce.",
        es:
          "Con más de 1.500 profesionales entusiastas de Colombia y de países " +
          "iberoamericanos, HumanX Insights puso sobre la mesa el rol crítico que los " +
          "empleados juegan para el éxito de la industria del retail en una economía bajo " +
          "fuerte presión.\n\nNuestros insights destacaron los atributos únicos del talento " +
          "colombiano como ventaja competitiva cuando los líderes se atreven a invertir " +
          "recursos en su gente.",
      },
      registrationUrl:
        "https://drive.google.com/file/d/1l6kODNKKVzIE6DTJHSpxtDz0_oLzQEtM/view",
    },
    // 6 — The Empowerment Forum (Serve 2 Perform), Bentonville AR
    {
      slug: "empowerment-forum-2025",
      title: {
        en: "The Future of Empowerment with AI",
        es: "El futuro del empoderamiento con IA",
      },
      venue: {
        en: "Crystal Bridges Museum of American Art, Bentonville, AR, USA",
        es: "Crystal Bridges Museum of American Art, Bentonville, AR, EE.UU.",
      },
      dateDisplay: { en: "October 16, 2025", es: "16 de octubre, 2025" },
      startsAt: "2025-10-16T14:00:00.000Z",
      summary: {
        en: "Join us at The Empowerment Forum, from Serve 2 Perform.",
        es: "Únete a The Empowerment Forum, de Serve 2 Perform.",
      },
      body: {
        en:
          "Join us at The Empowerment Forum, from Serve 2 Perform.\n\nOctober 16, 2025 · " +
          "Crystal Bridges Museum of American Art, Bentonville, AR, USA.",
        es:
          "Únete a The Empowerment Forum, de Serve 2 Perform.\n\n16 de octubre, 2025 · " +
          "Crystal Bridges Museum of American Art, Bentonville, AR, EE.UU.",
      },
      registrationUrl: "https://hubs.la/Q03KHxML0",
    },
    // 7 — Summit CX 2025 · Lima
    {
      slug: "summit-cx-lima-2025",
      title: { en: "SUMMIT CX 2025", es: "SUMMIT CX 2025" },
      venue: {
        en: "Teatro La Plaza Larcomar, Lima, Perú",
        es: "Teatro La Plaza Larcomar, Lima, Perú",
      },
      dateDisplay: { en: "October 21, 2025", es: "21 de octubre, 2025" },
      startsAt: "2025-10-21T14:00:00.000Z",
      summary: {
        en: "Ramon Portilla on stage at Summit CX Lima.",
        es: "Ramon Portilla en el escenario del Summit CX Lima.",
      },
      body: {
        en:
          "Ramon Portilla keynoting Summit CX 2025 at Teatro La Plaza Larcomar, Lima — " +
          "October 21, 2025.",
        es:
          "Ramon Portilla como ponente principal del Summit CX 2025 en el Teatro La Plaza " +
          "Larcomar, Lima — 21 de octubre, 2025.",
      },
    },
  ];

  return events.map((ev, i) => ({
    _id: `event-${ev.slug}`,
    _type: "event",
    slug: { _type: "slug", current: ev.slug },
    title: loc(ev.title.en, ev.title.es),
    venue: loc(ev.venue.en, ev.venue.es),
    dateDisplay: loc(ev.dateDisplay.en, ev.dateDisplay.es),
    startsAt: ev.startsAt,
    summary: locText(ev.summary.en, ev.summary.es),
    body: locText(ev.body.en, ev.body.es),
    registrationUrl: ev.registrationUrl,
    // 100+ so these sort after dict-placeholders if any tie on _createdAt.
    order: 100 + i,
  }));
}

// ---------- videos ----------------------------------------------------------
//
// The 4 YouTube talks the user originally provided. Previously seeded as
// `event` docs by mistake; this script deletes those and re-creates them
// as proper `video` documents that drive the homepage On Stage grid.

function buildVideos(): Doc[] {
  type VideoSeed = {
    slug: string;
    title: { en: string; es: string };
    caption: { en: string; es: string };
    youtubeId: string;
    publishedAt: string;
  };

  const videos: VideoSeed[] = [
    {
      slug: "hispanics-momentum-2025",
      title: {
        en: "Inspiring the Professional Momentum of Hispanics in the USA",
        es: "Inspirando el momento profesional de los hispanos en EE.UU.",
      },
      caption: { en: "Keynote · 2025", es: "Ponencia · 2025" },
      youtubeId: "3eWLn0lQTkk",
      publishedAt: "2025-06-15T15:00:00.000Z",
    },
    {
      slug: "caixa-bank-madrid-2024",
      title: {
        en: "Caixa Bank Consumer & Payments · Madrid keynote",
        es: "Caixa Bank Consumer & Payments · Conferencia en Madrid",
      },
      caption: {
        en: "Caixa Bank, Madrid · October 2024",
        es: "Caixa Bank, Madrid · Octubre 2024",
      },
      youtubeId: "PMv6Ogws8Fg",
      publishedAt: "2024-10-15T09:00:00.000Z",
    },
    {
      slug: "pacifico-lima-2024",
      title: {
        en: "1st International Retail Forum · Pacífico Business School, Lima",
        es: "1.er Foro Internacional de Retail · Pacífico Business School, Lima",
      },
      caption: { en: "Lima, Peru · October 2024", es: "Lima, Perú · Octubre 2024" },
      youtubeId: "3tLfB1_FzXo",
      publishedAt: "2024-10-22T13:00:00.000Z",
    },
    {
      slug: "pacifico-interview-2024",
      title: {
        en: "Interview at Pacífico Business School · leadership values",
        es: "Entrevista en Pacífico Business School · valores de liderazgo",
      },
      caption: { en: "Lima, Peru · October 2024", es: "Lima, Perú · Octubre 2024" },
      youtubeId: "dZ-HM16fV10",
      publishedAt: "2024-10-23T14:00:00.000Z",
    },
  ];

  return videos.map((v, i) => ({
    _id: `video-${v.slug}`,
    _type: "video",
    title: loc(v.title.en, v.title.es),
    caption: loc(v.caption.en, v.caption.es),
    youtubeId: v.youtubeId,
    publishedAt: v.publishedAt,
    order: i + 1,
  }));
}

// ---------- insights -------------------------------------------------------

function buildInsights(): Doc[] {
  type InsightSeed = {
    slug: string;
    title: { en: string; es: string };
    kind: { en: string; es: string };
    dateDisplay: { en: string; es: string };
    publishedAt: string;
    href: string;
  };

  const insights: InsightSeed[] = [
    {
      slug: "oil-change-trust",
      title: {
        en: "Oil-Change Industry: Drive trust by taking care of customers",
        es: "Industria del cambio de aceite: gana confianza cuidando al cliente",
      },
      kind: { en: "Field note", es: "Nota de campo" },
      dateDisplay: { en: "April 2024", es: "Abril 2024" },
      publishedAt: "2024-04-09T12:00:00.000Z",
      href: "https://www.linkedin.com/posts/ramon-portilla-627b064_customerexperience-employeeexperience-humanexperience-ugcPost-7183236173421555713-ENPn/",
    },
    {
      slug: "forbes-offers-vs-appreciation",
      title: {
        en: "Offers: Sales bait or appreciation token? Reflections on Forbes Advisor's 2024 CX Trends",
        es: "Ofertas: ¿anzuelo o gesto de agradecimiento? Reflexiones sobre las tendencias CX de Forbes Advisor 2024",
      },
      kind: { en: "Essay", es: "Ensayo" },
      dateDisplay: { en: "November 2023", es: "Noviembre 2023" },
      publishedAt: "2023-11-12T12:00:00.000Z",
      href: "https://www.linkedin.com/posts/ramon-portilla-627b064_humanexperience-hx-cx-share-7126245850678251520-a5Fk/",
    },
    {
      slug: "viba-humanize-ai",
      title: {
        en: "Virtual or real agent? VIBA: humanizing AI by giving customers a choice",
        es: "¿Agente virtual o real? VIBA: humanizar la IA dándole opciones al cliente",
      },
      kind: { en: "Framework", es: "Marco" },
      dateDisplay: { en: "November 2023", es: "Noviembre 2023" },
      publishedAt: "2023-11-11T12:00:00.000Z",
      href: "https://www.linkedin.com/posts/ramon-portilla-627b064_customerexperience-cx-employeeexperience-share-7126195111280934912-iuWa/",
    },
    {
      slug: "cx-future-marketing",
      title: {
        en: "The future of CX and its transformative impact on marketing, agencies, and creative teams",
        es: "El futuro del CX y su impacto transformador en marketing, agencias y equipos creativos",
      },
      kind: { en: "Talk", es: "Charla" },
      dateDisplay: { en: "November 2023", es: "Noviembre 2023" },
      publishedAt: "2023-11-09T12:00:00.000Z",
      href: "https://www.linkedin.com/posts/ramon-portilla-627b064_cx-ex-humanexperience-share-7125197013343698944-JsLT/",
    },
    {
      slug: "colombia-trust-cartagena",
      title: {
        en: "What distinguishes a Colombian? Driving trust — Góndola conference, Cartagena",
        es: "¿Qué distingue a un colombiano? Generar confianza — Conferencia Góndola, Cartagena",
      },
      kind: { en: "Talk", es: "Charla" },
      dateDisplay: { en: "November 2023", es: "Noviembre 2023" },
      publishedAt: "2023-11-09T10:00:00.000Z",
      href: "https://www.linkedin.com/posts/ramon-portilla-627b064_proposito-experienciahumana-experienciadelcliente-ugcPost-7125190883133587456-piMz/",
    },
    {
      slug: "price-consistency-trust",
      title: {
        en: "Price consistency, a trust driver",
        es: "La consistencia de precios, un motor de confianza",
      },
      kind: { en: "Field note", es: "Nota de campo" },
      dateDisplay: { en: "November 2023", es: "Noviembre 2023" },
      publishedAt: "2023-11-06T12:00:00.000Z",
      href: "https://www.linkedin.com/posts/ramon-portilla-627b064_humanexperience-cx-ex-share-7124007038312988672-9TPF/",
    },
  ];

  return insights.map((it) => ({
    _id: `insight-${it.slug}`,
    _type: "insight",
    title: loc(it.title.en, it.title.es),
    kind: loc(it.kind.en, it.kind.es),
    date: loc(it.dateDisplay.en, it.dateDisplay.es),
    publishedAt: it.publishedAt,
    href: it.href,
  }));
}

// ---------- ids to delete (cleanup of prior misseed) -----------------------

const STALE_EVENT_IDS = [
  // Previously seeded as `event` docs by an earlier run of this script.
  // The same content now lives in `video-*` docs (see buildVideos()).
  "event-hispanics-momentum-2025",
  "event-caixa-bank-madrid-2024",
  "event-pacifico-lima-2024",
  "event-pacifico-interview-2024",
];

// ---------- run -------------------------------------------------------------

async function seed() {
  // Cleanup first — get rid of the misseeded YouTube events. Use the
  // delete-and-tolerate-missing flow so a fresh dataset doesn't error out.
  console.log("→ Cleaning up prior mis-seeded YouTube events…");
  const delTx = client.transaction();
  for (const id of STALE_EVENT_IDS) delTx.delete(id);
  try {
    await delTx.commit({ visibility: "deferred" });
    console.log(`  ✓ deleted ${STALE_EVENT_IDS.length} stale event docs (or no-op)`);
  } catch (err) {
    // Sanity returns a 400 when every target doc is already absent —
    // safe to ignore on a clean dataset.
    console.log(`  · cleanup no-op (${(err as Error).message?.slice(0, 60)}…)`);
  }

  const groups: { label: string; docs: Doc[] }[] = [
    { label: "testimonials", docs: await buildTestimonials() },
    { label: "events", docs: buildEvents() },
    { label: "videos", docs: buildVideos() },
    { label: "insights (LinkedIn)", docs: buildInsights() },
  ];

  console.log(
    `\n→ Seeding real content to project ${projectId} / dataset ${dataset}\n` +
      `  ${groups.reduce((n, g) => n + g.docs.length, 0)} documents total\n`
  );

  for (const group of groups) {
    const tx = client.transaction();
    for (const doc of group.docs) {
      const clean = Object.fromEntries(
        Object.entries(doc).filter(([, v]) => v !== undefined)
      ) as Doc;
      tx.createOrReplace(clean);
    }
    await tx.commit();
    console.log(`  ✓ ${group.label.padEnd(20)} ${group.docs.length} docs`);
  }

  // Surface anything else still lying around — most likely the original
  // dict-derived placeholders (event-2026-*, insight-i1, …).
  const realTestimonialIds = groups
    .find((g) => g.label === "testimonials")
    ?.docs.map((d) => d._id) ?? [];
  const realEventIds = buildEvents().map((d) => d._id);
  const realInsightIds = buildInsights().map((d) => d._id);

  const strayTestimonials = await client.fetch<{ _id: string; author?: { en?: string } }[]>(
    `*[_type == "testimonial" && !(_id in $ids)]{ _id, author }`,
    { ids: realTestimonialIds }
  );
  const strayEvents = await client.fetch<{ _id: string; title?: { en?: string } }[]>(
    `*[_type == "event" && !(_id in $ids)]{ _id, title }`,
    { ids: realEventIds }
  );
  const strayInsights = await client.fetch<{ _id: string; title?: { en?: string } }[]>(
    `*[_type == "insight" && !(_id in $ids)]{ _id, title }`,
    { ids: realInsightIds }
  );

  if (strayTestimonials.length || strayEvents.length || strayInsights.length) {
    console.log(
      "\n⚠  Placeholder docs still in the dataset (delete in the studio if no longer needed):"
    );
    for (const s of strayTestimonials) {
      console.log(
        `   - testimonial ${s._id.padEnd(38)} "${(s.author?.en ?? "").slice(0, 60)}"`
      );
    }
    for (const s of strayEvents) {
      console.log(
        `   - event   ${s._id.padEnd(42)} "${(s.title?.en ?? "").slice(0, 60)}"`
      );
    }
    for (const s of strayInsights) {
      console.log(
        `   - insight ${s._id.padEnd(42)} "${(s.title?.en ?? "").slice(0, 60)}"`
      );
    }
  }

  console.log(
    "\n✓ Done. Next steps:\n" +
      "  1. Restart the Sanity studio so it loads the updated schema.\n" +
      "  2. Open each new event and upload its hero image (Studio → Events).\n" +
      "  3. Open each new insight and upload its LinkedIn screenshot.\n" +
      "  4. Delete the placeholder docs surfaced above if you don't need them.\n"
  );
}

seed().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
