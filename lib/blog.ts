/**
 * The blog: notes on the technology the ecosystem runs on, the decisions behind
 * it, and announcements.
 *
 * Reader questions live in `/faq` instead — see `lib/faq.ts`. Both sections are
 * the same machinery bound to a different root; the engine is in
 * `lib/collection.ts`.
 */
import type { Entry } from './collection'
import { getEntries, getEntriesByTag, getEntryTags } from './collection'

export { formatDate, tagSlug } from './collection'
export type {
  Entry as Post,
  EntryFrontMatter as PostFrontMatter
} from './collection'

export const blogRoot = '/blog' as const

export function getPosts(): Promise<Entry[]> {
  return getEntries(blogRoot)
}

export function getTags(): Promise<{ tag: string; count: number }[]> {
  return getEntryTags(blogRoot)
}

export function getPostsByTag(slug: string): Promise<Entry[]> {
  return getEntriesByTag(blogRoot, slug)
}
