/**
 * Shape validation for everything a model hands back. The agent replies are
 * untrusted input: they are parsed into the pipeline's types here, once, so the
 * gates can assume the shape instead of guessing.
 */

import type { Critique, Draft, FigureSpec, FigureTemplate, PortableBlock } from "./types.ts";

const FIGURES: FigureTemplate[] = ["og-card", "flow", "timeline", "compare-table", "rule-tree"];

class DraftShapeError extends Error {
  constructor(field: string, expected: string) {
    super(`draft: ${field} ${expected}`);
  }
}

const isObject = (value: unknown): boolean => typeof value === "object" && value !== null && !Array.isArray(value);

function str(source: Record<string, unknown>, field: string, path: string): string {
  const value = source[field];
  if (typeof value !== "string" || value.trim() === "") throw new DraftShapeError(`${path}${field}`, "must be a non-empty string");
  return value;
}

function strArray(source: Record<string, unknown>, field: string, path: string): string[] {
  const value = source[field];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new DraftShapeError(`${path}${field}`, "must be an array of strings");
  }
  return value as string[];
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isObject(value)) throw new DraftShapeError(path.replace(/\.$/, ""), "must be an object");
  return value as Record<string, unknown>;
}

function parseBlock(raw: unknown, index: number): PortableBlock {
  const block = asRecord(raw, `content[${index}]`);
  const key = typeof block._key === "string" && block._key !== "" ? block._key : undefined;
  if (!key) throw new DraftShapeError(`content[${index}]._key`, "is required");

  if (block._type === "block") {
    if (typeof block.style !== "string") throw new DraftShapeError(`content[${index}].style`, "must be a string");
    if (!Array.isArray(block.children) || block.children.length === 0) {
      throw new DraftShapeError(`content[${index}].children`, "must be a non-empty array");
    }
    const children = block.children.map((child, childIndex) => {
      const span = asRecord(child, `content[${index}].children[${childIndex}]`);
      if (span._type !== "span") throw new DraftShapeError(`content[${index}].children[${childIndex}]._type`, 'must be "span"');
      return {
        _type: "span" as const,
        _key: typeof span._key === "string" && span._key !== "" ? span._key : `s${index}${childIndex}`,
        text: str(span, "text", `content[${index}].children[${childIndex}].`),
        marks: Array.isArray(span.marks) ? (span.marks.filter((mark) => typeof mark === "string") as string[]) : [],
      };
    });
    return {
      _type: "block",
      _key: key,
      style: block.style,
      markDefs: Array.isArray(block.markDefs) ? (block.markDefs as { _key: string; _type: string; href?: string }[]) : [],
      children,
      listItem: block.listItem === "bullet" || block.listItem === "number" ? block.listItem : undefined,
      level: typeof block.level === "number" ? block.level : undefined,
    };
  }

  if (block._type === "image") {
    return { _type: "image", _key: key, alt: typeof block.alt === "string" ? block.alt : undefined };
  }

  if (block._type === "code") {
    return { _type: "code", _key: key, code: str(block, "code", `content[${index}].`), language: typeof block.language === "string" ? block.language : undefined };
  }

  throw new DraftShapeError(`content[${index}]._type`, `is "${String(block._type)}", which the renderer cannot draw`);
}

function parseFigure(raw: unknown): FigureSpec {
  const figure = asRecord(raw, "figure");
  const template = str(figure, "template", "figure.") as FigureTemplate;
  if (!FIGURES.includes(template)) throw new DraftShapeError("figure.template", `must be one of ${FIGURES.join(", ")}`);
  const rows = Array.isArray(figure.rows) ? figure.rows : [];
  return {
    template,
    eyebrow: str(figure, "eyebrow", "figure."),
    headline: str(figure, "headline", "figure."),
    rows: rows.map((row, index) => {
      const entry = asRecord(row, `figure.rows[${index}]`);
      return { label: str(entry, "label", `figure.rows[${index}].`), value: str(entry, "value", `figure.rows[${index}].`) };
    }),
    note: typeof figure.note === "string" ? figure.note : undefined,
  };
}

export function parseDraft(raw: unknown): Draft {
  const draft = asRecord(raw, "draft");
  if (!Array.isArray(draft.content) || draft.content.length === 0) {
    throw new DraftShapeError("content", "must be a non-empty array of Portable Text blocks");
  }
  return {
    title: str(draft, "title", ""),
    slug: str(draft, "slug", ""),
    excerpt: str(draft, "excerpt", ""),
    seo_title: str(draft, "seo_title", ""),
    seo_description: str(draft, "seo_description", ""),
    used_facts: strArray(draft, "used_facts", ""),
    internal_links: strArray(draft, "internal_links", ""),
    content: draft.content.map(parseBlock),
    figure: parseFigure(draft.figure),
  };
}

export function parseCritique(raw: unknown): Critique {
  const critique = asRecord(raw, "critique");
  const scores = asRecord(critique.scores, "scores");
  const score = (field: string): number => {
    const value = scores[field];
    if (typeof value !== "number" || Number.isNaN(value)) throw new DraftShapeError(`scores.${field}`, "must be a number");
    return value;
  };
  const verdict = critique.verdict === "pass" ? "pass" : "fail";
  const violations = Array.isArray(critique.violations) ? critique.violations : [];
  return {
    scores: {
      factuality: score("factuality"),
      specificity: score("specificity"),
      originality: score("originality"),
      seo: score("seo"),
      usefulness: score("usefulness"),
    },
    violations: violations.map((violation, index) => {
      const entry = asRecord(violation, `violations[${index}]`);
      return {
        kind: typeof entry.kind === "string" ? entry.kind : "other",
        quote: typeof entry.quote === "string" ? entry.quote : "",
        why: typeof entry.why === "string" ? entry.why : "",
      };
    }),
    verdict,
    rewrite_notes: typeof critique.rewrite_notes === "string" ? critique.rewrite_notes : "",
  };
}
