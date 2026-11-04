import Anthropic from "@anthropic-ai/sdk";

import type { ArticleType } from "./cover-svg.js";
import { BRAND } from "./brand.js";
import { ourAppsBrief } from "./our-apps.js";
import { WriterError } from "./writer.js";

/**
 * Research phase for comparison posts: Claude searches the Shopify App Store
 * (search and fetch are limited to apps.shopify.com) and returns plain-text
 * notes with each competitor's real name, rating, review count, pricing and
 * features. The writer may only state competitor facts that are in these notes.
 *
 * Kept separate from the writing call so the article itself can stay on
 * structured JSON output.
 */

export interface ResearchRequest {
	apiKey: string;
	model: string;
	/** A topic from the queue, or null to let Claude choose one. */
	topic: string | null;
	existingTitles: string[];
	brief: string;
	/** Milliseconds this phase may take. */
	timeoutMs: number;
	today: Date;
}

export interface ResearchResult {
	/** The topic written about (the queued one, or the one Claude chose). */
	topic: string;
	type: ArticleType;
	notes: string;
	inputTokens: number;
	outputTokens: number;
}

/** Each paused server-tool turn is resumed at most this many times. */
const MAX_RESUMES = 3;

const RESEARCH_SYSTEM = `You research Shopify apps for comparison articles on the ${BRAND.siteName} blog (${new URL(BRAND.origin).host}). Readers are Shopify merchants choosing an app.

Your job is to collect facts, not to write the article. Use web_search and web_fetch, which only reach apps.shopify.com.

Our own live apps (${BRAND.publisher} and its sister studio ${BRAND.sisterStudio}, same team). Their facts are already known, so do not research them:

${ourAppsBrief()}

Article types:
- BEST: "Best <category> apps for Shopify". A shortlist of the leading apps in one category.
- ALTERNATIVES: "<App> alternatives for Shopify" or "Best <App> alternatives". For merchants who use, or are considering, one well-known app and want other options. The original app must be a real, well-known listing with many reviews.
- VERSUS: "<App A> vs <App B>". Two leading apps head to head.

Steps:
1. Settle the topic and its type. If you were given a topic, use it and work out its type. If not, choose one a merchant would search for, for example "Best wishlist apps for Shopify", "Best sticky add to cart apps for Shopify", "Best upsell apps for Shopify", "Wishlist Plus alternatives for Shopify", "Rewind alternatives for Shopify", "<App A> vs <App B>". Across the blog, aim for roughly half BEST, a third ALTERNATIVES and the rest VERSUS, so lean toward whichever type the existing titles have least of. About two in three topics you choose should be a category where one of our live apps competes; the rest can be any app category Shopify merchants care about. Do not repeat a topic or angle already on the blog.
2. Research the apps. Search the App Store, then fetch each app's listing page on apps.shopify.com. Pick apps on merit alone: never leave out a strong competitor, and never pick weak ones to make our app look better.
   - BEST: the five to seven apps a merchant would realistically shortlist: many reviews, strong ratings, the Built for Shopify badge, or a clear niche.
   - ALTERNATIVES: first the original app's listing. Then, if you can reach it, its reviews page on apps.shopify.com, ideally the 1 and 2 star reviews, to learn why merchants leave. Then the four to six strongest alternatives in the same category.
   - VERSUS: both apps' listings, and their low-star reviews if you can reach them.
3. Record only what the pages show. If something is not on the page, write "not listed". Never estimate or fill gaps from memory. Summarise review themes in your own words, without reviewer names or store names, and only from reviews you actually read.

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
APP: <exact name as listed>
URL: <apps.shopify.com URL>
DEVELOPER: <name>
RATING: <e.g. 4.9 (1,234 reviews), or not listed>
BUILT FOR SHOPIFY: <yes, no, or not listed>
PRICING: <every plan with its price as listed, free trial if listed>
KEY FEATURES: <four to seven short points from the listing>
BEST FOR: <one line, your judgement from the listing>
WATCH OUT: <one or two limits visible on the listing, e.g. features locked to higher plans>
VS ORIGINAL: <ALTERNATIVES only: one line on how it differs from the original app>

End with a NOTES line for anything else useful for the comparison (for example, which apps share a developer).`;

function buildUserMessage(req: ResearchRequest): string {
	const month = req.today.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
	const parts: string[] = [`Today is ${month}.`];
	parts.push(
		req.topic
			? `Research this article topic:\n${req.topic}`
			: "Choose the topic yourself, following step 1.",
	);
	if (req.existingTitles.length > 0) {
		parts.push(
			`Articles already on the blog:\n${req.existingTitles.map((t) => `- ${t}`).join("\n")}`,
		);
	}
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
			system: RESEARCH_SYSTEM,
			messages,
			tools: [
				{
					type: "web_search_20260209",
					name: "web_search",
					max_uses: 6,
					allowed_domains: ["apps.shopify.com"],
				},
				{
					type: "web_fetch_20260209",
					name: "web_fetch",
					max_uses: 12,
					allowed_domains: ["apps.shopify.com"],
					max_content_tokens: 12000,
				},
			],
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

	const topicLine = finalText.match(/^\W{0,4}TOPIC\W{0,6}(.+)$/im);
	const competitors = (finalText.match(/^(ORIGINAL )?APP:/gm) ?? []).length;
	if (!topicLine || competitors < 2) {
		throw new WriterError(
			"App Store research came back without enough apps to compare. Try again or adjust the topic.",
		);
	}

	// Tolerate Markdown around the label ("**TYPE:** ALTERNATIVES"), then fall back to the topic wording.
	const typeLine = finalText.match(/TYPE\W{0,6}(BEST|ALTERNATIVES|VERSUS)\b/i)?.[1]?.toLowerCase();
	const topic = req.topic ?? topicLine[1].replace(/[*_`]/g, "").trim();
	const type: ArticleType =
		typeLine === "alternatives" || typeLine === "versus" || typeLine === "best"
			? (typeLine as ArticleType)
			: /\bvs\.?\b|\bversus\b/i.test(topic)
				? "versus"
				: /alternative/i.test(topic)
					? "alternatives"
					: "best";

	return {
		topic,
		type,
		notes: finalText,
		inputTokens,
		outputTokens,
	};
}
