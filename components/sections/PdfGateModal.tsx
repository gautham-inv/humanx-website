"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { submitGatedDownload } from "@/lib/hubspot";
import { triggerDownload } from "@/lib/download";
import { getLenis } from "@/lib/lenis";

/** Minimal shape the gate needs to render + download a paper. */
export type GatePublication = { id: string; title: string; file: string };

type PdfGateModalProps = {
  dict: Dictionary;
  /** The paper to gate + download. */
  publication: GatePublication;
  /** Dismiss the modal. */
  onClose: () => void;
  /** Called after a successful email submit + download starts. */
  onSubmitted?: () => void;
};

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

/**
 * Email-gated PDF download modal. Collects an email (POSTed to the HubSpot
 * download form via submitGatedDownload), then triggers the download. Shared by
 * the /publications list (GatedPublications) and the homepage conference push
 * (ConferencePush) so the gate behaves identically everywhere.
 */
export function PdfGateModal({
  dict,
  publication,
  onClose,
  onSubmitted,
}: PdfGateModalProps) {
  const t = dict.pdfGate;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const headingId = useId();

  // Lock background scroll while the gate is open so the dialog stays put
  // (sticky) over a frozen page rather than letting the content drift behind
  // the blurred backdrop. Pause Lenis (the smooth-scroll engine) and hard-lock
  // body overflow as a fallback. When the gate auto-opens from a ?paper= link,
  // Lenis may finish initialising a tick later, so re-issue stop() on the next
  // frame (and once more shortly after) to win that race.
  useEffect(() => {
    const stopLenis = () => getLenis()?.stop();
    stopLenis();
    const raf = requestAnimationFrame(stopLenis);
    const timer = setTimeout(stopLenis, 60);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      getLenis()?.start();
    };
  }, []);

  // Focus the email field on open; Escape dismisses. `preventScroll` stops the
  // browser from scrolling the page to chase the focused input (which would
  // otherwise drag the page off the hero on auto-open).
  useEffect(() => {
    emailRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email.includes("@") || !consent) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitGatedDownload({ email });
      triggerDownload(publication.file);
      onSubmitted?.();
      onClose();
    } catch {
      setError(t.error);
      setSubmitting(false);
    }
  }

  // Portal to <body> so the dialog escapes the page's transformed ancestors
  // (LocaleFade wraps children in a GSAP-animated div whose residual transform
  // would otherwise make `position: fixed` resolve against that div instead of
  // the viewport — leaving the panel centered far down the document). Rendered
  // on <body>, `fixed inset-0` is truly viewport-anchored, so the gate stays
  // centered and sticky over a frozen page.
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label={t.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-[var(--radius-card)] border border-line bg-bg-elev p-8 shadow-2xl">
        <p id={headingId} className="font-display text-2xl tracking-tight text-ink">
          {t.heading}
        </p>
        <p className="mt-1 text-sm text-accent">{publication.title}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">{t.body}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <input
            ref={emailRef}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            className="w-full rounded-full border border-line bg-bg px-5 py-3 text-ink placeholder:text-ink-dim focus-visible:border-accent focus-visible:outline-none"
          />
          <label className="mt-4 flex items-start gap-3 text-sm text-ink-dim">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[var(--color-accent)]"
            />
            <span>{t.consent}</span>
          </label>

          {error ? (
            <p role="alert" className="mt-3 text-sm text-magenta">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-ink-dim transition hover:text-ink"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || !consent || !email.includes("@")}
              aria-busy={submitting || undefined}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent shadow-glow transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t.sending : t.submit}
              {!submitting ? <DownloadIcon /> : null}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
