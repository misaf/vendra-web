/**
 * Presentation shared by `/blog` and `/faq`, built on the same tokens as the
 * rest of the site.
 *
 * These reuse the `.vendra-*` layer in `globals.css` rather than introducing a
 * second visual language — both sections are part of this site, not guests. The
 * two differ in what they contain, not in how an entry looks, so they render
 * through one set of components with the section passed as `root`.
 */

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { CollectionRoot, Entry, EntryFrontMatter } from '../lib/collection'
import { formatDate, rootFromFilePath, tagSlug } from '../lib/collection'
import { getAuthor } from '../lib/authors'

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
        <img
          className="vendra-post-avatar"
          src={author.avatar}
          alt=""
          width={20}
          height={20}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      {author.name}
    </>
  )

  return author.href ? (
    <a
      className="vendra-post-author vendra-post-author-link"
      href={author.href}
      rel="author noreferrer"
      target="_blank"
    >
      {content}
    </a>
  ) : (
    <span className="vendra-post-author">{content}</span>
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
    <div className="vendra-post-meta">
      {facts.map((fact, i) => (
        <span key={fact.key} className="vendra-post-fact">
          {i > 0 ? <span className="vendra-post-meta-sep">·</span> : null}
          {fact.node}
        </span>
      ))}
      {tags.length ? (
        <span className="vendra-post-tags">
          {tags.map(tag => (
            <Link
              key={tag}
              href={`${root}/tags/${tagSlug(tag)}`}
              className="vendra-tag vendra-tag-neutral vendra-tag-link"
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
    <div className="vendra-post-header">
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

/** Section indexes and tag listings, for both `/blog` and `/faq`. */
export function PostList({
  posts,
  root,
  empty = 'No posts yet.'
}: {
  posts: Entry[]
  root: CollectionRoot
  empty?: string
}) {
  if (posts.length === 0) {
    return <p className="vendra-post-empty">{empty}</p>
  }

  return (
    <div className="vendra-posts">
      {posts.map(post => (
        <article key={post.route} className="vendra-post-item">
          <Link href={post.route} className="vendra-post-link">
            <h2 className="vendra-post-title">{post.title}</h2>
          </Link>
          <EntryMeta
            root={root}
            date={post.date}
            author={post.author}
            readingMinutes={post.readingMinutes}
            tags={post.tags}
          />
          {post.description ? (
            <p className="vendra-post-desc">{post.description}</p>
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
    <div className="vendra-tag-cloud">
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`${root}/tags/${tagSlug(tag)}`}
          className="vendra-chip vendra-chip-link"
        >
          {tag}
          <span className="vendra-chip-count">{count}</span>
        </Link>
      ))}
    </div>
  )
}
