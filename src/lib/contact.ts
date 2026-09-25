/**
 * Contact form: field rules, the choices the selects offer, and the email the
 * API route hands to the `EMAIL` binding. Kept free of request/response types so
 * both the server route and the Astro component render from one source of truth.
 */
import { SERVICES } from "../services";
import type { ServiceTrack } from "../services";
import { CONTACT_EMAIL } from "../site";

/** Sender on the `send.` subdomain — the apex MX belongs to Zoho Mail. */
export const CONTACT_FORM_FROM = "forms@send.misoapps.com";

/** Sender display name, and the address the form delivers to. */
export const CONTACT_FORM_FROM_NAME = "Miso Apps website";
export const CONTACT_FORM_TO = CONTACT_EMAIL;

/** Guards in front of the send. Both are deliberately conservative. */
export const MIN_FILL_MS = 3_000;
export const RATE_LIMIT_PER_HOUR = 5;

/** Hidden field bots fill in and people never see. */
export const HONEYPOT_FIELD = "company_website";

export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  ...SERVICES.map((track: ServiceTrack) => ({ value: track.id, label: track.title })),
  { value: "both", label: "Both — app and theme" },
];

// Ranges are a business call, not a technical one: edit the labels here and the
// form, the email and the validation all follow.
export const BUDGET_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Prefer to discuss" },
  { value: "under-1k", label: "Under $1,000" },
  { value: "1k-3k", label: "$1,000 – $3,000" },
  { value: "3k-8k", label: "$3,000 – $8,000" },
  { value: "8k-plus", label: "$8,000+" },
];

export interface ContactInput {
  name: string;
  email: string;
  store_url: string;
  service: string;
  budget: string;
  deadline: string;
  message: string;
}

export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

const MAX = {
  name: 100,
  email: 254,
  store_url: 300,
  deadline: 100,
  message: 4_000,
} as const;

// One @, a dot in the domain, no whitespace. Deliberately loose: the reply is
// what proves the address, and strict patterns reject valid mailboxes.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trim, drop control characters, and cap the length of every incoming value. */
function clean(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  return value
    .replaceAll(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, limit);
}

export function validateContact(raw: Record<string, unknown>): {
  values: ContactInput;
  errors: ContactErrors;
} {
  const values: ContactInput = {
    name: clean(raw.name, MAX.name),
    email: clean(raw.email, MAX.email),
    store_url: clean(raw.store_url, MAX.store_url),
    service: clean(raw.service, 40),
    budget: clean(raw.budget, 40),
    deadline: clean(raw.deadline, MAX.deadline),
    message: clean(raw.message, MAX.message),
  };

  const errors: ContactErrors = {};

  if (values.name.length < 2) errors.name = "Tell us who you are (at least 2 characters).";
  if (!EMAIL_PATTERN.test(values.email)) errors.email = "A working email address, so we can reply.";
  if (!SERVICE_OPTIONS.some((option) => option.value === values.service)) {
    errors.service = "Pick the work this is about.";
  }
  if (values.budget && !BUDGET_OPTIONS.some((option) => option.value === values.budget)) {
    errors.budget = "Pick one of the listed ranges.";
  }
  if (values.message.length < 10) {
    errors.message = "A sentence or two about the job, so the reply is useful.";
  }

  return { values, errors };
}

/** `&`/`<`/`>`/quotes escaped — every value below lands in the HTML email. */
function escape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export interface ComposedEmail {
  subject: string;
  text: string;
  html: string;
}

export function composeContactEmail(values: ContactInput): ComposedEmail {
  const serviceLabel =
    SERVICE_OPTIONS.find((option) => option.value === values.service)?.label ?? values.service;
  const budgetLabel = values.budget
    ? (BUDGET_OPTIONS.find((option) => option.value === values.budget)?.label ?? values.budget)
    : "Not given";

  const rows: [string, string][] = [
    ["Service", serviceLabel],
    ["Name", values.name],
    ["Email", values.email],
    ["Store", values.store_url || "Not given"],
    ["Budget", budgetLabel],
    ["Deadline", values.deadline || "Not given"],
  ];

  const text = [
    "New services enquiry from the website contact form.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    values.message,
  ].join("\n");

  const html = [
    "<h2>New services enquiry</h2>",
    "<p>Sent from the contact form on misoapps.com/services.</p>",
    "<ul>",
    ...rows.map(([label, value]) => `<li><strong>${escape(label)}:</strong> ${escape(value)}</li>`),
    "</ul>",
    "<p><strong>Message</strong></p>",
    `<p>${escape(values.message).replaceAll("\n", "<br>")}</p>`,
  ].join("\n");

  // Subject is plain ASCII apart from the separators: header encoding is one
  // fewer thing to get wrong in a mailbox.
  const subject = `Services enquiry — ${serviceLabel} — ${values.name}`;

  return { subject, text, html };
}

/**
 * The complete `EMAIL.send()` argument. Extracted so the envelope — sender,
 * recipient and where a reply goes — is testable without a Worker runtime.
 */
export function buildContactMessage(values: ContactInput): {
  to: string;
  from: { email: string; name: string };
  replyTo: { email: string; name: string };
  subject: string;
  text: string;
  html: string;
} {
  return {
    to: CONTACT_FORM_TO,
    from: { email: CONTACT_FORM_FROM, name: CONTACT_FORM_FROM_NAME },
    replyTo: { email: values.email, name: values.name },
    ...composeContactEmail(values),
  };
}
