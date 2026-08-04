import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
import Link from 'next/link'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import { PostHeader } from './components/collection'
import { SourceStatus } from './components/source-status'
import {
  Boundary,
  ChipRow,
  CommandList,
  DefList,
  FeatureGrid,
  Flow,
  Hero,
  Lede,
  NextSteps,
  Panel,
  StatRow,
  Steps,
  Tag
} from './components/vendra'

const themeComponents = getThemeComponents()

const ThemeWrapper = themeComponents.wrapper as (
  props: ComponentProps<'div'> & { metadata?: Record<string, unknown> }
) => React.ReactNode

/**
 * Renders the post header above blog posts, from the page's own frontmatter.
 *
 * Nextra passes each MDX page's frontmatter through as `metadata`, so a post
 * declares its date, author, and tags once and they reach both this header and
 * the index in `lib/blog.ts`. A `date` is the marker — no docs page has one.
 */
function Wrapper({
  children,
  metadata,
  ...props
}: ComponentProps<'div'> & { metadata?: Record<string, unknown> }) {
  const isPost = typeof metadata?.date === 'string'
  const canonical =
    typeof metadata?.canonical === 'string' ? metadata.canonical : null

  return (
    <ThemeWrapper metadata={metadata} {...props}>
      {isPost ? <PostHeader metadata={metadata as never} /> : null}
      {canonical ? (
        <aside className="mb-8 rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] px-4 py-3 text-sm text-[var(--vendra-fg-muted)]">
          This answer provides context. The maintained technical contract is in{' '}
          <Link href={canonical}>the canonical documentation</Link>.
        </aside>
      ) : null}
      {children}
    </ThemeWrapper>
  )
}

export function useMDXComponents(
  components?: Readonly<MDXComponents>
): MDXComponents {
  return {
    ...themeComponents,
    wrapper: Wrapper,
    Boundary,
    ChipRow,
    CommandList,
    DefList,
    FeatureGrid,
    Flow,
    Hero,
    Lede,
    NextSteps,
    Panel,
    StatRow,
    Steps,
    SourceStatus,
    Tag,
    ...components
  }
}
