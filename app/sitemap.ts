import type { MetadataRoute } from 'next'
import { getPageMap } from 'nextra/page-map'
import { siteUrl } from '../lib/site'

/** Collect every routable page from Nextra's page map, depth-first. */
function collectRoutes(items: any[], out: Set<string> = new Set()) {
  for (const item of items) {
    if (typeof item?.route === 'string') out.add(item.route)
    if (Array.isArray(item?.children)) collectRoutes(item.children, out)
  }
  return out
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = collectRoutes(await getPageMap())
  const lastModified = new Date()

  return [...routes]
    .filter(route => !route.startsWith('/_'))
    .sort()
    .map(route => ({
      url: `${siteUrl}${route === '/' ? '' : route}`,
      lastModified,
      // Section landing pages and the home page are the intended entry points.
      priority: route === '/' ? 1 : route.split('/').length === 2 ? 0.8 : 0.6
    }))
}
