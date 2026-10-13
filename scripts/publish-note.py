#!/usr/bin/env python3
"""Publish a Notes from the Field article to matthewvisher.com from its post kit.

  publish-note.py --no 14 --kit "~/Desktop/Posts & Social/POST-KIT-article-no-14-xxx" [--date 2026-09-22]
                  [--kicker "A · B"] [--dek "..."] [--linkedin URL] [--dry-run]
  publish-note.py --refresh-home [--dry-run]

Reads article-no-NN-*.txt (series line, title, body, Sources block, Checked line), kicker + dek from
cover-NN-site.html in the kit (or flags), clones the newest existing notes/no-*/index.html as the
template, writes notes/no-NN/index.html, adds rel=next to the previous page, inserts the feature card
on notes/index.html, rebuilds the homepage Notes row, updates sitemap.xml. Deploy (wrangler) is a separate step.
"""
import argparse, datetime, html, os, pathlib, re, sys

SITE = pathlib.Path(__file__).resolve().parent.parent
E = lambda s: html.escape(s, quote=False).replace("'", "&#x27;")

def read_kit(kit, no):
    kit = pathlib.Path(os.path.expanduser(kit))
    txts = [t for t in sorted(kit.glob(f"article-no-{no:02d}*.txt")) if ".bak" not in t.name and ".pre-" not in t.name]
    if not txts: sys.exit(f"no article-no-{no:02d}*.txt in {kit}")
    lines = [l.rstrip() for l in txts[0].read_text().split("\n")]
    if "Sources" not in lines: sys.exit("article has no 'Sources' line")
    i = lines.index("Sources")
    head = [l for l in lines[:i] if l.strip()]
    if not head[0].lower().startswith("notes from the field"): sys.exit("line 1 must be the series line")
    title, paras = head[1], head[2:]
    tail = [l for l in lines[i+1:] if l.strip()]
    checked = next((l for l in tail if l.startswith("Checked")), None)
    if not checked: sys.exit("no 'Checked <date>.' line")
    srcs = []
    for l in tail:
        if ": http" in l:
            n, u = l.split(": http", 1); srcs.append((n.strip(), "http" + u.strip()))
    kicker = dek = None
    cov = list(kit.glob(f"cover-{no:02d}-site.html"))
    if cov:
        c = cov[0].read_text()
        m = re.search(r'<p class="eyebrow"><span class="dot"></span>(.*?)</p>', c)
        if m: kicker = html.unescape(re.sub(r"\s*&nbsp;\s*", " ", m.group(1))).strip()
        m = re.search(r'<p class="lead">(.*?)</p>', c, re.S)
        if m: dek = html.unescape(m.group(1)).strip()
    return dict(title=title, paras=paras, srcs=srcs, checked=checked, kicker=kicker, dek=dek)

def prev_note(no):
    nums = sorted(int(p.name[3:]) for p in (SITE/"notes").glob("no-*") if p.name[3:].isdigit() and int(p.name[3:]) < no)
    return nums[-1] if nums else None

def home_block(h, tag, cls):
    tokens = list(re.finditer(rf'<(/?){tag}\b[^>]*>', h))
    starts = []
    for i, m in enumerate(tokens):
        attr = re.search(r'''\bclass=(["'])(.*?)\1''', m.group())
        if not m.group(1) and attr and cls in attr.group(2).split(): starts.append(i)
    if len(starts) != 1: sys.exit(f"index.html must contain exactly one {cls} {tag} block")
    start = starts[0]; depth = 0
    for m in tokens[start:]:
        depth += -1 if m.group(1) else 1
        if depth == 0: return tokens[start].start(), m.end()
    sys.exit(f"index.html has an unclosed {cls} {tag} block")

def home_fields(page, path):
    fields = []
    for name, pattern in (("title", r'<h1 class="article-title">(.*?)</h1>'),
                          ("dek", r'<meta name="description" content="(.*?)" />'),
                          ("long date", r'<span>([A-Z][a-z]+ \d{1,2}, \d{4})</span>')):
        m = re.search(pattern, page, re.S)
        if not m or not m.group(1): sys.exit(f"{path.relative_to(SITE)}: missing {name}")
        fields.append(m.group(1))
    return fields

