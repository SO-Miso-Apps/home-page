#!/usr/bin/env node
/**
 * Daily blog run: pick a topic, write it with codex, gate it, score it with
 * opencode, render a figure, upload it, and leave a draft in EmDash waiting for
 * the owner's approval.
 *
 *   node tools/blog/publish.ts --app both
 *   node tools/blog/publish.ts --app auto-tags --dry-run
 *   node tools/blog/publish.ts --app history-revert --slug hr-compare-two-versions
 */

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadFacts, type Fact } from "./lib/facts.ts";
import { loadTopics, type Topic } from "./lib/topics.ts";
import { pickTopic } from "./lib/pick.ts";
import { runGates } from "./lib/gates.ts";
import { writeDraft, loadStyleGuide } from "./lib/write.ts";
import { critique, critiquePasses, critiqueSummary } from "./lib/critique.ts";
import { renderFigure } from "./lib/figure.ts";
import { buildDraftBody, createDraft, deleteMedia, deletePost, healthCheck, listPublishedSlugs, uploadMedia, api } from "./lib/emdash.ts";
import { readLedger, recordRun } from "./lib/ledger.ts";
import { writeReport } from "./lib/report.ts";
import { notify } from "./lib/notify.ts";
import type { AppId, Critique, Draft, GateFailure } from "./lib/types.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const APPS: AppId[] = ["history-revert", "auto-tags"];

/** Compare topics cite facts from the other app too, so both sheets are loaded. */
const siblingApp = (app: AppId): AppId => (app === "history-revert" ? "auto-tags" : "history-revert");

type Args = { app: AppId | "both"; dryRun: boolean; slug?: string; maxAttempts: number };

function parseArgs(argv: string[]): Args {
  const args: Args = { app: "both", dryRun: false, maxAttempts: 3 };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--app") {
      const value = argv[++i];
      if (value !== "both" && !APPS.includes(value as AppId)) throw new Error(`--app must be one of ${APPS.join(", ")}, both`);
      args.app = value as AppId | "both";
    } else if (flag === "--dry-run") args.dryRun = true;
    else if (flag === "--slug") args.slug = argv[++i];
    else if (flag === "--max-attempts") args.maxAttempts = Number(argv[++i]);
    else throw new Error(`unknown flag ${flag}`);
  }
  return args;
}

function loadEnv(): void {
  const file = join(HERE, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (see tools/blog/.env.example)`);
  return value;
}

type Config = { site: string; token: string; writerModel?: string; criticModel?: string; maxAttempts: number };

function resolveConfig(args: Args): Config {
  loadEnv();
  const dryRun = args.dryRun;
  const site = dryRun ? (process.env.EMDASH_DEV_URL ?? "http://localhost:4399") : requireEnv("EMDASH_SITE_URL");
  const token = dryRun ? requireEnv("EMDASH_DEV_TOKEN") : requireEnv("EMDASH_API_TOKEN");
  return {
    site,
    token,
    writerModel: process.env.BLOG_WRITER_MODEL || undefined,
    criticModel: process.env.BLOG_CRITIC_MODEL || undefined,
    maxAttempts: args.maxAttempts || Number(process.env.BLOG_MAX_ATTEMPTS ?? 3),
  };
}

type Attempt = { draft: Draft; attack: Critique; attempts: number; failures: GateFailure[] };

function factsFor(topic: Topic, facts: Fact[]): Fact[] {
  const byId = new Map(facts.map((fact) => [fact.id, fact]));
  return topic.factsRequired.map((id) => {
    const fact = byId.get(id);
    if (!fact) throw new Error(`topic ${topic.id} requires unknown fact ${id}`);
    return fact;
  });
}

async function writeAttempt(input: {
  app: AppId;
  topic: Topic;
  facts: Fact[];
  model?: string;
  feedback?: string;
  previous?: Draft;
}): Promise<Draft> {
  return writeDraft({
    facts: input.facts,
    topic: input.topic,
    app: input.app,
    styleGuide: loadStyleGuide(),
    feedback: input.feedback,
    previous: input.previous,
    model: input.model,
  });
}

/** Write and score until both the gates and the critic accept, or give up. */
async function produce(input: {
  app: AppId;
  topic: Topic;
  facts: Fact[];
  existingSlugs: string[];
  siteApps: string[];
  config: Config;
}): Promise<Attempt> {
  const { app, topic, facts, existingSlugs, siteApps, config } = input;
  let feedback: string | undefined;
  let previous: Draft | undefined;
  let failures: GateFailure[] = [];
  let lastCritique: Critique | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    console.log(`[${app}] attempt ${attempt}/${config.maxAttempts}: ${topic.id}`);
    try {
      const draft = await writeAttempt({ app, topic, facts, model: config.writerModel, feedback, previous });
      previous = draft;

      const gates = runGates({ draft, facts, topic, existingSlugs, apps: siteApps });
      failures = gates.failures;
      if (!gates.ok) {
        console.log(`[${app}] gates failed: ${failures.map((failure) => failure.code).join(", ")}`);
        feedback = `Deterministic gates rejected the draft:\n${failures.map((failure) => `- ${failure.code}: ${failure.detail}`).join("\n")}`;
        continue;
      }

      const scored = await critique(draft, facts, topic, config.criticModel);
      lastCritique = scored;
      console.log(`[${app}] critic: ${critiqueSummary(scored)} verdict=${scored.verdict}`);
      if (critiquePasses(scored)) return { draft, attack: scored, attempts: attempt, failures: [] };

      feedback = [
        `The critic rejected the draft: ${critiqueSummary(scored)}.`,
        scored.violations.map((violation) => `- ${violation.kind}: "${violation.quote}" — ${violation.why}`).join("\n"),
        scored.rewrite_notes,
      ]
        .filter(Boolean)
        .join("\n");
      for (const violation of scored.violations) {
        console.log(`[${app}]   ${violation.kind}: ${violation.quote.slice(0, 120)} — ${violation.why}`);
      }
      if (scored.rewrite_notes) console.log(`[${app}]   rewrite: ${scored.rewrite_notes}`);
    } catch (error) {
      // A writer or critic reply the pipeline cannot use is a failed attempt,
      // not a failed run: tell the writer what was wrong and try again.
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${app}] attempt ${attempt} unusable: ${error instanceof Error ? error.stack : message}`);
      feedback = `The previous reply could not be used: ${message}. Reply with the JSON object exactly as specified, and nothing else.`;
    }
  }

  const detail = lastCritique
    ? `critic: ${critiqueSummary(lastCritique)}; ${lastCritique.rewrite_notes}`
    : `gates: ${failures.map((failure) => `${failure.code}: ${failure.detail}`).join("; ")}`;
  throw new Error(`[${app}] no publishable draft after ${config.maxAttempts} attempts — ${detail}`);
}

