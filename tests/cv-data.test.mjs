// data/cv.json is the single source three consumers read: index.html (the hub),
// cv.html (the full CV) and build_cv.py (which regenerates CV.<lang>.md). It is
// edited by hand and nothing checked it before the site went live.
//
// Malformed JSON was already caught, because build_cv.py parses the file at
// import time and a failing step blocks the deploy. What was not caught is the
// worse case: valid JSON that is wrong. Those fail in the visitor's browser,
// silently, and the tests below are aimed at exactly those.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const CV = JSON.parse(read('../data/cv.json'));
const html = read('../index.html');

/** The sections all three consumers index into, taken from the consumers. */
const SECTIONS = ['personal', 'skills', 'experience', 'education', 'training',
                  'engagements', 'presentations', 'publications', 'portfolio', 'experiments'];

test('every section the page and the CV builder read exists', () => {
  for (const s of SECTIONS) assert.ok(s in CV, `data/cv.json has no "${s}"`);
});

test('the sections have the shape their consumers iterate', () => {
  // Everything is a flat list except `publications`, which is an object of five
  // named categories, each a list. Getting this wrong is not hypothetical: the
  // first run of this suite asserted the flat shape and publications caught it.
  const flat = SECTIONS.filter((x) => x !== 'personal' && x !== 'publications');
  for (const s of flat) assert.ok(Array.isArray(CV[s]), `"${s}" must be an array`);
  assert.ok(CV.publications && !Array.isArray(CV.publications), 'publications is an object of categories');
  for (const [name, list] of Object.entries(CV.publications))
    assert.ok(Array.isArray(list), `publications.${name} must be an array`);
});

// ── the descriptions ────────────────────────────────────────────────────────

test('every experiment and portfolio entry carries desc.en and desc.es', () => {
  // index.html does `blurb_en: e.desc.en, blurb_es: e.desc.es, blurb_de: e.desc.de || ""`.
  // A missing `desc` throws there and the whole page renders blank; a missing
  // `.es` renders the string "undefined" to a Spanish reader. Only `.de` has a
  // fallback in the code, so only `.de` is optional here.
  for (const key of ['experiments', 'portfolio'])
    for (const e of CV[key]) {
      const who = `${key}: ${e.title ?? e.id ?? '(untitled)'}`;
      assert.ok(e.desc && typeof e.desc === 'object', `${who} has no desc`);
      for (const lang of ['en', 'es'])
        assert.ok(typeof e.desc[lang] === 'string' && e.desc[lang].trim(), `${who} has no desc.${lang}`);
    }
});

test('every entry has a title and a year', () => {
  for (const key of ['experiments', 'portfolio'])
    for (const e of CV[key]) {
      assert.ok(e.title, `${key}: an entry has no title`);
      assert.ok(e.year, `${key}: "${e.title}" has no year`);
    }
});

// ── the fields the interface switches on ────────────────────────────────────

test('every experiment topic is one the interface knows how to colour', () => {
  // Read from index.html rather than restated here: a topic added to the UI and
  // not to this test would otherwise look like a failure, and a typo in the data
  // renders a bubble with an undefined colour, which reads as a rendering bug.
  const block = /const TOPICS\s*=\s*{([\s\S]*?)^};/m.exec(html);
  assert.ok(block, 'could not find the TOPICS table in index.html');
  const known = [...block[1].matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1]);
  assert.ok(known.length >= 3, 'suspiciously few topics parsed');
  for (const e of CV.experiments)
    assert.ok(known.includes(e.topic), `"${e.title}" has topic "${e.topic}", not one of ${known.join(', ')}`);
});

test('no two experiments share an id', () => {
  const ids = CV.experiments.map((e) => e.id).filter(Boolean);
  assert.deepEqual(ids.length, new Set(ids).size, 'duplicate id in experiments');
});

// ── the values that become links ────────────────────────────────────────────

test('every url is absolute https, or deliberately empty', () => {
  // The templates drop these straight into href. A relative or http one either
  // breaks or downgrades the link, and "" is the documented way to say there is
  // no link (the interface renders a "no link" label instead).
  for (const key of ['experiments', 'portfolio'])
    for (const e of CV[key]) {
      if (e.url === '' || e.url === undefined) continue;
      assert.match(e.url, /^https:\/\//, `${key}: "${e.title}" has url "${e.url}"`);
    }
});

test('every doi is a bare DOI, not a URL', () => {
  // index.html builds `https://doi.org/${e.doi}`, so a full URL here yields a
  // double-prefixed link that 404s.
  for (const e of CV.experiments) {
    if (!e.doi) continue;
    assert.match(e.doi, /^10\.\d{4,9}\/\S+$/, `"${e.title}" has doi "${e.doi}"`);
    assert.ok(!e.doi.startsWith('http'), `"${e.title}" stores a URL where a DOI belongs`);
  }
});

test('a twin, when present, carries both a title and a url', () => {
  for (const e of CV.experiments) {
    if (!e.twin) continue;
    assert.ok(e.twin.url, `"${e.title}" has a twin with no url`);
    assert.ok(e.twin.title, `"${e.title}" has a twin with no title`);
  }
});
