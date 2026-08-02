#!/usr/bin/env node
/**
 * Detects drift between these docs and the machine-readable contracts they
 * describe:
 *
 *   vendra-controller/api/openapi.yaml   -> provisioner endpoints
 *   vendra-storefront-florist/properties/schema.json -> property config fields
 *   vendra-platform/packages/            -> first-party package catalog
 *
 * Drift is checked in both directions. A contract item missing from the docs is
 * an undocumented feature; a documented item missing from the contract is worse,
 * because it sends readers looking for something that no longer exists.
 *
 * The docs are a standalone repository, so those files are usually absent (CI,
 * a fresh clone). This check skips cleanly in that case rather than failing —
 * it is a safety net when the whole ecosystem is checked out side by side, not
 * a build dependency.
 *
 * Override the search location with VENDRA_ECOSYSTEM_DIR.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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

/**
 * Compares a contract's items against what the docs actually document.
 *
 * `missing` is what the contract has and the docs do not; `stale` is the
 * reverse. Both are reported with the wording a reader needs to act on.
 */
function compare({ contract, documented, describe }) {
  for (const item of contract) {
    if (!documented.has(item)) problems.push(describe.missing(item))
  }
  for (const item of documented) {
    if (!contract.has(item)) problems.push(describe.stale(item))
  }
  checked += contract.size + documented.size
}

/* -------------------------------------------------------------------------- */
/* Provisioner endpoints                                                      */
/* -------------------------------------------------------------------------- */

