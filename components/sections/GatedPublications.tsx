"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { isDownloadConfigured } from "@/lib/hubspot";
import { triggerDownload } from "@/lib/download";
import { PdfGateModal, type GatePublication } from "./PdfGateModal";

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

/**
 * Publications list with an email gate. Clicking a paper opens the shared
 * PdfGateModal (email -> HubSpot -> download). One successful submit unlocks
 * every paper for the rest of the session, so repeat clicks download
 * immediately. If the HubSpot download form isn't configured, the gate is
 * bypassed and papers download directly.
 */
export function GatedPublications({
  dict,
  items,
  downloadLabel,
}: GatedPublicationsProps) {
  const gateActive = isDownloadConfigured();
  const [unlocked, setUnlocked] = useState(false);
  const [selected, setSelected] = useState<GatePublication | null>(null);

  function handleItemClick(item: PublicationItem) {
    // No gate (HubSpot not wired) or already unlocked → download straight away.
    if (!gateActive || unlocked) {
      triggerDownload(item.file);
      return;
    }
    setSelected({ id: item.id, title: item.title, file: item.file });
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
        <PdfGateModal
          dict={dict}
          publication={selected}
          onClose={() => setSelected(null)}
          onSubmitted={() => setUnlocked(true)}
        />
      ) : null}
    </>
  );
}
