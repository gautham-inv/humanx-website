/**
 * LinkedIn recommendations for Ramon, shown on the About page.
 *
 * This module is the single source of truth used in two places:
 *   1. As the fallback list the <Recommendations> section renders when Sanity
 *      returns nothing (so the section is never empty).
 *   2. As the seed source for the `recommendation` document type in the studio
 *      (scripts/sanity-seed-content.ts imports this array).
 *
 * Keep it dependency-free (plain data + a type) so both a React client
 * component and a Node seed script can import it without crossing any
 * runtime boundary.
 */
export type Recommendation = {
  /** Stable slug — used as the React key and the Sanity `_id`. */
  id: string;
  name: string;
  /** The recommender's LinkedIn headline / role line. */
  headline: string;
  /** Month + year the recommendation was given, e.g. "May 2023". */
  date: string;
  /** Short working-relationship label, e.g. "Worked on the same team". */
  relationship: string;
  /** The recommendation text. */
  body: string;
  /** Resolved avatar URL (Sanity CDN). Undefined → monogram fallback. */
  imageUrl?: string;
  imageAlt?: string;
  /** Recommender's LinkedIn profile — makes the name clickable when set. */
  linkedinUrl?: string;
};

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "alejandra-h",
    name: "Alejandra H.",
    headline:
      "Top Voice | Sr. Director Client and Customer Experience | Customer Centricity | Data & Analytics | Market Research | Marketing | Business Intelligence | Omnichannel",
    date: "May 2023",
    relationship: "Worked on the same team",
    body: `Ramon is a trailblazer in Customer Experience, adapting and creating methodologies to face the challenges of a constantly changing industry such as retail; in the largest company that is Walmart.

We worked on several projects and in each of them was an enriching experience, a great partner and teacher; sharing his experience and supporting development of his collaborators and peers. I am sure he will continue to be a leader in human insights, in any industry where he collaborates.`,
  },
  {
    id: "sean-mehranbod",
    name: "Sean Mehranbod",
    headline: "Operations Executive",
    date: "May 2023",
    relationship: "Worked on different teams",
    body: `Ramon's attention to detail, strategic thinking, and member-centric approach were critical to the success of our initiatives, particularly in Operations. His excellent communication skills and positive attitude made him a valuable partner to our team, and he was always willing to go above and beyond to ensure that our goals were achieved.`,
  },
  {
    id: "robert-atencio",
    name: "Robert Atencio",
    headline: "Founder & CEO at Atencio Insights LLC",
    date: "March 2020",
    relationship: "Managed Ramon directly",
    body: `Thinking back to when I was young I remember picking teams for playground sports, the thought process was fairly easy — pick the very best player you could find. The very best player should be someone who was talented at the sport, someone who played well with others, someone who gave a tremendous effort in pursuit of victory, and someone you would enjoy being around. As an adult I had a real life version of picking my own team: I was tasked with building an Insights department for the largest and one of the most admired companies — Walmart. As I started building that team from scratch I knew the importance of the "first pick" and I had to make the best possible choice for both me and the company. My first of 40 "picks" was Ramon Portilla!

He is an extremely talented researcher, an empathetic and driven leader, a consummate team player, a strategic thinker, and one of the hardest workers I know — always driving for business success. Ramon did not disappoint: he designed, implemented, and managed the first robust advertising research practice which allowed Walmart to successfully reposition the brand. His work was key in helping the team win a gold Ogilvy award for advertising research excellence.

I strongly endorse Ramon!`,
  },
  {
    id: "chris-moodhe",
    name: "Chris Moodhe",
    headline: "CEO - PeriscopeIQ",
    date: "February 2017",
    relationship: "Reported to Ramon",
    body: `A charismatic leader with the brains (big IQ here) and institutional knowledge to make big change a reality! The most statistical man in the world, and my favorite line-report boss of all time! I would follow Ramon anywhere, he is that good of a manager.`,
  },
  {
    id: "k-bluhm",
    name: "K Bluhm",
    headline: "Professional and Consulting Services",
    date: "January 2017",
    relationship: "Ramon was senior",
    body: `Ramon and I have known one another for several years. I have had the privilege to work with him on a number of highly visible and high-profiled projects. He has an amazing sense of urgency — no detail goes unnoticed. His attentiveness to his customer base can't be rivaled by anyone that I know. He is the consummate professional, with an eagerness to learn and strive for excellence.

Ramon is not just a great person to work with and for. He is also a professional guide and mentor to many professionals. He exudes integrity and respect. I would work with Ramon in any capacity in my career.`,
  },
  {
    id: "david-guenthner",
    name: "David Guenthner",
    headline: "Consumer Insights and Strategy Executive",
    date: "March 2016",
    relationship: "Worked on different teams",
    body: `I have had the great pleasure of working with Ramon for well over a decade, first as a client of his when he was at ARS (and I at Frito-Lay), and more recently as a colleague during our respective tenures at Walmart Stores, Inc.

Ramon brings a unique confluence of skills as an insights leader: tenacity to get to the bottom of a business issue, an ability to minimize confirmation bias in his analyses, collegiality with all his colleagues across functions, care for junior colleagues, a strong work ethic, and a tactful diplomatic approach to highly charged topics. In short, Ramon is an insightful, highly productive professional with whom anyone would have the pleasure to work.`,
  },
  {
    id: "saul-cordero",
    name: "Saul Cordero, PE, FACHE",
    headline:
      "Senior Vice President, Chief Board Governance and Strategy Officer",
    date: "October 2015",
    relationship: "Worked on different teams",
    body: `Ramon is not only an experienced researcher, but also a strategic thinker with strong retail experience. In addition, Ramon is a natural leader who's always eager to take on corporate as well as community initiatives.`,
  },
  {
    id: "oscar-velazquez",
    name: "Oscar Velazquez",
    headline: "Market Leader North Latin America at Kynetec",
    date: "October 2015",
    relationship: "Worked on the same team",
    body: `I had the privilege of being Ramon's colleague in 2 companies. I have always admired the energy and commitment he displays in everything he does: either launching new initiatives, expanding a business or driving valuable outcomes for his clients, both internal and external. This drive and enthusiasm also transpires to his personal life, family and people around him.

Aside his demonstrated capabilities in Marketing and Strategic Insights, Ramon has strong values when it comes to integrity, accountability and transparency.`,
  },
  {
    id: "allan-steinmetz",
    name: "Allan Steinmetz",
    headline:
      "Enterprise Transformation Leader | Brand, Culture & Performance | Interim CMO | Board Candidate",
    date: "October 2015",
    relationship: "Ramon was their client",
    body: `Ramon is one of the finest and most professional clients I have ever met. He seeks different views and opinions, listens, seeks to understand, is collaborative, decisive and is a respected leader. He is friendly, empathetic and cares for his employees, outside partners and his company. I am proud to have worked with him and be able to call him a valued friend.`,
  },
  {
    id: "rita-singh",
    name: "Rita Singh",
    headline: "Strategy Consulting",
    date: "January 2015",
    relationship: "Worked on different teams",
    body: `Ramon's grasp of what drives customer behavior and how to appeal and market to different customer segments is impressive. I had the opportunity to accompany him on field research and customer outreach trips and saw first-hand how he balanced theoretical research and marketing expertise with down-to-earth pragmatic customer insights. Ramon is a strong team leader and also did a great job connecting across Walmart's complex variety of functions and business areas. He would be a significant asset to any organization's strategic marketing and/or business operations leadership team.`,
  },
  {
    id: "daniel-stradtman",
    name: "Daniel Stradtman",
    headline:
      "CMO @ Bloomfire | Insights & Analytics Expert | GE / Walmart / Berkshire Hathaway / Amazon Alum",
    date: "July 2011",
    relationship: "Worked on the same team",
    body: `Ramon's deep expertise in market research and communications insights were critical to the success of our team at Walmart. His perspective is grounded in years of research and marketing experience, and input is always delivered with respect for the individual first in mind. Ramon has an infectious, energizing spirit — it is impossible to leave his company and not feel refreshed and more positive. I recommend him as an accomplished leader of people and ideas.`,
  },
  {
    id: "michael-taylor",
    name: "Michael Taylor",
    headline:
      "Sr. Managing Director Travel, Hospitality, Retail and Customer Service at J.D. Power",
    date: "July 2010",
    relationship: "Worked on different teams",
    body: `In my career, I've never met anyone as impressive or capable as Ramon Portilla. He has years of international experience and uses it to generate clear insight into consumer behaviors. Ramon has the ability to distill data into actionable strategy. A true professional.`,
  },
  {
    id: "david-morita",
    name: "David Morita",
    headline: "Independent Consultant - DYM Consulting",
    date: "July 2010",
    relationship: "Worked on the same team",
    body: `I had the pleasure of working with Ramon for nearly four years at Walmart. He is a true insights professional who can always be counted on to take a straight-forward approach to collaboration and teamwork, and who can work through complicated business issues to understand the heart of an issue and recommend and execute research that is both insightful and productive. I whole-heartedly recommend his work to anyone.`,
  },
  {
    id: "enrique-samson",
    name: "Enrique Samson",
    headline: "Managing Partner, CDNM Holdings",
    date: "March 2010",
    relationship: "Reported to Ramon",
    body: `I had the privilege of working under Ramon at ARS. His strongest assets are his people skills, his strategic vision, and his work ethics. He would effectively connect with all levels of the organization to get results. He used to continuously remind the team of our goals and provided us with the right motivation in order to make things happen. He did an outstanding job training and communicating with me, and was able to forge in our team a special sense of loyalty as very few leaders can.`,
  },
  {
    id: "simon-el-hage",
    name: "Simon El Hage",
    headline:
      "Brand Strategy Architect, Cultural Truth-teller, and Strategic Provocateur",
    date: "December 2009",
    relationship: "Worked on different teams",
    body: `I had the privilege of working on the Walmart account for almost ten years, from 1999 to 2008 at Lopez Negrete Communications, a leading Hispanic Marketing and Advertising company in the USA. During those years, I saw Walmart transition from a "Merchant-driven" company to a "Consumer-Centric" and "Marketing-Driven" one. New divisions were added, but the most critical one was Customer Insights.

One of those shining stars was Ramon Portilla. Like they say in my old town: "un verdadero caballero" — a true, real, bright, insightful gentleman with a keen intellect and an outstanding background in consumer research. His work and leadership played a major role in helping us refine all our communications mix and fine-tune our messaging. Of all the stars Walmart brought to their new orbit, he's the one I learned the most from.`,
  },
  {
    id: "jim-gard",
    name: "Jim Gard",
    headline: "Sr. Associate at Dorsey & Co.",
    date: "February 2009",
    relationship: "Ramon was senior",
    body: `Ramon is a superior leader with a vast knowledge of consumer communication insights. He builds team morale and provides a thoughtful strategic voice in key business issues to senior management and his coworkers.`,
  },
  {
    id: "elba-pagan",
    name: `Elba "Vicky" Pagán`,
    headline:
      "Research & Insights Leadership | Strategic Marketing | New Product | Branding",
    date: "September 2007",
    relationship: "Was Ramon's client",
    body: `I had an excellent experience working with Ramon in the development of critical advertising research programs for BMS-MJN. We were able to deliver insights and clear direction to the advertising campaigns to ensure ROI.`,
  },
];
