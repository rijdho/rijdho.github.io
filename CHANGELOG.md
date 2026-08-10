# Changelog

All notable changes to this site are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Versioning a continuously-deployed personal site is a slightly odd fit — every push to
`main` is live within a minute, so there is no separate "release" a user can choose to
install. A version is cut here whenever the content or the shape of `data/cv.json` changes
enough to be worth naming, which keeps the history readable without pretending the site
ships in numbered drops.

## [Unreleased]

### Added

- `/bibliohelp/` redirect alias → `/bibliohelpc/`. The tool is branded BiblioHelp but its
  repo (and Pages path) carries the `c` of the Cloudflare edition; the guessed URL now
  lands on the real landing instead of a 404. Marked `noindex` with a canonical link so
  only the real path is indexed.

### Fixed

- The Licenciatura and the Título Profesional are two separate Chilean credentials awarded a
  year apart, and the entry carried the name of one with the year of the other. They are now
  two entries: *Licenciado en Tecnología Médica* (2006) and *Título Profesional de Tecnólogo
  Médico* (2007).
- Both pages declare `<!doctype html>`. Without it they rendered in quirks mode, where the
  browser emulates 1990s bugs — a latent trap for any future CSS change rather than a visible
  fault. Measured before applying: the hub is pixel-identical, the CV page grows 11px over a
  9,940px document (two list sections, 5px each), the printed PDF keeps its page count, and
  the three README screenshots regenerate byte-identical.

## [1.1.0] — 2026-08-03

A full review pass over `data/cv.json` and its three consumers.

### Added

- German content for every translated field — 40 descriptions across `experience`,
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

- Post-nominals read `MSc · MSc · Dr.` — both master's degrees, and the doctorate as the
  Chilean *Doctor en …* it is rather than an Anglo-American PhD.
- Degree names now carry the wording deposited in ORCID `0000-0001-5058-9309`. Comparing
  against that record corrected the 2013 Universidad de La Frontera master, which was
  listed under the doctorate's name, and the 2018 Universidad de Chile entry, which is a
  *Diploma de Postítulo* — a postgraduate diploma — where the English said only "Diploma".
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
  README documents — `python3 -m http.server`, which sends no charset — fell back to
  windows-1252 and rendered every accent and umlaut as mojibake.
- The publication chip no longer labels every link "DOI". It said so for any entry that had
  a URL at all, so a publisher homepage was presented as a persistent identifier.
- `deLbl()` and `t()` pass a bare string through instead of returning `""`, so a field not
  yet converted to `{en, de, es}` renders its text rather than vanishing silently.
- The README said 13 tools; there are 17.

### Removed

- The German fallback banners on both pages, and with them a reference to `cv.de.json` —
  a file that never existed.

### Security

- The Repo MetAudits description said its FAIR engine runs server-side "for IP protection".
  That is a statement about how a hosted sibling is defended, which does not belong in
  published material. Only the clause is gone; the architectural fact remains.

## [1.0.0] — 2026-07-31

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

[Unreleased]: https://github.com/rijdho/rijdho.github.io/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/rijdho/rijdho.github.io/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rijdho/rijdho.github.io/releases/tag/v1.0.0
