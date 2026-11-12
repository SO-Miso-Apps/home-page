// An app's App Store rating, and the studio-wide summary built from it. Shared
// by the home hero's proof line, ReviewBand and the app pages so they can never
// show different numbers.
//
// Source of truth is the listing itself, synced into app-store-media.json by
// scripts/sync-app-store-media.mjs. The CMS rating fields are only a fallback
// for apps without a synced Shopify listing (a Shopline app, say), because a
// number typed by hand goes stale the day a new review lands.
import type { ContentEntry } from "emdash";
import type { App } from "../../emdash-env";
import { getListing, type ListingRating } from "./app-store";

export type Rating = ListingRating;

/** The app's rating, or null when it has no reviews to show. */
export function getRating(app: ContentEntry<App>): Rating | null {
  const listing = getListing(app.data.app_store_url);
  if (listing && listing.rating !== undefined) {
    return listing.rating && listing.rating.count > 0 ? listing.rating : null;
  }
  const { rating_value: value, review_count: count } = app.data;
  return typeof value === "number" && typeof count === "number" && count > 0 ? { value, count } : null;
}

export interface RatingSummary {
  /** Apps that have at least one review. */
  rated: ContentEntry<App>[];
  totalReviews: number;
  /** Review-weighted average, or null when no app has a review yet. */
  average: number | null;
}

export function summarizeRatings(apps: ContentEntry<App>[]): RatingSummary {
  const withRating = apps.flatMap((app) => {
    const rating = getRating(app);
    return rating ? [{ app, rating }] : [];
  });
  const totalReviews = withRating.reduce((total, { rating }) => total + rating.count, 0);
  // Weighted by review count, so one five-star app with a single review cannot
  // outvote an app with a hundred.
  const average = totalReviews
    ? withRating.reduce((total, { rating }) => total + rating.value * rating.count, 0) / totalReviews
    : null;
  return { rated: withRating.map(({ app }) => app), totalReviews, average };
}
