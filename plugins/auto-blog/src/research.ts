import Anthropic from "@anthropic-ai/sdk";

import { type ArticleType, TYPE_INFO, type TypeFamily, isComparison } from "./article-types.js";
import { BRAND } from "./brand.js";
import { ourAppsBrief } from "./our-apps.js";
import { WriterError } from "./writer.js";

/**
 * Research phase. The planned type decides where Claude looks:
 * - comparisons: the Shopify App Store only (apps.shopify.com), for each
 *   app's real name, rating, review count, pricing and features;
 * - how-to and feature guides: Shopify's help center and developer docs plus
 *   the App Store, for real admin steps, built-in options and app options;
 * - developer guides: shopify.dev, the help center and Shopify's GitHub;
 * - problem and research posts: the open web, for published evidence.
 * The writer may only state facts that are in these notes.
 *
 * Kept separate from the writing call so the article itself can stay on
 * structured JSON output.
 */

export interface ResearchRequest {
	apiKey: string;
	model: string;
	/** The topic settled by the planning step. */
	topic: string;
	type: ArticleType;
	/** The angle from the planning step. */
	angle: string;
	brief: string;
	/** Milliseconds this phase may take. */
	timeoutMs: number;
	today: Date;
}

export interface ResearchResult {
	topic: string;
	type: ArticleType;
	notes: string;
	inputTokens: number;
	outputTokens: number;
}

/** Each paused server-tool turn is resumed at most this many times. */
const MAX_RESUMES = 3;

const SHOPIFY_DOCS = ["help.shopify.com", "shopify.dev", "apps.shopify.com", "www.shopify.com", "shopify.com"];

/** Domains each family may search and fetch; null means the open web. */
const DOMAINS: Record<TypeFamily, string[] | null> = {
	comparison: ["apps.shopify.com"],
	guide: SHOPIFY_DOCS,
	developer: ["shopify.dev", "help.shopify.com", "github.com", "apps.shopify.com", "www.shopify.com"],
	evidence: null,
};

const OUR_APPS = `Our own live apps (${BRAND.publisher} and its sister studio ${BRAND.sisterStudio}, same team). Their facts are already known, so do not research them:

${ourAppsBrief()}`;

const APP_BLOCK = `APP: <exact name as listed>
URL: <apps.shopify.com URL>
DEVELOPER: <name>
RATING: <e.g. 4.9 (1,234 reviews), or not listed>
BUILT FOR SHOPIFY: <yes, no, or not listed>
PRICING: <every plan with its price as listed, free trial if listed>
KEY FEATURES: <four to seven short points from the listing>
BEST FOR: <one line, your judgement from the listing>
WATCH OUT: <one or two limits visible on the listing, e.g. features locked to higher plans>`;

const HONESTY = `Record only what the pages show. If something is not on a page, write "not listed" or "not found". Never estimate or fill gaps from memory. Summarise reviews and discussions in your own words, without reviewer names or store names, and only from pages you actually read.`;

const COMPARISON_SYSTEM = `You research Shopify apps for comparison articles on the ${BRAND.siteName} blog (${new URL(BRAND.origin).host}). Readers are Shopify merchants choosing an app.

Your job is to collect facts, not to write the article. Use web_search and web_fetch, which only reach apps.shopify.com.

${OUR_APPS}

Article types:
- BEST: "Best <category> apps for Shopify". A shortlist of the leading apps in one category.
- ALTERNATIVES: "<App> alternatives for Shopify" or "Best <App> alternatives". For merchants who use, or are considering, one well-known app and want other options. The original app must be a real, well-known listing with many reviews.
- VERSUS: "<App A> vs <App B>". Two leading apps head to head.

Steps:
1. The topic and its type are given. Research the apps: search the App Store, then fetch each app's listing page on apps.shopify.com. Pick apps on merit alone: never leave out a strong competitor, and never pick weak ones to make our app look better.
   - BEST: the five to seven apps a merchant would realistically shortlist: many reviews, strong ratings, the Built for Shopify badge, or a clear niche.
   - ALTERNATIVES: first the original app's listing. Then, if you can reach it, its reviews page on apps.shopify.com, ideally the 1 and 2 star reviews, to learn why merchants leave. Then the four to six strongest alternatives in the same category.
   - VERSUS: both apps' listings, and their low-star reviews if you can reach them. If one of the two is our app, research only the other one.
2. ${HONESTY}

Answer in plain text, in exactly this shape:

TYPE: <BEST, ALTERNATIVES or VERSUS>
TOPIC: <the topic, one line>
OUR APPS THAT FIT: <names of our live apps that genuinely compete in this category, or "none">

For ALTERNATIVES and VERSUS, a block for the original app (VERSUS: one per app, each starting with ORIGINAL APP):
ORIGINAL APP: <exact name as listed>
URL, DEVELOPER, RATING, BUILT FOR SHOPIFY, PRICING, KEY FEATURES: <as below>
STRENGTHS: <what its listing and positive reviews show it does well>
WHY MERCHANTS LOOK ELSEWHERE: <themes from the low-star reviews you read, with how many of the reviews you read mention each; or "reviews not reached">

Then one block per other app:
${APP_BLOCK}
VS ORIGINAL: <ALTERNATIVES only: one line on how it differs from the original app>

End with a NOTES line for anything else useful for the comparison (for example, which apps share a developer).`;

