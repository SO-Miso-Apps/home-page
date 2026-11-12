// Pulls each app's listing icon, media — the promo video or promotional
// image, then the screenshots, in the order the listing shows them — and its
// rating from the Shopify App Store into src/app-store-media.json, keyed by the
// listing handle (the path of an app's app_store_url). Re-run after a listing's
// media changes or it gets new reviews:
//
//   node scripts/sync-app-store-media.mjs
//
// The page reads the JSON at build time; images stay on Shopify's CDN.
import { writeFile } from "node:fs/promises";

const HANDLES = [
  "so-operations-suite-with-ai",
  "so-sticky-add-to-cart",
  "so-history-revert",
  "so-shipping-rules",
  "pactly-b2b-company-pricing",
];

const OUT = new URL("../src/app-store-media.json", import.meta.url);
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

const decode = (text) =>
  text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

async function readListing(handle) {
  const response = await fetch(`https://apps.shopify.com/${handle}`, { headers: { "user-agent": UA, "accept-language": "en" } });
  if (!response.ok) throw new Error(`${handle}: HTTP ${response.status}`);
  const html = await response.text();

  const media = [];
  const video = html.match(/youtube-nocookie\.com\/embed\/([\w-]{6,})/);
  if (video) media.push({ type: "video", youtubeId: video[1] });

  // The gallery is rendered more than once (inline, then the lightbox); the
  // first sighting of each image keeps the listing's order.
  const seen = new Set();
  const image = /<img[^>]*?alt="([^"]*)"[^>]*?(https:\/\/cdn\.shopify\.com\/app-store\/listing_images\/[^"?\s]+\/(?:desktop_screenshot|promotional_image)\/[^"?\s]+)/g;
  for (const [, alt, src] of html.matchAll(image)) {
    if (seen.has(src)) continue;
    seen.add(src);
    media.push({ type: "image", src, alt: decode(alt).replace(/\s+/g, " ").trim() });
  }
  const first = media.find((item) => item.type === "image");
  if (!first) throw new Error(`${handle}: no screenshots found — has the listing markup changed?`);

  // The page also shows other apps' icons; the listing's own sits in the same
  // listing_images folder as its screenshots.
  const folder = first.src.slice(0, first.src.indexOf("/", first.src.indexOf("listing_images/") + "listing_images/".length));
  const icon = html.match(new RegExp(`${folder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/icon/[^"?\\s]+`));
  if (!icon) throw new Error(`${handle}: no icon found in ${folder}`);

  // The listing's JSON-LD carries aggregateRating once it has a review;
  // before that the page says "No reviews yet". null means zero reviews.
  let rating;
  const value = html.match(/"ratingValue":\s*"?([\d.]+)"?/);
  const count = html.match(/"ratingCount":\s*"?(\d+)"?/);
  if (value && count) rating = { value: Number(value[1]), count: Number(count[1]) };
  else if (/No reviews yet/.test(html)) rating = null;
  else throw new Error(`${handle}: no rating found — has the listing markup changed?`);

  return { icon: icon[0], media, rating };
}

const result = {};
for (const handle of HANDLES) {
  result[handle] = await readListing(handle);
  const { media, rating } = result[handle];
  const stars = rating ? `${rating.value} from ${rating.count} reviews` : "no reviews";
  console.log(`${handle}: icon, ${media.map((item) => item.type).join(", ")}; ${stars}`);
}
await writeFile(OUT, `${JSON.stringify(result, null, 2)}\n`);
