# Miso Apps Website — Astro + EmDash CMS Rebuild

Date: 2026-09-19
Status: Approved design, pending implementation plan

## Context

The current `home-page` repo is a React Router 7 (framework mode) + Tailwind 4 site deployed to Cloudflare Workers. It markets four Shopify apps: SO: Auto Tags | All-in-One, SO: Sticky Add To Cart, SO: Product History & Revert, and SO: llms.txt.

The team is moving to EmDash CMS for three goals: a landing home page, per-app landing pages, and a blog. EmDash is Astro-native: it runs inside an Astro application, provides an editor-facing admin panel, and serves content to Astro pages at request time. EmDash explicitly does not fit non-Astro projects, so the site is rebuilt on Astro 6.

Decisions made with the owner:

- **Replacement strategy:** archive branch `archive/react-router-site` holds the old code (created at commit 1ee6278); `main` is reset to a fresh Astro + EmDash project.
- **Deployment:** Cloudflare Workers with D1 (content), R2 (media), KV (object cache).
- **Content language:** English only.
- **App catalog:** the 4 current apps as seeded entries, with the structure open for future apps (editor creates an entry → landing page appears, no deploy).
- **Blog:** EmDash built-in `posts` collection with categories and tags.
- **Design:** custom theme ported from `DESIGN.md` (Miso design system). No marketplace theme.
- **Domain:** reuse the current home-page production domain; keep the `workers.dev` URL for testing.
- **Navigation:** EmDash Menus for header/footer; Widget Areas for footer columns and blog sidebar.
- **Landing pages:** editor-driven — one Astro template renders any app from its fields; Sections library for reusable Portable Text blocks.
- **SEO:** comprehensive — per-entry SEO field groups (meta title, meta description, OG image), sitemap.xml, RSS feed, JSON-LD (SoftwareApplication on app landing pages, Article on blog posts).

## Architecture

Single Astro application embedding EmDash, deployed as one Cloudflare Worker.

```
home-page/
├── astro.config.mjs        # output: server, @astrojs/cloudflare, react(), emdash()
├── wrangler.jsonc          # DB (D1), MEDIA (R2), CACHE (KV), cron, targeted placement
├── src/
│   ├── worker.ts           # handler + createScheduledHandler + PluginBridge export
│   ├── live.config.ts      # _emdash live collection via emdashLoader()
│   ├── layouts/            # Base, PageDefault, PageFullWidth, LandingPage (app)
│   ├── pages/              # index, apps/[slug], blog, blog/[slug], pages/[slug], 404
│   ├── components/         # Hero, FeatureGrid, ScreenshotGallery, CTA, AppCard, Nav, Footer
│   ├── styles/             # design tokens from DESIGN.md as CSS custom properties
│   └── lib/seo.ts          # meta/OG/JSON-LD/sitemap/RSS helpers
```

Stack configuration:

- Astro 6, `output: "server"`, `@astrojs/cloudflare` adapter, `@astrojs/react` (required by the EmDash admin UI).
- `emdash({ database: d1({ binding: "DB" }), storage: r2({ binding: "MEDIA" }), objectCache: kvCache({ binding: "CACHE" }) })`.
- Workers Cache via `cacheCloudflare()` provider with explicit `routeRules` (public pages `maxAge: 300, swr: 86400`). Every public route sets an explicit `Cache-Control`. Admin/API responses are `no-store` by EmDash.
- `wrangler.jsonc`: D1 binding `DB`, R2 binding `MEDIA`, KV binding `CACHE`, `worker_loaders` LOADER binding omitted in v1 (no sandboxed plugins), cron `* * * * *` for scheduled publishing, `placement.mode: "targeted"` near the D1 primary, `nodejs_compat` flag, custom domain route.
- `PluginBridge` exported from `src/worker.ts` so sandboxed plugins can be enabled later.
- Cloudflare Images binding (`IMAGES`) for R2 media transformation; free tier 5,000 unique transformations/month is sufficient.

## Content Model

Defined in `.emdash/seed.json` so a fresh D1 database boots with the complete model.

| Collection | Purpose | Fields |
|---|---|---|
| `apps` | App catalog + landing content | name, slug, tagline, hero (Portable Text), icon (media), features (repeater: title, description, icon), screenshots (media gallery), appStoreUrl, pricingUrl, badge, sortOrder, SEO group (metaTitle, metaDescription, ogImage) |
| `posts` | Blog (EmDash built-in) | title, content (Portable Text), category, tags, featured image, SEO group |
| `pages` | About, Privacy | title, content (Portable Text), template select (Default / Full Width), SEO group |

- The four current apps ship as seeded entries with real marketing copy ported from the old site (`products.tsx`).
- Home page renders the `apps` collection ordered by `sortOrder`; a new entry appears in the home grid and at `/apps/[slug]` immediately after publish.
- Site Settings holds site name, logo, social links, default OG image.

## Routes & Rendering

All routes server-rendered (no prerender) so published edits appear on the next request.

| Route | Content source | Behavior |
|---|---|---|
| `/` | `apps` ordered by sortOrder + Site Settings | Studio hero + asymmetric app grid |
| `/apps/[slug]` | `getEmDashEntry("apps", slug)` | LandingPage template: hero → features → screenshots → pricing/App Store CTAs; missing or draft entry → 404 |
| `/blog` | `getEmDashCollection("posts")` | Paginated list, category filter, WidgetArea sidebar (recent posts, categories, search) |
| `/blog/[slug]` | posts entry | Portable Text rendering, JSON-LD Article |
| `/pages/[slug]` | pages entry | Layout map from `template` field (Default / Full Width) |
| `/404` | static | Designed per Miso design system |
| `/sitemap.xml` | all published entries | sitemap |
| `/rss.xml` | posts | RSS feed |

## SEO

- Per-entry SEO field groups surface into `<title>`, meta description, and Open Graph/Twitter tags.
- Missing ogImage falls back to the app icon, then the site default OG image.
- JSON-LD: `SoftwareApplication` (with aggregateRating when available) on app landing pages; `Article` with author/date on blog posts.
- `sitemap.xml` and `/rss.xml` generated from published entries at request time.

## Error Handling

- EmDash queries return `{ entries, error }` / `{ entry, error }`; an `error` throws in the route → 500 with logs, never a silent empty page.
- Empty optional fields hide their sections (no broken layout): no screenshots → section omitted; no features → grid omitted.
- Media served through the R2 binding; transformation failures degrade to serving originals on the internal media route.

## Verification

- `astro build` then `wrangler deploy` to the `workers.dev` URL; smoke test each route.
- Editor workflow end-to-end: create app entry in admin → `/apps/[slug]` appears → home grid updates; publish post → `/blog` updates; edit menu in admin → header/footer update.
- `emdash-env.d.ts` generated declarations typecheck collection names and fields.

## Out of Scope (v1)

- Sandboxed plugins and marketplace plugins.
- i18n (English only).
- Comments, newsletter, search backend beyond the EmDash `/search` widget target.
- Migration tooling (WordPress or otherwise); the 4 apps are seeded directly.
