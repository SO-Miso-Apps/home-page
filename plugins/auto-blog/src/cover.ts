import { Resvg, initWasm } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import type { PluginContext } from "emdash";

// Generic names so this file is the same on every site; brand.ts names the families.
import monoFont from "../fonts/mono.ttf.bin";
import sansFont from "../fonts/sans.ttf.bin";
import titleFont from "../fonts/title.ttf.bin";
import {
	type ArticleType,
	COVER_HEIGHT,
	COVER_WIDTH,
	MONO,
	SANS,
	buildCoverSvg,
} from "./cover-svg.js";
import { FontMetrics } from "./font-metrics.js";

/**
 * Cover images: a 1200×630 PNG per post, drawn from an SVG template in the
 * site's style and rasterised in the Worker with resvg. Used as the post's
 * featured image and, through the template, as its og:image.
 */

let ready: Promise<void> | null = null;
let serifMetrics: FontMetrics | null = null;

function init(): Promise<void> {
	ready ??= initWasm(resvgWasm);
	return ready;
}

export interface CoverMedia {
	provider: "local";
	id: string;
	src: string;
	filename: string;
	mimeType: "image/png";
	width: number;
	height: number;
	alt: string;
}

export async function renderCoverPng(title: string, type: ArticleType, checkedMonth: string): Promise<Uint8Array> {
	await init();
	serifMetrics ??= new FontMetrics(titleFont);
	const svg = buildCoverSvg({ title, type, checkedMonth }, serifMetrics);
	const resvg = new Resvg(svg, {
		font: {
			fontBuffers: [new Uint8Array(titleFont), new Uint8Array(sansFont), new Uint8Array(monoFont)],
			loadSystemFonts: false,
			defaultFontFamily: SANS,
			monospaceFamily: MONO,
		},
	});
	try {
		const image = resvg.render();
		const png = image.asPng();
		image.free();
		return png;
	} finally {
		resvg.free();
	}
}

/** Render and upload a cover; returns the value for the post's cover image field (BRAND.fields.cover). */
export async function createCover(
	ctx: PluginContext,
	options: { title: string; slug: string; type: ArticleType; checkedMonth: string },
): Promise<CoverMedia | null> {
	const media = ctx.media;
	if (!media?.upload) return null;
	const png = await renderCoverPng(options.title, options.type, options.checkedMonth);
	const filename = `${options.slug || "post"}-cover.png`;
	const bytes = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
	const uploaded = await media.upload(filename, "image/png", bytes);
	const alt = `Cover: ${options.title}`;
	await media.updateMetadata?.(uploaded.mediaId, { alt }).catch(() => undefined);
	return {
		provider: "local",
		id: uploaded.mediaId,
		src: uploaded.url,
		filename,
		mimeType: "image/png",
		width: COVER_WIDTH,
		height: COVER_HEIGHT,
		alt,
	};
}
