# Design System: Miso Apps — "Bát miso"

Living document for the marketing site at `misoapps.com` (Astro + EmDash, deployed as a
Cloudflare Worker). It describes the system as built — when the system changes, this file
changes with it.

## Visual Theme

A small Shopify studio whose main trade is theme design and customization. The page has to
answer "can these people make my store look and work the way I want" — so it leads with real
storefronts it has worked on, then the theme service, and only then the studio's own apps.

The look is a bowl of miso soup: warm paper ground, one miso-orange accent, and three soft
"ingredient" tones (peach, tofu, seaweed) that colour whole blocks. Everything is rounded —
pills for controls, 18–40px radii for cards and sections, an organic blob for decoration.

Three ideas drive the layout:

1. **Colour blocks over hairlines.** Sections are trays and cards filled with a tone, not boxes
   drawn with 1px rules. A rule appears only inside a block, to separate rows.
2. **Proof first.** The home page order is hero → recent work (live storefronts) → theme
   services → process → apps → reviews → FAQ → CTA. Theme work leads every list it appears in.
3. **One emphasis per headline.** Display headings set one word in italic orange
   (`{ before, em, after }` copy rendered with `<em>`, never `set:html`).

## Token Architecture

`src/styles/global.css` holds two tiers and nothing in a component may skip tier two.

- **Primitives** — radii, type families and steps, spacing, motion curves, layer scale. Never
  referenced for colour.
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

Dark mode is "the same bowl, lights down": a roasted near-black ground (never `#000`), the
orange lifted so it reads as text, and each tone deepened so its ink pair keeps contrast.

## Palette

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#fcfcfa` | `#151412` |
| Surface | `#ffffff` | `#1f1d1a` |
| Ink | `#1b1a17` | `#f3efe6` |
| Ink muted | `#5e5a52` | `#b5ae9f` |
| Ink subtle | `#6b665d` | `#a39c8d` |
| Brand (fills, display text) | `#c2481a` | `#ee7c4c` |
| Brand ink (small text) | `#ae3f15` | `#ee7c4c` |
| Peach / peach ink / peach muted | `#fce3d3` / `#8a3210` / `#4a3a30` | `#3a2419` / `#f7b892` / `#d9c3b4` |
| Tofu / tofu line | `#f3efe6` / `#e2dbcc` | `#24211d` / `#36322b` |
| Seaweed / ink / muted / accent | `#1e4a3b` / `#f3efe6` / `#d3e6dc` / `#b8e0cc` | `#24493b` / same |
| Danger (form errors only) | `#b4232a` | `#f78f8a` |

There is one accent, the orange. `--brand` is for fills and large display type; `--brand-ink`
is the small-text variant that clears AA on every ground including tofu and peach. White on
`--brand` (light) is 4.96:1.

### Tones

A block takes a tone class, never raw tone colours:

| Class | Ground | Text | Muted text |
| --- | --- | --- | --- |
| `.tone-peach` | `--peach` | `--peach-ink` | `--tone-muted` = `--peach-muted` |
| `.tone-tofu` | `--tofu` | `--ink` | `--tone-muted` = `--ink-muted` |
| `.tone-seaweed` | `--seaweed` | `--seaweed-ink` | `--tone-muted` = `--seaweed-muted` |

Inside a toned block, secondary text uses `var(--tone-muted)` — never `--ink-muted`, which is
tuned for the canvas. Where tones repeat in a list (app cards, app marks) they cycle peach →
seaweed → brand → tofu so neighbours never match.

`--danger` is the one hue outside the brand: the message under a failed field and that field's
border. Marketing copy never uses it.

## Typography

| Purpose | Family | Notes |
| --- | --- | --- |
| Display | Fraunces 500–600 | optical sizing on; italic 500 for the `<em>` word and big numerals |
| Body | Onest 400–700 | 1.65–1.7 line-height, 62ch measure |
| Eyebrows, labels, numerals | IBM Plex Mono | uppercase + 0.06em for eyebrows, `tabular-nums` |

