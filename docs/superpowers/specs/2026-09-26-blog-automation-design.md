# Blog Automation for misoapps.com — Design

Date: 2026-09-26
Status: approved (design presented in chat and accepted by the owner)
Scope: `home-page` repo only. No changes to `history-revert/` or `Shop-Ops-Suite/`.

## 1. Problem

Two Shopify apps need a steady stream of truthful, useful, search-visible blog
posts on `misoapps.com`:

- **SO: Product History & Revert** (`../history-revert`)
- **Auto Tags** (`../Shop-Ops-Suite`)

Requirements from the owner:

1. One post per app per day (2 posts/day), English.
2. Content types: product intro, cross-app comparison, tips, tricks, how-to.
3. Concise, on-point, genuinely useful — **no AI slop, no fabricated claims**.
4. Every post needs full SEO metadata.
5. Every post needs an illustration generated as HTML/CSS and captured to an image.
6. Facts must be checkable against the two app source repos.

Chosen operating model (owner decision):

- An LLM (Codex CLI) writes from a **fact sheet** extracted from source.
- A different model (opencode CLI) **scores** the draft; deterministic gates
  run too.
- The pipeline creates a **draft** on EmDash; the owner approves with one click
  in the admin. Nothing auto-publishes.
- The daily job runs on the local machine (pm2), because it needs Chrome and
  the two CLI agents.

## 2. Verified platform capabilities

All confirmed by live probe against `astro dev` (port 4399) on 2026-09-26, then
cleaned up.

| Capability | Exact mechanics | Evidence |
| --- | --- | --- |
| Create content | `POST /_emdash/api/content/posts`, body `{data, slug, taxonomies, seo, …}`. **Defaults to `status: "draft"`.** | `node_modules/emdash/src/api/handlers/content.ts:875` (`status: body.status \|\| "draft"`), probe returned `status: draft` |
| Publish | `POST /_emdash/api/content/posts/{id}/publish` | probe: page became 200 and rendered |
| Set category | `taxonomies: {category: ["merchant-playbook"]}` inside the create body; slugs, not ids | probe: `GET …/{id}/terms/category` returned the term |
| Media upload | `POST /_emdash/api/media/upload-url` → `PUT {uploadUrl}` with returned headers → `POST /_emdash/api/media/{id}/confirm` | probe; server fills `width/height/blurhash/dominantColor` |
| Media reference | `data.og_image = {id}`, `seo.image = <id>`, inline image block `{_type:"image", asset:{id}, alt}` | probe round-trip |
| SEO surface | `seo.title` wins over `data.title` in `<title>`; `og:image` comes from `data.og_image.src` | `src/pages/blog/[slug].astro`, probe HTML |
| Taxonomy terms on posts | `category` tax def with terms `product-updates` and `merchant-playbook` | `data.db` tables `_emdash_taxonomies`/`_emdash_terms` |
| HTML→PNG | `Google Chrome --headless=new --force-device-scale-factor=2 --window-size=W,H --screenshot` then `sips -z` | proven pattern in `history-revert/listing/render.sh`; probe produced a 1200×630 PNG |
| Writer agent | `codex exec --sandbox read-only --skip-git-repo-check --json "<prompt>"` (auth: ChatGPT token in `~/.codex/auth.json`) | probe: 13.6 s, JSONL events, final `agent_message` |
| Critic agent | `opencode run -m opencode-go/<model> --format json "<prompt>"` | probe: 6 s, clean text output |

`OPENAI_API_KEY` in the shell environment is **invalid** — do not use it.

## 3. Architecture

A local, typed Node pipeline in `home-page/tools/blog/`, executed by a pm2
cron entry. It writes to the **production** EmDash API over HTTPS with a
personal access token; the local dev DB is used only for `--dry-run`.

```
tools/blog/
  facts/{history-revert,auto-tags}.md    # ground truth; every fact has an ID and a source path
  topics/{history-revert,auto-tags}.yaml # content calendar (30+ entries per app)
  prompts/writer.md  prompts/critic.md   # prompt templates
  render/figure.css og-card.html diagrams/*.html
  render/capture.sh                      # HTML -> PNG
  lib/facts.ts topics.ts pick.ts write.ts critique.ts gates.ts figure.ts
      emdash.ts ledger.ts notify.ts report.ts
  publish.ts                             # CLI orchestrator
  state/published.json                   # ledger (gitignored)
  out/<YYYY-MM-DD>/<slug>/               # artifacts (gitignored)
  .env                                   # secrets (gitignored)
```

Data flow for one app, one run:

```
pick(topic) -> write(codex) -> gates(deterministic) --fail--> retry (max 3)
            -> critique(opencode) --fail--> rewrite with feedback (max 3)
            -> figure (HTML->PNG) -> upload media -> create draft -> notify -> ledger
```

Both apps run in one job invocation (`--app both`), sequentially, each isolated:
one app failing never blocks the other.

