# DESIGN.md — matthewvisher.com

> Warm, one-temperature editorial system. Independent work; never Alpha Vision cyan/navy.
> Agents: read this before writing UI. Use `var(--token)`, never inline hex or rgba
> (translucency = `color-mix(in oklch, var(--x) N%, transparent)`).

## Tokens (`assets/css/styles.css` `:root`)

| Token | Hex | Role |
|---|---|---|
| `--paper` | #FAF8F3 | dominant canvas, light tiles, cards |
| `--parchment` | #F1EDE3 | alternating tile, header (80% frosted), footer, mobile menu |
| `--ink` | #1C1B18 | all text on light; secondary-button outline; card hover border |
| `--charcoal` | #24221E | the one dark tile (`.tile--dark`, `-2`, `-3` all resolve here) |
| `--kraft` | #B9A27A | hero copy-block ground ≤833 (stacked hero) |
| `--hairline` | #DAD3C4 | 1px borders: header, cards, rows, footer rule, pearl button |
| `--muted` | #6B665C | captions, meta, legal, definition labels |
| `--lemon` | #FFD60A | the only accent: primary fill, nav pill, link underline, mark dot, ticks |
| `--gold` | #6A5600 | lemon's readable-on-light form — ONLY `.card__meta .status`, `.article-kicker`, `.article-signoff a` |
| `--on-lemon` | #1C1B18 | text on lemon |
| `--focus` | = ink | `outline: 2px solid; outline-offset: 2px` on `a, button, summary` `:focus-visible` |
| `--ink-print` | #1A1917 | `.article-body` colour |
| `--on-dark` | #F4F1EA | text on charcoal |
| `--muted-on-dark` | #CFC9BC | leads/proof on charcoal |
| `--shadow-photo` | `0 24px 60px -24px ink@45%` | the ONE shadow — About portrait only |

Spacing `--xxs`4 `--xs`8 `--sm`12 `--md`17 `--lg`24 `--xl`32 `--xxl`48 `--section`80.
Radius `--r-none`0 `--r-sm`8 `--r-md`11 (pearl) `--r-lg`18 (cards) `--r-pill`.
Motion tokens live in `motion.css` (see Motion).
No shadows except `--shadow-photo` on the About portrait; no gradients.

## Type

- `--font-sans` "Public Sans" · `--font-serif` "Newsreader" (opsz auto) · `--font-mono` "JetBrains Mono".
- One Google Fonts `<link>` per page: Public Sans 400–700, Newsreader 400–600 + italic, JetBrains Mono 400/500.
- Weights: sans 400/500/600 · serif 400/500 + italic · mono 400/500. No 300, no 700 display.

| Class | Size | Family | Weight | Leading | Tracking | ≤1068 | ≤640 | ≤419 |
|---|---|---|---|---|---|---|---|---|
| `.t-hero` | 60 | serif | 500 | 1.05 | -0.02em | 44 | 36 | 30 |
| `.t-display` | 40 | serif | 500 | 1.1 | 0 | 32 | 28 | |
| `.t-section`, `.prose h2` | 30 | serif | 500 | 1.2 | 0 | | 26 | |
| `.t-lead` | 24 | sans | 400 | 1.3 | 0 | | 20 | |
| body | 17 | sans | 400 | 1.47 | 0 | | | |
| `.t-caption` | 14 | sans | 400 | 1.43 | 0 | | | |
| `.t-fine` | 12 | mono | 400 | 1.4 | 0 | | | |

`h1,h2,h3 { text-wrap: balance }` · `.prose p, .card p { text-wrap: pretty }`.
Nameplate `.site-nav__name`: Newsreader 600 italic 22px + the Full Stop mark
(`fill="currentColor"` square, `.mark__dot` lemon).
Article (`article.css`): title/dek/body serif, body `--ink-print` 19/1.68, kicker/byline/sources/NO. mono.

## Header — one `.site-nav`

- `<header class="site-nav">` sticky top 0, 52px, parchment 80% + `saturate(180%) blur(20px)`, hairline bottom. `z-index: 50`.
- Left: mark + nameplate → `/`. Right: `<nav class="site-nav__links">` Lab · Notes · About · GitHub (14px, ink @ .8, `aria-current="page"` = opacity 1 / 600) then `.btn--nav` "Get in touch" → `/contact/`.
- Home and Contact carry no `aria-current`; every `/notes/*` page marks Notes.
- ≤640: link row hidden; `<details class="site-nav__menu"><summary>Menu</summary><nav>…</nav></details>` drops a full-width parchment panel (absolute, `top:100%`, hairline bottom) listing Lab / Notes / About / GitHub / LinkedIn. No JS. Brand stays on one line at 390.

## Buttons

All `.btn`: pill, 1px border, 17/1.47, 11×22 padding, `transition` transform/background/border `--dur-ui` `--ease-out`, `:active scale(.97)`.

| Class | Fill | Text | Border | Hover |
|---|---|---|---|---|
| `.btn--primary`, `.btn--nav` | lemon | on-lemon | — | lemon −6% (`color-mix … black 6%`) + `translateY(-1px)` |
| `.btn--lg` (size modifier) | 18px / 14×28 | | | |
| `.btn--secondary` (light) | none | ink | ink | ink 8% fill |
| `.tile--dark .btn--secondary` | none | lemon | lemon | lemon 8% fill |
| `.btn--pearl` | paper | ink | hairline, radius 11, 14px | border → ink |
| `.btn--nav` | lemon | on-lemon | 14px / 6×16 (6×12 ≤640) | as primary |

