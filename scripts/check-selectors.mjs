#!/usr/bin/env node
/**
 * Verifies that the Nextra DOM hooks `app/globals.css` styles still exist in
 * the built HTML.
 *
 * The stylesheet reaches into markup this repository does not own. Most of it
 * hangs off Nextra's own class names, and one rule — the footer theme/locale
 * switcher strip — has no class to hook at all and is selected structurally,
 * by the `<hr class="nextra-border">` and `<footer>` that follow it.
 *
 * The failure mode is silence, the same one `check.test.mjs` describes for the
 * other validators here. A Nextra minor that renames a class or moves an
 * element does not break the build and does not throw at runtime: the rule
 * simply stops matching, and the site ships with an unstyled bare button on a
 * full-bleed band, or code spans with the theme's default padding, and nothing
 * says so. Every hook below is therefore asserted to match at least one
 * prerendered page.
 *
 * "At least one page", not every page, because these are surface-specific: a
 * table container only exists where a page has a table. That makes the check
 * weaker than it looks — it proves a hook still exists somewhere, not that it
 * exists everywhere it used to — but it catches the case that actually
 * happens, which is a rename removing it from all of them at once.
 *
 * Hence `optional`. Some hooks style a Nextra feature the documentation does
 * not currently use anywhere — as of writing, `<Cards>` and markdown tables —
 * so their absence is not evidence of anything and failing on it would mean a
 * red build until somebody writes a page with a table in it. Those are
 * reported as dormant instead: still visible, because a rule matching nothing
 * is worth knowing about and is the first thing to check when a treatment is
 * mysteriously missing, but not a failure. The hooks that appear on every page
 * are required, and their absence is a genuine regression.
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

/**
 * Each entry is a hook `globals.css` depends on, the rule that depends on it,
 * and a pattern that must match somewhere in the built output.
 *
 * The patterns are deliberately looser than the CSS selectors — a class is
 * matched as a word anywhere in the document rather than in a parsed class
 * attribute. A regex HTML parser cannot be as precise as a selector engine,
 * and a check that reports a false failure every time Nextra reorders an
 * attribute would be turned off within a month. The exception is the switcher
 * strip, where the adjacency *is* the fragile part and so is matched exactly.
 */
const hooks = [
  {
    hook: 'hr.nextra-border + footer',
    rule: 'footer switcher strip (`:has(> hr.nextra-border + footer)`)',
    // The one structural assumption in the stylesheet: the `<hr>` carries
    // `nextra-border`, and the `<footer>` is its immediate next sibling.
    // Anything inserted between the two silently unstyles the strip.
    pattern: /<hr[^>]*\bnextra-border\b[^>]*>\s*<footer\b/
  },
  {
    hook: 'next/font variable classes on <html>',
    rule: '--x-font-sans / --x-font-display, declared at :root in globals.css',
    // Not a Nextra hook, but the same silent failure. `--x-font-sans` resolves
    // `var(--font-inter)` in the scope it is declared in, so the classes that
    // define those variables have to be on the same element as the `:root`
    // rule that consumes them. On <body> instead, every font on the site falls
    // through to `ui-sans-serif` and nothing anywhere reports it. That shipped
    // once already.
    pattern: /<html[^>]*\bclass="[^"]*__variable[^"]*"/
  },
  {
    hook: '.nextra-navbar',
    rule: 'navbar blur and border tint',
    pattern: /\bnextra-navbar\b/
  },
  {
    hook: '.nextra-toc',
    rule: 'table-of-contents opacity',
    pattern: /\bnextra-toc\b/
  },
  {
    hook: 'code.nextra-code',
    rule: 'inline code fill, radius, and quote-mark removal',
    pattern: /\bnextra-code\b/
  },
  {
    hook: '.nextra-callout',
    rule: 'callout radius and border width',
    pattern: /\bnextra-callout\b/
  },
  // Dormant today: no page uses Nextra's `<Cards>`, and no page has a markdown
  // table. The rules are kept because both are ordinary things to write in
  // MDX and the styling should be there when someone does.
  {
    hook: '.nextra-cards',
    rule: 'card grid gap',
    pattern: /\bnextra-cards\b/,
    optional: true
  },
  {
    hook: '.nextra-card',
    rule: 'card border, hover lift, and title/description reorder',
    pattern: /\bnextra-card\b/,
    optional: true
  },
  {
    hook: '.nextra-table-container',
    rule: 'table frame, clipping, and header treatment',
    pattern: /\bnextra-table-container\b/,
    optional: true
  },
  {
    hook: '.nextra-search',
    rule: 'search trigger radius',
    pattern: /\bnextra-search\b/
  }
]

