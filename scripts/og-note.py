#!/usr/bin/env python3
"""Render the 1200x630 link-preview card for each note: notes/no-NN/og.png.

  uv run --with playwright python3 scripts/og-note.py 21 [22 ...]
  uv run --with playwright python3 scripts/og-note.py --all
  uv run --with playwright python3 scripts/og-note.py 22 --page /tmp/publish-note-dryrun.html   (render before publishing)

Reads the title and long date from the published notes/no-NN/index.html, lays them out in the
og-notes.png register (double rule, mono eyebrow, Newsreader headline) with the site's own font files (inlined),
and shrinks the headline until it fits three lines. Playwright's Chromium only; headless Chrome is guard-blocked.
"""
import base64, html, pathlib, re, sys
from playwright.sync_api import sync_playwright

SITE = pathlib.Path(__file__).resolve().parent.parent
FONT = lambda n: "data:font/woff2;base64," + base64.b64encode((SITE/f"lab/window/fonts/{n}.woff2").read_bytes()).decode()
E = lambda s: html.escape(s, quote=False)

CARD = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Newsreader; src: url({newsreader}) format("woff2"); font-weight: 200 800; }
@font-face { font-family: "Public Sans"; src: url({public-sans}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: "JetBrains Mono"; src: url({jetbrains-mono}) format("woff2"); font-weight: 100 800; }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #FAF8F3; color: #1C1B18; }
.rule { position: absolute; left: 72px; right: 72px; top: 64px; height: 6px; background: #1C1B18; }
.rule + .rule { top: 74px; height: 1px; }
.eyebrow { position: absolute; left: 72px; top: 112px; margin: 0; font: 500 16px/22px "JetBrains Mono"; letter-spacing: .14em; text-transform: uppercase; }
.eyebrow i { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: #FFD60A; margin-right: 14px; vertical-align: -1px; }
h1 { position: absolute; left: 72px; top: 156px; width: 1000px; margin: 0; font-family: Newsreader; font-weight: 600; line-height: 1.04; letter-spacing: -.012em; font-optical-sizing: auto; text-wrap: balance; }
.by { position: absolute; left: 72px; top: 466px; margin: 0; font: 400 22px/28px "Public Sans"; }
.foot { position: absolute; left: 72px; top: 538px; margin: 0; font: 400 18px/24px "JetBrains Mono"; }
</style></head><body>
<div class="rule"></div><div class="rule"></div>
<p class="eyebrow"><i></i>Notes from the Field &middot; No. {nn}</p>
<h1>{title}</h1>
<p class="by">Matthew Visher &middot; {date}</p>
<p class="foot">matthewvisher.com/notes/no-{nn}</p>
</body></html>"""

FIT = """() => { const h = document.querySelector('h1');
  for (let px = 84; px >= 44; px -= 2) { h.style.fontSize = px + 'px';
    if (h.getBoundingClientRect().height <= 3 * px * 1.04 + 2 && h.scrollWidth <= 1000) return px; }
  return 0; }"""

def fields(no, page_path=None):
    page = pathlib.Path(page_path or SITE/f"notes/no-{no:02d}/index.html").read_text()
    title = re.search(r'<h1 class="article-title">(.*?)</h1>', page, re.S).group(1)
    date = re.search(r'<span>([A-Z][a-z]+ \d{1,2}, \d{4})</span>', page).group(1)
    return html.unescape(title), date

def main():
    args = sys.argv[1:]; page = None
    if len(args) == 3 and args[0].isdigit() and args[1] == "--page":
        nos, page = [int(args[0])], args[2]
    elif args == ["--all"]:
        nos = sorted(int(p.name[3:]) for p in (SITE/"notes").glob("no-*") if p.name[3:].isdigit() and (p/"index.html").is_file())
    elif args and all(a.isdigit() for a in args):
        nos = [int(a) for a in args]
    else:
        sys.exit(__doc__)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1200, "height": 630})
        for no in nos:
            title, date = fields(no, page)
            slots = {"newsreader": FONT("newsreader"), "public-sans": FONT("public-sans"), "jetbrains-mono": FONT("jetbrains-mono"),
                     "nn": f"{no:02d}", "title": E(title), "date": date}
            pg.set_content(re.sub(r"\{([a-z-]+)\}", lambda m: slots.get(m.group(1), m.group(0)), CARD))  # one pass: inserted text is never re-substituted
            pg.evaluate("document.fonts.ready.then(() => true)")
            if not pg.evaluate("[...document.fonts].every(f => f.status === 'loaded')"): sys.exit("fonts did not load")
            px = pg.evaluate(FIT)
            if not px: sys.exit(f"NO. {no:02d}: title does not fit at 44px")
            out = SITE/f"notes/no-{no:02d}/og.png"; out.parent.mkdir(exist_ok=True)
            pg.screenshot(path=str(out))
            print(f"  NO. {no:02d}  {px}px  {out.relative_to(SITE)}")
        b.close()

if __name__ == "__main__": main()
