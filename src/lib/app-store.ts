// Each app's icon and media as its Shopify App Store listing shows them,
// synced into app-store-media.json by scripts/sync-app-store-media.mjs and
// looked up by the handle in the app's app_store_url.
import appStoreMedia from "../app-store-media.json";

export type ListingMedia = { type: "video"; youtubeId: string } | { type: "image"; src: string; alt: string };
export interface ListingRating {
  value: number;
  count: number;
}
export interface Listing {
  icon: string;
  media: ListingMedia[];
  /** As of the last sync: null when the listing has no reviews yet; absent
      when the sync predates ratings. */
  rating?: ListingRating | null;
}

// Listings Shopify has moved to a new handle, for app_store_url values still
// saved in the CMS under the old one.
const MOVED: Record<string, string> = {
  "tierly-b2b-company-pricing": "pactly-b2b-company-pricing",
};

const listings = appStoreMedia as Record<string, Listing>;

export function getListing(appStoreUrl: string | null | undefined): Listing | undefined {
  if (!appStoreUrl) return undefined;
  let handle: string | undefined;
  try {
    handle = new URL(appStoreUrl).pathname.split("/").filter(Boolean)[0];
  } catch {
    return undefined;
  }
  return handle ? listings[MOVED[handle] ?? handle] : undefined;
}

/** Shopify's CDN resizes listing images by query string. */
export const sizedIcon = (src: string, size: number) => `${src}?width=${size}&height=${size}`;
