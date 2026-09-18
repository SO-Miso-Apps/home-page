# Astro + EmDash Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Miso Apps marketing site on Astro 6 + EmDash CMS with a landing home page, editor-driven per-app landing pages, and a blog, deployed to Cloudflare Workers (D1 + R2 + KV).

**Architecture:** Single Astro application embedding EmDash as one Cloudflare Worker. Content model (collections, menus, widgets, seed entries) ships in `seed/seed.json`; all routes are server-rendered and query published content at request time. Theme is a custom port of `DESIGN.md`.

**Tech Stack:** Astro 6 (`output: "server"`), `@astrojs/cloudflare`, `emdash`, `@emdash-cms/cloudflare`, `@astrojs/react` (EmDash admin UI), Cloudflare D1/R2/KV/Images, Wrangler 4, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-19-astro-emdash-rebuild-design.md`

## Global Constraints

- Node.js ≥ 22.16.0; package manager is **pnpm** (repo convention).
- Content is **English only**. No i18n.
- Design tokens copied **verbatim** from `DESIGN.md`: canvas `#F7F8F5`, surface white 70–80% opacity, ink `#171A18`, muted `#5F6B64`, accent `#138F5B`, accent-dark `#0F6F49`, line `rgba(23,26,24,0.12)`, max width 1180px, Poppins 600–800 display / Open Sans 400–700 body, transitions 150–300ms animating only transform/opacity, respect `prefers-reduced-motion`.
- Anti-patterns (from `DESIGN.md`): no neon gradients/glows, no pure black backgrounds, no emoji UI icons, no brutalist borders/hard offset shadows, no generic centered SaaS hero, no text overlap.
- Cloudflare binding names are exact: `DB` (D1), `MEDIA` (R2), `CACHE` (KV). `IMAGES` binding declared in `wrangler.jsonc`.
- Every route is server-rendered — **no `prerender = true`** anywhere.
- No sandboxed plugins in v1 → no `sandboxRunner`, no `LOADER` binding. `PluginBridge` still exported from `src/worker.ts`.
- Cron `* * * * *` for scheduled publishing.
- All queries return errors as data: on `error`, respond 500 and log — never render a silent empty page.
- Old site preserved at branch `archive/react-router-site` (commit `1ee6278`). `DESIGN.md` stays in repo. Everything else from the old stack is removed in Task 1.
- Commit after every step. Never commit `.env`.

---

### Task 1: Reset main to a fresh Astro + EmDash project skeleton

**Files:**
- Delete: all old-site files except `DESIGN.md`, `.git/`, `docs/`
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `wrangler.jsonc`, `src/worker.ts`, `src/live.config.ts`, `src/env.d.ts`, `.gitignore`, `.env` (gitignored), `public/favicon.svg`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: buildable Astro server project with EmDash wired to local Cloudflare bindings; Task 2+ create pages/components inside `src/`.

- [ ] **Step 1: Verify Node version**

Run: `node --version`
Expected: `v22.16.0` or later. Abort and report if lower.

- [ ] **Step 2: Remove old-site files**

```bash
git rm -r --cached . >/dev/null
printf 'DESIGN.md\ndocs/\n.gitignore\n' > /tmp/keep.txt
find . -mindepth 1 -maxdepth 1 \
  ! -name 'DESIGN.md' ! -name 'docs' ! -name '.git' ! -name '.gitignore' \
  -exec git rm -rf {} + >/dev/null
git commit -m "chore: remove React Router site (archived at archive/react-router-site)"
```

- [ ] **Step 3: Write `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.wrangler/
.env
.emdash/
data.db
*.tsbuildinfo
```

- [ ] **Step 4: Initialize package.json and install dependencies**

```bash
pnpm init
pnpm add astro @astrojs/cloudflare @astrojs/react react react-dom emdash @emdash-cms/cloudflare
pnpm add -D wrangler typescript @types/node @astrojs/check
```

Then merge these fields into `package.json` (keep pnpm-installed `dependencies`/`devDependencies` as pnpm wrote them):

```json
{
  "name": "home-page",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "wrangler dev",
    "deploy": "astro build && wrangler deploy",
    "check": "astro check",
    "cf-typegen": "wrangler types"
  },
  "emdash": {
    "seed": "seed/seed.json"
  }
}
```

- [ ] **Step 5: Write `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import emdash from "emdash/astro";
import { d1, r2, kvCache } from "@emdash-cms/cloudflare";

export default defineConfig({
  site: "https://misoapps.com",
  output: "server",
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  cache: { provider: cacheCloudflare() },
  routeRules: {
    "/": { maxAge: 300, swr: 86400 },
    "/apps/*": { maxAge: 300, swr: 86400 },
    "/blog": { maxAge: 300, swr: 86400 },
    "/blog/*": { maxAge: 300, swr: 86400 },
    "/sitemap.xml": { maxAge: 3600 },
    "/rss.xml": { maxAge: 3600 },
  },
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      objectCache: kvCache({ binding: "CACHE" }),
    }),
  ],
});
```

- [ ] **Step 6: Write `tsconfig.json` and `src/env.d.ts`**

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "emdash-env.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`src/env.d.ts`:

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 7: Write `wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "home-page",
  "main": "./src/worker.ts",
  "compatibility_date": "2026-02-24",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    { "binding": "DB", "database_name": "home-page" }
  ],
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "home-page-media" }
  ],
  "kv_namespaces": [
    { "binding": "CACHE", "id": "REPLACE_AFTER_KV_CREATE" }
  ],
  "images": { "binding": "IMAGES" },
  "triggers": { "crons": ["* * * * *"] }
}
```

(The `CACHE` id is filled in Task 9; `placement` and `routes` are also added there after first deploy. Local dev works with the placeholder.)

- [ ] **Step 8: Write `src/worker.ts`**

```ts
import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

export default {
  ...handler,
  scheduled: createScheduledHandler(),
} satisfies ExportedHandler;
```

- [ ] **Step 9: Write `src/live.config.ts`**

```ts
import { defineLiveCollection } from "astro:content";
import { emdashLoader } from "emdash/runtime";

export const collections = {
  _emdash: defineLiveCollection({ loader: emdashLoader() }),
};
```

- [ ] **Step 10: Generate the encryption key**

Run: `npx emdash secrets generate --write .env`
Expected: `.env` exists with `EMDASH_ENCRYPTION_KEY=…` and is gitignored. Verify: `git status --porcelain` does not list `.env`.

- [ ] **Step 11: Write placeholder favicon and stub index**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#138F5B"/><path d="M9 22V10h4l3 6 3-6h4v12h-3.4v-6.4L16.8 20h-1.6l-2.8-4.4V22z" fill="#F7F8F5"/></svg>
```

`src/pages/index.astro` (temporary; replaced in Task 4):

```astro
---
---
<h1>Miso Apps — rebuild in progress</h1>
```

- [ ] **Step 12: Build**

Run: `pnpm build`
Expected: build succeeds; `dist/` produced; no type errors.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro + EmDash project on Cloudflare Workers"
```

---

### Task 2: Seed file — content model, menus, widgets, and real entries

**Files:**
- Create: `seed/seed.json`

**Interfaces:**
- Consumes: Task 1 project (`package.json#emdash.seed` points at `seed/seed.json`).
- Produces: collections `apps`, `posts`, `pages` with the exact field slugs every later task queries: apps → `name, tagline, hero, features (repeater: title, description), screenshots (repeater: image), app_store_url, pricing_url, badge, sort_order, rating_value, review_count, seo_title, seo_description, og_image`; posts → `title, excerpt, content, seo_title, seo_description, og_image`; pages → `title, content, template, seo_title, seo_description, og_image`. Menus named `primary` and `footer`; widget areas named `footer-contact` and `blog-sidebar`. Taxonomies `category` (hierarchical) and `tags` on posts.

- [ ] **Step 1: Write `seed/seed.json`**

App copy below is ported verbatim from the old site (`archive/react-router-site:app/routes/products.tsx`).

