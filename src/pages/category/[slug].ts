// The core:categories sidebar widget hardcodes /category/{slug} links
// (emdash Categories.astro:23); this site lists posts at /blog?category=.
// Redirect so every sidebar link resolves instead of 404ing.
import type { APIRoute } from "astro";
import { getLang, localizeHref, splitLang } from "../../i18n";

export const GET: APIRoute = ({ params, redirect, locals, url }) => {
  // Reached through the /vi rewrite, params come back empty; the path still has the slug.
  const slug = params.slug ?? splitLang(url.pathname).path.split("/")[2];
  if (!slug) return new Response("Bad request", { status: 400 });
  return redirect(localizeHref(`/blog?category=${encodeURIComponent(slug)}`, getLang(locals)), 307);
};
