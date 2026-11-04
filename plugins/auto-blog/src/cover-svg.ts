import { BRAND } from "./brand.js";
import type { FontMetrics } from "./font-metrics.js";

/** Cover and Open Graph image size (the 1.91:1 ratio social networks use). */
export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

export type ArticleType = "best" | "alternatives" | "versus";

export interface CoverInput {
	title: string;
	type: ArticleType;
	/** e.g. "November 2026": when the App Store listings were checked. */
	checkedMonth: string;
}

const { paper: PAPER, card: CARD, ink: INK, ink2: INK_2, line: LINE, accent: ACCENT } = BRAND.cover;

export const SERIF = BRAND.cover.titleFont;
export const SANS = BRAND.cover.sansFont;
export const MONO = BRAND.cover.monoFont;

const LOGO = BRAND.cover.logo
	.replaceAll("{ink}", INK)
	.replaceAll("{paper}", PAPER)
	.replaceAll("{accent}", ACCENT);

const KICKER: Record<ArticleType, string> = {
	best: "BEST APPS COMPARED",
	alternatives: "ALTERNATIVES COMPARED",
	versus: "HEAD TO HEAD",
};

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/** Largest title size that fits in three lines. */
function fitTitle(serif: FontMetrics, title: string): { size: number; lines: string[] } {
	const maxWidth = 1000;
	for (const size of [88, 80, 72, 66, 60, 54]) {
		const lines = serif.wrap(title, size, maxWidth);
		if (lines.length <= 3 && lines.every((l) => serif.width(l, size) <= maxWidth)) {
			return { size, lines };
		}
	}
	const size = 54;
	const lines = serif.wrap(title, size, maxWidth).slice(0, 3);
	return { size, lines };
}

export function buildCoverSvg(input: CoverInput, serif: FontMetrics): string {
	const { size, lines } = fitTitle(serif, input.title);
	const lineHeight = Math.round(size * 1.08);
	// Center the title block between the header (y 150) and the footer rule (y 520).
	const blockHeight = lineHeight * (lines.length - 1) + size * 0.72;
	const firstBaseline = Math.round(150 + (370 - blockHeight) / 2 + size * 0.72);

	const titleLines = lines
		.map(
			(line, i) =>
				`<text x="96" y="${firstBaseline + i * lineHeight}" font-family="${SERIF}" font-weight="${BRAND.cover.titleWeight}" font-size="${size}" fill="${INK}">${escapeXml(line)}</text>`,
		)
		.join("\n  ");

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}">
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="${PAPER}"/>
  <clipPath id="card"><rect x="40" y="40" width="1120" height="550" rx="28"/></clipPath>
  <rect x="40" y="40" width="1120" height="550" rx="28" fill="${CARD}"/>
  <circle cx="1130" cy="580" r="170" fill="${ACCENT}" opacity="0.07" clip-path="url(#card)"/>
  <rect x="40" y="40" width="1120" height="550" rx="28" fill="none" stroke="${LINE}" stroke-width="2"/>
  <g transform="translate(96 82) scale(0.75)">${LOGO}</g>
  <text x="156" y="116" font-family="${SANS}" font-weight="500" font-size="28" fill="${INK}">${escapeXml(BRAND.siteName)}</text>
  <text x="1104" y="114" text-anchor="end" font-family="${MONO}" font-size="18" letter-spacing="2" fill="${ACCENT}">${KICKER[input.type]}</text>
  ${titleLines}
  <line x1="96" y1="520" x2="1104" y2="520" stroke="${LINE}" stroke-width="2"/>
  <text x="96" y="558" font-family="${MONO}" font-size="18" fill="${INK_2}">Checked on the Shopify App Store · ${escapeXml(input.checkedMonth)}</text>
  <text x="1104" y="558" text-anchor="end" font-family="${MONO}" font-size="18" fill="${INK_2}">${escapeXml(BRAND.cover.footer)}</text>
</svg>`;
}
