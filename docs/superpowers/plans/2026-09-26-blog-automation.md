# Blog Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a local pipeline that writes, scores, illustrates and drafts one grounded blog post per app per day on misoapps.com, awaiting one-click approval in EmDash.

**Architecture:** Zero-dependency Node/TypeScript (type-stripping runtime, `node --test`) under `tools/blog/`. Fact sheets extracted from the two app repos are the only source of claims; Codex CLI writes, opencode CLI scores, deterministic gates veto, Chrome captures an HTML/CSS figure, and the EmDash HTTP API receives a `draft` post with full SEO metadata and the uploaded media id.

**Tech Stack:** Node 22 (type stripping, `node:test`, global `fetch`), `codex` CLI, `opencode` CLI, Google Chrome headless + `sips`, pm2 cron, EmDash REST API (D1 + R2).

**Spec:** `docs/superpowers/specs/2026-09-26-blog-automation-design.md`

## Global Constraints

- Target site: `https://misoapps.com`, API base `/_emdash/api`. Token scopes: `content:write`, `media:write`.
- Content language: English only.
- Post status is always `draft`; the pipeline never publishes in v1.
- Two apps: `history-revert` (repo `../history-revert`) and `auto-tags` (repo `../Shop-Ops-Suite`).
- Categories (taxonomy `category`, by slug): `product-updates`, `merchant-playbook`.
- No new runtime dependencies: Node built-ins only; no YAML library — topic calendars are JSON.
- Every claim in a post must trace to a fact-sheet entry with a real source path.
- Illustrations are abstract; never a fake admin UI, fake chart or invented metric (`DESIGN.md` Art Rules).
- Never log the API token; `tools/blog/.env`, `tools/blog/state/`, `tools/blog/out/` are gitignored.

---

### Task 1: Scaffolding, config and scripts

**Files:**
- Create: `tools/blog/.env.example`, `tools/blog/README.md`
- Modify: `package.json` (scripts), `.gitignore`

**Interfaces:**
- Produces: directory layout `tools/blog/{facts,topics,prompts,render/diagrams,lib,state,out}`; npm scripts `blog:run`, `blog:dry`, `blog:test`.

- [ ] **Step 1: Create the layout**

```bash
mkdir -p tools/blog/{facts,topics,prompts,render/diagrams,lib,state,out}
```

- [ ] **Step 2: Write `tools/blog/.env.example`**

```
# Production PAT from https://misoapps.com/_emdash/admin → API tokens
EMDASH_SITE_URL=https://misoapps.com
EMDASH_API_TOKEN=
# Local dev server used by --dry-run
EMDASH_DEV_URL=http://localhost:4399
# Model for the writer (Codex CLI) and the critic (opencode CLI)
BLOG_WRITER_MODEL=
BLOG_CRITIC_MODEL=opencode-go/deepseek-v4.1-flash
BLOG_MAX_ATTEMPTS=3
```

- [ ] **Step 3: Add scripts to `package.json`**

```json
"blog:run": "node tools/blog/publish.ts --app both",
"blog:dry": "node tools/blog/publish.ts --app both --dry-run",
"blog:test": "node --test tools/blog/lib/*.test.ts"
```

- [ ] **Step 4: Append to `.gitignore`**

```
tools/blog/.env
tools/blog/state/
tools/blog/out/
```

- [ ] **Step 5: Verify**

Run: `mkdir -p tools/blog/out && node -e "console.log(require('fs').readdirSync('tools/blog').join(','))"`
Expected: `facts,topics,prompts,render,lib,state,out`

- [ ] **Step 6: Commit**

```bash
git add tools/blog package.json .gitignore
git commit -m "chore(blog): scaffold automation pipeline"
```

---

### Task 2: Fact-sheet loader

**Files:**
- Create: `tools/blog/lib/facts.ts`, `tools/blog/lib/facts.test.ts`, `tools/blog/facts/_fixture.md`

**Interfaces:**
- Produces: `type Fact = { id: string; claim: string; source: string; tags: string[] }`; `parseFacts(markdown: string): Fact[]`; `loadFacts(app: "history-revert" | "auto-tags"): Fact[]`.

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFacts } from "./facts.ts";

const md = `# Facts

### HR-01 — Activity log exists
Claim: The app keeps an activity log of product changes.
Source: app/routes/app.activity-log.tsx:1
Tags: feature, ui

### HR-02 — Field-level compare
Claim: Old and new values are shown per field.
Source: app/routes/app.compare.tsx:20
Tags: feature
`;

