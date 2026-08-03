import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ContentWrapper } from '../../../../components/page-wrapper'
import { PostList } from '../../../../components/collection'
import {
  faqRoot,
  getQuestionTags,
  getQuestionsByTag
} from '../../../../lib/faq'
import { tagSlug } from '../../../../lib/collection'

type Params = { tag: string }

/**
 * Static export has no server, so every tag page must be enumerated at build
 * time. A tag that no longer has questions simply stops being generated.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const tags = await getQuestionTags()
  return tags.map(({ tag }) => ({ tag: tagSlug(tag) }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `Questions tagged “${tag}”`,
    description: `Vendra ecosystem questions tagged ${tag}.`
  }
}

export default async function FaqTagPage({
  params
}: {
  params: Promise<Params>
}) {
  const { tag } = await params
  const questions = await getQuestionsByTag(tag)

  if (questions.length === 0) notFound()

  // Prefer the tag's authored spelling over the URL slug.
  const label =
    questions.flatMap(q => q.tags).find(value => tagSlug(value) === tag) ?? tag

  return (
    <ContentWrapper searchable={false}>
      <h1>{label}</h1>

      <div className="mt-4 max-w-184 text-[1.0625rem] leading-7 text-[var(--vendra-fg-muted)] [&>p]:m-0">
        <p>
          {questions.length} {questions.length === 1 ? 'question' : 'questions'}{' '}
          tagged <strong>{label}</strong>.{' '}
          <Link href="/faq">All questions</Link>
        </p>
      </div>

      <PostList posts={questions} root={faqRoot} />
    </ContentWrapper>
  )
}
