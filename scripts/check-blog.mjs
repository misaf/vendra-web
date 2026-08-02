#!/usr/bin/env node
/**
 * Validates blog post and FAQ answer frontmatter.
 *
 * `lib/collection.ts` treats a `date` as what makes a page an entry. That is
 * convenient — no list to maintain — but it fails quietly: an entry missing its
 * date, or carrying an unparseable one, simply never appears in its section
 * index, the tag pages, or the feed. It still builds, and it is still reachable
 * by URL, so nothing looks wrong.
 *
 * This turns that into a build failure.
 */
import { readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '../app')

// Both dated sections are checked by the same rules, because they are the same
// machinery. VENDRA_BLOG_DIR narrows this to one directory so the self-tests can
// point it at fixtures.
const contentDirs = process.env.VENDRA_BLOG_DIR
  ? [process.env.VENDRA_BLOG_DIR]
  : [resolve(appDir, 'blog'), resolve(appDir, 'faq')]

/** Reads the YAML frontmatter block as raw `key: value` lines. */
function frontMatter(text) {
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1]
  if (block === undefined) return null

  const fields = {}
  for (const line of block.split('\n')) {
    const match = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (match) fields[match[1]] = match[2].trim()
  }
  return fields
}

/** `"a"` / `'a'` -> `a` */
const unquote = value => value.replace(/^["']|["']$/g, '')

const problems = []
let posts = 0

// Collected first so the report is ordered by section, not by directory walk.
const entries = []
for (const dir of contentDirs) {
  for await (const file of glob('*/page.mdx', { cwd: dir })) {
    entries.push({ dir, file })
  }
}

for (const { dir, file } of entries) {
  posts++
  const label = `app/${basename(dir)}/${file}`
  const fields = frontMatter(readFileSync(resolve(dir, file), 'utf8'))

  if (!fields) {
    problems.push(`${label}: no frontmatter block`)
    continue
  }

  if (!fields.title) {
    problems.push(`${label}: missing "title"`)
  }

  if (!fields.date) {
    // The important one: without it the post is invisible everywhere but its
    // own URL.
    problems.push(
      `${label}: missing "date" — it would not appear in the index, tag pages, or feed`
    )
  } else {
    const date = unquote(fields.date)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      problems.push(`${label}: date "${date}" is not YYYY-MM-DD`)
    } else {
      // Round-trip rather than an Invalid Date check: JS silently rolls
      // impossible days over, so `2026-02-31` parses happily as 2026-03-03 and
      // the post would sort under the wrong month without any complaint.
      const parsed = new Date(date)
      const roundTrip = Number.isNaN(parsed.getTime())
        ? null
        : parsed.toISOString().slice(0, 10)

      if (roundTrip !== date) {
        problems.push(
          roundTrip
            ? `${label}: date "${date}" is not a real date (it resolves to ${roundTrip})`
            : `${label}: date "${date}" is not a real date`
        )
      }
    }
  }

  if (fields.tags && !fields.tags.startsWith('[')) {
    problems.push(
      `${label}: tags must be an array, e.g. tags: ["operations", "tls"]`
    )
  }
}

if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} blog frontmatter problem(s):\n`)
  for (const problem of problems) console.error(`  - ${problem}`)
  console.error('')
  process.exit(1)
}

console.log(
  posts === 0
    ? '✓ blog: no posts yet'
    : `✓ blog: ${posts} posts have valid frontmatter`
)
