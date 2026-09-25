/**
 * Deterministic gates. Pure functions only — no I/O — so the rules that stand
 * between a model and the live blog are fully unit-testable.
 */

import type { Fact } from "./facts.ts";
import { factsText } from "./facts.ts";
import {
  BACKTICKED_IDENTIFIER,
  BANNED_PHRASES,
  EMOJI,
  MAX_WORDS,
  MIN_WORDS,
  NUMBER_WITH_UNIT,
  SEO_DESCRIPTION_MAX,
  SEO_DESCRIPTION_MIN,
  TITLE_MAX_CHARS,
} from "./rules.ts";
import type { Topic } from "./topics.ts";
import type { Draft, FigureTemplate, GateFailure, GateResult, PortableBlock } from "./types.ts";

export { BANNED_PHRASES };

const KNOWN_APPS = ["so-product-history-revert", "so-auto-tags-all-in-one", "so-sticky-add-to-cart", "so-llms-txt"];
const STATIC_PATHS = ["/", "/blog", "/services"];
const FIGURES: FigureTemplate[] = ["og-card", "flow", "timeline", "compare-table", "rule-tree"];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type GateInput = {
  draft: Draft;
  facts: Fact[];
  topic: Topic;
  existingSlugs: string[];
  apps?: string[];
};

const blockText = (block: PortableBlock): string => {
  if (block._type === "block") return block.children.map((child) => child.text).join(" ");
  if (block._type === "code") return block.code;
  return "";
};

export const draftText = (content: PortableBlock[]): string => content.map(blockText).join("\n");

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function trigrams(value: string): Set<string> {
  const padded = `  ${value} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) grams.add(padded.slice(i, i + 3));
  return grams;
}

function similarity(a: string, b: string): number {
  const left = trigrams(a);
  const right = trigrams(b);
  let shared = 0;
  for (const gram of left) if (right.has(gram)) shared++;
  const union = left.size + right.size - shared;
  return union === 0 ? 1 : shared / union;
}

/** Numbers with a unit and backticked identifiers must exist in the fact sheet. */
function untraceableClaims(text: string, facts: Fact[]): string[] {
  const allowed = factsText(facts).replace(/,/g, "");
  const missing: string[] = [];
  for (const match of text.matchAll(NUMBER_WITH_UNIT)) {
    const token = match[0].toLowerCase().replace(/\s+/g, " ").replace(/,/g, "");
    if (!allowed.includes(token)) missing.push(token);
  }
  for (const match of text.matchAll(BACKTICKED_IDENTIFIER)) {
    const token = match[1].toLowerCase();
    if (token.length > 1 && !allowed.includes(token)) missing.push(`\`${token}\``);
  }
  return [...new Set(missing)];
}

const KNOWN_BLOCK_TYPES = ["block", "image", "code"];

function schemaFailures(content: PortableBlock[]): string[] {
  const problems: string[] = [];
  if (content.length === 0) problems.push("content is empty");
  const keys = new Set<string>();
  content.forEach((block, index) => {
    if (!KNOWN_BLOCK_TYPES.includes(String(block._type))) {
      problems.push(`block ${index} has unsupported type "${String(block._type)}"`);
      return;
    }
    if (typeof block._key !== "string" || block._key === "") problems.push(`block ${index} has no _key`);
    else if (keys.has(block._key)) problems.push(`block ${index} reuses _key ${block._key}`);
    else keys.add(block._key);

    if (block._type === "block") {
      if (!Array.isArray(block.children) || block.children.length === 0) problems.push(`block ${index} has no children`);
      else {
        for (const child of block.children) {
          if (child._type !== "span" || typeof child.text !== "string") problems.push(`block ${index} has a child that is not a text span`);
        }
      }
    }
    if (block._type === "image" && block.asset?.url === "" && !block.asset?.id) {
      problems.push(`image block ${index} has an empty asset`);
    }
  });
  return problems;
}

