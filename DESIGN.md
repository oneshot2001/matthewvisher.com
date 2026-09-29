# DESIGN.md — matthewvisher.com

> Warm, one-temperature editorial system. Independent work; never Alpha Vision cyan/navy.
> Agents: read this before writing UI. Use `var(--token)`, never inline hex or rgba
> (new translucency = `color-mix(in srgb, var(--x) N%, transparent)`; an oklch mix of parchment toward transparent rendered pink. Existing oklch ink/lemon mixes stay).

## Tokens (`assets/css/styles.css` `:root`)

| Token | Hex | Role |
|---|---|---|
| `--paper` | #FAF8F3 | dominant canvas, light tiles, cards |
| `--parchment` | #F1EDE3 | alternating tile, header (86% frosted), footer, mobile menu |
| `--ink` | #1C1B18 | all text on light; secondary-button outline; card hover border |
| `--charcoal` | #24221E | the one dark tile (`.tile--dark`, `-2`, `-3` all resolve here) |
| `--deep` | #141310 | home flagship chapter ground only (`.hm-chapter`) |
| `--kraft` | #B9A27A | home hero ground at every width |
| `--hairline` | #DAD3C4 | 1px borders: header, cards, rows, footer rule, pearl button |
| `--muted` | #6B665C | captions, meta, legal, definition labels |
| `--lemon` | #FFD60A | the only accent: primary fill, nav pill, link underline, mark dot, ticks |
| `--gold` | #6A5600 | lemon's readable-on-light form — ONLY `.card__meta .status`, `.article-kicker`, `.article-signoff a` |
| `--rust-on-dark` | #E8744A | failed / denied state on dark (home tamper readout, Lab specimens `b.no`). Never decoration |
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

- `<header class="site-nav">` sticky top 0, 52px, parchment 86% (srgb mix) + `blur(20px)`, no saturate, hairline bottom. `z-index: 50`.
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
- `.card`: paper, hairline, radius 18, 24px padding; hover border → ink (`--dur-ui`). Meta mono 12 muted .02em; `.status` gold 600 + lemon tick. `.card--feature` spans the grid, serif 30 title (index pages override card titles, see Index pages).
- Mono texture: `.card__meta`, `.proof`, `.am-row`, `.article-byline`, `.article-back`, `.article-nav`, `.article-signoff`, `.footer__legal` — `--font-mono` 12–13, muted, .02em.
- `.specimen` (Lab pages): `<pre role="figure">` mono 13, ≤12 lines, radius 11, hairline, no shadow; paper card on charcoal, charcoal card on paper; `<b>` = gold/lemon.

## Surfaces & layout

- Tiles full-bleed, radius 0, 80px vertical padding (48 ≤640); colour change is the divider.
  `.tile--light` paper · `.tile--parchment` parchment · `.tile--dark/-2/-3` charcoal.
- Content max-widths: 1440 grids · 980 prose tile (Contact; `.rows` 62ch) · 1120 footer inner · 1200 Home (`.hm-wrap`) and Lab index, Notes index, About (`.pg-wrap`).
- Footer: parchment, `.footer__inner` 1120, `.footer__cols` `repeat(3, minmax(0,1fr))` gap 24 ≥735,
  headings `<p class="footer__h">` mono 12 uppercase .08em muted, links 17/2.41 ink, legal 12 muted.
  Elsewhere column = Contact · LinkedIn · GitHub · X on every page.

## Home — `assets/css/home.css` + `assets/js/home.js` (loaded on `/` only)

Every home class is `hm-` prefixed. One container: `.hm-wrap` 1200. Breakpoints 900 (desktop layout, chapter pins) and 640 (phone type + padding).
Lemon pills are rationed to one per view: nav, hero, closing band. Everything else is `.hm-go` (ink text, lemon underline grows in, chevron).

