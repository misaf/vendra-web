#!/usr/bin/env node
/**
 * Fails the build on colours written outside the token layer.
 *
 * `app/globals.css` defines one palette — `--vendra-fg`, `--vendra-line`,
 * `--vendra-accent` and the rest — and every one of those tokens carries a
 * measured contrast ratio in the comment above it. The point of that layer is
 * that changing the brand hue, or the theme, moves the whole site at once. A
 * component that writes `text-neutral-950 dark:text-neutral-50` instead gets
 * the same two colours today and is left behind by every future change, and
 * nothing reports it.
 *
 * This is not hypothetical. Four separate leaks were found by hand in one audit
 * pass, and two of them had a comment beside them claiming the cleanup was
 * already finished:
 *
 *   - the footer, still on raw Tailwind neutrals, where the copyright line
 *     measured 2.52:1 on the light theme — the worst text on the site, and
 *     invisible as a problem because those are the colours every footer uses;
 *   - `Hero`'s h1 in `components/vendra.tsx`, while `StatRow` at the foot of
 *     the same file carried a note saying it had been the only such surface;
 *   - two of the three copies of a 10.4px ad-hoc font size, one of which was
 *     annotated "this was the last copy of it left".
 *
 * That is the failure mode this closes. A prose comment asserting a cleanup is
 * complete is worse than no comment: the next person greps, reads it, and stops
 * looking. An assertion cannot go stale silently — it either passes or it turns
 * the build red.
 *
 * Scope is deliberately narrow. Only colour utilities are checked, and only in
 * the files this repository styles by hand. Sizes, spacing, and radii are not:
 * they drift too, but they have no accessibility floor and no theme coupling, so
 * a check on them would be noise rather than signal.
 *
 * VENDRA_SOURCE_DIRS exists so the self-tests can point this at fixtures.
 */
import { readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirs = (process.env.VENDRA_SOURCE_DIRS ?? 'app,components')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)

/**
 * Tailwind colour utilities that bypass the token layer.
 *
 * Matched inside a class-ish position — after a quote, a space, or a `:`
 * variant — so the word "neutral" in a sentence of prose is not a finding. The
 * comments in this codebase are long and discuss these very class names, which
 * is exactly the trap `check.test.mjs` describes: a parser that reads the
 * comment explaining the rule instead of the code breaking it.
 */
const PALETTES =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'

