"use client";

import { useState } from "react";

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

/**
 * Share row for an /insights/[slug] page: a LinkedIn share-intent link plus
 * a "copy link" button. `url` must be the absolute canonical URL of the
 * page (built by the caller from SITE_URL).
 */
export function InsightShare({
  url,
  labels,
}: {
  url: string;
  labels: { share: string; copyLink: string; linkCopied: string };
}) {
  const [copied, setCopied] = useState(false);
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied (e.g. non-HTTPS context, some browser
      // policies) — leave the button as-is rather than claiming success.
    }
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-8">
      <span className="text-xs uppercase tracking-[0.3em] text-ink-dim">
        {labels.share}
      </span>
      <a
        href={linkedInHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition hover:border-cta/60 hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        <LinkedInIcon />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="text-sm text-ink-dim transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {copied ? labels.linkCopied : labels.copyLink}
      </button>
    </div>
  );
}
