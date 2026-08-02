/**
 * Section labels for the navbar and footer, derived from `app/_meta.tsx`.
 *
 * `_meta.tsx` is what Nextra reads to build the sidebar, so it stays the single
 * source of truth and this module reads *from* it rather than the other way
 * around. Renaming a section there renames it everywhere.
 */
import meta from '../app/_meta'

/** Sections that are reachable from the sidebar but not the top navbar. */
const hiddenFromNavbar = new Set(['index', 'overview'])

export type NavSection = {
  href: string
  label: string
}

/** Top-level sections shown in the navbar, in sidebar order. */
export const navSections: NavSection[] = Object.entries(meta)
  .filter(([slug]) => !hiddenFromNavbar.has(slug))
  .map(([slug, label]) => ({ href: `/${slug}`, label }))

/**
 * The sidebar label for a top-level section.
 *
 * Throws on an unknown slug: a mistyped section in the footer would otherwise
 * render an empty link, which is easy to miss in review and invisible to
 * `check:links` (the href would still resolve).
 */
export function sectionLabel(slug: keyof typeof meta): string {
  const label = meta[slug]
  if (!label) {
    throw new Error(
      `No section "${slug}" in app/_meta.tsx. Known sections: ${Object.keys(meta).join(', ')}.`
    )
  }
  return label
}
