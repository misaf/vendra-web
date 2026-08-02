import { getPageMap } from 'nextra/page-map'

/**
 * The dated-entry engine behind both `/blog` and `/faq`.
 *
 * Entries are derived entirely from frontmatter via Nextra's page map. Nothing
 * here maintains a list: adding `app/<section>/<slug>/page.mdx` with a `date` is
 * all it takes to appear in the section index, its tag pages, and — for the blog
 * — the feed. That is deliberate, because a hand-maintained index is the first
 * thing to go stale.
 *
 * `lib/blog.ts` and `lib/faq.ts` bind this to a section root. Callers use those.
 */

/** A section root, as it appears in the URL. */
export type CollectionRoot = '/blog' | '/faq'

export type EntryFrontMatter = {
  title?: string
  date?: string
  author?: string
  description?: string
  tags?: string[]
  readingTime?: { text: string; minutes: number; words: number }
}

export type Entry = {
  route: string
  title: string
  date: string
  author?: string
  description?: string
  tags: string[]
  readingMinutes?: number
}

/** Page-map nodes carry either a route with frontmatter, or children, or both. */
type PageMapNode = {
  route?: string
  frontMatter?: EntryFrontMatter
  children?: PageMapNode[]
}

function walk(items: readonly PageMapNode[], out: PageMapNode[] = []) {
  for (const item of items) {
    if (item.route) out.push(item)
    if (item.children) walk(item.children, out)
  }
  return out
}

/**
 * Every entry in a section, newest first.
 *
 * A `date` in the frontmatter is what makes a page an entry. That also excludes
 * the index and the tag pages without needing to name them, since neither has
 * frontmatter.
 */
export async function getEntries(root: CollectionRoot): Promise<Entry[]> {
  // Nextra's PageMapItem union includes meta files and folders; `walk` only
  // reads `route`, `frontMatter`, and `children`, so the narrower shape above
  // is what actually matters here.
  const pageMap = (await getPageMap(root)) as unknown as PageMapNode[]
  const nodes = walk(pageMap)

  const entries = nodes.flatMap(node => {
    const meta = node.frontMatter
    if (!node.route || !meta?.date) return []

    return [
      {
        route: node.route,
        title: meta.title ?? node.route.split('/').pop() ?? node.route,
        date: meta.date,
        author: meta.author,
        description: meta.description,
        tags: meta.tags ?? [],
        readingMinutes: meta.readingTime?.minutes
          ? Math.max(1, Math.round(meta.readingTime.minutes))
          : undefined
      }
    ]
  })

  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

/** Distinct tags with entry counts, most-used first then alphabetical. */
export async function getEntryTags(
  root: CollectionRoot
): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>()
  for (const entry of await getEntries(root)) {
    for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }

  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/**
 * Tags are scoped to their section: `/blog/tags/api` and `/faq/tags/api` are
 * different pages listing different things. Sharing a tag namespace across the
 * two would mean a tag page that mixes questions with technology notes, which
 * is exactly the separation these sections exist to make.
 */
export async function getEntriesByTag(
  root: CollectionRoot,
  slug: string
): Promise<Entry[]> {
  const entries = await getEntries(root)
  return entries.filter(entry => entry.tags.some(tag => tagSlug(tag) === slug))
}

/** `Release Notes` -> `release-notes`, so a tag survives being put in a URL. */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-')
}

/** Display form for a date, stable across locales so the build is reproducible. */
export function formatDate(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

/**
 * Which section a page belongs to, from the `filePath` Nextra puts in each MDX
 * page's metadata (`app/faq/<slug>/page.mdx`).
 *
 * The post header needs this to point its tag links at the right section, and
 * the header only ever sees frontmatter — not the route it is rendering under.
 */
export function rootFromFilePath(filePath?: unknown): CollectionRoot {
  return typeof filePath === 'string' && filePath.includes('app/faq/')
    ? '/faq'
    : '/blog'
}
