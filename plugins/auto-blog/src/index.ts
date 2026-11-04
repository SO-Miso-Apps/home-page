/**
 * Auto Blog: an EmDash plugin that writes Shopify app comparison posts with Claude.
 * Site-specific settings (name, domain, fields, cover style) live in brand.ts.
 *
 * An hourly cron tick checks the schedule (UTC weekdays + hour) set on the
 * plugin's admin page. When a run is due it asks Claude for one article as
 * structured JSON (after researching the Shopify App Store), converts the
 * Markdown body to Portable Text, renders a cover image, saves it to the
 * `posts` collection with categories and tags, and either leaves it as a
 * draft or publishes it.
 *
 * Native format: it runs in-process, so it works without Worker Loader.
 */

import type { PluginDescriptor, ResolvedPlugin } from "emdash";
import { definePlugin } from "emdash";

import { handleAdmin } from "./admin.js";
import { BRAND } from "./brand.js";
import { isDue, runOnce } from "./run.js";
import { PLUGIN_ID, PLUGIN_VERSION, SETTINGS_SCHEMA, loadSettings } from "./settings.js";

const CAPABILITIES = [
	"content:write",
	"content:publish",
	"taxonomies:write",
	"media:write",
	"network:request",
] as const;
const ALLOWED_HOSTS = ["api.anthropic.com"];
const ADMIN_PAGES = [{ path: "/", label: "Auto Blog", icon: "pencil" }];
const TICK = "tick";

export type AutoBlogOptions = Record<string, never>;

/** Descriptor for `emdash({ plugins: [autoBlogPlugin()] })` in astro.config.mjs. */
export function autoBlogPlugin(options: AutoBlogOptions = {}): PluginDescriptor<AutoBlogOptions> {
	return {
		id: PLUGIN_ID,
		version: PLUGIN_VERSION,
		format: "native",
		entrypoint: BRAND.packageName,
		options,
		capabilities: [...CAPABILITIES],
		allowedHosts: ALLOWED_HOSTS,
		adminPages: ADMIN_PAGES,
	};
}

export function createPlugin(_options: AutoBlogOptions = {}): ResolvedPlugin {
	return definePlugin({
		id: PLUGIN_ID,
		version: PLUGIN_VERSION,
		capabilities: [...CAPABILITIES],
		allowedHosts: ALLOWED_HOSTS,

		hooks: {
			"plugin:activate": {
				handler: async (_event, ctx) => {
					// Hourly tick; the handler decides whether today's post is due.
					await ctx.cron?.schedule(TICK, { schedule: "0 * * * *" });
				},
			},

			cron: {
				// A generation can take a few minutes; the default hook timeout is 5s.
				timeout: 9 * 60 * 1000,
				errorPolicy: "continue",
				handler: async (event, ctx) => {
					if (event.name !== TICK) return;
					const settings = await loadSettings(ctx);
					if (!(await isDue(ctx, settings))) return;
					await runOnce(ctx, "schedule");
				},
			},
		},

		routes: {
			// Block Kit admin page: settings, "write now" and the run log.
			admin: {
				permission: "plugins:manage",
				handler: async (ctx) => handleAdmin(ctx, ctx.input),
			},
		},

		admin: {
			pages: ADMIN_PAGES,
			settingsSchema: SETTINGS_SCHEMA,
		},
	});
}

export default createPlugin;
