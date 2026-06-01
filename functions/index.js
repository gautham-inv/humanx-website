/**
 * Cloudflare Pages Function for the site root `/`.
 *
 * Replaces the old client-side "Loading…/Redirecting…" JS redirect with a
 * server-side 302 based on the visitor's Accept-Language header. Crawlers and
 * social scrapers get a real redirect (no JS, no empty "Redirecting…" page),
 * while Spanish browsers still land on /es. The /en ↔ /es ↔ x-default hreflang
 * cluster lives on the localized pages and is unaffected by this redirect.
 *
 * Deploy note: Pages Functions are only bundled when `wrangler pages deploy`
 * runs WITHOUT `--no-bundle`. The deploy command was updated accordingly.
 */
export function onRequest(context) {
  const accept = context.request.headers.get("accept-language") || "";
  const lang = accept.trim().toLowerCase().startsWith("es") ? "es" : "en";
  const url = new URL(context.request.url);
  return Response.redirect(`${url.origin}/${lang}`, 302);
}