if (existsSync(openapiPath)) {
  const yaml = readFileSync(openapiPath, 'utf8')
  const pathsBlock = yaml.match(/^paths:\n(.*?)(?=^\S)/ms)?.[1] ?? ''
  // Top-level keys under `paths:` are indented exactly two spaces.
  const endpoints = new Set(
    [...pathsBlock.matchAll(/^ {2}(\/\S*):/gm)].map(m => m[1])
  )

  if (endpoints.size === 0) {
    problems.push('Could not parse any endpoints from openapi.yaml')
  }

  const docPath = 'app/controller/provisioning/page.mdx'
  const doc = read(docPath)

  // The endpoint list on that page is a <DefList> whose terms read
  // `GET /v1/capabilities`. Matching the method prefix keeps prose mentions of
  // a path from counting as documentation of the endpoint itself.
  const documented = new Set(
    [...doc.matchAll(/\b(?:GET|POST|PUT|PATCH|DELETE)\s+(\/\S*?)(?=['"`\s])/g)].map(
      m => m[1]
    )
  )

  compare({
    contract: endpoints,
    documented,
    describe: {
      missing: e =>
        `openapi.yaml defines ${e}, but ${docPath} does not document it`,
      stale: e =>
        `${docPath} documents ${e}, but openapi.yaml no longer defines it`
    }
  })

  console.log(
    `  openapi.yaml: ${endpoints.size} endpoints, ${documented.size} documented`
  )
} else {
  console.log('  openapi.yaml: not found, skipped')
}

/* -------------------------------------------------------------------------- */
/* Property configuration fields                                              */
/* -------------------------------------------------------------------------- */

if (existsSync(schemaPath)) {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
  const required = new Set(schema.required ?? [])
  const optional = new Set(
    Object.keys(schema.properties ?? {}).filter(key => !required.has(key))
  )

  const docPath = 'app/storefront/configuration/page.mdx'
  const doc = read(docPath)

  // Required fields appear as top-level keys of the ```json example block.
  const example = doc.match(/```json[^\n]*\n([\s\S]*?)```/)?.[1]
  if (!example) {
    problems.push(`Could not find the JSON example block in ${docPath}`)
  }
  const exampleKeys = new Set(
    [...(example ?? '').matchAll(/^ {2}"([^"]+)":/gm)].map(m => m[1])
  )

  // Optional fields are listed in a single prose sentence, which this pattern
  // is coupled to. `page.mdx` carries a comment pointing back here.
  //
  // Anchored to the start of a line so that prose *about* this check — an MDX
  // comment explaining the coupling, say — cannot be mistaken for the list.
  const optionalSentence = doc.match(
    /^Optional fields include([\s\S]*?)\./m
  )?.[1]
  if (!optionalSentence) {
    problems.push(
      `Could not find the "Optional fields include ..." sentence in ${docPath}`
    )
  }
  const documentedOptional = new Set(
    [...(optionalSentence ?? '').matchAll(/`([^`]+)`/g)].map(m => m[1])
  )

  compare({
    contract: required,
    documented: exampleKeys,
    describe: {
      missing: f =>
        `schema.json requires "${f}", but the example in ${docPath} omits it`,
      stale: f =>
        `the example in ${docPath} sets "${f}", but schema.json does not define it as required`
    }
  })

  compare({
    contract: optional,
    documented: documentedOptional,
    describe: {
      missing: f =>
        `schema.json defines optional "${f}", but ${docPath} does not list it`,
      stale: f =>
        `${docPath} lists optional "${f}", but schema.json no longer defines it`
    }
  })

  console.log(
    `  schema.json: ${required.size} required, ${optional.size} optional fields`
  )
} else {
  console.log('  schema.json: not found, skipped')
}

/* -------------------------------------------------------------------------- */
/* First-party package catalog                                                */
/* -------------------------------------------------------------------------- */

const packagesDir = resolve(ecosystem, 'vendra-platform/packages')

/** 'User Profile' -> 'user-profile', 'FAQ' -> 'faq' */
const toSlug = name => name.trim().toLowerCase().replace(/\s+/g, '-')

if (existsSync(packagesDir)) {
  const slugs = readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('vendra-'))
    .map(entry => entry.name.replace(/^vendra-/, ''))

  // The catalog documents packages by display name and groups the `*-api`
  // packages into one entry, so the two are compared separately.
  const coreSlugs = new Set(slugs.filter(slug => !slug.endsWith('-api')))
  const apiSlugs = new Set(
    slugs.filter(slug => slug.endsWith('-api')).map(slug => slug.slice(0, -4))
  )

  const docPath = 'app/platform/packages/page.mdx'
  const doc = read(docPath)

  // Only the "## Catalog" section lists packages; the conventions section below
  // it is prose and must not be scanned for names.
  const catalog = doc.match(/## Catalog\n([\s\S]*?)(?=\n## )/)?.[1] ?? ''
  const items = [
    ...catalog.matchAll(/term:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'/g)
  ]

  if (items.length === 0) {
    problems.push(
      `Could not parse any catalog entries from ${docPath}; the DefList shape ` +
        `no longer matches the pattern in scripts/check-drift.mjs`
    )
  }

  const documentedCore = new Set()
  const documentedApi = new Set()

  for (const [, term, description] of items) {
    const names = description
      .split(/,|\band\b/)
      .map(name => name.replace(/API packages$/, '').trim())
      .filter(Boolean)

    // One entry covers every `*-api` package by naming their base packages.
    const target = /api modules/i.test(term) ? documentedApi : documentedCore
    for (const name of names) target.add(toSlug(name))
  }

  compare({
    contract: coreSlugs,
    documented: documentedCore,
    describe: {
      missing: s =>
        `vendra-platform/packages has vendra-${s}, but the catalog in ${docPath} does not list it`,
      stale: s =>
        `the catalog in ${docPath} lists "${s}", but vendra-platform/packages has no vendra-${s}`
    }
  })

  compare({
    contract: apiSlugs,
    documented: documentedApi,
    describe: {
      missing: s =>
        `vendra-platform/packages has vendra-${s}-api, but the API modules entry in ${docPath} omits it`,
      stale: s =>
        `the API modules entry in ${docPath} lists "${s}", but vendra-platform/packages has no vendra-${s}-api`
    }
  })

  console.log(
    `  vendra-platform/packages: ${coreSlugs.size} packages, ${apiSlugs.size} API modules`
  )
} else {
  console.log('  vendra-platform/packages: not found, skipped')
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
