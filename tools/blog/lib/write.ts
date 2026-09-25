/** The writer: prompt assembly plus the codex call that returns a Draft. */

import { readFileSync } from "node:fs";
import { askAgent } from "./cli-agent.ts";
import type { Fact } from "./facts.ts";
import { extractJson } from "./json.ts";
import { parseDraft } from "./draft.ts";
import { BANNED_PHRASES, MAX_WORDS, MIN_WORDS, SEO_DESCRIPTION_MAX, SEO_DESCRIPTION_MIN, TITLE_MAX_CHARS } from "./rules.ts";
import type { Topic } from "./topics.ts";
import type { AppId, Draft, FigureTemplate } from "./types.ts";

export type WriteInput = {
  facts: Fact[];
  topic: Topic;
  app: AppId;
  styleGuide: string;
  feedback?: string;
  previous?: Draft;
  model?: string;
};

const FIGURE_TEMPLATES: FigureTemplate[] = ["og-card", "flow", "timeline", "compare-table", "rule-tree"];

export function loadStyleGuide(): string {
  return readFileSync(new URL("../prompts/writer.md", import.meta.url), "utf8");
}

function factsBlock(facts: Fact[], required: string[]): string {
  return facts
    .map((fact) => `### ${fact.id}${required.includes(fact.id) ? " — REQUIRED in this post" : ""} — ${fact.claim}\nSource: ${fact.source}`)
    .join("\n\n");
}

export function buildWriterPrompt(input: WriteInput): string {
  const { facts, topic, app, feedback, previous } = input;
  const sections = [
    input.styleGuide,
    `## Rules the gates enforce
A draft that breaks any of these is thrown back without being published.

- Write ${MIN_WORDS} to ${MAX_WORDS} words of body text; aim for about 900, and count before you answer.
- Title at most ${TITLE_MAX_CHARS} characters, and it must contain the primary keyword.
- seo_description between ${SEO_DESCRIPTION_MIN} and ${SEO_DESCRIPTION_MAX} characters.
- At least three h2 sections, at least one bulleted list, at least two internal links.
- Only fact-sheet claims, used correctly. An unverified number is a rejection.
- Use every fact marked REQUIRED, and draw the rest of the post from the other facts in the sheet.
- Each h2 must add at least one fact the post has not used yet. A sentence that only
  restates an earlier sentence is a defect, and padding with adjectives instead of
  facts is the fastest way to be rejected.
- Headings are questions or concrete operations a merchant would recognise, not labels.
- End on the last concrete point; no summary paragraph that repeats the post.
- Every path in internal_links must be anchored in the body as a markDef with
  _type "link" and that href, and no two links may point at the same page.
- Do not link to any page outside internal_links.
- Delete any sentence that adds no field, limit, step or trade-off; a section that
  restates the one above it is filler.
- Where a fact names an exact set or scope, write the set out instead of an
  umbrella term like "supported actors".
- Figure rows must come from a fact sheet entry: label and value, nothing invented.
- Never use any of these phrases: ${BANNED_PHRASES.join(", ")}.`,
    `## App\n${app}`,
    `## Topic\n${JSON.stringify(
      {
        id: topic.id,
        intent: topic.intent,
        title_hint: topic.titleHint,
        primary_keyword: topic.primaryKeyword,
        secondary_keywords: topic.secondaryKeywords,
        category: topic.category,
        internal_links: topic.internalLinks,
        figure_template: topic.figure,
        notes: topic.notes ?? "",
      },
      null,
      2,
    )}`,
    `## Fact sheet — the only things you may assert\nFacts marked REQUIRED must appear in used_facts.\n\n${factsBlock(facts, topic.factsRequired)}`,
  ];
  if (previous && feedback) {
    sections.push(
      `## Previous attempt (rejected)\n${JSON.stringify(previous, null, 2)}`,
      `## Why it was rejected\n${feedback}\nRewrite it. Fix every point above and keep what was already true.`,
    );
  }
  sections.push(`## Output contract
Reply with one JSON object, no prose and no code fence, with exactly these keys:
{
  "title": "string, at most ${TITLE_MAX_CHARS} chars",
  "slug": "kebab-case",
  "excerpt": "one sentence, at most 160 chars",
  "seo_title": "string, at most ${TITLE_MAX_CHARS} chars",
  "seo_description": "string, ${SEO_DESCRIPTION_MIN}-${SEO_DESCRIPTION_MAX} chars",
  "used_facts": ["XX-01"],
  "internal_links": ["/apps/..."],
  "content": [ { "_type": "block", "_key": "b1", "style": "normal", "markDefs": [], "children": [ { "_type": "span", "_key": "s1", "text": "..." } ] } ],
  "figure": { "template": "og-card", "eyebrow": "...", "headline": "...", "rows": [ { "label": "...", "value": "..." } ] }
}`);
  return `${sections.join("\n\n")}\n\nFigure template must be one of: ${FIGURE_TEMPLATES.join(", ")}.`;
}

export async function writeDraft(input: WriteInput): Promise<Draft> {
  const prompt = buildWriterPrompt(input);
  const raw = await askAgent("codex", prompt, { model: input.model });
  return parseDraft(extractJson<unknown>(raw));
}
