# Design System: Miso Apps

Living document for the marketing site at `misoapps.com` (Astro + EmDash, deployed as a
Cloudflare Worker). It describes the system as built — when the system changes, this file
changes with it.

## Visual Theme

A commerce tooling studio that reads like an operations console with editorial discipline:
calm, dense where it matters, never loud. The page answers "what do you ship and can I trust
it" without stock photography, because the catalog has none — every visual is drawn with CSS
and SVG, and every image slot renders real media the moment an editor uploads it.

Two ideas drive the layout:

1. **Hairlines over boxes.** Structure comes from 1px rules, spacing and type weight, not from
   a grid of identical cards. Cards exist only where elevation means something (app tiles,
   CTAs, the hero panel).
2. **Rhythm over symmetry.** The catalog is a bento whose cells alternate long/short, the hero
   is a 1.08/0.92 split with copy left and a working-looking panel right, and the process rail
   draws itself as you scroll.

## Token Architecture

`src/styles/global.css` holds two tiers and nothing in a component may skip tier two.

- **Primitives** — raw radii, type steps, spacing, motion curves, layer scale. Never referenced
  by components.
- **Semantic roles** — `--canvas`, `--surface`, `--ink`, `--brand`, `--line`, `--shadow-*` and
  friends. This is the only vocabulary components use.

### Theming

Light is the default; dark is opt-in through `[data-theme="dark"]` on `<html>`. The attribute
is written by a small inline script in `Base.astro` **before first paint**, resolving
`localStorage["miso-theme"]` first and `prefers-color-scheme` second. Consequences:

- One source of truth for the dark palette — there is no duplicated `@media
  (prefers-color-scheme: dark)` token block to keep in sync.
- No flash of the wrong theme, because CSS never guesses.
- `<script>`-disabled visitors get light, which is a complete design.
- `ThemeToggle` reads `aria-pressed` from the same attribute, so the control is correct on the
  first frame rather than after hydration.

## Palette

One accent, emerald, sitting at 76% saturation on a green-tinted neutral family (never warm
and cool grays in the same page).

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#f6f7f4` | `#0b0e0c` |
| Canvas deep (art base) | `#eceee8` | `#070907` |
| Surface | `#ffffff` | `#131714` |
| Surface 2 | `#f1f3ee` | `#1a1f1b` |
| Ink | `#141815` | `#e9eee9` |
| Ink muted | `#5c6862` | `#9aa69f` |
| Ink subtle | `#686f6b` | `#7d8981` |
| Brand (fills, graphics) | `#138f5b` | `#2fb273` |
| Brand ink (text, icons) | `#107a4e` | `#2fb273` |
| Brand hover | `#0f6f49` | `#43c885` |
| Line / line strong | `rgba(20,24,21,.10 / .18)` | `rgba(233,238,233,.10 / .20)` |
| Danger (form errors only) | `#b4232a` | `#f78f8a` |

Dark is a tinted charcoal, never `#000`. Two brand tokens exist on purpose: `--brand` is the
display colour for fills, borders and gradients (3.82:1 on the light canvas — above the 3:1
non-text threshold), while `--brand-ink` is the text-safe variant so small brand text and
gradient buttons clear AA. Measured ratios on the light canvas: ink 16.7:1, muted 5.4:1,
subtle 4.8:1, brand-ink 5.0:1, brand-ink on `--brand-soft` 4.6:1. On the dark canvas: ink
16.5:1, muted 7.7:1, subtle 5.3:1, brand 7.2:1.

`--danger` is the one hue outside the brand: form validation only — the message under a
failed field and that field's underline. Measured 6.08:1 on the light canvas and 6.53:1 on a
light surface, 8.55:1 on the dark canvas and 7.97:1 on a dark surface. Marketing copy,
including the running text on `/services`, never uses it.

## Forms

- Structure comes from the same hairline rule as the rest of the page: inputs are
  `border-bottom` on a transparent background, never boxes. Labels are mono uppercase, the
  same treatment as eyebrows and field labels elsewhere.
- Errors live under their field (`.field__error`), tied to the control through
  `aria-describedby`, and the control also carries `aria-invalid="true"`. The summary line is
  an `aria-live="polite"` region so a screen reader hears the outcome once.
- The honeypot field is pushed off-canvas with `position: absolute; left: -9999px` rather
  than `display: none` — hidden-by-CSS fields are the ones bots skip filling.
- `ContactForm` is progressively enhanced: without JavaScript the browser posts the form and
  the route answers 303 back to `/services?contact=<state>#request`, where the banner reports
  the same result the client module would have shown in place. No outcome depends on script.
- `.contact[hidden] { display: none }` exists because `display: grid` outranks the user
  agent's `[hidden]` rule — the same trap applies to any grid/flex element toggled by
  `hidden`.

## Typography

| Purpose | Family | Notes |
| --- | --- | --- |
| Display | Outfit 500–700 | tight tracking (−0.025 to −0.035em) on h1/h2 |
| Body | Plus Jakarta Sans 400–700 | 1.65–1.75 line-height, 66ch measure |
| Numerals, labels, eyebrows | system monospace stack | `tabular-nums`, uppercase + 0.12em for labels |

No Inter. The fluid scale is `--step--1` through `--step-5`, all `clamp()`-based, so the same
type ramp works at 390px and 1440px without per-breakpoint overrides. Headings use
`text-wrap: balance`, paragraphs `text-wrap: pretty` (no orphaned last words).

