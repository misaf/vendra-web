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

/**
 * The landmark and search body for the full-bleed marketing pages.
 *
 * `ContentWrapper` is the wrong tool for these: it supplies Nextra's reading
 * column, and the marketing surface is `layout: 'full'` precisely so its bands
 * can run edge to edge. But everything it supplied besides the column was
 * still needed, and without it these six pages — the landing page, `/pro`,
 * `/about`, `/showcase`, `/examples`, and `/ui` — rendered with no `<main>` at
 * all. Two things followed from that:
 *
 *   1. No landmark, so no skip-to-content target on the whole selling surface.
 *   2. No `data-pagefind-body`. Pagefind indexes only what carries that
 *      attribute — its build log says as much, "Ignoring pages without this
 *      tag" — so none of these pages were in the search index. Searching the
 *      site for "pricing" returned nothing, and "Vendra Pro" returned
 *      documentation rather than `/pro`.
 *
 * `data-surface="marketing"` opts the subtree out of the two prose heading
 * rules in `globals.css`; see the note there. It is on the same element rather
 * than a wrapper div so the exclusion cannot be separated from the landmark
 * that made it necessary.
 *
 * Unlike the blog and FAQ listings, these pages are deliberately searchable:
 * they are the only description of the product that is not reference material,
 * and each is the sole page carrying its own subject.
 */
export function MarketingPage({ children }: { children: ReactNode }) {
  return (
    <main data-pagefind-body data-surface="marketing">
      {children}
    </main>
  )
}
