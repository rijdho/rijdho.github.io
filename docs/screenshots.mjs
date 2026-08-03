// Regenerates the README screenshots in this folder. Puppeteer is a tooling-only
// dependency — the site itself stays dependency-free and this is never shipped.
//
//   python3 -m http.server 8000 &          # from the repo root
//   npm i puppeteer                        # or point CHROME_PATH at an existing Chrome
//   node docs/screenshots.mjs docs http://localhost:8000
//
// The pages fetch data/cv.json at load, so this must run against http://, never file://.
//
// The cloud is a physics simulation seeded with Math.random, which would make every
// regeneration produce a differently-arranged image and every diff meaningless. So
// Math.random is replaced with a fixed-seed PRNG before any page script runs, and
// prefers-reduced-motion is emulated — the hub then settles the layout in one
// synchronous pass instead of animating. Same input, same picture.

import puppeteer from 'puppeteer'
import { mkdirSync } from 'node:fs'

const OUT = process.argv[2] || 'docs'
const BASE = (process.argv[3] || 'http://localhost:8000').replace(/\/$/, '')
mkdirSync(OUT, { recursive: true })

const SEED = 0x9e3779b9
const seedRandom = seed => {
  // mulberry32 — small, fast, and good enough to lay out 17 ovals reproducibly
  Math.random = () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: process.env.CHROME_PATH || undefined,
  defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 2 },
})

const newPage = async url => {
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(seedRandom, SEED)
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  return page
}

const shoot = async (page, selector, file) => {
  const el = await page.$(selector)
  if (!el) { console.log(`SKIP ${file} — no element matching ${selector}`); return }
  await el.screenshot({ path: `${OUT}/${file}` })
  console.log(`OK   ${file}`)
}

// ---- the hub: the cloud of tools, grouped and colour-coded by topic ----------
const hub = await newPage(`${BASE}/index.html`)
await hub.waitForFunction(() => document.querySelectorAll('.lg').length > 0, { timeout: 60000 })
await new Promise(r => setTimeout(r, 1200))
await shoot(hub, '#stage', 'hub-cloud.png')

// ---- the hub: the publications tab, where each chip names what it resolves to ----
await hub.evaluate(() => {
  // TABS = writing, publications, talks, experience, education, engagements, training
  document.querySelectorAll('#tabbar button')[1].click()
})
await new Promise(r => setTimeout(r, 600))
await shoot(hub, '#tabpanel', 'hub-publications.png')

// ---- the academic CV page, in German, to show the content is translated too ----
const cv = await newPage(`${BASE}/cv.html`)
await cv.waitForFunction(() => document.querySelectorAll('.edu').length > 0, { timeout: 60000 })
await cv.evaluate(() => document.querySelector('.seg button[data-lang="de"]').click())
await new Promise(r => setTimeout(r, 600))
await shoot(cv, 'header.cv', 'cv-header-de.png')

await browser.close()
