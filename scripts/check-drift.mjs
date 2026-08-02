#!/usr/bin/env node
/**
 * Detects drift between these docs and the machine-readable contracts they
 * describe:
 *
 *   vendra-controller/api/openapi.yaml   -> provisioner endpoints
 *   vendra-storefront-florist/properties/schema.json -> property config fields
 *
 * The docs are a standalone repository, so those files are usually absent (CI,
 * a fresh clone). This check skips cleanly in that case rather than failing —
 * it is a safety net when the whole ecosystem is checked out side by side, not
 * a build dependency.
 *
 * Override the search location with VENDRA_ECOSYSTEM_DIR.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ecosystem = process.env.VENDRA_ECOSYSTEM_DIR ?? resolve(docsRoot, '..')

const openapiPath = resolve(ecosystem, 'vendra-controller/api/openapi.yaml')
const schemaPath = resolve(
  ecosystem,
  'vendra-storefront-florist/properties/schema.json'
)

const read = path => readFileSync(resolve(docsRoot, path), 'utf8')
const problems = []
let checked = 0

/* -------------------------------------------------------------------------- */
/* Provisioner endpoints                                                      */
/* -------------------------------------------------------------------------- */

if (existsSync(openapiPath)) {
  const yaml = readFileSync(openapiPath, 'utf8')
  const pathsBlock = yaml.match(/^paths:\n(.*?)(?=^\S)/ms)?.[1] ?? ''
  // Top-level keys under `paths:` are indented exactly two spaces.
  const endpoints = [...pathsBlock.matchAll(/^ {2}(\/\S*):/gm)].map(m => m[1])

  if (endpoints.length === 0) {
    problems.push('Could not parse any endpoints from openapi.yaml')
  }

  const doc = read('app/controller/provisioning/page.mdx')
  for (const endpoint of endpoints) {
    if (!doc.includes(endpoint)) {
      problems.push(
        `openapi.yaml defines ${endpoint}, but controller/provisioning does not mention it`
      )
    }
  }
  checked += endpoints.length
  console.log(`  openapi.yaml: ${endpoints.length} endpoints`)
} else {
  console.log('  openapi.yaml: not found, skipped')
}

/* -------------------------------------------------------------------------- */
/* Property configuration fields                                              */
/* -------------------------------------------------------------------------- */

if (existsSync(schemaPath)) {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
  const required = schema.required ?? []
  const optional = Object.keys(schema.properties ?? {}).filter(
    key => !required.includes(key)
  )

  const doc = read('app/storefront/configuration/page.mdx')
  for (const field of required) {
    // Required fields appear as JSON keys in the example object.
    if (!doc.includes(`"${field}"`)) {
      problems.push(
        `schema.json requires "${field}", but it is missing from the example in storefront/configuration`
      )
    }
  }
  for (const field of optional) {
    if (!doc.includes(field)) {
      problems.push(
        `schema.json defines optional "${field}", but storefront/configuration does not mention it`
      )
    }
  }
  checked += required.length + optional.length
  console.log(
    `  schema.json: ${required.length} required, ${optional.length} optional fields`
  )
} else {
  console.log('  schema.json: not found, skipped')
}

/* -------------------------------------------------------------------------- */

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} drift problem(s):\n`)
  for (const problem of problems) console.error(`  - ${problem}`)
  console.error('')
  process.exit(1)
}

console.log(
  checked === 0
    ? '✓ drift: sibling repositories not present, nothing to check'
    : `✓ drift: ${checked} contract items match the docs`
)
