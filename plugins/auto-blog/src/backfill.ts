import type { PluginContext } from "emdash";

import { BRAND } from "./brand.js";
import type { ArticleType } from "./cover-svg.js";

const COLLECTION = "posts";
/** Posts handled per click, to keep one admin request short. */
const BATCH = 10;

function guessType(title: string): ArticleType {
	if (/\bvs\.?\b|\bversus\b/i.test(title)) return "versus";
	if (/alternative/i.test(title)) return "alternatives";
	return "best";
}

function hasImage(value: unknown): boolean {
	return !!value && typeof value === "object" && !!((value as { src?: string }).src || (value as { id?: string }).id);
}

/**
 * Give posts without a featured image a generated cover. Published posts are
 * republished so the cover goes live (this also publishes any pending draft
 * edits on those posts).
 */
export async function backfillCovers(ctx: PluginContext): Promise<{ done: number; remaining: number }> {
	const content = ctx.content;
	if (!content?.update) throw new Error("The plugin is missing the content:write capability.");
	const { createCover } = await import("./cover.js");

	const missing: { id: string; slug: string | null; title: string; date: string; published: boolean }[] = [];
	let cursor: string | undefined;
	for (let page = 0; page < 4; page++) {
		const result = await content.list(COLLECTION, { limit: 50, cursor, orderBy: { createdAt: "desc" } });
		for (const item of result.items) {
			if (hasImage(item.data[BRAND.fields.cover]) || typeof item.data.title !== "string") continue;
			missing.push({
				id: item.id,
				slug: item.slug,
				title: item.data.title,
				date: item.publishedAt ?? item.createdAt,
				published: !!item.publishedAt,
			});
		}
		if (!result.hasMore || !result.cursor) break;
		cursor = result.cursor;
	}

	let done = 0;
	for (const post of missing.slice(0, BATCH)) {
		const cover = await createCover(ctx, {
			title: post.title,
			slug: post.slug ?? post.id,
			type: guessType(post.title),
			checkedMonth: new Date(post.date).toLocaleString("en-US", {
				month: "long",
				year: "numeric",
				timeZone: "UTC",
			}),
		});
		if (!cover) throw new Error("The plugin is missing the media:write capability.");
		await content.update(COLLECTION, post.id, { [BRAND.fields.cover]: cover });
		if (post.published && content.getVersioned && content.publish) {
			const versioned = await content.getVersioned(COLLECTION, post.id);
			if (versioned) await content.publish(COLLECTION, post.id, { _rev: versioned._rev });
		}
		done++;
	}
	return { done, remaining: missing.length - done };
}
