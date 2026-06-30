export const en = {
  seo: {
    // Homepage <title>/description. Localized per dictionary so /es no longer
    // inherits the English title from the locale layout's generateMetadata.
    home: {
      title: "HumanX Insights · Human experience as the operating principle",
      description:
        "CX & EX consultancy for boards and executives — turning three decades across Meta, Walmart and Nielsen into human-experience strategy your team can run on Monday.",
    },
  },
  nav: {
    about: "About",
    services: "Services",
    events: "Events",
    "on-stage": "On stage",
    insights: "Insights",
    publications: "Publications",
    menu: "Menu",
    close: "Close",
  },
  summit: {
    label: "Live",
    text: "Ramon keynoting the HumanX Summit, Madrid, October 2026",
    cta: "Details",
  },
  hero: {
    eyebrow: "HumanX Insights",
    headline: ["Human", "experience", "as", "the", "operating", "principle."],
    clarifier: "A CX and EX consultancy for boards, executives, and operators.",
    sub: "Three decades across Meta, Walmart, Nielsen, and Sam's Club — distilled into a practice that ships strategy your team can run on Monday morning.",
    portraitAlt: "Ramon Portilla, founder of HumanX Insights, in conversation.",
    primary: "Get in touch",
    secondary: "What we do",
    bottom: {
      headline: "Built on science. Focused on you.",
      items: [
        {
          title: "Personalized care",
          body: "A program built entirely around your biology and goals.",
        },
        {
          title: "Science-driven results",
          body: "Proven methods to restore energy, strength, and focus.",
        },
        {
          title: "Confidential support",
          body: "A dedicated team that's always within reach.",
        },
      ],
    },
  },
  ramon: {
    eyebrow: "Founder",
    title: "Ramon Portilla, founder, speaker, advisor.",
    body: "High-impact speaker and CX/EX practitioner with 35+ years of insights and analytics leadership across the United States, Latin America, and Europe. Past roles include Meta, Walmart, Nielsen, Sam's Club and ARS Group. Today he leads HumanX Insights, helping organizations redefine their relationships with customers and employees through a methodology grounded in four values: empathy, gratitude, trust, and care.",
    stats: [
      { value: "35+", label: "Years of experience" },
      { value: "3", label: "Continents" },
      { value: "5+", label: "Global brands led" },
    ],
  },
  assessment: {
    eyebrow: "Diagnostic",
    title: "How human is your CX strategy?",
    body: "Take the diagnostic and get a personalised report in your inbox. A score on where you stand, and the moves most worth making next.",
    cta: "Take the assessment",
    featured: {
      id: "cx-maturity",
      title: "CX Maturity Diagnostic",
      description: "A short self-assessment for CX, EX, and operations leaders. You get a personalised report mailed straight to you.",
      durationLabel: "~8 minutes",
      questionsLabel: "12 questions",
      url: "https://www.surveymonkey.com/r/55RWCHM",
    },
  },
  ai: {
    title: "Ask the HumanX assistant",
    placeholder: "What should I know about Ramon's keynote?",
    cta: "Ask",
    suggestions: [
      "Book Ramon for an event",
      "Summarize the manifesto",
      "Show me the Caixa Bank talk",
    ],
  },
  clientsTicker: {
    eyebrow: "Trusted by",
    heading: "Trusted by",
    // Client brand names live in Sanity (the `client` document type). This
    // fallback stays empty so the homepage clients strip only renders once
    // real clients are seeded — no placeholder brands ever ship.
    items: [] as string[],
  },
  partnersTicker: {
    eyebrow: "In good company",
    heading: "Our partners",
    items: [
      "Goji",
      "HubEngage",
      "Innovinlabs",
      "Mobileinsight",
      "Optimobility",
      "Sab Marketing",
      "Covisian",
      "FWD Advisors",
    ],
  },
  testimonials: {
    eyebrow: "Voices",
    heading: "What boards and stages say",
    prev: "Previous testimonial",
    next: "Next testimonial",
    items: [
      {
        id: "t1",
        quote:
          "Ramon does the rare thing. He turns AI from a slide into a system the team can actually run on Monday.",
        author: "VP, Customer Experience",
        org: "Top-5 European Bank",
      },
      {
        id: "t2",
        quote:
          "He cut through six months of internal debate in a single workshop. Then the production rollout shipped on schedule.",
        author: "Chief Operating Officer",
        org: "Telecom Operator",
      },
      {
        id: "t3",
        quote:
          "The most useful keynote we've hosted. Practical, honest about trade-offs, no AI hype.",
        author: "Programme Director",
        org: "Industry Summit",
      },
    ],
  },
  events: {
    eyebrow: "Calendar",
    title: "Upcoming events",
    viewAll: "View all events",
    noUpcoming: "No upcoming events announced yet. Check back soon.",
    pageTitle: "Events",
    pageBody: "Every stage Ramon takes: upcoming dates and the full archive of past keynotes.",
    upcomingHeading: "Upcoming",
    pastHeading: "Past keynotes",
    noPast: "No past events on record yet.",
    bookEyebrow: "On stage",
    bookTitle: "Book Ramon for your stage",
    bookBody: "Conferences, corporate summits, exec offsites, awards nights. A tailored 30–60 minute keynote, rehearsed against your audience profile.",
    bookCta: "Plan the keynote",
    items: [
      { id: "ev-humanx-summit", title: "HumanX Summit Madrid", venue: "Palacio de Cibeles", date: "October 2026", startsAt: "2026-10-08T09:00:00Z", youtubeId: "" },
      { id: "ev-cx-forum-lisbon", title: "Customer Experience Forum", venue: "Lisbon Marriott", date: "September 2026", startsAt: "2026-09-17T09:00:00Z", youtubeId: "" },
      { id: "ev-leaders-bcn", title: "AI for Leaders Roundtable", venue: "IESE Barcelona", date: "July 2026", startsAt: "2026-07-02T09:00:00Z", youtubeId: "" },
      { id: "ev-caixa", title: "The Human Layer", venue: "Caixa Bank Forum", date: "March 2026", startsAt: "2026-03-15T09:00:00Z", youtubeId: "dQw4w9WgXcQ" },
      { id: "ev-pacifico", title: "Returning Time to People", venue: "Pacífico Summit", date: "November 2025", startsAt: "2025-11-15T09:00:00Z", youtubeId: "dQw4w9WgXcQ" },
    ],
  },
  onStage: {
    eyebrow: "Stage",
    title: "On stage",
    body: "Recent keynotes, in full.",
    note: "Recorded talks, full takes",
    // Homepage teaser → links to /on-stage
    credentials: "Founder · CX & EX Advisor · Keynote Speaker · Author",
    name: "Ramon Portilla",
    teaserBody:
      "Over three decades at Meta, Walmart, Nielsen and Sam's Club, he's turned the way customers and employees feel into lasting loyalty and growth.",
    cta: "Watch me on stage",
    connect: "Connect on LinkedIn",
    // Default for the "Connect" button; overridable from Sanity (homepage On
    // Stage section, then About founder). Same profile used across the site.
    linkedinUrl: "https://www.linkedin.com/in/ramon-portilla-627b064/",
  },
  // Full /on-stage page. The speaking map + region list reuse `about.speaking`.
  onStagePage: {
    eyebrow: "On stage",
    title: "Every stage, <<every talk>>",
    body: "Hundreds of leaders in the room, across three continents. Watch the keynotes in full, and see where Ramon has taken the stage.",
    videosTitle: "Recorded keynotes",
    conferencesTitle: "Major conferences",
    conferencesBody: "The summits and congresses where Ramon has shared the HumanX Insights perspective.",
    areasTitle: "Areas of expertise",
    areasItems: [
      { iconKey: "cx", label: "Customer Experience" },
      { iconKey: "ex", label: "Employee Experience" },
      { iconKey: "human-experience", label: "Human Experience Strategy" },
      { iconKey: "retail", label: "Retail Strategy" },
      { iconKey: "data", label: "Data & Insight Storytelling" },
      { iconKey: "leadership", label: "Leadership & Talent" },
    ],
    speakingExpEyebrow: "Global speaking experience",
    speakingExpTitle: "Stages across three continents",
    speakingExpBody:
      "Ramon has delivered keynotes and led forums for retailers, banks, business schools, and trade institutions across North America, Europe, and Latin America — turning human-experience strategy into ideas audiences apply the next day.",
    cta: {
      eyebrow: "Work with HumanX Insights",
      title: "Bring Ramon to your stage",
      body: "Keynotes, consulting, workshops, and partnerships. One inbox for all of it — tell us what you're planning and we'll reply within two working days.",
      label: "Start a conversation",
    },
  },
  // PLACEHOLDER COPY — replace `badge.name`/`badge.note` with Ramon's
  // actual recognition wording. The stats are pulled from his real bio.
  credentials: {
    eyebrow: "Recognition",
    title: "A globally recognized voice in retail & human experience",
    body: "A recognized voice in customer and employee experience — on the world's biggest stages and trusted by global brands across retail and banking.",
    badge: {
      name: "Top Retailer 50",
      note: "Recognized among the world's most influential retail minds.",
    },
  },
  // PLACEHOLDER QUOTE — synthesized from Ramon's stated values (empathy,
  // gratitude, trust, care) + the hero promise. Replace with his own words.
  pullQuote: {
    quote:
      "Treat the human experience as your operating principle, and loyalty stops being a target — it becomes the natural result of empathy, gratitude, trust, and care.",
    author: "Ramon Portilla",
    role: "Founder, HumanX Insights",
    imageAlt: "Ramon Portilla on stage",
  },
  // Email gate for the Publications PDFs. Clicking a paper opens a modal that
  // collects the visitor's email (into a dedicated HubSpot form) before the
  // download unlocks. One email unlocks every paper for the session.
  pdfGate: {
    heading: "Download this paper",
    body: "Enter your email to unlock the download — and we'll send you new papers as Ramon ships them.",
    emailPlaceholder: "you@company.com",
    consent: "I agree to receive emails from Ramon Portilla. Unsubscribe anytime.",
    submit: "Unlock the download",
    sending: "Unlocking…",
    error: "Something went wrong. Please try again.",
    cancel: "Cancel",
    close: "Close",
    reopen: "Get Ramon's paper",
  },
  values: {
    title: "Our Values",
    body: "We recognise the overarching importance of humanity in all we do. Our four values are deeply rooted in this belief: empathy to connect and succeed together; gratitude always to customers and employees; trust through data-driven objectivity; and caring to ensure thoughtful and considerate impactful decision-making.",
    items: [
      { title: "Empathy", body: "To connect and succeed together." },
      { title: "Gratitude", body: "Always to customers and employees." },
      { title: "Trust", body: "Through data-driven objectivity." },
      { title: "Caring", body: "To ensure thoughtful and considerate impactful decision-making." },
    ],
  },
  about: {
    eyebrow: "About",
    title: "About HumanX Insights",
    missionTitle: "Our Mission",
    missionBody: "To accelerate customer and employee loyalty for purpose-driven companies by designing and implementing a human experience strategy, uniquely tailored from their own mission and purpose.",
    visionTitle: "Our Vision",
    visionBody: "A world where every organisation treats customer and employee experience as a single discipline, measured by the hours returned to people, not the dashboards delivered to leadership.",
    experienceTitle: "Our Experience",
    experienceBody: "Over 30 years of insights and analytics expertise across retail, social media and various industries. Leader in utilizing and synthesizing enormous databases for decision-making, pioneering CX/EX strategies, with proven business results. Storyteller, public speaker, community leader, and mentor.",

    pageEyebrow: "About",
    pageTitle: "<<Why>> HumanX Insights exists",
    pageBody: "We accelerate customer and employee loyalty for purpose-driven companies, through a human experience strategy designed around their own mission and purpose.",
    primaryCta: "Start a conversation",

    missionImageAlt: "Ramon in conversation",
    experienceStatValue: "30+",
    experienceStatLabel: "Years of insights & analytics expertise",
    experienceStatNote: "Pioneering loyalty, retail insight-driven narratives, and CX/EX frameworks with proven results.",
    founderEyebrow: "Founder",

    sectionNav: {
      mission: "Mission",
      values: "Values",
      experience: "Experience",
      founder: "Founder",
    },

    // Featured-insight video on the About page (mirrors the video block on
    // peer speaker sites). Default points to Ramon's Pacífico interview on
    // leadership values; swap `youtubeId` for any of his talks.
    featuredVideo: {
      eyebrow: "Featured insight",
      title: "Ramon on the human experience",
      body: "A short conversation on how human-centered strategy turns customer and employee experience into loyalty and growth.",
      youtubeId: "C4hOP-oZbp0",
      blogUrl:
        "https://www.startupdials.com/blog/from-walmart-to-your-startup-insider-customer-research-tactics-for-startup?utm_source=chatgpt.com",
      blogLabel:
        "From Walmart to Your Startup: Insider Customer Research Tactics for Startup",
    },

    // Speaking list seeded from Ramon's real recent engagements (the same
    // ones in the events dataset). Add more in Studio → About → Global
    // Speaking as the portfolio grows.
    speaking: {
      title: "Where Ramon takes the stage",
      body: "Keynotes and forums across three continents — for retailers, banks, business schools, and trade institutions.",
      regions: [
        {
          region: "North America",
          entries: [
            { name: "Grand Retail Show", location: "Chantilly, VA, USA", date: "May 2025" },
            { name: "The Empowerment Forum — Serve 2 Perform", location: "Bentonville, AR, USA", date: "Oct 2025" },
            { name: "Women in International Trade (OWIT)", location: "Webinar", date: "Aug 2024" },
            { name: "ESOMAR · MRII · CRIC", location: "Webinar", date: "Jul 2024" },
          ],
        },
        {
          region: "Europe",
          entries: [
            { name: "ExpoRetail Iberoamérica", location: "Madrid, Spain", date: "Jun 2026" },
            { name: "Caixa Bank Consumer & Payments", location: "Madrid, Spain", date: "Oct 2024" },
            { name: "Asociación Española de Retail — Horizons", location: "Madrid, Spain", date: "Jun 2024" },
          ],
        },
        {
          region: "Latin America",
          entries: [
            { name: "Summit CX", location: "Lima, Peru", date: "Oct 2025" },
            { name: "Pacífico Business School — Intl. Retail Forum", location: "Lima, Peru", date: "Oct 2024" },
            { name: "Góndola Conference", location: "Cartagena, Colombia", date: "Nov 2023" },
          ],
        },
      ],
    },

    // LinkedIn recommendations wall (below the Featured Video on /about).
    // Items come from Sanity (`recommendation` docs) with the bundled
    // RECOMMENDATIONS list as fallback; only this header copy is localized.
    recommendations: {
      eyebrow: "In their words",
      title: "What colleagues say about Ramon",
      body: "Endorsements from the leaders Ramon has built teams with and reported to — at Walmart, Sam's Club, ARS, and beyond.",
      showAll: "Show all {count} recommendations",
      showLess: "Show fewer",
      readMore: "Read more",
      readLess: "Read less",
    },
  },
  whoWeAre: {
    eyebrow: "Who we are",
    title: "How we drive loyalty and growth",
    lead: "Three disciplines, one through-line: human experience as the operating principle. We partner with leadership teams to make it operational from the boardroom to the front line.",
    cta: "Get in touch",
    stepsHeading: "How it works",
    items: [
      {
        title: "Strategic CX + EX Partner",
        body: "We help organizations drive customer and employee loyalty, by leveraging their purpose and mission whilst implementing a human experience strategy to serve as a roadmap in their improvements.",
      },
      {
        title: "Storytelling-Driven Data Insight Advisor",
        body: "We set your strategies up for success by ensuring your human experience programs are catalyzed by insight-driven narratives that provide clear and bespoke measures of success, along with the actionable diagnostic metrics.",
      },
      {
        title: "Pragmatic Operational Practices",
        body: "We warrant that the Human Experience strategy delivers actionable programs by working side by side with operational leadership to deliver easy, engaging and simple playbooks that will boost your employee experience.",
      },
    ],
  },
  cta: {
    eyebrow: "Let's talk",
    title: "Want to work with HumanX Insights?",
    body: "One inbox for speaking, consulting, partnerships and workshops. Tell us the moment and we reply within two working days.",
    openModalLabel: "Get in touch",
    modalTitle: "Open a conversation",
    modalClose: "Close",
    topicLabel: "What's this about?",
    topicOptions: [
      "Consulting engagement",
      "Speaking / keynote",
      "Workshop / training",
      "Partnership",
      "Press / media",
      "Other",
    ],
    messageLabel: "A sentence or two",
    messagePlaceholder: "Audience, date, scope, bottleneck. Whatever fits.",
    submit: "Send",
  },
  footer: {
    rights: "© 2026 HumanX Insights. All rights reserved.",
    brandTagline: "Human experience as the operating principle.",
    exploreHeading: "Explore",
    connectHeading: "Connect with us",
    contactHeading: "Get in touch",
    contactEmail: "contact@humanxinsights.com",
    privacyTitle: "Your privacy is important",
    privacyLinkLabel: "Privacy policy",
    kindToday: "Don't forget, #BeKindToday",
    social: {
      linkedin: "https://www.linkedin.com/company/humanx-insights",
      youtube: "https://www.youtube.com/@humanxinsights",
      twitter: "https://twitter.com/humanxinsights",
      instagram: "https://www.instagram.com/humanxinsights",
    },
  },
  forms: {
    name: "Name",
    email: "Email",
    company: "Company",
    required: "Required",
    invalidEmail: "Please enter a valid email",
    comingSoon: "Coming soon",
    submit: "Send",
    selectPlaceholder: "Select…",
    sending: "Sending…",
    successEyebrow: "Thank you",
    successTitle: "We'll be in touch",
    successBody: "Your message has landed in our inbox. Ramon or someone on the team will reply within two working days.",
    successReset: "Send another",
    submitError: "Something went wrong sending your message. Please try again, or write to",
  },
  insights: {
    eyebrow: "Insights",
    title: "Notes from the field",
    body: "Short writes, talks, and data points pulled from active engagements. New entries land roughly every other week.",
    listTitle: "Latest",
    linkedinLabel: "Follow Ramon on LinkedIn",
    linkedinUrl: "https://www.linkedin.com/in/ramon-portilla-627b064/",
    items: [
      {
        id: "i1",
        title: "AI rollouts that stick",
        kind: "Field note",
        date: "May 2026",
        href: "#i1",
        image: "",
      },
      {
        id: "i2",
        title: "Measuring time returned, not tickets closed",
        kind: "Framework",
        date: "April 2026",
        href: "#i2",
        image: "",
      },
      {
        id: "i3",
        title: "What boards actually decide on AI",
        kind: "Talk",
        date: "March 2026",
        href: "#i3",
        image: "",
      },
      {
        id: "i4",
        title: "Customer experience at population scale",
        kind: "Case study",
        date: "February 2026",
        href: "#i4",
        image: "",
      },
      {
        id: "i5",
        title: "The human layer, revisited",
        kind: "Essay",
        date: "January 2026",
        href: "#i5",
        image: "",
      },
      {
        id: "i6",
        title: "Hispanic retail, the next ten years",
        kind: "Field note",
        date: "December 2025",
        href: "#i6",
        image: "",
      },
    ],
    read: "Read",
  },
  services: {
    eyebrow: "What we do",
    title: "Six practices, <<one>> through-line.",
    body: "Human experience as the operating principle, scoped to your team's specific moment.",
    items: [
      {
        id: "purpose",
        title: "Purpose and Mission Workshops",
        body: "We facilitate leadership interaction to unveil ways to define corporate purpose as the #1 step to become a Human Experience centered organization.",
      },
      {
        id: "cx-assessment",
        title: "State of CX Strategy Assessment",
        body: "We assess and diagnose the current state of your CX and EX strategy through interviews with key and operational stakeholders. We help organizations select strategic suppliers for Customer Experience platforms (SaaS).",
      },
      {
        id: "journeys",
        title: "Customer and Employee Journeys",
        body: "We map your key customer and employee journeys through a validated touchpoint approach methodology, which allows you to quantify and prioritise touchpoints based on actionability and impact.",
      },
      {
        id: "analytics",
        title: "Insights & Analytics Projects",
        body: "We design, execute and deliver cost-effective customer and employee experience insights and analytic projects, answering key strategic questions with 100% actionable recommendations.",
      },
      {
        id: "hispanic",
        title: "Hispanic – Ibero America Retail Advisor",
        body: "We help you understand the opportunities in the Hispanic market in the US, alongside the opportunities Ibero America retailers have to drive a differentiating Human Experience strategy.",
      },
      {
        id: "speaking",
        title: "Public Speaking Engagements",
        body: "We inspire audiences to think differently about business and careers by delivering engaging stories and facts that challenge the status quo and promote new ways of winning.",
      },
    ],
  },
  publications: {
    eyebrow: "Publications",
    title: "Field notes from the human layer",
    body: "Working papers, essays, and decision memos, published as Ramon ships them. Leave your email once and every download unlocks.",
    listTitle: "Recent",
    items: [
      {
        id: "p1",
        title: "The Human Layer, a working paper",
        kind: "Working paper",
        date: "April 2026",
        file: "/pdfs/the-human-layer.pdf",
      },
      {
        id: "p2",
        title: "AI deployments that don't fail",
        kind: "Field notes",
        date: "January 2026",
        file: "/pdfs/ai-deployments.pdf",
      },
      {
        id: "p3",
        title: "Returning time to people",
        kind: "Essay",
        date: "October 2025",
        file: "/pdfs/returning-time.pdf",
      },
    ],
    download: "Download",
  },
  downloadPromo: {
    heading: "Featured paper",
    body: "A fresh read from Ramon Portilla. Enter your email and it's yours to download.",
    cta: "Download",
    close: "Close",
  },
} as const;

type DeepStringify<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
  ? readonly DeepStringify<U>[]
  : T extends object
  ? { [K in keyof T]: DeepStringify<T[K]> }
  : T;

export type Dictionary = DeepStringify<typeof en>;