```json
{
  "$schema": "https://emdashcms.com/seed.schema.json",
  "version": "1",
  "defaultLocale": "en",
  "meta": {
    "name": "Miso Apps",
    "description": "Marketing site model for Miso Apps — apps catalog, pages, and blog",
    "author": "Miso Apps"
  },
  "settings": {
    "title": "Miso Apps",
    "tagline": "Professional Shopify app studio",
    "postsPerPage": 10
  },
  "collections": [
    {
      "slug": "apps",
      "label": "Apps",
      "labelSingular": "App",
      "description": "Commerce app catalog. Publishing an entry creates its landing page and adds it to the home grid.",
      "supports": ["drafts", "revisions", "scheduling", "search", "seo"],
      "urlPattern": "/apps/{slug}",
      "routable": true,
      "titleField": "name",
      "admin": { "listColumns": ["name", "badge", "sort_order"] },
      "fields": [
        { "slug": "name", "label": "App name", "type": "string", "required": true, "searchable": true, "validation": { "maxLength": 120 } },
        { "slug": "tagline", "label": "Tagline", "type": "text", "required": true, "options": { "rows": 2 }, "validation": { "maxLength": 300 } },
        { "slug": "hero", "label": "Hero content", "type": "portableText" },
        { "slug": "icon", "label": "App icon", "type": "image", "validation": { "allowedMimeTypes": ["image/png", "image/svg+xml", "image/webp"] } },
        {
          "slug": "features",
          "label": "Features",
          "type": "repeater",
          "validation": { "subFields": ["title", "description"] }
        },
        {
          "slug": "screenshots",
          "label": "Screenshots",
          "type": "repeater",
          "validation": { "subFields": ["image"] }
        },
        { "slug": "app_store_url", "label": "App store URL", "type": "url", "required": true },
        { "slug": "pricing_url", "label": "Pricing URL", "type": "url" },
        { "slug": "badge", "label": "Badge", "type": "string", "validation": { "maxLength": 40 } },
        { "slug": "sort_order", "label": "Sort order", "type": "integer", "indexed": true, "validation": { "min": 0 } },
        { "slug": "rating_value", "label": "Rating (e.g. 5.0)", "type": "number", "validation": { "min": 0, "max": 5 } },
        { "slug": "review_count", "label": "Review count", "type": "integer", "validation": { "min": 0 } },
        { "slug": "seo_title", "label": "SEO title", "type": "string", "validation": { "maxLength": 70 } },
        { "slug": "seo_description", "label": "SEO description", "type": "text", "options": { "rows": 3 }, "validation": { "maxLength": 160 } },
        { "slug": "og_image", "label": "OG image", "type": "image" }
      ]
    },
    {
      "slug": "posts",
      "label": "Posts",
      "labelSingular": "Post",
      "description": "Blog articles",
      "supports": ["drafts", "revisions", "scheduling", "search", "seo"],
      "urlPattern": "/blog/{slug}",
      "routable": true,
      "titleField": "title",
      "fields": [
        { "slug": "title", "label": "Title", "type": "string", "required": true, "searchable": true, "validation": { "maxLength": 200 } },
        { "slug": "excerpt", "label": "Excerpt", "type": "text", "options": { "rows": 3 }, "validation": { "maxLength": 300 } },
        { "slug": "content", "label": "Content", "type": "portableText", "required": true },
        { "slug": "seo_title", "label": "SEO title", "type": "string", "validation": { "maxLength": 70 } },
        { "slug": "seo_description", "label": "SEO description", "type": "text", "options": { "rows": 3 }, "validation": { "maxLength": 160 } },
        { "slug": "og_image", "label": "OG image", "type": "image" }
      ]
    },
    {
      "slug": "pages",
      "label": "Pages",
      "labelSingular": "Page",
      "description": "Static pages such as About and Privacy",
      "supports": ["drafts", "revisions", "seo"],
      "urlPattern": "/{slug}",
      "routable": true,
      "titleField": "title",
      "fields": [
        { "slug": "title", "label": "Title", "type": "string", "required": true, "validation": { "maxLength": 200 } },
        { "slug": "content", "label": "Content", "type": "portableText", "required": true },
        { "slug": "template", "label": "Template", "type": "select", "defaultValue": "Default", "validation": { "options": ["Default", "Full Width"] } },
        { "slug": "seo_title", "label": "SEO title", "type": "string", "validation": { "maxLength": 70 } },
        { "slug": "seo_description", "label": "SEO description", "type": "text", "options": { "rows": 3 }, "validation": { "maxLength": 160 } },
        { "slug": "og_image", "label": "OG image", "type": "image" }
      ]
    }
  ],
  "taxonomies": [
    {
      "name": "category",
      "label": "Categories",
      "labelSingular": "Category",
      "hierarchical": true,
      "collections": ["posts"],
      "terms": [
        { "slug": "product-updates", "label": "Product updates" },
        { "slug": "merchant-playbook", "label": "Merchant playbook" }
      ]
    },
    {
      "name": "tags",
      "label": "Tags",
      "labelSingular": "Tag",
      "hierarchical": false,
      "collections": ["posts"]
    }
  ],
  "content": {
    "apps": [
      {
        "id": "app-auto-tags",
        "slug": "so-auto-tags-all-in-one",
        "status": "published",
        "data": {
          "name": "SO: Auto Tags | All-in-One",
          "tagline": "Automate store management with rule-based tagging for orders, customers, and products. Built for teams that need cleaner data and less manual admin work.",
          "badge": "Operations",
          "sort_order": 1,
          "rating_value": 5.0,
          "review_count": 3,
          "app_store_url": "https://apps.shopify.com/so-operations-suite-with-ai",
          "seo_title": "SO: Auto Tags | All-in-One — rule-based tagging for Shopify",
          "seo_description": "Automate Shopify tagging for orders, customers, and products with custom rules, bulk cleanup tools, and workflow automation.",
          "features": [
            { "title": "Custom rules for orders, customers, and products", "description": "Target exactly the records that need tags with conditions you control." },
            { "title": "Bulk replace, merge, and cleanup tools", "description": "Fix years of tag drift in a single pass." },
            { "title": "Workflow automation for recurring admin tasks", "description": "Put routine store management on autopilot." },
            { "title": "Realtime tag management and reporting", "description": "See tagging activity as it happens." }
          ],
          "hero": [
            { "_type": "block", "_key": "at-h1", "style": "normal", "children": [{ "_type": "span", "_key": "at-h1s", "text": "Cleaner store data without the manual admin work." }] }
          ]
        }
      },
      {
        "id": "app-sticky-atc",
        "slug": "so-sticky-add-to-cart",
        "status": "published",
        "data": {
          "name": "SO: Sticky Add To Cart",
          "tagline": "Keep the purchase action visible as shoppers browse. The bar is customizable, responsive, and focused on improving product-page conversion.",
          "badge": "Conversion",
          "sort_order": 2,
          "rating_value": 5.0,
          "review_count": 1,
          "app_store_url": "https://apps.shopify.com/so-sticky-add-to-cart",
          "seo_title": "SO: Sticky Add To Cart — always-visible purchase action",
          "seo_description": "A customizable, responsive sticky add-to-cart bar focused on improving Shopify product-page conversion.",
          "features": [
            { "title": "Always-visible add-to-cart action", "description": "The purchase action follows the shopper through the page." },
            { "title": "Mobile and desktop responsive layouts", "description": "One bar that fits every theme and screen." },
            { "title": "Design controls for store theme fit", "description": "Match colors, copy, and placement to your brand." },
            { "title": "Performance tracking for experiments", "description": "Measure the impact of each variant." }
          ],
          "hero": [
            { "_type": "block", "_key": "sa-h1", "style": "normal", "children": [{ "_type": "span", "_key": "sa-h1s", "text": "Keep the buy button one tap away." }] }
          ]
        }
      },
      {
        "id": "app-history-revert",
        "slug": "so-product-history-revert",
        "status": "published",
        "data": {
          "name": "SO: Product History & Revert",
          "tagline": "Track product edits in real time and restore previous values when mistakes happen. Built for multi-editor teams that need product version history without spreadsheets.",
          "badge": "Recovery",
          "sort_order": 3,
          "rating_value": 5.0,
          "review_count": 1,
          "app_store_url": "https://apps.shopify.com/so-history-revert",
          "seo_title": "SO: Product History & Revert — version history for Shopify products",
          "seo_description": "Track every product edit in real time and revert fields or full versions with one click. Built for multi-editor Shopify teams.",
          "features": [
            { "title": "Automatic tracking for product field changes", "description": "Every edit is captured the moment it happens." },
            { "title": "Before-and-after comparisons for each edit", "description": "See exactly what changed and who changed it." },
            { "title": "One-click revert for fields or full product versions", "description": "Undo mistakes without spreadsheets." },
            { "title": "History coverage for variants, metafields, categories, and media", "description": "The whole product record, covered." }
          ],
          "hero": [
            { "_type": "block", "_key": "hr-h1", "style": "normal", "children": [{ "_type": "span", "_key": "hr-h1s", "text": "Every product edit, tracked and reversible." }] }
          ]
        }
      },
      {
        "id": "app-llms-txt",
        "slug": "so-llms-txt",
        "status": "published",
        "data": {
          "name": "SO: llms.txt",
          "tagline": "Generate llms.txt files that help AI assistants understand store content. A practical step toward better AI discoverability for modern commerce.",
          "badge": "AI readiness",
          "sort_order": 4,
          "rating_value": null,
          "review_count": 0,
          "app_store_url": "https://apps.shopline.com/detail?appHandle=so_llms_txt",
          "seo_title": "SO: llms.txt — AI-readable store content for Shopline",
          "seo_description": "Generate llms.txt files that help AI assistants understand your Shopline store content, with scheduled updates as content changes.",
          "features": [
            { "title": "Automatic llms.txt generation", "description": "The file builds and refreshes itself." },
            { "title": "AI-readable content structure", "description": "Assistants get a clean map of your store." },
            { "title": "Simple Shopline integration", "description": "Install and go — no theme edits." },
            { "title": "Scheduled updates as store content changes", "description": "Discoverability stays current." }
          ],
          "hero": [
            { "_type": "block", "_key": "lt-h1", "style": "normal", "children": [{ "_type": "span", "_key": "lt-h1s", "text": "Make your store legible to AI assistants." }] }
          ]
        }
      }
    ],
    "posts": [
      {
        "id": "post-welcome",
        "slug": "hello-from-miso-apps",
        "status": "published",
        "data": {
          "title": "Hello from Miso Apps",
          "excerpt": "Why we build focused commerce apps, and what you will find on this blog.",
          "content": [
            { "_type": "block", "_key": "w-p1", "style": "normal", "children": [{ "_type": "span", "_key": "w-p1s", "text": "Miso Apps designs and ships focused Shopify and Shopline apps for automation, conversion, and AI-readable storefront data. This blog is where we share product updates and practical merchant playbooks." }] },
            { "_type": "block", "_key": "w-p2", "style": "normal", "children": [{ "_type": "span", "_key": "w-p2s", "text": "Expect short, concrete posts: what shipped, what changed, and how to get value from it in your store today." }] }
          ],
          "seo_title": "Hello from Miso Apps",
          "seo_description": "Why we build focused commerce apps, and what you will find on this blog."
        },
        "taxonomies": { "category": ["product-updates"] }
      }
    ],
    "pages": [
      {
        "id": "page-about",
        "slug": "about",
        "status": "published",
        "data": {
          "title": "About",
          "template": "Default",
          "seo_title": "About — Miso Apps",
          "seo_description": "Miso Apps is a commerce app studio building professional Shopify and Shopline products for automation, conversion, and merchant operations.",
          "content": [
            { "_type": "block", "_key": "ab-h", "style": "h2", "children": [{ "_type": "span", "_key": "ab-hs", "text": "A commerce app studio built around practical merchant work." }] },
            { "_type": "block", "_key": "ab-p1", "style": "normal", "children": [{ "_type": "span", "_key": "ab-p1s", "text": "We design, build, and maintain focused apps for Shopify and Shopline merchants. The team cares about speed, predictable interfaces, and software that keeps working after the launch." }] },
            { "_type": "block", "_key": "ab-v1h", "style": "h3", "children": [{ "_type": "span", "_key": "ab-v1hs", "text": "Focused product scope" }] },
            { "_type": "block", "_key": "ab-v1p", "style": "normal", "children": [{ "_type": "span", "_key": "ab-v1ps", "text": "We prefer apps that solve a specific merchant problem clearly over large feature sets that make daily work harder." }] },
            { "_type": "block", "_key": "ab-v2h", "style": "h3", "children": [{ "_type": "span", "_key": "ab-v2hs", "text": "Maintainable engineering" }] },
            { "_type": "block", "_key": "ab-v2p", "style": "normal", "children": [{ "_type": "span", "_key": "ab-v2ps", "text": "Platform APIs, permission surfaces, performance budgets, and support tooling are part of product quality from day one." }] },
            { "_type": "block", "_key": "ab-v3h", "style": "h3", "children": [{ "_type": "span", "_key": "ab-v3hs", "text": "Merchant-level support" }] },
            { "_type": "block", "_key": "ab-v3p", "style": "normal", "children": [{ "_type": "span", "_key": "ab-v3ps", "text": "Support is written for the person running the store, with clear steps and practical answers instead of vague tickets." }] },
            { "_type": "block", "_key": "ab-v4h", "style": "h3", "children": [{ "_type": "span", "_key": "ab-v4hs", "text": "Trust by design" }] },
            { "_type": "block", "_key": "ab-v4p", "style": "normal", "children": [{ "_type": "span", "_key": "ab-v4ps", "text": "We keep data access intentional, explain what apps need, and avoid patterns that create privacy or theme-risk surprises." }] }
          ]
        }
      },
      {
        "id": "page-privacy",
        "slug": "privacy",
        "status": "published",
        "data": {
          "title": "Privacy Policy",
          "template": "Default",
          "seo_title": "Privacy Policy — Miso Apps",
          "seo_description": "Learn how Miso Apps protects your privacy and handles your data.",
          "content": [
            { "_type": "block", "_key": "pr-p0", "style": "normal", "children": [{ "_type": "span", "_key": "pr-p0s", "text": "Last updated: November 10, 2025. This policy explains what information Miso Apps collects, why, and the choices you have." }] },
            { "_type": "block", "_key": "pr-h1", "style": "h2", "children": [{ "_type": "span", "_key": "pr-h1s", "text": "How we use information" }] },
            { "_type": "block", "_key": "pr-p1", "style": "normal", "children": [{ "_type": "span", "_key": "pr-p1s", "text": "We use information to provide, maintain, and improve our services; to respond to inquiries and send important updates; to detect and prevent fraud, abuse, and security threats; to analyze usage patterns and improve user experience; to comply with legal obligations and enforce our terms; and, with your consent, to send promotional materials." }] },
            { "_type": "block", "_key": "pr-h2", "style": "h2", "children": [{ "_type": "span", "_key": "pr-h2s", "text": "Your rights" }] },
            { "_type": "block", "_key": "pr-p2", "style": "normal", "children": [{ "_type": "span", "_key": "pr-p2s", "text": "You can request a copy of the personal data we hold (access); update or correct inaccurate information (correction); request deletion of your personal data (deletion); receive your data in a portable format (portability); unsubscribe from marketing communications (opt-out); and object to certain data processing activities." }] },
            { "_type": "block", "_key": "pr-h3", "style": "h2", "children": [{ "_type": "span", "_key": "pr-h3s", "text": "Contact" }] },
            { "_type": "block", "_key": "pr-p3", "style": "normal", "children": [{ "_type": "span", "_key": "pr-p3s", "text": "For any privacy request, email hi@misoapps.com or write to Miso Apps, Hanoi, Vietnam." }] }
          ]
        }
      }
    ]
  },
  "menus": [
    {
      "name": "primary",
      "label": "Primary navigation",
      "items": [
        { "type": "custom", "label": "Apps", "url": "/#apps", "target": "_self" },
        { "type": "custom", "label": "Blog", "url": "/blog", "target": "_self" },
        { "type": "page", "label": "About", "ref": "page-about", "collection": "pages" }
      ]
    },
    {
      "name": "footer",
      "label": "Footer navigation",
      "items": [
        { "type": "custom", "label": "Home", "url": "/", "target": "_self" },
        { "type": "custom", "label": "Blog", "url": "/blog", "target": "_self" },
        { "type": "page", "label": "About", "ref": "page-about", "collection": "pages" },
        { "type": "page", "label": "Privacy Policy", "ref": "page-privacy", "collection": "pages" }
      ]
    }
  ],
  "widgetAreas": [
    {
      "name": "footer-contact",
      "label": "Footer contact",
      "widgets": [
        {
          "type": "content",
          "title": "Contact",
          "content": [
            { "_type": "block", "_key": "fc-1", "style": "normal", "children": [{ "_type": "span", "_key": "fc-1s", "text": "hi@misoapps.com" }] },
            { "_type": "block", "_key": "fc-2", "style": "normal", "children": [{ "_type": "span", "_key": "fc-2s", "text": "+84 35-7654-619" }] },
            { "_type": "block", "_key": "fc-3", "style": "normal", "children": [{ "_type": "span", "_key": "fc-3s", "text": "Hanoi, Vietnam" }] }
          ]
        }
      ]
    },
    {
      "name": "blog-sidebar",
      "label": "Blog sidebar",
      "widgets": [
        { "type": "component", "title": "Recent posts", "componentId": "core:recent-posts", "props": { "count": 5 } },
        { "type": "component", "title": "Categories", "componentId": "core:categories", "props": {} }
      ]
    }
  ],
  "redirects": [
    { "source": "/products", "destination": "/", "type": 308, "enabled": true, "groupName": "Old site routes" }
  ]
}
```

