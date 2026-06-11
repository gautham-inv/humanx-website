/**
 * Playbill mock of the HumanX Insights homepage.
 *
 * Concept: the site as the printed programme for an ongoing keynote tour.
 * Cream paper carries the editorial sections; the house lights go down to
 * dark indigo only for the stage moments (hero video, tour schedule,
 * colophon). All copy, people, events and assets are real — pulled from
 * the production homepage. Static, EN-only. The only client island is the
 * testimonial expander (./Notices).
 */

import { Notices } from "./Notices";

const NAV_LINKS = [
  { label: "About", href: "/en/about" },
  { label: "Services", href: "/en/services" },
  { label: "On stage", href: "/en/on-stage" },
  { label: "Events", href: "/en/events" },
  { label: "Insights", href: "/en/insights" },
  { label: "Publications", href: "/en/publications" },
];

const ACTS = [
  {
    numeral: "I",
    hue: "var(--amber)",
    title: "Strategic CX + EX Partner",
    body: "We help organizations drive customer and employee loyalty, by leveraging their purpose and mission whilst implementing a human experience strategy to serve as a roadmap in their improvements.",
  },
  {
    numeral: "II",
    hue: "var(--violet)",
    title: "Storytelling-Driven Data Insight Advisor",
    body: "We set your strategies up for success by ensuring your human experience programs are catalyzed by insight-driven narratives that provide clear and bespoke measures of success, along with the actionable diagnostic metrics.",
  },
  {
    numeral: "III",
    hue: "var(--magenta)",
    title: "Pragmatic Operational Practices",
    body: "We warrant that the Human Experience strategy delivers actionable programs by working side by side with operational leadership to deliver easy, engaging and simple playbooks that will boost your employee experience.",
  },
];

const CLIENTS = [
  "Coppel",
  "Kimberly-Clark",
  "Michael Page",
  "Numerator",
  "Dragonfruit",
  "AER",
  "MPG",
];

const PARTNERS = [
  "GOJI.mx",
  "HubEngage",
  "Innovin Labs",
  "OptiMobility",
  "Dragonfruit",
];

const EVENTS = [
  {
    date: "Jun 16 & 19",
    title: "HumanX Insights × Madrid Retail Safari",
    venue: "Madrid · Various locations",
    href: "/en/events/retail-safari-madrid-2026",
  },
  {
    date: "Jun 18",
    title: "HumanX Insights × ExpoRetail Iberoamerica",
    venue: "IFEMA, Madrid · 10:00",
    href: "/en/events/expo-retail-iberoamerica-2026",
  },
];

