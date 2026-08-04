/**
 * Removes the previous Pagefind index from `out/` before a new one is built.
 *
 * `public/_pagefind` is a copy of the last build's index, kept so `next dev`
 * can serve search (see `sync-search-index.mjs`). `next build` copies all of
 * `public/` into `out/`, so by the time `pagefind` runs, `out/_pagefind`
 * already holds the previous index — and Pagefind writes fragment files under
 * content-hashed names, so it overwrites the ones it recognises and leaves
 * every fragment whose page has since been renamed, removed, or reworded.
 *
 * They accumulate. A build indexing 39 pages was shipping 67 fragments, the
 * extra 28 being URLs from when the documentation lived at the site root and
 * had no `/docs` prefix — `/api/`, `/controller/`, `/getting-started/`.
 *
 * The orphans were not being served as results: `pf_index` and `pf_meta` are
 * rewritten whole on each build, so nothing referenced them and search
 * returned only live URLs. They were dead weight in the deploy rather than a
 * correctness bug, which is why this is a cleanup step and not a fix to the
 * index itself. Starting from an empty directory keeps the shipped index to
 * the pages that currently exist.
 */
import { existsSync, rmSync } from 'node:fs'

const target = 'out/_pagefind'

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true })
  console.log(`✓ search: cleared stale ${target} before indexing`)
}
