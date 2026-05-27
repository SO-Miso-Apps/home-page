# Design System: Miso Apps

## Visual Theme

Professional commerce technology studio. The interface should feel calm, premium, and operationally trustworthy: off-white canvas, charcoal text, restrained emerald accent, glass-like surfaces, asymmetric hero layouts, and short transform/opacity motion.

## Palette

- Canvas: `#F7F8F5` for the main background.
- Surface: `#FFFFFF` with 70-80% opacity for glass panels.
- Ink: `#171A18` for primary text and dark CTAs.
- Muted: `#5F6B64` for body copy and metadata.
- Accent: `#138F5B` for active states, icons, and status emphasis.
- Accent Dark: `#0F6F49` for hover states and high-contrast accent text.
- Line: `rgba(23, 26, 24, 0.12)` for borders and structural separators.

## Typography

- Display: Poppins, weights 600-800, tight tracking, balanced line wraps.
- Body: Open Sans, weights 400-700, comfortable line-height around 1.7.
- Avoid all-caps heavy headings except short labels.

## Layout

- Max content width: 1180px.
- Hero sections use asymmetric two-column layouts on desktop and collapse to one column below 900px.
- Cards are soft glass panels with 28-36px radius and subtle tinted shadows.
- Avoid equal three-column feature rows as the default pattern. Prefer asymmetric grids, stacked product rows, and clear editorial rhythm.

## Motion

- Use CSS transitions between 150ms and 300ms for hover/focus/active states.
- Animate only `transform` and `opacity`.
- Respect `prefers-reduced-motion`.
- Use short entrance cascades for key landing content; avoid decorative infinite animation.

## Anti-Patterns

- No neon gradients or outer glows.
- No pure black backgrounds.
- No emoji UI icons.
- No brutalist borders or hard offset shadows.
- No generic centered SaaS hero across the whole site.
- No text overlap on mobile or desktop.