const SOURCES_BLOCK = `SOURCES: one line per page you used, "- <page title> | <publisher> | <date if shown> | <URL>".`;

const GUIDE_SYSTEM = `You research Shopify how-to and feature guides for the ${BRAND.siteName} blog (${new URL(BRAND.origin).host}). Readers are Shopify merchants who want to get one job done in their store.

Your job is to collect facts, not to write the article. Use web_search and web_fetch, which only reach Shopify's own sites: help.shopify.com (help center), shopify.dev (developer docs), apps.shopify.com (App Store) and shopify.com.

${OUR_APPS}

Steps:
1. Find out what Shopify itself offers for this job: built-in admin features, settings, Shopify Flow, free Shopify apps, and what themes usually include. Fetch the help center pages and record the exact admin paths and steps they give (for example "Settings > Shipping and delivery"). Note which plans a feature needs.
2. Find the app options: search the App Store for the job and fetch the listings of the three or four apps a merchant would realistically consider (many reviews, strong ratings, Built for Shopify, or a clear niche). Pick on merit; never leave out a strong app. Our apps are known already: list which of them genuinely do this job.
3. Note whether custom code is a realistic route (theme code, metafields, an app extension) and how hard it is, from shopify.dev.
4. Note the usual pitfalls and limits (plan limits, theme compatibility, what built-in features cannot do).
5. ${HONESTY} Never describe an admin path, setting or button you did not see on a help center page.

Answer in plain text, in exactly this shape:

TYPE: <HOWTO or FEATURE>
TOPIC: <the topic, one line>
OUR APPS THAT FIT: <names of our live apps that genuinely do this job, or "none">
BUILT INTO SHOPIFY: <what Shopify offers natively for this job, with plan requirements; or "nothing built in">
VERIFIED STEPS: <numbered steps with exact admin paths as the help center gives them, each with its source URL; or "no help center steps found">
CUSTOM CODE ROUTE: <what it involves and how hard, with source URLs; or "not realistic">
PITFALLS: <limits and common mistakes, with sources>

Then one block per app option:
${APP_BLOCK}

${SOURCES_BLOCK}
End with a NOTES line for anything else useful.`;

const DEVELOPER_SYSTEM = `You research developer guides for the ${BRAND.siteName} blog (${new URL(BRAND.origin).host}). Readers are Shopify developers and technical merchants.

Your job is to collect facts, not to write the article. Use web_search and web_fetch, which reach shopify.dev, help.shopify.com, github.com (prefer Shopify's own repositories), apps.shopify.com and shopify.com.

${OUR_APPS}

Steps:
1. Find the official documentation for the APIs, objects, Liquid tags, extension types or webhooks this topic needs. Record the current API version shown, exact names of queries, mutations, fields, scopes and endpoints, and the limits (rate limits, plan requirements, deprecations).
2. Record short code samples only as the docs show them (a few lines each), with the page they came from. Never write or "fix up" code yourself in the notes.
3. Note which parts need an app (and which access scopes) and which can be done in a theme.
4. ${HONESTY} Never name a field, argument, scope or endpoint you did not see in the docs.

Answer in plain text, in exactly this shape:

TYPE: TECHNICAL
TOPIC: <the topic, one line>
OUR APPS THAT FIT: <names of our live apps that are directly relevant, or "none">
API VERSION: <the version the docs show>
FACTS: <one line per fact, each ending with its source URL>
CODE FROM THE DOCS: <each sample in a block, with its source URL and language>
LIMITS AND GOTCHAS: <with sources>

${SOURCES_BLOCK}
End with a NOTES line for anything else useful.`;

const EVIDENCE_SYSTEM = `You research evidence-led articles for the ${BRAND.siteName} blog (${new URL(BRAND.origin).host}). Readers are Shopify merchants deciding what to do in their store; they want honest answers, not hype.

Your job is to collect facts, not to write the article. Use web_search and web_fetch on the open web.

${OUR_APPS}

Source quality, strictest first:
1. Original research with a stated method: academic papers, Baymard Institute, Nielsen Norman Group, Google and Think with Google, Shopify's own published data and reports, platform reports (Klaviyo, Omnisend and similar) that state their sample.
2. Shopify's help center and developer docs, for how features work.
3. A vendor's own case study, only labelled as such ("a vendor case study, not independent").
Never use "statistics roundup" pages, AI-written listicles or a number you cannot trace to the page that first published it. If a figure is quoted second-hand, find the original page and record that; if you cannot reach it, record the figure as "unverified, original not reached" or leave it out.

Steps:
1. Search for evidence that answers the topic directly. Fetch every page you take a figure from.
2. For each finding record the exact figure and wording as published, who published it, when, the sample and method if stated, and what it does and does not show (for example correlation, not cause; one industry; desktop only).
3. Record the causes and fixes the evidence supports. For a PROBLEM topic, find why merchants or shoppers hit the problem and the fixes the sources recommend.
4. Say plainly where evidence is thin, old or missing. That is a useful finding, not a gap to fill.
5. If tools help with the fix, search apps.shopify.com for two or three of the leading options and fetch their listings. Our apps are known already.
6. ${HONESTY}

Answer in plain text, in exactly this shape:

TYPE: <PROBLEM or RESEARCH>
TOPIC: <the topic, one line>
OUR APPS THAT FIT: <names of our live apps that genuinely help with this, or "none">
SHORT ANSWER: <what the evidence says, in two or three sentences, including how strong it is>

Then one block per finding:
FINDING: <the figure or claim, as published>
SOURCE: <publisher, title, date, URL>
METHOD: <sample and method as stated, or "not stated">
LIMITS: <what it does not show>

CAUSES AND FIXES: <for PROBLEM topics: each cause and fix, with the finding or source behind it>
EVIDENCE GAPS: <what is not known or not published>

Then, if you looked at apps, one block per app:
${APP_BLOCK}

${SOURCES_BLOCK}
End with a NOTES line for anything else useful.`;

