import { defineMiddleware } from "astro:middleware";
import { DEFAULT_LANG, splitLang } from "./i18n";

// Admin and API routes keep whatever path shape their clients send.
const NO_SLASH_REDIRECT = /^\/(_emdash|api)(\/|$)/;

// /vi/* renders the same page files as the English routes: strip the prefix,
// rewrite, and leave the language on `locals` for the page to read. Astro.url
// then holds the unprefixed path, so pages build language-aware links with
// localizeHref rather than from the request URL.
export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;

  // One URL per page: the site links without a trailing slash, so `/blog/x/`
  // answers 301 to `/blog/x` instead of serving a duplicate with status 200.
  if (
    pathname.length > 1 &&
    pathname.endsWith("/") &&
    (context.request.method === "GET" || context.request.method === "HEAD") &&
    !NO_SLASH_REDIRECT.test(pathname)
  ) {
    return context.redirect(`${pathname.replace(/\/+$/, "") || "/"}${search}`, 301);
  }

  const { lang, path } = splitLang(pathname);
  context.locals.lang = lang;
  if (lang === DEFAULT_LANG) return next();
  return next(`${path}${search}`);
});
