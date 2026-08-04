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
 * The two things every page must carry, as opposed to the hooks above, which
 * only have to appear somewhere. Wrapped around every fixture body so the
 * per-page invariants are satisfied by default and a test that cares about them
 * can take them away deliberately.
 */
const landmarks = '<main><div id="nextra-skip-nav"></div></main>'

/**
 * Like `page`, but with the `next/font` variable classes on <html> — the tenth
 * hook, and the only one carried by the document element rather than by
 * anything in the body.
 */
const selectorPage = (
  body,
  htmlAttrs = ' class="inter_ab-module__cd__variable"'
) => `<!doctype html><html${htmlAttrs}><body>${landmarks}${body}</body></html>`

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

  /* The per-page invariants. These exist because "at least one page" was the
     wrong assertion for a skip-nav target, and being wrong about it was silent:
     the docs and blog carried the id throughout while eight marketing pages
     shipped a skip link pointing at nothing. */

  it('catches a skip-nav target missing from only some pages', () => {
    // The exact shape of the bug: most of the site is fine, so any check that
    // stops at the first match reports success.
    const dir = htmlFixture({
      'index.html': selectorPage(allHooks.join('')),
      'docs.html': selectorPage(''),
      'pro.html': `<!doctype html><html class="inter_ab-module__cd__variable"><body><main>no skip target</main></body></html>`
    })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 1)
    assert.match(output, /nextra-skip-nav/)
    assert.match(output, /missing from 1\/3 pages: pro\.html/)
    // The landmark is present on that page, so it must not also be reported.
    assert.doesNotMatch(output, /<main> —/)
  })

  it('catches a page with no <main> landmark', () => {
    const dir = htmlFixture({
      'index.html': selectorPage(allHooks.join('')),
      'orphan.html': `<!doctype html><html class="inter_ab-module__cd__variable"><body><div id="nextra-skip-nav"></div></body></html>`
    })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 1)
    assert.match(output, /missing from 1\/2 pages: orphan\.html/)
  })

  it('reports that the per-page invariants hold when they do', () => {
    const dir = htmlFixture({ 'index.html': selectorPage(allHooks.join('')) })
    const { code, output } = run('check-selectors.mjs', {
      VENDRA_BUILD_DIR: dir
    })
    assert.equal(code, 0, output)
    assert.match(output, /2 per-page invariants hold on all 1/)
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

/* -------------------------------------------------------------------------- */
/* check-tokens                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Writes .tsx sources into a fake source tree.
 *
 * `check-tokens.mjs` takes VENDRA_SOURCE_DIRS, so the fixture is a directory
 * name plus its files rather than a whole app.
 */
function sourceFixture(files) {
  const dir = temporaryDir('vendra-tokens-')
  mkdirSync(resolve(dir, 'components'), { recursive: true })
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(resolve(dir, 'components', name), contents)
  }
  return dir
}

describe('check-tokens', () => {
  it('passes against the real source tree', () => {
    const { code, output } = run('check-tokens.mjs')
    assert.equal(code, 0, output)
    assert.match(output, /use the palette in app\/globals\.css/)
  })

  it('catches a raw palette colour', () => {
    const dir = sourceFixture({
      'leak.tsx': `export const x = <p className="text-neutral-600">hi</p>\n`
    })
    const { code, output } = run('check-tokens.mjs', {
      VENDRA_SOURCE_DIRS: dir + '/components'
    })
    assert.equal(code, 1)
    assert.match(output, /text-neutral-600/)
  })

  it('catches a raw hex colour', () => {
    const dir = sourceFixture({
      'leak.tsx': `export const x = <p className="text-[#ff0000]">hi</p>\n`
    })
    const { code, output } = run('check-tokens.mjs', {
      VENDRA_SOURCE_DIRS: dir + '/components'
    })
    assert.equal(code, 1)
    assert.match(output, /#ff0000/)
  })

  it('does not read a comment discussing the class it bans', () => {
    // The trap this whole test file was written about: the comments in this
    // repository quote the very class names being removed, so a scanner that
    // reads raw text flags the explanation of the fix as the bug. The footer
    // note in app/layout.tsx does exactly this.
    const dir = sourceFixture({
      'documented.tsx': `
/* This used to be text-neutral-400, which measured 2.52:1 on white. */
// Also bad: bg-zinc-900 and text-[#abcdef].
export const x = <p className="text-[var(--vendra-fg-subtle)]">hi</p>
`
    })
    const { code, output } = run('check-tokens.mjs', {
      VENDRA_SOURCE_DIRS: dir + '/components'
    })
    assert.equal(code, 0, output)
  })

  it('accepts a token', () => {
    const dir = sourceFixture({
      'good.tsx': `export const x = <p className="text-[var(--vendra-fg)]">hi</p>\n`
    })
    const { code, output } = run('check-tokens.mjs', {
      VENDRA_SOURCE_DIRS: dir + '/components'
    })
    assert.equal(code, 0, output)
  })

  it('fails when there is nothing to check', () => {
    const { code, output } = run('check-tokens.mjs', {
      VENDRA_SOURCE_DIRS: temporaryDir('vendra-tokens-empty-')
    })
    assert.equal(code, 1)
    assert.match(output, /no source files found/)
  })
})

/* -------------------------------------------------------------------------- */
/* check-contrast                                                             */
/* -------------------------------------------------------------------------- */

function cssFixture(contents) {
  const dir = temporaryDir('vendra-contrast-')
  const file = resolve(dir, 'globals.css')
  writeFileSync(file, contents)
  return file
}

/** A palette with every token the check resolves, all of them passing. */
const palette = ({ subtle = 'rgb(106 106 115)' } = {}) => `
:root {
  --vendra-accent: hsl(var(--nextra-primary-hue), var(--nextra-primary-saturation), var(--nextra-primary-lightness));
  --vendra-accent-strong: hsl(var(--nextra-primary-hue), var(--nextra-primary-saturation), 30%);
  --vendra-on-accent: rgb(255 255 255);
  --vendra-accent-text: var(--vendra-accent-strong);
  --vendra-accent-2-text: rgb(109 40 217);
  --vendra-accent-3-text: rgb(3 105 161);
  --vendra-surface-raised: rgb(255 255 255 / 0.95);
  --vendra-muted: rgb(9 9 11 / 0.035);
  --vendra-fg: rgb(9 9 11);
  --vendra-fg-muted: rgb(82 82 91);
  --vendra-fg-subtle: ${subtle};
  --vendra-bg: rgb(255 255 255);
}
.dark {
  --vendra-accent-strong: var(--vendra-accent);
  --vendra-on-accent: rgb(9 9 11);
  --vendra-accent-text: var(--vendra-accent);
  --vendra-accent-2-text: rgb(167 139 250);
  --vendra-accent-3-text: rgb(56 189 248);
  --vendra-surface-raised: rgb(255 255 255 / 0.07);
  --vendra-muted: rgb(255 255 255 / 0.045);
  --vendra-fg: rgb(250 250 250);
  --vendra-fg-muted: rgb(190 190 196);
  --vendra-fg-subtle: rgb(160 160 168);
  --vendra-bg: rgb(9 9 11);
}
`

describe('check-contrast', () => {
  it('passes against the real palette', () => {
    const { code, output } = run('check-contrast.mjs')
    assert.equal(code, 0, output)
    assert.match(output, /clear WCAG AA on both themes/)
  })

  it('catches a foreground token dropped below the floor', () => {
    // #a3a3a3 on white is 2.52:1 — the value the footer copyright actually
    // shipped with, and the reason this check exists.
    const file = cssFixture(palette({ subtle: 'rgb(163 163 163)' }))
    const { code, output } = run('check-contrast.mjs', {
      VENDRA_CSS_FILE: file
    })
    assert.equal(code, 1)
    assert.match(output, /--vendra-fg-subtle on --vendra-bg/)
    assert.match(output, /2\.5\d:1, needs 4\.5:1/)
  })

  it('composites alpha surfaces rather than measuring against the page', () => {
    // The distinction the token comments turn on: this value clears 4.5:1
    // against white and misses against the muted band it is actually used on.
    // Measuring against the page alone would call it a pass.
    const file = cssFixture(palette({ subtle: 'rgb(117 117 126)' }))
    const { code, output } = run('check-contrast.mjs', {
      VENDRA_CSS_FILE: file
    })
    assert.equal(code, 1)
    assert.match(output, /--vendra-fg-subtle on --vendra-muted/)
    assert.doesNotMatch(output, /--vendra-fg-subtle on --vendra-bg/)
  })

  it('reads the brand lightness from the layout rather than assuming it', () => {
    // The accent tokens are half-owned by app/layout.tsx: <Head> writes the
    // --nextra-primary-* values that --vendra-accent is built from, and
    // globals.css deliberately does not restate them. So a brand change made
    // there has to move this check with it.
    //
    // Darkening the *dark* theme's accent is what exposes that coupling. The
    // light theme pins --vendra-accent-strong at 30% regardless, but on the dark
    // theme accent-text is the accent itself — at 20% lightness it is a dark
    // green on a near-black page.
    const layout = resolve(temporaryDir('vendra-layout-'), 'layout.tsx')
    writeFileSync(
      layout,
      `<Head color={{ hue: 161, saturation: { light: 57, dark: 62 }, lightness: { light: 40, dark: 20 } }} />`
    )
    const { code, output } = run('check-contrast.mjs', {
      VENDRA_LAYOUT_FILE: layout
    })
    assert.equal(code, 1)
    assert.match(output, /dark\s+--vendra-accent-text on --vendra-bg/)
  })

  it('throws rather than guessing at a value it cannot read', () => {
    const file = cssFixture(
      palette().replace('rgb(9 9 11)', 'color(display-p3 0 0 0)')
    )
    const { code, output } = run('check-contrast.mjs', {
      VENDRA_CSS_FILE: file
    })
    assert.equal(code, 1)
    assert.match(output, /cannot read/)
  })
})
