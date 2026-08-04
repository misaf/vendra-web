#!/usr/bin/env node
/**
 * Asserts the contrast ratios that `app/globals.css` claims in prose.
 *
 * The token definitions in that file are unusually well reasoned — several
 * carry a measured ratio in the comment above them, and one records having been
 * darkened after it was checked against the tinted band it actually sits on
 * rather than against the page. That reasoning was all in comments, which means
 * it was documentation of a measurement taken once, by hand, at some point in
 * the past.
 *
 * It had already gone stale. The footer copyright measured 2.52:1 on the light
 * theme and 4.20:1 on the dark — the worst text on the site, on the element
 * least likely to be audited, and passing review for years because
 * `text-neutral-400 dark:text-neutral-500` is what every footer in the world
 * uses. No comment was wrong about it; nobody had ever written one.
 *
 * So the ratios are assertions now. Change a token and this either still passes
 * or it turns the build red with the number it turned into.
 *
 * ## What it checks, and what it cannot
 *
 * The PAIRS table below is hand-maintained: each entry is a foreground token,
 * the surface it is genuinely used on, and the floor it has to clear. That is
 * the honest scope — this validates the *palette*, not the page. It cannot know
 * that some component put `--vendra-fg-subtle` on a surface nobody listed here,
 * and it does not try; `check-tokens.mjs` is what keeps components inside the
 * palette in the first place, and the two are meant to be read together.
 *
 * Alpha surfaces are composited over the theme background before measuring,
 * which is the whole point of several of these rows: `--vendra-fg-subtle` clears
 * 4.5:1 against the page and only just clears it against `--vendra-muted`, and
 * the second number is the one that matters because the eyebrow it colours sits
 * on muted bands.
 *
 * VENDRA_CSS_FILE and VENDRA_LAYOUT_FILE exist so the self-tests can point this
 * at fixtures.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cssFile = process.env.VENDRA_CSS_FILE ?? resolve(root, 'app/globals.css')
const layoutFile =
  process.env.VENDRA_LAYOUT_FILE ?? resolve(root, 'app/layout.tsx')

/* -------------------------------------------------------------------------- */
/* Colour                                                                     */
/* -------------------------------------------------------------------------- */

/** WCAG relative luminance. Channels are 0-255. */
const luminance = ([r, g, b]) => {
  const channel = value => {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

/** Composites a possibly-transparent colour over an opaque one. */
const over = ([r, g, b, a = 1], base) =>
  a >= 1 ? [r, g, b] : [r, g, b].map((c, i) => c * a + base[i] * (1 - a))

const hslToRgb = (h, s, l) => {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255))
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

const css = readFileSync(cssFile, 'utf8')
const layout = readFileSync(layoutFile, 'utf8')

/**
 * The Nextra primary, which `<Head>` in `app/layout.tsx` owns rather than the
 * stylesheet.
 *
 * `globals.css` says so explicitly and declines to declare it in both places,
 * which is right — but it means the accent tokens cannot be resolved from the
 * stylesheet alone. Read from the layout so changing the brand hue there moves
 * this check with it instead of leaving it asserting the old colour.
 */
function primary() {
  const block = layout.match(/<Head\s+color=\{([\s\S]*?)\}\s*\/>/)
  if (!block) {
    throw new Error(
      `could not find the <Head color={...}> block in ${layoutFile} — ` +
        'the brand hue moved, and this check can no longer resolve --vendra-accent'
    )
  }
  const number = name => {
    const hit = block[1].match(new RegExp(`${name}:\\s*([\\d.]+)`))
    if (!hit) throw new Error(`<Head color> has no ${name}`)
    return Number(hit[1])
  }
  const themed = name => {
    const hit = block[1].match(
      new RegExp(
        `${name}:\\s*\\{\\s*light:\\s*([\\d.]+),\\s*dark:\\s*([\\d.]+)`
      )
    )
    if (!hit) throw new Error(`<Head color> has no light/dark ${name}`)
    return { light: Number(hit[1]), dark: Number(hit[2]) }
  }
  return {
    hue: number('hue'),
    saturation: themed('saturation'),
    lightness: themed('lightness')
  }
}

const brand = primary()

/**
 * Declarations inside a given selector's block.
 *
 * The selector is anchored to the start of a line and required to be followed
 * by its opening brace, which is not fussiness. `indexOf('.dark')` finds line 15
 * of `globals.css` — `@custom-variant dark (&:where(.dark, .dark *))` — and
 * parses the variant declaration as if it were the dark palette. It yields an
 * empty map, every dark token then falls through to its `:root` value, and the
 * check cheerfully measures the light theme twice and reports twenty passing
 * pairs. Precisely the silent-success failure `check.test.mjs` was written
 * about, and it was live in this file until the self-tests caught it.
 */
function declarations(selector) {
  const opener = new RegExp(
    `^${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`,
    'm'
  )
  const found_ = css.match(opener)
  if (!found_) throw new Error(`${selector} rule not found in ${cssFile}`)
  const start = found_.index
  const open = css.indexOf('{', start)
  let depth = 0
  let end = open
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  const body = css.slice(open + 1, end)
  const found = new Map()
  for (const hit of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    found.set(hit[1], hit[2].replace(/\/\*[\s\S]*?\*\//g, '').trim())
  }
  return found
}

const rootVars = declarations(':root')
const darkVars = declarations('.dark')

/**
 * Resolves a token to `[r, g, b, a]` for one theme.
 *
 * Handles the three forms this stylesheet actually uses: a literal
 * `rgb(r g b [/ a])`, a `var(--other)` indirection, and the
 * `hsl(var(--nextra-primary-*)...)` construction the accent tokens are built
 * from. Anything else throws rather than guessing — a token this cannot read is
 * a token this cannot vouch for, and silently skipping it is the failure mode
 * the whole file exists to prevent.
 */
function resolve_(name, theme, seen = new Set()) {
  if (seen.has(name)) throw new Error(`--${name} resolves to itself`)
  seen.add(name)

  const vars = theme === 'dark' ? darkVars : rootVars
  const value = (theme === 'dark' ? vars.get(name) : null) ?? rootVars.get(name)
  if (!value) throw new Error(`${name} is not declared`)

  const rgb = value.match(
    /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+)\s*)?\)$/
  )
  if (rgb) {
    return [
      Number(rgb[1]),
      Number(rgb[2]),
      Number(rgb[3]),
      rgb[4] === undefined ? 1 : Number(rgb[4])
    ]
  }

  const indirect = value.match(/^var\((--[\w-]+)\)$/)
  if (indirect) return resolve_(indirect[1], theme, seen)

  if (value.startsWith('hsl(')) {
    const lightness = value.match(/,\s*([\d.]+)%\s*\)$/)
    return [
      ...hslToRgb(
        brand.hue,
        brand.saturation[theme],
        lightness ? Number(lightness[1]) : brand.lightness[theme]
      ),
      1
    ]
  }

  throw new Error(`${name} has a value this check cannot read: ${value}`)
}

