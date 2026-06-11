"use client";

import { useState } from "react";

/**
 * Testimonial cards with inline read-full expansion. No modal, no layout
 * swap: the curated excerpt collapses as the full recommendation grows in,
 * via a grid-rows height crossfade (see .pb-quote in mock.css). The card
 * grows in place; content below shifts down monotonically. Keeps the exact
 * Playbill treatment — amber left rule, avatar, mono name, lang tag.
 */

export type Notice = {
  excerpt: string;
  full: string;
  author: string;
  org: string;
  img: string;
  lang: string;
};

function NoticeCard({ n, offset }: { n: Notice; offset: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <figure className={`flex max-w-[34rem] flex-col ${offset ? "md:mt-10" : ""}`}>
      <blockquote
        className="pb-quote border-l-2 pl-6"
        style={{ borderColor: "var(--amber)" }}
        data-open={open}
      >
        <div className="pb-quote-pane">
          <div className="pb-quote-inner">
            <p className="pb-body-lg font-[450] italic leading-relaxed text-[var(--ink)]">
              &ldquo;{n.excerpt}&rdquo;
            </p>
          </div>
        </div>
        <div className="pb-quote-pane pb-quote-full">
          <div className="pb-quote-inner">
            <p className="pb-body-lg font-[450] italic leading-relaxed text-[var(--ink)]">
              &ldquo;{n.full}&rdquo;
            </p>
          </div>
        </div>
      </blockquote>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="pb-quote-toggle mt-5 self-start pl-6 text-[var(--amber)]"
      >
        {open ? "Show less ←" : "Read full →"}
      </button>

      <figcaption className="mt-6 flex items-center gap-4 pl-6">
        <img
          src={n.img}
          alt={n.author}
          width={88}
          height={88}
          className="h-11 w-11 rounded-lg object-cover grayscale"
        />
        <div>
          <p className="pb-mono text-sm font-semibold">{n.author}</p>
          <p className="pb-label mt-1 text-[var(--ink-soft)]">{n.org}</p>
        </div>
        <span className="pb-label ml-auto text-[var(--ink-soft)] opacity-60">{n.lang}</span>
      </figcaption>
    </figure>
  );
}

export function Notices({ items }: { items: Notice[] }) {
  return (
    <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
      {items.map((n, i) => (
        <NoticeCard key={n.author} n={n} offset={i % 2 === 1} />
      ))}
    </div>
  );
}