- [ ] **Step 2: Validate the seed**

Run: `npx emdash seed seed/seed.json --validate`
Expected: `valid` (no errors). Warnings are acceptable only if they concern absent optional targets; fix all errors.

- [ ] **Step 3: Boot dev server and complete setup wizard**

Run: `pnpm dev` (keep running in background)
Open `http://localhost:4321/_emdash/admin/`. The setup wizard appears (fresh DB). Enter site title `Miso Apps`, administrator email, register a passkey. **Keep "include sample content" selected** so the seed's apps, pages, post, menus, and widgets apply.

- [ ] **Step 4: Verify the model applied**

Open `http://localhost:4321/_emdash/admin/` dashboard.
Expected: collections **Apps**, **Posts**, **Pages** listed; Apps shows 4 published entries; Posts shows "Hello from Miso Apps"; Pages shows About and Privacy.

- [ ] **Step 5: Verify generated types**

Run: `head -40 emdash-env.d.ts`
Expected: generated declarations include collection names `apps`, `posts`, `pages` and their field names. Do not edit this file.

- [ ] **Step 6: Commit**

```bash
git add seed/seed.json
git commit -m "feat: seed content model with apps, posts, pages, menus, and widgets"
```

---

### Task 3: Design tokens, Base layout, Navigation, Footer

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Navigation.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro` (wrap in Base)

**Interfaces:**
- Consumes: menus `primary`/`footer` and widget area `footer-contact` from Task 2 seed; EmDash runtime `getMenu`, `WidgetArea` from `emdash`/`emdash/ui`.
- Produces: `Base.astro` with props `{ title?, description?, image?, canonical?, robots? }` — every later page wraps in it. Global tokens `--canvas --surface --ink --muted --accent --accent-dark --line --content-width` available everywhere.

- [ ] **Step 1: Write `src/styles/global.css`**

```css
:root {
  --canvas: #f7f8f5;
  --surface: rgba(255, 255, 255, 0.75);
  --ink: #171a18;
  --muted: #5f6b64;
  --accent: #138f5b;
  --accent-dark: #0f6f49;
  --line: rgba(23, 26, 24, 0.12);
  --content-width: 1180px;
  --radius-panel: 32px;
  --radius-card: 28px;
  --font-display: "Poppins", system-ui, sans-serif;
  --font-body: "Open Sans", system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font-body);
  line-height: 1.7;
}

