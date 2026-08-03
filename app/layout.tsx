import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Inter, JetBrains_Mono, Vazirmatn } from 'next/font/google'
import { Layout, Navbar, Footer } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import { Anchor } from 'nextra/components'
import { basePath, siteDescription, siteName, siteUrl } from '../lib/site'
import { navGroups, navSections, sectionLabel } from '../lib/navigation'
import 'nextra-theme-docs/style.css'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  // Makes every relative URL in per-page metadata resolve to an absolute one.
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`
  },
  description: siteDescription,
  applicationName: siteName,
  // './' resolves against the current route, giving every page its own
  // canonical and og:url rather than the site root.
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteUrl}/feed.xml`
    }
  },
  // Deliberately no title/description here: Next.js derives og:title and
  // og:description from each page's resolved title/description, but only while
  // a parent has not pinned them.
  openGraph: {
    type: 'website',
    siteName,
    url: './',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image'
  },
  // Declared explicitly rather than via an `app/icon` route: Next emits that
  // route's <link rel="icon"> without the base path, which 404s on a project
  // site served from a subdirectory. `opengraph-image` is unaffected — it
  // resolves through metadataBase, which already carries the base path.
  icons: {
    icon: [{ url: `${basePath}/icon.svg`, type: 'image/svg+xml' }]
  },
  robots: {
    index: true,
    follow: true
  }
}

/**
 * Footer columns. Section labels come from `app/_meta.tsx` via `sectionLabel`,
 * so renaming a section in the sidebar renames it here too. Links below section
 * level are spelled out because the sidebar has no equivalent grouping.
 */
const footerSections = [
  {
    title: 'Build',
    links: [
      { href: '/getting-started', label: sectionLabel('getting-started') },
      { href: '/overview/architecture', label: 'Architecture' },
      { href: '/overview/repositories', label: 'Repositories' }
    ]
  },
  {
    title: 'Products',
    links: [
      { href: '/platform', label: sectionLabel('platform') },
      { href: '/controller', label: sectionLabel('controller') },
      { href: '/storefront', label: sectionLabel('storefront') }
    ]
  },
  {
    title: 'Operate',
    links: [
      { href: '/api', label: sectionLabel('api') },
      { href: '/operations', label: sectionLabel('operations') },
      { href: '/operations/troubleshooting', label: 'Troubleshooting' }
    ]
  }
]

function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const box =
    size === 'lg'
      ? 'size-7 rounded-lg text-xs'
      : 'size-6 rounded-md text-[11px]'
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-flex ${box} items-center justify-center bg-neutral-950 font-semibold text-white dark:bg-neutral-50 dark:text-neutral-950`}
      >
        V
      </span>
      <span className="text-sm font-semibold tracking-tight">Vendra</span>
    </span>
  )
}

/**
 * A hover/focus dropdown for a navbar group.
 *
 * Built from a <details> element rather than state so it works without turning
 * the layout into a client component, and so it still opens by keyboard on a
 * static export.
 */
function NavMenu({
  label,
  items
}: {
  label: string
  items: { href: string; label: string }[]
}) {
  return (
    <details className="vw-navmenu">
      <summary className="vw-navmenu-trigger">
        {label}
        <span aria-hidden="true" className="vw-navmenu-caret">
          ▾
        </span>
      </summary>
      <div className="vw-navmenu-panel">
        {items.map(item => (
          <Link key={item.href} href={item.href} className="vw-navmenu-item">
            {item.label}
          </Link>
        ))}
      </div>
    </details>
  )
}

/**
 * Nextra's `<Footer>` is itself a flex row (`x:flex x:justify-center
 * x:md:justify-start`), so any two children it is given line up side by side.
 * Everything below therefore goes in one full-width wrapper — without it the
 * copyright bar and its rule sit beside the link columns rather than under
 * them, and the whole block collapses to its content width on the left.
 */
const footer = (
  <Footer className="mt-16">
    <div className="w-full">
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Wordmark />
          <p className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            A modular Laravel platform, a Go infrastructure controller, and a
            runtime-configured Next.js storefront — documented as one system.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          {footerSections.map(section => (
            <div key={section.title}>
              <div className="vendra-eyebrow mb-3">{section.title}</div>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link
                      className="text-neutral-600 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 border-t border-[var(--vendra-line)] pt-6 text-xs text-neutral-400 dark:text-neutral-500">
        © {new Date().getFullYear()} Vendra. All rights reserved.
      </div>
    </div>
  </Footer>
)

export default async function RootLayout({
  children
}: {
  children: ReactNode
}) {
  const navbar = (
    <Navbar logo={<Wordmark size="lg" />}>
      {/* Nextra does not hide custom navbar children on small screens, so they
          would overflow behind the hamburger. The sidebar covers mobile nav.

          Learn and Reference are menus over the documentation sections, which
          keep their original top-level slugs — the grouping is presentational,
          so no URL moved. See `lib/navigation.ts`. */}
      <span className="flex items-center gap-5 max-lg:hidden">
        {navGroups.map(group => (
          <NavMenu key={group.label} label={group.label} items={group.items} />
        ))}
        {navSections.map(section => (
          <Anchor key={section.href} href={section.href}>
            {section.label}
          </Anchor>
        ))}
      </span>
    </Navbar>
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${vazirmatn.variable} ${jetbrainsMono.variable}`}
      >
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          footer={footer}
          editLink={null}
          feedback={{ content: null }}
          navigation={{ next: true, prev: true }}
          toc={{ title: 'On this page' }}
          sidebar={{
            defaultMenuCollapseLevel: 1,
            defaultOpen: true,
            toggleButton: true
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
