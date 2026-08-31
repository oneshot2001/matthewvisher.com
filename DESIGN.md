# DESIGN.md — matthewvisher.com

> Design system: **Apple web** (getdesign.md analysis, independent — not affiliated with or endorsed by Apple).
> Adapted for a personal portfolio. Source register: reverent subject photography framed by near-invisible UI.
> Agents: read this file before writing any UI. Use `{token.refs}`, never inline hex.

## Adaptation notes for this site

- Apple's "product render" role is played by **Matthew's portrait**. It is the only element that
  receives the system shadow.
- Apple's "product tiles" become **tool tiles** (onvif-mcp, AAR, EdgeProof) and **section tiles**.
- Accent stays Apple **Action Blue `#0066cc`**. Deliberately NOT Alpha Vision cyan `#0099FF` —
  this site is independent work and must not read as AV.
- SF Pro resolves natively on Apple platforms via `system-ui, -apple-system`. **Inter** is the
  documented non-Apple substitute, loaded from Google Fonts.

## Colors

### Brand & Accent
- `{colors.primary}` #0066cc — Action Blue. Every interactive element. No second accent exists.
- `{colors.primary-focus}` #0071e3 — keyboard focus ring only (`outline: 2px solid`).
- `{colors.primary-on-dark}` #2997ff — Sky Link Blue. In-copy links on dark tiles ONLY.

### Surface
- `{colors.canvas}` #ffffff — dominant canvas.
- `{colors.canvas-parchment}` #f5f5f7 — signature off-white. Alternating light tiles, footer.
- `{colors.surface-pearl}` #fafafc — fill for secondary ghost buttons.
- `{colors.surface-tile-1}` #272729 — primary dark tile.
- `{colors.surface-tile-2}` #2a2a2c — micro-step lighter, for adjacent dark tiles.
- `{colors.surface-tile-3}` #252527 — micro-step darker, bottom of stack.
- `{colors.surface-black}` #000000 — global nav bar, true void only.
- `{colors.surface-chip-translucent}` rgba(210,210,215,0.64) — circular chips over photography.

### Text
- `{colors.ink}` / `{colors.body}` #1d1d1f — all text on light surfaces. Never pure black.
- `{colors.body-on-dark}` #ffffff · `{colors.body-muted}` #cccccc — dark-tile text.
- `{colors.ink-muted-80}` #333333 — body on pearl surfaces.
- `{colors.ink-muted-48}` #7a7a7a — disabled text, legal fine print.

### Hairlines
- `{colors.divider-soft}` #f0f0f0 — soft ring on secondary buttons.
- `{colors.hairline}` #e0e0e0 — 1px border on utility cards.

### Gradient
**None.** Zero gradient tokens. Atmosphere comes from photography, never CSS.

## Typography

- Display: `SF Pro Display, system-ui, -apple-system, Inter, sans-serif` (≥19px)
- Body/UI: `SF Pro Text, system-ui, -apple-system, Inter, sans-serif` (<20px)

| Token | Size | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `hero-display` | 56 | 600 | 1.07 | -0.28px | Hero headline |
| `display-lg` | 40 | 600 | 1.10 | 0 | Tile headlines |
| `display-md` | 34 | 600 | 1.47 | -0.374px | Section heads |
| `lead` | 28 | 400 | 1.14 | 0.196px | Tile subcopy |
| `lead-airy` | 24 | 300 | 1.5 | 0 | Long-form leads (rare weight 300) |
| `tagline` | 21 | 600 | 1.19 | 0.231px | Sub-nav name, sub-tile tagline |
| `body-strong` | 17 | 600 | 1.24 | -0.374px | Inline strong |
| `body` | 17 | 400 | 1.47 | -0.374px | Default paragraph |
| `dense-link` | 17 | 400 | 2.41 | 0 | Footer / utility link stacks |
| `caption` | 14 | 400 | 1.43 | -0.224px | Captions, button text |
| `caption-strong` | 14 | 600 | 1.29 | -0.224px | Emphasized captions |
| `button-large` | 18 | 300 | 1.0 | 0 | Hero CTAs (rare weight 300) |
| `button-utility` | 14 | 400 | 1.29 | -0.224px | Utility/nav labels |
| `fine-print` | 12 | 400 | 1.0 | -0.12px | Fine print, footer body |
| `micro-legal` | 10 | 400 | 1.3 | -0.08px | Legal disclaimers |
| `nav-link` | 12 | 400 | 1.0 | -0.12px | Global nav items |

