import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import { Layout, Navbar, Footer, ThemeSwitch } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import { Head } from 'nextra/components'
import { basePath, siteDescription, siteName, siteUrl } from '../lib/site'
import { navGroups, navSections, sectionLabel } from '../lib/navigation'
import { TopNavigation } from '../components/top-navigation'
import 'nextra-theme-docs/style.css'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

/* No Persian face is loaded. This site is `lang="en"` throughout and never
   sets `lang` below the root, so the Arabic subset was fetched on every page
   and used on none — see the note where the `:lang(fa)` rules were in
   `globals.css`, which is also where to start if that changes. */

/**
 * The display face, used by the `font-display` utility in `globals.css` and by
 * nothing else — five marketing headings, no body copy and no UI.
 *
 * `axes: ['opsz']` is the reason for choosing this family over another. Google
 * serves a variable font with only the `wght` range unless further axes are
 * asked for by name, so without it the optical-size axis is simply absent from
 * the file and `font-optical-sizing: auto` has nothing to act on. With it, one
 * download draws the 4rem landing headline and the 2rem `FeatureSplit`
 * subtitle differently — open and wide-apertured at the top of the scale,
 * sturdier and more compact at the bottom — which is the part Inter at two
 * sizes cannot do.
 *
 * This was briefly Archivo on its width axis, drawn past semi-expanded to read
 * like the title block on a plan sheet. That is a defensible register, but it
 * is a different one, and it cost the headline: an expanded face fitted about
 * eight characters to a line and broke the hero five ways, which is why the
 * hero step had to come down from 4rem to 3.375rem to stay readable. Bricolage
 * is narrow enough to hold the full 4rem, so the display step and the face
 * agree again rather than trading against each other.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-bricolage',
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
      { href: '/docs/getting-started', label: sectionLabel('getting-started') },
      { href: '/docs/overview/architecture', label: 'Architecture' },
      { href: '/docs/overview/repositories', label: 'Repositories' }
    ]
  },
  {
    title: 'Products',
    links: [
      { href: '/docs/platform', label: sectionLabel('platform') },
      { href: '/docs/controller', label: sectionLabel('controller') },
      { href: '/docs/storefront', label: sectionLabel('storefront') }
    ]
  },
  {
    title: 'Operate',
    links: [
      { href: '/docs/api', label: sectionLabel('api') },
      { href: '/docs/operations', label: sectionLabel('operations') },
      { href: '/docs/operations/troubleshooting', label: 'Troubleshooting' }
    ]
  },
  {
    title: 'Explore',
    links: [
      { href: '/showcase', label: 'Showcase' },
      { href: '/about', label: 'About' },
      { href: '/examples', label: 'Examples' },
      { href: '/ui', label: 'UI library' },
      { href: '/blog', label: 'Blog' },
      { href: '/faq', label: 'FAQ' }
    ]
  }
]

function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <span className="group inline-flex items-center gap-2">
      <svg
        className={`${size === 'lg' ? 'size-7 rounded-lg' : 'size-6 rounded-md'} bg-[var(--vendra-fg)] fill-[var(--vendra-bg)] p-1 shadow-[var(--vendra-shadow-sm)] transition-transform group-hover:-rotate-3 group-hover:scale-105`}
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path d="M7 7.5 16 25 25 7.5h-5.2L16 16l-3.8-8.5H7Z" />
        <path
          className="fill-[var(--vendra-accent)] opacity-80"
          d="m12.2 7.5 3.8 8.6 3.8-8.6"
        />
      </svg>
      <span className="text-sm font-semibold tracking-tight">Vendra</span>
    </span>
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
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xs">
          <Wordmark />
          <p className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
            A modular Laravel platform, a Go infrastructure controller, and a
            runtime-configured Next.js storefront — documented as one system.
          </p>
          <div className="mt-4 flex items-center gap-3 label text-[var(--vendra-fg-subtle)]">
            {[
              ['Storefront', 'bg-[var(--vendra-accent-2)]'],
              ['Platform', 'bg-[var(--vendra-accent)]'],
              ['Controller', 'bg-[var(--vendra-accent-3)]']
            ].map(([label, color]) => (
              <span className="inline-flex items-center gap-1.5" key={label}>
                <i className={`size-1.5 rounded-full ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 text-sm sm:grid-cols-4 lg:min-w-xl">
          {footerSections.map(section => (
            <div key={section.title}>
              <div className="mb-3 label text-[var(--vendra-fg-subtle)]">
                {section.title}
              </div>
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
          would overflow behind the hamburger. Nextra covers mobile navigation,
          while TopNavigation supplies a compact menu at tablet widths.

          Product is a menu over the three system references, which keep their
          original slugs — the grouping is presentational, so no URL moved. See
          `lib/navigation.ts`. */}
      <TopNavigation groups={navGroups} sections={navSections} />
      <ThemeSwitch
        lite
        className="ml-1 border-l border-[var(--vendra-line)] pl-3 [&_button]:grid [&_button]:size-9 [&_button]:place-items-center [&_button]:rounded-full [&_button]:border [&_button]:border-[var(--vendra-line)] [&_button]:bg-[var(--vendra-surface)] [&_button]:p-0 [&_button]:text-[var(--vendra-fg-muted)] [&_button]:transition [&_button:hover]:rotate-6 [&_button:hover]:border-[color-mix(in_srgb,var(--vendra-accent),transparent_40%)] [&_button:hover]:bg-[var(--vendra-muted)] [&_button:hover]:text-[var(--vendra-fg)] [&_svg]:size-3.5"
      />
    </Navbar>
  )

  return (
    // The four `next/font` variable classes belong on <html>, not on <body>.
    //
    // They are what define `--font-inter` and friends, and `globals.css`
    // consumes them from `:root` — `--x-font-sans: var(--font-inter), …`. A
    // custom property is resolved in the scope it is *declared* in, not where
    // it is eventually used, so with the classes one level down the `var()`
    // referred to something undefined at `:root` and the whole chain silently
    // fell through to its bare tail. Every font on the site rendered as
    // `ui-sans-serif` — that is, as the system face — while looking entirely
    // deliberate, which is why it survived: at body sizes SF and Inter are
    // near enough to pass, and nothing errors when a `var()` falls back.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable}`}
    >
      {/* Nextra's theme reads `--nextra-bg` for every opaque surface it paints
          — most visibly the search results popover (`bg-nextra-bg/70`) — and
          only `<Head>` emits it. Without this the variable is undefined, so the
          popover resolves to a fully transparent background and search results
          render unreadably over the page beneath them. `<Head>` also sets the
          html background and the theme-color meta tags.

          The primary colour lives here rather than in `globals.css` so there is
          one source for it: `<Head>` writes the same `--nextra-primary-*`
          custom properties, and declaring them in both places makes which one
          wins depend on stylesheet order. */}
      <Head
        color={{
          hue: 161,
          saturation: { light: 57, dark: 62 },
          lightness: { light: 40, dark: 55 }
        }}
      />
      <body>
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