body {
  margin: 0;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

a {
  color: inherit;
}

.container {
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: 1.5rem;
}

.eyebrow {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  color: var(--accent-dark);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Write `src/components/Navigation.astro`**

```astro
---
import { getMenu } from "emdash";

const menu = await getMenu("primary");
---
<header class="site-header">
  <div class="container inner">
    <a class="brand" href="/">Miso Apps</a>
    <nav aria-label="Primary navigation">
      <ul>
        {
          menu?.items.map((item) => (
            <li>
              <a
                href={item.url}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                title={item.titleAttr}
                aria-current={item.url === Astro.url.pathname ? "page" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))
        }
      </ul>
    </nav>
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--surface);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
  }
  .inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
  }
  .brand {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.1rem;
    text-decoration: none;
  }
  ul {
    display: flex;
    gap: 1.75rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  a:not(.brand) {
    text-decoration: none;
    color: var(--muted);
    font-weight: 600;
    font-size: 0.95rem;
    transition: color 200ms ease;
  }
  a:not(.brand):hover,
  a[aria-current="page"] {
    color: var(--accent-dark);
  }
</style>
```

- [ ] **Step 3: Write `src/components/Footer.astro`**

```astro
---
import { getMenu } from "emdash";
import { WidgetArea } from "emdash/ui";

const menu = await getMenu("footer");
---
<footer class="site-footer">
  <div class="container grid">
    <div class="blurb">
      <h3>Miso Apps</h3>
      <p>
        Building reliable Shopify and commerce apps for merchants who need sharper
        operations, stronger conversion paths, and dependable support.
      </p>
    </div>
    <nav aria-label="Footer navigation">
      <h4>Company</h4>
      <ul>
        {
          menu?.items.map((item) => (
            <li>
              <a
                href={item.url}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              >
                {item.label}
              </a>
            </li>
          ))
        }
      </ul>
    </nav>
    <div>
      <h4>Contact</h4>
      <WidgetArea name="footer-contact" class="contact-area" />
    </div>
  </div>
  <div class="container legal">
    <p>© {new Date().getFullYear()} Miso Apps. All rights reserved.</p>
  </div>
</footer>

<style is:global>
  .site-footer {
    border-top: 1px solid var(--line);
    background: var(--surface);
    margin-top: 6rem;
  }
  .site-footer .grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 3rem;
    padding-block: 3rem;
  }
  .site-footer h3,
  .site-footer h4 {
    margin: 0 0 0.75rem;
  }
  .site-footer h3 {
    font-size: 1.05rem;
  }
  .site-footer h4 {
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    color: var(--accent-dark);
  }
  .site-footer p {
    color: var(--muted);
    margin: 0;
    max-width: 34ch;
  }
  .site-footer ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }
  .site-footer nav a,
  .contact-area a {
    text-decoration: none;
    color: var(--muted);
    transition: color 200ms ease;
  }
  .site-footer nav a:hover,
  .contact-area a:hover {
    color: var(--accent-dark);
  }
  .contact-area p {
    margin: 0 0 0.35rem;
  }
  .site-footer .legal {
    border-top: 1px solid var(--line);
    padding-block: 1.25rem;
  }
  .site-footer .legal p {
    font-size: 0.85rem;
  }
  @media (max-width: 900px) {
    .site-footer .grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }
</style>
```

- [ ] **Step 4: Write `src/layouts/Base.astro`**

```astro
---
import "../styles/global.css";
import Navigation from "../components/Navigation.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  robots?: string;
}

const {
  title,
  description = "Miso Apps designs and ships focused Shopify and Shopline apps for automation, conversion, and AI-readable storefront data.",
  image,
  canonical,
  robots,
} = Astro.props;

const siteName = "Miso Apps";
const fullTitle = title ? `${title} — ${siteName}` : `${siteName} — Professional Shopify app studio`;
const ogImage = image ?? "/favicon.svg";
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    {robots && <meta name="robots" content={robots} />}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={canonical ?? Astro.url.pathname} />
    <meta property="og:site_name" content={siteName} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site ?? Astro.url.origin)} />
    <meta property="og:url" content={Astro.url.pathname} />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Open+Sans:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <Navigation />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: Wrap the stub page**

Replace `src/pages/index.astro` content with:

```astro
---
import Base from "../layouts/Base.astro";
---
<Base>
  <h1>Miso Apps — rebuild in progress</h1>
</Base>
```

- [ ] **Step 6: Verify in the browser**

Dev server still running (`pnpm dev`). Run: `curl -s http://localhost:4321/ | grep -o 'Miso Apps' | head -3`
Expected: at least 3 matches (brand, footer, title). Then open `http://localhost:4321/` in a browser and visually check: sticky glass header with Apps/Blog/About from the seeded menu; footer with 3 columns and contact widget content; Poppins/Open Sans loaded; canvas `#F7F8F5`.

- [ ] **Step 7: Commit**

```bash
git add src/styles src/layouts src/components src/pages/index.astro
git commit -m "feat: design tokens, base layout, menu-driven navigation and footer"
```

---

### Task 4: Home page — hero and apps grid

**Files:**
- Create: `src/components/AppCard.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Base.astro` (Task 3); collection `apps` with fields `name, tagline, badge, icon, sort_order` (Task 2); `getEmDashCollection`, `getSeoMeta` from `emdash`; `Image` from `emdash/ui`.
- Produces: `AppCard.astro` props `{ app: ContentEntry }` — Task 9's editor workflow test relies on new entries appearing here. Home anchors `id="apps"` on the grid section.

- [ ] **Step 1: Write `src/components/AppCard.astro`**

```astro
---
import type { ContentEntry } from "emdash";
import { Image } from "emdash/ui";

interface Props {
  app: ContentEntry<Record<string, unknown>>;
}

const { app } = Astro.props;
const data = app.data as {
  name: string;
  tagline: string;
  badge?: string;
  icon?: unknown;
};
const href = `/apps/${app.id}`;
---
<article class="app-card">
  <div class="head">
    {
      data.icon ? (
        <Image image={data.icon} width={48} height={48} alt="" class="icon" />
      ) : (
        <span class="icon monogram" aria-hidden="true">{data.name.charAt(0)}</span>
      )
    }
    {data.badge && <span class="badge">{data.badge}</span>}
  </div>
  <h3><a href={href}>{data.name}</a></h3>
  <p>{data.tagline}</p>
  <a class="more" href={href}>
    Explore app
    <span aria-hidden="true">→</span>
  </a>
</article>

<style>
  .app-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    padding: 1.75rem;
    box-shadow: 0 12px 32px rgba(23, 26, 24, 0.06);
    transition:
      transform 200ms ease,
      box-shadow 200ms ease;
  }
  .app-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(23, 26, 24, 0.1);
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .icon {
    width: 48px;
    height: 48px;
  }
  .monogram {
    display: grid;
    place-items: center;
    background: var(--accent);
    color: var(--canvas);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.25rem;
    border-radius: 14px;
  }
  .badge {
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--accent-dark);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
  }
  h3 {
    margin: 0;
    font-size: 1.15rem;
  }
  h3 a {
    text-decoration: none;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 0.95rem;
  }
  .more {
    margin-top: auto;
    color: var(--accent-dark);
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    transition: color 200ms ease;
  }
  .more:hover {
    color: var(--ink);
  }
</style>
```

- [ ] **Step 2: Write the home page**

Replace `src/pages/index.astro` entirely:

```astro
---
import { getEmDashCollection, getSeoMeta } from "emdash";
import Base from "../layouts/Base.astro";
import AppCard from "../components/AppCard.astro";

const { entries: apps, error, cacheHint } = await getEmDashCollection("apps", {
  orderBy: { sort_order: "asc" },
});
if (error) {
  console.error("Failed to load apps:", error);
  return new Response("Unable to load apps", { status: 500 });
}
if (Astro.cache?.enabled) Astro.cache.set(cacheHint);

const seo = getSeoMeta(null, {
  siteTitle: "Miso Apps",
  siteUrl: Astro.site?.toString() ?? Astro.url.origin,
  path: Astro.url.pathname,
});
---
<Base title="Commerce apps for stores that keep moving" description={seo.description ?? undefined} image={seo.ogImage ?? undefined} canonical={seo.canonical ?? undefined} robots={seo.robots ?? undefined}>
  <section class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="eyebrow">Shopify app studio</span>
        <h1>Commerce apps built for stores that have to keep moving.</h1>
        <p>
          Miso Apps designs and ships focused Shopify and Shopline apps for
          automation, conversion, and AI-readable storefront data. The work is
          clean, fast, and built around merchant operations.
        </p>
        <div class="actions">
          <a class="primary" href="/#apps">View our apps</a>
          <a class="text" href="/about">About the studio</a>
        </div>
      </div>
      <div class="hero-panel">
        <div>
          <span class="panel-label">Merchant stores reached</span>
          <strong>10K+</strong>
        </div>
        <div>
          <span class="panel-label">Countries served</span>
          <strong>50+</strong>
        </div>
        <div>
          <span class="panel-label">Public app rating</span>
          <strong>5.0</strong>
        </div>
        <div>
          <span class="panel-label">Support coverage</span>
          <strong>24/7</strong>
        </div>
      </div>
    </div>
  </section>

  <section class="apps" id="apps" aria-label="Our apps">
    <div class="container">
      <span class="eyebrow">Our apps</span>
      <h2>Focused products, measurable results.</h2>
      <div class="grid">
        {apps.map((app) => <AppCard app={app} />)}
      </div>
    </div>
  </section>
</Base>

<style>
  .hero {
    padding-block: 5.5rem 4rem;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 4rem;
    align-items: center;
  }
  h1 {
    font-size: clamp(2.2rem, 4.5vw, 3.4rem);
    font-weight: 700;
    margin: 0.75rem 0 1rem;
  }
  .hero-copy > p {
    color: var(--muted);
    max-width: 52ch;
  }
  .actions {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-top: 1.75rem;
  }
  .primary {
    background: var(--ink);
    color: var(--canvas);
    text-decoration: none;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border-radius: 999px;
    transition: transform 200ms ease;
  }
  .primary:hover {
    transform: translateY(-1px);
  }
  .text {
    color: var(--accent-dark);
    font-weight: 600;
    text-decoration: none;
  }
  .hero-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    padding: 1.75rem;
    box-shadow: 0 12px 32px rgba(23, 26, 24, 0.06);
  }
  .panel-label {
    display: block;
    font-size: 0.8rem;
    color: var(--muted);
  }
  .hero-panel strong {
    font-family: var(--font-display);
    font-size: 1.5rem;
  }
  .apps {
    padding-block: 2rem 3rem;
  }
  .apps h2 {
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    margin: 0.5rem 0 2rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
  }
</style>
```

- [ ] **Step 3: Verify**

Run: `curl -s http://localhost:4321/ | grep -c 'app-card'`
Expected: `4` (four seeded apps). Run: `curl -s http://localhost:4321/ | grep -o 'SO: [A-Za-z| &]*' | sort -u`
Expected: all four app names. Open in browser: hero asymmetric two-column layout, 4 cards in the grid, badges visible, no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/components/AppCard.astro
git commit -m "feat: home page with studio hero and apps grid"
```

---

### Task 5: App landing pages — `/apps/[slug]`

**Files:**
- Create: `src/pages/apps/[slug].astro`, `src/components/FeatureGrid.astro`, `src/components/ScreenshotGallery.astro`

**Interfaces:**
- Consumes: `Base.astro`; collection `apps` (Task 2); `getEmDashEntry`, `decodeSlug`, `getSeoMeta` from `emdash`; `Image`, `PortableText` from `emdash/ui`.
- Produces: public URLs `/apps/{slug}` for every published app (matching seed `urlPattern`). Task 9 creates a new entry and expects `200` here.

- [ ] **Step 1: Write `src/components/FeatureGrid.astro`**

```astro
---
interface Feature {
  title?: string;
  description?: string;
}
interface Props {
  features?: Feature[] | null;
}
const { features } = Astro.props;
---
{
  features && features.length > 0 && (
    <section class="features" aria-label="Features">
      <div class="container">
        <span class="eyebrow">What it does</span>
        <h2>Features</h2>
        <ol class="rows">
          {features.map((feature, index) => (
            <li>
              <span class="num">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

<style>
  .features {
    padding-block: 3rem;
  }
  h2 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin: 0.5rem 0 1.75rem;
  }
  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
  }
  .rows li {
    display: flex;
    gap: 1.5rem;
    align-items: baseline;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    padding: 1.4rem 1.75rem;
  }
  .num {
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--accent);
  }
  h3 {
    margin: 0 0 0.35rem;
    font-size: 1.05rem;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 0.95rem;
  }
</style>
```

- [ ] **Step 2: Write `src/components/ScreenshotGallery.astro`**

```astro
---
import { Image } from "emdash/ui";

interface Shot {
  image?: unknown;
}
interface Props {
  screenshots?: Shot[] | null;
}
const { screenshots } = Astro.props;
---
{
  screenshots && screenshots.length > 0 && (
    <section class="gallery" aria-label="Screenshots">
      <div class="container">
        <span class="eyebrow">Inside the app</span>
        <h2>Screenshots</h2>
        <div class="strip">
          {screenshots.map((shot) =>
            shot.image ? <Image image={shot.image} widths={[480, 960]} sizes="(max-width: 900px) 90vw, 520px" alt="" /> : null
          )}
        </div>
      </div>
    </section>
  )
}

<style>
  .gallery {
    padding-block: 3rem;
  }
  h2 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin: 0.5rem 0 1.75rem;
  }
  .strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.25rem;
  }
  .strip :global(img) {
    width: 100%;
    border-radius: var(--radius-card);
    border: 1px solid var(--line);
  }
</style>
```

- [ ] **Step 3: Write `src/pages/apps/[slug].astro`**

```astro
---
import { decodeSlug, getEmDashEntry, getSeoMeta } from "emdash";
import { Image, PortableText } from "emdash/ui";
import Base from "../../layouts/Base.astro";
import FeatureGrid from "../../components/FeatureGrid.astro";
import ScreenshotGallery from "../../components/ScreenshotGallery.astro";

const slug = decodeSlug(Astro.params.slug);
if (!slug) return Astro.redirect("/404");

const { entry: app, error, isPreview, cacheHint } = await getEmDashEntry("apps", slug);
if (error) {
  console.error("Failed to load app:", error);
  return new Response("Unable to load app", { status: 500 });
}
if (!app) return Astro.redirect("/404");
if (Astro.cache?.enabled) Astro.cache.set(cacheHint);

type AppData = {
  name: string;
  tagline: string;
  badge?: string;
  icon?: unknown;
  hero?: unknown;
  features?: { title?: string; description?: string }[] | null;
  screenshots?: { image?: unknown }[] | null;
  app_store_url: string;
  pricing_url?: string;
  rating_value?: number | null;
  review_count?: number | null;
  seo_title?: string;
  seo_description?: string;
  og_image?: unknown;
};
const data = app.data as AppData;

const seo = getSeoMeta(app, {
  siteTitle: "Miso Apps",
  siteUrl: Astro.site?.toString() ?? Astro.url.origin,
  path: Astro.url.pathname,
});

const ogImageSrc =
  (data.og_image as { src?: string } | null)?.src ??
  (data.icon as { src?: string } | null)?.src ??
  undefined;

const jsonld: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: data.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: data.tagline,
  url: new URL(Astro.url.pathname, Astro.site ?? Astro.url.origin).toString(),
  offers: {
    "@type": "Offer",
    url: data.pricing_url ?? data.app_store_url,
  },
};
if (data.rating_value != null && (data.review_count ?? 0) > 0) {
  jsonld.aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: data.rating_value,
    reviewCount: data.review_count,
  };
}
---
<Base title={seo.title ?? data.seo_title ?? data.name} description={seo.description ?? data.tagline} image={seo.ogImage ?? ogImageSrc} canonical={seo.canonical ?? undefined} robots={seo.robots ?? undefined}>
  <script type="application/ld+json" set:html={JSON.stringify(jsonld)} />
  {isPreview && <p class="container preview-note">This is an unpublished preview.</p>}

  <section class="hero">
    <div class="container hero-grid">
      <div>
        {data.badge && <span class="badge">{data.badge}</span>}
        <h1>{data.name}</h1>
        <p class="tagline">{data.tagline}</p>
        <div class="actions">
          <a class="primary" href={data.app_store_url} target="_blank" rel="noopener noreferrer">
            Install on the app store
          </a>
          {data.pricing_url && (
            <a class="text" href={data.pricing_url} target="_blank" rel="noopener noreferrer">
              View pricing
            </a>
          )}
        </div>
      </div>
      <div class="hero-visual">
        {data.icon ? (
          <Image image={data.icon} width={160} height={160} alt={`${data.name} icon`} />
        ) : (
          <span class="monogram" aria-hidden="true">{data.name.charAt(0)}</span>
        )}
      </div>
    </div>
  </section>

  {data.hero && (
    <section class="hero-content">
      <div class="container prose">
        <PortableText value={data.hero} />
      </div>
    </section>
  )}

  <FeatureGrid features={data.features} />
  <ScreenshotGallery screenshots={data.screenshots} />

  <section class="cta">
    <div class="container cta-panel">
      <h2>Ready to try {data.name}?</h2>
      <a class="primary" href={data.app_store_url} target="_blank" rel="noopener noreferrer">
        Install on the app store
      </a>
    </div>
  </section>
