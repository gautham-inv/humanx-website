import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { FieldConfig } from "@/components/forms/HumanForm";
import type { ContactCtaContent } from "@/lib/sanity/loaders";

/**
 * The four fields that make up the contact form on every surface (homepage
 * inline form, modal triggered from non-home CTA, /about hero CTA). Centralised
 * here so the two render sites (GlobalCTA + ContactModalProvider) stay in sync.
 *
 * Field labels live in two places: form-mechanical strings (Name/Email) come
 * from `dict.forms` (deliberately not editable in CMS — they barely change
 * and they collide with browser autofill conventions). Topic/message copy
 * is editable via the `contactCta` singleton and overrides dict when set.
 */
export function buildContactFields(
  dict: Dictionary,
  content?: ContactCtaContent | null
): readonly FieldConfig[] {
  const t = dict.cta;
  return [
    { kind: "text", id: "name", label: dict.forms.name, required: true, autoComplete: "name" },
    { kind: "email", id: "email", label: dict.forms.email, required: true, autoComplete: "email" },
    {
      kind: "select",
      id: "topic",
      label: content?.topicLabel ?? t.topicLabel,
      required: true,
      options:
        content?.topicOptions && content.topicOptions.length > 0
          ? content.topicOptions
          : t.topicOptions,
    },
    {
      kind: "textarea",
      id: "message",
      label: content?.messageLabel ?? t.messageLabel,
      placeholder: content?.messagePlaceholder ?? t.messagePlaceholder,
      required: true,
      rows: 4,
    },
  ];
}