/* -------------------------------------------------------------------------- */
/* What must hold                                                             */
/* -------------------------------------------------------------------------- */

/**
 * 4.5 is WCAG AA for text below 18.66px, which is every row here: the site's
 * body copy is 15-17px and the tokens under test colour labels, eyebrows, and
 * captions well below that. 3.0 is the large-text floor, used for the one row
 * that is genuinely a heading colour.
 */
const PAIRS = [
  ['--vendra-fg', '--vendra-bg', 4.5, 'body text on the page'],
  ['--vendra-fg-muted', '--vendra-bg', 4.5, 'secondary body copy'],
  ['--vendra-fg-subtle', '--vendra-bg', 4.5, 'eyebrows and captions'],
  [
    '--vendra-fg-subtle',
    '--vendra-muted',
    4.5,
    'eyebrows on a muted band — the case the token was re-tuned for'
  ],
  [
    '--vendra-fg-subtle',
    '--vendra-surface-raised',
    4.5,
    'Screenshot browser chrome, menu panels'
  ],
  ['--vendra-fg-muted', '--vendra-muted', 4.5, 'body copy on a muted band'],
  [
    '--vendra-accent-text',
    '--vendra-bg',
    4.5,
    'accent labels: indices, tier badges, inline marketing links'
  ],
  ['--vendra-accent-2-text', '--vendra-bg', 4.5, 'storefront tier as text'],
  ['--vendra-accent-3-text', '--vendra-bg', 4.5, 'controller tier as text'],
  [
    '--vendra-on-accent',
    '--vendra-accent-strong',
    4.5,
    'the primary button label on its fill'
  ]
]

/* -------------------------------------------------------------------------- */

const failures = []
const rows = []

for (const theme of ['light', 'dark']) {
  const bg = over(resolve_('--vendra-bg', theme), [255, 255, 255])

  for (const [fgName, bgName, floor, why] of PAIRS) {
    const surface = over(resolve_(bgName, theme), bg)
    const fg = over(resolve_(fgName, theme), surface)
    const ratio = contrast(fg, surface)
    const row = { theme, fgName, bgName, floor, why, ratio }
    rows.push(row)
    if (ratio < floor) failures.push(row)
  }
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} token pair(s) below their floor:\n`)
  for (const row of failures) {
    console.error(
      `  ${row.theme.padEnd(5)} ${row.fgName} on ${row.bgName}` +
        `\n        ${row.ratio.toFixed(2)}:1, needs ${row.floor}:1 — ${row.why}`
    )
  }
  console.error(
    '\nAdjust the token in app/globals.css until it clears, and update the' +
      '\nmeasured ratio in the comment above it. If the pair is no longer used,' +
      '\nremove its row from PAIRS in this file rather than lowering the floor.\n'
  )
  process.exit(1)
}

const worst = rows.reduce((a, b) => (a.ratio < b.ratio ? a : b))
console.log(
  `✓ contrast: ${rows.length} token pairs clear WCAG AA on both themes ` +
    `(tightest ${worst.ratio.toFixed(2)}:1 — ${worst.fgName} on ${worst.bgName}, ${worst.theme})`
)
