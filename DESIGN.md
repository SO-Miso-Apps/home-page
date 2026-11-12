# Design System: Miso Apps — "Studio"

Living document for the marketing site at `misoapps.com` (Astro + EmDash, deployed as a
Cloudflare Worker). It describes the system as built — when the system changes, this file
changes with it.

## Visual Theme

A small Shopify studio whose main trade is theme design and customization. The page has to
answer "can these people make my store look and work the way I want" — so it leads with real
storefronts it has worked on, then the theme service, and only then the studio's own apps.

The look is a monochrome studio, benchmarked against the theme studios merchants already
compare us with (Clean Canvas, Maestrooo, FoxEcom, Pixel Union): a near-white ground,
near-black ink, black blocks for weight, and one accent — Miso orange — used sparingly. One
grotesk family set large and tight carries the voice; shapes are crisp rather than soft.

Three ideas drive the layout:

1. **Colour blocks over hairlines.** Sections are trays and cards filled with a tone, not boxes
   drawn with 1px rules. A rule appears only inside a block, to separate rows.
2. **Proof first.** The home page order is hero → recent work (live storefronts) → theme
   services → pricing → process → apps → reviews → FAQ → CTA. Theme work leads every list it
   appears in.
3. **One emphasis per headline.** Display headings set one word or phrase in orange
   (`{ before, em, after }` copy rendered with `<em>`, never `set:html`). It stays upright —
   Geist has no italic, and a synthesised slant looks broken.

## Voice

Short and assertive, like the studios we sit next to. Headlines are a few words and usually
end in a full stop ("Live stores. Real themes.", "Four steps. You sign off on each.").
Supporting copy is one or two plain sentences. Buttons are two or three words ("Get a quote",
"See the work"). Never trade a fact for a slogan: the content rules below still apply.

## Token Architecture

`src/styles/global.css` holds two tiers and nothing in a component may skip tier two.

- **Primitives** — radii, type families, steps and tracking, spacing, motion curves, layer
  scale. Never referenced for colour.
- **Semantic roles** — `--canvas`, `--surface`, `--ink`, `--brand`, the tone tokens, `--line`,
  `--shadow-*`. This is the only colour vocabulary components use.

### Theming

Light is the default; dark is opt-in through `[data-theme="dark"]` on `<html>`. The attribute
is written by a small inline script in `Base.astro` **before first paint**, resolving
`localStorage["miso-theme"]` first and `prefers-color-scheme` second. Consequences:

- One source of truth for the dark palette — no duplicated `@media (prefers-color-scheme:
  dark)` token block to keep in sync.
- No flash of the wrong theme, because CSS never guesses.
- `<script>`-disabled visitors get light, which is a complete design.
- `ThemeToggle` reads `aria-pressed` from the same attribute, so the control is correct on the
  first frame.

Dark mode is "lights off": a near-black ground (never `#000`), the orange lifted a step, and
the night block raised above the canvas (`#262624`) so it still reads as a block.

## Palette

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#f6f6f3` | `#0f0f0e` |
| Surface | `#ffffff` | `#181817` |
| Ink | `#121212` | `#f4f4f0` |
| Ink muted | `#55534e` | `#b0afa8` |
| Ink subtle | `#64625c` | `#9d9c95` |
| Brand (fills, display text) | `#f05a1a` | `#ff6b2c` |
| Brand fg (text on brand) | `#121212` | `#121212` |
| Brand ink (small text) | `#b83f0c` | `#ff7a3d` |
| Tint / tint ink / tint muted | `#fde8dc` / `#121212` / `#4f4640` | `#2e1a10` / `#f6ece5` / `#d6c4b8` |
| Mist / mist line | `#ecebe6` / `#d9d7cf` | `#1c1c1a` / `#2f2f2c` |
| Night / ink / muted / accent | `#121212` / `#f4f4f0` / `#a9a8a2` / `#ff7a3d` | `#262624` / `#f4f4f0` / `#b0afa8` / `#ff7a3d` |
| Danger (form errors only) | `#b4232a` | `#f78f8a` |

