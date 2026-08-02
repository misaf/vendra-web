import { basePath } from './site'

/**
 * Post authors, keyed by the `author` value in post frontmatter.
 *
 * Posts keep naming their author as a plain string, so an unknown name still
 * renders correctly — it just gets no avatar and no link. That keeps a
 * guest post from needing an entry here before it can be published.
 */
export type Author = {
  name: string
  /** Public path, base-path included. Plain <img> src values are not rewritten. */
  avatar?: string
  href?: string
}

/**
 * Avatars are committed under `public/authors/` rather than hot-linked from
 * GitHub: the site is a static export, so an external avatar would be a
 * third-party request on every page view and would break the layout the day
 * that host changes its URL scheme.
 *
 * Refresh one with:
 *   curl -sSL -o public/authors/<name>.jpg "https://github.com/<user>.png?size=160"
 */
const authors: Record<string, Author> = {
  Misaf: {
    name: 'Misaf',
    avatar: `${basePath}/authors/misaf.jpg`,
    href: 'https://github.com/misaf'
  },
  Arefeh: {
    name: 'Arefeh',
    avatar: `${basePath}/authors/arefeh.jpg`
  }
}

export function getAuthor(name?: string): Author | undefined {
  if (!name) return undefined
  return authors[name] ?? { name }
}
