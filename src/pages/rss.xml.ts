import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";
import { SITE_DESCRIPTION, SITE_FEED_TITLE, escapeXml } from "../site";

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://misoapps.com");
  const { entries: posts, error } = await getEmDashCollection("posts", {
    orderBy: { published_at: "desc" },
    limit: 50,
  });
  if (error) {
    console.error("RSS query failed:", error);
    return new Response("Unable to build feed", { status: 500 });
  }

  const items = posts
    .map((post) => {
      const data = post.data as { title: string; excerpt?: string; publishedAt?: Date };
      const link = new URL(`/blog/${post.id}`, base).toString();
      // Loader maps the published_at column to a Date (publishedAt); fall back
      // to createdAt so every item carries an RFC 822 pubDate.
      const pubDate = (data.publishedAt ?? post.data.createdAt ?? new Date()).toUTCString();
      return `    <item>
      <title>${escapeXml(data.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(data.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_FEED_TITLE}</title>
    <link>${base}</link>
    <description>${SITE_DESCRIPTION}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
