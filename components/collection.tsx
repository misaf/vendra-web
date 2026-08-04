/**
 * Presentation shared by `/blog` and `/faq`, built on the same tokens as the
 * rest of the site.
 *
 * These use the same Tailwind utilities and design tokens as the rest of the
 * site rather than introducing a second visual language. The
 * two differ in what they contain, not in how an entry looks, so they render
 * through one set of components with the section passed as `root`.
 */

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { CollectionRoot, Entry, EntryFrontMatter } from '../lib/collection'
import { formatDate, rootFromFilePath, tagSlug } from '../lib/collection'
import { getAuthor } from '../lib/authors'
import { ExternalMark } from './icons'

/**
 * Author name with avatar, when the author is a known one.
 *
 * A plain <img> rather than next/image: the avatar is a fixed 160px asset in a
 * static export with image optimization disabled, so next/image would add a
 * wrapper and a srcset for no benefit.
 */
function AuthorBadge({ name }: { name: string }) {
  const author = getAuthor(name)
  if (!author) return null

  const content = (
    <>
      {author.avatar ? (
        <span className="inline-grid size-6 shrink-0 place-items-center overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--vendra-accent-2),transparent_55%)] bg-[color-mix(in_srgb,var(--vendra-accent-2),transparent_88%)] p-px shadow-[0_4px_12px_-8px_var(--vendra-accent-2)]">
          <img
            className="block size-full rounded-full object-cover [filter:grayscale(1)_contrast(1.18)_sepia(0.18)_saturate(1.65)_hue-rotate(218deg)] [mask-image:radial-gradient(circle,black_62%,rgb(0_0_0/0.72)_78%,transparent_100%)] transition group-hover:scale-105 group-hover:[filter:grayscale(0.65)_contrast(1.1)_saturate(1.2)]"
            src={author.avatar}
            alt=""
            width={24}
            height={24}
            loading="lazy"
            decoding="async"
          />
        </span>
      ) : null}
      {author.name}
    </>
  )

  return author.href ? (
    <a
      className="group relative inline-flex items-center gap-1.5 text-inherit no-underline transition-colors hover:text-[var(--vendra-fg)]"
      href={author.href}
      rel="author noreferrer"
      target="_blank"
    >
      {content}
      <ExternalMark />
    </a>
  ) : (
    <span className="inline-flex items-center gap-1.5">{content}</span>
  )
}

/** Date · author · reading time, plus tag links into the entry's own section. */
function EntryMeta({
  root,
  date,
  author,
  readingMinutes,
  tags = []
}: {
  root: CollectionRoot
  date?: string
  author?: string
  readingMinutes?: number
  tags?: string[]
}) {
  const facts: { key: string; node: ReactNode }[] = [
    date ? { key: 'date', node: formatDate(date) } : null,
    author ? { key: 'author', node: <AuthorBadge name={author} /> } : null,
    readingMinutes
      ? { key: 'reading', node: `${readingMinutes} min read` }
      : null
  ].filter(fact => fact !== null)

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--vendra-fg-subtle)]">
      {facts.map((fact, i) => (
        <span key={fact.key} className="inline-flex items-center">
          {i > 0 ? <span className="mr-2 select-none">·</span> : null}
          {fact.node}
        </span>
      ))}
      {tags.length ? (
        <span className="inline-flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <Link
              key={tag}
              href={`${root}/tags/${tagSlug(tag)}`}
              /* `min-h-6` — 24px, the floor WCAG 2.2 sets for a discrete
                 target. At `py-0.5` on `text-xs` these pills were 20px tall,
                 which is the smallest tap target on the site and sits on every
                 post row of `/blog` and `/faq` as well as under every entry
                 title. The sibling pills in `TagCloud` were already 32px, so
                 this also stops the same control being two sizes depending on
                 which of the two lists it is in. Height only: the padding and
                 the type stay, so the pill still reads as metadata beside the
                 date rather than as a button. */
              className="inline-flex min-h-6 items-center whitespace-nowrap rounded-full border border-[var(--vendra-line-strong)] bg-[var(--vendra-muted)] px-2 py-0.5 text-xs font-medium text-[var(--vendra-fg-muted)] no-underline transition-colors hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-accent-text)]"
            >
              {tag}
            </Link>
          ))}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Header rendered above every blog post and FAQ answer.
 *
 * Driven by the page's own frontmatter through the `wrapper` override in
 * `mdx-components.tsx`, so an entry never restates its date or tags in the body.
 * The wrapper sees frontmatter but not the route, so the section is recovered
 * from the `filePath` Nextra includes in that metadata.
 */
export function PostHeader({
  metadata
}: {
  metadata: EntryFrontMatter & { filePath?: string }
}) {
  return (
    <div className="mt-3">
      <EntryMeta
        root={rootFromFilePath(metadata.filePath)}
        date={metadata.date}
        author={metadata.author}
        readingMinutes={
          metadata.readingTime?.minutes
            ? Math.max(1, Math.round(metadata.readingTime.minutes))
            : undefined
        }
        tags={metadata.tags}
      />
    </div>
  )
}

/**
 * Section indexes and tag listings, for both `/blog` and `/faq`.
 *
 * `headingLevel` exists because this list is rendered at two different depths
 * and the entry title has to follow. On `/blog` and `/faq` it sits directly
 * under the page's `h1`, so `h2` is right. On the landing page it sits inside a
 * `Section` whose own title is already an `h2` — so a hardcoded `h2` made the
 * three post titles *siblings* of the "From the blog" heading that introduces
 * them, and anyone navigating by heading got an outline claiming the posts were
 * peers of the section rather than its contents.
 */
export function PostList({
  posts,
  root,
  empty = 'No posts yet.',
  headingLevel: Heading = 'h2'
}: {
  posts: Entry[]
  root: CollectionRoot
  empty?: string
  headingLevel?: 'h2' | 'h3'
}) {
  if (posts.length === 0) {
    return <p className="mt-8 text-[var(--vendra-fg-muted)]">{empty}</p>
  }

  return (
    <div className="mt-10 border-t border-[var(--vendra-line)]">
      {posts.map(post => (
        <article
          key={post.route}
          className="border-b border-[var(--vendra-line)] py-7"
        >
          <Link href={post.route} className="group no-underline">
            {/* Level varies, size does not — an entry title looks the same
                wherever the list is used. */}
            <Heading className="m-0 mb-2 border-0 p-0 text-[1.375rem] font-semibold tracking-[-0.02em] text-[var(--vendra-fg)] transition-colors group-hover:text-[var(--vendra-accent-text)]">
              {post.title}
            </Heading>
          </Link>
          <EntryMeta
            root={root}
            date={post.date}
            author={post.author}
            readingMinutes={post.readingMinutes}
            tags={post.tags}
          />
          {post.description ? (
            <p className="mt-3 text-[0.9375rem] leading-6.5 text-[var(--vendra-fg-muted)]">
              {post.description}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}

/** Tag directory shown on a section index. */
export function TagCloud({
  tags,
  root
}: {
  tags: { tag: string; count: number }[]
  root: CollectionRoot
}) {
  if (tags.length === 0) return null

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`${root}/tags/${tagSlug(tag)}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--vendra-line-strong)] bg-[var(--vendra-surface-raised)] px-3 py-1.5 text-[0.8125rem] leading-5 font-medium text-[var(--vendra-fg-muted)] no-underline transition-colors hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-accent-text)]"
        >
          {tag}
          <span className="ml-0.5 text-[var(--vendra-fg-subtle)] tabular-nums">
            {count}
          </span>
        </Link>
      ))}
    </div>
  )
}
