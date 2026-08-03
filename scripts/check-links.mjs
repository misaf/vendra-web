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

// Content pages are MDX; the blog index and tag listings are hand-written TSX.
const pages = await collect('**/page.mdx', appDir)
const tsxPages = await collect('**/page.tsx', appDir)

/** `overview/architecture/page.mdx` -> `/overview/architecture`, `page.mdx` -> `/` */
function toRoute(file) {
  const route = file.replace(/(^|\/)page\.(mdx|tsx)$/, '')
  return route === '' ? '/' : `/${route}`
}

const routes = new Set([...pages, ...tsxPages].map(toRoute))

/**
 * Dynamic segments cannot be matched literally, so `/blog/tags/[tag]` becomes a
 * prefix that any single extra segment satisfies. The set of tags that actually
 * exist is enforced by `generateStaticParams`, not here.
 */
const dynamicPrefixes = [...routes]
  .filter(route => route.includes('['))
  .map(route => route.slice(0, route.indexOf('[')))

const matchesDynamic = path =>
  dynamicPrefixes.some(
    prefix =>
      path.startsWith(prefix) && !path.slice(prefix.length).includes('/')
  )

const problems = []

/* -------------------------------------------------------------------------- */
/* 1. Literal hrefs                                                           */
/* -------------------------------------------------------------------------- */

const sources = [
  ...pages.map(file => ['app', file]),
  ...(await collect('**/*.{jsx,tsx}', appDir)).map(file => ['app', file]),
  ...(await collect('**/*.{ts,tsx}', resolve(root, 'components'))).map(file => [
    'components',
    file
  ]),
  ...(await collect('**/*.{ts,tsx}', resolve(root, 'lib'))).map(file => [
    'lib',
    file
  ])
]

const linkPattern = /href(?:=|: )["']([^"']+)["']/g

for (const [dir, file] of sources) {
  const text = readFileSync(resolve(root, dir, file), 'utf8')
  for (const [, href] of text.matchAll(linkPattern)) {
    if (!href.startsWith('/')) continue // external, anchor, or relative
    const [path] = href.split('#')
    if (path && !routes.has(path) && !matchesDynamic(path)) {
      problems.push(`${dir}/${file}\n    -> ${href}`)
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 2. `_meta.tsx` keys                                                        */
/* -------------------------------------------------------------------------- */

const metaFiles = await collect('**/_meta.tsx', appDir)

/**
 * Section slugs declared in an `_meta.tsx` default export.
 *
 * A flat key scan used to be enough, back when these files were nothing but
 * `slug: 'Label'` pairs. They are not any more: a section can now carry a
 * config object (`type: 'page'`, a `theme` override), and a naive scan both
 * reported `type` and `layout` as routes and missed every object-valued
 * section — checking less while failing more.
 *
 * So walk the default export and take only the keys at depth 1, whatever their
 * value. String literals are skipped so a label containing a brace or a colon
 * cannot throw off the depth count.
 */
function metaSlugs(text) {
  const start = text.indexOf('export default')
  if (start === -1) return []

  const open = text.indexOf('{', start)
  if (open === -1) return []

  const slugs = []
  let depth = 0

  for (let i = open; i < text.length; i++) {
    const char = text[i]

    if (char === '"' || char === "'" || char === '`') {
      // Skip the whole literal, honouring backslash escapes.
      const quote = char
      i++
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i++
        i++
      }
      continue
    }

    if (char === '{') {
      depth++
      continue
    }

    if (char === '}') {
      depth--
      if (depth === 0) break
      continue
    }

    if (depth === 1) {
      const rest = text.slice(i)
      const match = /^['"]?([\w-]+)['"]?\s*:/.exec(rest)
      if (match) {
        slugs.push(match[1])
        i += match[0].length - 1
      }
    }
  }

  return slugs
}

let metaKeys = 0

for (const file of metaFiles) {
  const text = readFileSync(resolve(appDir, file), 'utf8')
  const base = file.replace(/(^|\/)_meta\.tsx$/, '')
  const keys = metaSlugs(text)

  // A meta file that parses to nothing means the pattern above has drifted from
  // the file format. Without this, the scan would report success while checking
  // nothing at all — worse than not having the check.
  if (keys.length === 0) {
    problems.push(
      `app/${file}\n    -> no entries parsed; metaSlugs() in ` +
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