## 4. Interfaces

### 4.1 Fact sheet (input to the writer, ground truth)

`tools/blog/facts/<app>.md`, one fact per block:

```markdown
### HR-07 — Field-level compare
Claim: The activity log records old and new values per field, so a price edit
shows both values side by side.
Source: app/routes/app.activity-log.tsx:120
Tags: feature, ui
```

Rules: a fact exists only if the source backs it; `Source:` is a real path
inside the app repo; numbers, field names and API names may only appear in a
post if they appear in a fact. The fact sheet is reviewed by the owner once per
app update.

### 4.2 Topic calendar

`tools/blog/topics/<app>.yaml`:

```yaml
- id: hr-compare-two-versions
  intent: guide                       # intro | guide | compare | tips | troubleshoot
  title_hint: "Compare two versions of a product before you revert"
  primary_keyword: "shopify product history compare"
  secondary_keywords: ["revert product changes shopify"]
  category: merchant-playbook         # product-updates | merchant-playbook
  facts_required: [HR-01, HR-07, HR-12]
  internal_links: [/apps/history-revert]
  figure: compare-table               # og-card | flow | timeline | compare-table | rule-tree
  notes: "Show the compare view; never claim undo for orders."
```

### 4.3 Writer output (contract with the model)

Strict JSON, no markdown fence, no commentary:

```json
{
  "title": "…",
  "slug": "kebab-case",
  "excerpt": "…",
  "seo_title": "…",
  "seo_description": "…",
  "used_facts": ["HR-07"],
  "internal_links": ["/apps/history-revert"],
  "content": [ { "_type": "block", "_key": "b1", "style": "normal", "markDefs": [],
                 "children": [ { "_type": "span", "_key": "s1", "text": "…" } ] } ],
  "figure": { "template": "compare-table", "eyebrow": "…", "headline": "…",
              "rows": [ { "label": "…", "value": "…" } ] }
}
```

### 4.4 Critic output

```json
{ "scores": { "factuality": 5, "specificity": 4, "originality": 4, "seo": 5, "usefulness": 5 },
  "violations": [ { "kind": "unsupported_claim", "quote": "…", "why": "…" } ],
  "verdict": "pass", "rewrite_notes": "…" }
```

### 4.5 Module signatures

```ts
// lib/facts.ts
export type Fact = { id: string; claim: string; source: string; tags: string[] };
export function loadFacts(repo: string, app: string): Fact[];

// lib/topics.ts
export type Topic = { id: string; intent: string; titleHint: string; primaryKeyword: string;
  secondaryKeywords: string[]; category: string; factsRequired: string[];
  internalLinks: string[]; figure: string; notes?: string };
export function loadTopics(app: string): Topic[];

// lib/pick.ts
export function pickTopic(topics: Topic[], ledger: Ledger, publishedSlugs: string[]): Topic | null;

// lib/write.ts
export function writeDraft(input: { facts: Fact[]; topic: Topic; styleGuide: string;
  feedback?: string }): Promise<Draft>;

// lib/critique.ts
export function critique(input: { draft: Draft; facts: Fact[] }): Promise<Critique>;

// lib/gates.ts  (pure, no I/O — unit tested)
export function runGates(input: { draft: Draft; facts: Fact[]; topic: Topic;
  existingSlugs: string[] }): GateResult;
export type GateResult = { ok: boolean; failures: { code: string; detail: string }[] };

// lib/figure.ts
export function renderFigure(spec: FigureSpec, outFile: string): Promise<void>;

// lib/emdash.ts
export function uploadMedia(file: string, token: string, site: string): Promise<string>;
export function createDraft(post: DraftPost, token: string, site: string): Promise<{ id: string; slug: string }>;

// lib/ledger.ts
export function readLedger(path: string): Ledger;
export function recordRun(path: string, entry: LedgerEntry): void;
```

### 4.6 CLI

```
node --import tsx tools/blog/publish.ts --app auto-tags|history-revert|both
    [--dry-run] [--slug <topicId>] [--site <url>] [--max-attempts N]
```

Exit code 0 only when every requested app produced a draft (or explicitly
skipped); 1 on any failed app. `--dry-run` targets the local dev server and
prints what it would create.

## 5. Gates (deterministic, must all pass)

| Code | Rule |
| --- | --- |
| `schema` | `content` is a valid Portable Text array (block/image shapes), all `_key`s unique, no unknown `_type` |
| `title_len` | `title` ≤ 60 chars |
| `title_keyword` | `title` contains `primary_keyword` (case-insensitive, ignoring punctuation) |
| `seo_desc` | `seo_description` 140–158 chars |
| `slug` | kebab-case, ≤ 60 chars, unique vs published posts and other drafts |
| `body_len` | 700–1200 words |
| `structure` | ≥ 3 `h2` blocks; no heading-level jumps; ≥ 1 list or a table-ish bullet group |
| `links` | ≥ 2 internal links, at least one to `/apps/<app>`; every link path must exist in the sitemap set |
| `fact_trace` | every number+unit, quoted field/API name and product-name string in the body appears in the fact sheet allowlist |
| `banned` | no banned phrase (list below), no emoji, no "as an AI" |
| `duplicate` | slug and title differ from every published post (trigram similarity < 0.9) |
| `figure` | figure spec is renderable: every row label/value traces to a fact |

