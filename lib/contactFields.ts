import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { FieldConfig } from "@/components/forms/HumanForm";

/**
 * The four fields that make up the contact form on every surface (homepage
 * inline form, modal triggered from non-home CTA, /about hero CTA). Centralised
 * here so the two render sites (GlobalCTA + ContactModalProvider) stay in sync.
 */
export function buildContactFields(dict: Dictionary): readonly FieldConfig[] {
  const t = dict.cta;
  return [
    { kind: "text", id: "name", label: dict.forms.name, required: true, autoComplete: "name" },
    { kind: "email", id: "email", label: dict.forms.email, required: true, autoComplete: "email" },
    {
      kind: "select",
      id: "topic",
      label: t.topicLabel,
      required: true,
      options: t.topicOptions,
    },
    {
      kind: "textarea",
      id: "message",
      label: t.messageLabel,
      placeholder: t.messagePlaceholder,
      required: true,
      rows: 4,
    },
  ];
}
