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

/**
 * Endpoint the `/contact` form posts to.
 *
 * The site is a static export, so there is no route handler to receive a
 * submission — see the note in `components/contact-form.tsx`. This site sends
 * through Resend, which authenticates with a secret key and therefore cannot be
 * called from a browser: `contact-worker/` is the small relay that holds the
 * key, and this is its public URL.
 *
 * That split is the whole point. This value is `NEXT_PUBLIC_`, so it is inlined
 * into the client bundle and readable by anyone — which is correct for a URL
 * and catastrophic for a key. `RESEND_API_KEY` belongs to the Worker's secrets
 * and must never be given a `NEXT_PUBLIC_` name or added to this build's
 * environment.
 *
 * Empty by default, and the form checks for that rather than assuming: with no
 * endpoint it does not render at all, and `/contact` falls back to the direct
 * channels. A submit button that posts to nowhere is the failure this whole
 * page was added to fix, so it is not the state an unconfigured build lands in.
 */
export const contactEndpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? ''

export const siteName = 'Vendra'

export const siteDescription =
  'A modular commerce platform, an infrastructure controller, and configurable storefronts \u2014 built to stay understandable at scale.'