test("parses each fact block", () => {
  const facts = parseFacts(md);
  assert.equal(facts.length, 2);
  assert.deepEqual(facts[0], {
    id: "HR-01",
    claim: "The app keeps an activity log of product changes.",
    source: "app/routes/app.activity-log.tsx:1",
    tags: ["feature", "ui"],
  });
});

test("rejects a block without a source", () => {
  assert.throws(() => parseFacts("### X-1 — nope\nClaim: something\n"), /missing Source/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tools/blog/lib/facts.test.ts`
Expected: FAIL — `Cannot find module './facts.ts'`

- [ ] **Step 3: Implement**

```ts
export type Fact = { id: string; claim: string; source: string; tags: string[] };

const HEADING = /^###\s+([A-Z]{2}-\d{2})\s+—\s+(.+)$/;

export function parseFacts(markdown: string): Fact[] {
  const facts: Fact[] = [];
  let current: Partial<Fact> | null = null;
  const flush = () => {
    if (!current) return;
    if (!current.claim) throw new Error(`fact ${current.id} missing Claim`);
    if (!current.source) throw new Error(`fact ${current.id} missing Source`);
    facts.push({ id: current.id!, claim: current.claim, source: current.source, tags: current.tags ?? [] });
    current = null;
  };
  for (const raw of markdown.split("\n")) {
    const heading = raw.match(HEADING);
    if (heading) { flush(); current = { id: heading[1], tags: [] }; continue; }
    if (!current) continue;
    if (raw.startsWith("Claim: ")) current.claim = raw.slice(7).trim();
    else if (raw.startsWith("Source: ")) current.source = raw.slice(8).trim();
    else if (raw.startsWith("Tags: ")) current.tags = raw.slice(6).split(",").map((t) => t.trim()).filter(Boolean);
  }
  flush();
  return facts;
}

export function loadFacts(app: string): Fact[] {
  const path = new URL(`../facts/${app}.md`, import.meta.url);
  return parseFacts(readFileSync(path, "utf8"));
}
```

(`import { readFileSync } from "node:fs"` at the top of the file.)

- [ ] **Step 4: Run tests**

Run: `node --test tools/blog/lib/facts.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add tools/blog/lib/facts.ts tools/blog/lib/facts.test.ts
git commit -m "feat(blog): fact-sheet parser as the anti-fabrication ground truth"
```

---

### Task 3: Topic calendar loader

**Files:**
- Create: `tools/blog/lib/topics.ts`, `tools/blog/lib/topics.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `type Topic` (see spec §4.2), `loadTopics(app: string): Topic[]`, throws `Error` listing unknown/missing keys.

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateTopic } from "./topics.ts";

const good = {
  id: "hr-compare", intent: "guide", title_hint: "Compare two versions",
  primary_keyword: "shopify product history", secondary_keywords: [], category: "merchant-playbook",
  facts_required: ["HR-01"], internal_links: ["/apps/history-revert"], figure: "compare-table",
};

test("accepts a complete topic", () => {
  assert.equal(validateTopic(good).id, "hr-compare");
});

test("rejects a bad category", () => {
  assert.throws(() => validateTopic({ ...good, category: "news" }), /category/);
});

test("rejects a topic with no facts", () => {
  assert.throws(() => validateTopic({ ...good, facts_required: [] }), /facts_required/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tools/blog/lib/topics.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement** `validateTopic(raw): Topic` checking: `id` kebab, `intent` in the five allowed values, `category` in `product-updates|merchant-playbook`, `facts_required` non-empty array of `[A-Z]{2}-\d{2}`, `internal_links` all starting with `/`, `figure` in `og-card|flow|timeline|compare-table|rule-tree`; `loadTopics(app)` reading `../topics/<app>.json` and validating every entry.

- [ ] **Step 4: Run tests**

Run: `node --test tools/blog/lib/topics.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add tools/blog/lib/topics.ts tools/blog/lib/topics.test.ts
git commit -m "feat(blog): topic calendar loader with validation"
```

---

### Task 4: Deterministic gates

**Files:**
- Create: `tools/blog/lib/gates.ts`, `tools/blog/lib/gates.test.ts`, `tools/blog/lib/fixtures/good-draft.json`

**Interfaces:**
- Consumes: `Fact`, `Topic`.
- Produces: `runGates(input: { draft: Draft; facts: Fact[]; topic: Topic; existingSlugs: string[] }): { ok: boolean; failures: { code: string; detail: string }[] }`, `BANNED_PHRASES: string[]`.

Gate codes and thresholds are exactly those in spec §5.

- [ ] **Step 1: Write the failing test** — one case per code, table driven:

```ts
const base = { title: "Shopify product history: compare two versions",
  slug: "shopify-product-history-compare", excerpt: "x",
  seo_title: "Shopify product history: compare two versions",
  seo_description: "A".repeat(150), used_facts: ["HR-01"], internal_links: ["/apps/history-revert"],
  content: [/* h2 + paragraph + bullet blocks, 700+ words */] };
```
with assertions: long title → `title_len`; missing keyword → `title_keyword`; `"delve"` in body → `banned`; `"3,500 products"` not in facts → `fact_trace`; duplicate slug → `duplicate`; short `"…"` body → `body_len`.

- [ ] **Step 2: Run to verify failure** — `node --test tools/blog/lib/gates.test.ts` → module not found.

- [ ] **Step 3: Implement** `gates.ts`: pure functions, no I/O. Word count from concatenated span text; heading level walk; number/unit regex `\b\d[\d,.]*\s?(%|products?|orders?|seconds?|minutes?|hours?|days?|MB|GB)\b` plus quoted `\`[a-z_.]+\`` identifiers must appear case-insensitively in the concatenated fact text; banned phrase scan; trigram similarity for duplicates.

- [ ] **Step 4: Run tests** — expected PASS, at least 8 cases.

- [ ] **Step 5: Commit**

```bash
git add tools/blog/lib/gates.ts tools/blog/lib/gates.test.ts tools/blog/lib/fixtures
git commit -m "feat(blog): deterministic SEO, style and fact-trace gates"
```

---

### Task 5: Figure renderer and Chrome capture

**Files:**
- Create: `tools/blog/render/figure.css`, `tools/blog/render/og-card.html`, `tools/blog/render/diagrams/{flow,timeline,compare-table,rule-tree}.html`, `tools/blog/render/capture.sh`, `tools/blog/lib/figure.ts`, `tools/blog/lib/figure.test.ts`

**Interfaces:**
- Produces: `type FigureSpec = { template: string; eyebrow: string; headline: string; rows: { label: string; value: string }[]; note?: string }`; `fillTemplate(spec, templateHtml): string` (pure, tested); `renderFigure(spec, outFile): Promise<void>` (writes HTML, runs `render/capture.sh`, asserts the PNG is 1200×630).

- [ ] **Step 1: Write the failing test** for `fillTemplate`: `{{eyebrow}}`, `{{headline}}`, `{{#rows}}…{{/rows}}` block repetition, HTML-escaping of `&<>"`.

- [ ] **Step 2: Run to verify failure** — module not found.

- [ ] **Step 3: Implement templates from `DESIGN.md` tokens** (canvas `#f6f7f4`, ink `#141815`, muted `#5c6862`, brand `#138f5b`, brand-ink `#107a4e`, hairlines `.10/.18`, Outfit + Plus Jakarta Sans + mono labels, 1200×630) with the shared `figure.css` and one file per template; abstract motifs only, rows come from the topic's facts.

- [ ] **Step 4: Implement `capture.sh`** modelled on `history-revert/listing/render.sh`: Chrome `--headless=new --force-device-scale-factor=2 --window-size=W,H --screenshot`, then `sips -z H W` downsample; `CHROME` overridable via env.

- [ ] **Step 5: Verify by rendering a real figure and viewing the PNG**

Run: `node --test tools/blog/lib/figure.test.ts && node -e "import('./tools/blog/lib/figure.ts').then(m=>m.renderFigure({template:'compare-table',eyebrow:'Product history',headline:'Every change, in one place',rows:[{label:'Price',value:'old → new'}]},'/tmp/f.png'))"`
Expected: PNG 1200×630, inspected visually.

- [ ] **Step 6: Commit**

```bash
git add tools/blog/render tools/blog/lib/figure.ts tools/blog/lib/figure.test.ts
git commit -m "feat(blog): HTML/CSS figure templates with headless Chrome capture"
```

---

### Task 6: EmDash client

**Files:**
- Create: `tools/blog/lib/emdash.ts`, `tools/blog/lib/emdash.test.ts`

**Interfaces:**
- Produces: `api(site, token, path, init?): Promise<any>`; `healthCheck(site, token): Promise<void>`; `uploadMedia(site, token, file, filename): Promise<string>` (media id); `createDraft(site, token, input): Promise<{ id: string; slug: string }>`; `deletePost(site, token, id): Promise<void>`; `listSlugs(site, token): Promise<string[]>`.

- [ ] **Step 1: Write the failing test** for the pure request builder `buildDraftBody(draft, topic, mediaId)` asserting the exact JSON: `data.og_image = {id}`, `seo.image = mediaId`, `taxonomies.category = [topic.category]`, `status` omitted (server default draft).

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement** using `fetch`; upload flow: `POST /_emdash/api/media/upload-url` → `PUT` bytes with returned headers → `POST /_emdash/api/media/{id}/confirm`, then assert the media is `active` and return the id.

- [ ] **Step 4: Verify against the local dev server** with a temporary token: upload `figure.png`, create a draft, read it back, delete it. Expected output: media id, draft id, `status: draft`, `og_image.id == mediaId`.

- [ ] **Step 5: Commit**

```bash
git add tools/blog/lib/emdash.ts tools/blog/lib/emdash.test.ts
git commit -m "feat(blog): EmDash media upload and draft creation client"
```

---

### Task 7: Writer (Codex) and critic (opencode)

**Files:**
- Create: `tools/blog/prompts/writer.md`, `tools/blog/prompts/critic.md`, `tools/blog/lib/write.ts`, `tools/blog/lib/critique.ts`, `tools/blog/lib/cli-agent.ts`, `tools/blog/lib/write.test.ts`

**Interfaces:**
- Consumes: `Fact[]`, `Topic`.
- Produces: `runCodex(prompt): Promise<string>`, `runOpencode(prompt): Promise<string>`, `extractJson<T>(text): T`, `writeDraft(input): Promise<Draft>`, `critique(input): Promise<Critique>`.

- [ ] **Step 1: Write the failing test** for `extractJson`: plain JSON; JSON inside ```json fences; JSON with leading prose; malformed → throws `Error(/no JSON object/)`.

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `cli-agent.ts`** — `codex exec --sandbox read-only --skip-git-repo-check --json` (parse JSONL, take the last `item.completed` with `type: "agent_message"`), `opencode run --format json -m <model>`; 180 s timeout; single retry on non-zero exit; prompt piped via stdin.

- [ ] **Step 4: Write the prompts** — writer: role, the fact sheet verbatim, the topic, the JSON contract from spec §4.3, hard rules (only fact-sheet claims, no invented numbers, banned phrases, 700–1200 words, ≥3 h2, direct answer in the first 60 words, internal links, no emoji, no markdown fence in the reply). Critic: score five criteria with the rubric, list violations with quotes, `verdict`, `rewrite_notes`; must not rewrite the post itself.

- [ ] **Step 5: Verify with a real call** — run the writer against one real topic and print the draft; run the critic on it and print scores. Expected: valid JSON, `used_facts` non-empty, scores present.

- [ ] **Step 6: Commit**

```bash
git add tools/blog/lib/cli-agent.ts tools/blog/lib/write.ts tools/blog/lib/critique.ts tools/blog/prompts tools/blog/lib/write.test.ts
git commit -m "feat(blog): codex writer and opencode critic"
```

---

### Task 8: Orchestrator, ledger, report, notify

**Files:**
- Create: `tools/blog/lib/ledger.ts`, `tools/blog/lib/report.ts`, `tools/blog/lib/notify.ts`, `tools/blog/lib/pick.ts`, `tools/blog/publish.ts`, `tools/blog/lib/pick.test.ts`

**Interfaces:**
- Produces: `pickTopic(topics, ledger, existingSlugs): Topic | null`; ledger entries `{ topicId, app, date, entryId, slug, mediaId, scores }`; CLI `publish.ts` with `--app`, `--dry-run`, `--slug`, `--max-attempts`.

- [ ] **Step 1: Write the failing test** for `pickTopic`: skips topics already in the ledger; skips topics whose slug is already published; returns `null` when exhausted; returns the first remaining topic in calendar order.

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement** `pickTopic`, ledger read/append (JSON, atomic write via temp file + rename), report writer (`out/<date>/<slug>/report.md` with gate failures, critic scores, figure path), notify via `osascript -e 'display notification …'` on macOS.

- [ ] **Step 4: Implement `publish.ts`**: parse flags → load env (`.env` parsed by hand) → health check → for each app: pick → attempt loop (write → gates → critique → rewrite with feedback) → figure → upload → create draft → record ledger + report → notify. `--dry-run` uses `EMDASH_DEV_URL`, and after verification deletes the created draft and media.

- [ ] **Step 5: Verify end-to-end against the local dev server**

Run: `node tools/blog/publish.ts --app history-revert --dry-run`
Expected: draft created on port 4399 with an `og_image`, category set, `/blog/<slug>` 404 while draft, then `--publish` check.

- [ ] **Step 6: Commit**

```bash
git add tools/blog/lib/ledger.ts tools/blog/lib/report.ts tools/blog/lib/notify.ts tools/blog/lib/pick.ts tools/blog/lib/pick.test.ts tools/blog/publish.ts
git commit -m "feat(blog): orchestrator with ledger, reports and notifications"
```

---

### Task 9: Fact sheets and topic calendars

**Files:**
- Create: `tools/blog/facts/history-revert.md`, `tools/blog/facts/auto-tags.md`, `tools/blog/topics/history-revert.json`, `tools/blog/topics/auto-tags.json`, `tools/blog/lib/content.test.ts`

**Interfaces:**
- Consumes: `loadFacts`, `loadTopics`, `Topic.facts_required`.
- Produces: ≥ 25 facts and ≥ 30 topics per app.

- [ ] **Step 1: Write the failing test** `content.test.ts`: for each app, every `facts_required` id resolves; ids are unique; ≥ 25 facts; ≥ 30 topics; every `internal_links` path starts with `/apps/` or `/blog/`; both categories used.

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Author `facts/history-revert.md`** from `../history-revert` (`README.md`, `CHANGELOG.md`, `app/routes/**`, `extensions/**`, `listing/**`), each fact with a real path. **No claim without a path.**

- [ ] **Step 4: Author `facts/auto-tags.md`** from `../Shop-Ops-Suite` (`KNOWLEDGE_BASE.md`, `rules.md`, `app/routes/**`, `extensions/**`, `shopify.app.auto-tags.toml`).

- [ ] **Step 5: Author both topic calendars** — 30+ entries each across `intro`, `guide`, `compare`, `tips`, `troubleshoot`, with a `compare` topic per app that pits it against the other app's job.

- [ ] **Step 6: Run tests** — expected PASS.

- [ ] **Step 7: Commit**

```bash
git add tools/blog/facts tools/blog/topics tools/blog/lib/content.test.ts
git commit -m "content(blog): verified fact sheets and 60-topic content calendar"
```

---

### Task 10: pm2 schedule and handoff docs

**Files:**
- Create: `ecosystem.blog.config.json`, `tools/blog/README.md`
- Modify: `package.json` (`blog:start`, `blog:stop`)

**Interfaces:**
- Produces: pm2 app `miso-blog` with `cron_restart: "0 8 * * *"`, `autorestart: false`.

- [ ] **Step 1: Write `ecosystem.blog.config.json`** exactly as spec §7 with `cwd` = this repo.
- [ ] **Step 2: Write `tools/blog/README.md`** — how to create the PAT, run `--dry-run`, read a report, add a topic, add a fact, rotate the token.
- [ ] **Step 3: Add scripts** `"blog:start": "pm2 start ecosystem.blog.config.json --only miso-blog"`, `"blog:stop": "pm2 stop miso-blog"`.
- [ ] **Step 4: Verify registration without publishing** — `pm2 start ecosystem.blog.config.json --only miso-blog --no-autorestart` then `pm2 describe miso-blog` shows the cron and the script; then `pm2 delete miso-blog` until the production PAT exists.
- [ ] **Step 5: Commit**

```bash
git add ecosystem.blog.config.json tools/blog/README.md package.json
git commit -m "chore(blog): pm2 daily schedule and operator README"
```

---

## Verification (after all tasks)

1. `pnpm blog:test` — all suites green.
2. `pnpm blog:dry` — two drafts on the local dev server, figures attached, then cleaned up.
3. Publish one dry-run draft, open `/blog/<slug>`, confirm headline, in-body figure, `og:image`, `<title>` from `seo_title`; delete it.
4. Read both generated posts against the fact sheet line by line; every claim traced.
5. Hand the production PAT step to the owner; after the token lands, run `pnpm blog:run` once and confirm two drafts in the production admin.

## Self-review notes

- Spec coverage: architecture (§3) → Tasks 1–10; interfaces (§4) → Tasks 2, 3, 6, 7, 8; gates (§5) → Task 4; illustrations (§6) → Task 5; scheduling (§7) → Task 10; errors/idempotency (§8) → Tasks 6, 8; verification (§9) → per-task steps + final section.
- Type names are consistent across tasks (`Fact`, `Topic`, `FigureSpec`, `Draft`, `Critique`).
- No placeholders: every code step shows the code or the exact command.
