/**
 * Sidebar order and labels. Nextra reads this to build the sidebar, and
 * `lib/navigation.ts` reads it back so the navbar and footer cannot drift from
 * it.
 *
 * The landing page, `/pro`, and the three galleries are `type: 'page'` with the
 * docs chrome switched off — they are marketing and index pages, not reference
 * material, so a sidebar and a table of contents would only get in the way.
 *
 * Documentation sections keep the slugs they have always had. The navbar groups
 * them under Learn and Reference (see `lib/navigation.ts`), but that grouping is
 * presentational: no page moved, so no existing URL broke.
 */

/** Chrome switched off entirely — full-bleed marketing and gallery pages. */
const marketing = {
  type: 'page',
  theme: {
    layout: 'full',
    sidebar: false,
    toc: false,
    breadcrumb: false,
    pagination: false,
    timestamp: false
  }
} as const

export default {
  index: { display: 'hidden', ...marketing },

  // Product surface
  pro: { title: 'Pro', ...marketing },
  examples: { title: 'Examples', ...marketing },
  ui: { title: 'UI', ...marketing },
  showcase: { title: 'Showcase', ...marketing },

  // Learn
  'getting-started': 'Getting Started',
  overview: 'Overview',
  operations: 'Operations',

  // Reference
  platform: 'Platform',
  controller: 'Controller',
  storefront: 'Storefront',
  api: 'APIs',

  // More
  blog: 'Blog',
  faq: 'FAQ'
}