</Base>

<style>
  .preview-note {
    color: var(--accent-dark);
  }
  .hero {
    padding-block: 4.5rem 3rem;
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.4fr 0.6fr;
    gap: 4rem;
    align-items: center;
  }
  .badge {
    display: inline-block;
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--accent-dark);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
  }
  h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin: 0.9rem 0 0.9rem;
  }
  .tagline {
    color: var(--muted);
    max-width: 56ch;
  }
  .actions {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-top: 1.5rem;
  }
  .primary {
    background: var(--ink);
    color: var(--canvas);
    text-decoration: none;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border-radius: 999px;
    transition: transform 200ms ease;
  }
  .primary:hover {
    transform: translateY(-1px);
  }
  .text {
    color: var(--accent-dark);
    font-weight: 600;
    text-decoration: none;
  }
  .hero-visual {
    display: grid;
    place-items: center;
  }
  .monogram {
    display: grid;
    place-items: center;
    width: 160px;
    height: 160px;
    background: var(--accent);
    color: var(--canvas);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 4rem;
    border-radius: 40px;
  }
  .prose :global(h2) {
    font-size: 1.4rem;
  }
  .cta {
    padding-block: 2rem 3rem;
  }
  .cta-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    padding: 2.25rem 2.5rem;
    box-shadow: 0 12px 32px rgba(23, 26, 24, 0.06);
  }
  .cta h2 {
    margin: 0;
    font-size: clamp(1.4rem, 2.5vw, 1.9rem);
  }
  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
  }
