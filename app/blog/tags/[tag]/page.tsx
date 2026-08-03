import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ContentWrapper } from '../../../../components/page-wrapper'
import { PostList } from '../../../../components/collection'
import { blogRoot, getPostsByTag, getTags, tagSlug } from '../../../../lib/blog'

type Params = { tag: string }

/**
 * Static export has no server, so every tag page must be enumerated at build
 * time. A tag that no longer has posts simply stops being generated.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const tags = await getTags()
  return tags.map(({ tag }) => ({ tag: tagSlug(tag) }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `Posts tagged “${tag}”`,
    description: `Vendra ecosystem posts tagged ${tag}.`
  }
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params
  const posts = await getPostsByTag(tag)

  if (posts.length === 0) notFound()

  // Prefer the tag's authored spelling over the URL slug.
  const label =
    posts.flatMap(post => post.tags).find(value => tagSlug(value) === tag) ??
    tag

  return (
    <ContentWrapper searchable={false}>
      <h1>{label}</h1>

      <div className="vendra-lede">
        <p>
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} tagged{' '}
          <strong>{label}</strong>. <Link href="/blog">All posts</Link>
        </p>
      </div>

      <PostList posts={posts} root={blogRoot} />
    </ContentWrapper>
  )
}
