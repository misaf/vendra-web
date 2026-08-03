import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentWrapper } from '../../components/page-wrapper'
import { PostList, TagCloud } from '../../components/collection'
import { blogRoot, getPosts, getTags } from '../../lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on the technology behind the Vendra ecosystem, the decisions behind it, and what we are building next.'
}

export default async function BlogIndex() {
  const [posts, tags] = await Promise.all([getPosts(), getTags()])

  return (
    <ContentWrapper searchable={false}>
      <h1>Blog</h1>

      <div className="vendra-lede">
        <p>
          The technology the ecosystem runs on, the decisions behind it, what
          they cost, and what we have decided to build next. The{' '}
          <Link href="/overview">documentation</Link> describes how things work
          — these posts explain why they work that way.
        </p>
        <p>
          Questions from clients, operators, and developers are answered in the{' '}
          <Link href="/faq">FAQ</Link>.
        </p>
      </div>

      <TagCloud tags={tags} root={blogRoot} />
      <PostList posts={posts} root={blogRoot} />
    </ContentWrapper>
  )
}
