import type { Metadata } from "next";
import { PresentationCTA } from "./PresentationCTA";

export const metadata: Metadata = {
  title: "El punto ciego del Retail · HumanX Insights",
  description:
    "Ponencia magistral sobre la importancia y el valor de la tecnología en espacios físicos. HumanX Insights × ExpoRetail Iberoamérica. IFEMA, Madrid, 18 de junio de 2026.",
  openGraph: {
    title: "El punto ciego del Retail — HumanX Insights",
    description:
      "Conferencia magistral · IFEMA, Madrid · 18 de junio de 2026 · 10:00",
    type: "website",
  },
};

export default function ExpoRetailMadridPage() {
  return (
    <main>
      <style>{`
        @keyframes enter {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .er-e {
          opacity: 0;
          animation: enter 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .er-d0 { animation-delay: 0.05s; }
        .er-d1 { animation-delay: 0.18s; }
        .er-d2 { animation-delay: 0.30s; }
        .er-d3 { animation-delay: 0.42s; }
        .er-d4 { animation-delay: 0.54s; }
        .er-d5 { animation-delay: 0.66s; }
        .er-d6 { animation-delay: 0.78s; }
        .er-d7 { animation-delay: 0.90s; }

        .er-cobrand {
          font-family: var(--font-sans);
          font-size: 0.625rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--color-ink-dim);
          white-space: nowrap;
        }
        @media (max-width: 420px) {
          .er-cobrand { font-size: 0.5rem; letter-spacing: 0.08em; }
        }
        .er-site-link { transition: color 0.2s; }
        .er-site-link:hover { color: var(--color-accent-bright); }
      `}</style>

      {/* ─── HERO ── full viewport ─────────────────────────────── */}
      <section
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(1.5rem, 5vw, 3rem)",
          borderBottom: "1px solid var(--color-line)",
        }}
      >
        {/* Co-brand strip */}
        <div
          className="er-e er-d0"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "1.25rem",
            borderBottom: "1px solid var(--color-line)",
            gap: "1rem",
          }}
        >
          <span className="er-cobrand">HumanX Insights</span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--color-accent)",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </span>
          <span className="er-cobrand" style={{ textAlign: "right" }}>
            ExpoRetail Iberoamérica
          </span>
        </div>

        {/* Title block */}
        <div
          style={{
            paddingTop: "clamp(2rem, 5vh, 4rem)",
            paddingBottom: "clamp(2rem, 5vh, 4rem)",
          }}
        >
          <p
            className="er-e er-d1"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.625rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              marginBottom: "clamp(1.75rem, 4vh, 3rem)",
            }}
          >
            Gracias por asistir · 18 de Junio 2026
          </p>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.25rem, 13vw, 9rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            <span className="er-e er-d2" style={{ display: "block", fontWeight: 700 }}>
              El punto
            </span>
            <span className="er-e er-d3" style={{ display: "block", fontWeight: 700 }}>
              ciego
            </span>
            <span
              className="er-e er-d4"
              style={{
                display: "block",
                fontWeight: 300,
                color: "var(--color-ink-dim)",
                marginTop: "0.06em",
              }}
            >
              del Retail.
            </span>
          </h1>

          <p
            className="er-e er-d5"
            style={{
              marginTop: "clamp(1.5rem, 3.5vh, 2.5rem)",
              fontFamily: "var(--font-highlight)",
              fontStyle: "italic",
              fontSize: "clamp(1rem, 2.8vw, 1.5rem)",
              color: "var(--color-ink-dim)",
              opacity: 0.65,
              lineHeight: 1.35,
            }}
          >
            "The blind spot of Retail"
          </p>
        </div>

        {/* Venue + date strip */}
        <div
          className="er-e er-d6"
          style={{
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--color-line)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.625rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-ink-dim)",
              lineHeight: 1.6,
            }}
          >
            IFEMA · Madrid, España
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.625rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-ink-dim)",
              textAlign: "right",
              lineHeight: 1.6,
            }}
          >
            Jueves, 18 de junio de 2026
          </p>
        </div>
      </section>

      {/* ─── CONCEPT ──────────────────────────────────────────── */}
      <section
        style={{
          padding:
            "clamp(4rem, 10vh, 7rem) clamp(1.5rem, 5vw, 3rem) clamp(4rem, 10vh, 6rem)",
          maxWidth: "64ch",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.625rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            marginBottom: "2.25rem",
          }}
        >
          Conferencia magistral
        </p>

        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.125rem, 2.4vw, 1.35rem)",
            lineHeight: 1.85,
            color: "var(--color-ink)",
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}
        >
          Hoy compartimos con la gran audiencia de la 1a gran Expo Retail
          Iberoamérica nuestra vision de la Experiencia Humana enfocada en la
          mejora de la experiencia de clients y empleados en la tienda física.
        </p>

        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.125rem, 2.4vw, 1.35rem)",
            lineHeight: 1.85,
            color: "var(--color-ink-dim)",
            marginBottom: "2.5rem",
          }}
        >
          Concretamente, expusimos como el uso de la tecnología inteligente
          aplicada a la infraestructura de las cámaras de video puede usarse
          productivamente para ayudar a nuestros empleados a dar una major
          experiencia al cliente y con ello incrementar ventas, reducer costos,
          y multiplicar lealtad.
        </p>

        {/* Presentation request */}
        <div
          style={{
            borderTop: "1px solid var(--color-line)",
            paddingTop: "2.25rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1rem, 2.2vw, 1.2rem)",
              lineHeight: 1.75,
              color: "var(--color-ink-dim)",
              marginBottom: "1.5rem",
            }}
          >
            Si quieres copia de nuestra presentación, porfavor comparte tus
            datos y la recibirás inmediatamente.
          </p>
          <PresentationCTA />
        </div>
      </section>
    </main>
  );
}
