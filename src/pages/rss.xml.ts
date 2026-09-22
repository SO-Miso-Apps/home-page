import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

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
      const data = post.data as { title: string; excerpt?: string };
      const link = new URL(`/blog/${post.id}`, base).toString();
      return `    <item>
      <title>${escapeXml(data.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(data.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Miso Apps Blog</title>
    <link>${base}</link>
    <description>Product updates and merchant playbooks from the Miso Apps team.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
