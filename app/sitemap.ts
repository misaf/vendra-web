import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { MetadataRoute } from 'next'
import { getPageMap } from 'nextra/page-map'
import { siteUrl } from '../lib/site'

/**
 * The shape of a page-map node this file cares about. Nextra's own type covers
 * folders, separators, and MDX metadata too; only the route and the nesting
 * matter for a sitemap.
 */
type PageMapNode = {
  route?: string
  children?: PageMapNode[]
}

/** Collect every routable page from Nextra's page map, depth-first. */
function collectRoutes(
  items: readonly PageMapNode[],
  out = new Set<string>()
): Set<string> {
  for (const item of items) {
    if (typeof item.route === 'string') out.add(item.route)
    if (Array.isArray(item.children)) collectRoutes(item.children, out)
  }
  return out
}

/** `/overview/architecture` -> `app/overview/architecture/page.mdx` */
function sourceFile(route: string): string {
  const segment = route === '/' ? '' : route.slice(1)
  return resolve(process.cwd(), 'app', segment, 'page.mdx')
}

/**
 * Last commit date for a page's source file.
 *
 * Stamping every page with the build time — the previous behaviour — told
 * crawlers that all 28 pages changed on every deploy, which is noise they learn
 * to discount. Falls back to the build time when git history is unavailable
 * (a shallow clone, a tarball, an unversioned file).
 */
function lastModified(route: string, fallback: Date): Date {
  const file = sourceFile(route)
  if (!existsSync(file)) return fallback

  try {
    const stdout = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', file],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim()
    return stdout ? new Date(stdout) : fallback
  } catch {
    return fallback
  }
}

// `output: 'export'` has no server to regenerate this, so it must be emitted
// once at build time.
export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = collectRoutes(await getPageMap() as PageMapNode[])
  const buildTime = new Date()

  return [...routes]
    .filter(route => !route.startsWith('/_'))
    .sort()
    .map(route => ({
      url: `${siteUrl}${route === '/' ? '' : route}`,
      lastModified: lastModified(route, buildTime),
      // Section landing pages and the home page are the intended entry points.
      priority: route === '/' ? 1 : route.split('/').length === 2 ? 0.8 : 0.6
    }))
}
