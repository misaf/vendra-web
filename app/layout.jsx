import { Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import { Anchor } from 'nextra/components'
import 'nextra-theme-docs/style.css'

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-neutral-950 text-xs font-semibold text-white dark:bg-neutral-50 dark:text-neutral-950">
            V
          </span>
          <span className="font-semibold tracking-tight">Vendra</span>
        </span>
      }
    >
      <Anchor href="/about">About</Anchor>
      <Anchor href="/cms">CMS</Anchor>
      <Anchor href="/modules">Modules</Anchor>
      <Anchor href="/getting-started">Getting Started</Anchor>
    </Navbar>
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout navbar={navbar} pageMap={await getPageMap()}>
          {children}
        </Layout>
      </body>
    </html>
  )
}
