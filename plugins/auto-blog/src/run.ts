import type { PluginContext } from "emdash";

import { BRAND } from "./brand.js";
import {
	type AutoBlogSettings,
	WEEKDAYS,
	getApiKey,
	loadSettings,
	topicQueue,
} from "./settings.js";
import { researchTopic } from "./research.js";
import type { CoverMedia } from "./cover.js";
import { articleToPortableText } from "./tables.js";
import { CATEGORIES, type Article, WriterError, writeArticle } from "./writer.js";

const COLLECTION = "posts";
const KV_LOCK = "state:running";
const KV_LOG = "state:log";
const KV_USED_TOPICS = "state:usedTopics";
const KV_LAST_SCHEDULED_DAY = "state:lastScheduledDay";
/** A run older than this is treated as crashed and its lock is taken over. */
const LOCK_STALE_MS = 12 * 60 * 1000;
const LOG_SIZE = 25;
/** Whole run (research + writing) stays under EmDash's 10-minute cron lock and the 9-minute hook timeout. */
const RUN_BUDGET_MS = 8.5 * 60 * 1000;
/** App Store research gets at most this much of the budget. */
const RESEARCH_BUDGET_MS = 3.5 * 60 * 1000;

export type Trigger = "schedule" | "manual";

export interface RunLogEntry {
	at: string;
	trigger: Trigger;
	status: "published" | "draft" | "failed" | "skipped";
	title?: string;
	postId?: string;
	topic?: string | null;
	model?: string;
	tokens?: { input: number; output: number };
	error?: string;
	durationMs?: number;
}

export async function readLog(ctx: PluginContext): Promise<RunLogEntry[]> {
	return (await ctx.kv.get<RunLogEntry[]>(KV_LOG)) ?? [];
}

async function appendLog(ctx: PluginContext, entry: RunLogEntry): Promise<void> {
	const log = await readLog(ctx);
	await ctx.kv.set(KV_LOG, [entry, ...log].slice(0, LOG_SIZE));
}

export async function isRunning(ctx: PluginContext): Promise<boolean> {
	const lock = await ctx.kv.get<{ startedAt: string }>(KV_LOCK);
	return !!lock && Date.now() - Date.parse(lock.startedAt) < LOCK_STALE_MS;
}

async function acquireLock(ctx: PluginContext): Promise<boolean> {
	const startedAt = new Date().toISOString();
	const current = await ctx.kv.getVersioned<{ startedAt: string }>(KV_LOCK);
	if (current && Date.now() - Date.parse(current.value.startedAt) < LOCK_STALE_MS) {
		return false;
	}
	const result = await ctx.kv.compareAndSet(KV_LOCK, current?.revision ?? null, { startedAt });
	return result.applied;
}