const PATTERNS = [
  {
    what: 'Tailwind palette colour',
    // `text-neutral-600`, `dark:bg-zinc-900`, `hover:border-sky-400/40`
    pattern: new RegExp(
      `(?<=["'\\s:\`])(?:(?:hover|focus|active|disabled|group-hover|dark|sm|md|lg|xl):)*(?:text|bg|border|fill|stroke|shadow|ring|from|via|to|decoration|outline|accent|caret|divide|placeholder)-(?:${PALETTES})-\\d{2,3}(?:/\\d{1,3})?\\b`,
      'g'
    )
  },
  {
    what: 'raw hex colour',
    // `text-[#0a66c2]`, `bg-[#fff]`
    pattern: /\[#[0-9a-fA-F]{3,8}\]/g
  }
]

/**
 * Lines that are allowed to hold a raw colour, with the reason.
 *
 * An allowlist rather than a blanket skip, because every entry here is a
 * decision someone should have to restate when they touch it. Keyed by file and
 * by the exact substring that makes the line legitimate, so a *different* leak
 * appearing in an allowlisted file is still caught.
 */
const ALLOWED = [
  {
    file: 'components/marketing.tsx',
    match: 'bg-neutral-950 text-neutral-100',
    why: 'ControllerConsole is a terminal: a dark chrome in both themes, deliberately not theme-following'
  },
  {
    file: 'components/marketing.tsx',
    match: 'text-neutral-400',
    why: 'ControllerConsole terminal chrome — measured 8.6:1 on its own near-black surface'
  },
  {
    file: 'components/marketing.tsx',
    match: 'text-neutral-200',
    why: 'ControllerConsole terminal output'
  },
  {
    file: 'components/marketing.tsx',
    match: 'text-neutral-500',
    why: 'ControllerConsole secondary output — measured 4.9:1 on near-black'
  },
  {
    file: 'components/marketing.tsx',
    match: 'text-sky-400',
    why: 'ControllerConsole shell prompt'
  },
  {
    file: 'components/marketing.tsx',
    match: 'text-emerald-400',
    why: 'ControllerConsole status dot — aria-hidden, colour is redundant to the word beside it'
  },
  {
    file: 'components/marketing.tsx',
    match: 'rounded-full bg-rose-400/70',
    why: 'ControllerConsole window button — decorative, aria-hidden'
  },
  {
    file: 'components/marketing.tsx',
    match: 'rounded-full bg-amber-300/70',
    why: 'ControllerConsole window button — decorative, aria-hidden'
  },
  {
    file: 'components/marketing.tsx',
    match: 'rounded-full bg-emerald-400/70',
    why: 'ControllerConsole window button — decorative, aria-hidden'
  },
  {
    file: 'components/marketing.tsx',
    match: 'hover:border-[#',
    why: 'TeamGrid `socialHover`: GitHub/LinkedIn/Instagram/YouTube brand colours. Another company\u2019s blue is not ours to tokenise, and it must not follow our theme'
  },
  {
    file: 'components/form-kit.tsx',
    match: 'border-red-600',
    why: 'invalid-field border; the red pair is the error signal, not a brand colour'
  },
  {
    file: 'components/form-kit.tsx',
    match: 'text-red-700',
    why: 'field error text — measured 5.9:1 light / 7.4:1 dark'
  },
  {
    file: 'components/contact-form.tsx',
    match: 'border-red-600/40',
    why: 'submit-failure region; matches the field error signal'
  },
  {
    file: 'components/signup-form.tsx',
    match: 'border-red-600/40',
    why: 'submit-failure region; matches the field error signal'
  },
  {
    file: 'components/vendra.tsx',
    match: 'amber-',
    why: 'Tag tone="amber" — a semantic status colour in the docs vocabulary'
  },
  {
    file: 'components/vendra.tsx',
    match: 'red-',
    why: 'Tag tone="red" — a semantic status colour in the docs vocabulary'
  }
]

const allowedFor = (file, line) =>
  ALLOWED.find(entry => entry.file === file && line.includes(entry.match))

/**
 * Strips comments before scanning.
 *
 * The single most likely false positive in this repository. Its comments are
 * unusually long and they discuss the exact class names being banned — the note
 * above the footer literally quotes `text-neutral-400` to explain why it was
 * removed. Scanning raw text would flag the explanation of the fix as the bug.
 */
const stripComments = source =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const findings = []
let scanned = 0

for (const dir of sourceDirs) {
  for await (const file of glob('**/*.{ts,tsx}', {
    cwd: resolve(root, dir)
  })) {
    const path = `${dir}/${file}`
    const source = stripComments(readFileSync(resolve(root, dir, file), 'utf8'))
    scanned++

    source.split('\n').forEach((line, index) => {
      for (const { what, pattern } of PATTERNS) {
        pattern.lastIndex = 0
        for (const hit of line.matchAll(pattern)) {
          const allowed = allowedFor(path, line)
          if (allowed) continue
          findings.push({
            path,
            line: index + 1,
            token: hit[0],
            what
          })
        }
      }
    })
  }
}

if (scanned === 0) {
  console.error(
    `✗ tokens: no source files found under ${sourceDirs.join(', ')} — is the path right?`
  )
  process.exit(1)
}

if (findings.length > 0) {
  console.error(
    `\n✗ ${findings.length} colour value(s) written outside the token layer:\n`
  )
  for (const finding of findings) {
    console.error(
      `  ${relative(root, resolve(root, finding.path))}:${finding.line}  ${finding.token}  (${finding.what})`
    )
  }
  console.error(
    '\nUse a token from app/globals.css instead — --vendra-fg, --vendra-fg-muted,' +
      '\n--vendra-fg-subtle, --vendra-line, --vendra-surface, --vendra-accent and' +
      '\nfriends. Each one carries its measured contrast in the comment above it,' +
      '\nwhich a raw palette value does not.' +
      '\n\nIf the colour genuinely cannot be a token — a terminal, another company\u2019s' +
      '\nbrand, a semantic red — add it to ALLOWED in this file with the reason.\n'
  )
  process.exit(1)
}

console.log(
  `✓ tokens: ${scanned} source files use the palette in app/globals.css (${ALLOWED.length} documented exceptions)`
)