Banned phrases (case-insensitive): `in today's fast-paced`, `delve`, `unlock
the power`, `unleash`, `game-changer`, `seamless`, `elevate your`, `take it to
the next level`, `revolutionize`, `it's not just`, `look no further`, `tapestry`,
`in the realm of`, `dive into`, `supercharge`, `effortless`, `cutting-edge`,
`robust solution`, `when it comes to`, `the world of`.

Critic gate: `factuality >= 4`, total ≥ 20/25, `violations` empty, `verdict ==
"pass"`.

## 6. Illustrations

Follows `DESIGN.md` "Art Rules": decorative and abstract, never a fake admin
UI, never fake charts or metrics; numbers come from the fact sheet or the
figure does not use numbers.

- Canvas tokens copied from `DESIGN.md`: canvas `#f6f7f4`, surface `#ffffff`,
  ink `#141815`, muted `#5c6862`, brand `#138f5b`, brand-ink `#107a4e`, hairlines
  `rgba(20,24,21,.10/.18)`; Outfit (display), Plus Jakarta Sans (body), a mono
  stack for labels — loaded from the same Google Fonts URL the site uses.
- `og-card.html` — 1200×630, eyebrow + headline + abstract motif; used as
  `og_image` for every post.
- `diagrams/`: `flow.html` (before/after state), `timeline.html` (change
  timeline), `compare-table.html` (two-column capability compare),
  `rule-tree.html` (Auto Tags rule conditions). Each renders at 1200×630 as a
  second in-body image when the topic asks for one.
- Capture: `render/capture.sh <html> <png> <W> <H>` — Chrome headless at 2×,
  `sips` downsample, same approach as `history-revert/listing/render.sh`.

## 7. Scheduling

`ecosystem.blog.config.json` in `home-page`, started with pm2:

```json
{
  "apps": [{
    "name": "miso-blog",
    "script": "tools/blog/publish.ts",
    "interpreter": "<path to a Node 22 binary>",
    "args": "--app both",
    "cwd": "<repo root>",
    "cron_restart": "0 8 * * *",
    "autorestart": false,
    "out_file": "tools/blog/out/pm2.log",
    "error_file": "tools/blog/out/pm2.err.log",
    "merge_logs": true
  }]
}
```

The interpreter is pinned because the pipeline runs TypeScript directly (Node 22
type stripping) while the pm2 daemon may hold an older Node from another nvm
version. `pm2 save` persists the schedule; `pm2 resurrect` restores it after a
reboot.

`cron_restart` runs it at 08:00 daily and the process exits, so a failed run
never loops. A manual run is `pnpm blog:run --app both`.

Approval: the owner opens
`https://misoapps.com/_emdash/admin` → posts → the two new drafts → review →
Publish. No auto-publish in v1.

## 8. Errors, safety, idempotency

- Any step failing aborts that app: no draft is created; artifacts stay in
  `out/<date>/<slug>/` for debugging; the report names the blocking gate.
- Writer/critic calls get a 180 s timeout; one retry on network failure only.
- Before writing, the run does `GET /_emdash/api/content/posts?limit=1` to prove
  the token works and the site is up.
- Ledger is appended only after a draft exists; a re-run skips topics already in
  the ledger, and an existing slug is skipped rather than duplicated.
- Media upload uses the content hash so a re-run reuses the same asset.
- Secrets live in `tools/blog/.env` (gitignored) and are never logged.

## 9. Verification

- `node --test tools/blog/lib/*.test.ts` — gate unit tests with a passing
  fixture and one bad fixture per gate code (long title, banned phrase,
  untraceable number, missing internal link, duplicate slug, invalid block).
- `--dry-run` end-to-end against the local dev server: draft created, media
  uploaded, category set, then publish and check `/blog/<slug>` renders the
  headline, the in-body figure and `og:image`; artifacts then deleted.
- One real production run creating two drafts, reviewed by the owner.
- First two posts are read end-to-end by the agent that built the pipeline
  against the fact sheet, before handing over.

## 10. Non-goals (v1)

- No auto-publish, no scheduled publishing.
- No social cross-posting, no newsletters.
- No Vietnamese translations (EmDash i18n exists; unused here).
- No real product screenshots (needs Shopify auth per capture).
- No edits to the two app repos and no reuse of their listing pipelines.
- No analytics or ranking feedback loop.
