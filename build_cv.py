#!/usr/bin/env python3
"""Generate CV.<lang>.md from data/cv.json, the single source the hub and CV page also read.
Usage: python3 build_cv.py            # builds en, de, es
       python3 build_cv.py en         # one language
Run it whenever data/cv.json changes (the GitHub Action does this on push)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
CV = json.load(open(os.path.join(HERE, "data", "cv.json"), encoding="utf-8"))

LABELS = {
  "en": {"experience":"Experience","education":"Education","publications":"Publications",
    "presentations":"Talks & presentations","skills":"Skills","engagements":"Engagements",
    "training":"Training","portfolio":"Writing","experiments":"Tools & experiments",
    "generated":"Generated from data/cv.json"},
  "de": {"experience":"Berufserfahrung","education":"Ausbildung","publications":"Publikationen",
    "presentations":"Vorträge & Präsentationen","skills":"Kompetenzen","engagements":"Engagements",
    "training":"Weiterbildung","portfolio":"Publizistik","experiments":"Werkzeuge & Experimente",
    "generated":"Generiert aus data/cv.json"},
  "es": {"experience":"Experiencia","education":"Formación","publications":"Publicaciones",
    "presentations":"Charlas y presentaciones","skills":"Competencias","engagements":"Participaciones",
    "training":"Formación continua","portfolio":"Escritos","experiments":"Herramientas y experimentos",
    "generated":"Generado desde data/cv.json"},
}
PUBGRP = {"peerReviewed":{"en":"Peer-reviewed","de":"Begutachtet","es":"Revisadas por pares"},
  "policyPapers":{"en":"Policy papers","de":"Policy Papers","es":"Documentos de política"},
  "guides":{"en":"Guides","de":"Leitfäden","es":"Guías"},
  "datasets":{"en":"Datasets","de":"Datensätze","es":"Conjuntos de datos"},
  "workingPapers":{"en":"Working papers","de":"Working Papers","es":"Documentos de trabajo"}}

def build(lang):
    T = LABELS[lang]
    tr = lambda o: (o.get(lang) or o.get("en") or "") if isinstance(o, dict) else (o or "")
    L=[]; w=L.append
    p=CV["personal"]
    w(f"# {p['name']}")
    if p.get("degrees"): w(f"*{', '.join(p['degrees'])}*")
    w(""); w(f"**{tr(p['tagline'])}**"); w("")
    for para in tr(p["summary"]).split("\n\n"): w(para); w("")
    c=[]
    if p.get("email"): c.append(f"✉ {p['email']}" + (" (alias)" if p.get("emailIsAlias") else ""))
    if p.get("orcid"): c.append(f"[ORCID {p['orcid']}](https://orcid.org/{p['orcid']})")
    if p.get("substack"): c.append(f"[Substack]({p['substack']})")
    if c: w(" · ".join(c)); w("")
    sec=lambda k: (w(f"\n## {T[k]}\n"))

    sec("experience")
    for e in CV["experience"]:
        w(f"### {e['title']} · {e['org']}")
        meta=" · ".join(x for x in [e.get('period'), e.get('loc')] if x)
        if meta: w(f"*{meta}*")
        if tr(e.get('desc')): w(""); w(tr(e['desc']))
        w("")
    sec("education")
    for e in CV["education"]:
        w(f"- **{tr(e['degree'])}**, {e['inst']}" + (f" ({e['year']})" if e.get('year') else ""))
    sec("skills")
    for s in CV["skills"]:
        w(f"- **{tr(s['title'])}:** {', '.join(tr(i) for i in s['items'])}")
    sec("publications")
    for g,lab in PUBGRP.items():
        items=CV["publications"].get(g) or []
        if not items: continue
        w(f"### {tr(lab)}\n")
        for it in items:
            t=f"[{it['title']}]({it['url']})" if it.get('url') else it['title']
            line=f"- {it.get('authors','')} ({it.get('year','')}). {t}."
            if it.get('venue'): line+=f" *{it['venue']}*."
            w(line)
        w("")
    sec("presentations")
    for t in CV["presentations"]:
        w(f"- **{t['title']}** · {t.get('event','')}" + (f" ({t['date']})" if t.get('date') else ""))
    sec("portfolio")
    for e in CV["portfolio"]:
        t=f"[{e['title']}]({e['url']})" if e.get('url') else e['title']
        w(f"- {t}" + (f" ({e['year']})" if e.get('year') else "") + (f", *{e['type']}*" if e.get('type') else ""))
    sec("experiments")
    for e in CV["experiments"]:
        t=f"[{e['title']}]({e['url']})" if e.get('url') else e['title']
        w(f"### {t}")
        meta=" · ".join(x for x in [e.get('status'), e.get('year'), ', '.join(e.get('tags',[])[:4])] if x)
        if meta: w(f"*{meta}*")
        if tr(e.get('desc')): w(""); w(tr(e['desc']))
        tw=e.get('twin')
        if tw and tw.get('url'): w(""); w(f"↔ [{tw.get('title') or tw['url']}]({tw['url']})")
        w("")
    sec("engagements")
    for e in CV["engagements"]:
        w(f"- **{e['role']}**, {e['org']} · {tr(e.get('focus'))}")
    sec("training")
    for e in CV["training"]:
        w(f"- **{e['title']}**" + (f" ({e['year']})" if e.get('year') else "") + (f": {tr(e['desc'])}" if tr(e.get('desc')) else ""))
    w(""); w(f"---"); w(f"*{T['generated']} · {CV.get('meta',{}).get('updated','')}*")
    out="\n".join(L).rstrip()+"\n"
    open(os.path.join(HERE,f"CV.{lang}.md"),"w",encoding="utf-8").write(out)
    return len(out)

SITE = "https://rijdho.github.io/"
CARD = "docs/hub-cloud.png"

def social():
    """Write the link-preview tags into both pages.

    An unfurler (LinkedIn, Slack, WhatsApp, a mail client) fetches the HTML and never
    runs the fetch that builds the page, so these tags are the only thing it can see.
    They are generated here, from data/cv.json, rather than typed into the HTML, so
    they cannot drift from the CV the way a hand-written copy would. Static HTML has
    one language: these are English, while the pages themselves stay trilingual.
    """
    import re, struct
    P = CV["personal"]
    name = P["name"]
    desc = (P.get("headline") or {}).get("en", "")
    png = open(os.path.join(HERE, CARD), "rb").read(33)
    w, h = struct.unpack(">II", png[16:24])
    alt = ("The tool cloud on the hub: ovals grouped into four colour-coded topics, "
           "one per tool.")
    pages = {
        "index.html": (name, desc, SITE),
        "cv.html": (f"{name}: Curriculum Vitae", desc, SITE + "cv.html"),
    }
    e = lambda t: (t.replace("&", "&amp;").replace('"', "&quot;")
                    .replace("<", "&lt;").replace(">", "&gt;"))
    for f, (title, d, url) in pages.items():
        tags = [
            '<!-- social:start -->',
            '<!-- Generated by build_cv.py from data/cv.json. Do not edit by hand. -->',
            f'<meta name="description" content="{e(d)}">',
            '<meta property="og:type" content="website">',
            f'<meta property="og:site_name" content="{e(name)}">',
            f'<meta property="og:title" content="{e(title)}">',
            f'<meta property="og:description" content="{e(d)}">',
            f'<meta property="og:url" content="{e(url)}">',
            f'<meta property="og:image" content="{e(SITE + CARD)}">',
            f'<meta property="og:image:width" content="{w}">',
            f'<meta property="og:image:height" content="{h}">',
            f'<meta property="og:image:alt" content="{e(alt)}">',
            '<meta name="twitter:card" content="summary_large_image">',
            '<!-- social:end -->',
        ]
        path = os.path.join(HERE, f)
        html = open(path, encoding="utf-8").read()
        if "<!-- social:start -->" not in html or "<!-- social:end -->" not in html:
            raise SystemExit(f"{f}: social markers missing, nothing written")
        # a second run rewrites the same block, so out == html is the normal case
        out = re.sub(r"<!-- social:start -->.*?<!-- social:end -->",
                     "\n".join(tags), html, count=1, flags=re.S)
        open(path, "w", encoding="utf-8").write(out)
        print(f"{f}   link-preview tags")

langs = sys.argv[1:] or ["en","de","es"]
for lg in langs:
    n=build(lg); print(f"CV.{lg}.md  {n} bytes")
social()
