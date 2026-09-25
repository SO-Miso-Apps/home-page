/** Per-post report: the audit trail the owner reads before approving. */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { critiqueSummary } from "./critique.ts";
import type { Critique, Draft, GateFailure } from "./types.ts";
import type { Topic } from "./topics.ts";

export type ReportInput = {
  outDir: string;
  app: string;
  topic: Topic;
  draft: Draft;
  critique: Critique;
  gateFailures: GateFailure[];
  attempts: number;
  figureFile?: string;
  mediaId?: string;
  entryId?: string;
  dryRun: boolean;
  flagged?: string;
};

export function writeReport(input: ReportInput): string {
  const { draft, critique } = input;
  const body = [
    `# ${draft.title}`,
    "",
    `- app: ${input.app}`,
    `- topic: ${input.topic.id} (${input.topic.intent})`,
    `- slug: ${draft.slug}`,
    `- primary keyword: ${input.topic.primaryKeyword}`,
    `- category: ${input.topic.category}`,
    `- attempts: ${input.attempts}`,
    `- dry run: ${input.dryRun}`,
    input.entryId ? `- entry: ${input.entryId}` : "",
    input.mediaId ? `- media: ${input.mediaId}` : "",
    input.figureFile ? `- figure: ${input.figureFile}` : "",
    "",
    input.flagged ? `> **Needs a closer look:** ${input.flagged}` : "",
    "## Critic",
    "",
    `- ${critiqueSummary(critique)}`,
    `- verdict: ${critique.verdict}`,
    critique.rewrite_notes ? `- notes: ${critique.rewrite_notes}` : "",
    critique.violations.length
      ? `\n### Violations\n${critique.violations.map((v) => `- ${v.kind}: "${v.quote}" — ${v.why}`).join("\n")}`
      : "",
    "",
    "## Gates",
    "",
    input.gateFailures.length
      ? input.gateFailures.map((failure) => `- ${failure.code}: ${failure.detail}`).join("\n")
      : "- all gates passed",
    "",
    "## Facts used",
    "",
    draft.used_facts.map((id) => `- ${id}`).join("\n"),
    "",
    "## SEO",
    "",
    `- title: ${draft.seo_title}`,
    `- description (${draft.seo_description.length} chars): ${draft.seo_description}`,
    "",
    "## Excerpt",
    "",
    draft.excerpt,
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  mkdirSync(input.outDir, { recursive: true });
  const file = join(input.outDir, "report.md");
  writeFileSync(file, body);
  return file;
}
