import type { PluginContext } from "emdash";

import { backfillCovers } from "./backfill.js";
import { isRunning, nextTopic, readLog, runOnce } from "./run.js";
import { MODELS, WEEKDAYS, getApiKey, loadSettings, parseDays, topicQueue } from "./settings.js";

type Block = Record<string, unknown>;
interface BlockResponse {
	blocks: Block[];
	toast?: { message: string; type: "success" | "error" | "info" };
}

interface Interaction {
	type?: string;
	action_id?: string;
	values?: Record<string, unknown>;
}

function asInteraction(input: unknown): Interaction {
	return input && typeof input === "object" ? (input as Interaction) : {};
}

function formatWhen(iso: string): string {
	return `${iso.slice(0, 16).replace("T", " ")} UTC`;
}

async function renderPage(ctx: PluginContext): Promise<BlockResponse> {
	const [settings, hasKey, log, running] = await Promise.all([
		loadSettings(ctx),
		getApiKey(ctx).then(Boolean),
		readLog(ctx),
		isRunning(ctx),
	]);
	const queue = topicQueue(settings.topics);
	const upcoming = await nextTopic(ctx, settings);
	const written = log.filter((e) => e.status !== "failed" && e.status !== "skipped").length;

	const blocks: Block[] = [{ type: "header", text: "Auto Blog" }];

	if (!hasKey) {
		blocks.push({
			type: "banner",
			variant: "alert",
			title: "Add a Claude API key",
			description:
				"Paste a key from console.anthropic.com below, or set the ANTHROPIC_API_KEY Worker secret.",
		});
	}
	if (running) {
		blocks.push({
			type: "banner",
			title: "Writing a post now",
			description: "Claude is researching the Shopify App Store, then writing the comparison. This usually takes three to seven minutes.",
		});
	}

	blocks.push(
		{
			type: "stats",
			items: [
				{ label: "Schedule", value: settings.enabled ? "On" : "Off" },
				{ label: "Topics queued", value: String(queue.length) },
				{ label: "Recent posts written", value: String(written) },
			],
		},
		{
			type: "section",
			text: upcoming
				? `Next topic: ${upcoming}`
				: "The topic queue is empty, so Claude picks a fresh app comparison the blog has not covered, mostly in categories where our apps compete.",
			accessory: {
				type: "button",
				label: "Write a post now",
				action_id: "generate_now",
				style: "primary",
				confirm: {
					title: "Write a post now?",
					text: `Claude writes one post and saves it as ${
						settings.publishMode === "publish" ? "a published post" : "a draft"
					}. This uses your API credit and takes a few minutes.`,
					confirm: "Write it",
					deny: "Cancel",
				},
			},
		},
		{
			type: "section",
			text: "Cover images: every new post gets a generated 1200×630 cover, also used when the post is shared. Posts written before this have none.",
			accessory: {
				type: "button",
				label: "Add covers to posts without one",
				action_id: "backfill_covers",
				confirm: {
					title: "Add missing covers?",
					text: "Generates a cover for up to 10 posts without one. Published posts are republished so the cover goes live, which also publishes any unsaved draft edits on them. No API credit is used.",
					confirm: "Add covers",
					deny: "Cancel",
				},
			},
		},
		{ type: "divider" },
		{
			type: "form",
			block_id: "settings",
			fields: [
				{
					type: "secret_input",
					action_id: "anthropicApiKey",
					label: "Claude API key",
					has_value: hasKey,
				},
				{
					type: "toggle",
					action_id: "enabled",
					label: "Write posts on a schedule",
					initial_value: settings.enabled,
				},
				{
					type: "text_input",
					action_id: "days",
					label: "Days (UTC), comma separated: mon, tue, wed, thu, fri, sat, sun",
					initial_value: settings.days.join(", "),
				},
				{
					type: "number_input",
					action_id: "hour",
					label: "Hour (UTC, 0 to 23)",
					min: 0,
					max: 23,
					initial_value: settings.hour,
				},
				{
					type: "select",
					action_id: "publishMode",
					label: "New posts",
					options: [
						{ label: "Save as draft for review", value: "draft" },
						{ label: "Publish immediately", value: "publish" },
					],
					initial_value: settings.publishMode,
				},
				{
					type: "select",
					action_id: "model",
					label: "Model",
					options: MODELS.map((m) => ({ label: m.label, value: m.value })),
					initial_value: settings.model,
				},
				{
					type: "text_input",
					action_id: "topics",
					label: "Topic queue, one per line, e.g. \"Best wishlist apps for Shopify\", \"Rewind alternatives for Shopify\", \"App A vs App B\" (written top to bottom, each once)",
					multiline: true,
					initial_value: settings.topics,
				},
				{
					type: "text_input",
					action_id: "brief",
					label: "Extra guidance for every post (optional)",
					multiline: true,
					initial_value: settings.brief,
				},
			],
			submit: { label: "Save settings", action_id: "save" },
		},
		{ type: "divider" },
		{ type: "header", text: "Recent runs" },
		{
			type: "table",
			page_action_id: "log_page",
			columns: [
				{ key: "when", label: "When" },
				{ key: "trigger", label: "Trigger" },
				{ key: "status", label: "Result" },
				{ key: "detail", label: "Post or error" },
			],
			rows: log.map((e) => ({
				when: formatWhen(e.at),
				trigger: e.trigger === "manual" ? "Manual" : "Schedule",
				status: e.status,
				detail: e.status === "failed" ? (e.error ?? "Unknown error") : (e.title ?? ""),
			})),
			empty_text: "No runs yet.",
		},
	);

	return { blocks };
}

