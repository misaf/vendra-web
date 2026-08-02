import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import { PostHeader } from './components/collection'
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

  return (
    <ThemeWrapper metadata={metadata} {...props}>
      {isPost ? <PostHeader metadata={metadata as never} /> : null}
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
    Tag,
    ...components
  }
}
