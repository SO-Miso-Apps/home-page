import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  CONTACT_FORM_TO,
  HONEYPOT_FIELD,
  MIN_FILL_MS,
  RATE_LIMIT_PER_HOUR,
  buildContactMessage,
  validateContact,
} from "../../lib/contact";

/** Nothing on this route is cacheable, in either direction. */
const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * Contact form endpoint.
 *
 * Two callers, one route: the page posts FormData with an `Accept:
 * application/json` header and renders the result in place, while a form post
 * without JavaScript gets a 303 back to the section, which reads `?contact=`
 * and shows the same outcome. Field-level errors survive only on the JSON path —
 * a no-JS visitor is asked to check the whole form.
 */
export const POST: APIRoute = async ({ request }) => {
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");

  const settle = (
    state: "ok" | "invalid" | "limited" | "failed",
    body: Record<string, unknown>,
    status: number,
  ): Response =>
    wantsJson
      ? new Response(JSON.stringify(body), {
          status,
          headers: { ...NO_STORE, "Content-Type": "application/json; charset=utf-8" },
        })
      : new Response(null, {
          status: 303,
          headers: { ...NO_STORE, Location: `/services?contact=${state}#request` },
        });

  let raw: Record<string, unknown> = {};
  try {
    if ((request.headers.get("content-type") ?? "").includes("application/json")) {
      const parsed: unknown = await request.json();
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        raw = Object.fromEntries(Object.entries(parsed));
      }
    } else {
      const form = await request.formData();
      raw = Object.fromEntries(
        [...form].map(([key, value]) => [key, typeof value === "string" ? value : ""]),
      );
    }
  } catch (error) {
    console.error("contact: unreadable payload", error);
    return settle("invalid", { ok: false, errors: {} }, 400);
  }

  // Bots fill the hidden field and submit within milliseconds. Both cases get an
  // answer identical to success: a bot that learns nothing retries nothing, and
  // a false positive costs a retry rather than a lost enquiry (the address is
  // still in the footer).
  const honeypotValue = raw[HONEYPOT_FIELD];
  const honeypot = typeof honeypotValue === "string" ? honeypotValue : "";
  const startedAt = Number(raw.started_at);
  const tooFast =
    Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS;
  if (honeypot.trim() !== "" || tooFast) {
    console.log(`contact: dropped ${honeypot.trim() !== "" ? "honeypot" : "too-fast"} submission`);
    return settle("ok", { ok: true }, 200);
  }

  // Per-IP hourly budget in KV. Reads then writes, so two requests in flight can
  // both pass; a contact form does not need an atomic counter to be safe.
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const limitKey = `contact:rl:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
  const attempts = Number(await env.CACHE.get(limitKey)) || 0;
  if (attempts >= RATE_LIMIT_PER_HOUR) {
    return settle(
      "limited",
      {
        ok: false,
        message: `Too many messages from this connection. Try again in an hour, or email ${CONTACT_FORM_TO}.`,
      },
      429,
    );
  }
  await env.CACHE.put(limitKey, String(attempts + 1), { expirationTtl: 3_600 });

  const { values, errors } = validateContact(raw);
  if (Object.keys(errors).length > 0) {
    return settle("invalid", { ok: false, errors }, 400);
  }

  if (!env.EMAIL) {
    console.error("contact: EMAIL binding is missing — add send_email to wrangler.jsonc");
    return settle(
      "failed",
      { ok: false, message: `The form is not wired up yet. Email ${CONTACT_FORM_TO} instead.` },
      503,
    );
  }

  const message = buildContactMessage(values);
  try {
    await env.EMAIL.send(message);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "unknown";
    console.error("contact: send failed", code, error instanceof Error ? error.message : String(error));
    return settle(
      "failed",
      { ok: false, message: `Sending failed on our side. Email ${CONTACT_FORM_TO} and it will reach us.` },
      502,
    );
  }

  return settle("ok", { ok: true }, 200);
};

export const GET: APIRoute = () =>
  new Response("Method not allowed", { status: 405, headers: { ...NO_STORE, Allow: "POST" } });