function structureFailures(content: PortableBlock[]): string[] {
  const problems: string[] = [];
  const levels: number[] = [];
  let h2Count = 0;
  let hasList = false;
  for (const block of content) {
    if (block._type !== "block") continue;
    if (block.listItem) hasList = true;
    const match = block.style.match(/^h([1-6])$/);
    if (!match) continue;
    const level = Number(match[1]);
    levels.push(level);
    if (level === 2) h2Count++;
  }
  if (h2Count < 3) problems.push(`only ${h2Count} h2 headings; at least 3 required`);
  if (levels[0] !== 2) problems.push("the first heading must be an h2 (the post title is the h1)");
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) problems.push(`heading level jumps from h${levels[i - 1]} to h${levels[i]}`);
  }
  if (!hasList) problems.push("no list block; add at least one bulleted list");
  return problems;
}

function linkFailures(links: string[], existingSlugs: string[], apps: string[]): string[] {
  const problems: string[] = [];
  if (links.length < 2) problems.push(`only ${links.length} internal links; at least 2 required`);
  let appLinks = 0;
  for (const link of links) {
    if (!link.startsWith("/")) {
      problems.push(`"${link}" is not a site-relative path`);
      continue;
    }
    const [, section, slug] = link.split("/");
    if (section === "apps") {
      if (!apps.includes(slug ?? "")) problems.push(`"${link}" points at an app the site does not serve`);
      else appLinks++;
      continue;
    }
    if (section === "blog") {
      if (slug === undefined) continue;
      if (!existingSlugs.includes(slug)) problems.push(`"${link}" points at a post that is not published yet`);
      continue;
    }
    if (link === "/" || STATIC_PATHS.includes(link)) continue;
    problems.push(`"${link}" is not a known path`);
  }
  if (appLinks === 0) problems.push("no link to an /apps/ page");
  return problems;
}

export function runGates({ draft, facts, topic, existingSlugs, apps = KNOWN_APPS }: GateInput): GateResult {
  const failures: GateFailure[] = [];
  const add = (code: string, detail: string) => failures.push({ code, detail });

  for (const problem of schemaFailures(draft.content)) add("schema", problem);

  const text = draftText(draft.content);
  const words = text.split(/\s+/).filter(Boolean).length;

  if (draft.title.length > TITLE_MAX_CHARS) add("title_len", `title is ${draft.title.length} chars`);
  const normalize = (value: string) => slugify(value).replace(/-/g, " ");
  if (!normalize(draft.title).includes(normalize(topic.primaryKeyword))) {
    add("title_keyword", `title does not contain "${topic.primaryKeyword}"`);
  }
  if (draft.seo_description.length < SEO_DESCRIPTION_MIN || draft.seo_description.length > SEO_DESCRIPTION_MAX) {
    add("seo_desc", `seo_description is ${draft.seo_description.length} chars; expected ${SEO_DESCRIPTION_MIN}-${SEO_DESCRIPTION_MAX}`);
  }
  if (!KEBAB.test(draft.slug) || draft.slug.length > 60) add("slug", `"${draft.slug}" is not a kebab-case slug of at most 60 chars`);

  if (words < MIN_WORDS || words > MAX_WORDS) add("body_len", `body is ${words} words; expected ${MIN_WORDS}-${MAX_WORDS}`);
  for (const problem of structureFailures(draft.content)) add("structure", problem);
  for (const problem of linkFailures(draft.internal_links, existingSlugs, apps)) add("links", problem);

  const lower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) add("banned", `banned phrase "${phrase}"`);
  }
  if (EMOJI.test(text)) add("banned", "body contains an emoji");

  for (const token of untraceableClaims(text, facts)) add("fact_trace", `"${token}" is not in the fact sheet`);

  const used = new Set(draft.used_facts);
  const unusedRequired = topic.factsRequired.filter((id) => !used.has(id));
  if (unusedRequired.length > 0) add("facts_used", `used_facts omits the topic's required facts: ${unusedRequired.join(", ")}`);

  const titleSlug = slugify(draft.title);
  const clash = existingSlugs.find(
    (slug) => slug === draft.slug || slug === titleSlug || similarity(slug, draft.slug) >= 0.9 || similarity(slug, titleSlug) >= 0.9,
  );
  if (clash) add("duplicate", `collides with published post "${clash}"`);

  if (!FIGURES.includes(draft.figure.template)) add("figure", `unknown figure template "${draft.figure.template}"`);
  for (const token of untraceableClaims(draft.figure.rows.map((row) => `${row.label} ${row.value}`).join(" "), facts)) {
    add("figure", `figure row value "${token}" is not in the fact sheet`);
  }

  return { ok: failures.length === 0, failures };
}
