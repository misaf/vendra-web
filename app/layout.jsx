import { Inter, JetBrains_Mono, Vazirmatn } from 'next/font/google'
import { Layout, Navbar, Footer } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import { Anchor } from 'nextra/components'
import { siteDescription, siteName, siteUrl } from '../lib/site'
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

export const metadata = {
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
    canonical: './'
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
  robots: {
    index: true,
    follow: true
  }
}

const footerSections = [
  {
    title: 'Build',
    links: [
      { href: '/getting-started', label: 'Getting started' },
      { href: '/overview/architecture', label: 'Architecture' },
      { href: '/overview/repositories', label: 'Repositories' }
    ]
  },
  {
    title: 'Products',
    links: [
      { href: '/platform', label: 'Platform' },
      { href: '/controller', label: 'Controller' },
      { href: '/storefront', label: 'Storefront' }
    ]
  },
  {
    title: 'Operate',
    links: [
      { href: '/api', label: 'APIs' },
      { href: '/operations', label: 'Operations' },
      { href: '/operations/troubleshooting', label: 'Troubleshooting' }
    ]
  }
]

const navLinks = [
  { href: '/getting-started', label: 'Getting Started' },
  { href: '/platform', label: 'Platform' },
  { href: '/controller', label: 'Controller' },
  { href: '/storefront', label: 'Storefront' },
  { href: '/api', label: 'APIs' },
  { href: '/operations', label: 'Operations' }
]

function Wordmark({ size = 'sm' }) {
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
      <span className="text-sm font-semibold tracking-tight">
        Vendra Ecosystem
      </span>
    </span>
  )
}

const footer = (
  <Footer className="mt-16">
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
                  <a
                    className="text-neutral-600 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-12 border-t border-[var(--vendra-line)] pt-6 text-xs text-neutral-400 dark:text-neutral-500">
      © {new Date().getFullYear()} Vendra Ecosystem. All rights reserved.
    </div>
  </Footer>
)

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar logo={<Wordmark size="lg" />}>
      {/* Nextra does not hide custom navbar children on small screens, so they
          would overflow behind the hamburger. The sidebar covers mobile nav. */}
      <span className="flex items-center gap-6 max-md:hidden">
        {navLinks.map(link => (
          <Anchor key={link.href} href={link.href}>
            {link.label}
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