| Order | Section | Notes |
|---|---|---|
| 1 | `.hero.hm-hero` | kraft ground; ≥900 full height (`100svh − 52`), portrait `object-fit: cover` right center, copy ≤56% wide; <900 copy block then portrait band. H1 `clamp(38px, 6vw, 88px)` / 1.0 / −0.028em |
| 2 | `.hm-proof` | four credentials, 4-col ≥900, 2×2 below; mono label + tick, 500 statement |
| 3 | `.hm-thesis` | parchment; one serif sentence `clamp(34px, 6.2vw, 100px)`, ends on the lemon full stop |
| 4 | `.hm-chapter` | EdgeProof on `--deep`; steps Lens / Archive / Courtroom left, `.hm-rig` (track + readout + dial) right |
| 5 | `.hm-work` | `.hm-bento`: onvif-mcp (charcoal cell) + AAR (parchment cell) two-up, commissioning cell full width. Radius 28 |
| 6 | `.hm-notes` | parchment; the three newest notes as `.hm-card` with typographic `.hm-cover` (charcoal, lemon, paper in that order). **Hand-maintained**: `publish-note.py` does not touch `/` |
| 7 | `.hm-about` | photograph + one-line bio, then `.hm-path` four-step progression (last dot lemon) |
| 8 | `.hm-close` | charcoal; one question, one lemon pill |

Lemon means verified or primary action. Rust means failed or denied. Never swap them.
Hero overlay layout applies at ≥900 wide **and** aspect ≥11:10; taller viewports stack (copy block, then portrait band) so the figure never sits under the copy.
The chapter pins at ≥900 wide **and** ≥780 tall. `.hm-go` carries a 44px hit area through `::before`. Inactive steps dim to .62, never lower (4.5:1 on `--deep`).
Home radii: 14 specimen, 22 rig / photo / phone cell, 28 cell. Home gold: `.hm-spec b` on paper, `.hm-cover--paper` number. Dots ring with `outline`, not `box-shadow`.
Print rules use literal `#000`, as the `styles.css` print block does.

## Index pages + About — `assets/css/pages.css` (Lab index, Notes index, About)

`pg-` prefixed, tokens only, same 1200 left axis and type scale as Home. Contact and 404 keep the centred `.t-hero` head.

- **Page head** `.pg-head`: left-aligned H1 `clamp(44px, 6vw, 88px)` / 1.0 / −0.028em, `.pg-lead` ≤44ch balanced. No centred narrow leads.
- **Index cards** `.pg-index`: every card title is serif 500 (26; feature `clamp(30px, 3.4vw, 44px)`).
- **Notes index** `.pg-notes`: each card is its own typographic cover. `.card__meta` becomes a mono masthead (NO. left, date right, double rule).
  The newest note (`.card--feature`) is the charcoal cover: radius 28, title `clamp(36px, 4.8vw, 68px)`, date in lemon.
  Styled entirely from the markup `scripts/publish-note.py` writes; do not change `<ul class="grid grid--3">` or the feature `<li>` opening tag.
