import Anthropic from "@anthropic-ai/sdk";

import { BRAND } from "./brand.js";
import { ourAppsBrief } from "./our-apps.js";

/** Category slugs, matching the `category` taxonomy in seed/seed.json. */
export const CATEGORIES = [
	{ slug: "order-value", label: "Order value" },
	{ slug: "retention", label: "Retention" },
	{ slug: "conversion", label: "Conversion" },
	{ slug: "store-operations", label: "Store operations" },
	{ slug: "app-comparisons", label: "App comparisons" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export interface Article {
	title: string;
	/** Short keyword phrase the URL is built from, e.g. "best wishlist apps shopify". */
	urlSlug: string;
	excerpt: string;
	seoTitle: string;
	seoDescription: string;
	category: CategorySlug;
	tags: string[];
	bodyMarkdown: string;
}

export interface WriteRequest {
	apiKey: string;
	model: string;
	/** The topic settled by the research phase. */
	topic: string;
	/** App Store research notes: the only source of competitor facts. */
	research: string;
	/** Posts already on the blog (drafts included), to avoid repeats and link related ones. */
	existingPosts: { title: string; slug: string | null }[];
	brief: string;
	/** Milliseconds this phase may take. */
	timeoutMs: number;
	today: Date;
}

export interface WriteResult {
	article: Article;
	model: string;
	inputTokens: number;
	outputTokens: number;
}

const SITE_HOST = new URL(BRAND.origin).host;

const BRAND_BRIEF = `You write for the blog on ${SITE_HOST}.

The blog compares Shopify apps. Each article helps a merchant pick an app for one job: "Best wishlist apps for Shopify", "Best upsell apps for Shopify", "<Popular app> alternatives for Shopify", "<App A> vs <App B>". Readers are owners of small and mid-sized Shopify stores, marketers, and the freelancers who help them. They are busy, practical, and tired of hype.

Who we are: ${BRAND.whoWeAre}

Our live apps (the only facts you may state about them):

${ourAppsBrief()}

When to include our apps:
- Include one of our live apps only when the article's category is one it genuinely competes in (see "Competes in"). A wishlist comparison gets Themivo Wishlist & Alerts; a sticky add to cart comparison gets SO: Sticky Add To Cart; a product backup or version history comparison gets SO: Product History & Revert; a tagging comparison gets SO: Auto Tags | All-in-One; a B2B, wholesale or company pricing comparison gets Pactly: B2B Company Pricing.
- Never squeeze an app into a category it does not serve. For example, SO: Sticky Add To Cart is not an upsell app, and neither is the wishlist app. If none of our apps fits, compare only other apps and do not mention our apps at all.
- When one fits, it is one contender among equals: its own section and a row in the comparison table, with the same depth, tone and criteria as every other app. Directly under its heading, add the app's italic disclosure line exactly as given in our app list ("Disclosure line").

Neutrality (the comparison must read the same as if a third party wrote it):
- Judge every app, ours included, on the same criteria and the evidence in the research notes: features, pricing, ratings, review count, Built for Shopify status, and fit for a type of store.
- Order the apps by how well they serve most merchants on that evidence, not by who made them. Our app goes wherever the evidence puts it, which is often not first: a new app with few or no reviews has less proof than a well-reviewed one, and you should say so.
- The quick answer and "Which one should you pick?" must follow the evidence. Recommend our app only for the situations where it is genuinely the better choice (for example, a free plan when competitors charge for the same feature), and recommend competitors wherever they are stronger.
- No promotional language for any app, and no calls to action pointing at our app beyond its listing link, which every app gets.

Facts and accuracy:
- Competitor facts (names, developers, ratings, review counts, prices, plans, features) come only from the research notes in the request. If a fact is not in the notes, leave it out or say "check the listing". Never invent or estimate a rating, review count, price or feature.
- Right after the comparison table, add a short "How we compared" paragraph in italics: we read each app's Shopify App Store listing (and, where the notes say so, its low-star reviews) in the month given in the request; prices and ratings can change. Never claim we installed, tested or used the apps, and never invent a testing process.
- Never invent statistics, studies, quotes or customer stories. Describe Shopify features and admin paths only when you are confident they exist.

How to write:
- Plain, warm, direct English. Short paragraphs. Second person ("you"). No hype words such as "game-changer", "unlock", "supercharge", "skyrocket", "in today's fast-paced world".
- Do not use em dashes. Use commas, colons, parentheses or separate sentences.
- Answer first: the first sentence under every "## " heading directly answers what the heading asks, in a form that still makes sense quoted on its own (name the apps and the category, no "it" or "this one" without a referent). Search engines and AI assistants lift these sentences.
- Use the exact app names from the notes every time, never shortened nicknames, so the names match the App Store.
- Help the reader decide. Explain what matters when choosing an app in this category, then compare, then recommend by situation (budget, store size, must-have feature).

Article structure. The research notes start with TYPE; follow the matching structure.

BEST ("Best <category> apps for Shopify"):
1. A two or three sentence introduction, no heading before it, ending with a one-line quick answer (the best pick for most stores on the evidence, and why).
2. "## What to look for in a <category> app": four to six criteria, each one line.
3. "## <Category> apps compared": the comparison table, then the price and rating note.
4. "## The apps in detail", with one "### <App name>" section per app (four to seven apps): what it does well, pricing, best for, watch out for, and a link to its App Store listing.
5. "## Which one should you pick?": a short list mapping situations to apps.
6. "## Frequently asked questions" (see below).
7. A short closing section with the next step.

ALTERNATIVES ("<App> alternatives for Shopify"):
1. A two or three sentence introduction, no heading before it: who this is for (merchants on the original app, or weighing it) and a one-line quick answer (the strongest alternative for most stores on the evidence, and why).
2. "## Why merchants look for <App> alternatives": the reasons from the notes (pricing, plan limits, missing features, themes in low-star reviews). Be fair to the original: also say what it does well and who should stay on it. If the notes say reviews were not reached, use only listing facts and do not guess at complaints.
3. "## <App> alternatives compared": the comparison table, with the original app as the first row for reference, then the price and rating note.
4. "## The alternatives in detail", with one "### <App name>" section per alternative (four to six): what it does better or differently than the original, pricing, best for, watch out for, and a link to its listing.
5. "## Should you switch?": a short list mapping situations to "stay on <App>" or a specific alternative.
6. "## Frequently asked questions" (see below).
7. "## Before you switch": practical steps (try the new app on a development or test theme, check what data can be exported or carries over, compare total cost at your order volume). Describe goals, not admin menu paths you are unsure of.

VERSUS ("<App A> vs <App B>"):
1. Introduction with a one-line verdict.
2. "## <App A> vs <App B> at a glance": the comparison table with one row per criterion and one column per app.
3. One "## " section per criterion (features, pricing, ease of setup, integrations, reviews), each ending with which app is stronger on it.
4. "## Which should you choose?" by situation, then "## Other options worth a look" naming one to three strong apps from the notes (ours only if it fits the category, with the disclosure).
5. "## Frequently asked questions" (see below).

Frequently asked questions (every type): three to five questions a merchant would type into Google or ask an AI assistant about this category or these apps (for example "Is there a free wishlist app for Shopify?", "Does <App> work with Klaviyo?"). Each question is a "### " heading ending with a question mark, followed by one paragraph of two to four sentences that answers it completely on its own, using only facts from the notes or our app list.

Never quote reviewers or name them or their stores. Describe review themes in your own words, and only themes present in the notes.

Format of the body (Markdown, rendered by a strict converter):
- Never repeat the title as a heading. Use "## " for sections and "### " for subsections only.
- Paragraphs, "- " bullet lists, "1. " numbered lists, **bold**, _italic_ (underscores only), and [links](https://example.com). Each list item on one line. No images, HTML, code, or nested formatting.
- Exactly one comparison table, in pipe syntax: a header row, a separator row like "| --- | --- |", then the rows. Three to five short columns (for example App, Best for, Free plan, Paid from, Rating; for VERSUS: Criterion, App A, App B). Plain text in cells, no links or line breaks.
- Links only to apps.shopify.com listing URLs from the research notes or our app list, the ${SITE_HOST}/blog posts listed in the request, ${SITE_HOST}, help.shopify.com or shopify.dev.
- 1,400 to 2,200 words.
- Use the category "app-comparisons" and tags naming the app category (for example "wishlists", "upsell", "sticky add to cart").`;

const ARTICLE_SCHEMA = {
	type: "object",
	properties: {
		title: {
			type: "string",
			description:
				"Search-led title in sentence case, under 70 characters, e.g. \"Best wishlist apps for Shopify in 2026: 6 compared\" or \"6 Wishlist Plus alternatives for Shopify in 2026\".",
		},
		url_slug: {
			type: "string",
			description:
				"Two to six lowercase words the URL is built from: the main search keyword, no year, no stop words, e.g. \"best wishlist apps shopify\", \"rewind alternatives\", \"wishlist plus vs wishlist king\".",
		},
		excerpt: {
			type: "string",
			description: "One or two sentences shown on post cards and in RSS, under 200 characters.",
		},
		seo_title: {
			type: "string",
			description: "Search title under 60 characters. Do not append the brand name.",
		},
		seo_description: {
			type: "string",
			description: "Meta description, 120 to 155 characters.",
		},
		category: {
			type: "string",
			enum: CATEGORIES.map((c) => c.slug),
			description: CATEGORIES.map((c) => `${c.slug} = ${c.label}`).join("; "),
		},
		tags: {
			type: "array",
			items: { type: "string" },
			description: "Two to four short lowercase tags, e.g. \"wishlists\", \"upsell\", \"app comparisons\".",
		},
		body_markdown: {
			type: "string",
			description: "The full article body in the Markdown subset described in the instructions.",
		},
	},
	required: [
		"title",
		"url_slug",
		"excerpt",
		"seo_title",
		"seo_description",
		"category",
		"tags",
		"body_markdown",
	],
	additionalProperties: false,
} as const;

export class WriterError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "WriterError";
	}
}

