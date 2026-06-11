"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { DownloadPromoItem } from "@/lib/sanity/loaders";
import { isDownloadConfigured } from "@/lib/hubspot";
import { triggerDownload } from "@/lib/download";
import { getLenis } from "@/lib/lenis";
import { PdfGateModal } from "./PdfGateModal";

type DownloadPromoProps = {
  dict: Dictionary;
  /** The single promoted publication, or null when the promo is off. */
  promo: DownloadPromoItem | null;
};

/** Wait this long after landing before surfacing the promo. */
const PROMO_DELAY_MS = 30_000;
/** Session flag — set the first time the promo opens so it shows once only. */
const SEEN_KEY = "hx_promo_seen";

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

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

/**
 * Timed download promotion. ~30s after a visitor lands, a centered modal
 * promotes the single publication flagged in the `downloadPromo` Sanity
 * singleton. Dismissible (X / backdrop / Esc) and shown at most once per
 * browser session. Clicking download reuses the shared PdfGateModal
 * (email → HubSpot → download); if the gate isn't configured, the file
 * downloads immediately.
 *
 * Renders nothing when no publication is promoted, when the visitor arrived via
 * a conference share link (?paper=…, which ConferencePush already handles), or
 * once the promo has been seen this session.
 */
export function DownloadPromo({ dict, promo }: DownloadPromoProps) {
  const t = dict.downloadPromo;
  // "hidden" → nothing on screen; "promo" → the promo card; "gate" → email gate.
  const [phase, setPhase] = useState<"hidden" | "promo" | "gate">("hidden");

  useEffect(() => {
    if (!promo) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    // Defer to ConferencePush when the page is opened via a tagged share link
    // so the two never stack a double modal on the visitor.
    if (new URLSearchParams(window.location.search).get("paper")) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setPhase("promo");
    }, PROMO_DELAY_MS);
    return () => clearTimeout(timer);
  }, [promo]);

  if (!promo) return null;

  function handleDownload() {
    if (!promo) return;
    if (isDownloadConfigured()) {
      setPhase("gate");
    } else {
      triggerDownload(promo.file);
      setPhase("hidden");
    }
  }

  if (phase === "gate") {
    return (
      <PdfGateModal
        dict={dict}
        publication={{ id: promo.id, title: promo.title, file: promo.file }}
        onClose={() => setPhase("hidden")}
      />
    );
  }

  if (phase === "promo") {
    return (
      <PromoCard
        promo={promo}
        heading={promo.heading || t.heading}
        body={promo.body || t.body}
        ctaLabel={promo.ctaLabel || t.cta}
        closeLabel={t.close}
        onDownload={handleDownload}
        onClose={() => setPhase("hidden")}
      />
    );
  }

  return null;
}

type PromoCardProps = {
  promo: DownloadPromoItem;
  heading: string;
  body: string;
  ctaLabel: string;
  closeLabel: string;
  onDownload: () => void;
  onClose: () => void;
};

/**
 * The promo dialog itself. Mirrors PdfGateModal's portal + scroll-lock so it
 * sits centered and sticky over a frozen page (escaping LocaleFade's
 * transformed ancestor), but carries promo copy and a download CTA instead of
 * the email form.
 */
function PromoCard({
  promo,
  heading,
  body,
  ctaLabel,
  closeLabel,
  onDownload,
  onClose,
}: PromoCardProps) {
  const headingId = useId();
  const downloadRef = useRef<HTMLButtonElement | null>(null);

  // Freeze the page behind the dialog (pause Lenis + hard-lock body overflow).
  useEffect(() => {
    const stopLenis = () => getLenis()?.stop();
    stopLenis();
    const raf = requestAnimationFrame(stopLenis);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      getLenis()?.start();
    };
  }, []);

  // Focus the primary action on open; Escape dismisses. `preventScroll` keeps
  // the page from jumping to chase focus.
  useEffect(() => {
    downloadRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof window === "undefined") return null;

  const meta = [promo.kind, promo.date].filter(Boolean).join(" · ");

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-[var(--radius-card)] border border-line bg-bg-elev p-8 shadow-2xl">
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-dim transition hover:bg-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <CloseIcon />
        </button>

        <p id={headingId} className="pr-8 font-display text-2xl tracking-tight text-ink">
          {heading}
        </p>
        {meta ? (
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-accent">
            {meta}
          </p>
        ) : null}
        <p className="mt-1 font-display text-lg leading-snug text-ink">
          {promo.title}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">{body}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-ink-dim transition hover:text-ink"
          >
            {closeLabel}
          </button>
          <button
            ref={downloadRef}
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-medium text-on-accent shadow-glow transition hover:bg-cta-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
          >
            {ctaLabel}
            <DownloadIcon />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