Deleted: `.btn--large`, `.btn--secondary-on-dark`, `.btn--dark-utility`.

## Links & cards

- `.link` (light): ink, no text-decoration; lemon 2px underline grows in via `background-size: 0% 2px → 100% 2px` at `0 100%`.
- `.link-on-dark`: lemon. Footer links: ink, hover = 2px lemon underline. `.article-body a`: ink + lemon underline.
- `.card`: paper, hairline, radius 18, 24px padding; hover border → ink (`--dur-ui`). Meta mono 12 muted .02em; `.status` gold 600 + lemon tick. `.card--feature` spans the grid, serif 30 title.
- Mono texture: `.card__meta`, `.proof`, `.am-row`, `.article-byline`, `.article-back`, `.article-nav`, `.article-signoff`, `.footer__legal` — `--font-mono` 12–13, muted, .02em.
- `.specimen` (home tiles): `<pre role="figure">` mono 13, ≤12 lines, radius 11, hairline, no shadow; paper card on charcoal, charcoal card on paper; `<b>` = gold/lemon.

## Surfaces & layout

- Tiles full-bleed, radius 0, 80px vertical padding (48 ≤640); colour change is the divider.
  `.tile--light` paper · `.tile--parchment` parchment · `.tile--dark/-2/-3` charcoal.
- Content max-widths: 1440 grids · 980 prose tile (About + Contact sit on this one left axis; `.rows` 62ch) · 1120 `.tile__inner--duo` + footer inner.
- Footer: parchment, `.footer__inner` 1120, `.footer__cols` `repeat(3, minmax(0,1fr))` gap 24 ≥735,
  headings `<p class="footer__h">` mono 12 uppercase .08em muted, links 17/2.41 ink, legal 12 muted.
  Elsewhere column = Contact · LinkedIn · GitHub · X on every page.

## Breakpoints

**1068** small desktop (hero 44 / display 32; hero copy 440 / inset 40; portrait `object-position` 72%) · **834/833** tablet (grid 2-col ≥835; `.about-band` + `.tile__inner--duo` 2-col ≥834;
≤833 hero stacks: copy on kraft with the frame, `<picture class="hero-art">` band below at natural aspect, copy inset 24) · **735** footer 3-col · **640** phone (menu disclosure, type step,
tile 48×17) · **419** small phone (hero 30). Touch targets ≥44×44.

## Motion — `assets/css/motion.css` + `assets/js/motion.js` (loaded on all 13 pages)

Tokens (`:root` in motion.css): `--ease-out: cubic-bezier(.23,1,.32,1)` · `--ease-spring: cubic-bezier(.34,1.56,.64,1)` ·
`--dur-ui: 180ms` (every hover/transition) · `--dur-reveal: 600ms` · `--stagger: 50ms` (× `--i` on grid items).

- **Reveals** `.reveal` = home tiles + specimens, Lab/Notes cards, About sections, article `.article-head` / first body `<p>` / `.article-signoff`.
  Primary: `animation-timeline: view()`, `animation-range: entry 0%→40%` shifted 6% per `--i`. Fallback (`@supports not`): `html.js .reveal`
  hidden → IntersectionObserver adds `.in` → rise with `--i × --stagger` delay. **Rule: nothing is invisible at rest** — no JS = fully visible;
  view() leaves anything already in the viewport at its end state.
- **Hero** shutter (ink, 550ms `cubic-bezier(.7,0,.2,1)`, starts 0ms) plays once per session: motion.js sets `html.mv-first` when
  `sessionStorage.mv_seen` is unset. Frame is static (no drift). REC dot pulses 3.2s. ≥834 the portrait gets a 6% scroll-linked parallax
  (`animation-timeline: scroll(root)`, range `0 100vh`; img is 107% tall, top −7%, so no gap).
- **View transitions** (`styles.css`): `@view-transition { navigation: auto }`, `nameplate` on `.site-nav__name`, `mark` on `.site-nav .mark`,
  root crossfade 220ms. Exactly one element per name per page.
- **Ticks** `.tick` (lemon dot + ink check; also `.proof li::before/::after`): spring pop 400ms `--ease-spring` via the `scale` property.
  Card ticks pop when the card's reveal lands (200ms + stagger); hero proof ticks pop 550ms + stagger after the shutter (first visit only);
  Copy button swaps in `<span class="tick">Copied`; article signoff tick pops with its reveal.
- **Hover** pills `translateY(-1px)` + lemon −6%; secondary fills 8%; cards hairline → ink; `.link` lemon underline grows in. All `--dur-ui --ease-out`.
- **Reduced motion** (`prefers-reduced-motion: reduce`): reveals opacity-only 300ms, no transform; shutter/parallax off; REC dot static at .9;
  ticks static; `scroll-behavior: auto` (smooth only under `no-preference`); view-transition pseudo animations `none`.
- Print (`styles.css`) forces `.reveal` visible and `animation: none`.

## Do / Don't

- Do: one accent (lemon), gold only in the three named places, ink outlines for secondary actions.
- Do: `?v=YYYYMMDD` bump on every stylesheet link on all 12 pages when CSS changes (4h edge cache).
- Don't: inline hex/rgba, a second dark, weight 300, shadows, Inter/Saira/SF Pro, `.global-nav`/`.sub-nav`.
