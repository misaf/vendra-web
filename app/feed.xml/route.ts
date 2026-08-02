import { getPosts } from '../../lib/blog'
import { siteDescription, siteName, siteUrl } from '../../lib/site'

// Emitted once at build time — `output: 'export'` has no server to render it.
export const dynamic = 'force-static'

/** Minimal XML escaping for text nodes and attribute values. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * RSS 2.0 feed of blog posts.
 *
 * Built from the same page-map data as the index, so a post cannot appear in
 * one and not the other.
 */
export async function GET(): Promise<Response> {
  const posts = await getPosts()
  const self = `${siteUrl}/feed.xml`

  const items = posts
    .map(post => {
      const url = `${siteUrl}${post.route}`
      const published = new Date(post.date)
      const pubDate = Number.isNaN(published.getTime())
        ? undefined
        : published.toUTCString()

      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
        post.description
          ? `      <description>${escapeXml(post.description)}</description>`
          : null,
        ...post.tags.map(
          tag => `      <category>${escapeXml(tag)}</category>`
        ),
        '    </item>'
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} — Blog</title>
    <link>${escapeXml(`${siteUrl}/blog`)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' }
  })
}
