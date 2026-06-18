"use client";

import { useState } from "react";
import { PdfGateModal } from "@/components/sections/PdfGateModal";
import { es } from "@/lib/i18n/dictionaries/es";

const PRESENTATION = {
  id: "exporetail-madrid-2026",
  title: "El punto ciego del Retail — ExpoRetail Iberoamérica 2026",
  file: "/downloads/exporetail-madrid-2026.pdf",
};

export function PresentationCTA() {
  const [gateOpen, setGateOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setGateOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          borderRadius: "9999px",
          background: "var(--color-cta)",
          color: "var(--color-on-accent)",
          padding: "0.75rem 1.75rem",
          fontSize: "0.875rem",
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
          boxShadow: "var(--shadow-glow)",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "var(--color-cta-bright)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "var(--color-cta)")
        }
      >
        Solicitar presentación →
      </button>
      {gateOpen && (
        <PdfGateModal
          dict={es}
          publication={PRESENTATION}
          onClose={() => setGateOpen(false)}
          onSubmitted={() => {
            window.gtag?.("event", "generate_lead", {
              form_id: "presentation_request",
              publication_id: PRESENTATION.id,
            });
          }}
        />
      )}
    </>
  );
}
