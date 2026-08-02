/**
 * Sidebar order and labels. Nextra reads this to build the sidebar, and
 * `lib/navigation.ts` reads it back so the navbar and footer cannot drift from
 * it.
 *
 * The landing page, `/pro`, and the three galleries are `type: 'page'` with the
 * docs chrome switched off — they are marketing and index pages, not reference
 * material, so a sidebar and a table of contents would only get in the way.
 *
 * `blog` and `faq` are `type: 'page'` too. They are sections of the site in
 * their own right, not documentation: a post is not a reference page, and
 * listing them in the docs sidebar next to Platform and Controller framed them
 * as though they were. They keep the reading column and the table of contents —
 * only the docs sidebar and its breadcrumb/pagination go.
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

/**
 * Standalone reading sections: out of the docs sidebar, but still a centred
 * prose column with a table of contents, because their pages are long-form.
 */
const standalone = {
  type: 'page',
  theme: {
    sidebar: false,
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

  // Standalone sections, deliberately not part of the documentation
  blog: { title: 'Blog', ...standalone },
  faq: { title: 'FAQ', ...standalone }
}
