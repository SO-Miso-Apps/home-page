// The core:recent-posts sidebar widget hardcodes /posts/{slug} links
// (emdash RecentPosts.astro:39); this site serves posts at /blog/{slug}.
// Redirect so every sidebar link resolves instead of 404ing.
import type { APIRoute } from "astro";
import { decodeSlug } from "emdash";
import { getLang, localizeHref, splitLang } from "../../i18n";

export const GET: APIRoute = ({ params, redirect, locals, url }) => {
  // Reached through the /vi rewrite, params come back empty; the path still has the slug.
  const slug = decodeSlug(params.slug ?? splitLang(url.pathname).path.split("/")[2]);
  if (!slug) return new Response("Bad request", { status: 400 });
  return redirect(localizeHref(`/blog/${slug}`, getLang(locals)), 307);
};