async function runApp(app: AppId, args: Args, config: Config): Promise<"drafted" | "skipped" | "failed"> {
  const topics = loadTopics(app);
  const allFacts = [...loadFacts(siblingApp(app)), ...loadFacts(app)];
  const ledgerPath = join(HERE, "state", "published.json");
  const existingSlugs = await listPublishedSlugs(config.site, config.token);
  const siteApps = await listPublishedSlugs(config.site, config.token, "apps");

  const topic = args.slug ? topics.find((entry) => entry.id === args.slug) : pickTopic(topics, readLedger(ledgerPath), existingSlugs);
  if (!topic) {
    console.log(`[${app}] every topic is used; add new entries to tools/blog/topics/${app}.json`);
    return "skipped";
  }

  const facts = factsFor(topic, allFacts);
  const attempt = await produce({ app, topic, facts, existingSlugs, siteApps, config });

  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = join(HERE, "out", `${stamp}-${app}-${attempt.draft.slug}`);
  mkdirSync(outDir, { recursive: true });
  const figureFile = join(outDir, "figure.png");
  await renderFigure({ ...attempt.draft.figure, note: attempt.draft.figure.note ?? "misoapps.com" }, figureFile);

  const mediaId = await uploadMedia(config.site, config.token, figureFile);
  const created = await createDraft(config.site, config.token, buildDraftBody({ draft: attempt.draft, topic, mediaId }));
  console.log(`[${app}] draft ${created.id} → ${config.site}/blog/${created.slug}`);

  if (args.dryRun) {
    await api(config.site, config.token, `/_emdash/api/content/posts/${created.id}/publish`, { method: "POST", body: {} });
    const page = await fetch(new URL(`/blog/${created.slug}`, config.site));
    const html = await page.text();
    const checks = {
      status: page.status,
      title: html.includes(attempt.draft.seo_title),
      figure: html.includes("_emdash/api/media/file/"),
      og: html.includes("og:image"),
    };
    console.log(`[${app}] dry-run page check ${JSON.stringify(checks)}`);
    await deletePost(config.site, config.token, created.id);
    await deleteMedia(config.site, config.token, mediaId);
  }

  recordRun(ledgerPath, {
    topicId: topic.id,
    app,
    date: stamp,
    entryId: created.id,
    slug: created.slug,
    mediaId,
    scores: attempt.attack.scores,
    site: config.site,
  });

  const report = writeReport({
    outDir,
    app,
    topic,
    draft: attempt.draft,
    critique: attempt.attack,
    gateFailures: attempt.failures,
    attempts: attempt.attempts,
    figureFile,
    mediaId,
    entryId: created.id,
    dryRun: args.dryRun,
  });
  console.log(`[${app}] report: ${report}`);
  return "drafted";
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config = resolveConfig(args);
  await healthCheck(config.site, config.token);

  const targets: AppId[] = args.app === "both" ? APPS : [args.app];
  let failures = 0;
  const drafted: string[] = [];

  for (const app of targets) {
    try {
      const result = await runApp(app, args, config);
      if (result === "drafted") drafted.push(app);
    } catch (error) {
      failures++;
      console.error(String(error instanceof Error ? error.message : error));
    }
  }

  if (drafted.length > 0) {
    const admin = new URL("/_emdash/admin", config.site).toString();
    notify(
      "Blog drafts ready",
      `${drafted.length} draft(s) awaiting approval: ${drafted.join(", ")} — approve at ${admin}`,
    );
  }
  if (failures > 0) {
    notify("Blog run failed", `${failures} app(s) produced no draft — see tools/blog/out`);
    process.exitCode = 1;
  }
}

await main();
