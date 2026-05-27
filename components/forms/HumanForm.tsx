"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { submitToHubspot, isHubspotConfigured } from "@/lib/hubspot";

export type FieldConfig =
  | {
      kind: "text" | "email";
      id: string;
      label: string;
      required?: boolean;
      autoComplete?: string;
      helper?: string;
      placeholder?: string;
    }
  | {
      kind: "select";
      id: string;
      label: string;
      required?: boolean;
      options: readonly string[];
      helper?: string;
    }
  | {
      kind: "date";
      id: string;
      label: string;
      required?: boolean;
      helper?: string;
    }
  | {
      kind: "textarea";
      id: string;
      label: string;
      required?: boolean;
      helper?: string;
      placeholder?: string;
      rows?: number;
    };

type Errors = Record<string, string | undefined>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(field: FieldConfig, value: string, dict: Dictionary): string | undefined {
  if (field.required && value.trim() === "") return dict.forms.required;
  if (field.kind === "email" && value.trim() !== "" && !EMAIL_RE.test(value.trim())) {
    return dict.forms.invalidEmail;
  }
  return undefined;
}

const baseControl =
  "w-full rounded-lg border border-line bg-bg px-4 text-sm text-ink placeholder:text-ink-dim outline-none transition-colors focus-visible:border-accent";

const inputClass = `${baseControl} h-11`;
const textareaClass = `${baseControl} py-3 resize-y`;

export function HumanForm({
  dict,
  title,
  body,
  fields,
  submitLabel,
}: {
  dict: Dictionary;
  title: string;
  body?: string;
  fields: readonly FieldConfig[];
  submitLabel: string;
}) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.id, ""]))
  );
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);
  // `submitting` disables the button + swaps the label to "Sending…" while
  // the HubSpot POST is in flight. `submitError` surfaces a friendly retry
  // hint when the fetch fails (HubSpot 4xx/5xx, offline, etc.).
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hubspotReady = isHubspotConfigured();

  function setField(id: string, value: string) {
    setValues((v) => ({ ...v, [id]: value }));
    if (errors[id]) {
      const next = { ...errors };
      delete next[id];
      setErrors(next);
    }
  }

  function onBlur(field: FieldConfig) {
    setTouched((t) => ({ ...t, [field.id]: true }));
    const e = validate(field, values[field.id] ?? "", dict);
    setErrors((prev) => ({ ...prev, [field.id]: e }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const next: Errors = {};
    for (const f of fields) {
      const err = validate(f, values[f.id] ?? "", dict);
      if (err) next[f.id] = err;
    }
    setErrors(next);
    setTouched(Object.fromEntries(fields.map((f) => [f.id, true])));

    const firstErr = fields.find((f) => next[f.id]);
    if (firstErr) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(firstErr.id)}`)?.focus();
      return;
    }

    setSubmitError(null);

    // If HubSpot isn't wired (env vars missing), fall through to the legacy
    // "coming soon" UX. The build still ships safely before IDs land.
    if (!hubspotReady) {
      setSent(true);
      return;
    }

    setSubmitting(true);
    try {
      await submitToHubspot({
        name: values.name ?? "",
        email: values.email ?? "",
        topic: values.topic ?? "",
        message: values.message ?? "",
      });
      setSent(true);
    } catch (err) {
      // Keep the form populated so users don't lose what they typed. Log
      // the underlying reason to the console for ops debugging.
      console.error(err);
      setSubmitError(dict.forms.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    // Two success copy paths:
    //  - HubSpot live → "We'll be in touch" (proper confirmation)
    //  - HubSpot unconfigured → legacy "Coming soon" + mailto fallback so
    //    the site still has somewhere to send leads while the form is
    //    being set up at HubSpot's side.
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-line bg-bg-elev p-8"
      >
        <div className="text-xs uppercase tracking-[0.3em] text-accent">
          {hubspotReady ? dict.forms.successEyebrow : dict.forms.comingSoon}
        </div>
        <h3 className="mt-3 font-display text-2xl text-ink">
          {hubspotReady ? dict.forms.successTitle : title}
        </h3>
        <p className="mt-3 max-w-md text-sm text-ink-dim">
          {hubspotReady ? (
            dict.forms.successBody
          ) : (
            <>
              Form delivery is being wired up. For now, write to{" "}
              <a
                className="text-accent underline-offset-4 hover:underline"
                href="mailto:contact@humanxinsights.com"
              >
                contact@humanxinsights.com
              </a>
              .
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setValues(Object.fromEntries(fields.map((f) => [f.id, ""])));
            setErrors({});
            setTouched({});
            setSubmitError(null);
          }}
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ink-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← {hubspotReady ? dict.forms.successReset : "Reset"}
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      className="rounded-2xl border border-line bg-bg-elev p-6 md:p-8"
    >
      {title && <h3 className="font-display text-2xl text-ink">{title}</h3>}
      {body && <p className="mt-2 max-w-md text-sm text-ink-dim">{body}</p>}

      <div className="mt-8 space-y-5">
        {fields.map((field) => {
          const err = touched[field.id] ? errors[field.id] : undefined;
          const errId = `${field.id}-err`;
          const helpId = `${field.id}-help`;
          const describedBy = [err ? errId : null, "helper" in field && field.helper ? helpId : null]
            .filter(Boolean)
            .join(" ") || undefined;

          return (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-ink-dim"
              >
                {field.label}
                {field.required && (
                  <span aria-hidden className="text-accent">
                    *
                  </span>
                )}
              </label>

              {field.kind === "select" ? (
                <select
                  id={field.id}
                  value={values[field.id]}
                  onChange={(e) => setField(field.id, e.target.value)}
                  onBlur={() => onBlur(field)}
                  aria-invalid={err ? true : undefined}
                  aria-required={field.required || undefined}
                  aria-describedby={describedBy}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">{dict.forms.selectPlaceholder}</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.kind === "textarea" ? (
                <textarea
                  id={field.id}
                  rows={field.rows ?? 4}
                  placeholder={field.placeholder}
                  value={values[field.id]}
                  onChange={(e) => setField(field.id, e.target.value)}
                  onBlur={() => onBlur(field)}
                  aria-invalid={err ? true : undefined}
                  aria-required={field.required || undefined}
                  aria-describedby={describedBy}
                  className={textareaClass}
                />
              ) : (
                <input
                  id={field.id}
                  type={field.kind === "email" ? "email" : field.kind === "date" ? "date" : "text"}
                  autoComplete={"autoComplete" in field ? field.autoComplete : undefined}
                  placeholder={"placeholder" in field ? field.placeholder : undefined}
                  value={values[field.id]}
                  onChange={(e) => setField(field.id, e.target.value)}
                  onBlur={() => onBlur(field)}
                  aria-invalid={err ? true : undefined}
                  aria-required={field.required || undefined}
                  aria-describedby={describedBy}
                  className={inputClass}
                />
              )}

              {"helper" in field && field.helper && !err && (
                <p id={helpId} className="mt-1.5 text-xs text-ink-dim">
                  {field.helper}
                </p>
              )}

              {err && (
                <p
                  id={errId}
                  role="alert"
                  className="mt-1.5 text-xs text-accent-bright"
                >
                  {err}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {submitError && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 p-4 text-sm text-ink"
        >
          {submitError}{" "}
          <a
            className="text-accent underline-offset-4 hover:underline"
            href="mailto:contact@humanxinsights.com"
          >
            contact@humanxinsights.com
          </a>
          .
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting || undefined}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? dict.forms.sending : submitLabel}
      </button>
    </form>
  );
}