### Principles
- Negative tracking at ≥17px produces the "Apple tight" cadence. Never below 12px.
- Body copy at **17px, not 16px**. This defines the reading pace.
- Weight ladder is **300 / 400 / 600 / 700**. Weight 500 is deliberately absent.
- Headlines are 600, not 700.
- Line height: display 1.07–1.19 · body 1.47 · footer link stacks 2.41 (not a bug).
- Inter substitution: nudge tracking -0.01em on display sizes; tighten body leading 1.47→1.44.

## Layout
- Base unit 8px. `xxs`4 `xs`8 `sm`12 `md`17 `lg`24 `xl`32 `xxl`48 `section`80.
- Tile vertical padding: 80px. Tiles stack edge-to-edge, **0 gap** — the color change is the divider.
- Max width: ~980px text-heavy · ~1440px grids · full-bleed product tiles.
- Card padding 24px. Button padding 8–11px × 15–22px. Grid gutters 20–24px.
- Whitespace is the subject's pedestal: ≥64px above a tile headline, ≥40px around the portrait.
  The footer is the one deliberate exception — dense, so the whole IA is visible at a glance.

## Elevation
| Level | Treatment | Use |
|---|---|---|
| Flat | none | tiles, nav, footer, body |
| Soft hairline | 1px rgba(0,0,0,.08) | utility cards, sub-nav separator |
| Backdrop blur | parchment 80% + blur | sub-nav, floating bars |
| Product shadow | `rgba(0,0,0,.22) 3px 5px 30px 0` | **portrait only** |

Exactly **one** drop shadow exists in the system, and it belongs to photography.
UI elevation comes from surface-color change and backdrop blur — never from shadow.

## Shapes
`none`0 (full-bleed tiles) · `xs`5 · `sm`8 (dark utility buttons) · `md`11 (pearl capsules) ·
`lg`18 (utility cards) · `pill`9999 (primary CTAs, chips, search — the signature) · `full`50%.

Photography: hero full-bleed rectangular, never rounded. Rounding appears only on inline card imagery.

## Components
- `global-nav` — 44px, `{colors.surface-black}`, `nav-link` 12px, edge-to-edge, collapses ≤833px.
- `sub-nav-frosted` — 52px, parchment @80% + backdrop blur, name in `tagline` 21/600 left,
  links in `button-utility` right, ending in a persistent primary CTA.
- `button-primary` — Action Blue, white text, `body` 17/400, **pill**, 11×22. Active `scale(.95)`.
  Focus `2px solid {colors.primary-focus}`.
- `button-secondary-pill` — transparent, blue text, 1px blue border, pill, 11×22.
- `button-dark-utility` — `{colors.ink}` fill, white `button-utility`, radius 8, 8×15.
- `button-pearl-capsule` — pearl fill, `ink-muted-80` `caption`, 3px `divider-soft` ring, radius 11.
- `button-large` — hero CTA, Action Blue, 18/300, 14×28.
- `button-icon-circular` — 44×44, translucent chip, radius full.
- `text-link` blue on light · `text-link-on-dark` Sky Link Blue on dark.
- `product-tile-light` / `-parchment` / `-dark` / `-dark-2` / `-dark-3` — full-bleed, radius 0,
  80px vertical padding, centered stack: headline `display-lg` → tagline `lead` → CTAs.
- `store-utility-card` — white, 1px `hairline`, radius 18, 24px padding, no shadow.
- `footer` — parchment, `dense-link` 17/2.41 columns, `caption-strong` headings,
  `fine-print` legal row in `ink-muted-48`, 64px vertical padding.

## Do
- One accent. Action Blue for every interactive element, nothing else.
- Negative tracking on headlines; 17px body.
- Alternate light and dark full-bleed tiles for rhythm; the color change IS the divider.
- Pill radius = "this is an action."
- `transform: scale(.95)` as the press state on every button.
- Reach for a surface change before adding chrome.

## Don't
- No second accent color.
- No shadows on cards, buttons, or text — shadow belongs to photography.
- No decorative gradients.
- No weight 500.
- Don't round full-bleed tiles.
- Don't tighten body line-height below 1.47.
- Don't mix radii grammars.
- Don't use Sky Link Blue on light surfaces.

## Responsive
Breakpoints that matter: **1440** (content lock) · **1068** (small desktop) · **833** (tablet
landscape / nav collapse) · **734** (tablet portrait) · **640** (phone) · **480** (small phone).

Hero ladder: 56 → 40 @1068 → 34 @640 → 28 @419. Tile padding 80 → 48 at small phone.
Grids 5→4 @1440 →3 @1068 →2 @834 →1 @640. Touch targets ≥44×44.

## Known gaps (inherited from the source analysis)
Form validation/error states, dark-mode utility cards, and the exact backdrop-filter blur radius
are not formalized. Production baseline for blur: `saturate(180%) blur(20px)`.
