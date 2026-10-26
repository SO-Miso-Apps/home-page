/**
 * Contact form: field rules, the choices the selects offer, and the email the
 * API route hands to the `EMAIL` binding. Kept free of request/response types so
 * both the server route and the Astro component render from one source of truth.
 */
import { SERVICES, SERVICES_BY_LANG } from "../services";
import type { ServiceTrack } from "../services";
import { CONTACT_EMAIL, CONTACT_PHONE } from "../site";
import { DEFAULT_LANG, type Lang } from "../i18n";

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

// The English lists below are what the email to the team is written from;
// optionsFor() gives the form the same values with labels in the page language.
export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  ...SERVICES.map((track: ServiceTrack) => ({ value: track.id, label: track.title })),
  { value: "both", label: "Both — theme and app" },
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

const SERVICE_OPTIONS_VI: { value: string; label: string }[] = [
  ...SERVICES_BY_LANG.vi.map((track) => ({ value: track.id, label: track.title })),
  { value: "both", label: "Cả hai — theme và app" },
];

const BUDGET_OPTIONS_VI: { value: string; label: string }[] = [
  { value: "", label: "Muốn trao đổi thêm" },
  { value: "under-1k", label: "Dưới $1.000" },
  { value: "1k-3k", label: "$1.000 – $3.000" },
  { value: "3k-8k", label: "$3.000 – $8.000" },
  { value: "8k-plus", label: "Trên $8.000" },
];

export function optionsFor(lang: Lang): {
  service: { value: string; label: string }[];
  budget: { value: string; label: string }[];
} {
  return lang === "vi"
    ? { service: SERVICE_OPTIONS_VI, budget: BUDGET_OPTIONS_VI }
    : { service: SERVICE_OPTIONS, budget: BUDGET_OPTIONS };
}

/**
 * Every visitor-facing sentence of the contact flow, per language: the form,
 * the no-JS banners, the route's JSON messages and the client module's status
 * line all read from here.
 */
export const CONTACT_COPY = {
  en: {
    errors: {
      name: "Tell us who you are (at least 2 characters).",
      email: "A working email address, so we can reply.",
      service: "Pick the work this is about.",
      budget: "Pick one of the listed ranges.",
      message: "A sentence or two about the job, so the reply is useful.",
    },
    ok: "Thanks — your message is in. We reply from the address below.",
    invalid: "Something in the form needs another look. Please check the fields and send it again.",
    limited: `Too many messages from this connection. Try again in an hour, or email ${CONTACT_EMAIL}.`,
    failed: `Sending failed on our side. Email ${CONTACT_EMAIL} and it will reach us.`,
    unwired: `The form is not wired up yet. Email ${CONTACT_EMAIL} instead.`,
    sending: "Sending…",
    checkFields: "Please check the highlighted fields.",
    retry: "Something went wrong. Please try again.",
    offline: `Could not reach the server. Please try again, or email ${CONTACT_EMAIL}.`,
    fields: { name: "Your name", email: "Email", store: "Store URL", deadline: "Deadline", deadlineHint: "e.g. before Black Friday" },
    service: "What is it about?",
    chooseService: "Choose one",
    budget: "Budget range",
    message: "What would you like done?",
    messageHint: "What you want changed on the store, or the job your team still does by hand.",
    submit: "Send the request",
    orEmail: "Or email",
    sameInbox: "— the form lands in the same inbox.",
    doneTitle: "Request received.",
    doneBefore: "We read every enquiry and reply from",
    doneAfter: `, usually within one working day. If it is urgent, call ${CONTACT_PHONE}.`,
    trap: "Company website",
  },
  vi: {
    errors: {
      name: "Bạn cho biết tên nhé (ít nhất 2 ký tự).",
      email: "Bạn cần nhập email đang dùng để chúng tôi trả lời.",
      service: "Bạn chọn giúp loại việc cần làm.",
      budget: "Bạn chọn một trong các mức có sẵn.",
      message: "Bạn viết thêm vài câu về công việc để chúng tôi trả lời sát hơn.",
    },
    ok: "Cảm ơn bạn, chúng tôi đã nhận được tin nhắn và sẽ trả lời từ địa chỉ email bên dưới.",
    invalid: "Có vài ô cần sửa lại. Bạn kiểm tra rồi gửi lại giúp nhé.",
    limited: `Bạn đã gửi khá nhiều tin nhắn trong thời gian ngắn. Hãy thử lại sau một giờ, hoặc email cho chúng tôi qua ${CONTACT_EMAIL}.`,
    failed: `Chưa gửi được do lỗi bên chúng tôi. Bạn email trực tiếp tới ${CONTACT_EMAIL} nhé.`,
    unwired: `Form tạm thời chưa hoạt động. Bạn email tới ${CONTACT_EMAIL} giúp nhé.`,
    sending: "Đang gửi…",
    checkFields: "Bạn kiểm tra lại các ô được đánh dấu nhé.",
    retry: "Có lỗi xảy ra, bạn thử lại giúp nhé.",
    offline: `Không kết nối được tới máy chủ. Bạn thử lại, hoặc email tới ${CONTACT_EMAIL}.`,
    fields: { name: "Tên của bạn", email: "Email", store: "Địa chỉ cửa hàng", deadline: "Cần xong khi nào", deadlineHint: "vd. trước Black Friday" },
    service: "Bạn cần làm gì?",
    chooseService: "Chọn một mục",
    budget: "Ngân sách dự kiến",
    message: "Bạn muốn làm gì?",
    messageHint: "Bạn muốn đổi gì trên cửa hàng, hoặc việc gì đội bạn vẫn đang phải làm tay.",
    submit: "Gửi yêu cầu",
    orEmail: "Hoặc gửi email tới",
    sameInbox: "— cùng một hộp thư với form này.",
    doneTitle: "Đã nhận yêu cầu của bạn.",
    doneBefore: "Chúng tôi đọc từng yêu cầu và sẽ trả lời từ",
    doneAfter: `, thường trong vòng một ngày làm việc. Nếu gấp, bạn cứ gọi ${CONTACT_PHONE}.`,
    trap: "Website công ty",
  },
} as const satisfies Record<Lang, unknown>;

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

export function validateContact(raw: Record<string, unknown>, lang: Lang = DEFAULT_LANG): {
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
  const say = CONTACT_COPY[lang].errors;

  if (values.name.length < 2) errors.name = say.name;
  if (!EMAIL_PATTERN.test(values.email)) errors.email = say.email;
  if (!SERVICE_OPTIONS.some((option) => option.value === values.service)) {
    errors.service = say.service;
  }
  if (values.budget && !BUDGET_OPTIONS.some((option) => option.value === values.budget)) {
    errors.budget = say.budget;
  }
  if (values.message.length < 10) {
    errors.message = say.message;
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

/** The team's inbox is English; `lang` only records which page the visitor wrote from. */
export function composeContactEmail(values: ContactInput, lang: Lang = DEFAULT_LANG): ComposedEmail {
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
    ["Language", lang === "vi" ? "Vietnamese (sent from /vi)" : "English"],
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
export function buildContactMessage(values: ContactInput, lang: Lang = DEFAULT_LANG): {
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
    ...composeContactEmail(values, lang),
  };
}
