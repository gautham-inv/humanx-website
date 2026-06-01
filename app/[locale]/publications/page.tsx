import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadPublicationsPage, loadPublications } from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { GatedPublications } from "@/components/sections/GatedPublications";
import { pageMetadata } from "@/lib/seo/metadata";

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
  return pageMetadata({
    locale,
    path: `/${SLUG}`,
    title: "Publications · HumanX",
    description:
      "Published writing, research and features from HumanX on customer and employee experience, AI, and human-centered strategy for leaders.",
  });
}

export default async function PublicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const [dict, publicationsPage, publications] = await Promise.all([
    getDictionary(locale as Locale),
    loadPublicationsPage(locale as Locale),
    loadPublications(locale as Locale),
  ]);
  const t = dict.publications;
  const eyebrow = publicationsPage?.eyebrow ?? t.eyebrow;
  const title = publicationsPage?.title ?? t.title;
  const body = publicationsPage?.body ?? t.body;
  const listTitle = publicationsPage?.listTitle ?? t.listTitle;
  const downloadLabel = publicationsPage?.downloadLabel ?? t.download;
  // Sanity-managed publications when present; dict items as fallback so the
  // page is never empty on a fresh dataset.
  const items = publications.length > 0 ? publications : t.items;

  return (
    <main id="main">
      <section className="relative px-6 pt-14 pb-8 md:pt-24 md:pb-14 lg:pt-32 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight max-w-3xl">
              {title}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-ink-dim">{body}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-10 md:py-16 lg:py-24 border-t border-line">
        <div className="mx-auto max-w-4xl">
          <Reveal direction="up">
            <h2 className="font-display text-2xl text-ink-dim uppercase tracking-[0.3em]">
              {listTitle}
            </h2>
          </Reveal>
          <GatedPublications
            dict={dict}
            items={items}
            downloadLabel={downloadLabel}
          />
        </div>
      </section>
    </main>
  );
}
