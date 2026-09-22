// The core:recent-posts sidebar widget hardcodes /posts/{slug} links
// (emdash RecentPosts.astro:39); this site serves posts at /blog/{slug}.
// Redirect so every sidebar link resolves instead of 404ing.
import type { APIRoute } from "astro";
import { decodeSlug } from "emdash";

export const GET: APIRoute = ({ params, redirect }) => {
  const slug = decodeSlug(params.slug);
  if (!slug) return new Response("Bad request", { status: 400 });
  return redirect(`/blog/${slug}`, 307);
};
