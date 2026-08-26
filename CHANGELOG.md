# Changelog

All notable changes to this site are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Versioning a continuously-deployed personal site is a slightly odd fit: every push to
`main` is live within a minute, so there is no separate "release" a user can choose to
install. A version is cut here whenever the content or the shape of `data/cv.json` changes
enough to be worth naming, which keeps the history readable without pretending the site
ships in numbered drops.

## [Unreleased]

### Added

- The Barcelona Declaration WG7-TF2 contribution: eight benefits of open research
  information in three axes, published as an interactive explorer rather than a PDF, with
  one machine-readable taxonomy behind the explorer, the brief and the flow map. Recorded
  as `Draft`, not `Active`, because the brief sits at v0.1 and the task force has not
  reviewed it: the field exists to say that out loud rather than to flatter the entry.
  The oval carries the curated short label `ORI Benefits`, since the full title would draw
  an oval half a cluster wide.

### Changed

- The four longest IT:U titles get curated short labels in the cloud, the mechanism the
  table already existed for: `DART Docs`, `Renku 2.0 (IT:U)`, `OS Strategy (IT:U)` and
  `maDMP Template`. The full title still shows on hover and in the panel. The widest oval
  drops from 200px to 164px, which is what actually governs how many ovals a cluster can
  hold. On a seeded desktop layout the deepest overlap between two unrelated ovals falls
  from 8px to 6px.
- The cloud is 600px tall below 560px wide, up from 440px. Narrow screens were the case
  the shorter labels alone could not fix: 24 ovals in a 386px-wide canvas overlapped by up
  to 89px and stacked their labels into an unreadable pile. Shorter labels took that to
  30px and the taller canvas to 27px, with the overlapping pairs down from 32 to 17 and
  every label legible again.

- Link-preview tags on both pages, written by `build_cv.py` from `data/cv.json` into a
  marked block in the HTML. Sharing the site anywhere previously produced a card carrying
  the `<title>`, "rijdho: hub (nube)", and nothing else: no name, no description, no image,
  because an unfurler reads raw HTML and never runs the fetch that builds the page. The
  card now carries the name, the headline and the cloud screenshot. Generated rather than
  typed, so it cannot drift from the CV; English only, since static HTML has one language.

- The summary says what the current role actually consists of: the shape of the Open
  Science strategy (three pillars and a transversal axis on the use of AI in research, three
  horizons on the SCOPE framework, indicators following DORA, the Leiden Manifesto and
  CoARA) and the systems built underneath it. It stays at the level of design decisions and
  public frameworks, with no institutional figures, targets or deadlines, since none of that
  is published. Three paragraphs now: the current role, the Ludwig Boltzmann mission, and
  the closing statement of focus, which were previously two.
- The indicator count is given as more than fifteen rather than an exact figure. The exact
  figure was also wrong: the entries said seventeen while the framework carries nineteen.

- The hub's hero reads its content from `cv.json` instead of carrying its own copy. The
  eyebrow, the tagline, the one-line headline and the name were literals inside the `UI`
  object in three languages, while the CV page and `build_cv.py` read `personal` from the
  single source: two of three consumers went to the data and the third did not, and the
  tagline had already drifted into two versions, slash-separated in `cv.json` and
  full-stop-separated in the hub. `personal` gains `kicker` and `headline`, the hero fills
  from `data-p` attributes, and `UI` keeps interface language only. The hub's tagline line
  therefore now reads with the slashes the other two surfaces already used. The name and
  the ORCID chip keep a literal in the HTML as well, overwritten on load, because they are
  the page's identity and there are no `og:` tags to carry it otherwise.
- Every em dash is gone, from `cv.json` and both pages down to the code comments, the
  `.gitignore` and the licence note: 101 of them, replaced one at a time by a colon, a
  comma, parentheses or a sentence break rather than swapped blindly. Two cases were
  structural rather than punctuation. Nine tool titles used " - " as a name/subtitle
  separator and now use a colon, which meant `shortOf()` had to split on `": "` with the
  space, since `CRIS for IT:U` would otherwise be cut at `CRIS for IT`. The CV page and
  `build_cv.py` used the dash to join a role to its organisation and a degree to its
  institution; they now use the middle dot the hub and the training rows already used.
