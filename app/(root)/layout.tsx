import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "HumanX",
  description: "Redirecting…",
};

export default function RootRedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-[#f5f5f7]">{children}</body>
    </html>
  );
}
