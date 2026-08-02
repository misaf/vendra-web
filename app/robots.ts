import type { MetadataRoute } from 'next'
import { siteUrl } from '../lib/site'

// `output: 'export'` has no server to regenerate this, so it must be emitted
// once at build time.
export const dynamic = 'force-static'

/**
 * Note for a GitHub Pages *project* site: crawlers only read `/robots.txt` at
 * the domain root, so this file — served under the repository's base path — is
 * advisory rather than authoritative. The absolute sitemap URL below is what
 * actually matters; submit it directly, or move the site to a custom domain
 * with BASE_PATH='' to get a root-level robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: `${siteUrl}/sitemap.xml`
  }
}
