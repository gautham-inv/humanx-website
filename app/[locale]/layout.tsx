import type { Metadata } from "next";
import { Geologica, Literata, DM_Serif_Display } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ContactModalProvider } from "@/components/layout/ContactModalProvider";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LocaleFade } from "@/components/motion/LocaleFade";
import { loadContactCta, loadFooter } from "@/lib/sanity/loaders";
import "../globals.css";

const geologica = Geologica({
  subsets: ["latin"],
  variable: "--font-geologica",
  display: "swap",
  axes: ["SHRP", "slnt"],
});

/**
 * Literata carries voice on the editorial moments only: testimonial blockquotes
 * and the manifesto-class prose on /about (hero body, mission, values intro,
 * ramon biography). Geologica still owns structure (headings, UI, body of
 * cards). Variable opsz + italic load once, scope is bounded by the .font-serif
 * Tailwind utility that resolves to --font-literata.
 */
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

/**
 * DM Serif Display drives heading emphasis — the one or two italic-accent
 * words inside an H1 that carry the brand promise (Litmus7-style standout).
 * Display-serif italic with dramatic stroke contrast; clearly different from
 * Literata's quieter book italic. Exposed via --font-highlight + a Tailwind
 * font-highlight utility for ergonomic use inside JSX.
 */
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-highlight",
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
});

const SITE_URL = "https://humanxinsights.com";

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
    metadataBase: new URL(SITE_URL),
    title: "HumanX · Human experience as the operating principle",
    description: "Ramon's work on human-centered AI.",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: `/en`,
        es: `/es`,
        "x-default": `/en`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  // Locale-level chrome: dict + contactCta + footer fetched in parallel at
  // build time. ContactCta drives the modal opened from anywhere on the
  // site; footer drives copy + social links in every page footer.
  const [dict, contactCta, footerContent] = await Promise.all([
    getDictionary(locale as Locale),
    loadContactCta(locale as Locale),
    loadFooter(locale as Locale),
  ]);

  return (
    <html
      lang={locale}
      className={`${geologica.variable} ${literata.variable} ${dmSerifDisplay.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-ink">
        {/* Theme init — beforeInteractive runs /theme-init.js synchronously
            before React hydrates, setting <html data-theme> from
            localStorage or OS preference so CSS-var overrides resolve
            before first paint (prevents FOUC). Using a static asset src
            here (instead of an inline script body) keeps React 19 happy. */}
        <Script
          id="theme-init"
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
        {/* HubSpot tracking script intentionally NOT loaded — GA4 covers
            site analytics, and the Forms Submissions API in lib/hubspot.ts
            populates the CRM directly without needing HubSpot's tracker
            on the page. If you ever want anonymous-visit attribution
            (browsing history merged into each contact's CRM timeline),
            add the <Script src="https://js-na2.hs-scripts.com/{portalId}.js"
            strategy="afterInteractive" /> back here. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <ThemeSync />
        <ContactModalProvider dict={dict} content={contactCta}>
          <SmoothScroll>
            <Nav locale={locale as Locale} dict={dict} />
            <LocaleFade locale={locale}>{children}</LocaleFade>
            <Footer
              dict={dict}
              locale={locale as Locale}
              content={footerContent}
            />
          </SmoothScroll>
        </ContactModalProvider>
      </body>
    </html>
  );
}
