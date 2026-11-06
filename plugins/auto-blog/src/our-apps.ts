/**
 * Our own live Shopify apps (Themivo and its sister studio Miso Apps), as listed
 * on the Shopify App Store. Comparison posts add one of these as a contender only
 * when the post's category is in its `niches`.
 *
 * Facts (pricing, features, ratings) checked on the App Store listings on 2026-11-03 (Pactly and SO: Shipping rules on 2026-11-04). Update this file when a
 * listing, price or feature changes, or when a new app goes live. Never list an
 * app here before its App Store page is public.
 */

import { BRAND } from "./brand.js";

export type Publisher = "Themivo" | "Miso Apps";

export interface OurApp {
	name: string;
	publisher: Publisher;
	url: string;
	/** App categories this app genuinely competes in. */
	niches: string[];
	pricing: string;
	/** App Store rating as listed, e.g. "5.0 (5 reviews)", or "No reviews yet". */
	rating: string;
	features: string[];
	/** Honest limits, so the article can say who should pick something else. */
	limits: string[];
}

export const OUR_APPS: OurApp[] = [
	{
		name: "Themivo Wishlist & Alerts",
		publisher: "Themivo",
		url: "https://apps.shopify.com/themivo-wishlist-alerts",
		niches: [
			"wishlist apps",
			"save for later",
			"back in stock alerts",
			"price drop alerts",
			"low stock alerts",
		],
		rating: "No reviews yet",
		pricing: "Free (no paid plans listed).",
		features: [
			"Wishlists for guests that carry over when the shopper signs in",
			"Back in stock, price drop, low stock and reminder emails for saved products",
			"Alerts sent directly or through Klaviyo, Omnisend or Shopify Flow",
			"Reports on the most saved products and on orders that came from a wishlist",
			"Wishlist buttons styled to match the theme, set up in a live preview",
			"Shareable wishlists and POS support",
		],
		limits: [
			"Launched in October 2026, so it has few or no reviews yet",
			"Focused on wishlists and stock or price alerts, not a full email marketing tool",
		],
	},
	{
		name: "SO: Sticky Add To Cart",
		publisher: "Miso Apps",
		url: "https://apps.shopify.com/so-sticky-add-to-cart",
		niches: ["sticky add to cart apps", "sticky cart bar", "product page buy button bar"],
		rating: "No reviews yet",
		pricing: "Free (no paid plans listed).",
		features: [
			"Sticky bar with Add to Cart and Buy Now buttons",
			"Keeps variant and quantity choices in sync with the main product form",
			"Adjustable size, position, colors and text for mobile and desktop",
			"Multi-language text",
			"Wishlist button inside the bar",
		],
		limits: [
			"Few reviews so far",
			"Does one job (the sticky bar); it is not an upsell or cart drawer app",
		],
	},
	{
		name: "SO: Auto Tags | All-in-One",
		publisher: "Miso Apps",
		url: "https://apps.shopify.com/so-operations-suite-with-ai",
		niches: [
			"auto tagging apps",
			"order tagging",
			"customer tagging",
			"product tagging",
			"bulk tag editing and cleanup",
		],
		rating: "5.0 (3 reviews)",
		pricing:
			"Free plan (unlimited rules, 200 tags a month, 500 bulk and 500 cleaner operations a month, 10 AI rule generations). Basic $4.99/month or $49.99/year. Pro $14.99/month or $144.99/year (unlimited, plus backup and revert). 7-day free trial on paid plans.",
		features: [
			"Rule-based auto tagging for orders, customers and products",
			"Describe a rule in plain language and AI drafts it",
			"Bulk add, replace, merge and clean up tags",
			"Backdated runs that tag historical records",
			"120+ prebuilt workflows; works with Shopify Flow and Klaviyo",
			"Backup and revert of tag changes on the Pro plan",
		],
		limits: ["Small number of reviews so far", "Tagging focused; not a general workflow builder"],
	},
	{
		name: "SO: Product History & Revert",
		publisher: "Miso Apps",
		url: "https://apps.shopify.com/so-history-revert",
		niches: [
			"product backup apps",
			"product version history",
			"undo product edits",
			"store audit log",
			"restore deleted products",
		],
		rating: "5.0 (5 reviews)",
		pricing:
			"Free (10 products tracked, 1 month of history, 10 reverts a month). Starter $7.99/month, Growth $12.99/month, Scale $17.99/month, Enterprise $34.99/month (up to 15,000 products and 24 months of history); yearly prices available. 7-day free trial on paid plans.",
		features: [
			"Logs changes to products, variants, images, metafields, SEO, tags and collections",
			"Old and new values side by side",
			"Revert one field, one edit, or many changes at once",
			"Roll a product back to an earlier point in time",
			"Restore deleted products as drafts with variants, images and collections",
		],
		limits: [
			"Covers products only, not a full store backup (orders, customers, theme)",
			"Tracked-product limits on each plan",
		],
	},
	{
		name: "Pactly: B2B Company Pricing",
		publisher: "Miso Apps",
		url: "https://apps.shopify.com/pactly-b2b-company-pricing",
		niches: [
			"b2b pricing apps",
			"wholesale pricing apps",
			"customer-specific pricing",
			"company and location price lists",
			"tiered pricing for shopify b2b companies",
		],
		rating: "No reviews yet",
		pricing:
			"Free (1 price tier, up to 10 company locations, storewide % off). Starter $19/month or $190/year (5 price tiers, 200 company locations, collection and product % rules on up to 20 collections, fixed variant prices, CSV import and export). Growth $39/month or $390/year (unlimited tiers and company locations, rules on up to 100 collections, priority support). 14-day free trial on paid plans.",
		features: [
			"Negotiated price tiers on top of Shopify's native Companies feature, past the 3-catalog limit outside Shopify Plus",
			"Tiers that combine storewide, collection and product discounts",
			"Assign a tier to a whole company or to single locations, in bulk",
			"Fixed net prices per variant and tier, with CSV import and export",
			"Logged-in buyers see their prices on product pages; one automatic discount charges the same prices at checkout",
			"A simulator that shows what a buyer pays and which rule set the price",
		],
		limits: [
			"Launched in November 2026, so it has no reviews yet",
			"Built on Shopify's Companies (B2B) feature; it prices company buyers, not general customer tags or segments",
			"English only",
		],
	},
	{
		name: "SO: Shipping rules",
		publisher: "Miso Apps",
		url: "https://apps.shopify.com/so-shipping-rules",
		niches: [
			"shipping rules apps",
			"hide shipping rates",
			"rename or reorder delivery methods at checkout",
			"conditional shipping rates",
			"estimated delivery date apps",
		],
		rating: "No reviews yet",
		pricing: "Free (no paid plans listed).",
		features: [
			"Hide, show, rename or reorder any delivery method at checkout",
			"36 conditions across address, cart, products, customer and time (for example country, zip code, cart total, weight, collections, customer tags, B2B status, time of day)",
			"Visual rule builder with AND/OR groups, no code or scripts",
			"Estimated delivery dates based on delivery days and order cutoff",
			"Export rules to a file and import them into other stores",
		],
		limits: [
			"Launched in October 2026, so it has no reviews yet",
			"Controls which existing delivery methods show and how; it does not calculate carrier rates or print labels",
			"English only",
		],
	},
];

/** Apps announced but not live. They must never appear as an option. */
export const UNRELEASED = [
	"a Themivo bundles and frequently-bought-together app",
	"a Themivo cart and post-purchase upsell app",
];

/** The italic line that goes under an app's heading in an article. */
export function disclosureFor(app: OurApp): string {
	return app.publisher === BRAND.publisher
		? "_Disclosure: we make this app._"
		: `_Disclosure: ${app.publisher}, our sister studio, makes this app._`;
}

export function ourAppsBrief(): string {
	const apps = OUR_APPS.map((app) =>
		[
			`### ${app.name} (by ${app.publisher})`,
			`Disclosure line: ${disclosureFor(app)}`,
			`App Store: ${app.url}`,
			`Competes in: ${app.niches.join("; ")}`,
			`Pricing: ${app.pricing}`,
			`Rating on the App Store: ${app.rating}`,
			`Features:\n${app.features.map((f) => `- ${f}`).join("\n")}`,
			`Honest limits:\n${app.limits.map((l) => `- ${l}`).join("\n")}`,
		].join("\n"),
	).join("\n\n");
	return `${apps}\n\nNot available yet, never present as an option: ${UNRELEASED.join("; ")}.`;
}
