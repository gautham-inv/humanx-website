"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Detect user language client-side
    const userLang = typeof navigator !== "undefined" ? navigator.language || "" : "";
    if (userLang.toLowerCase().startsWith("es")) {
      router.replace("/es");
    } else {
      router.replace("/en");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
        Loading...
      </div>
    </main>
  );
}
