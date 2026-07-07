import Link from "next/link";

/**
 * Two static "where to go next" links on the insight detail page:
 * publications and events. Both link to their listing pages rather than a
 * specific item — insights aren't linked to a specific publication or
 * event by any schema field, so guessing "the relevant one" would be
 * arbitrary.
 */
export function InsightCtaRow({
  locale,
  labels,
}: {
  locale: string;
  labels: { explorePublications: string; seeEvents: string };
}) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link
        href={`/${locale}/publications`}
        className="rounded-2xl border border-line px-6 py-5 text-sm font-medium text-ink transition hover:border-cta/60 hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {labels.explorePublications} →
      </Link>
      <Link
        href={`/${locale}/events`}
        className="rounded-2xl border border-line px-6 py-5 text-sm font-medium text-ink transition hover:border-cta/60 hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {labels.seeEvents} →
      </Link>
    </div>
  );
}
