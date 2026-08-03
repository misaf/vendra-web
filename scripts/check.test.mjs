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

describe(
  'check-drift',
  { skip: !haveSiblings && 'sibling repos not present' },
  () => {
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
        writeFileSync(
          openapi,
          yaml.replace(/^paths:\n/m, 'paths:\n  /v1/teapots:\n    get: {}\n')
        )
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /\/v1\/teapots.*does not document it/)
    })

    it('flags a documented endpoint the contract dropped', () => {
      const dir = fixtureEcosystem(({ openapi }) => {
        const yaml = readFileSync(openapi, 'utf8')
        writeFileSync(
          openapi,
          yaml.replace(/^ {2}\/health:\n(?: {4}.*\n)*/m, '')
        )
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /\/health.*no longer defines it/)
    })

    it('flags an unparseable openapi paths block', () => {
      const dir = fixtureEcosystem(({ openapi }) => {
        writeFileSync(openapi, 'paths:\ncomponents: {}\n')
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /Could not parse any endpoints/)
    })

    it('flags a new optional schema field', () => {
      const dir = fixtureEcosystem(({ schema }) => {
        const value = readJson(schema)
        value.properties.brandNewField = { type: 'string' }
        writeJson(schema, value)
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /brandNewField.*does not list it/)
    })

    it('flags a documented optional field the schema dropped', () => {
      const dir = fixtureEcosystem(({ schema }) => {
        const value = readJson(schema)
        delete value.properties.trustSeal
        writeJson(schema, value)
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /trustSeal.*no longer defines it/)
    })

    it('flags a required field missing from the example', () => {
      const dir = fixtureEcosystem(({ schema }) => {
        const value = readJson(schema)
        value.required = [...value.required, 'mandatoryNewField']
        writeJson(schema, value)
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /mandatoryNewField.*omits it/)
    })

    it('flags a new first-party package', () => {
      const dir = fixtureEcosystem(({ packages }) => {
        mkdirSync(resolve(packages, 'vendra-warehouse'), { recursive: true })
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /vendra-warehouse.*does not list it/)
    })

    it('flags a new API module package', () => {
      const dir = fixtureEcosystem(({ packages }) => {
        mkdirSync(resolve(packages, 'vendra-warehouse-api'), {
          recursive: true
        })
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /vendra-warehouse-api.*omits it/)
    })

    it('flags a documented package that no longer exists', () => {
      const dir = fixtureEcosystem(({ packages }) => {
        rmSync(resolve(packages, 'vendra-tagger'), {
          recursive: true,
          force: true
        })
      })
      const { code, output } = run('check-drift.mjs', {
        VENDRA_ECOSYSTEM_DIR: dir
      })
      assert.equal(code, 1)
      assert.match(output, /tagger.*has no vendra-tagger/)
    })
  }
)

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
    const dir = htmlFixture({
      'index.html': page('<a href="#"><a href="#">x</a></a>')
    })
    const { code, output } = run('check-html.mjs', { VENDRA_BUILD_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /<a> inside <a>/)
  })

  it('ignores markup inside <script> and <style>', () => {
    const dir = htmlFixture({
      'index.html': page(
        '<p>ok</p><script>var a = "<p><div></div></p>"</script>'
      )
    })
    const { code, output } = run('check-html.mjs', { VENDRA_BUILD_DIR: dir })
    assert.equal(code, 0, output)
  })

  it('does not treat void elements as unclosed', () => {
    const dir = htmlFixture({
      'index.html': page('<p>a<br>b<img src="x">c</p>')
    })
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
/* check-selectors                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Every hook the check knows about, so a fixture can satisfy all of them and
 * then remove exactly one. Kept as markup rather than as a list of class names
 * because the switcher-strip entry asserts an adjacency, not a class.
 */
const allHooks = [
  '<div class="nextra-navbar"></div>',
  '<div class="nextra-toc"></div>',
  '<code class="nextra-code">x</code>',
  '<div class="nextra-callout"></div>',
  '<div class="nextra-cards"></div>',
  '<div class="nextra-card"></div>',
  '<div class="nextra-table-container"></div>',
  '<div class="nextra-search"></div>',
  '<div><div>switcher</div><hr class="nextra-border"/><footer>f</footer></div>'
]

/**
 * Like `page`, but with the `next/font` variable classes on <html> — the tenth
 * hook, and the only one carried by the document element rather than by
 * anything in the body.
 */
const selectorPage = (
  body,
  htmlAttrs = ' class="inter_ab-module__cd__variable"'
) => `<!doctype html><html${htmlAttrs}><body>${body}</body></html>`

describe('check-selectors', () => {
  it('passes when every hook is present', () => {
    const dir = htmlFixture({ 'index.html': selectorPage(allHooks.join('')) })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 0, output)
    assert.match(output, /10\/10 styling hooks present/)
    assert.doesNotMatch(output, /dormant/)
  })

  it('catches the font variables sitting on <body> instead of <html>', () => {
    // The regression that shipped: the classes are still in the document, so
    // grepping for them finds them — they are just one element too low, and
    // every `var(--font-*)` in the `:root` block resolves to nothing.
    const dir = htmlFixture({
      'index.html': `<!doctype html><html><body class="inter_ab-module__cd__variable">${allHooks.join('')}</body></html>`
    })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 1)
    assert.match(output, /next\/font variable classes/)
  })

  it('reports an absent optional hook without failing', () => {
    // `.nextra-table-container` styles a feature no page uses yet, so its
    // absence is not evidence of a rename. It still has to be *reported* —
    // a rule matching nothing is the first thing to check when a treatment
    // goes missing — but it must not turn the build red.
    const dir = htmlFixture({
      'index.html': selectorPage(
        allHooks
          .filter(hook => !hook.includes('nextra-table-container'))
          .join('')
      )
    })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 0, output)
    assert.match(output, /9\/10 styling hooks present/)
    assert.match(output, /dormant: \.nextra-table-container/)
  })

  it('still fails when a required hook is absent', () => {
    const dir = htmlFixture({
      'index.html': selectorPage(
        allHooks.filter(hook => !hook.includes('nextra-navbar')).join('')
      )
    })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 1)
    assert.match(output, /nextra-navbar/)
  })

  it('accepts hooks spread across different pages', () => {
    // Real builds are like this: only pages with a table carry the table
    // container. The check must not require every hook on every page.
    const dir = htmlFixture(
      Object.fromEntries(
        allHooks.map((hook, i) => [`page-${i}.html`, selectorPage(hook)])
      )
    )
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 0, output)
  })

  it('reports a renamed class, and only that one', () => {
    const dir = htmlFixture({
      'index.html': selectorPage(
        allHooks.join('').replace('nextra-callout', 'nextra-admonition')
      )
    })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 1)
    assert.match(output, /nextra-callout/)
    assert.doesNotMatch(output, /nextra-navbar/)
  })

  it('reports the switcher strip when the hr/footer adjacency breaks', () => {
    // The exact regression the structural selector is exposed to: something
    // inserted between the rule and the footer. Both elements are still there,
    // so a class-presence check would miss it.
    const dir = htmlFixture({
      'index.html': selectorPage(
        allHooks
          .join('')
          .replace(
            '<hr class="nextra-border"/><footer>',
            '<hr class="nextra-border"/><div></div><footer>'
          )
      )
    })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 1)
    assert.match(output, /hr\.nextra-border \+ footer/)
  })

  it('fails when there is nothing to check', () => {
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: temporaryDir('vendra-selectors-empty-')
    })
    assert.equal(code, 1)
    assert.match(output, /no prerendered pages found/)
  })
})