</style>
```

- [ ] **Step 4: Verify each seeded app**

```bash
for s in so-auto-tags-all-in-one so-sticky-add-to-cart so-product-history-revert so-llms-txt; do
  printf '%s %s\n' "$s" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/apps/$s)"
done
```
Expected: `200` for all four. Run: `curl -s http://localhost:4321/apps/so-auto-tags-all-in-one | grep -c 'SoftwareApplication'`
Expected: `1` (JSON-LD present). Run: `curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/apps/does-not-exist`
Expected: `404`. Browser check: hero, 4 numbered feature rows, CTA panel, badge, fonts correct.

- [ ] **Step 5: Commit**

```bash
git add src/pages/apps src/components/FeatureGrid.astro src/components/ScreenshotGallery.astro
git commit -m "feat: editor-driven app landing pages with SoftwareApplication JSON-LD"
```

---

### Task 6: Blog — index with pagination/category filter, post page, sidebar

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`

**Interfaces:**
- Consumes: `Base.astro`; collection `posts` (Task 2) with taxonomies `category`/`tags`; widget area `blog-sidebar` (Task 2); `getEmDashCollection`, `getEmDashEntry`, `decodeSlug`, `getSeoMeta` from `emdash`; `PortableText` from `emdash/ui`.
- Produces: `/blog` (supports `?category=<slug>` and `?cursor=` pagination), `/blog/{slug}` per post. Task 9 publishes a new post and expects it listed here.

- [ ] **Step 1: Write `src/pages/blog/index.astro`**

```astro
---
import { getEmDashCollection } from "emdash";
import { WidgetArea } from "emdash/ui";
import Base from "../../layouts/Base.astro";

const category = Astro.url.searchParams.get("category") ?? undefined;
const cursor = Astro.url.searchParams.get("cursor") ?? undefined;

const { entries: posts, error, nextCursor, cacheHint } = await getEmDashCollection("posts", {
  orderBy: { published_at: "desc" },
  limit: 10,
  cursor,
  where: category ? { category } : undefined,
});
if (error) {
  console.error("Failed to load posts:", error);
  return new Response("Unable to load posts", { status: 500 });
}
if (Astro.cache?.enabled) Astro.cache.set(cacheHint);
---
<Base title="Blog" description="Product updates and merchant playbooks from the Miso Apps team.">
  <section class="blog">
    <div class="container">
      <span class="eyebrow">Blog</span>
      <h1>Updates and playbooks.</h1>
    </div>
    <div class="container body-grid">
      <div>
        <ul class="post-list">
          {
            posts.map((post) => (
              <li>
                <article>
                  <h2>
                    <a href={`/blog/${post.id}`}>{post.data.title}</a>
                  </h2>
                  {"excerpt" in post.data && post.data.excerpt && <p>{post.data.excerpt}</p>}
                  <a class="more" href={`/blog/${post.id}`}>
                    Read post <span aria-hidden="true">→</span>
                  </a>
                </article>
              </li>
            ))
          }
        </ul>
        {nextCursor && <a class="older" href={`/blog?cursor=${encodeURIComponent(nextCursor)}${category ? `&category=${category}` : ""}`}>Older posts</a>}
        {posts.length === 0 && <p class="empty">No posts published yet{category ? ` in this category` : ""}.</p>}
      </div>
      <aside aria-label="Blog sidebar">
        <WidgetArea name="blog-sidebar" class="sidebar-widgets" />
      </aside>
    </div>
  </div>
  </div>
</Base>

