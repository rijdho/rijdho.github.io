# CLAUDE.md — rijdho.github.io

Personal hub + academic CV for @rijdho, served at the domain root via GitHub Pages
(user-site repo: the name **must** stay `rijdho.github.io`). Static, dependency-free,
vanilla JS. Part of the violet-family design system (see `../CLAUDE.md`).

## The one rule that shapes everything: single source

`data/cv.json` is the only place CV content lives. Three consumers read it:

- `index.html` — the hub. `fetch('./data/cv.json')` → derives `DATA` (apps = `experiments`,
  writing = `portfolio`) and `EXTRA` (the tab categories), then renders the cloud + tabs.
  Topic assignment for the cloud is the `topic` field on each experiment — **it is data**,
  edit it there, not in code. Topic *labels/colours* are config (the `TOPICS` object in
  `index.html`).
- `cv.html` — the academic CV. Same fetch, formal layout, `Print / PDF` via `window.print()`.
- `build_cv.py` — emits `CV.en.md` / `CV.de.md` / `CV.es.md`.

**To update anything on the site, edit `data/cv.json` and nothing else.** The pages fetch
it at load, so the change is live immediately. `CV.*.md` is a build artifact — run
`python3 build_cv.py` (the Action also does it on push). Never hand-edit the `.md` files or
re-inline data into the HTML; that reintroduces the drift this structure exists to kill.

Trilingual text fields are `{en, de, es}` objects; consumers fall back `de → en`. **All
three languages are complete as of 2026-08-03** — tagline, summary, skills titles *and*
items, and every long description in `experience`, `training`, `engagements`, `portfolio`
and `experiments`. The German fallback note that used to sit under the cloud is gone; if you
add an entry, fill all three keys rather than reintroducing it. `skills[].items` are `{en,
de, es}` objects, not plain strings — that was the last place English leaked into the ES/DE
views. Job titles, degree names, publication titles and talk titles stay in their original
language on purpose.

## Fetch, not inline

The pages read `cv.json` at runtime. Consequence: they only work over `http://`, not
`file://` (CORS blocks `fetch` of a local file). Serve with `python3 -m http.server`.
On Pages this is a non-issue. Do not "fix" a blank local `file://` open by re-inlining the
data — serve it instead.

## Fonts: self-hosted, never a CDN

Inter variable woff2 in `fonts/` (latin + latin-ext), declared `@font-face` against this
origin, split by `unicode-range`. No Google Fonts link (GDPR + a strict CSP would block it
silently). Verify in a browser that font requests hit only this origin.

## Deploy

Actions workflow (`.github/workflows/deploy.yml`), not the legacy Jekyll builder, so the
folder uploads verbatim. The build step regenerates `CV.*.md` so the deployed copies are
always current even if a commit forgot to. A single static `index.html` at the root needs
no `404.html` SPA shell.

## Before going/staying public — the leak sweep

This is a user-site: **public by nature**, no private phase. Run the sweep (working tree
**and** history — see `../CLAUDE.md` → "Going public") before every push. The data here is
already public (it is a CV), but the habit stays. Naming a hosted sibling that has a public
URL is fine (the CV links several); describing *how* any of them is defended never belongs
in `cv.json` or these pages — that rule and its specifics live in the private `../CLAUDE.md`
and `~/.claude`, never here.

## Storefront

About block filled (`gh repo edit --description … --homepage https://rijdho.github.io/
--add-topic …`). The page carries its own About (footer: author · license · source). The
CV page links back to the hub; the hub's "Full CV →" links to `cv.html` — **not** to
life.rijdho.org. This repo is deliberately independent of life.
