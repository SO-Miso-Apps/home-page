import { markdownToPortableText } from "emdash/client";

/**
 * EmDash's Markdown converter has no table support, but its renderer has a
 * `table` block and the converter passes through opaque block lines
 * (`<!--ec:block {json} -->`). Pipe tables are turned into those lines first.
 */

const TABLE_LINE = /^\s*\|.*\|\s*$/;
const SEPARATOR_LINE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

let counter = 0;
function key(): string {
	counter = (counter + 1) % 1_000_000;
	return `t${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function splitRow(line: string): string[] {
	return line
		.trim()
		.replace(/^\|/, "")
		.replace(/\|$/, "")
		.split("|")
		.map((cell) => cell.trim());
}

type Span = { _type: "span"; _key: string; text: string; marks: string[] };

/** Cell text to spans: links become their text, **bold** is kept, other Markdown is stripped. */
function cellSpans(raw: string): Span[] {
	const text = raw
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/(^|\W)_([^_]+)_(?=\W|$)/g, "$1$2")
		.replace(/`/g, "")
		.replace(/-->/g, "->");
	const spans: Span[] = [];
	const parts = text.split(/\*\*/);
	parts.forEach((part, index) => {
		if (!part) return;
		spans.push({ _type: "span", _key: key(), text: part, marks: index % 2 === 1 ? ["strong"] : [] });
	});
	return spans.length > 0 ? spans : [{ _type: "span", _key: key(), text: "", marks: [] }];
}

function tableBlock(header: string[], body: string[][]): Record<string, unknown> {
	const width = Math.max(header.length, ...body.map((row) => row.length));
	const pad = (row: string[]) => [...row, ...Array(width - row.length).fill("")].slice(0, width);
	const row = (cells: string[], isHeader: boolean) => ({
		_type: "tableRow",
		_key: key(),
		cells: pad(cells).map((cell) => ({
			_type: "tableCell",
			_key: key(),
			content: cellSpans(cell),
			...(isHeader ? { isHeader: true } : {}),
		})),
	});
	return {
		_type: "table",
		_key: key(),
		hasHeaderRow: true,
		rows: [row(header, true), ...body.map((cells) => row(cells, false))],
	};
}

/** Replace each pipe table (header, separator, rows) with one opaque table block line. */
export function tablesToBlocks(markdown: string): string {
	const lines = markdown.split("\n");
	const out: string[] = [];
	for (let i = 0; i < lines.length; i++) {
		const isTableStart =
			TABLE_LINE.test(lines[i]) && i + 1 < lines.length && SEPARATOR_LINE.test(lines[i + 1]);
		if (!isTableStart) {
			out.push(lines[i]);
			continue;
		}
		const header = splitRow(lines[i]);
		const body: string[][] = [];
		i += 2;
		while (i < lines.length && TABLE_LINE.test(lines[i])) {
			body.push(splitRow(lines[i]));
			i++;
		}
		i--;
		out.push("", `<!--ec:block ${JSON.stringify(tableBlock(header, body))} -->`, "");
	}
	return out.join("\n");
}

export function articleToPortableText(markdown: string): ReturnType<typeof markdownToPortableText> {
	return markdownToPortableText(tablesToBlocks(markdown));
}