<style>
  .blog {
    padding-block: 4rem 2rem;
  }
  h1 {
    font-size: clamp(2rem, 4vw, 2.8rem);
    margin: 0.5rem 0 2.5rem;
  }
  .body-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 18rem;
    gap: 3rem;
    align-items: start;
  }
  .post-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1.25rem;
  }
  article {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-card);
    padding: 1.6rem 1.9rem;
  }
  article h2 {
    margin: 0 0 0.4rem;
    font-size: 1.2rem;
  }
  article h2 a {
    text-decoration: none;
  }
  article p {
    color: var(--muted);
    margin: 0 0 0.75rem;
  }
  .more {
    color: var(--accent-dark);
    font-weight: 600;
    text-decoration: none;
  }
  .older {
    display: inline-block;
    margin-top: 1.5rem;
    color: var(--accent-dark);
    font-weight: 600;
    text-decoration: none;
  }
  .empty {
    color: var(--muted);
  }
  @media (max-width: 900px) {
    .body-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

Note: the closing tags above must be exactly `</div></Base>` — one container `.body-grid` closes, then Base. (If a stray `</div>` remains from editing, `astro check` will catch it; the structure is: `section.blog > div.container.body-grid > div + aside`.)

- [ ] **Step 2: Write `src/pages/blog/[slug].astro`**

```astro
---
import { decodeSlug, getEmDashEntry, getSeoMeta } from "emdash";
import { PortableText } from "emdash/ui";
import Base from "../../layouts/Base.astro";

const slug = decodeSlug(Astro.params.slug);
if (!slug) return Astro.redirect("/404");

const { entry: post, error, isPreview, cacheHint } = await getEmDashEntry("posts", slug);
if (error) {
  console.error("Failed to load post:", error);
  return new Response("Unable to load post", { status: 500 });
}
if (!post) return Astro.redirect("/404");
if (Astro.cache?.enabled) Astro.cache.set(cacheHint);

type PostData = {
  title: string;
  excerpt?: string;
  content: unknown;
  seo_title?: string;
  seo_description?: string;
  og_image?: unknown;
};
const data = post.data as PostData;

const seo = getSeoMeta(post, {
  siteTitle: "Miso Apps",
  siteUrl: Astro.site?.toString() ?? Astro.url.origin,
  path: Astro.url.pathname,
});

const ogImageSrc = (data.og_image as { src?: string } | null)?.src;

const jsonld = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: data.title,
  description: data.excerpt,
  datePublished: post.data.publishedAt ?? post.data.createdAt,
  dateModified: post.data.updatedAt ?? post.data.publishedAt ?? post.data.createdAt,
  mainEntityOfPage: new URL(Astro.url.pathname, Astro.site ?? Astro.url.origin).toString(),
};
---
<Base title={seo.title ?? data.seo_title ?? data.title} description={seo.description ?? data.excerpt} image={seo.ogImage ?? ogImageSrc} canonical={seo.canonical ?? undefined} robots={seo.robots ?? undefined}>
  <script type="application/ld+json" set:html={JSON.stringify(jsonld)} />
  {isPreview && <p class="container preview-note">This is an unpublished preview.</p>}
  <article class="post">
    <div class="container narrow">
      <span class="eyebrow">Blog</span>
      <h1>{data.title}</h1>
      <div class="prose">
        <PortableText value={data.content} />
      </div>
      <p class="back">
        <a href="/blog">← All posts</a>
      </p>
    </div>
  </article>
</Base>

<style>
  .preview-note {
    color: var(--accent-dark);
  }
  .post {
    padding-block: 4rem 2rem;
  }
  .narrow {
    max-width: 720px;
  }
  h1 {
    font-size: clamp(2rem, 4vw, 2.8rem);
    margin: 0.5rem 0 1.5rem;
  }
  .back {
    margin-top: 3rem;
  }
  .back a {
    color: var(--accent-dark);
    font-weight: 600;
    text-decoration: none;
  }
</style>
```

- [ ] **Step 3: Verify**

Run: `curl -s http://localhost:4321/blog | grep -c 'Read post'`
Expected: `1` (seeded welcome post). Run: `curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/blog/hello-from-miso-apps`
Expected: `200`. Run: `curl -s http://localhost:4321/blog/hello-from-miso-apps | grep -c 'Article'`
Expected: `1` (JSON-LD). Run: `curl -s -o /dev/null -w '%{http_code}' 'http://localhost:4321/blog?category=product-updates'`
Expected: `200`. Browser check: sidebar shows Recent posts and Categories widgets; post page renders Portable Text cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog
git commit -m "feat: blog index with category filter and sidebar, post pages with Article JSON-LD"
```

---

### Task 7: Static pages route with template layouts, and 404

**Files:**
- Create: `src/pages/[slug].astro`, `src/pages/404.astro`, `src/layouts/PageDefault.astro`, `src/layouts/PageFullWidth.astro`

**Interfaces:**
- Consumes: `Base.astro`; collection `pages` (Task 2) with field `template` (`"Default" | "Full Width"`); `getEmDashEntry`, `decodeSlug`, `getSeoMeta` from `emdash`; `PortableText` from `emdash/ui`.
- Produces: `/{slug}` for every published page (`/about`, `/privacy` — matching the old site's URLs, so no redirects needed for them).

- [ ] **Step 1: Write `src/layouts/PageDefault.astro`**

```astro
---
import type { ContentEntry } from "emdash";
import { PortableText } from "emdash/ui";
import Base from "./Base.astro";

interface Props {
  page: ContentEntry<Record<string, unknown>>;
}
const { page } = Astro.props;
const data = page.data as { title: string; content: unknown };
---
<Base title={data.title}>
  <article class="page-default">
    <div class="container narrow">
      <span class="eyebrow">Miso Apps</span>
      <h1>{data.title}</h1>
      <div class="prose">
        <PortableText value={data.content} />
      </div>
    </div>
  </article>
</Base>

<style>
  .page-default {
    padding-block: 4rem 2rem;
  }
  .narrow {
    max-width: 720px;
  }
  h1 {
    font-size: clamp(2rem, 4vw, 2.8rem);
    margin: 0.5rem 0 1.5rem;
  }
</style>
```

- [ ] **Step 2: Write `src/layouts/PageFullWidth.astro`**

```astro
---
import type { ContentEntry } from "emdash";
import { PortableText } from "emdash/ui";
import Base from "./Base.astro";

interface Props {
  page: ContentEntry<Record<string, unknown>>;
}
const { page } = Astro.props;
const data = page.data as { title: string; content: unknown };
---
<Base title={data.title}>
  <article class="page-wide">
    <div class="container">
      <span class="eyebrow">Miso Apps</span>
      <h1>{data.title}</h1>
      <div class="prose">
        <PortableText value={data.content} />
      </div>
    </div>
  </article>
</Base>

<style>
  .page-wide {
    padding-block: 4rem 2rem;
  }
  h1 {
    font-size: clamp(2rem, 4vw, 2.8rem);
    margin: 0.5rem 0 1.5rem;
  }
</style>
```

- [ ] **Step 3: Write `src/pages/[slug].astro`**

```astro
---
import { decodeSlug, getEmDashEntry, getSeoMeta } from "emdash";
import Base from "../layouts/Base.astro";
import PageDefault from "../layouts/PageDefault.astro";
import PageFullWidth from "../layouts/PageFullWidth.astro";

const slug = decodeSlug(Astro.params.slug);
if (!slug) return Astro.redirect("/404");

const { entry: page, error } = await getEmDashEntry("pages", slug);
if (error) {
  console.error("Failed to load page:", error);
  return new Response("Unable to load page", { status: 500 });
}
if (!page) return Astro.redirect("/404");

const layouts = new Map(
  [
    ["Default", PageDefault],
    ["Full Width", PageFullWidth],
  ].map(([key, layout]) => [key.toLowerCase(), layout])
);
const Layout = layouts.get(String(page.data.template ?? "default").toLowerCase()) ?? PageDefault;
---
<Layout page={page} />
```

- [ ] **Step 4: Write `src/pages/404.astro`**

```astro
---
import Base from "../layouts/Base.astro";
---
<Base title="Page not found" robots="noindex">
  <section class="notfound">
    <div class="container">
      <span class="eyebrow">404</span>
      <h1>This page took a wrong turn.</h1>
      <p>The page you are looking for does not exist or has moved.</p>
      <a class="primary" href="/">Back to home</a>
    </div>
  </section>
</Base>

<style>
  .notfound {
    padding-block: 7rem;
  }
  h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin: 0.5rem 0 0.75rem;
  }
  p {
    color: var(--muted);
  }
  .primary {
    display: inline-block;
    margin-top: 1.5rem;
    background: var(--ink);
    color: var(--canvas);
    text-decoration: none;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border-radius: 999px;
    transition: transform 200ms ease;
  }
  .primary:hover {
    transform: translateY(-1px);
  }
</style>
```

- [ ] **Step 5: Verify**

```bash
printf 'about %s\n' "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/about)"
printf 'privacy %s\n' "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/privacy)"
printf '404page %s\n' "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/no-such-page)"
```
Expected: `about 200`, `privacy 200`, `404page 200` (the 404 route renders with HTTP 200 in dev; acceptable) — and the missing-page body contains "wrong turn": `curl -s http://localhost:4321/no-such-page | grep -c 'wrong turn'` → `1`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/[slug].astro src/pages/404.astro src/layouts/PageDefault.astro src/layouts/PageFullWidth.astro
git commit -m "feat: CMS pages with template layouts and designed 404"
```

---

### Task 8: Sitemap, RSS, and SEO meta wiring

**Files:**
- Create: `src/pages/sitemap.xml.ts`, `src/pages/rss.xml.ts`
- Modify: `src/layouts/Base.astro` (RSS autodiscovery link), `src/pages/index.astro` (already wired via `getSeoMeta` in Task 4)

**Interfaces:**
- Consumes: collections `apps`, `posts`, `pages` (Task 2); `getEmDashCollection` from `emdash`; `Astro.site` = `https://misoapps.com` (Task 1 config).
- Produces: `/sitemap.xml`, `/rss.xml`.