## Layout

- Container 1240px, gutter `clamp(1.125rem, 4vw, 2rem)`, narrow container 780px for prose.
- Section rhythm `clamp(4rem, 9vw, 7.5rem)`; `--section--tight` halves it.
- Catalog bento: 6-column grid, cells span 4/2/2/4 by rhythm, wide cells lay out
  horizontally, narrow cells stack. Dense auto-flow closes gaps when the catalog is odd-sized.
- Feature lists and the process rail use hairline cells (`border-top`) with at most two
  columns — a fixed three-across feature row is the pattern this design refuses.
- Service tracks (`ServiceTracks`) follow the same rule: numbered two-column hairline cells,
  rendered `compact` on the home page and `full` on `/services` from one shared list
  (`src/services.ts`), so a track's summary and its detail page cannot drift apart. The page
  head on `/services` is editorial — no second hero panel, the orb stays on the home hero.
- Every anchor a home-page link can land on carries `scroll-margin-top`, so the sticky header
  never covers the heading it scrolled to.
- Radii scale with nesting: 8/12/16px inside, 22/28px for panels, 36px for hero surfaces,
  pills only for chips and buttons.
- Full-height surfaces use `dvh`, never `vh`.

## Materials

- Shadows are tinted green-black, wide and soft, from one light source (top): a `--shadow-1`
  for controls, `--shadow-2` for cards, `--shadow-3` for lifted panels.
- Glass (`--surface-glass` + `backdrop-filter` + inset `--edge` highlight) is reserved for the
  sticky header and the two hero panels — it marks the layer you are working on top of.
- In dark mode elevation comes from `--edge` (1px inner highlight) and borders, because
  shadows read as mud.
- A fixed, pointer-events-none grain overlay at 2.4% (light) / 5% (dark) breaks digital
  flatness without touching scrolling containers.

## Motion

GSAP + ScrollTrigger, loaded as one client module (`src/scripts/motion.ts`). Rules:

- Everything is created inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`,
  so reduce-motion users get a static page and GSAP reverts cleanly when the query flips.
  Entrance states are applied by JS, never baked into CSS — a failed script can never leave
  content invisible.
- Only `transform` and `opacity` (`autoAlpha`) animate. Layout properties never do.
- Hooks are data attributes, so markup stays declarative: `data-hero-item`, `data-hero-art`,
  `data-float` (perpetual drift), `data-reveal` (batched scroll reveal), `data-spotlight`
  (pointer-tracked tint), `data-steps` / `data-steps-line` (scrubbed rail draw).
- One ScrollTrigger per concern, created top to bottom; `ScrollTrigger.refresh()` runs after
  fonts and on `load` because web fonts move every trigger boundary.
- Perpetual CSS motion is limited to three things: the hero orb, the badge marquee, and the
  footer status pulse. All three freeze under `prefers-reduced-motion`.
- The orb is the hero's one piece of pure decoration: registered `@property --orb-angle`
  driving a conic layer on a pseudo-element, so browsers without `@property` keep the base
  gradients instead of dropping an invalid `background` list.

## Art Rules

The catalog ships without icons or screenshots, so art must be generated — under strict rules:

- Art is **decorative and abstract** (`aria-hidden`), derived deterministically from the entry
  slug (`src/lib/hash.ts`) so a card keeps the same identity across requests and cache hits.
- Art never imitates a product screenshot. Fake admin UI, fake charts and fake metrics are
  banned — a viewer must never mistake decoration for the product.
- `AppMark` is a gradient squircle with one of four abstract motifs; it is a placeholder, not a
  claim about the app's real icon.
- The moment an editor uploads `icon`, `screenshots` or `og_image`, real media renders in that
  slot and the generated art steps aside. `ScreenshotGallery` renders nothing when empty.

## Accessibility Baseline

- Skip link, single `<h1>` per page, `aria-current="page"` on the active nav item,
  labelled `<nav>`/`<aside>`/`<section>` regions.
- Focus rings are visible on every interactive element (`2px` brand outline, 3px offset).
- Toggles are real buttons in a labelled group with `aria-pressed`; the mobile menu reports
  `aria-expanded`, closes on Escape and returns focus to its trigger.
- ≥44px touch targets on mobile controls; tabular numerals for anything numeric.
- Contrast (measured, not asserted): light canvas — ink 16.7:1, muted 5.4:1, subtle 4.8:1,
  brand text 5.0:1; dark canvas — ink 16.5:1, muted 7.7:1, subtle 5.3:1, brand text 7.2:1.
  Every text pairing clears 4.5:1; non-text graphics clear 3:1 against `--brand`.

## Anti-Patterns

- No pure black backgrounds, no neon glows. The only soft brand bloom permitted is the hero's
  ambient wash behind the copy; nothing gets a drop-shadow halo.
- No second accent colour (the `--danger` hue is a validation signal, not an accent), no
  purple/blue "AI" gradient, no gradient-filled body copy.
- No emoji as UI, no icon font, no stock photography, no Unsplash.
- No equal three-across card rows, no centered-SaaS hero, no card-everything layouts.
- No invented metrics, testimonials, or fake product UI. Numbers come from the CMS or not at
  all.
- No `h-screen`, no animating `top`/`left`/`width`/`height`, no `z-index: 9999` (use the layer
  scale), no dead `#` links.