const NOTICES = [
  {
    excerpt:
      "The combination of a big fast brain, a caring heart and ability to listen is a unique combination in modern management.",
    full: "One of the best decision Walmart made as it expanded internationally was to harvest the best and brightest and bring them back to Bentonville. Ramon was one their best finds. An Oxford University education, a clear global awareness and gift for management — I was struck as I met him some 20 years ago of the elegance and grace at which both he projected and used in his leadership role. The combination of a big fast brain, a caring heart and ability to listen is a unique combination in modern management. Over the past twenty years he has built a remarkable record of both strategic thinking and hands-on accomplishment.",
    author: "Paco Underhill",
    org: "Founder of Envirosell Inc., global best-selling author",
    img: "/testimonials/paco-underhill.jpg",
    lang: "EN",
  },
  {
    excerpt:
      "Ramon is a visionary with a knack for uncovering trends and shaping strategy. His ability to distill complex data into clear recommendations is unparalleled.",
    full: "Ramon is a visionary with a knack for uncovering trends and shaping strategy. His ability to distill complex data into clear recommendations is unparalleled. He brings a passionate customer focus to every discussion, driving customer-led decisions. As a servant leader, he inspires teams to align with company's purpose and deliver impactful results through creative execution and ideas. Ramon excels in implementing metrics like NPS to enhance both customer and employee experience. His retail expertise, coupled with technological prowess, accelerates customer-focused strategies locally and globally.",
    author: "Allan Steinmetz",
    org: "CEO & Founder, Inward Strategic Consulting",
    img: "/testimonials/allan-steinmitz.jpeg",
    lang: "EN",
  },
  {
    excerpt:
      "Ramón es uno de los profesionales más brillantes que he conocido. Un verdadero líder y profesional destacado en el sector retail a nivel mundial.",
    full: "Ramón es uno de los profesionales más brillantes que he conocido. Un verdadero líder y profesional destacado en el Sector Retail a nivel mundial. No solo posee un conocimiento profundo y una experiencia vasta en todas las facetas del sector, sino que también se destaca por su visión de futuro excepcional. Su capacidad para anticipar las tendencias y adaptarse a las dinámicas cambiantes del mercado lo coloca en una posición única como estratega empresarial. Ramón va más allá de los aspectos comerciales; comprende que el sector retail es intrínsecamente humano. Su enfoque humanista centrado en las personas refleja su comprensión de que, en última instancia, se trata de crear momentos significativos para clientes y empleados.",
    author: "Laureano Turienzo",
    org: "CEO Retail News Trends · Círculo Iberoamericano de Retail",
    img: "/testimonials/laureano-turienzo.png",
    lang: "ES",
  },
  {
    excerpt:
      "An insight retail leader with unique expertise who translates insights to strategy, accelerating customer-focus strategies for higher engagement and revenue growth.",
    full: "I can best describe Ramon as an insight retail leader with unique expertise who translates insights to strategy, accelerating customer-focus strategies for higher engagement and revenue growth. I partnered with Ramon during two of my assignments at Walmart US. During my last tenure in Marketing, he provided our team with critical insights to drive our Financial Services business. Previously, as Head of Multicultural for Walmart, he became a key advisor in differentiating insights from the Hispanic customer that fed our multicultural strategy. His work included partnerships with key category brands (P&G, Coca-Cola, Frito Lay, L'Oreal) that yielded significant growth with the US Hispanic Retail segment.",
    author: "Carla Giovannetti Dodds",
    org: "Global Growth and Brand Strategist",
    img: "/testimonials/Carla-giovanni.png",
    lang: "EN",
  },
];

const FIELD_NOTES = [
  {
    no: "01",
    tag: "Field note",
    date: "Apr 2024",
    hue: "var(--amber)",
    title: "Oil-change industry: drive trust by taking care of customers",
  },
  {
    no: "02",
    tag: "Essay",
    date: "Nov 2023",
    hue: "var(--violet)",
    title:
      "Offers: sales bait or appreciation token? Reflections on Forbes Advisor's CX trends",
  },
  {
    no: "03",
    tag: "Framework",
    date: "Nov 2023",
    hue: "var(--magenta)",
    title: "Virtual or real agent? VIBA: humanizing AI by giving customers a choice",
  },
];

