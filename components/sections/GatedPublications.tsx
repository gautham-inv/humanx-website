"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { submitGatedDownload, isDownloadConfigured } from "@/lib/hubspot";

type PublicationItem = {
  id: string;
  title: string;
  kind: string;
  date: string;
  file: string;
};

type GatedPublicationsProps = {
  dict: Dictionary;
  items: readonly PublicationItem[];
  downloadLabel: string;
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

function triggerDownload(file: string) {
  const a = document.createElement("a");
  a.href = file;
  a.download = "";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Publications list with an email gate. Clicking a paper opens a modal that
 * collects the visitor's email (POSTed to a dedicated HubSpot form) before the
 * PDF downloads. One successful submit unlocks every paper for the rest of the
 * session, so repeat clicks download immediately.
 *
 * If the HubSpot download form isn't configured yet
 * (NEXT_PUBLIC_HUBSPOT_DOWNLOAD_FORM_GUID unset), the gate is bypassed and the
 * papers download directly — the site keeps working before HubSpot is wired.
 */
export function GatedPublications({
  dict,
  items,
  downloadLabel,
}: GatedPublicationsProps) {
  const t = dict.pdfGate;
  const gateActive = isDownloadConfigured();

  const [unlocked, setUnlocked] = useState(false);
  const [selected, setSelected] = useState<PublicationItem | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const headingId = useId();

  // Close the modal on Escape and focus the email field when it opens.
  useEffect(() => {
    if (!selected) return;
    emailRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  function closeModal() {
    setSelected(null);
    setError(null);
    setSubmitting(false);
  }

  function handleItemClick(item: PublicationItem) {
    // No gate (HubSpot not wired) or already unlocked → download straight away.
    if (!gateActive || unlocked) {
      triggerDownload(item.file);
      return;
    }
    setSelected(item);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !selected) return;
    if (!email.includes("@") || !consent) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitGatedDownload({ email });
      setUnlocked(true);
      const file = selected.file;
      closeModal();
      triggerDownload(file);
    } catch {
      setError(t.error);
      setSubmitting(false);
    }
  }

  return (
    <>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleItemClick(item)}
              className="group flex w-full flex-col gap-1 py-6 text-left transition-colors hover:bg-bg-elev/60 focus-visible:bg-bg-elev focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex-row md:items-center md:justify-between md:gap-8"
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
                {downloadLabel}
                <DownloadIcon />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
        >
          <button
            type="button"
            aria-label={t.close}
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-[var(--radius-card)] border border-line bg-bg-elev p-8 shadow-2xl">
            <p id={headingId} className="font-display text-2xl tracking-tight text-ink">
              {t.heading}
            </p>
            <p className="mt-1 text-sm text-accent">{selected.title}</p>
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
                  onClick={closeModal}
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
        </div>
      ) : null}
    </>
  );
}
