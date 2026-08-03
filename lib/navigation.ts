/**
 * Section labels for the navbar and footer, derived from `app/_meta.tsx`.
 *
 * `_meta.tsx` is what Nextra reads to build the sidebar, so it stays the single
 * source of truth and this module reads *from* it rather than the other way
 * around. Renaming a section there renames it everywhere.
 */
import meta from '../app/_meta'
import docsMeta from '../app/docs/_meta'

/**
 * An entry in `_meta.tsx` is either a bare label or a config object carrying
 * one. Reading the label through this keeps both forms working, so a section
 * can gain `type: 'page'` or a theme override without breaking the navbar.
 */
type MetaEntry = string | { title?: string; display?: string }

function labelOf(entry: MetaEntry, slug: string): string {
  if (typeof entry === 'string') return entry
  return entry.title ?? slug
}

export type NavSection = {
  href: string
  label: string
}

export type NavGroup = {
  label: string
  /** Sections in the group, in the order they should appear in the menu. */
  items: NavSection[]
}

/**
 * The sidebar label for a top-level section.
 *
 * Throws on an unknown slug: a mistyped section in the footer would otherwise
 * render an empty link, which is easy to miss in review and invisible to
 * `check:links` (the href would still resolve).
 */
export function sectionLabel(slug: keyof typeof docsMeta): string {
  const entry = docsMeta[slug] as MetaEntry | undefined
  if (!entry) {
    throw new Error(
      `No section "${slug}" in app/docs/_meta.tsx. Known sections: ${Object.keys(docsMeta).join(', ')}.`
    )
  }
  return labelOf(entry, String(slug))
}

const docsSection = (slug: keyof typeof docsMeta): NavSection => ({
  href: slug === 'index' ? '/docs' : `/docs/${String(slug)}`,
  label: sectionLabel(slug)
})

const section = (slug: keyof typeof meta): NavSection => ({
  href: `/${String(slug)}`,
  label: labelOf(meta[slug] as MetaEntry, String(slug))
})

/**
 * Navbar groups.
 *
 * The three product systems keep their documentation slugs. Product is a
 * presentational menu, and it lives here rather than in `_meta.tsx` because
 * Nextra's sidebar wants the complete flat reference tree.
 *
 * Declared as slugs rather than literal hrefs so `sectionLabel` still throws on
 * a section that no longer exists.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Product',
    items: [
      docsSection('storefront'),
      docsSection('platform'),
      docsSection('controller')
    ]
  }
]

/**
 * Top-level sections shown flat in the navbar, after the groups.
 *
 * The header keeps only the primary paths flat. Examples, UI, and FAQ remain
 * available from the footer and docs context without competing for equal
 * weight in the primary navigation.
 */
export const navSections: NavSection[] = [
  docsSection('index'),
  section('showcase'),
  section('blog'),
  section('pro')
]