- The engagements rows no longer print a dash in the year column. Engagements carry no
  year, and every other row type renders an empty column when the year is missing, so the
  dash was inventing a value the data does not have.

### Removed

- The `criolab` card. The project is retired and its repository deleted, so a card linking
  to it would point at a 404. Nothing cited it: no DOI, no release, no fork. A verified
  full-history bundle is kept outside every repository.

## [1.2.0] - 2026-08-26

The IT:U systems join the cloud, and the cloud is given the room to hold them.

### Added

- Seven entries for the work built at IT:U since May 2026: the **CRIS** and the **RMS**,
  the **OpenCalls** aggregator, the **Open Science Strategy**, the **maDMP Template**, the
  **Renku 2.0 deployment** and the **DART documentation generators**. None of them has a
  public URL yet, so each renders its oval without a link and its panel says so, which is
  the honest rendering rather than a chip pointing nowhere. All three languages filled at
  the same time, as the single-source rule requires.
- `/bibliohelpc/` redirect alias → `/bibliohelp/`. The BiblioHelp repo dropped the `c` of
  its Cloudflare edition on 2026-08-10 (renamed `bibliohelpc` → `bibliohelp`); GitHub
  redirects the git repo but not project-Pages URLs, so old landing links get forwarded
  here. Marked `noindex` with a canonical to the new path. (Earlier the same day the
  alias existed in the opposite direction (`/bibliohelp/` → `/bibliohelpc/`) until the
  rename made the guessed URL the real one.)

### Changed

- The `bibliohelpc` experiment card follows the repo rename: title and URL now read
  `bibliohelp` / `rijdho.github.io/bibliohelp/`.
- The main BiblioHelp card no longer describes the decommissioned Docker/MeiliSearch
  version: description (all three languages) and tags now state the live stack, SvelteKit
  and Hono entirely on Cloudflare with D1 + Vectorize as the semantic cache, and the
  trilingual availability (EN/ES/DE) the app ships since 2026-08-10.
- The Open Science Expert entry now describes the strategy it actually runs: three pillars
  and a transversal axis on AI in research, three horizons on the SCOPE framework, and
  seventeen indicators governed by DORA, the Leiden Manifesto and CoARA, followed by the
  systems built underneath it.
- The cloud canvas grows from 380px to 460px tall on desktop. At 380px the four clusters
  had to hold 24 ovals instead of 17, and the widest new titles could not settle without
  crossing each other: measured over a seeded layout, the deepest overlap between two
  unrelated ovals fell from 11px to 8px and the number of overlapping pairs from 18 to 14,
  with every label back inside its own oval. Related pairs still touch on purpose.
- README: the cloud screenshot is regenerated and its alt text states the new counts
  (24 ovals; 7 / 5 / 9 / 3), and the prose no longer says seventeen tools.

### Fixed

- The CV page rendered the whole summary as a single text node, so the paragraph breaks it
  is authored with collapsed into spaces and the paragraphs ran together as one block. It
  now emits one `<p>` per paragraph, the same shape `build_cv.py` has always produced.
- The curated short-label table matched `maDMP` anywhere in a title, so the new *maDMP
  Template (IT:U)* was drawn as a second oval reading **maDMP Gap**: two identical labels
  on two different tools. The pattern is now anchored to `maDMP Gap`, and the new entry
  falls through to its own title. Verified across all 24 ovals: no duplicate labels.
- The detail panel is hidden by translating it 360px past the right edge of the stage, and
  nothing clipped it, so the document was 348px wider than the viewport and the whole page
  could be dragged sideways on every screen above 620px. `.stage` now clips on the X axis,
  with a 24px clip margin so the open panel keeps its shadow. Measured: the page no longer
  scrolls horizontally, and the panel opens and renders exactly as before.
- The Licenciatura and the Título Profesional are two separate Chilean credentials awarded a
  year apart, and the entry carried the name of one with the year of the other. They are now
  two entries: *Licenciado en Tecnología Médica* (2006) and *Título Profesional de Tecnólogo
  Médico* (2007).
