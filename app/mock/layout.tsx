import type { Metadata } from "next";
import { Fraunces, Literata, Spline_Sans_Mono } from "next/font/google";
import "../globals.css";
import "./mock.css";

/**
 * Playbill mock — a second root layout (no layout.tsx above app/mock/), so
 * this page gets its own <html> shell: no Nav, no Lenis, no background
 * audio, no theme system. Production chrome is untouched.
 */

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Playbill mock · HumanX Insights",
  description: "Design exploration — not a public page.",
  robots: { index: false, follow: false },
};

export default function MockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${literata.variable} ${splineMono.variable}`}
    >
      <body className="playbill">{children}</body>
    </html>
  );
}
