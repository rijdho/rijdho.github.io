# CLAUDE.md: rijdho.github.io

Personal hub + academic CV for @rijdho, served at the domain root via GitHub Pages
(user-site repo: the name **must** stay `rijdho.github.io`). Static, dependency-free,
vanilla JS. Part of the violet-family design system (see `../CLAUDE.md`).

## The one rule that shapes everything: single source

`data/cv.json` is the only place CV content lives. Three consumers read it:

- `index.html`: the hub. `fetch('./data/cv.json')` → derives `DATA` (apps = `experiments`,
  writing = `portfolio`) and `EXTRA` (the tab categories), then renders the cloud + tabs.
  Topic assignment for the cloud is the `topic` field on each experiment, and **it is data**,
  edit it there, not in code. Topic *labels/colours* are config (the `TOPICS` object in
  `index.html`). The text inside an oval is config too: the `SHORT` table maps a title to a
  short label, and anything unmatched falls back to the title itself. **A new tool needs a
  `SHORT` entry**, or its oval shows whatever the title is, which for the open twins is the
  repository slug. That is the right name in a citation and the wrong one in a 46px oval,
  and the real name is still one hover away in the tooltip. `tests/hub-ui.test.mjs` fails on
  a label that is slug-shaped, longer than 20 characters, or a case-only duplicate of
  another (which "BiblioHelp" and "bibliohelp" were).
- `cv.html`: the academic CV. Same fetch, formal layout, `Print / PDF` via `window.print()`.
- `build_cv.py`: emits `CV.en.md` / `CV.de.md` / `CV.es.md`.

### What lives where: content in `cv.json`, interface in `UI`

The hub keeps a `UI` object with one entry per language. It holds **interface language
only**: button labels, section headings, the cloud hint, "No public URL". Anything the CV
*says* lives in `cv.json` and reaches the page through `data-p="<key>"`, read from
`personal` by `render()` with the same `de → en` fallback as everything else. `data-t` is
the interface half, `data-p` the content half, and the two never overlap.

Until 2026-08-26 the hero broke this: the eyebrow, the tagline, the one-line headline and
the name were literals inside `UI`, in three languages, while `cv.html` and `build_cv.py`
read `personal.tagline` and `personal.summary` from `cv.json`. Two of three consumers went
to the source and the third carried its own copy, which had already drifted: the tagline
existed as a slash-separated list in `cv.json` and a full-stop-separated one in `UI`.

Two literals are kept on purpose, and both are overwritten by `render()` on load: the name
in the `<h1>` and the ORCID chip. They are the page's identity, neither ever changes, and
the site has no `og:` tags, so raw HTML is all a link unfurler gets. Prose is never
duplicated this way, because prose is what actually changes.

**To update anything on the site, edit `data/cv.json` and nothing else.** The pages fetch
it at load, so the change is live immediately. `CV.*.md` is a build artifact, so run
`python3 build_cv.py` (the Action also does it on push). Never hand-edit the `.md` files or
re-inline data into the HTML; that reintroduces the drift this structure exists to kill.

Trilingual text fields are `{en, de, es}` objects; consumers fall back `de → en`. **All
three languages are complete as of 2026-08-03**: tagline, summary, skills titles *and*
items, and every long description in `experience`, `training`, `engagements`, `portfolio`
and `experiments`. The German fallback note that used to sit under the cloud is gone; if you
add an entry, fill all three keys rather than reintroducing it. `skills[].items` are `{en,
de, es}` objects, not plain strings, and that was the last place English leaked into the ES/DE
views. `education[].degree` is trilingual too, and its Spanish is the wording the author
deposited in **ORCID** (`pub.orcid.org/v3.0/0000-0001-5058-9309/educations` and
`/qualifications`), not a translation invented here, so check that record before editing a
degree name. Job titles, publication titles and talk titles do stay in their original
language on purpose.

## Links in the CV lists: the title, and a chip that tells the truth

