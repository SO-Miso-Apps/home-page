/**
 * Everything that differs between the sites running this plugin
 * (themivo.com and misoapps.com). Every other file in src/ is shared and
 * should stay identical in both repos; change only this file and fonts/.
 */

import type { Publisher } from "./our-apps.js";

export const BRAND = {
	/** Must match "name" in package.json. */
	packageName: "@misoapps/plugin-auto-blog",
	siteName: "Miso Apps",
	origin: "https://misoapps.com",
	/** Our apps from this publisher are "ours"; the other publisher is the sister studio. */
	publisher: "Miso Apps" as Publisher,
	sisterStudio: "Themivo" as Publisher,
	whoWeAre:
		"Miso Apps, and its sister studio Themivo (same team), build focused Shopify apps and design and customize Shopify themes. Our apps cover store automation (tagging, product history), conversion and AI-readable store data.",

	/** Field names of the `posts` collection in this site's seed. */
	fields: {
		/** Image field the cover goes into (also used for og:image by the templates). */
		cover: "og_image",
		/** Plain-text SEO fields, or null when the site only uses EmDash's SEO panel. */
		seoTitle: "seo_title" as string | null,
		seoDescription: "seo_description" as string | null,
	},

	/** Cover image style (DESIGN.md "Bát miso"). Font families must match the TTFs in fonts/. */
	cover: {
		paper: "#f3efe6",
		card: "#fcfcfa",
		ink: "#1b1a17",
		ink2: "#5e5a52",
		line: "#e2dbcc",
		accent: "#c2481a",
		titleFont: "Fraunces",
		titleWeight: 600,
		sansFont: "Onest",
		monoFont: "IBM Plex Mono",
		/** Logo mark drawn in a 64×64 box; {ink}, {paper} and {accent} are replaced. */
		logo: `<g transform="scale(2)"><path d="M4 16.5h24a12 12 0 0 1-24 0Z" fill="{accent}"/><path d="M10 13.5v-3.25a3 3 0 0 1 6 0v3.25M16 10.25a3 3 0 0 1 6 0v3.25" fill="none" stroke="{accent}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`,
		footer: "misoapps.com/blog",
	},
} as const;
