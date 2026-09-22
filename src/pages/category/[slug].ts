// The core:categories sidebar widget hardcodes /category/{slug} links
// (emdash Categories.astro:23); this site lists posts at /blog?category=.
// Redirect so every sidebar link resolves instead of 404ing.
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ params, redirect }) => {
  const slug = params.slug;
  if (!slug) return new Response("Bad request", { status: 400 });
  return redirect(`/blog?category=${encodeURIComponent(slug)}`, 307);
};