Every row across the tabbed section and the CV page follows one shape: **the title is the
link, never the whole row.** Wrapping the row in an `<a>` underlines the year, the eyebrow
and the blurb along with it. That was the Writing tab until 2026-08-03, and it was the only
one of the seven tabs doing it.

The right-hand chip (`linkChip()` in `index.html`) labels itself from the URL: `DOI` only
when it actually matches `doi.org`, otherwise the host via the existing `srcLabel()`. Do not
hard-code the label: it used to read `DOI →` for every entry that had any URL at all, so a
publisher homepage was presented as a persistent identifier. An entry with no `url` gets no
chip, which is the honest rendering and the visible prompt to go find the missing link.

## Fetch, not inline

The pages read `cv.json` at runtime. Consequence: they only work over `http://`, not
`file://` (CORS blocks `fetch` of a local file). Serve with `python3 -m http.server`.
On Pages this is a non-issue. Do not "fix" a blank local `file://` open by re-inlining the
data. Serve it instead.

## Fonts: self-hosted, never a CDN

Inter variable woff2 in `fonts/` (latin + latin-ext), declared `@font-face` against this
origin, split by `unicode-range`. No Google Fonts link (GDPR + a strict CSP would block it
silently). Verify in a browser that font requests hit only this origin.

## Link previews

`build_cv.py` also writes the `og:`/`description` block between the `<!-- social:start -->`
and `<!-- social:end -->` markers in `index.html` and `cv.html`. Do not edit that block by
hand; edit `data/cv.json` and rebuild. It exists because an unfurler (LinkedIn, Slack, a
mail client) reads the raw HTML and never runs the fetch that builds the page, so without
it a shared link showed the `<title>` and nothing else. Generating it keeps the card tied
to `personal.name` and `personal.headline` instead of a hand-typed copy that would drift.

Static HTML carries one language, so the card is English while the pages stay trilingual.
The image is `docs/hub-cloud.png`, the screenshot that already regenerates itself, and its
declared width and height are read from the PNG header so they cannot go stale. Running
the build twice rewrites the same block; the guard fires only when the markers are gone.

## Deploy

Actions workflow (`.github/workflows/deploy.yml`), not the legacy Jekyll builder, so the
folder uploads verbatim. The build step regenerates `CV.*.md` so the deployed copies are
always current even if a commit forgot to. A single static `index.html` at the root needs
no `404.html` SPA shell.

## Versioning and screenshots

`CHANGELOG.md` is Keep a Changelog + SemVer, with `v1.0.0` at the initial public site
(2026-07-31) and a version cut whenever the content or the shape of `cv.json` changes enough
to name. This site deploys continuously, so a version is a readable marker in the history,
not something anyone installs, and that reasoning is written into the changelog's preamble so
the next person does not have to reconstruct it. Tag the commit (`git tag -a vX.Y.Z`) so the
compare links at the bottom of the file resolve; there is no Zenodo integration here, so no
GitHub Release is required and no `CITATION.cff` belongs in this repo.

README images come from `docs/screenshots.mjs`, which drives the real pages, never a
hand-cropped grab, which cannot be regenerated and ages into a lie. It seeds `Math.random`
and emulates `prefers-reduced-motion` so the cloud's physics settle identically each run;
without that, every regeneration reshuffles the ovals (25 of them) and the diff is noise. Puppeteer is a
tooling-only dependency and the site keeps no `package.json`.

## Before going/staying public: the leak sweep

This is a user-site: **public by nature**, no private phase. Run the sweep (working tree
**and** history, see `../CLAUDE.md` → "Going public") before every push. The data here is
already public (it is a CV), but the habit stays. Naming a hosted sibling that has a public
URL is fine (the CV links several); describing *how* any of them is defended never belongs
in `cv.json` or these pages; that rule and its specifics live in the private `../CLAUDE.md`
and `~/.claude`, never here.

## Storefront

About block filled (`gh repo edit --description … --homepage https://rijdho.github.io/
--add-topic …`). The page carries its own About (footer: author · license · source). The
CV page links back to the hub; the hub's "Full CV →" links to `cv.html`, **not** to
life.rijdho.org. This repo is deliberately independent of life.
