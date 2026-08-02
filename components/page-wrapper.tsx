import type { ReactNode } from 'react'
import { useMDXComponents } from '../mdx-components'

/**
 * Applies Nextra's page chrome to a hand-written `page.tsx`.
 *
 * MDX pages get this wrapper automatically — it supplies the sidebar, the
 * content width, and the `<main data-pagefind-body>` element Pagefind indexes.
 * A plain React page renders outside all of that unless it opts in here.
 *
 * `searchable: false` keeps listing pages out of the search index. The posts
 * they link to are indexed already, so indexing the listings too would return
 * the same titles twice for every query.
 */
export function ContentWrapper({
  children,
  searchable = true
}: {
  children: ReactNode
  searchable?: boolean
}) {
  const { wrapper: Wrapper } = useMDXComponents()

  if (!Wrapper) {
    throw new Error(
      'Nextra did not provide an MDX `wrapper` component. Page chrome, the ' +
        'sidebar, and search indexing all depend on it.'
    )
  }

  return (
    <Wrapper toc={[]} metadata={{ searchable }}>
      {children}
    </Wrapper>
  )
}
