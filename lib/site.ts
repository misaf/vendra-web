import { basePath } from './base-path.mjs'

export { basePath }

/**
 * Canonical origin for absolute URLs in metadata, the sitemap, and robots.txt.
 *
 * Includes the base path, so it is the real public root of the site rather than
 * just the domain. Set NEXT_PUBLIC_SITE_URL in the deployment environment; it is
 * read at build time, because `NEXT_PUBLIC_*` values are inlined and both the
 * sitemap and canonical tags are generated during `next build`.
 *
 * The localhost fallback is deliberate: it is obviously wrong in production
 * output rather than silently pointing at someone else's domain.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:3000${basePath}`
).replace(/\/$/, '')

export const siteName = 'Vendra Ecosystem'

export const siteDescription =
  'Documentation for the Vendra platform, controller, storefront, and operations.'