function CreditRoll({
  label,
  names,
  reverse = false,
}: {
  label: string;
  names: string[];
  reverse?: boolean;
}) {
  const run = [...names, ...names, ...names];
  return (
    <div className="border-y border-[var(--hairline)]">
      <div className="mx-auto flex max-w-[1320px] items-center px-6">
        <span className="pb-label flex-none border-r border-[var(--hairline)] py-5 pr-6 text-[var(--ink-soft)]">
          {label}
        </span>
        <div className="pb-marquee flex-1 py-5 pl-6">
          <div className={`pb-marquee-track gap-12 ${reverse ? "pb-reverse" : ""}`}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-12" aria-hidden={copy === 1}>
                {run.map((name, i) => (
                  <span key={i} className="flex items-center gap-12 whitespace-nowrap">
                    <span className="pb-mono text-sm font-medium uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                      {name}
                    </span>
                    <span className="text-[10px] text-[var(--amber)]">✳</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaybillMock() {
  return (
    <main>
      {/* ── Overture bar ───────────────────────────────────────── */}
      <div>
        <div className="mx-auto flex max-w-[1320px] items-baseline justify-between gap-6 overflow-hidden px-6 py-2.5">
          <p className="pb-label truncate text-[var(--ink-soft)]">
            <span className="mr-3 text-[var(--amber)]">Now booking</span>
            HumanX Insights × ExpoRetail Iberoamerica · IFEMA, Madrid · June 18, 2026
          </p>
          <a href="/en/events/expo-retail-iberoamerica-2026" className="pb-label flex-none text-[var(--amber)]">
            Details →
          </a>
        </div>
        <div className="pb-thread" />
      </div>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <header className="border-b border-[var(--hairline)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 py-4">
          <a href="/en" className="flex-none">
            <img src="/logo.webp" alt="HumanX Insights" width={676} height={250} className="h-9 w-auto" />
          </a>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="pb-label text-[var(--ink-soft)] transition-colors hover:text-[var(--amber)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <span className="pb-label hidden text-[var(--ink-soft)] sm:block">
              EN <span className="opacity-40">/ ES</span>
            </span>
            <a href="/en#contact" className="pb-btn">
              Book Ramon
            </a>
            <button type="button" className="pb-label text-[var(--ink)] lg:hidden">
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero: house lights down. Keeps the real keynote footage. ── */}
      <section className="on-stage relative isolate overflow-hidden">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-image.webp"
        >
          <source src="/videos/desktop.webm" type="video/webm" />
        </video>
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to top, var(--stage) 2%, rgba(12,10,22,0.86) 26%, rgba(12,10,22,0.58) 60%, rgba(12,10,22,0.65) 100%), linear-gradient(100deg, rgba(12,10,22,0.82) 0%, rgba(12,10,22,0.25) 65%)",
          }}
        />

        <div className="mx-auto flex min-h-[88dvh] max-w-[1320px] flex-col justify-end px-6 pb-16 pt-28">
          <p className="pb-label pb-rise text-[var(--amber-bright)]" style={{ animationDelay: "0.05s" }}>
            A CX &amp; EX consultancy for boards, executives &amp; operators
          </p>
          <h1
            className="pb-display pb-rise mt-6 max-w-[11ch] text-[clamp(3.2rem,7.2vw,6.8rem)] text-[var(--cream-on-stage)]"
            style={{ animationDelay: "0.15s" }}
          >
            Human <em className="pb-italic font-normal">experience</em> as the operating
            principle<span className="text-[var(--amber-bright)]">.</span>
          </h1>
          <p
            className="pb-body-lg pb-rise mt-7 max-w-[52ch] text-[var(--dim-on-stage)]"
            style={{ animationDelay: "0.28s" }}
          >
            Three decades across Meta, Walmart, Nielsen, and Sam&rsquo;s Club — distilled
            into a practice that ships strategy your team can run on Monday morning.
          </p>
          <div
            className="pb-rise mt-10 flex flex-wrap items-center gap-7"
            style={{ animationDelay: "0.4s" }}
          >
            <a href="/en#contact" className="pb-btn pb-btn-stage">
              Book Ramon for 2026
            </a>
            <a href="#programme" className="pb-link text-[var(--cream-on-stage)]">
              See the programme ↓
            </a>
          </div>

          <div
            className="pb-rise mt-16 flex flex-wrap items-baseline justify-between gap-4 border-t border-[var(--hairline-stage)] pt-5"
            style={{ animationDelay: "0.55s" }}
          >
            <p className="pb-label text-[var(--dim-on-stage)]">
              Meta · Walmart · Nielsen · Sam&rsquo;s Club
            </p>
            <p className="pb-label text-[var(--dim-on-stage)]">
              Madrid · 2026 season <span className="mx-2 text-[var(--amber-bright)]">—</span> EN / ES
            </p>
          </div>
        </div>
      </section>

      {/* ── The programme: three acts, hanging numerals ─────────── */}
      <section id="programme" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-3">
              <p className="pb-margin-label pb-label text-[var(--ink-soft)]">The programme</p>
            </div>
            <div className="md:col-span-8">
              <h2 className="pb-display text-[clamp(2.2rem,4.2vw,3.6rem)]">
                How we drive loyalty <em className="pb-italic font-normal">and</em> growth.
              </h2>
              <p className="pb-body-lg mt-6 max-w-[58ch] text-[var(--ink-soft)]">
                Three disciplines, one through-line: human experience as the operating
                principle — made operational from the boardroom to the front line.
              </p>
            </div>
          </div>

          <div className="mt-20 grid gap-x-12 gap-y-16 md:grid-cols-3">
            {ACTS.map((act, i) => (
              <div
                key={act.numeral}
                className={`flex flex-col ${
                  i === 1 ? "md:mt-14" : i === 2 ? "md:mt-28" : ""
                }`}
              >
                <span className="h-[3px] w-12" style={{ background: act.hue }} />
                <p className="pb-label mt-7 text-[var(--ink-soft)]">Act</p>
                <span
                  className="pb-display mt-1 text-7xl leading-none"
                  style={{ color: act.hue, fontStyle: "italic" }}
                >
                  {act.numeral}
                </span>
                <h3 className="pb-display mt-8 text-2xl">{act.title}</h3>
                <p className="mt-4 leading-relaxed text-[var(--ink-soft)]">{act.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Led by Ramon: brand first, founder as the headliner ─── */}
      <section className="overflow-hidden px-6 pb-24 md:pb-32">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <div className="absolute -left-3 -top-3 h-full w-full border border-[var(--amber)]" aria-hidden />
            <img
              src="/person.webp"
              alt="Ramon Portilla, founder of HumanX Insights, seated on a studio stool"
              width={1086}
              height={724}
              className="relative w-full object-cover grayscale"
            />
            <p className="pb-label mt-4 text-[var(--ink-soft)]">
              Fig. 1 — The founder, between keynotes.
            </p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="pb-margin-label pb-label text-[var(--ink-soft)]">Led by</p>
            <h2 className="pb-display mt-5 text-[clamp(2.2rem,4vw,3.4rem)]">Ramon Portilla.</h2>
            <p className="pb-body-lg mt-6 max-w-[52ch] text-[var(--ink-soft)]">
              Founder of HumanX Insights. Over three decades at Meta, Walmart, Nielsen and
              Sam&rsquo;s Club, he&rsquo;s turned the way customers and employees feel into
              lasting loyalty and growth — on the world&rsquo;s biggest stages and inside
              its biggest retailers.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--hairline)] pt-8">
              {[
                { n: "35+", l: "Years of experience", hue: "var(--amber)" },
                { n: "3", l: "Continents", hue: "var(--violet)" },
                { n: "5+", l: "Global brands led", hue: "var(--magenta)" },
              ].map((s) => (
                <div key={s.l}>
                  <dd className="pb-display text-4xl md:text-5xl" style={{ color: s.hue }}>
                    {s.n}
                  </dd>
                  <dt className="pb-label mt-2 text-[var(--ink-soft)]">{s.l}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-7">
              <a href="/en/on-stage" className="pb-link text-[var(--ink)]">
                Watch him on stage →
              </a>
              <a
                href="https://www.linkedin.com/"
                className="pb-link text-[var(--ink-soft)]"
              >
                Connect on LinkedIn →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Clients credit roll ──────────────────────────────────── */}
      <CreditRoll label="Clients" names={CLIENTS} />

      {/* ── Recognition + headline pull quote ───────────────────── */}
      <section className="bg-[var(--paper-elev)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-wrap items-center gap-5">
            <img
              src="/badge.webp"
              alt="RETHINK Retail Top Retail Experts 2026 badge"
              width={580}
              height={612}
              className="h-16 w-auto"
            />
            <p className="pb-label text-[var(--ink-soft)]">
              Rethink Retail — Top Retail Experts · 2026
            </p>
          </div>
          <blockquote className="mt-12">
            <p className="pb-italic text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.25] text-[var(--ink)]">
              &ldquo;The passion of the Hispanic and LatinX community is an untapped and
              most of times undeciphered talent asset for most companies.&rdquo;
            </p>
            <footer className="pb-label mt-9 text-[var(--ink-soft)]">
              — Ramon Portilla, founder, HumanX Insights
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── On stage 2026: the tour schedule, lights down ────────── */}
      <section className="on-stage pb-spotlight px-6 py-24 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="pb-margin-label pb-label text-[var(--amber-bright)]">
                On stage — 2026 programme
              </p>
              <h2 className="pb-display mt-5 text-[clamp(2.2rem,4vw,3.4rem)] text-[var(--cream-on-stage)]">
                Where to catch us next.
              </h2>
            </div>
            <a href="/en/events" className="pb-link text-[var(--cream-on-stage)]">
              View all events →
            </a>
          </div>

          <div className="mt-14">
            {EVENTS.map((e) => (
              <a key={e.href} href={e.href} className="pb-row group">
                <span className="pb-mono text-sm font-semibold uppercase tracking-[0.14em] text-[var(--amber-bright)]">
                  {e.date}
                </span>
                <span className="pb-display text-xl text-[var(--cream-on-stage)] md:text-2xl">
                  {e.title}
                </span>
                <span className="pb-label self-center text-[var(--dim-on-stage)]">{e.venue}</span>
                <span className="pb-label self-center text-[var(--cream-on-stage)] md:text-right">
                  Reserve <span className="pb-row-arrow text-[var(--amber-bright)]">→</span>
                </span>
              </a>
            ))}
          </div>

          <p className="pb-label mt-8 text-[var(--dim-on-stage)]">
            Madrid, Spain — June 2026 · Keynotes, retail safaris &amp; masterclasses
          </p>
        </div>
      </section>

      {/* ── Notices: edited excerpts, not walls of text ──────────── */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-3">
              <p className="pb-margin-label pb-label text-[var(--ink-soft)]">Notices</p>
            </div>
            <div className="md:col-span-8">
              <h2 className="pb-display text-[clamp(2.2rem,4vw,3.4rem)]">
                What the industry says<span className="text-[var(--amber)]">.</span>
              </h2>
            </div>
          </div>

          <Notices items={NOTICES} />

          <p className="pb-label mt-14 text-[var(--ink-soft)]">
            Excerpts from public LinkedIn recommendations — expand any card to read it in full.
          </p>
        </div>
      </section>

      {/* ── Field notes: typographic covers, no gradient blobs ───── */}
      <section className="border-t border-[var(--hairline)] px-6 py-24 md:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="pb-margin-label pb-label text-[var(--ink-soft)]">Field notes</p>
              <h2 className="pb-display mt-5 text-[clamp(2.2rem,4vw,3.4rem)]">
                Notes from the field.
              </h2>
            </div>
            <a href="/en/insights" className="pb-link text-[var(--ink)]">
              All insights →
            </a>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {FIELD_NOTES.map((f, i) => (
              <a
                key={f.no}
                href="/en/insights"
                className={`pb-cover ${i === 1 ? "md:translate-y-6" : ""}`}
                style={{ "--cover-hue": f.hue } as React.CSSProperties}
              >
                <div className="flex items-baseline justify-between">
                  <span className="pb-display text-5xl" style={{ color: f.hue }}>
                    №{f.no}
                  </span>
                  <span className="pb-label text-[var(--ink-soft)]">
                    {f.tag} · {f.date}
                  </span>
                </div>
                <h3 className="pb-display mt-8 min-h-[5.5rem] text-xl leading-snug">
                  {f.title}
                </h3>
                <div className="pb-cover-rule" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners credit roll (distinct from clients) ─────────── */}
      <CreditRoll label="Partners" names={PARTNERS} reverse />

      {/* ── Reserve: contact ─────────────────────────────────────── */}
      <section id="contact" className="px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="pb-margin-label pb-label text-[var(--ink-soft)]">Let&rsquo;s talk</p>
            <h2 className="pb-display mt-5 text-[clamp(2.2rem,4vw,3.4rem)]">
              Want HumanX Insights as your{" "}
              <em className="pb-italic font-normal">partner?</em>
            </h2>
            <p className="pb-body-lg mt-6 max-w-[46ch] text-[var(--ink-soft)]">
              One inbox for speaking, consulting, partnerships and workshops. Tell us the
              moment — we promise to get back to you within a couple of days.
            </p>
            <p className="pb-label mt-10 text-[var(--ink-soft)]">
              Speaking · Consulting · Workshops · Partnerships
            </p>
          </div>

          <form
            className="border border-[var(--hairline)] bg-[var(--paper-elev)] p-8 md:col-span-6 md:col-start-7 md:p-10"
            action="#"
          >
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="pb-field">
                <label htmlFor="pb-name" className="pb-label text-[var(--ink-soft)]">
                  Name *
                </label>
                <input id="pb-name" name="name" type="text" placeholder="Your name" />
              </div>
              <div className="pb-field">
                <label htmlFor="pb-email" className="pb-label text-[var(--ink-soft)]">
                  Email *
                </label>
                <input id="pb-email" name="email" type="email" placeholder="you@company.com" />
              </div>
            </div>
            <div className="pb-field mt-8">
              <label htmlFor="pb-about" className="pb-label text-[var(--ink-soft)]">
                What&rsquo;s this about? *
              </label>
              <select id="pb-about" name="about" defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                <option>Speaking</option>
                <option>Consulting</option>
                <option>Workshop</option>
                <option>Partnership</option>
              </select>
            </div>
            <div className="pb-field mt-8">
              <label htmlFor="pb-msg" className="pb-label text-[var(--ink-soft)]">
                A sentence or two *
              </label>
              <textarea
                id="pb-msg"
                name="message"
                rows={4}
                placeholder="Challenge, problem, audience, date, scope, bottleneck. Whatever fits."
              />
            </div>
            <button type="button" className="pb-btn mt-10">
              Send →
            </button>
          </form>
        </div>
      </section>

      {/* ── Colophon: the back cover ─────────────────────────────── */}
      <footer className="on-stage">
        <div className="pb-thread" />
        <div className="mx-auto max-w-[1320px] px-6 pb-10 pt-16">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <img src="/logo-dark.webp" alt="HumanX Insights" width={548} height={211} className="h-10 w-auto" />
              <p className="pb-italic mt-6 text-xl text-[var(--dim-on-stage)]">
                Human experience as the operating principle.
              </p>
              <p className="pb-label mt-8 text-[var(--amber-bright)]">
                Don&rsquo;t forget — #BeKindToday
              </p>
            </div>
            <div className="md:col-span-3 md:col-start-7">
              <p className="pb-label text-[var(--dim-on-stage)]">Explore</p>
              <ul className="mt-5 space-y-3">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="pb-mono text-sm text-[var(--cream-on-stage)] transition-colors hover:text-[var(--amber-bright)]"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-3">
              <p className="pb-label text-[var(--dim-on-stage)]">Connect</p>
              <ul className="mt-5 space-y-3">
                {["LinkedIn", "YouTube", "X", "Instagram"].map((s) => (
                  <li key={s}>
                    <a
                      href="#"
                      className="pb-mono text-sm text-[var(--cream-on-stage)] transition-colors hover:text-[var(--amber-bright)]"
                    >
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="pb-label mt-8 text-[var(--dim-on-stage)]">
                <a href="/en/privacy" className="hover:text-[var(--amber-bright)]">
                  Privacy policy
                </a>
              </p>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-baseline justify-between gap-4 border-t border-[var(--hairline-stage)] pt-6">
            <p className="pb-label text-[var(--dim-on-stage)]">
              © 2026 HumanX Insights · All rights reserved
            </p>
            <p className="pb-label text-[var(--dim-on-stage)]">— fin —</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