function utcDay(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** Scheduled runs write once on each chosen UTC weekday, at or after the chosen hour. */
export async function isDue(
	ctx: PluginContext,
	settings: AutoBlogSettings,
	now = new Date(),
): Promise<boolean> {
	if (!settings.enabled || settings.days.length === 0) return false;
	if (!settings.days.includes(WEEKDAYS[now.getUTCDay()])) return false;
	if (now.getUTCHours() < settings.hour) return false;
	const lastDay = await ctx.kv.get<string>(KV_LAST_SCHEDULED_DAY);
	return lastDay !== utcDay(now);
}

function normalizeTopic(topic: string): string {
	return topic.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function nextTopic(ctx: PluginContext, settings: AutoBlogSettings): Promise<string | null> {
	const used = new Set((await ctx.kv.get<string[]>(KV_USED_TOPICS)) ?? []);
	return topicQueue(settings.topics).find((t) => !used.has(normalizeTopic(t))) ?? null;
}

async function markTopicUsed(ctx: PluginContext, topic: string): Promise<void> {
	const used = (await ctx.kv.get<string[]>(KV_USED_TOPICS)) ?? [];
	await ctx.kv.set(KV_USED_TOPICS, [...new Set([...used, normalizeTopic(topic)])].slice(-500));
}

async function existingPosts(ctx: PluginContext): Promise<{ title: string; slug: string | null }[]> {
	const content = ctx.content;
	if (!content) return [];
	const posts: { title: string; slug: string | null }[] = [];
	let cursor: string | undefined;
	// Up to 200 recent posts is plenty of context for avoiding repeats and linking.
	for (let page = 0; page < 4; page++) {
		const result = await content.list(COLLECTION, {
			limit: 50,
			cursor,
			orderBy: { createdAt: "desc" },
		});
		for (const item of result.items) {
			if (typeof item.data.title !== "string") continue;
			// Only published posts have a live URL worth linking to.
			posts.push({ title: item.data.title, slug: item.publishedAt ? item.slug : null });
		}
		if (!result.hasMore || !result.cursor) break;
		cursor = result.cursor;
	}
	return posts;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60);
}

async function assignTerms(ctx: PluginContext, postId: string, article: Article): Promise<void> {
	const taxonomies = ctx.taxonomies;
	if (!taxonomies?.addEntryTerms || !taxonomies.createTerm) return;

	const categories = await taxonomies.getTerms("category");
	const label = CATEGORIES.find((c) => c.slug === article.category)?.label ?? article.category;
	// Categories added after the site was seeded (e.g. app-comparisons) are created on first use.
	const category =
		categories.find((t) => t.slug === article.category) ??
		(await taxonomies.createTerm("category", { label, slug: article.category }));
	if (category) {
		await taxonomies.addEntryTerms(COLLECTION, postId, "category", [category.id]);
	}

	if (article.tags.length === 0) return;
	const tagTerms = await taxonomies.getTerms("tag");
	const tagIds: string[] = [];
	for (const label of article.tags) {
		const slug = slugify(label);
		if (!slug) continue;
		const existing = tagTerms.find((t) => t.slug === slug);
		const term = existing ?? (await taxonomies.createTerm("tag", { label, slug }));
		tagIds.push(term.id);
	}
	if (tagIds.length > 0) {
		await taxonomies.addEntryTerms(COLLECTION, postId, "tag", [...new Set(tagIds)]);
	}
}

export interface RunOutcome {
	ok: boolean;
	message: string;
	entry?: RunLogEntry;
}

/**
 * Write one post with Claude and save it to the posts collection.
 * Never throws: failures are logged and returned so cron does not retry
 * (a retry would bill another generation).
 */
export async function runOnce(ctx: PluginContext, trigger: Trigger): Promise<RunOutcome> {
	if (!(await acquireLock(ctx))) {
		return { ok: false, message: "A post is already being written. Try again in a few minutes." };
	}

	const startedAt = Date.now();
	const settings = await loadSettings(ctx);
	let topic: string | null = null;

	try {
		if (trigger === "schedule") {
			await ctx.kv.set(KV_LAST_SCHEDULED_DAY, utcDay(new Date()));
		}

		const apiKey = await getApiKey(ctx);
		if (!apiKey) {
			throw new WriterError("No Claude API key. Add one in Auto Blog settings.");
		}
		const content = ctx.content;
		if (!content?.create) {
			throw new WriterError("The plugin is missing the content:write capability.");
		}

		topic = await nextTopic(ctx, settings);
		const queuedTopic = topic;
		const posts = await existingPosts(ctx);
		const titles = posts.map((p) => p.title);
		const today = new Date();

		// 1. Research the App Store so competitor facts are real.
		const research = await researchTopic({
			apiKey,
			model: settings.model,
			topic,
			existingTitles: titles,
			brief: settings.brief,
			timeoutMs: RESEARCH_BUDGET_MS,
			today,
		});
		topic = research.topic;

		// 2. Write the article from the research notes.
		const result = await writeArticle({
			apiKey,
			model: settings.model,
			topic: research.topic,
			research: research.notes,
			existingPosts: posts,
			brief: settings.brief,
			timeoutMs: Math.max(60_000, RUN_BUDGET_MS - (Date.now() - startedAt)),
			today,
		});
		const { article } = result;

		// EmDash builds the URL slug from the title at creation and keeps it after
		// title edits, so the post is created under its short keyword phrase
		// ("best wishlist apps shopify" -> /blog/best-wishlist-apps-shopify) and
		// renamed to the real title straight away.
		const created = await content.create(COLLECTION, {
			title: article.urlSlug || article.title,
			excerpt: article.excerpt,
			content: articleToPortableText(article.bodyMarkdown),
			seo: { title: article.seoTitle, description: article.seoDescription },
			...(BRAND.fields.seoTitle ? { [BRAND.fields.seoTitle]: article.seoTitle } : {}),
			...(BRAND.fields.seoDescription ? { [BRAND.fields.seoDescription]: article.seoDescription } : {}),
		});

		let featuredImage: CoverMedia | null = null;
		try {
			// Loaded on demand: the module pulls in resvg's wasm and the fonts, which
			// only the Worker bundle can resolve (not astro.config at startup).
			const { createCover } = await import("./cover.js");
			featuredImage = await createCover(ctx, {
				title: article.title,
				slug: created.slug ?? slugify(article.urlSlug || article.title),
				type: research.type,
				checkedMonth: today.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
			});
		} catch (error) {
			ctx.log.warn("Auto Blog: cover image failed; the post is saved without one", {
				error: error instanceof Error ? error.message : String(error),
			});
		}

		const item = content.update
			? await content.update(COLLECTION, created.id, {
					title: article.title,
					...(featuredImage ? { [BRAND.fields.cover]: featuredImage } : {}),
				})
			: created;

		if (queuedTopic) await markTopicUsed(ctx, queuedTopic);

		try {
			await assignTerms(ctx, item.id, article);
		} catch (error) {
			ctx.log.warn("Auto Blog: could not assign categories or tags", {
				postId: item.id,
				error: error instanceof Error ? error.message : String(error),
			});
		}

		let status: RunLogEntry["status"] = "draft";
		if (settings.publishMode === "publish" && content.getVersioned && content.publish) {
			const versioned = await content.getVersioned(COLLECTION, item.id);
			if (versioned) {
				await content.publish(COLLECTION, item.id, { _rev: versioned._rev });
				status = "published";
			}
		}

		const entry: RunLogEntry = {
			at: new Date().toISOString(),
			trigger,
			status,
			title: article.title,
			postId: item.id,
			topic,
			model: result.model,
			tokens: {
				input: research.inputTokens + result.inputTokens,
				output: research.outputTokens + result.outputTokens,
			},
			durationMs: Date.now() - startedAt,
		};
		await appendLog(ctx, entry);
		ctx.log.info("Auto Blog: post written", { postId: item.id, status, title: article.title });
		return {
			ok: true,
			message: status === "published" ? `Published "${article.title}"` : `Saved draft "${article.title}"`,
			entry,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const entry: RunLogEntry = {
			at: new Date().toISOString(),
			trigger,
			status: "failed",
			topic,
			error: message,
			durationMs: Date.now() - startedAt,
		};
		await appendLog(ctx, entry);
		ctx.log.error("Auto Blog: run failed", { error: message });
		return { ok: false, message, entry };
	} finally {
		await ctx.kv.delete(KV_LOCK);
	}
}
