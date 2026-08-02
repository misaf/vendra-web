#!/usr/bin/env node
/**
 * Validates every internal link in the docs against the actual route tree.
 *
 * Routes come from the `app/**\/page.mdx` files, so this stays correct as pages
 * are added or moved. Runs offline — no server or network required.
 */
import { readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '../app')

async function collect(pattern) {
  const out = []
  for await (const file of glob(pattern, { cwd: appDir })) out.push(file)
  return out
}

const pages = await collect('**/page.mdx')

/** `overview/architecture/page.mdx` -> `/overview/architecture`, `page.mdx` -> `/` */
const routes = new Set(
  pages.map(file => {
    const route = file.replace(/(^|\/)page\.mdx$/, '')
    return route === '' ? '/' : `/${route}`
  })
)

const sources = [...pages, ...(await collect('**/*.{jsx,tsx}'))]
const linkPattern = /href(?:=|: )["']([^"']+)["']/g

const broken = []
for (const file of sources) {
  const text = readFileSync(resolve(appDir, file), 'utf8')
  for (const [, href] of text.matchAll(linkPattern)) {
    if (!href.startsWith('/')) continue // external, anchor, or relative
    const [path] = href.split('#')
    if (path && !routes.has(path)) broken.push({ file, href })
  }
}

if (broken.length > 0) {
  console.error(`\n✗ ${broken.length} broken internal link(s):\n`)
  for (const { file, href } of broken) {
    console.error(`  app/${file}\n    -> ${href}`)
  }
  console.error(`\nKnown routes:\n  ${[...routes].sort().join('\n  ')}\n`)
  process.exit(1)
}

console.log(
  `✓ links: ${sources.length} files checked against ${routes.size} routes`
)
