/**
 * Minimal TrueType reader: advance widths from `cmap` (format 4) and `hmtx`,
 * enough to wrap cover titles. resvg does not wrap text, so lines are broken
 * here before the SVG is built. Kerning is ignored (a few pixels at most).
 */
export class FontMetrics {
	private readonly view: DataView;
	private readonly unitsPerEm: number;
	private readonly advances: Uint16Array;
	private readonly glyphFor = new Map<number, number>();

	constructor(buffer: ArrayBuffer) {
		this.view = new DataView(buffer);
		const tables = this.readTables();
		const head = tables.get("head");
		const hhea = tables.get("hhea");
		const hmtx = tables.get("hmtx");
		const cmap = tables.get("cmap");
		if (head === undefined || hhea === undefined || hmtx === undefined || cmap === undefined) {
			throw new Error("Font is missing head, hhea, hmtx or cmap.");
		}
		this.unitsPerEm = this.view.getUint16(head + 18);
		const metrics = this.view.getUint16(hhea + 34);
		this.advances = new Uint16Array(metrics);
		for (let i = 0; i < metrics; i++) this.advances[i] = this.view.getUint16(hmtx + i * 4);
		this.readCmap(cmap);
	}

	private readTables(): Map<string, number> {
		const tables = new Map<string, number>();
		const count = this.view.getUint16(4);
		for (let i = 0; i < count; i++) {
			const record = 12 + i * 16;
			const tag = String.fromCharCode(
				this.view.getUint8(record),
				this.view.getUint8(record + 1),
				this.view.getUint8(record + 2),
				this.view.getUint8(record + 3),
			);
			tables.set(tag, this.view.getUint32(record + 8));
		}
		return tables;
	}

	private readCmap(cmap: number): void {
		const count = this.view.getUint16(cmap + 2);
		let subtable = -1;
		for (let i = 0; i < count; i++) {
			const record = cmap + 4 + i * 8;
			const platform = this.view.getUint16(record);
			const encoding = this.view.getUint16(record + 2);
			const offset = cmap + this.view.getUint32(record + 4);
			if (this.view.getUint16(offset) !== 4) continue;
			if ((platform === 3 && encoding === 1) || platform === 0) {
				subtable = offset;
				break;
			}
		}
		if (subtable < 0) throw new Error("Font has no format 4 cmap.");
		const segments = this.view.getUint16(subtable + 6) / 2;
		const ends = subtable + 14;
		const starts = ends + segments * 2 + 2;
		const deltas = starts + segments * 2;
		const rangeOffsets = deltas + segments * 2;
		for (let s = 0; s < segments; s++) {
			const end = this.view.getUint16(ends + s * 2);
			const start = this.view.getUint16(starts + s * 2);
			const delta = this.view.getInt16(deltas + s * 2);
			const rangeOffsetAt = rangeOffsets + s * 2;
			const rangeOffset = this.view.getUint16(rangeOffsetAt);
			// Only the characters a title can contain (Latin and punctuation).
			for (let code = start; code <= Math.min(end, 0x2fff); code++) {
				if (code === 0xffff) break;
				let glyph: number;
				if (rangeOffset === 0) {
					glyph = (code + delta) & 0xffff;
				} else {
					const at = rangeOffsetAt + rangeOffset + (code - start) * 2;
					glyph = this.view.getUint16(at);
					if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
				}
				if (glyph !== 0) this.glyphFor.set(code, glyph);
			}
		}
	}

	/** Width of `text` in pixels at `size`. */
	width(text: string, size: number): number {
		let units = 0;
		for (const char of text) {
			const glyph = this.glyphFor.get(char.codePointAt(0) ?? 0) ?? 0;
			units += this.advances[Math.min(glyph, this.advances.length - 1)] ?? 0;
		}
		return (units / this.unitsPerEm) * size;
	}

	/** Greedy word wrap into lines no wider than `maxWidth`. */
	wrap(text: string, size: number, maxWidth: number): string[] {
		const lines: string[] = [];
		let line = "";
		for (const word of text.split(/\s+/).filter(Boolean)) {
			const next = line ? `${line} ${word}` : word;
			if (line && this.width(next, size) > maxWidth) {
				lines.push(line);
				line = word;
			} else {
				line = next;
			}
		}
		if (line) lines.push(line);
		return lines;
	}
}
