"use client";

import { useContactModal } from "./ContactModalProvider";

type Variant = "primary" | "secondary";

export function ContactCTAButton({
  label,
  variant = "primary",
  className = "",
}: {
  label: string;
  variant?: Variant;
  className?: string;
}) {
  const { open } = useContactModal();

  const base =
    "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2";
  const styles =
    variant === "primary"
      ? "bg-accent text-on-accent hover:bg-accent-bright focus-visible:outline-accent-bright"
      : "border border-line text-ink hover:border-ink focus-visible:outline-ink";

  return (
    <button type="button" onClick={open} className={`${base} ${styles} ${className}`}>
      {label}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
