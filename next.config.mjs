import nextra from 'nextra'
import { basePath } from './lib/base-path.mjs'

// Set up Nextra with its configuration
const withNextra = nextra({
  // Adds `readingTime` to each MDX page's frontmatter. Blog posts surface it;
  // docs pages ignore it.
  readingTime: true
})

// Export the final Next.js config with Nextra included
export default withNextra({
  // GitHub Pages serves static files only — there is no Next.js server, so the
  // whole site is prerendered to `out/`. Every page here is already static.
  output: 'export',

  // A GitHub Pages *project* site is served from /<repo>, not the domain root.
  // Next rewrites `next/link` hrefs and its own asset URLs with this prefix;
  // plain <a href="/..."> is NOT rewritten, which is why internal links in
  // `components/vendra.tsx` and the footer use `next/link`.
  basePath,

  // The export target has no image optimization server.
  images: {
    unoptimized: true
  },

  // Emit `about/index.html` rather than `about.html`, so a static host resolves
  // /about without relying on extension-less file fallbacks.
  trailingSlash: true,

  turbopack: {
    resolveAlias: {
      // Path to your `mdx-components` file with extension
      'next-mdx-import-source-file': './mdx-components.tsx'
    }
  }
})