def rebuild_home(pending=None):
    home = SITE/"index.html"
    if not home.is_file(): sys.exit("index.html is missing")
    h = home.read_bytes().decode("utf-8")
    s, e = home_block(h, "section", "hm-notes")
    start, end = home_block(h[s:e], "div", "hm-cards")
    pages = {p: None for p in (SITE/"notes").glob("no-*") if p.name[3:].isdigit() and (p/"index.html").is_file()}
    if pending: pages[pending[0].parent] = pending[1]
    newest = sorted(pages, key=lambda p: int(p.name[3:]), reverse=True)[:3]
    if len(newest) < 3: sys.exit("home row needs at least three note pages")
    cards = []; nums = []
    for i, p in enumerate(newest):
        page = pages[p] if pages[p] is not None else (p/"index.html").read_text()
        title, dek, date_long = home_fields(page, p/"index.html")
        try: iso = datetime.datetime.strptime(date_long, "%B %d, %Y").date().isoformat()
        except ValueError: sys.exit(f"{p.relative_to(SITE)}/index.html: invalid long date {date_long!r}")
        no = int(p.name[3:]); nums.append(f"NO. {no:02d}")
        style = f' style="--i:{i}"' if i else ""
        cover = ("", " hm-cover--lemon", " hm-cover--paper")[i]
        cards.append(f'          <a class="hm-card reveal" href="/notes/{p.name}/"{style}>\n'
                     f'            <div class="hm-cover{cover}"><div class="hm-cover__top"><span>Notes from the Field</span><b>NO. {no:02d}</b></div><strong>{title}</strong></div>\n'
                     f'            <time datetime="{iso}">{date_long}</time>\n'
                     f'            <p>{dek}</p>\n'
                     '          </a>\n')
    block = '<div class="hm-cards">\n' + "".join(cards) + '        </div>'
    return (h[:s+start] + block + h[s+end:]).encode("utf-8"), ", ".join(nums)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no", type=int); ap.add_argument("--kit")
    ap.add_argument("--date", default=datetime.date.today().isoformat())
    ap.add_argument("--kicker"); ap.add_argument("--dek"); ap.add_argument("--linkedin")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--refresh-home", action="store_true")
    a = ap.parse_args()
    if a.refresh_home:
        home, row = rebuild_home()
        if a.dry_run: print(f"  dry run: index.html (home row: {row})")
        else:
            (SITE/"index.html").write_bytes(home)
            print(f"  updated index.html (home row: {row})")
        return
    if a.no is None or a.kit is None: ap.error("--no and --kit are required unless --refresh-home is given")
    k = read_kit(a.kit, a.no)
    kicker = a.kicker or k["kicker"]; dek = a.dek or k["dek"]
    if not kicker or not dek: sys.exit("need --kicker and --dek (no cover-NN-site.html in kit)")
    kicker_html = re.sub(r"\s*[·•]\s*", " &middot; ", kicker)
    d = datetime.date.fromisoformat(a.date); date_long = f"{d:%B} {d.day}, {d.year}"
    no, prev = a.no, prev_note(a.no)
    if prev is None: sys.exit("no previous note to use as template")
    out = SITE/f"notes/no-{no:02d}/index.html"
    if out.exists() and not a.dry_run: sys.exit(f"{out} exists; remove it to republish")
    tpl_path = SITE/f"notes/no-{prev:02d}/index.html"; tpl = tpl_path.read_text()
    p_title, p_meta, p_date = home_fields(tpl, tpl_path)
    p_kick = re.search(r'<p class="article-kicker">(.*?)</p>', tpl).group(1)
    p_read = re.search(r'(\d+ min read)', tpl).group(1)
    words = sum(len(p.split()) for p in k["paras"]); mins = max(1, round(words/230))
    h = tpl
    h = re.sub(r'\n    <figure class="note-film.*?</figure>\n', "", h, flags=re.S)  # a film belongs to its own note only
    h = h.replace(p_title, E(k["title"]))
    h = h.replace(p_meta, E(dek))
    h = h.replace(f"/notes/no-{prev:02d}/", f"/notes/no-{no:02d}/")
    h = h.replace(f"No. {prev:02d}", f"No. {no:02d}").replace(f"NO. {prev:02d}</span>", f"NO. {no:02d}</span>")
    h = h.replace(p_kick, kicker_html).replace(p_date, date_long).replace(p_read, f"{mins} min read")
    body = "\n".join(('      <p class="first reveal">' if i == 0 else '      <p>') + E(p) + "</p>" for i, p in enumerate(k["paras"]))
    h = re.sub(r'(<article class="article-body">\n).*?(\n    </article>)', lambda m: m.group(1)+body+m.group(2), h, flags=re.S)
    s = '      <p>Sources, so you can check my numbers:</p>\n' + "\n".join(f'      <p><a href="{u}">{E(n)}</a></p>' for n, u in k["srcs"]) + f'\n      <p>{E(k["checked"])}</p>'
    if a.linkedin: s += f'\n      <p>Also on <a href="{a.linkedin}">LinkedIn</a>.</p>'
    h = re.sub(r'(<div class="article-sources">\n).*?(\n    </div>)', lambda m: m.group(1)+s+m.group(2), h, flags=re.S)
    nav = f'      <a rel="prev" href="/notes/no-{prev:02d}/"><small>Previous</small>NO. {prev:02d} &middot; {p_title}</a>'
    h = re.sub(r'(<nav class="article-nav" aria-label="Series">\n).*?(\n    </nav>)', lambda m: m.group(1)+nav+m.group(2), h, flags=re.S)
    # previous page: set rel=next
    t = re.sub(r'\n      <a rel="next".*?</a>', "", tpl, flags=re.S)
    t = re.sub(r'(<nav class="article-nav" aria-label="Series">\n.*?</a>)(\n    </nav>)',
               lambda m: m.group(1)+f'\n      <a rel="next" href="/notes/no-{no:02d}/"><small>Next</small>NO. {no:02d} &middot; {E(k["title"])}</a>'+m.group(2), t, count=1, flags=re.S)
    # index
    idx = SITE/"notes/index.html"; ix = idx.read_text()
    if f"/notes/no-{no:02d}/" in ix: sys.exit("index already has this note")
    card = ('          <li class="card card--feature reveal" style="--i:0">\n'
            f'            <div class="card__meta"><span>NO. {no:02d}</span><span class="status">{date_long}</span></div>\n'
            f'            <h2><a class="note-title" href="/notes/no-{no:02d}/">{E(k["title"])}</a></h2>\n'
            f'            <p>{E(dek)}</p>\n'
            f'            <p class="ev"><a class="link" href="/notes/no-{no:02d}/">Read NO. {no:02d}</a></p>\n          </li>\n')
    ix = ix.replace('<li class="card card--feature reveal"', '<li class="card reveal"', 1)
    ix = ix.replace('<ul class="grid grid--3">\n', '<ul class="grid grid--3">\n' + card, 1)
    c = iter(range(10**6)); ix = re.sub(r'style="--i:\d+"', lambda m: f'style="--i:{next(c)}"', ix)
    # sitemap
    sm = SITE/"sitemap.xml"; x = sm.read_text()
    x = re.sub(rf'(<loc>https://matthewvisher.com/notes/no-{prev:02d}/</loc><lastmod>)[\d-]+(</lastmod></url>\n)',
               lambda m: m.group(1)+a.date+m.group(2)+f'  <url><loc>https://matthewvisher.com/notes/no-{no:02d}/</loc><lastmod>{a.date}</lastmod></url>\n', x)
    x = re.sub(r'(<loc>https://matthewvisher.com/notes/</loc><lastmod>)[\d-]+', lambda m: m.group(1)+a.date, x)
    home, row = rebuild_home((out, h))  # validate before any writes; include the in-memory page on dry runs
    print(f"NO. {no:02d} · {k['title']}\n  {len(k['paras'])} paras · {words} words · {mins} min · {len(k['srcs'])} sources · prev = NO. {prev:02d}\n  kicker: {kicker}\n  dek: {dek}")
    if a.dry_run:
        pathlib.Path("/tmp/publish-note-dryrun.html").write_text(h); print(f"  dry run: page → /tmp/publish-note-dryrun.html\n  dry run: index.html (home row: {row})"); return
    out.parent.mkdir(exist_ok=True); out.write_text(h); tpl_path.write_text(t); idx.write_text(ix); sm.write_text(x)
    print(f"  wrote {out.relative_to(SITE)}, updated no-{prev:02d}, notes/index.html, sitemap.xml")
    (SITE/"index.html").write_bytes(home)
    print(f"  updated index.html (home row: {row})")

if __name__ == "__main__": main()
