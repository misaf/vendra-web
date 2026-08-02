#!/usr/bin/env node
/**
 * Validates HTML nesting in the prerendered pages.
 *
 * Invalid nesting (most commonly a <p> inside a <p>, which MDX produces when a
 * component renders its children inside a paragraph) compiles and builds
 * cleanly, then fails at runtime as a React hydration error. This catches it at
 * build time instead.
 *
 * Run after `next build`, which static-exports every page into `out/`.
 */
import { readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// VENDRA_BUILD_DIR exists so the self-tests can point this at fixtures.
const buildDir =
  process.env.VENDRA_BUILD_DIR ??
  resolve(dirname(fileURLToPath(import.meta.url)), '../out')

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr'
])

/** Ancestor tag -> descendant tags that HTML forbids inside it. */
const FORBIDDEN = {
  p: new Set([
    'p', 'div', 'ul', 'ol', 'dl', 'pre', 'table', 'section',
    'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
  ]),
  a: new Set(['a', 'button']),
  button: new Set(['a', 'button'])
}

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g

function findViolations(html) {
  const stack = []
  const found = []

  // Skip raw-text elements whose contents are not markup.
  const cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  for (const [, closing, rawName, , selfClosing] of cleaned.matchAll(TAG)) {
    const name = rawName.toLowerCase()
    if (VOID.has(name)) continue

    if (closing) {
      const at = stack.lastIndexOf(name)
      if (at !== -1) stack.length = at
      continue
    }

    for (const ancestor of stack) {
      if (FORBIDDEN[ancestor]?.has(name)) {
        found.push(`<${name}> inside <${ancestor}>`)
      }
    }
    if (!selfClosing) stack.push(name)
  }

  return found
}

const problems = []
let pages = 0

for await (const file of glob('**/*.html', { cwd: buildDir })) {
  if (file.startsWith('_')) continue // _not-found, _global-error
  if (file.startsWith('404')) continue // static-export error page
  pages++
  const violations = new Set(findViolations(readFileSync(resolve(buildDir, file), 'utf8')))
  for (const violation of violations) problems.push(`${file}: ${violation}`)
}

if (pages === 0) {
  console.error('✗ html: no prerendered pages found — run `next build` first')
  process.exit(1)
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} invalid HTML nesting issue(s):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  console.error(
    '\nThese cause React hydration errors. A component is most likely rendering' +
      '\nMDX children inside a <p>; render a <div> instead.\n'
  )
  process.exit(1)
}

console.log(`✓ html: ${pages} pages have valid nesting`)