There is one accent, the orange. It is bright, so **text on an orange fill is ink, not white**
(5.5:1). `--brand` on its own is for fills and display-size type (3.1:1 on the canvas, large
text only); `--brand-ink` is the small-text variant that clears AA on canvas, mist and tint.

### Tones

A block takes a tone class, never raw tone colours:

| Class | Ground | Text | Muted text |
| --- | --- | --- | --- |
| `.tone-tint` | `--tint` | `--tint-ink` | `--tone-muted` = `--tint-muted` |
| `.tone-mist` | `--mist` | `--ink` | `--tone-muted` = `--ink-muted` |
| `.tone-night` | `--night` | `--night-ink` | `--tone-muted` = `--night-muted` |

Inside a toned block, secondary text uses `var(--tone-muted)` — never `--ink-muted`, which is
tuned for the canvas. Where tones repeat in a list (app cards, app marks) they cycle tint →
night → brand → mist so neighbours never match.

`--danger` is the one hue outside the brand: the message under a failed field and that field's
border. Marketing copy never uses it.

## Typography

| Purpose | Family | Notes |
| --- | --- | --- |
| Display | Geist 600 | tracking `--track-hero` −0.045em, `--track-display` −0.035em (h1/h2), `--track-heading` −0.02em |
| Body | Geist 400–600 | 1.65–1.7 line-height, 60ch measure |
| Eyebrows, labels, numerals | Geist Mono | uppercase + 0.06em for eyebrows, `tabular-nums` |

Both families ship a Vietnamese subset (checked against the Google Fonts CSS API), so
diacritics never fall back mid-word. Many grotesks the reference studios use — Satoshi, Clash
Display, Matter — have no Vietnamese and are off the table. The fluid scale is `--step--1`
through `--step-5` plus `--step-hero`, all `clamp()`-based. Headings use `text-wrap: balance`,
paragraphs `text-wrap: pretty`.

## Components

- **`BrandMark`** — the logo: a miso bowl whose two curls of steam form an "m", drawn as an
  inline SVG in `currentColor` (brand orange) next to the Geist "Miso Apps" wordmark.
  `public/favicon.svg` and `public/apple-touch-icon.png` are the same mark reversed out of an
  near-black rounded tile, the bowl in orange. Decorative dots are plain circles.
- **`.band`** — a mist tray inset from the viewport edge (`--r-2xl`). Used for the process
  section, the request form on `/services`, and the footer (top corners only).
- **`.eyebrow`** — mono, brand-ink, with an orange dot. There is no kicker pill above the
  hero headline; the headline opens the page.
- **Buttons** — all pills, ≥44px tall. `.btn--primary` (ink) leads the hero and the header;
  `.btn--brand` (orange, ink text) is the one accent action per view (CTA panel, featured plan,
  first service track); `.btn--ghost` is mist with a mist-line border; `.btn--quiet` is a text
  link with an arrow.
- **Hero** (home) — a night panel inset like a band (`--r-2xl`). Left: the headline, lede, an
  orange "Get a quote" and a hairline-outline "See the work", then a proof line under a rule —
  the number of storefronts in `src/work.ts` and the App Store rating from `summarizeRatings`
  (`src/lib/ratings.ts`, shared with `ReviewBand`; hidden when no app is rated). Right: a wall
  of the same storefront captures in three tilted columns that bleed off the panel and fade
  into it, with the demo product page on a phone in front. The columns slide in on load and
  drift apart on scroll (`data-wall-col`); the wall is `aria-hidden`, the work section carries
  the content. Below 960px the wall stacks under the copy.
- **Service cards** (home) — each card ends in a 3:2 demo-store screenshot pinned to the card
  foot so the three line up: collection page, a section being dragged in the editor, a product
  page with a visible focus ring.
- **Work cards** (`src/work.ts`) — real storefront captures in `public/work/`, domain, one-line
  description, theme name, outbound link. Facts only; no results or scope claims until the
  client agrees to them being public.
