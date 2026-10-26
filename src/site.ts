// Site identity strings shared by the HTML shell (Base.astro) and the
// RSS channel header (rss.xml.ts) so the feed can never drift from the site.
export const SITE_TITLE = "Miso Apps";
export const SITE_DESCRIPTION =
  "Miso Apps designs and customizes Shopify themes, and builds focused Shopify apps for automation, conversion, and AI-readable store data.";

export const SITE_FEED_TITLE = `${SITE_TITLE} Blog`;

// Mirrors the address in the `footer-contact` widget area, which is the
// editor-facing copy of record. Code-side links (service quotes, for example)
// need a literal, so it lives here rather than repeated per component.
export const CONTACT_EMAIL = "hi@misoapps.com";
export const CONTACT_PHONE = "+84 35-7654-619";
export const CONTACT_PHONE_HREF = "tel:+84357654619";

export const SITE_DESCRIPTION_VI =
  "Miso Apps thiết kế và tùy chỉnh theme Shopify, đồng thời làm các app Shopify gọn nhẹ giúp cửa hàng tự động hóa việc vặt, bán tốt hơn và dễ được AI đọc hiểu.";

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
