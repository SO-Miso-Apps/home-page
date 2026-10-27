// Two languages, one set of routes. English is served unprefixed; Vietnamese
// lives under /vi, and middleware.ts rewrites /vi/* onto the same page files
// with `locals.lang` set — so a page never exists in one language only.
//
// Language is a property of the URL, never of the request: the edge cache in
// front of the Worker keys on URL alone, so a page that varied on a cookie or
// Accept-Language would serve one visitor's language to the next. The
// first-visit guess happens in the browser instead (see LANG_SCRIPT).
export const LANGS = ["en", "vi"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

/** localStorage key holding a choice made with the language switcher. */
export const LANG_STORAGE_KEY = "miso-lang";

/**
 * The same choice as a cookie, for the Cloudflare redirect rule that sends
 * visitors in Vietnam to /vi before the edge cache: it cannot read
 * localStorage, and skips anyone whose cookie says `miso-lang=en`.
 */
export const LANG_COOKIE = `${LANG_STORAGE_KEY}=%s; Path=/; Max-Age=31536000; SameSite=Lax`;

export const LANG_NAMES: Record<Lang, { short: string; long: string; htmlLang: string; ogLocale: string }> = {
  en: { short: "EN", long: "English", htmlLang: "en", ogLocale: "en_US" },
  vi: { short: "VI", long: "Tiếng Việt", htmlLang: "vi", ogLocale: "vi_VN" },
};

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Split `/vi/services` into `vi` + `/services`; unprefixed paths are English. */
export function splitLang(pathname: string): { lang: Lang; path: string } {
  const match = /^\/(vi)(\/.*)?$/.exec(pathname);
  if (!match) return { lang: DEFAULT_LANG, path: pathname };
  return { lang: "vi", path: match[2] || "/" };
}

/**
 * Point an internal href at the given language. External links, mail/tel
 * links, bare fragments and non-page endpoints (feeds, API, admin) pass
 * through unchanged; an href that already carries a language is re-pointed.
 */
export function localizeHref(href: string, lang: Lang): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [, pathname = "/", rest = ""] = /^([^?#]*)(.*)$/.exec(href) ?? [];
  const { path } = splitLang(pathname);
  if (/^\/(api|_emdash)(\/|$)|\.(xml|txt)$/.test(path)) return href;
  if (lang === DEFAULT_LANG) return `${path}${rest}`;
  return `/${lang}${path === "/" ? "" : path}${rest}`;
}

/** The current request's language, as set by middleware.ts. */
export function getLang(locals: { lang?: Lang }): Lang {
  return locals.lang ?? DEFAULT_LANG;
}

/**
 * Runs in <head> before first paint, like the theme script in Base.astro.
 * A stored switcher choice wins; without one, an English page sends a visitor
 * whose browser prefers Vietnamese to the /vi copy. A Vietnamese URL followed
 * on purpose is never bounced to English unless the visitor chose English.
 * Crawlers keep the URL they asked for — hreflang tells them about the other.
 */
export const LANG_SCRIPT = `(() => {
  const page = document.documentElement.dataset.lang;
  let stored = null;
  try { stored = localStorage.getItem(${JSON.stringify(LANG_STORAGE_KEY)}); } catch {}
  // Choices made before the cookie existed: copy them over for the edge rule.
  if ((stored === "en" || stored === "vi") && !document.cookie.includes(${JSON.stringify(LANG_STORAGE_KEY + "=")})) {
    document.cookie = ${JSON.stringify(LANG_COOKIE)}.replace("%s", stored);
  }
  // Whichever of the two the browser lists first: an English UI with
  // Vietnamese as a second language stays on English.
  const first = (navigator.languages || [navigator.language]).find((code) => /^(vi|en)\\b/i.test(code || ""));
  const prefersVi = /^vi/i.test(first || "");
  const wanted = stored === "en" || stored === "vi" ? stored : page === "en" && prefersVi ? "vi" : page;
  if (wanted === page) return;
  const target = document.querySelector('link[rel="alternate"][hreflang="' + wanted + '"]');
  // Alternates carry the canonical origin; keep previews and dev on their own.
  if (target) location.replace(new URL(target.href).pathname + location.search + location.hash);
})();`;
