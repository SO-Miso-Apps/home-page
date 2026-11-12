/**
 * The kinds of post the blog writes. Each type has its own research sources,
 * article structure, cover kicker and category.
 *
 * Priorities (2026-11-12): how-to, problem → solution and feature-specific
 * guides first; comparisons, developer guides and research next. TARGET_MIX is
 * the share of posts each type should have when Claude picks the topic.
 */

export const ARTICLE_TYPES = [
	"howto",
	"problem",
	"feature",
	"best",
	"alternatives",
	"versus",
	"technical",
	"research",
] as const;

export type ArticleType = (typeof ARTICLE_TYPES)[number];

/** Comparison posts research the App Store only; the others read Shopify docs and the web. */
export type TypeFamily = "comparison" | "guide" | "developer" | "evidence";

export interface TypeInfo {
	label: string;
	family: TypeFamily;
	/** Example titles, also shown to Claude when it picks a topic. */
	examples: string[];
	/** Small caps line at the top right of the cover. */
	kicker: string;
	/** Category slug (see CATEGORIES in writer.ts). */
	category: string;
	/** Share of posts when Claude picks the topic; sums to 1. */
	share: number;
}

export const TYPE_INFO: Record<ArticleType, TypeInfo> = {
	howto: {
		label: "How-to / tutorial",
		family: "guide",
		examples: ["How to add a wishlist to Shopify", "How to add a sticky add to cart button in Shopify"],
		kicker: "HOW-TO GUIDE",
		category: "how-to",
		share: 0.2,
	},
	problem: {
		label: "Problem → solution",
		family: "evidence",
		examples: [
			"Why Shopify customers abandon wishlists",
			"Why Shopify shoppers leave the product page without adding to cart",
		],
		kicker: "PROBLEM SOLVED",
		category: "troubleshooting",
		share: 0.15,
	},
	feature: {
		label: "Feature-specific",
		family: "guide",
		examples: [
			"How to set up price drop alerts in Shopify",
			"How to hide a shipping rate for some zip codes in Shopify",
		],
		kicker: "FEATURE GUIDE",
		category: "how-to",
		share: 0.2,
	},
	best: {
		label: "Comparison: best apps",
		family: "comparison",
		examples: ["Best wishlist apps for Shopify", "Best sticky add to cart apps for Shopify"],
		kicker: "BEST APPS COMPARED",
		category: "app-comparisons",
		share: 0.12,
	},
	alternatives: {
		label: "Comparison: alternatives",
		family: "comparison",
		examples: ["Wishlist Plus alternatives for Shopify", "Rewind alternatives for Shopify"],
		kicker: "ALTERNATIVES COMPARED",
		category: "app-comparisons",
		share: 0.08,
	},
	versus: {
		label: "Comparison: A vs B",
		family: "comparison",
		examples: ["Wishlist Hero vs Themivo Wishlist & Alerts", "Wishlist Plus vs Wishlist King"],
		kicker: "HEAD TO HEAD",
		category: "app-comparisons",
		share: 0.05,
	},
	technical: {
		label: "Technical / developer",
		family: "developer",
		examples: ["Shopify wishlist API integration guide", "How to read customer metafields in Liquid"],
		kicker: "DEVELOPER GUIDE",
		category: "developers",
		share: 0.1,
	},
	research: {
		label: "Case study / research",
		family: "evidence",
		examples: ["Does a wishlist increase conversion rates?", "Do back in stock alerts bring back sales?"],
		kicker: "RESEARCH",
		category: "research",
		share: 0.1,
	},
};

export function isArticleType(value: unknown): value is ArticleType {
	return typeof value === "string" && (ARTICLE_TYPES as readonly string[]).includes(value);
}

export function isComparison(type: ArticleType): boolean {
	return TYPE_INFO[type].family === "comparison";
}

/** Best guess from a title, for posts written before types were recorded. */
export function guessType(title: string): ArticleType {
	const t = title.toLowerCase();
	if (/\bvs\.?\b|\bversus\b/.test(t)) return "versus";
	if (/alternative/.test(t)) return "alternatives";
	if (/\bbest\b.*\bapps?\b/.test(t)) return "best";
	if (/\b(api|graphql|liquid|metafields?|webhooks?|theme app extension|app proxy|developer|integration guide|storefront api|hydrogen)\b/.test(t)) {
		return "technical";
	}
	if (/^(does|do|is|are|can|will)\b|\b(data|study|statistics|research|benchmarks?)\b/.test(t)) return "research";
	if (/^why\b|\b(fix|not working|problem|mistakes?|abandon\w*)\b/.test(t)) return "problem";
	if (/^how to (set up|enable|turn on|configure|create|hide|show|rename|schedule|send)\b/.test(t)) return "feature";
	return "howto";
}

/**
 * An optional type prefix on a queued topic, e.g. "feature: How to set up price
 * drop alerts in Shopify". Returns the topic without the prefix.
 */
export function parseQueuedTopic(line: string): { type: ArticleType | null; topic: string } {
	const match = line.match(/^\s*\[?\s*([a-z-]+)\s*\]?\s*:\s*(.+)$/i);
	if (match) {
		const key = match[1].toLowerCase().replace(/-/g, "");
		const alias: Record<string, ArticleType> = { tutorial: "howto", vs: "versus", alternative: "alternatives", developer: "technical", casestudy: "research" };
		const type = isArticleType(key) ? key : (alias[key] ?? null);
		if (type) return { type, topic: match[2].trim() };
	}
	return { type: null, topic: line.trim() };
}

/** The type furthest below its target share, given the types of the posts so far. */
export function nextTypeByMix(written: ArticleType[]): ArticleType {
	const total = written.length + 1;
	let best: ArticleType = ARTICLE_TYPES[0];
	let bestGap = -Infinity;
	for (const type of ARTICLE_TYPES) {
		const count = written.filter((t) => t === type).length;
		const gap = TYPE_INFO[type].share * total - count;
		// ARTICLE_TYPES is in priority order, so ties go to the higher priority.
		if (gap > bestGap + 1e-9) {
			best = type;
			bestGap = gap;
		}
	}
	return best;
}