All three ship a Vietnamese subset, so diacritics never fall back mid-word. The fluid scale is
`--step--1` through `--step-5` plus `--step-hero`, all `clamp()`-based. Headings use
`text-wrap: balance`, paragraphs `text-wrap: pretty`.

## Components

- **`.band`** — a tofu tray inset from the viewport edge (`--r-2xl`). Used for the process
  section, the request form on `/services`, and the footer (top corners only).
- **`.chip`** — peach pill for the hero kicker and work tags. **`.eyebrow`** — mono, brand-ink,
  with a blob dot.
- **Buttons** — all pills, ≥44px tall. `.btn--brand` (orange) is the one primary action per
  view; `.btn--primary` (ink) is the header CTA and secondary-track actions; `.btn--ghost` is
  tofu with a tofu-line border.
- **Hero collage** (home) — three tilted blocks labelled like theme-editor sections (banner,
  featured products, reviews). It is `aria-hidden` decoration that says "sections you can
  edit", not a screenshot.
- **Work cards** (`src/work.ts`) — real storefront captures in `public/work/`, domain, one-line
  description, theme name, outbound link. Facts only; no results or scope claims until the
  client agrees to them being public.
- **`ServiceTracks`** — one numbered card per track from `src/services.ts`. The first track
  (theme work) is peach with a brand button, the rest tofu with an ink button; buttons pin to
  the card foot so they line up across the row.
- **`AppMark`** — a rounded tile with one abstract glyph, toned via `tone="brand|peach|seaweed|
  tofu"`. A placeholder, not a claim about the app's real icon.
- **`ReviewBand`** — a peach block; numbers come only from each app's CMS rating fields.
- **`Faq`** — native `<details>` as tofu cards; the open item's icon turns peach and rotates.
- **`CtaPanel`** — a seaweed block that closes the home and app pages.

## Layout

- Container 1240px, gutter `clamp(1rem, 4vw, 2rem)`, narrow container 780px for prose.
- Section rhythm `--section-y` = `clamp(4rem, 9vw, 7.5rem)`; `.section--tight` for short ones.
- Cards sit in grids with `0.625–1rem` gaps — tight enough that a row reads as one group.
- Two columns at most for services, apps and features; four for the process steps on desktop.
- Every anchor a link can land on carries `scroll-margin-top`, so the sticky header never
  covers the heading.
- Radii: 8/12/18px inside cards, 24/32px for cards, 40px for bands and hero blocks, pills for
  controls and chips, `--r-blob` for decoration only.
- Full-height surfaces use `dvh`, never `vh`.

## Forms

- Inputs are filled boxes: surface background, 1px `--tofu-line` border, `--r-md` radius,
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

- Colour does the elevation work. Shadows are warm brown-black and used sparingly:
  `--shadow-1` for controls and screenshots, `--shadow-2` for hover lift, `--shadow-3` for the
  app hero mark.
- Glass (`backdrop-filter`) is reserved for the sticky header.
- In dark mode shadows read as mud, so separation comes from the tone grounds themselves.

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
- Contrast (measured): light — brand on canvas 4.83:1, brand-ink on tofu 5.20:1, brand-ink on
  peach 4.85:1, peach-muted on peach 8.80:1, ink-subtle on tofu 4.97:1; dark — brand on tofu
  5.82:1, brand on peach 5.27:1, ink-muted on tofu 7.27:1, peach-muted on peach 8.58:1.

## Anti-Patterns

- No second accent colour, no purple/blue "AI" gradients, no gradient text, no neon glows.
- No pure black or pure white blocks in dark mode; no `--ink-muted` on a toned block.
- No emoji as UI, no icon font, no stock photography.
- No invented metrics, testimonials or fake product UI. Numbers come from the CMS or not at all.
- No `h-screen`, no animating layout properties, no `z-index: 9999` (use the layer scale), no
  dead `#` links.
