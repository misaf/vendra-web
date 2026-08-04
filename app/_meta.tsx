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
 *
 * ## The docs entry
 *
 * `docs` carries no `display` flag, and must not be given one. It held
 * `display: 'hidden'` until that flag was traced to an empty sidebar on every
 * documentation page.
 *
 * The reasoning that justifies the flag on the marketing entries below does not
 * transfer. That argument is about `type: 'page'`, which in Nextra both keeps a
 * section out of the docs sidebar and puts it in the navbar; hiding it
 * suppresses the second half so `lib/navigation.ts` can own the header. The
 * docs entry is a plain folder. It was never in the navbar, so there was
 * nothing to suppress, and the flag bought nothing.
 *
 * What it cost is that the flag prunes the entry *and its whole subtree* from
 * the page map Nextra builds navigation from. Every wayfinding device the theme
 * owns reads that map, so all three went blank at once — the sidebar rendered
 * an expanded but empty rail (28 links down to 0), the breadcrumb rendered as
 * an empty flex row, and the `navigation` option in `app/layout.tsx` emitted no
 * prev/next pagination. Nothing errored and the rail still reserved its column,
 * so a documentation site with no documentation navigation looked deliberate.
 *
 * If this regresses, the symptom is a sidebar that is present and empty rather
 * than one that is missing.
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
  contact: { title: 'Contact', ...marketing },
  signup: { title: 'Early access', ...marketing },

  // Documentation has its own route tree and sidebar under /docs. Deliberately
  // no `display` flag — see "The docs entry" above before adding one.
  docs: { title: 'Documentation' },

  // Standalone sections, deliberately not part of the documentation
  blog: { title: 'Blog', ...standalone },
  faq: { title: 'FAQ', ...standalone }
}
