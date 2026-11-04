import type { PluginContext } from "emdash";

export const PLUGIN_ID = "auto-blog";
export const PLUGIN_VERSION = "0.1.0";

export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const MODELS = [
	{ value: "claude-opus-5-5", label: "Claude Opus 5.5 (best writing)" },
	{ value: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (cheaper)" },
] as const;

export type PublishMode = "draft" | "publish";

export interface AutoBlogSettings {
	enabled: boolean;
	/** UTC weekdays to write on. */
	days: Weekday[];
	/** UTC hour (0-23) to write at. */
	hour: number;
	publishMode: PublishMode;
	model: string;
	/** Queue of topics, one per line. The first unused one is written next. */
	topics: string;
	/** Extra editorial guidance added to the prompt. */
	brief: string;
}

export const DEFAULTS: AutoBlogSettings = {
	enabled: false,
	days: ["tue", "fri"],
	hour: 13,
	publishMode: "draft",
	model: "claude-opus-5-5",
	topics: "",
	brief: "",
};

/** Settings declared to EmDash. `anthropicApiKey` is a secret, so it is encrypted at rest. */
export const SETTINGS_SCHEMA = {
	anthropicApiKey: {
		type: "secret",
		label: "Claude API key",
		description: "From console.anthropic.com. Stored encrypted.",
	},
} as const;

export function parseDays(value: unknown): Weekday[] {
	const raw = Array.isArray(value) ? value.join(",") : typeof value === "string" ? value : "";
	const days = raw
		.toLowerCase()
		.split(/[\s,]+/)
		.map((d) => d.slice(0, 3))
		.filter((d): d is Weekday => (WEEKDAYS as readonly string[]).includes(d));
	return [...new Set(days)];
}

export async function loadSettings(ctx: PluginContext): Promise<AutoBlogSettings> {
	const [enabled, days, hour, publishMode, model, topics, brief] = await Promise.all([
		ctx.settings.get<boolean>("enabled"),
		ctx.settings.get<string>("days"),
		ctx.settings.get<number>("hour"),
		ctx.settings.get<string>("publishMode"),
		ctx.settings.get<string>("model"),
		ctx.settings.get<string>("topics"),
		ctx.settings.get<string>("brief"),
	]);
	const parsedDays = days === null ? DEFAULTS.days : parseDays(days);
	return {
		enabled: enabled ?? DEFAULTS.enabled,
		days: parsedDays,
		hour: typeof hour === "number" && hour >= 0 && hour <= 23 ? Math.floor(hour) : DEFAULTS.hour,
		publishMode: publishMode === "publish" ? "publish" : "draft",
		model: MODELS.some((m) => m.value === model) ? (model as string) : DEFAULTS.model,
		topics: topics ?? DEFAULTS.topics,
		brief: brief ?? DEFAULTS.brief,
	};
}

/**
 * The key saved in the admin wins; otherwise fall back to the
 * ANTHROPIC_API_KEY Worker secret (process.env is populated under nodejs_compat).
 */
export async function getApiKey(ctx: PluginContext): Promise<string | null> {
	const saved = await ctx.settings.get<string>("anthropicApiKey");
	if (saved && saved.trim()) return saved.trim();
	const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
	const fromEnv = proc?.env?.ANTHROPIC_API_KEY;
	return fromEnv && fromEnv.trim() ? fromEnv.trim() : null;
}

export function topicQueue(topics: string): string[] {
	return topics
		.split("\n")
		.map((t) => t.trim())
		.filter(Boolean);
}
