import Link from "next/link";
import Image from "next/image";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { FooterContent } from "@/lib/sanity/loaders";

type FooterNavKey = "about" | "services" | "events" | "insights" | "publications";
const NAV_ITEMS: FooterNavKey[] = ["about", "services", "events", "insights", "publications"];

type FooterProps = {
  dict: Dictionary;
  locale: Locale;
  /** Sanity-resolved footer content. Each leaf falls back to dict. */
  content?: FooterContent | null;
};

export function Footer({ dict, locale, content }: FooterProps) {
  const t = dict.footer;
  const brandTagline = content?.brandTagline ?? t.brandTagline;
  const kindToday = content?.kindToday ?? t.kindToday;
  const exploreHeading = content?.exploreHeading ?? t.exploreHeading;
  const connectHeading = content?.connectHeading ?? t.connectHeading;
  const privacyTitle = content?.privacyTitle ?? t.privacyTitle;
  const privacyLinkLabel = content?.privacyLinkLabel ?? t.privacyLinkLabel;
  const rights = content?.rights ?? t.rights;
  const social = {
    linkedin: content?.social?.linkedin ?? t.social.linkedin,
    youtube: content?.social?.youtube ?? t.social.youtube,
    twitter: content?.social?.twitter ?? t.social.twitter,
    instagram: content?.social?.instagram ?? t.social.instagram,
  };

  return (
    <footer className="relative border-t border-line bg-bg-elev/30 px-6 pt-16 pb-8 text-sm text-ink-dim">
      <div className="mx-auto max-w-6xl">
        {/* Top: 4-col grid (brand | explore | connect | privacy). Stacks on mobile. */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand + tagline + kindness tag */}
          <div className="space-y-4">
            <Link
              href={`/${locale}`}
              aria-label="HumanX Insights home"
              className="inline-block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {/* Theme-swapped wordmark — same dual-image pattern as the
                  nav. Both render; CSS `display` swap (.brand-logo-dark /
                  .brand-logo-light in globals.css) picks the variant for
                  the active theme. Dark variant bumped one size step to
                  offset its extra internal padding (see Nav for detail). */}
              <Image
                src="/logo-dark.webp"
                alt="HumanX Insights"
                width={548}
                height={211}
                className="brand-logo-dark h-12 w-auto"
              />
              <Image
                src="/logo.webp"
                alt="HumanX Insights"
                width={676}
                height={250}
                className="brand-logo-light h-11 w-auto"
              />
            </Link>
            <p className="max-w-xs leading-relaxed">{brandTagline}</p>
            <p className="pt-2 font-display text-sm uppercase tracking-[0.2em] text-accent">
              {kindToday}
            </p>
          </div>

          {/* Explore */}
          <nav aria-label={exploreHeading}>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
              {exploreHeading}
            </h3>
            <ul className="space-y-2.5">
              {NAV_ITEMS.map((key) => (
                <li key={key}>
                  <Link
                    href={`/${locale}/${key}`}
                    className="transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect With Us — social icons */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
              {connectHeading}
            </h3>
            <ul className="flex flex-wrap gap-3">
              <li>
                <SocialLink href={social.linkedin} label="LinkedIn">
                  <LinkedInIcon />
                </SocialLink>
              </li>
              <li>
                <SocialLink href={social.youtube} label="YouTube">
                  <YouTubeIcon />
                </SocialLink>
              </li>
              <li>
                <SocialLink href={social.twitter} label="X (Twitter)">
                  <XIcon />
                </SocialLink>
              </li>
              <li>
                <SocialLink href={social.instagram} label="Instagram">
                  <InstagramIcon />
                </SocialLink>
              </li>
            </ul>
          </div>

          {/* Privacy */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-dim">
              {privacyTitle}
            </p>
            <Link
              href={`/${locale}/privacy`}
              className="mt-2 inline-block text-sm text-ink-dim underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
            >
              {privacyLinkLabel}
            </Link>
          </div>
        </div>

        {/* Bottom row: copyright */}
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs sm:flex-row sm:items-center">
          <span>{rights}</span>
          <span className="max-w-md leading-relaxed sm:text-right">
            Music: &quot;Way To Dream&quot; by Keys Of Moon (CC BY 3.0)
          </span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-cta hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </a>
  );
}

// ----- icons -----

// LinkedInIcon now lives in components/icons/LinkedInIcon.tsx (shared with the
// On Stage teaser's "Connect" button).

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
