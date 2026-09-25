/** The critic: an independent model scores the draft against a rubric. */

import { readFileSync } from "node:fs";
import { askAgent } from "./cli-agent.ts";
import type { Fact } from "./facts.ts";
import { extractJson } from "./json.ts";
import { parseCritique } from "./draft.ts";
import type { Topic } from "./topics.ts";
import type { Critique, Draft } from "./types.ts";

export function loadCriticPrompt(): string {
  return readFileSync(new URL("../prompts/critic.md", import.meta.url), "utf8");
}

export function buildCriticPrompt(draft: Draft, facts: Fact[], topic: Topic): string {
  return [
    loadCriticPrompt(),
    `## Topic\n${JSON.stringify({ id: topic.id, intent: topic.intent, keyword: topic.primaryKeyword }, null, 2)}`,
    `## Fact sheet (the only permitted claims)\n${facts.map((fact) => `### ${fact.id} — ${fact.claim}\nSource: ${fact.source}`).join("\n\n")}`,
    `## Draft to score\n${JSON.stringify(draft, null, 2)}`,
    "Reply with the JSON object only.",
  ].join("\n\n");
}

export async function critique(draft: Draft, facts: Fact[], topic: Topic, model?: string): Promise<Critique> {
  const raw = await askAgent("opencode", buildCriticPrompt(draft, facts, topic), { model, timeoutMs: 240_000 });
  return parseCritique(extractJson<unknown>(raw));
}

export function totalScore(result: Critique): number {
  const { factuality, specificity, originality, seo, usefulness } = result.scores;
  return factuality + specificity + originality + seo + usefulness;
}

export function critiquePasses(result: Critique): boolean {
  return result.verdict === "pass" && result.scores.factuality >= 4 && totalScore(result) >= 20 && result.violations.length === 0;
}

/**
 * The owner is the last gate, so a draft the critic merely dislikes (filler it
 * can quote, a weak heading) is still worth reviewing — but a draft with a
 * fabricated claim or a banned phrase is never handed over.
 */
const BLOCKING_VIOLATIONS = ["unsupported_claim", "banned_phrase"];

export function critiqueReviewable(result: Critique): boolean {
  return (
    result.scores.factuality >= 4 &&
    totalScore(result) >= 19 &&
    !result.violations.some((violation) => BLOCKING_VIOLATIONS.includes(violation.kind))
  );
}

export function critiqueSummary(result: Critique): string {
  const { scores } = result;
  return `factuality ${scores.factuality}/5, specificity ${scores.specificity}/5, originality ${scores.originality}/5, seo ${scores.seo}/5, usefulness ${scores.usefulness}/5`;
}