const SYSTEM: Record<TypeFamily, string> = {
	comparison: COMPARISON_SYSTEM,
	guide: GUIDE_SYSTEM,
	developer: DEVELOPER_SYSTEM,
	evidence: EVIDENCE_SYSTEM,
};

function buildUserMessage(req: ResearchRequest): string {
	const month = req.today.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
	const parts: string[] = [
		`Today is ${month}.`,
		`Research this article.\nType: ${req.type.toUpperCase()} (${TYPE_INFO[req.type].label})\nTopic: ${req.topic}`,
	];
	if (req.angle) parts.push(`Angle: ${req.angle}`);
	if (req.brief.trim()) {
		parts.push(`Extra guidance from the editor:\n${req.brief.trim()}`);
	}
	return parts.join("\n\n");
}

function textOf(content: Anthropic.Beta.BetaContentBlock[]): string {
	return content
		.filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
		.map((block) => block.text)
		.join("")
		.trim();
}

export async function researchTopic(req: ResearchRequest): Promise<ResearchResult> {
	const client = new Anthropic({ apiKey: req.apiKey, timeout: req.timeoutMs, maxRetries: 0 });
	const deadline = Date.now() + req.timeoutMs;

	const messages: Anthropic.Beta.BetaMessageParam[] = [
		{ role: "user", content: buildUserMessage(req) },
	];
	let inputTokens = 0;
	let outputTokens = 0;
	let finalText = "";

	for (let attempt = 0; attempt <= MAX_RESUMES; attempt++) {
		const remaining = deadline - Date.now();
		if (remaining < 20_000) {
			throw new WriterError("App Store research ran out of time. Try again or pick a narrower topic.");
		}
		const params = {
			model: req.model,
			max_tokens: 16000,
			output_config: { effort: "medium" },
			system: SYSTEM[TYPE_INFO[req.type].family],
			messages,
			tools: researchTools(req.type),
			betas: ["server-side-fallback-2026-07-01"],
			fallbacks: "default",
		};

		let message: Anthropic.Beta.BetaMessage;
		try {
			message = await client.beta.messages
				.stream(params as unknown as Anthropic.Beta.MessageCreateParamsStreaming, {
					timeout: remaining,
				})
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

		inputTokens += message.usage.input_tokens;
		outputTokens += message.usage.output_tokens;

		if (message.stop_reason === "refusal") {
			throw new WriterError("Claude declined to research this topic. Try a different topic.");
		}
		if (message.stop_reason === "pause_turn") {
			// Send the paused turn back unchanged; the server resumes it.
			messages.push({ role: "assistant", content: message.content });
			continue;
		}
		if (message.stop_reason === "max_tokens") {
			throw new WriterError("Claude ran out of output tokens during App Store research.");
		}
		finalText = textOf(message.content);
		break;
	}

	if (isComparison(req.type)) {
		const apps = (finalText.match(/^\W{0,4}(ORIGINAL )?APP\W{0,4}:/gm) ?? []).length;
		if (apps < 2) {
			throw new WriterError(
				"App Store research came back without enough apps to compare. Try again or adjust the topic.",
			);
		}
	} else {
		const sources = new Set(finalText.match(/https:\/\/[^\s)>\]|]+/g) ?? []);
		if (sources.size < 2) {
			throw new WriterError(
				"Research came back with fewer than two sources. Try again or adjust the topic.",
			);
		}
	}

	return {
		topic: req.topic,
		type: req.type,
		notes: finalText,
		inputTokens,
		outputTokens,
	};
}

function researchTools(type: ArticleType): Record<string, unknown>[] {
	const family = TYPE_INFO[type].family;
	const domains = DOMAINS[family];
	const scope = domains ? { allowed_domains: domains } : {};
	const comparison = family === "comparison";
	return [
		{ type: "web_search_20260209", name: "web_search", max_uses: comparison ? 6 : 8, ...scope },
		{
			type: "web_fetch_20260209",
			name: "web_fetch",
			max_uses: comparison ? 12 : 10,
			...scope,
			max_content_tokens: 12000,
		},
	];
}
