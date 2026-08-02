#!/usr/bin/env node
/**
 * Self-tests for the validators in this directory.
 *
 * These scripts are regex parsers pointed at files that change for unrelated
 * reasons, and their dangerous failure mode is silence: a pattern stops
 * matching, nothing is validated, and the check still reports success. That has
 * already happened once — an MDX comment explaining the drift coupling
 * contained the very phrase the parser anchored on, so it read the comment
 * instead of the list.
 *
 * So the assertions below care as much about a check *failing when it should*
 * as about it passing. Run with `npm test`.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { after, describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const docsRoot = resolve(scriptsDir, '..')
const ecosystem = process.env.VENDRA_ECOSYSTEM_DIR ?? resolve(docsRoot, '..')

const temporaryDirs = []

function temporaryDir(prefix) {
  const dir = mkdtempSync(resolve(tmpdir(), prefix))
  temporaryDirs.push(dir)
  return dir
}

after(() => {
  for (const dir of temporaryDirs) rmSync(dir, { recursive: true, force: true })
})

/** Runs a check script and reports its exit code plus combined output. */
function run(script, env = {}) {
  try {
    const stdout = execFileSync('node', [resolve(scriptsDir, script)], {
      cwd: docsRoot,
      encoding: 'utf8',
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    })
    return { code: 0, output: stdout }
  } catch (error) {
    return {
      code: error.status ?? 1,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`
    }
  }
}

/* -------------------------------------------------------------------------- */
/* check-drift                                                                */
/* -------------------------------------------------------------------------- */

const openapiSource = resolve(ecosystem, 'vendra-controller/api/openapi.yaml')
const schemaSource = resolve(
  ecosystem,
  'vendra-storefront-florist/properties/schema.json'
)
const packagesSource = resolve(ecosystem, 'vendra/packages')

const haveSiblings =
  existsSync(openapiSource) &&
  existsSync(schemaSource) &&
  existsSync(packagesSource)

/**
 * Builds a fixture ecosystem from the real sibling repositories, then applies
 * `mutate` to it. Copying rather than hand-writing keeps the baseline honest:
 * the unmutated fixture must pass, so a failure means the mutation caused it.
 */
function fixtureEcosystem(mutate = () => {}) {
  const dir = temporaryDir('vendra-drift-')
  mkdirSync(resolve(dir, 'vendra-controller/api'), { recursive: true })
  mkdirSync(resolve(dir, 'vendra-storefront-florist/properties'), {
    recursive: true
  })
  cpSync(openapiSource, resolve(dir, 'vendra-controller/api/openapi.yaml'))
  cpSync(
    schemaSource,
    resolve(dir, 'vendra-storefront-florist/properties/schema.json')
  )
  cpSync(packagesSource, resolve(dir, 'vendra/packages'), { recursive: true })

  mutate({
    dir,
    openapi: resolve(dir, 'vendra-controller/api/openapi.yaml'),
    schema: resolve(dir, 'vendra-storefront-florist/properties/schema.json'),
    packages: resolve(dir, 'vendra/packages')
  })
  return dir
}

const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const writeJson = (path, value) =>
  writeFileSync(path, JSON.stringify(value, null, 2))

describe('check-drift', { skip: !haveSiblings && 'sibling repos not present' }, () => {
  it('passes against the real ecosystem', () => {
    const { code, output } = run('check-drift.mjs')
    assert.equal(code, 0, output)
    assert.match(output, /contract items match/)
  })

  it('passes against an unmutated fixture', () => {
    const { code, output } = run('check-drift.mjs', {
      VENDRA_ECOSYSTEM_DIR: fixtureEcosystem()
    })
    assert.equal(code, 0, output)
  })

  it('skips cleanly when the sibling repositories are absent', () => {
    const { code, output } = run('check-drift.mjs', {
      VENDRA_ECOSYSTEM_DIR: temporaryDir('vendra-empty-')
    })
    assert.equal(code, 0, output)
    assert.match(output, /nothing to check/)
  })

  it('flags an endpoint the docs do not document', () => {
    const dir = fixtureEcosystem(({ openapi }) => {
      const yaml = readFileSync(openapi, 'utf8')
      writeFileSync(openapi, yaml.replace(/^paths:\n/m, 'paths:\n  /v1/teapots:\n    get: {}\n'))
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /\/v1\/teapots.*does not document it/)
  })

  it('flags a documented endpoint the contract dropped', () => {
    const dir = fixtureEcosystem(({ openapi }) => {
      const yaml = readFileSync(openapi, 'utf8')
      writeFileSync(openapi, yaml.replace(/^ {2}\/health:\n(?: {4}.*\n)*/m, ''))
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /\/health.*no longer defines it/)
  })

  it('flags an unparseable openapi paths block', () => {
    const dir = fixtureEcosystem(({ openapi }) => {
      writeFileSync(openapi, 'paths:\ncomponents: {}\n')
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /Could not parse any endpoints/)
  })

  it('flags a new optional schema field', () => {
    const dir = fixtureEcosystem(({ schema }) => {
      const value = readJson(schema)
      value.properties.brandNewField = { type: 'string' }
      writeJson(schema, value)
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /brandNewField.*does not list it/)
  })

  it('flags a documented optional field the schema dropped', () => {
    const dir = fixtureEcosystem(({ schema }) => {
      const value = readJson(schema)
      delete value.properties.trustSeal
      writeJson(schema, value)
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /trustSeal.*no longer defines it/)
  })

  it('flags a required field missing from the example', () => {
    const dir = fixtureEcosystem(({ schema }) => {
      const value = readJson(schema)
      value.required = [...value.required, 'mandatoryNewField']
      writeJson(schema, value)
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /mandatoryNewField.*omits it/)
  })

  it('flags a new first-party package', () => {
    const dir = fixtureEcosystem(({ packages }) => {
      mkdirSync(resolve(packages, 'vendra-warehouse'), { recursive: true })
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /vendra-warehouse.*does not list it/)
  })

  it('flags a new API module package', () => {
    const dir = fixtureEcosystem(({ packages }) => {
      mkdirSync(resolve(packages, 'vendra-warehouse-api'), { recursive: true })
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /vendra-warehouse-api.*omits it/)
  })

  it('flags a documented package that no longer exists', () => {
    const dir = fixtureEcosystem(({ packages }) => {
      rmSync(resolve(packages, 'vendra-tagger'), { recursive: true, force: true })
    })
    const { code, output } = run('check-drift.mjs', { VENDRA_ECOSYSTEM_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /tagger.*has no vendra-tagger/)
  })
})

/* -------------------------------------------------------------------------- */
/* check-html                                                                 */
/* -------------------------------------------------------------------------- */

function htmlFixture(files) {
  const dir = temporaryDir('vendra-html-')
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(resolve(dir, name), contents)
  }
  return dir
}

const page = body => `<!doctype html><html><body>${body}</body></html>`

describe('check-html', () => {
  it('accepts valid nesting', () => {
    const dir = htmlFixture({
      'index.html': page('<div><p>text</p><ul><li>item</li></ul></div>')
    })
    const { code, output } = run('check-html.mjs', { VENDRA_BUILD_DIR: dir })
    assert.equal(code, 0, output)
    assert.match(output, /1 pages have valid nesting/)
  })

  it('rejects a <div> inside a <p>', () => {
    const dir = htmlFixture({ 'index.html': page('<p><div>nope</div></p>') })
    const { code, output } = run('check-html.mjs', { VENDRA_BUILD_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /<div> inside <p>/)
  })

  it('rejects a nested anchor', () => {
    const dir = htmlFixture({ 'index.html': page('<a href="#"><a href="#">x</a></a>') })
    const { code, output } = run('check-html.mjs', { VENDRA_BUILD_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /<a> inside <a>/)
  })

  it('ignores markup inside <script> and <style>', () => {
    const dir = htmlFixture({
      'index.html': page('<p>ok</p><script>var a = "<p><div></div></p>"</script>')
    })
    const { code, output } = run('check-html.mjs', { VENDRA_BUILD_DIR: dir })
    assert.equal(code, 0, output)
  })

  it('does not treat void elements as unclosed', () => {
    const dir = htmlFixture({ 'index.html': page('<p>a<br>b<img src="x">c</p>') })
    const { code, output } = run('check-html.mjs', { VENDRA_BUILD_DIR: dir })
    assert.equal(code, 0, output)
  })

  it('fails when there is nothing to check', () => {
    const { code, output } = run('check-html.mjs', {
      VENDRA_BUILD_DIR: temporaryDir('vendra-html-empty-')
    })
    assert.equal(code, 1)
    assert.match(output, /no prerendered pages found/)
  })
})

/* -------------------------------------------------------------------------- */
/* check-links                                                                */
/* -------------------------------------------------------------------------- */

describe('check-links', () => {
  it('passes against the real route tree', () => {
    const { code, output } = run('check-links.mjs')
    assert.equal(code, 0, output)
  })

  // The count in the success line is the guard against the _meta parser
  // silently matching nothing, so assert it is a real number.
  it('reports a non-zero count of _meta entries', () => {
    const { output } = run('check-links.mjs')
    const count = Number(output.match(/and (\d+) _meta entries/)?.[1])
    assert.ok(count > 0, `expected _meta entries to be counted, got: ${output}`)
  })
})
