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
 * The documentation sections keep their original top-level slugs — nothing was
 * moved under `/learn` or `/reference`, so no URL changed and every existing
 * link still resolves. The grouping is presentational, and it lives here rather
 * than in `_meta.tsx` because Nextra's sidebar wants the flat list.
 *
 * Declared as slugs rather than literal hrefs so `sectionLabel` still throws on
 * a section that no longer exists.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Explore',
    items: [section('examples'), section('ui'), section('showcase')]
  }
]

/**
 * Top-level sections shown flat in the navbar, after the groups.
 *
 * Blog and FAQ sit here rather than in a "More" menu, and are not part of the
 * Learn or Reference groups: they are their own sections of the site, not
 * documentation. `app/_meta.tsx` keeps them out of the docs sidebar to match.
 */
export const navSections: NavSection[] = [
  { href: '/', label: 'Home' },
  docsSection('index'),
  section('blog'),
  section('faq'),
  section('pro')
]
