import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://misoapps.com");
  const [apps, posts, pages] = await Promise.all([
    getEmDashCollection("apps"),
    getEmDashCollection("posts"),
    getEmDashCollection("pages"),
  ]);
  for (const result of [apps, posts, pages]) {
    if (result.error) {
      console.error("Sitemap query failed:", result.error);
      return new Response("Unable to build sitemap", { status: 500 });
    }
  }

  const urls: string[] = ["/", "/blog"];
  urls.push(...apps.entries.map((e) => `/apps/${e.id}`));
  urls.push(...posts.entries.map((e) => `/blog/${e.id}`));
  urls.push(...pages.entries.map((e) => `/${e.id}`));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, base)}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
