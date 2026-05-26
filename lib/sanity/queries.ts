/**
 * GROQ queries for the humanx-website build.
 *
 * Each query is a plain template string; we fetch the localized field shape
 * (`{ en, es }`) and let the page component pick the right locale before
 * handing data to render-only components. That keeps the schema query
 * agnostic to which locale is being built.
 */

/**
 * Every testimonial, ordered by editorial `order` field then creation date.
 * Returns localized `quote / author / org` so the homepage can fan out to
 * both `/en` and `/es` builds from a single fetch.
 */
export const testimonialsQuery = /* groq */ `
  *[_type == "testimonial"] | order(order asc, _createdAt asc) {
    "id": _id,
    quote,
    author,
    org
  }
`;

/** Shape of a single testimonial row returned by `testimonialsQuery`. */
export type TestimonialDoc = {
  id: string;
  quote: { en?: string; es?: string };
  author: { en?: string; es?: string };
  org?: { en?: string; es?: string };
};
