import Anthropic from "@anthropic-ai/sdk";

import { type ArticleType, TYPE_INFO, isComparison } from "./article-types.js";
import { BRAND } from "./brand.js";
import { ourAppsBrief } from "./our-apps.js";

/**
 * Category slugs. The post's type decides its category (TYPE_INFO in
 * article-types.ts); categories missing from the site are created on first use.
 * The first four are from the original seed and kept for older posts.
 */
export const CATEGORIES = [
	{ slug: "order-value", label: "Order value" },
	{ slug: "retention", label: "Retention" },
	{ slug: "conversion", label: "Conversion" },
	{ slug: "store-operations", label: "Store operations" },
	{ slug: "app-comparisons", label: "App comparisons" },
	{ slug: "how-to", label: "How-to guides" },
	{ slug: "troubleshooting", label: "Problems and fixes" },
	{ slug: "developers", label: "For developers" },
	{ slug: "research", label: "Research" },
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
	/** The topic settled by the planning step. */
	topic: string;
	type: ArticleType;
	/** The angle from the planning step. */
	angle: string;
	/** Research notes: the only source of facts about other apps, Shopify features and studies. */
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

const COMMON_BRIEF = `You write for the blog on ${SITE_HOST}.

The blog helps Shopify merchants run better stores. It publishes how-to and feature guides, problem and fix posts, Shopify app comparisons, developer guides and evidence-led research posts. Readers are owners of small and mid-sized Shopify stores, marketers, the freelancers who help them, and (for developer posts) Shopify developers. They are busy, practical, and tired of hype.

Who we are: ${BRAND.whoWeAre}

Our live apps (the only facts you may state about them):

${ourAppsBrief()}

When to mention our apps:
- Mention one of our live apps only where it genuinely does the job the article is about (see "Competes in"). A wishlist topic can mention Themivo Wishlist & Alerts; a sticky add to cart topic SO: Sticky Add To Cart; product backups or edit history SO: Product History & Revert; tagging SO: Auto Tags | All-in-One; B2B, wholesale or company pricing Pactly: B2B Company Pricing; shipping rules, hiding or renaming shipping rates, or delivery dates SO: Shipping rules.
- Never squeeze an app into a topic it does not serve. For example, SO: Sticky Add To Cart is not an upsell app, and neither is the wishlist app. If none of our apps fits, do not mention our apps at all.
- When one fits, it is one option among equals, described with the same depth, tone and criteria as the other options in the notes. Wherever our app is named as an option (its own heading, or the paragraph that first presents it), add the app's italic disclosure line exactly as given in our app list ("Disclosure line"), once.
- Never present our app as the only way to do something when the notes show built-in features, other apps or custom code can do it too.

Neutrality (the article must read the same as if a third party wrote it):
- Judge every app, ours included, on the same criteria and the evidence in the research notes: features, pricing, ratings, review count, Built for Shopify status, and fit for a type of store.
- Recommend by evidence, not by who made the app. A new app with few or no reviews has less proof than a well-reviewed one, and you should say so. Recommend our app only for the situations where it is genuinely the better choice (for example, a free plan when others charge for the same feature).
- No promotional language for any app, and no calls to action pointing at our app beyond its listing link, which every app gets.

Facts and accuracy:
- Facts about other apps (names, developers, ratings, review counts, prices, plans, features), about Shopify (admin paths, settings, plan requirements, APIs) and about studies (figures, publishers, dates) come only from the research notes in the request. If a fact is not in the notes, leave it out or say "check the listing" or "check Shopify's help center". Never invent or estimate a rating, review count, price, feature, admin path, API field or statistic.
- Never invent statistics, studies, quotes or customer stories. Quote a figure only with its source named in the sentence and linked, and with its limits when the notes give them.
- Never claim we installed, tested or used anything, and never invent a testing process or a store we ran.

How to write:
- Plain, warm, direct English. Short paragraphs. Second person ("you"). No hype words such as "game-changer", "unlock", "supercharge", "skyrocket", "in today's fast-paced world".
- Do not use em dashes. Use commas, colons, parentheses or separate sentences.
- Answer first: the first sentence under every "## " heading directly answers what the heading asks, in a form that still makes sense quoted on its own (name the subject, no "it" or "this one" without a referent). Search engines and AI assistants lift these sentences.
- Use the exact app names from the notes every time, never shortened nicknames, so the names match the App Store.

Frequently asked questions (every type): three to five questions a merchant (or, for developer posts, a developer) would type into Google or ask an AI assistant about this topic. Each question is a "### " heading ending with a question mark, followed by one paragraph of two to four sentences that answers it completely on its own, using only facts from the notes or our app list.

Never quote reviewers or forum posters, or name them or their stores. Describe review themes in your own words, and only themes present in the notes.

Format of the body (Markdown, rendered by a strict converter):
- Never repeat the title as a heading. Use "## " for sections and "### " for subsections only.
- Paragraphs, "- " bullet lists, "1. " numbered lists, **bold**, _italic_ (underscores only), and [links](https://example.com). Each list item on one line. No images, HTML or nested formatting.
- Tables in pipe syntax: a header row, a separator row like "| --- | --- |", then the rows. Three to five short columns. Plain text in cells, no links or line breaks.
- Links only to URLs that appear in the research notes or our app list, the ${SITE_HOST}/blog posts listed in the request, ${SITE_HOST}, help.shopify.com or shopify.dev.
- Tags name the topic (for example "wishlists", "back in stock alerts", "shipping rules"), two to four of them.`;

const COMPARISON_BRIEF = `Article structure for a comparison. The research notes start with TYPE; follow the matching structure. Each comparison helps a merchant pick an app for one job.

Directly under the comparison table, add a short "How we compared" paragraph in italics: we read each app's Shopify App Store listing (and, where the notes say so, its low-star reviews) in the month given in the request; prices and ratings can change.

Order the apps by how well they serve most merchants on the evidence. Our app goes wherever the evidence puts it, which is often not first. When one of our apps fits, it gets its own section and a row in the comparison table, with its disclosure line directly under its heading.

BEST ("Best <category> apps for Shopify"):
1. A two or three sentence introduction, no heading before it, ending with a one-line quick answer (the best pick for most stores on the evidence, and why).
2. "## What to look for in a <category> app": four to six criteria, each one line.
3. "## <Category> apps compared": the comparison table, then the price and rating note.
4. "## The apps in detail", with one "### <App name>" section per app (four to seven apps): what it does well, pricing, best for, watch out for, and a link to its App Store listing.
5. "## Which one should you pick?": a short list mapping situations to apps.
6. "## Frequently asked questions".
7. A short closing section with the next step.

ALTERNATIVES ("<App> alternatives for Shopify"):
1. A two or three sentence introduction, no heading before it: who this is for (merchants on the original app, or weighing it) and a one-line quick answer (the strongest alternative for most stores on the evidence, and why).
2. "## Why merchants look for <App> alternatives": the reasons from the notes (pricing, plan limits, missing features, themes in low-star reviews). Be fair to the original: also say what it does well and who should stay on it. If the notes say reviews were not reached, use only listing facts and do not guess at complaints.
3. "## <App> alternatives compared": the comparison table, with the original app as the first row for reference, then the price and rating note.
4. "## The alternatives in detail", with one "### <App name>" section per alternative (four to six): what it does better or differently than the original, pricing, best for, watch out for, and a link to its listing.
5. "## Should you switch?": a short list mapping situations to "stay on <App>" or a specific alternative.
6. "## Frequently asked questions".
7. "## Before you switch": practical steps (try the new app on a development or test theme, check what data can be exported or carries over, compare total cost at your order volume). Describe goals, not admin menu paths you are unsure of.

VERSUS ("<App A> vs <App B>"):
1. Introduction with a one-line verdict.
2. "## <App A> vs <App B> at a glance": the comparison table with one row per criterion and one column per app.
3. One "## " section per criterion (features, pricing, ease of setup, integrations, reviews), each ending with which app is stronger on it.
4. "## Which should you choose?" by situation, then "## Other options worth a look" naming one to three strong apps from the notes (ours only if it fits the category, with the disclosure).
5. "## Frequently asked questions".
If one of the two apps is ours, the disclosure line goes directly under the introduction, and the verdict must follow the evidence like any other.

Exactly one comparison table (for example App, Best for, Free plan, Paid from, Rating; for VERSUS: Criterion, App A, App B). 1,400 to 2,200 words.`;

const GUIDE_BRIEF = `Article structure for a how-to or feature guide (TYPE HOWTO or FEATURE). The reader wants the job done in their store today.

1. A two or three sentence introduction, no heading before it: what the reader will have at the end, and a one-line quick answer (the simplest route for most stores, from the notes).
2. "## What you need before you start": plan requirements, theme notes, time needed; only what the notes support.
3. "## Ways to <do the job> in Shopify": the routes from the notes (built into Shopify, an app, custom code), one "### " each with who it suits. When there are three or more routes, add a short table (Route, Cost, Effort, Best for). Present app options neutrally, each with pricing and a listing link; our app only where it fits, with its disclosure line.
4. "## How to <do the job>, step by step": a numbered list for the route that suits most stores. Use only the steps and admin paths in the research notes ("VERIFIED STEPS"). Where the notes have no verified steps (for example inside an app), describe what to set up and why, not menu paths, and point to the app's listing or Shopify's help center.
5. "## Tips to get more out of it": practical settings and good practice from the notes.
6. "## Common mistakes to avoid": from "PITFALLS" in the notes.
7. "## Frequently asked questions".
8. A short closing section with the next step.

A FEATURE guide goes deeper on one feature: more detail in step 4 and 5, fewer routes in step 3. At most one table. No code. 1,300 to 2,000 words.`;

const PROBLEM_BRIEF = `Article structure for a problem and solution post (TYPE PROBLEM). The reader has the problem, or suspects it, and wants it fixed.

1. A two or three sentence introduction, no heading before it: name the problem in the reader's words and give a one-line quick answer (the most likely cause and the first fix, from the notes).
2. "## Why <the problem happens>": the causes the evidence supports, one "### " each, most common first. Cite each finding with its source named and linked. Where the notes say evidence is thin, say so plainly, and present the rest as practical reasoning, not as fact.
3. "## How to tell which one is hurting your store": what to check in Shopify (reports, settings) using only what the notes support.
4. "## How to fix it": one "### " per fix, matched to the causes, with concrete steps. Name tools only where they help, neutrally, with listing links; our app only where it fits, with its disclosure line.
5. "## Frequently asked questions".
6. A short closing section: what to do first this week.

At most one table (for example Cause, Sign, Fix). No code. 1,300 to 2,000 words.`;

const RESEARCH_BRIEF = `Article structure for an evidence-led research post (TYPE RESEARCH). The title is a question; the reader wants an honest answer.

1. A two or three sentence introduction, no heading before it, ending with the short answer from the notes, including how strong the evidence is ("yes, on good evidence", "probably, but the data is thin", "it depends").
2. "## What the research says": one "### " per finding or source, each with the figure as published, who published it and when (linked), the sample and method if the notes give them, and what it does not show. Label vendor case studies as such. Never round a figure up or turn a correlation into a cause.
3. "## What this means for your store": what a small or mid-sized Shopify store can take from it, and where the findings may not apply.
4. "## How to measure it in your own store": a simple before and after or test the reader can run with Shopify's reports, described as goals unless the notes give exact steps.
5. "## Evidence gaps": what is not known, from the notes.
6. "## Frequently asked questions".
7. "## Sources": a bullet list of every source used, as "Publisher, title, year" linked to its URL.

Tools are not the point of this post. Mention apps only briefly in step 4 where they help measure or act on the finding, neutrally; our app only where it fits, with its disclosure line. At most one table (for example Source, Finding, Sample). No code. 1,300 to 2,000 words.`;

const TECHNICAL_BRIEF = `Article structure for a developer guide (TYPE TECHNICAL). Readers are Shopify developers and technical merchants; they want working, current code.

1. A two or three sentence introduction, no heading before it: what you will build and what it needs (API, scopes, app or theme), with the API version from the notes.
2. "## How it works": the moving parts, briefly.
3. "## Before you start": access scopes, app type, plan requirements, tools.
4. One "## " section per step, each with a short explanation and, where useful, a code block.
5. "## Limits and gotchas": rate limits, deprecations, edge cases, from the notes.
6. "## Frequently asked questions".
7. A short closing section: next steps and links to the official docs used.

Code:
- Fenced code blocks with a language (\`\`\`graphql, \`\`\`liquid, \`\`\`javascript, \`\`\`json), short (under 30 lines each). Inline code with single backticks for names of fields, objects and files.
- Every query, mutation, field, argument, scope, Liquid object and endpoint must appear in the research notes. Keep code close to the samples in the notes; never invent API surface. If the notes lack something, say "see the docs" and link them.
- Mention our apps only if the notes list one as directly relevant, briefly, with its disclosure line; never as a substitute for explaining the code.

At most one table. 1,300 to 2,200 words.`;

function briefFor(type: ArticleType): string {
	if (isComparison(type)) return COMPARISON_BRIEF;
	if (type === "technical") return TECHNICAL_BRIEF;
	if (type === "problem") return PROBLEM_BRIEF;
	if (type === "research") return RESEARCH_BRIEF;
	return GUIDE_BRIEF;
}

function systemFor(type: ArticleType): string {
	return `${COMMON_BRIEF}\n\n${briefFor(type)}`;
}

const ARTICLE_SCHEMA = {
	type: "object",
	properties: {
		title: {
			type: "string",
			description:
				"Search-led title in sentence case, under 70 characters, close to the topic's wording, e.g. \"How to add a wishlist to Shopify (3 ways)\", \"How to set up price drop alerts in Shopify\", \"Why Shopify customers abandon wishlists\", \"Does a wishlist increase conversion rates?\", \"Best wishlist apps for Shopify in 2026: 6 compared\".",
		},
		url_slug: {
			type: "string",
			description:
				"Two to six lowercase words the URL is built from: the main search keyword, no year, no stop words, e.g. \"add wishlist shopify\", \"shopify price drop alerts\", \"wishlist conversion rate\", \"best wishlist apps shopify\", \"wishlist plus vs wishlist king\".",
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
		tags: {
			type: "array",
			items: { type: "string" },
			description: "Two to four short lowercase tags naming the topic, e.g. \"wishlists\", \"price drop alerts\", \"shipping rules\".",
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
		`Write a ${TYPE_INFO[req.type].label} article (TYPE ${req.type.toUpperCase()}) on this topic:\n${req.topic}`,
	];
	if (req.angle) parts.push(`Angle: ${req.angle}`);
	parts.push(
		isComparison(req.type)
			? `Prices and ratings below were checked on the Shopify App Store in ${month}.`
			: `The sources below were checked in ${month}.`,
		`Research notes (the only source for facts about other apps, Shopify and studies):\n<research>\n${req.research}\n</research>`,
	);
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
	// Any remaining H1 becomes a section heading (not "# " comments inside code blocks).
	let inCode = false;
	return body
		.split("\n")
		.map((line) => {
			if (line.startsWith("```")) inCode = !inCode;
			return !inCode && line.startsWith("# ") ? `#${line}` : line;
		})
		.join("\n");
}

function parseArticle(raw: string, type: ArticleType): Article {
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
	const category = TYPE_INFO[type].category;
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
		system: systemFor(req.type),
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
		article: parseArticle(text, req.type),
		model: message.model,
		inputTokens: message.usage.input_tokens,
		outputTokens: message.usage.output_tokens,
	};
}