async function saveSettings(ctx: PluginContext, values: Record<string, unknown>): Promise<string | null> {
	const key = typeof values.anthropicApiKey === "string" ? values.anthropicApiKey.trim() : "";
	if (key) {
		if (!key.startsWith("sk-ant-")) return "That does not look like a Claude API key (sk-ant-...).";
		await ctx.settings.set("anthropicApiKey", key);
	}

	const days = parseDays(values.days);
	const rawDays = typeof values.days === "string" ? values.days.trim() : "";
	if (rawDays && days.length === 0) {
		return `Days must be names like ${WEEKDAYS.slice(1, 4).join(", ")}.`;
	}
	const hour = Number(values.hour);
	if (!Number.isInteger(hour) || hour < 0 || hour > 23) return "Hour must be a whole number from 0 to 23.";

	await Promise.all([
		ctx.settings.set("enabled", values.enabled === true),
		ctx.settings.set("days", days.join(",")),
		ctx.settings.set("hour", hour),
		ctx.settings.set("publishMode", values.publishMode === "publish" ? "publish" : "draft"),
		ctx.settings.set(
			"model",
			MODELS.some((m) => m.value === values.model) ? values.model : MODELS[0].value,
		),
		ctx.settings.set("topics", typeof values.topics === "string" ? values.topics : ""),
		ctx.settings.set("brief", typeof values.brief === "string" ? values.brief : ""),
	]);
	return null;
}

/** Block Kit handler for the plugin's admin page. */
export async function handleAdmin(ctx: PluginContext, input: unknown): Promise<BlockResponse> {
	const interaction = asInteraction(input);

	if (interaction.type === "form_submit" && interaction.action_id === "save") {
		const error = await saveSettings(ctx, interaction.values ?? {});
		return {
			...(await renderPage(ctx)),
			toast: error ? { message: error, type: "error" } : { message: "Settings saved", type: "success" },
		};
	}

	if (interaction.type === "block_action" && interaction.action_id === "generate_now") {
		const outcome = await runOnce(ctx, "manual");
		return {
			...(await renderPage(ctx)),
			toast: { message: outcome.message, type: outcome.ok ? "success" : "error" },
		};
	}

	if (interaction.type === "block_action" && interaction.action_id === "backfill_covers") {
		try {
			const { done, remaining } = await backfillCovers(ctx);
			const message =
				done === 0
					? "Every post already has a cover."
					: `Added covers to ${done} post${done === 1 ? "" : "s"}.${remaining > 0 ? ` ${remaining} left: click again.` : ""}`;
			return { ...(await renderPage(ctx)), toast: { message, type: "success" } };
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return { ...(await renderPage(ctx)), toast: { message, type: "error" } };
		}
	}

	return renderPage(ctx);
}
