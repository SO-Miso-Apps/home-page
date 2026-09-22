// Site identity strings shared by the HTML shell (Base.astro) and the
// RSS channel header (rss.xml.ts) so the feed can never drift from the site.
export const SITE_TITLE = "Miso Apps";
export const SITE_DESCRIPTION =
  "Miso Apps designs and ships focused Shopify and Shopline apps for automation, conversion, and AI-readable storefront data.";

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
