import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";
import { escapeXml } from "../site";
import { DEFAULT_LANG, LANGS, localizeHref } from "../i18n";

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

  // lastmod is the entry's own last edit, so a crawler revisits only what
  // changed. A listing takes its newest entry's date; /services is code-only
  // and has no reliable date, so it goes without one.
  type Dated = { data: { updatedAt?: Date | string | null; publishedAt?: Date | string | null } };
  const lastmod = (e: Dated) => {
    const date = new Date(e.data.updatedAt ?? e.data.publishedAt ?? NaN);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };
  const newest = (entries: Dated[]) =>
    entries.map(lastmod).reduce<Date | undefined>((max, d) => (d && (!max || d > max) ? d : max), undefined);

  const urls: Array<{ path: string; lastmod?: Date }> = [
    { path: "/", lastmod: newest(apps.entries) },
    { path: "/blog", lastmod: newest(posts.entries) },
    { path: "/services" },
    ...apps.entries.map((e) => ({ path: `/apps/${e.id}`, lastmod: lastmod(e) })),
    ...posts.entries.map((e) => ({ path: `/blog/${e.id}`, lastmod: lastmod(e) })),
    ...pages.entries.map((e) => ({ path: `/${e.id}`, lastmod: lastmod(e) })),
  ];

  // Every page exists in each language (untranslated entries fall back to
  // English), so each URL lists all of its alternates, itself included.
  const abs = (u: string) => escapeXml(new URL(u, base).toString());
  const alternates = (u: string) =>
    [
      ...LANGS.map((lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${abs(localizeHref(u, lang))}"/>`),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${abs(localizeHref(u, DEFAULT_LANG))}"/>`,
    ].join("");
  const entries = urls.flatMap(({ path, lastmod: date }) => {
    const mod = date ? `<lastmod>${date.toISOString()}</lastmod>` : "";
    return LANGS.map((lang) => `  <url><loc>${abs(localizeHref(path, lang))}</loc>${mod}${alternates(path)}</url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
