import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentWrapper } from '../../components/page-wrapper'
import { PostList, TagCloud } from '../../components/collection'
import { faqRoot, getQuestionTags, getQuestions } from '../../lib/faq'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Questions from clients, operators, and developers about the Vendra ecosystem, answered in full.'
}

export default async function FaqIndex() {
  const [questions, tags] = await Promise.all([
    getQuestions(),
    getQuestionTags()
  ])

  return (
    <ContentWrapper searchable={false}>
      <h1>FAQ</h1>

      <div className="vendra-lede">
        <p>
          Questions we were actually asked — by clients, by operators running a
          host, and by developers building against the API. Each one is answered
          in full, including the ones where the answer was no and the ones where
          the asker had found a real limitation.
        </p>
        <p>
          Notes on the technology behind the ecosystem live in the{' '}
          <Link href="/blog">blog</Link>. The{' '}
          <Link href="/docs/overview">documentation</Link> is the reference for how
          any of it works.
        </p>
      </div>

      <TagCloud tags={tags} root={faqRoot} />
      <PostList
        posts={questions}
        root={faqRoot}
        empty="No questions answered yet."
      />
    </ContentWrapper>
  )
}
