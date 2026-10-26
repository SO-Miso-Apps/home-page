import { defineMiddleware } from "astro:middleware";
import { DEFAULT_LANG, splitLang } from "./i18n";

// /vi/* renders the same page files as the English routes: strip the prefix,
// rewrite, and leave the language on `locals` for the page to read. Astro.url
// then holds the unprefixed path, so pages build language-aware links with
// localizeHref rather than from the request URL.
export const onRequest = defineMiddleware((context, next) => {
  const { lang, path } = splitLang(context.url.pathname);
  context.locals.lang = lang;
  if (lang === DEFAULT_LANG) return next();
  return next(`${path}${context.url.search}`);
});