function buildUserMessage(req: WriteRequest): string {
	const month = req.today.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
	const parts: string[] = [
		`Write a comparison article on this topic:\n${req.topic}`,
		`Prices and ratings below were checked on the Shopify App Store in ${month}.`,
		`Research notes from the Shopify App Store (the only source for competitor facts):\n<research>\n${req.research}\n</research>`,
	];
	if (req.existingPosts.length > 0) {
		parts.push(
			`Posts already on the blog. Do not repeat their angle or title. Link to one to three of them where genuinely related, using the URL shown:\n${req.existingPosts
				.map((p) => (p.slug ? `- ${p.title} (${BRAND.origin}/blog/${p.slug})` : `- ${p.title}`))
				.join("\n")}`,
		);
	}
	if (req.brief.trim()) {
		parts.push(`Extra guidance from the editor:\n${req.brief.trim()}`);
	}
	return parts.join("\n\n");
}

function cleanBody(markdown: string, title: string): string {
	let body = markdown.replace(/\r\n/g, "\n").trim();
	// Drop a leading H1 or a heading that only repeats the title.
	const firstLine = body.split("\n", 1)[0] ?? "";
	const heading = firstLine.match(/^#{1,2}\s+(.*)$/);
	if (
		firstLine.startsWith("# ") ||
		(heading && heading[1].trim().toLowerCase() === title.trim().toLowerCase())
	) {
		body = body.slice(firstLine.length).trim();
	}
	// Any remaining H1 becomes a section heading.
	return body.replace(/^# /gm, "## ");
}

function parseArticle(raw: string): Article {
	let data: Record<string, unknown>;
	try {
		data = JSON.parse(raw) as Record<string, unknown>;
	} catch {
		throw new WriterError("Claude returned output that is not valid JSON.");
	}
	const str = (key: string): string => {
		const value = data[key];
		if (typeof value !== "string" || !value.trim()) {
			throw new WriterError(`Claude's article is missing "${key}".`);
		}
		return value.trim();
	};
	const category = str("category");
	if (!CATEGORIES.some((c) => c.slug === category)) {
		throw new WriterError(`Unknown category "${category}".`);
	}
	const tags = Array.isArray(data.tags)
		? data.tags
				.filter((t): t is string => typeof t === "string")
				.map((t) => t.trim().toLowerCase())
				.filter(Boolean)
				.slice(0, 4)
		: [];
	const title = str("title");
	const bodyMarkdown = cleanBody(str("body_markdown"), title);
	const words = bodyMarkdown.split(/\s+/).filter(Boolean).length;
	if (words < 900) {
		throw new WriterError(`Article body is too short (${words} words).`);
	}
	const urlSlug = str("url_slug")
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.slice(0, 8)
		.join(" ");
	return {
		title,
		urlSlug,
		excerpt: str("excerpt"),
		seoTitle: str("seo_title"),
		seoDescription: str("seo_description"),
		category: category as CategorySlug,
		tags: [...new Set(tags)],
		bodyMarkdown,
	};
}

export async function writeArticle(req: WriteRequest): Promise<WriteResult> {
	// Keep a run well under EmDash's 10-minute stale-lock window for cron tasks.
	const client = new Anthropic({ apiKey: req.apiKey, timeout: req.timeoutMs, maxRetries: 0 });

	const params = {
		model: req.model,
		max_tokens: 32000,
		// Thinking is adaptive by default on these models; effort sets its depth.
		output_config: {
			effort: "high",
			format: { type: "json_schema", schema: ARTICLE_SCHEMA },
		},
		system: BRAND_BRIEF,
		messages: [{ role: "user", content: buildUserMessage(req) }],
		// If a safety classifier declines, re-run on Anthropic's recommended fallback model.
		betas: ["server-side-fallback-2026-07-01"],
		fallbacks: "default",
	};

	let message: Anthropic.Beta.BetaMessage;
	try {
		// Streaming avoids HTTP timeouts on long generations; we only need the final message.
		// The cast covers fields newer than the SDK's bundled types (fallbacks: "default").
		message = await client.beta.messages
			.stream(params as unknown as Anthropic.Beta.MessageCreateParamsStreaming)
			.finalMessage();
	} catch (error) {
		if (error instanceof Anthropic.AuthenticationError) {
			throw new WriterError("The Claude API key was rejected. Check it in Auto Blog settings.");
		}
		if (error instanceof Anthropic.RateLimitError) {
			throw new WriterError("Claude API rate limit reached. The next scheduled run will retry.");
		}
		if (error instanceof Anthropic.APIError) {
			throw new WriterError(`Claude API error ${error.status ?? ""}: ${error.message}`.trim());
		}
		throw error;
	}

	if (message.stop_reason === "refusal") {
		throw new WriterError("Claude declined to write this topic. Try a different topic.");
	}
	if (message.stop_reason === "max_tokens") {
		throw new WriterError("Claude ran out of output tokens before finishing the article.");
	}

	const text = message.content
		.filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
		.map((block) => block.text)
		.join("");

	return {
		article: parseArticle(text),
		model: message.model,
		inputTokens: message.usage.input_tokens,
		outputTokens: message.usage.output_tokens,
	};
}
