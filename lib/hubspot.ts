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
// Separate HubSpot form for the gated PDF download — a different form GUID
// in the same portal. Keeps download leads on their own form so HubSpot
// follow-up email / list membership can differ from the contact form.
const DOWNLOAD_FORM_GUID = process.env.NEXT_PUBLIC_HUBSPOT_DOWNLOAD_FORM_GUID;

export function isHubspotConfigured(): boolean {
  return Boolean(PORTAL_ID && FORM_GUID);
}

export function isDownloadConfigured(): boolean {
  return Boolean(PORTAL_ID && DOWNLOAD_FORM_GUID);
}

type HubspotField = { name: string; value: string };

/**
 * Low-level POST to a HubSpot form. `fields` names must match the *internal
 * property name* of each field in the target form (not the display label),
 * or HubSpot rejects the payload with FORM_FIELDS_NOT_VALID. Throws on
 * non-2xx so callers can show an error state.
 */
async function postToHubspot(
  formGuid: string,
  fields: HubspotField[]
): Promise<void> {
  if (!PORTAL_ID) {
    throw new Error(
      "HubSpot portal ID is not configured (NEXT_PUBLIC_HUBSPOT_PORTAL_ID)."
    );
  }
  // `context.pageUri` lets HubSpot record which page the lead converted from.
  const payload = {
    fields,
    context:
      typeof window !== "undefined"
        ? { pageUri: window.location.href, pageName: document.title }
        : undefined,
  };

  const res = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${formGuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
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

/** Shape of the four fields `HumanForm` collects today. */
export type ContactSubmission = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

/** POSTs a contact-form submission to the main HubSpot form. */
export async function submitToHubspot(input: ContactSubmission): Promise<void> {
  if (!FORM_GUID) {
    throw new Error(
      "HubSpot contact form is not configured. Set NEXT_PUBLIC_HUBSPOT_PORTAL_ID and NEXT_PUBLIC_HUBSPOT_FORM_GUID."
    );
  }
  await postToHubspot(FORM_GUID, [
    { name: "firstname", value: input.name },
    { name: "email", value: input.email },
    { name: "topic", value: input.topic },
    { name: "message", value: input.message },
  ]);
}

/** Email captured by the gated PDF download. */
export type DownloadSubmission = { email: string };

/**
 * POSTs the gated-download email to the dedicated HubSpot download form.
 * Only `email` is sent — the form is email-only — so the HubSpot form needs
 * just the standard `email` property.
 */
export async function submitGatedDownload(
  input: DownloadSubmission
): Promise<void> {
  if (!DOWNLOAD_FORM_GUID) {
    throw new Error(
      "HubSpot download form is not configured. Set NEXT_PUBLIC_HUBSPOT_DOWNLOAD_FORM_GUID."
    );
  }
  await postToHubspot(DOWNLOAD_FORM_GUID, [{ name: "email", value: input.email }]);
}