/**
 * Invariants that must hold on *every* page, not merely somewhere.
 *
 * The hooks above are surface-specific — a table container only exists where a
 * page has a table — so "at least one page" is the right assertion for them. It
 * is the wrong one here, and the difference is what let the following ship:
 *
 * Nextra's layout renders a skip-to-content link on every page. Its target is
 * emitted by the MDX wrapper, which the six full-bleed marketing pages
 * deliberately do not use. `MarketingPage` supplied the `<main>` those pages
 * were missing but not the id the link jumps to, so on the landing page, `/pro`,
 * `/about`, `/showcase`, `/examples`, `/ui`, `/contact`, and `/signup` the first
 * control a keyboard reader reaches did nothing at all. An "at least one page"
 * check would have been green throughout: `/docs` and `/blog` had the target the
 * whole time.
 *
 * That is the shape of bug this section is for — a landmark or hook that some
 * pages get from the framework and others have to supply by hand.
 */
const everyPage = [
  {
    hook: 'id="nextra-skip-nav"',
    rule: 'the target of Nextra’s skip-to-content link',
    pattern: /\bid="nextra-skip-nav"/,
    fix:
      'MDX pages get this from Nextra’s wrapper. Hand-written full-bleed\n' +
      '    pages get it from <SkipNavContent /> inside MarketingPage\n' +
      '    (components/page-wrapper.tsx). A page with neither has a skip link\n' +
      '    that points at nothing.'
  },
  {
    hook: '<main>',
    rule: 'the document landmark, and Pagefind’s indexing root',
    pattern: /<main\b/,
    fix:
      'Every page needs a <main>: it is the skip target’s container, the\n' +
      '    landmark screen readers navigate by, and — with data-pagefind-body —\n' +
      '    the only thing site search indexes. Use ContentWrapper or\n' +
      '    MarketingPage from components/page-wrapper.tsx.'
  }
]

const unmatched = new Set(hooks)
const missingEverywhere = new Map(everyPage.map(entry => [entry, []]))
let pages = 0

for await (const file of glob('**/*.html', { cwd: buildDir })) {
  if (file.startsWith('_')) continue // _not-found, _global-error
  if (file.startsWith('404')) continue // static-export error page
  pages++

  const html = readFileSync(resolve(buildDir, file), 'utf8')

  for (const entry of unmatched) {
    if (entry.pattern.test(html)) unmatched.delete(entry)
  }

  for (const entry of everyPage) {
    if (!entry.pattern.test(html)) missingEverywhere.get(entry).push(file)
  }
}

if (pages === 0) {
  console.error(
    '✗ selectors: no prerendered pages found — run `next build` first'
  )
  process.exit(1)
}

const missing = [...unmatched].filter(entry => !entry.optional)
const dormant = [...unmatched].filter(entry => entry.optional)

if (missing.length > 0) {
  console.error(
    `\n✗ ${missing.length} styling hook(s) in app/globals.css match nothing in the built site:\n`
  )
  for (const entry of missing) {
    console.error(`  ${entry.hook}\n    styles: ${entry.rule}`)
  }
  console.error(
    '\nThese are Nextra internals, so a theme upgrade is the usual cause. The' +
      '\nrule has not broken the build and will not throw — it has silently' +
      '\nstopped applying. Re-point the selector in app/globals.css and update' +
      '\nthe entry here, or drop both if the treatment is no longer wanted.\n'
  )
  process.exit(1)
}

const incomplete = [...missingEverywhere].filter(
  ([, files]) => files.length > 0
)

if (incomplete.length > 0) {
  console.error(
    `\n✗ ${incomplete.length} per-page invariant(s) missing from some pages:\n`
  )
  for (const [entry, files] of incomplete) {
    // Cap the list: a wholesale regression misses every page, and printing 65
    // paths buries the one line that says what to do about it.
    const shown = files.slice(0, 8)
    console.error(
      `  ${entry.hook} — ${entry.rule}` +
        `\n    missing from ${files.length}/${pages} pages: ${shown.join(', ')}` +
        (files.length > shown.length
          ? `, and ${files.length - shown.length} more`
          : '') +
        `\n    ${entry.fix}\n`
    )
  }
  process.exit(1)
}

console.log(
  `✓ selectors: ${hooks.length - unmatched.size}/${hooks.length} styling hooks present across ${pages} pages`
)
console.log(
  `  · ${everyPage.length} per-page invariants hold on all ${pages}: ${everyPage.map(entry => entry.hook).join(', ')}`
)

for (const entry of dormant) {
  console.log(`  · dormant: ${entry.hook} — no page renders it yet`)
}