/* -------------------------------------------------------------------------- */
/* check-blog                                                                 */
/* -------------------------------------------------------------------------- */

function blogFixture(posts) {
  const dir = temporaryDir('vendra-blog-')
  for (const [slug, contents] of Object.entries(posts)) {
    mkdirSync(resolve(dir, slug), { recursive: true })
    writeFileSync(resolve(dir, slug, 'page.mdx'), contents)
  }
  return dir
}

const post = (fields, body = '# Title\n') => `---\n${fields}\n---\n\n${body}`

describe('check-blog', () => {
  it('passes against the real posts', () => {
    const { code, output } = run('check-blog.mjs')
    assert.equal(code, 0, output)
    assert.match(output, /valid frontmatter|no posts yet/)
  })

  it('accepts a complete post', () => {
    const dir = blogFixture({
      hello: post('title: "Hello"\ndate: "2026-01-02"\ntags: ["a"]')
    })
    const { code, output } = run('check-blog.mjs', { VENDRA_BLOG_DIR: dir })
    assert.equal(code, 0, output)
    assert.match(output, /1 posts have valid frontmatter/)
  })

  // The whole reason this check exists.
  it('rejects a post with no date', () => {
    const dir = blogFixture({ hello: post('title: "Hello"') })
    const { code, output } = run('check-blog.mjs', { VENDRA_BLOG_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /missing "date"/)
  })

  it('rejects a malformed date', () => {
    const dir = blogFixture({
      hello: post('title: "Hello"\ndate: "Jan 2 2026"')
    })
    const { code, output } = run('check-blog.mjs', { VENDRA_BLOG_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /is not YYYY-MM-DD/)
  })

  it('rejects an impossible date', () => {
    const dir = blogFixture({
      hello: post('title: "Hello"\ndate: "2026-02-31"')
    })
    const { code, output } = run('check-blog.mjs', { VENDRA_BLOG_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /not a real date/)
  })

  it('rejects a missing title', () => {
    const dir = blogFixture({ hello: post('date: "2026-01-02"') })
    const { code, output } = run('check-blog.mjs', { VENDRA_BLOG_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /missing "title"/)
  })

  it('rejects tags that are not an array', () => {
    const dir = blogFixture({
      hello: post('title: "Hello"\ndate: "2026-01-02"\ntags: operations')
    })
    const { code, output } = run('check-blog.mjs', { VENDRA_BLOG_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /tags must be an array/)
  })

  it('rejects a post with no frontmatter at all', () => {
    const dir = blogFixture({ hello: '# Just a heading\n' })
    const { code, output } = run('check-blog.mjs', { VENDRA_BLOG_DIR: dir })
    assert.equal(code, 1)
    assert.match(output, /no frontmatter block/)
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
