#!/usr/bin/env node
/** Ensures FAQ context pages point to a real canonical documentation page. */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const faqRoot = resolve(root, 'app/faq')
const problems = []
let checked = 0

for (const entry of readdirSync(faqRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === 'tags') continue
  const pagePath = resolve(faqRoot, entry.name, 'page.mdx')
  if (!existsSync(pagePath)) continue
  const source = readFileSync(pagePath, 'utf8')
  const canonical = source.match(/^canonical:\s*"([^"]+)"$/m)?.[1]
  if (!canonical) {
    problems.push(`${entry.name} has no canonical documentation link`)
    continue
  }
  if (!canonical.startsWith('/docs/')) {
    problems.push(
      `${entry.name} canonical target is outside /docs: ${canonical}`
    )
    continue
  }
  const target = resolve(root, 'app', canonical.slice(1), 'page.mdx')
  if (!existsSync(target)) {
    problems.push(`${entry.name} canonical target does not exist: ${canonical}`)
    continue
  }
  checked += 1
}

if (problems.length) {
  console.error(`✗ ${problems.length} FAQ authority problem(s):`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(
  `✓ authority: ${checked} FAQ answers link to canonical documentation`
)
