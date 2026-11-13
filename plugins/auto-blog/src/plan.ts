import Anthropic from "@anthropic-ai/sdk";

import { ARTICLE_TYPES, type ArticleType, TYPE_INFO, isArticleType } from "./article-types.js";
import { BRAND } from "./brand.js";
import { ourAppsBrief } from "./our-apps.js";
import { WriterError } from "./writer.js";

/**
 * Planning step, before research: settles the topic and its article type.
 * With a queued topic it only works out the type; with an empty queue it
 * picks a fresh topic of the type the run asked for. No tools, short output.
 */

export interface PlanRequest {
	apiKey: string;
	model: string;
	/** A queued topic, or null to choose one. */
	topic: string | null;
	/** The type to write when choosing a topic (from the target mix). */
	wantedType: ArticleType;
	existingTitles: string[];
	brief: string;
	timeoutMs: number;
}

export interface PlanResult {
	topic: string;
	type: ArticleType;
	/** One or two sentences on the angle and the reader's search intent. */
	angle: string;
	inputTokens: number;
	outputTokens: number;
}

const TYPE_LIST = ARTICLE_TYPES.map(
	(t) => `- ${t} (${TYPE_INFO[t].label}): e.g. ${TYPE_INFO[t].examples.map((e) => `"${e}"`).join(", ")}`,
).join("\n");

const PLAN_SYSTEM = `You plan posts for the blog on ${new URL(BRAND.origin).host}. Readers are owners of small and mid-sized Shopify stores, marketers, the freelancers who help them, and (for developer posts) Shopify developers.

Article types:
${TYPE_LIST}

How the types differ:
- howto: a step-by-step tutorial for a broad job ("add a wishlist", "add size charts"). Covers the ways to do it (built-in Shopify features, apps, custom code) and walks through one.
- feature: one specific feature set up end to end ("price drop alerts", "hide a shipping rate by zip code"). Narrower and more detailed than howto.
- problem: a problem merchants have, why it happens, and how to fix it. The title names the problem, often "Why ..." or "How to fix ...".
- best, alternatives, versus: Shopify app comparisons.
- technical: for developers: Shopify APIs, Liquid, metafields, webhooks, theme app extensions, integrations.
- research: a question answered with evidence ("Does X increase Y?"): published studies, benchmarks and Shopify's own data, with honest limits.

Our live apps (${BRAND.publisher} and its sister studio ${BRAND.sisterStudio}):

${ourAppsBrief()}

Choosing a topic:
- Pick what a merchant or developer would actually type into Google or ask an AI assistant: concrete, specific, with clear search intent.
- About two in three topics should sit in a niche where one of our live apps is relevant (wishlists, back in stock and price drop alerts, sticky add to cart, product edit history and backups, tagging, B2B and company pricing, shipping rules and delivery dates). The rest can be any Shopify topic merchants care about.
- Never repeat a topic or angle already on the blog. A new angle on a covered niche is fine.
- research topics must be questions that published evidence can answer. Do not pick one that would need data nobody has published.`;

const PLAN_SCHEMA = {
	type: "object",
	properties: {
		type: { type: "string", enum: [...ARTICLE_TYPES] },
		topic: {
			type: "string",
			description: "The working title in sentence case, under 80 characters, in the style of the type's examples.",
		},
		angle: {
			type: "string",
			description: "One or two sentences: who searches this, what they need to walk away with, and the angle that sets it apart from posts already on the blog.",
		},
	},
	required: ["type", "topic", "angle"],
	additionalProperties: false,
} as const;

export async function planPost(req: PlanRequest): Promise<PlanResult> {
	const client = new Anthropic({ apiKey: req.apiKey, timeout: req.timeoutMs, maxRetries: 0 });

	const parts: string[] = [];
	if (req.topic) {
		parts.push(
			`The editor queued this topic:\n${req.topic}\n\nKeep the topic's meaning and wording (fix only obvious typos). Work out which article type fits it best and the angle.`,
		);
	} else {
		parts.push(
			`Choose a fresh topic of type "${req.wantedType}" (${TYPE_INFO[req.wantedType].label}). The blog needs more of this type.`,
		);
	}
	if (req.existingTitles.length > 0) {
		parts.push(`Posts already on the blog:\n${req.existingTitles.map((t) => `- ${t}`).join("\n")}`);
	}
	if (req.brief.trim()) parts.push(`Extra guidance from the editor:\n${req.brief.trim()}`);

	const params = {
		model: req.model,
		max_tokens: 4000,
		output_config: { effort: "low", format: { type: "json_schema", schema: PLAN_SCHEMA } },
		system: PLAN_SYSTEM,
		messages: [{ role: "user", content: parts.join("\n\n") }],
		betas: ["server-side-fallback-2026-07-01"],
		fallbacks: "default",
	};

	let message: Anthropic.Beta.BetaMessage;
	try {
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
		throw new WriterError("Claude declined to plan this topic. Try a different topic.");
	}

	const text = message.content
		.filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
		.map((block) => block.text)
		.join("");
	let data: { type?: unknown; topic?: unknown; angle?: unknown };
	try {
		data = JSON.parse(text) as typeof data;
	} catch {
		throw new WriterError("Claude returned a topic plan that is not valid JSON.");
	}
	const topic = req.topic ?? (typeof data.topic === "string" ? data.topic.trim() : "");
	if (!topic) throw new WriterError("Claude's topic plan has no topic.");
	return {
		topic,
		type: isArticleType(data.type) ? data.type : req.wantedType,
		angle: typeof data.angle === "string" ? data.angle.trim() : "",
		inputTokens: message.usage.input_tokens,
		outputTokens: message.usage.output_tokens,
	};
}