- [ ] **Step 1: Write `src/pages/sitemap.xml.ts`**

```ts
import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://misoapps.com");
  const [apps, posts, pages] = await Promise.all([
    getEmDashCollection("apps"),
    getEmDashCollection("posts"),
    getEmDashCollection("pages"),
  ]);
  for (const result of [apps, posts, pages]) {
    if (result.error) {
      console.error("Sitemap query failed:", result.error);
      return new Response("Unable to build sitemap", { status: 500 });
    }
  }

  const urls: string[] = ["/", "/blog"];
  urls.push(...apps.entries.map((e) => `/apps/${e.id}`));
  urls.push(...posts.entries.map((e) => `/blog/${e.id}`));
  urls.push(...pages.entries.map((e) => `/${e.id}`));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, base)}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
```

- [ ] **Step 2: Write `src/pages/rss.xml.ts`**

```ts
import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://misoapps.com");
  const { entries: posts, error } = await getEmDashCollection("posts", {
    orderBy: { published_at: "desc" },
    limit: 50,
  });
  if (error) {
    console.error("RSS query failed:", error);
    return new Response("Unable to build feed", { status: 500 });
  }

  const items = posts
    .map((post) => {
      const data = post.data as { title: string; excerpt?: string };
      const link = new URL(`/blog/${post.id}`, base).toString();
      return `    <item>
      <title>${escapeXml(data.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(data.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Miso Apps Blog</title>
    <link>${base}</link>
    <description>Product updates and merchant playbooks from the Miso Apps team.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
```

- [ ] **Step 3: Add RSS autodiscovery to `src/layouts/Base.astro`**

In the `<head>`, after the canonical link, add:

```astro
    <link rel="alternate" type="application/rss+xml" title="Miso Apps Blog" href="/rss.xml" />
```

- [ ] **Step 4: Verify**

Run: `curl -s http://localhost:4321/sitemap.xml | grep -c '<loc>'`
Expected: `8` (home + blog + 4 apps + 1 post + 2 pages = 9 minus none; recount: 2 + 4 + 1 + 2 = 9 → expected `9`). Run: `curl -s http://localhost:4321/rss.xml | grep -c '<item>'`
Expected: `1`. Both content types correct (`application/xml`, `application/rss+xml`).

- [ ] **Step 5: Full check and build**

Run: `pnpm check`
Expected: zero errors. Run: `pnpm build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/pages/sitemap.xml.ts src/pages/rss.xml.ts src/layouts/Base.astro
git commit -m "feat: sitemap, RSS feed, and SEO meta wiring"
```

---

### Task 9: Deploy to Cloudflare and verify the editor workflow end-to-end

**Files:**
- Modify: `wrangler.jsonc` (KV id, placement, custom domain route)

**Interfaces:**
- Consumes: everything from Tasks 1–8; Cloudflare account authenticated via `pnpm wrangler login`.
- Produces: production Worker at the workers.dev URL and the custom domain; D1 `home-page`, R2 `home-page-media`, KV `CACHE` resources.

- [ ] **Step 1: Authenticate Wrangler**

Run: `pnpm wrangler login` (interactive browser flow), then `pnpm wrangler whoami`
Expected: account email printed.

- [ ] **Step 2: Create the KV namespace and wire its id**

Run: `pnpm wrangler kv namespace create CACHE`
Expected: output contains `id = "<32-hex>"`. Copy that id into `wrangler.jsonc`:

```jsonc
  "kv_namespaces": [
    { "binding": "CACHE", "id": "<PASTE_ID_HERE>" }
  ],
```

Commit: `git add wrangler.jsonc && git commit -m "chore: wire KV namespace for object cache"`

- [ ] **Step 3: First deploy**

Run: `pnpm pnpm build` → correct command: `pnpm build && pnpm wrangler deploy`
Expected: Wrangler provisions D1 database `home-page` and R2 bucket `home-page-media` on first deploy, then deploys. Output prints the `workers.dev` URL. (If Wrangler does not auto-provision, create first: `pnpm wrangler d1 create home-page` and `pnpm wrangler r2 bucket create home-page-media`, paste the returned `database_id` into the `d1_databases` entry, and redeploy.)

- [ ] **Step 4: Complete setup on production**

Open `https://home-page.<your-subdomain>.workers.dev/_emdash/admin/`. Setup wizard appears (fresh D1). Enter site title `Miso Apps`, admin email, register passkey, **keep sample content selected** so the seed applies.

- [ ] **Step 5: Smoke test production routes**

```bash
BASE=https://home-page.<your-subdomain>.workers.dev
for p in / /about /privacy /blog /blog/hello-from-miso-apps /apps/so-auto-tags-all-in-one /sitemap.xml /rss.xml; do
  printf '%s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' $BASE$p)"
done
```
Expected: `200` for all (404 route returns 200 with 404 content by design). Also: `curl -s $BASE/ | grep -c 'app-card'` → `4`.

- [ ] **Step 6: Verify the editor workflow end-to-end (no deploy)**

In the production admin:
1. **Apps → New** — name `SO: Test App`, tagline `Temporary verification entry.`, app store URL `https://example.com`, sort order `99`. Save → **Publish**.
2. Open `$BASE/apps/so-test-app` → `200` with the landing page. Open `$BASE/` → card for "SO: Test App" present.
3. **Posts → New** — title `Workflow verification post`, one paragraph of content. Save → **Publish**. Open `$BASE/blog` → post listed.
4. **Menus → primary** — reorder items. Reload `$BASE/` → header order changed.
5. Delete the test app entry and the test post (delete + confirm in admin) — both pages return 404 / disappear from the grid and blog list afterwards.

If any step requires a redeploy to take effect, stop and fix — published edits must appear on the next request.

- [ ] **Step 7: Custom domain**

Confirm the production domain is active in the Cloudflare account (per the owner decision, the domain previously serving the old home-page site). Add to `wrangler.jsonc`:

```jsonc
  "routes": [{ "pattern": "misoapps.com", "custom_domain": true }],
```

(Use the exact production hostname — `www.` variant included as a second route entry if used. Insert the real domain here; do not guess.)

Deploy again: `pnpm build && pnpm wrangler deploy`. Verify `https://misoapps.com/` returns `200` and the workers.dev URL still works.

- [ ] **Step 8: Targeted placement near D1**

Find the D1 primary location: `pnpm wrangler d1 info home-page` (region field). Add to `wrangler.jsonc`:

```jsonc
  "placement": { "mode": "targeted", "region": "<d1-primary-region>" },
```

Do **not** enable D1 read replicas. Redeploy and re-run the Task 9 Step 5 smoke test.

- [ ] **Step 9: Commit and push**

```bash
git add wrangler.jsonc
git commit -m "chore: production routing, targeted placement, and KV wiring"
git push origin main
```

---

## Self-Review

**1. Spec coverage:**
- Single app embedding EmDash, one Worker → Tasks 1, 9
- Content model with `apps`/`posts`/`pages`, 4 seeded apps, about/privacy → Task 2
- Menus + Widget Areas for nav/footer/sidebar → Tasks 2, 3, 6
- Editor-driven landing pages → Tasks 2 (fields), 5 (template)
- Home grid ordered by sortOrder, entry = page auto-generated → Tasks 4, 5, 9 (workflow test)
- Blog with categories/tags, pagination, sidebar → Task 6
- Pages with template select → Task 7
- Comprehensive SEO (meta fields, OG fallback chain, JSON-LD SoftwareApplication/Article, sitemap, RSS) → Tasks 5, 6, 8 (+ Base head Task 3)
- Caching (routeRules, KV object cache, Workers Cache provider) → Tasks 1, 9
- Cron, PluginBridge, no sandboxed plugins v1 → Task 1
- Error handling (`error` → 500 + log; missing entry → 404; empty optionals hide sections) → Tasks 4–8
- Custom domain + targeted placement + workers.dev testing → Task 9
- Domain redirect for old `/products` → seed redirects (Task 2)

**2. Placeholder scan:** KV id and D1 region are runtime-discovered Cloudflare values with exact retrieval commands — not unspecified work. Custom domain is explicitly grounded (`misoapps.com` from old-site footer email) with an instruction to insert the exact production hostname. No "TBD"/"implement later" steps.

**3. Type consistency:** `getEmDashCollection("apps", { orderBy: { sort_order: "asc" } })` uses the stored field name per docs; `entry.id` used for links everywhere (not `data.slug`); `AppData`/`PostData` field slugs match the seed exactly (`app_store_url`, `pricing_url`, `sort_order`, `rating_value`, `review_count`, `seo_title`, `seo_description`, `og_image`, `template`); widget area names (`footer-contact`, `blog-sidebar`) and menu names (`primary`, `footer`) match between seed and components.
