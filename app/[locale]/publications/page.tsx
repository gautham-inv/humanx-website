import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Reveal } from "@/components/motion/Reveal";

const SLUG = "publications";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Publications · HumanX",
    alternates: {
      canonical: `/${locale}/${SLUG}`,
      languages: {
        en: `/en/${SLUG}`,
        es: `/es/${SLUG}`,
        "x-default": `/en/${SLUG}`,
      },
    },
  };
}

export default async function PublicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const t = dict.publications;

  return (
    <main id="main">
      <section className="relative px-6 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {t.eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight max-w-3xl">
              {t.title}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-ink-dim">{t.body}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-16 md:py-24 border-t border-line">
        <div className="mx-auto max-w-4xl">
          <Reveal direction="up">
            <h2 className="font-display text-2xl text-ink-dim uppercase tracking-[0.3em]">
              {t.listTitle}
            </h2>
          </Reveal>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {t.items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.file}
                  download
                  className="group flex flex-col gap-1 py-6 transition-colors hover:bg-bg-elev/60 focus-visible:bg-bg-elev focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex-row md:items-center md:justify-between md:gap-8"
                >
                  <div className="px-2">
                    <div className="text-xs uppercase tracking-widest text-accent">
                      {item.kind} · {item.date}
                    </div>
                    <h3 className="mt-2 font-display text-xl text-ink md:text-2xl">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-2 text-sm text-ink-dim transition-colors group-hover:text-ink">
                    {t.download}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 3v12" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

    </main>
  );
}
