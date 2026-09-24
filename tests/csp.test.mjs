// Both pages carry a strict Content-Security-Policy, and nothing in them needs more than
// it allows: no inline script, no inline <style>, no file from another host.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

for (const page of ['index.html', 'cv.html']) {
  const html = read(`../${page}`);
  test(`${page} ships a strict CSP`, () => {
    const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
    assert.ok(csp, 'no CSP meta tag');
    for (const d of ["default-src 'none'", "script-src 'self'", "style-src 'self'",
      "object-src 'none'", "base-uri 'none'", "form-action 'none'"]) assert.ok(csp.includes(d), d);
    assert.ok(!/script-src[^;]*unsafe/.test(csp), 'script-src must not be loosened');
    assert.ok(!/style-src [^;]*unsafe/.test(csp), "unsafe-inline belongs on style-src-attr only");
  });
  test(`${page} has nothing the CSP would block`, () => {
    assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), 'inline <script>');
    assert.ok(!/<style[\s>]/.test(html), 'inline <style>');
    assert.ok(!/\son[a-z]+="/.test(html), 'inline event handler');
    for (const m of html.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)="([^"]+)"/g))
      if (!/rel="(?:canonical|alternate)"/.test(m[0]))
        assert.ok(!/^(https?:)?\/\//.test(m[1]), `loads from another host: ${m[1]}`);
  });
}