- Both pages declare `<!doctype html>`. Without it they rendered in quirks mode, where the
  browser emulates 1990s bugs: a latent trap for any future CSS change rather than a visible
  fault. Measured before applying: the hub is pixel-identical, the CV page grows 11px over a
  9,940px document (two list sections, 5px each), the printed PDF keeps its page count, and
  the three README screenshots regenerate byte-identical.

## [1.1.0] - 2026-08-03

A full review pass over `data/cv.json` and its three consumers.

### Added

- German content for every translated field: 40 descriptions across `experience`,
  `training`, `engagements`, `portfolio` and `experiments`, plus the skills. The site was
  already trilingual in its interface; now it is trilingual in its content too.
- `twin` on an experiment: `{ "title": …, "url": … }` renders a `↔` link in the cloud panel,
  on the CV page and in the Markdown. It exists so a description that names another tool
  ("the open twin of X") can reach it without adding X to the cloud as a bubble.
- `personal.emailIsAlias`, which appends *(alias)* next to the address.
- `education[].degree` is now a translated field rather than a plain string.
- `docs/screenshots.mjs`, which drives the real pages to regenerate the README images. It
  seeds `Math.random` and emulates reduced motion so the physics-driven cloud lays out the
  same way every run, and a regenerated screenshot produces a meaningful diff.
- This changelog.

### Changed

- Post-nominals read `MSc · MSc · Dr.`: both master's degrees, and the doctorate as the
  Chilean *Doctor en …* it is rather than an Anglo-American PhD.
- Degree names now carry the wording deposited in ORCID `0000-0001-5058-9309`. Comparing
  against that record corrected the 2013 Universidad de La Frontera master, which was
  listed under the doctorate's name, and the 2018 Universidad de Chile entry, which is a
  *Diploma de Postítulo* (a postgraduate diploma) where the English said only "Diploma".
  "Lic Medical Technologist" became "Licentiate in Medical Technology".
- Languages are stated as Spanish native and technical English.
- `skills[].items` are `{en, de, es}` objects. As plain strings they were the last place
  English leaked into the Spanish and German views.
- In the tabbed lists the link sits on the title. The Writing tab used to wrap each row in
  a single `<a>`, which underlined the year, the type and the description along with it.
- The Skills4EOSC entry no longer says "currently enrolled" a year after the fact.

### Fixed

- **Both pages now declare `<meta charset="utf-8">`.** GitHub Pages sends `charset=utf-8` in
  the response header, so the live site always looked right, but the local workflow this
  README documents (`python3 -m http.server`, which sends no charset) fell back to
  windows-1252 and rendered every accent and umlaut as mojibake.
- The publication chip no longer labels every link "DOI". It said so for any entry that had
  a URL at all, so a publisher homepage was presented as a persistent identifier.
- `deLbl()` and `t()` pass a bare string through instead of returning `""`, so a field not
  yet converted to `{en, de, es}` renders its text rather than vanishing silently.
- The README said 13 tools; there are 17.

### Removed

- The German fallback banners on both pages, and with them a reference to `cv.de.json`,
  a file that never existed.

### Security

- The Repo MetAudits description said its FAIR engine runs server-side "for IP protection".
  That is a statement about how a hosted sibling is defended, which does not belong in
  published material. Only the clause is gone; the architectural fact remains.

## [1.0.0] - 2026-07-31

Initial public site.

### Added

- `data/cv.json` as the single source, with three consumers: the interactive hub
  (`index.html`), the academic CV page (`cv.html`) and `build_cv.py`, which emits
  `CV.en.md`, `CV.de.md` and `CV.es.md`.
- The tool cloud: ovals grouped by topic, related projects attracted so they touch, drag and
  filter, and a detail panel per tool.
- Open GitHub twins drawn as dashed bubbles paired with their hosted counterparts, and
  Zenodo DOIs shown inside the oval.
- Deployment through a GitHub Actions workflow rather than the legacy Jekyll builder, so the
  folder uploads verbatim and the Markdown CVs are regenerated on every push.
- Inter self-hosted as woff2, no font CDN.

[Unreleased]: https://github.com/rijdho/rijdho.github.io/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/rijdho/rijdho.github.io/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/rijdho/rijdho.github.io/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rijdho/rijdho.github.io/releases/tag/v1.0.0
