/**
 * Copies the built Pagefind index into `public/` so search works in `next dev`.
 *
 * Pagefind indexes prerendered HTML, which only exists after a build — so the
 * index is generated into `out/_pagefind` by `postbuild`. `next dev` never
 * produces `out/`, and it serves nothing at `/_pagefind/`, so the search box
 * fails with "Failed to load search index" for the whole dev session.
 *
 * `next dev` does serve `public/` at the site root, so a copy there is reachable
 * at the same `/_pagefind/pagefind.js` the theme requests. The copy is a
 * snapshot of the last build: dev search returns results as of that build, not
 * as of the file currently being edited. Run a build again to refresh it.
 *
 * `public/_pagefind` is gitignored. It is also copied back into `out/` by the
 * next build, a moment before `postbuild` overwrites it with the fresh index —
 * harmless, but it does mean `out/_pagefind` is authoritative and this
 * directory is only ever a derived copy.
 */
import { cpSync, existsSync, rmSync } from 'node:fs'

const source = 'out/_pagefind'
const destination = 'public/_pagefind'

if (!existsSync(source)) {
  console.error(
    `search index: ${source} does not exist — did \`pagefind\` run?`
  )
  process.exit(1)
}

rmSync(destination, { recursive: true, force: true })
cpSync(source, destination, { recursive: true })

console.log(`✓ search: copied ${source} to ${destination} for \`next dev\``)
