/**
 * The businesses running on Vendra, for the "Used by" wall.
 *
 * Data lives here rather than in a page for the same reason `lib/team.ts` does:
 * the wall renders on both the landing page and `/pro`, and a second copy is
 * how the two would quietly drift apart.
 *
 * Each entry is a *logotype*, not a logo file. Nothing here loads an image —
 * the wall is set in the site's own typography, with a small inline mark, so it
 * stays sharp at any size, follows the light and dark themes, and adds nothing
 * to the page weight. It also means a business can appear on the wall without
 * anyone having to chase a vector file first.
 *
 * Only name a business here with its permission: a wall of customer names is
 * read as an endorsement, and one that has not been given is a false one.
 */

/** Which inline mark a logotype is drawn with. See `LogoWall`. */
export type CustomerMark = 'bloom' | 'trade' | 'leaf' | 'sport'

export type Customer = {
  /**
   * Full legal-ish name, and the React key.
   *
   * Not rendered. `lead` and `sub` are what the wall draws, and between them
   * they spell this out — which is why the `title` attribute that used to carry
   * it was removed rather than replaced with an `aria-label`. Keep that true
   * when adding an entry: if the logotype would not read as the business's
   * name, the entry needs a `sub` rather than a hidden label to make up the
   * difference.
   */
  name: string
  /** The word carrying the logotype — set large. */
  lead: string
  /** The tracked line under it. Omit for a one-word logotype. */
  sub?: string
  mark: CustomerMark
  /** Approved monochrome logo asset. Falls back to the inline mark when absent. */
  logo?: { src: string; width: number; height: number }
  /**
   * The business's own site. Optional — an entry without one renders as plain
   * text, so a customer who has agreed to be named but has no public site (or
   * no site running on Vendra yet) still belongs on the wall.
   */
  href?: string
}

export const customers: Customer[] = [
  {
    name: 'Houshang Flowers',
    lead: 'Houshang',
    sub: 'Flowers',
    mark: 'bloom',
    href: 'https://houshang-flowers.com'
  },
  {
    name: 'Faama Import & Export',
    lead: 'Faama',
    sub: 'Import & Export',
    mark: 'trade'
  },
  {
    name: 'Hes Flower Art',
    lead: 'Hes',
    sub: 'Flower Art',
    mark: 'leaf'
  },
  {
    name: 'Deer Sportt',
    lead: 'Deer',
    sub: 'Sportt',
    mark: 'sport'
  }
]
