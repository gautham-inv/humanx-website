import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Reveal } from "@/components/motion/Reveal";
import { pageMetadata } from "@/lib/seo/metadata";

const SLUG = "privacy";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: `/${SLUG}`,
    title: "Privacy · HumanX Insights",
    description:
      "How HumanX Insights collects, uses, and protects your personal data.",
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  // We don't have privacy-specific copy in the dictionary yet — this is a stub.
  // Once finalised, move strings into dict.privacy.* and reference them here.
  const isEs = locale === "es";
  const t = isEs ? PRIVACY_COPY.es : PRIVACY_COPY.en;
  void (await getDictionary(locale as Locale));

  return (
    <main id="main" className="px-6 py-14 md:py-24 lg:py-32">
      <article className="mx-auto max-w-3xl">
        <Reveal direction="up">
          <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
            <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
            {t.eyebrow}
          </div>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-tight">
            {t.title}
          </h1>
        </Reveal>
        <Reveal direction="up" delay={0.1}>
          <p className="mt-6 text-sm text-ink-dim">{t.lastUpdated}</p>
        </Reveal>

        <div className="prose-section mt-12 space-y-10">
          {t.sections.map((section) => (
            <Reveal key={section.heading} direction="up">
              <section>
                <h2 className="font-display text-2xl text-ink md:text-3xl">{section.heading}</h2>
                <p className="mt-4 leading-relaxed text-ink-dim">{section.body}</p>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal direction="up">
          <p className="mt-16 border-t border-line pt-8 text-sm text-ink-dim">
            {t.contactLine}{" "}
            <a
              href="mailto:contact@humanxinsights.com"
              className="text-accent hover:text-accent-bright"
            >
              contact@humanxinsights.com
            </a>
            .
          </p>
        </Reveal>
      </article>
    </main>
  );
}

const PRIVACY_COPY = {
  en: {
    eyebrow: "Legal",
    title: "Privacy policy",
    lastUpdated: "Last updated May 2026",
    sections: [
      {
        heading: "What we collect",
        body: "When you contact us through the form on this website we collect the information you provide: your name, email address, the topic of your enquiry, and the message you write. We do not use cookies or third-party analytics for behavioural tracking on this site.",
      },
      {
        heading: "How we use it",
        body: "We use the information you give us only to reply to your enquiry and to follow up on the engagement you described. We do not sell, share, or pass your data to third parties for marketing.",
      },
      {
        heading: "How long we keep it",
        body: "Form submissions are retained while a conversation is active and for a reasonable period afterwards in case you re-engage. You can ask us to delete your data at any time.",
      },
      {
        heading: "Your rights",
        body: "You can ask us to confirm what data we hold about you, correct anything inaccurate, or delete it entirely. We will respond within a reasonable timeframe.",
      },
    ],
    contactLine: "Questions about this policy? Write to",
  },
  es: {
    eyebrow: "Legal",
    title: "Política de privacidad",
    lastUpdated: "Última actualización: mayo de 2026",
    sections: [
      {
        heading: "Qué recopilamos",
        body: "Cuando nos contactas a través del formulario de este sitio recopilamos la información que nos proporcionas: tu nombre, correo electrónico, el tema de tu consulta y el mensaje que escribes. No usamos cookies ni analítica de terceros para seguimiento de comportamiento en este sitio.",
      },
      {
        heading: "Cómo lo usamos",
        body: "Usamos la información que nos das únicamente para responder a tu consulta y dar seguimiento al compromiso que describiste. No vendemos, compartimos ni pasamos tus datos a terceros con fines de marketing.",
      },
      {
        heading: "Cuánto tiempo lo conservamos",
        body: "Las consultas se conservan mientras la conversación esté activa y durante un periodo razonable posterior por si retomas el contacto. Puedes pedirnos eliminar tus datos en cualquier momento.",
      },
      {
        heading: "Tus derechos",
        body: "Puedes pedirnos confirmar qué datos tenemos sobre ti, corregir cualquier inexactitud o eliminarlos por completo. Responderemos en un plazo razonable.",
      },
    ],
    contactLine: "¿Preguntas sobre esta política? Escribe a",
  },
} as const;
