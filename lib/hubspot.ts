/**
 * HubSpot Forms Submission API integration.
 *
 * Sends contact-form payloads to HubSpot's public Forms endpoint:
 *   POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
 *
 * The endpoint is designed for browser-side POSTs (CORS open), so the static
 * export build works without a server. `portalId` and `formGuid` are public
 * by design — they're the same IDs HubSpot's own embed snippet exposes — and
 * therefore live in `NEXT_PUBLIC_*` env vars baked at build time.
 *
 * If either env var is missing, `isHubspotConfigured()` returns false and
 * `HumanForm` falls back to the existing "Coming soon" UX. That way the site
 * keeps shipping even before the IDs are pasted in.
 *
 * HubSpot field names below must match the *internal property name* in
 * HubSpot (not the display label). The API rejects payloads keyed by label
 * with FORM_FIELDS_NOT_VALID, so be careful when adding new properties:
 * find the internal name at Settings → Properties → {your property} →
 * "Internal name".
 *
 * Mapping in use:
 *   firstname  → standard contact property (default)
 *   email      → standard contact property (default)
 *   topic      → custom contact property (single-line text)
 *   message    → standard contact property (default)
 */
const PORTAL_ID = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
const FORM_GUID = process.env.NEXT_PUBLIC_HUBSPOT_FORM_GUID;

export function isHubspotConfigured(): boolean {
  return Boolean(PORTAL_ID && FORM_GUID);
}

/** Shape of the four fields `HumanForm` collects today. */
export type ContactSubmission = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

/**
 * POSTs a submission to HubSpot. Throws on non-2xx so the caller can show
 * an error state — HubSpot does return useful error JSON, but for the UI
 * we only need success/failure, not the specific reason.
 */
export async function submitToHubspot(input: ContactSubmission): Promise<void> {
  if (!PORTAL_ID || !FORM_GUID) {
    throw new Error(
      "HubSpot is not configured. Set NEXT_PUBLIC_HUBSPOT_PORTAL_ID and " +
        "NEXT_PUBLIC_HUBSPOT_FORM_GUID."
    );
  }

  // HubSpot's Forms API wants `fields: [{ name, value }, …]` with the names
  // matching the form schema in their UI. `context.pageUri` lets HubSpot
  // record which page the lead converted from — useful for attribution
  // once you have several CTAs across the site.
  const payload = {
    fields: [
      { name: "firstname", value: input.name },
      { name: "email", value: input.email },
      { name: "topic", value: input.topic },
      { name: "message", value: input.message },
    ],
    context:
      typeof window !== "undefined"
        ? {
            pageUri: window.location.href,
            pageName: document.title,
          }
        : undefined,
  };

  const res = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_GUID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    // Surface the status in the dev console so debugging is possible without
    // exposing the JSON to end users.
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* response wasn't JSON */
    }
    throw new Error(
      `HubSpot submission failed: ${res.status} ${res.statusText} ${detail}`
    );
  }
}
