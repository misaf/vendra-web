/**
 * Sidebar order and labels. Nextra reads this to build the sidebar, and
 * `lib/navigation.ts` reads it back so the navbar and footer cannot drift from
 * it.
 *
 * The landing page, `/pro`, `/about`, and the three galleries are `type: 'page'`
 * with the docs chrome switched off — they are marketing and index pages, not
 * reference material, so a sidebar and a table of contents would only get in
 * the way.
 *
 * `blog` and `faq` are `type: 'page'` too. They are sections of the site in
 * their own right, not documentation: a post is not a reference page, and
 * listing them in the docs sidebar next to Platform and Controller framed them
 * as though they were. They keep the reading column and the table of contents —
 * only the docs sidebar and its breadcrumb/pagination go.
 *
 * Documentation sections keep the slugs they have always had. The navbar groups
 * the three product systems under Product (see `lib/navigation.ts`), but that
 * grouping is presentational: no page moved, so no existing URL broke.
 */

/**
 * Chrome switched off entirely — full-bleed marketing and gallery pages.
 *
 * `display: 'hidden'` is load-bearing. In Nextra `type: 'page'` means two
 * things at once: keep this out of the docs sidebar, and put it in the navbar.
 * Only the first is wanted here — the navbar is built by `lib/navigation.ts`,
 * which groups and orders these deliberately, and without hiding them every
 * such section rendered twice in the header.
 */
const marketing = {
  type: 'page',
  display: 'hidden',
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
  display: 'hidden',
  theme: {
    sidebar: false,
    breadcrumb: false,
    pagination: false,
    timestamp: false
  }
} as const

export default {
  index: { ...marketing },

  // Product surface
  pro: { title: 'Pro', ...marketing },
  examples: { title: 'Examples', ...marketing },
  ui: { title: 'UI', ...marketing },
  showcase: { title: 'Showcase', ...marketing },
  about: { title: 'About', ...marketing },

  // Documentation has its own route tree and sidebar under /docs.
  docs: { title: 'Documentation', display: 'hidden' },

  // Standalone sections, deliberately not part of the documentation
  blog: { title: 'Blog', ...standalone },
  faq: { title: 'FAQ', ...standalone }
}