- **`ServiceTracks`** — one numbered card per track from `src/services.ts`, opening with a
  16:10 demo screenshot keyed by track id (editor section picker; a demo admin app). The first track
  (theme work) is tint with a brand button, the rest mist with an ink button; buttons pin to
  the card foot so they line up across the row.
- **`AppMark`** — a rounded tile with one abstract glyph, toned via `tone="brand|tint|night|
  mist"`. A placeholder, not a claim about the app's real icon.
- **`ReviewBand`** — a tint block; numbers come from `getRating` / `summarizeRatings`
  (`src/lib/ratings.ts`). An app with no reviews reads "No reviews yet", never a made-up score.
- **App page hero** (`/apps/[slug]`) — the home hero's night panel: badge as an orange mono
  eyebrow, name, tagline, an orange install button and an outline pricing button, then the
  rating (large value, stars, a link to the listing's reviews page) under a rule. Right: up to
  three listing screenshots fanned behind the app icon; with no listing media, the icon alone.
- **`Faq`** — native `<details>` as mist cards; the open item's icon turns tint and rotates.
- **`CtaPanel`** — a night block that closes the home and app pages. With `showcase` (home only)
  the demo store's home page sits under the button in a browser window that rises from the
  panel's bottom edge, and from 1100px up two tilted phone screens (collection, cart) flank
  the copy; all decorative, with empty `alt` inside `aria-hidden` wrappers.

## Layout

- Container 1240px, gutter `clamp(1rem, 4vw, 2rem)`, narrow container 780px for prose.
- Section rhythm `--section-y` = `clamp(4rem, 9vw, 7.5rem)`; `.section--tight` for short ones.
- Cards sit in grids with `0.625–1rem` gaps — tight enough that a row reads as one group.
- Two columns at most for services, apps and features; four for the process steps on desktop.
- Every anchor a link can land on carries `scroll-margin-top`, so the sticky header never
  covers the heading.
- Radii: 6/10/12px inside cards, 16/20px for cards, 28px for bands and hero blocks, pills for
  controls and chips.
- Full-height surfaces use `dvh`, never `vh`.

## Forms

- Inputs are filled boxes: surface background, 1px `--mist-line` border, `--r-md` radius,
  48px minimum height. Hover darkens the border; focus shows the brand outline.
- Labels are plain body type (600, ink), not mono — the form should read like a conversation.
- Errors live under their field (`.field__error`), tied through `aria-describedby`, and the
  control carries `aria-invalid="true"`. The summary line is `aria-live="polite"`.
- The honeypot field is pushed off-canvas (`left: -9999px`) rather than `display: none`.
- `ContactForm` is progressively enhanced: without JavaScript the browser posts the form and
  the route answers 303 back to `/services?contact=<state>#request`, where the banner reports
  the same result. No outcome depends on script.
- `.contact[hidden] { display: none }` exists because `display: grid` outranks the user
  agent's `[hidden]` rule.

## Materials

- Colour does the elevation work. Shadows are neutral black and used sparingly:
  `--shadow-1` for controls and screenshots, `--shadow-2` for hover lift, `--shadow-3` for the
  app icon.
- Glass (`backdrop-filter`) is reserved for the sticky header.
- In dark mode shadows disappear, so separation comes from the tone grounds themselves.

## Motion

GSAP + ScrollTrigger, loaded as one client module (`src/scripts/motion.ts`). Rules:

- Everything is created inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`,
  so reduce-motion users get a static page. Entrance states are applied by JS, never baked
  into CSS — a failed script can never leave content invisible.
- Only `transform` and `opacity` (`autoAlpha`) animate.
- Hooks are data attributes: `data-hero-item`, `data-hero-art`, `data-float` (slow drift),
  `data-reveal` (batched scroll reveal), `data-spotlight` (pointer-tracked tint),
  `data-steps` / `data-steps-line` (scrubbed process line).
- `ScrollTrigger.refresh()` runs after fonts and on `load` because web fonts move every trigger
  boundary.
- No perpetual CSS animation. Hover and press feedback use `--dur-1`/`--dur-2` with
  `--ease-quart`; the FAQ icon uses `--ease-spring`.

## Content Rules

- Real media first: work cards use real storefront captures; app pages show the uploaded
  `icon` and `screenshots` the moment an editor adds them, and `ScreenshotGallery` renders
  nothing when empty.
- Demo screenshots in `public/demo/` show "nori.", a fictional store built as static HTML with
  mock.shop product photos and captured with headless Chrome at 2x (webp via Chrome's canvas
  encoder, q≈0.9). Alt text always says "demo store" or "demo app"; the screens never show
  revenue, conversion or other metrics that could read as results. No AI-generated imagery.
- Generated art is abstract and `aria-hidden`, derived deterministically from the entry slug
  (`src/lib/hash.ts`) so a card keeps its identity across cache hits. It never imitates a
  product screen, chart or metric.
- No invented stats, testimonials, "free quote" offers or turnaround promises. The only
  service-level commitment is a reply within one working day, stated in `ContactForm` and the
  FAQ.
- Client work is shown only with the client's permission, and never in a way that could pass
  for the client's own site.

## Languages

- English is unprefixed and canonical; Vietnamese lives under `/vi`. `src/middleware.ts` strips
  the prefix and sets `locals.lang`, so one page file serves both. Build every internal href
  with `localizeHref(href, lang)` from `src/i18n.ts`; never hardcode `/vi`.
- Interface copy sits next to the component as an `{ en, vi }` table; shared lists use
  `*_BY_LANG` (`SERVICES_BY_LANG`, `FAQ_BY_LANG`). CMS content is translated in EmDash
  (`locale: "vi"`, `translationOf`) and lists overlay translations via
  `getLocalizedCollection`, falling back to English.
- Vietnamese copy is written, not translated: neutral "chúng tôi" / "bạn", everyday words a
  shop owner uses ("cửa hàng", "trình chỉnh sửa theme", "báo giá"), English kept only for
  terms merchants already say in English (theme, section, app, Liquid).
- First visit: `LANG_SCRIPT` sends a browser that prefers Vietnamese to `/vi`. A choice made in
  the switcher is stored (`miso-lang`) and always wins. Servers never redirect by language, so
  crawlers see each URL as itself, linked by `hreflang` alternates.
- Vietnamese runs longer and stacks diacritics: leave headings room to wrap, and keep display
  type at line-height 1.1 or more (bare numerals may go tighter).

## Accessibility Baseline

- Skip link, single `<h1>` per page, `aria-current="page"` on the active nav item, labelled
  `<nav>`/`<section>` regions.
- Focus rings are visible on every interactive element (2px brand outline, 3px offset).
- Toggles are real buttons in a labelled group with `aria-pressed`; the mobile menu reports
  `aria-expanded`, closes on Escape and returns focus to its trigger.
- ≥44px touch targets; tabular numerals for anything numeric.
- Contrast (measured): light — ink on brand 5.52:1, brand-ink on canvas 5.17:1, brand-ink on
  mist 4.69:1, brand-ink on tint 4.73:1, ink-subtle on mist 5.11:1, night-muted on night
  7.86:1; dark — ink on brand 6.59:1, brand-ink on mist 6.59:1, brand-ink on tint 6.37:1,
  ink-subtle on mist 6.20:1, night-muted on night 6.89:1.

## Anti-Patterns

- No second accent colour, no purple/blue "AI" gradients, no gradient text, no neon glows.
- No italic display type, and no white text on the orange.
- No pure black or pure white blocks in dark mode; no `--ink-muted` on a toned block.
- No emoji as UI, no icon font, no stock photography.
- No invented metrics, testimonials or fake product UI. Numbers come from the CMS or not at all.
  The exception is App Store ratings: they come from the listing, synced into
  `src/app-store-media.json` by `scripts/sync-app-store-media.mjs`, because a review count
  typed by hand goes stale the day a review lands. The CMS rating fields are only a fallback
  for apps without a synced Shopify listing. Re-run the sync before a deploy.
- No `h-screen`, no animating layout properties, no `z-index: 9999` (use the layer scale), no
  dead `#` links.
