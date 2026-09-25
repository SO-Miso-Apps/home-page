# Blog pipeline

Writes the misoapps.com blog: one post per app per day, grounded in the app
source, scored by a second model, illustrated from HTML/CSS, and left as a
**draft** in EmDash for one-click approval.

Design: `docs/superpowers/specs/2026-09-26-blog-automation-design.md`
Plan: `docs/superpowers/plans/2026-09-26-blog-automation.md`

## What runs

```
pick topic → codex writes → deterministic gates → opencode scores →
  rewrite if rejected (max 3) → render figure → upload media →
  create draft → report + notification
```

- **Writer** — `codex exec` (ChatGPT-authenticated; no API key needed).
- **Critic** — `opencode run -m $BLOG_CRITIC_MODEL`, scores factuality,
  specificity, originality, SEO and usefulness out of 5.
- **Gates** — `lib/gates.ts`: title length and keyword, SEO description length,
  slug shape and uniqueness, 700–1200 words, 3+ `h2`, a list, two internal
  links, no banned phrase, no emoji, and **every number in the body must exist
  in the fact sheet**.
- **Figure** — `render/*.html` (tokens copied from `DESIGN.md`) captured by
  Chrome headless at 1200×630.

A post that fails three times is not published and nothing is created; the
report names the blocking gate.

## Setup

1. Create a production PAT: `https://misoapps.com/_emdash/admin` → API tokens →
   scopes `content:write` and `media:write`. Token is shown once.
2. `cp tools/blog/.env.example tools/blog/.env` and fill in
   `EMDASH_API_TOKEN`.
3. For `--dry-run`, mint a token against the local D1 and put it in
   `EMDASH_DEV_TOKEN` (see below). Never put the production token there.

```bash
# local dev token (dev server on :4399, minted against the local D1)
sqlite3 ... # see the pipeline's probe history; insert into _emdash_api_tokens
```

## Running

```bash
pnpm blog:test                          # gate, prompt and content integrity tests
pnpm blog:dry                           # both apps, local dev server, drafts deleted after checking
node tools/blog/publish.ts --app auto-tags --slug at-and-or-logic --dry-run
pnpm blog:run                           # both apps against production, leaves drafts
```

Flags: `--app auto-tags|history-revert|both`, `--dry-run`, `--slug <topicId>`,
`--max-attempts N`.

`--dry-run` creates the draft, publishes it, checks the rendered page for the
figure and `og:image`, then deletes the post and the media. The report stays in
`out/`.

## Daily schedule

```bash
pnpm blog:start    # pm2 app "miso-blog", cron 08:00, autorestart off
pnpm blog:stop
```

Each run exits when it is done, so a failure can never loop. Output lands in
`tools/blog/out/pm2.log`.

The pm2 entry pins `interpreter` to the Node 22 binary in
`ecosystem.blog.config.json`, because the pipeline runs TypeScript directly and the pm2
daemon may hold an older Node from another nvm version. After a Node upgrade,
point that path at the new binary.

## Approving

Open `https://misoapps.com/_emdash/admin` → Posts → the new drafts. Each draft
carries its `og_image`, SEO title and description, and a category
(`Product updates` or `Merchant playbook`). Review, edit if you like, publish.

`tools/blog/out/<date>-<app>-<slug>/report.md` has the critic's scores, the gate
result, the facts used and the figure.

## Adding content

- **A fact**: append a block to `tools/blog/facts/<app>.md` with an ID
  (`HR-`/`AT-` + two digits), one sentence, and a real path inside the app repo.
  Nothing may appear in a post that is not here.
- **A topic**: add an entry to `tools/blog/topics/<app>.json`. `facts_required`
  may cite the other app's facts for a comparison post. Run `pnpm blog:test` —
  it checks that every reference resolves and every link is a path the site
  serves.
- **A figure template**: add `render/<name>.html` (with the
  `<!-- figure: <name> -->` marker) and register the name in `lib/types.ts`
  (`FigureTemplate`), `lib/gates.ts` and `lib/figure.ts`.

## Files

| Path | Responsibility |
| --- | --- |
| `publish.ts` | CLI orchestrator: pick, write, gate, score, illustrate, upload, draft |
| `lib/facts.ts` | Fact-sheet parser — the anti-fabrication ground truth |
| `lib/topics.ts` | Topic calendar loader and validator |
| `lib/gates.ts` | Every deterministic rule a draft must pass |
| `lib/write.ts` `lib/critique.ts` `lib/cli-agent.ts` | Writer and critic prompts and CLI calls |
| `lib/figure.ts` `render/` | HTML/CSS figures and Chrome capture |
| `lib/emdash.ts` | Media upload and draft creation over the EmDash API |
| `lib/rules.ts` | Word count, banned phrases, SEO bounds shared by prompt and gates |
| `state/published.json` | Ledger — which topic ran on which day, and its scores |
| `out/` | Per-post artifacts: figure, report, pm2 logs |