- **Lab specimens**: a denied or failed value is `<b class="no">` and reads `--rust-on-dark` (`lab.css`). Plain `<b>` stays lemon = verified.
- **About**: head band on the 1200 axis · `.pg-story` prose left, `.pg-quote` right (lemon rule) · `.pg-work` 2×2 parchment cells with Lab links ·
  `<dl class="pg-path">` four-step progression (same figure as Home's `.hm-path`, full wording, numerals from a CSS counter) ·
  `.pg-record` timeline left, `.pg-rail` (operating principles, disclosure) right ≥1000.
  Story DOM order is paragraph, quote, paragraph; the grid moves the quote to the right column. In-text links in `.pg-work` show their underline at rest.
- Radii on these pages: 22 cells and rail, 28 Notes feature cover.
- The index grid sections are **not** `.reveal`: a section taller than five viewports never crosses the fallback observer's threshold. Cards carry their own reveal.
- Print: `pages.css` has its own print block; About prints as a compact résumé.

## Breakpoints

**1068** small desktop (`.t-hero` 44 / display 32) · **900/899** Home and `pages.css` layouts · **1000** About timeline + rail two-column (rail sticks only when the viewport is also ≥700 tall) · **834/833** tablet (grid 2-col ≥835; `.about-band` 2-col ≥834) · **735** footer 3-col · **640** phone (menu disclosure, type step,
tile 48×17) · **419** small phone (hero 30). Touch targets ≥44×44.

## Motion — `assets/css/motion.css` + `assets/js/motion.js` (loaded on every page)

Tokens (`:root` in motion.css): `--ease-out: cubic-bezier(.23,1,.32,1)` · `--ease-spring: cubic-bezier(.34,1.56,.64,1)` ·
`--dur-ui: 180ms` (every hover/transition) · `--dur-reveal: 600ms` · `--stagger: 50ms` (× `--i` on grid items).

- **Reveals** `.reveal` = home section heads, cells, cards and about blocks, Lab/Notes cards, About sections, article `.article-head` / first body `<p>` / `.article-signoff`.
  Primary: `animation-timeline: view()`, `animation-range: entry 0%→40%` shifted 6% per `--i`. Fallback (`@supports not`): `html.js .reveal`
  hidden → IntersectionObserver adds `.in` → rise with `--i × --stagger` delay. **Rule: nothing is invisible at rest** — no JS = fully visible;
  view() leaves anything already in the viewport at its end state.
- **Hero** shutter (ink, 550ms `cubic-bezier(.7,0,.2,1)`, starts 0ms) plays once per session: motion.js sets `html.mv-first` when
  `sessionStorage.mv_seen` is unset.
- **Home motion** (`home.js`), one idea: the printed halftone behind the portrait is alive.
  - *Field* `<canvas class="hm-field">` in the hero and, fainter, in the closing band. Lemon dots on a 13px grid (11 <640) rotated 32°; dot radius
    carries the tone. Rings travel outward from a focal point behind the head, dots swell within 150px of the pointer. One fill path per frame.
    `assets/img/figure-mask.png` (450×278 silhouette cut from the portrait) is sampled once per build so no dot lands on the figure.
    Runs only while its section is on screen and the tab is visible.
  - *Verified read* (hero only): every 3–6s a patch of dots coheres, ink corner brackets draw, a mono label types in, then it dissolves.
    Placement rejects the figure and any hero text or link.
  - *Thesis* words ink in with scroll (opacity .13 → 1); the full stop pops last.
  - *Chapter* ≥900 the section is 300vh with a sticky inner; scroll progress sets `data-step` 1 → 2 → 3, which lights the step, fills the track and
    reveals readout rows. Otherwise and under reduced motion: not pinned, step 3, everything shown. The dial is always visible and focusable; it toggles `.tampered` (rust readout) and announces
    the result through a `role="status"` line.
  - *Specimens* `.hm-spec` lines type in on first view (90ms stagger).
  - No JS: every section renders at its end state; the field is simply absent.
- **View transitions** (`styles.css`): `@view-transition { navigation: auto }`, `nameplate` on `.site-nav__name`, `mark` on `.site-nav .mark`,
  root crossfade 220ms. Exactly one element per name per page.
- **Ticks** `.tick` (lemon dot + ink check): spring pop 400ms `--ease-spring` via the `scale` property.
  Card ticks pop when the card's reveal lands (200ms + stagger);
  Copy button swaps in `<span class="tick">Copied`; article signoff tick pops with its reveal.
- **Hover** pills `translateY(-1px)` + lemon −6%; secondary fills 8%; cards hairline → ink; `.link` lemon underline grows in. All `--dur-ui --ease-out`.
- **Reduced motion** (`prefers-reduced-motion: reduce`): reveals opacity-only 300ms, no transform; shutter off; home field draws one still frame,
  no brackets, thesis fully inked, chapter unpinned; ticks static; `scroll-behavior: auto` (smooth only under `no-preference`); view-transition pseudo animations `none`.
- Print (`styles.css`) forces `.reveal` visible and `animation: none`.

## Do / Don't

- Do: one accent (lemon), gold only in the three named places, ink outlines for secondary actions.
- Do: `?v=YYYYMMDD` bump on every stylesheet link on every page when CSS changes (4h edge cache); `home.css` / `home.js` carry their own `?v=`.
- Don't: inline hex/rgba, a dark beyond charcoal and the home chapter's `--deep`, weight 300, shadows, Inter/Saira/SF Pro, `.global-nav`/`.sub-nav`.
