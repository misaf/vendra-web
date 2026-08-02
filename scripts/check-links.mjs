#!/usr/bin/env node
/**
 * Validates internal navigation against the actual route tree:
 *
 *   1. Every literal `href` in a page or component resolves to a real route.
 *   2. Every key in an `_meta.tsx` file resolves to a real route.
 *
 * The second check exists because the navbar builds its links from
 * `app/_meta.tsx` (see `lib/navigation.ts`) rather than spelling out hrefs, so
 * a literal-href scan alone would no longer cover it.
 *
 * Routes come from the `app/**\/page.mdx` files, so this stays correct as pages
 * are added or moved. Runs offline — no server or network required.
 */
import { readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const appDir = resolve(root, 'app')

async function collect(pattern, cwd) {
  const out = []
  for await (const file of glob(pattern, { cwd })) out.push(file)
  return out
}

const pages = await collect('**/page.mdx', appDir)

/** `overview/architecture/page.mdx` -> `/overview/architecture`, `page.mdx` -> `/` */
const routes = new Set(
  pages.map(file => {
    const route = file.replace(/(^|\/)page\.mdx$/, '')
    return route === '' ? '/' : `/${route}`
  })
)

const problems = []

/* -------------------------------------------------------------------------- */
/* 1. Literal hrefs                                                           */
/* -------------------------------------------------------------------------- */

const sources = [
  ...pages.map(file => ['app', file]),
  ...(await collect('**/*.{jsx,tsx}', appDir)).map(file => ['app', file]),
  ...(await collect('**/*.{ts,tsx}', resolve(root, 'lib'))).map(file => [
    'lib',
    file
  ]),
  ...(await collect('**/*.{ts,tsx}', resolve(root, 'components'))).map(file => [
    'components',
    file
  ])
]

const linkPattern = /href(?:=|: )["']([^"']+)["']/g

for (const [dir, file] of sources) {
  const text = readFileSync(resolve(root, dir, file), 'utf8')
  for (const [, href] of text.matchAll(linkPattern)) {
    if (!href.startsWith('/')) continue // external, anchor, or relative
    const [path] = href.split('#')
    if (path && !routes.has(path)) problems.push(`${dir}/${file}\n    -> ${href}`)
  }
}

/* -------------------------------------------------------------------------- */
/* 2. `_meta.tsx` keys                                                        */
/* -------------------------------------------------------------------------- */

const metaFiles = await collect('**/_meta.tsx', appDir)

// These files are hand-written object literals of `slug: 'Label'` pairs, so a
// key scan is enough — no need to evaluate TypeScript here.
const metaKeyPattern = /^\s*'?([\w-]+)'?:\s*['"]/gm

let metaKeys = 0

for (const file of metaFiles) {
  const text = readFileSync(resolve(appDir, file), 'utf8')
  const base = file.replace(/(^|\/)_meta\.tsx$/, '')
  const keys = [...text.matchAll(metaKeyPattern)].map(m => m[1])

  // A meta file that parses to nothing means the pattern above has drifted from
  // the file format. Without this, the scan would report success while checking
  // nothing at all — worse than not having the check.
  if (keys.length === 0) {
    problems.push(
      `app/${file}\n    -> no entries parsed; the _meta key pattern in ` +
        `scripts/check-links.mjs no longer matches this file`
    )
    continue
  }

  metaKeys += keys.length

  for (const key of keys) {
    // `index` denotes the directory's own page, not a child route.
    const segments = key === 'index' ? base : base ? `${base}/${key}` : key
    const route = segments === '' ? '/' : `/${segments}`
    if (!routes.has(route)) {
      problems.push(`app/${file}\n    -> "${key}" has no page at ${route}`)
    }
  }
}

/* -------------------------------------------------------------------------- */

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} broken internal link(s):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  console.error(`\nKnown routes:\n  ${[...routes].sort().join('\n  ')}\n`)
  process.exit(1)
}

console.log(
  `✓ links: ${sources.length} files and ${metaKeys} _meta entries ` +
    `checked against ${routes.size} routes`
)
