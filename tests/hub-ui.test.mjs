// Invariants of the hub page itself, as opposed to the data behind it.
//
// Two failures that leave nothing to see. A locale missing a key renders an empty
// element, because the translation loop skips a key it cannot find rather than
// falling back; the page looks fine in the language you happen to be testing in.
// And a tool whose title never matches the curated label table falls through to a
// slug fallback, so a new entry silently arrives in the cloud labelled
// "some-repo-name" next to twenty readable names.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const cv = JSON.parse(readFileSync(join(root, "data", "cv.json"), "utf8"));

// Slice a balanced {...} or [...] literal starting at `open`, so the test reads the
// page's real source instead of a copy that can drift from it.
function literal(marker, open, close) {
  const at = html.indexOf(marker);
  assert.notEqual(at, -1, `index.html contains ${marker}`);
  const start = html.indexOf(open, at);
  let depth = 0;
  for (let i = start; i < html.length; i++) {
    if (html[i] === open) depth++;
    else if (html[i] === close && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error(`unterminated literal after ${marker}`);
}

const UI = new Function(`return ${literal("const UI = {", "{", "}")}`)();
const shortOf = new Function(`
  const SHORT = ${literal("const SHORT=[", "[", "]")};
  ${html.match(/function shortOf\(t\)\{[^\n]*\}/)[0]}
  return shortOf;`)();

test("every locale of the hub UI carries the same keys", () => {
  const locales = Object.keys(UI);
  assert.ok(locales.length >= 3, "English, German and Spanish at minimum");
  const reference = Object.keys(UI.en).sort();
  for (const loc of locales) {
    assert.deepEqual(Object.keys(UI[loc]).sort(), reference,
      `${loc} has exactly the keys en has`);
    for (const [k, v] of Object.entries(UI[loc])) {
      assert.equal(typeof v, "string", `${loc}.${k} is a string`);
      assert.notEqual(v.trim(), "", `${loc}.${k} is not empty`);
    }
  }
});

// The dashed outline is the only thing separating a hosted tool from its open twin,
// and the two BiblioHelp ovals differ by one capital letter, so the page has to say
// what the dash means in every language it speaks.
test("every locale explains what the dashed outline means", () => {
  for (const loc of Object.keys(UI)) {
    assert.ok(UI[loc].openmark, `${loc} explains the dashed outline`);
  }
});

test("no bubble is labelled with a raw repository slug", () => {
  for (const app of cv.experiments) {
    const label = shortOf(app.title);
    assert.ok(!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(label),
      `${app.id}: the cloud would show the slug "${label}"; add a curated label to SHORT`);
    assert.ok(label.length <= 20,
      `${app.id}: "${label}" is too long for a 46px oval`);
  }
});

// Two ovals whose labels differ only in case are two ovals a reader cannot tell
// apart, which is exactly what "BiblioHelp" and "bibliohelp" were.
test("no two bubbles carry labels that differ only in case", () => {
  const seen = new Map();
  for (const app of cv.experiments) {
    const key = shortOf(app.title).toLowerCase();
    assert.ok(!seen.has(key),
      `${app.id} and ${seen.get(key)} both render as "${key}"`);
    seen.set(key, app.id);
  }
});
