/**
 * Canonical origin for absolute URLs in metadata, the sitemap, and robots.txt.
 *
 * Set NEXT_PUBLIC_SITE_URL in the deployment environment. The localhost
 * fallback is deliberate: it is obviously wrong in production output rather
 * than silently pointing at someone else's domain.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

export const siteName = 'Vendra Ecosystem'

export const siteDescription =
  'Documentation for the Vendra platform, controller, storefront, and operations.'
