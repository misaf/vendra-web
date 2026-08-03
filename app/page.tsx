import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ControllerConsole,
  EditorialList,
  FeatureSplit,
  LandingHero,
  LogoWall,
  OperatorPanelPreview,
  Quickstart,
  Section,
  Screenshot
} from '../components/marketing'
import { PostList } from '../components/collection'
import { customers } from '../lib/customers'
import { blogRoot, getPosts } from '../lib/blog'
import { basePath, siteDescription } from '../lib/site'

export const metadata: Metadata = {
  title: 'Vendra — commerce systems that stay understandable',
  description: siteDescription
}

/**
 * The landing page.
 *
 * A `page.tsx` rather than MDX, and marked `layout: 'full'` with the sidebar
 * and table of contents off in `app/_meta.tsx`: this is the one page on the
 * site that is selling rather than explaining, and the documentation chrome
 * would frame it as just another reference page.
 *
 * The "Latest writing" band reads the blog through the same `lib/blog.ts` the
 * blog index uses, which is the point of keeping the blog in this repository
 * rather than on a separate site — publishing a post updates the front page for
 * free, with no list to maintain in either place.
 */
export default async function Landing() {
  const posts = (await getPosts()).slice(0, 3)
  const storefrontShot = {
    src: `${basePath}/shots/storefront-home.png`,
    alt: 'The Houshang Flowers English storefront home page, with navigation, shopping actions, and a large floral arrangement',
    width: 1600,
    height: 1000,
    host: 'houshang-flowers.com/en'
  }

  return (
    <>
      <LandingHero
        eyebrow="Storefront · Platform · Controller"
        title={
          <>
            {'Build commerce systems that stay '}
            <span className="bg-[linear-gradient(110deg,var(--vendra-accent),var(--vendra-accent-2))] bg-clip-text text-transparent">
              understandable
            </span>
            {' at scale.'}
          </>
        }
        actions={[
          {
            href: '/docs/getting-started',
            label: 'Get started',
            primary: true
          },
          { href: '/pro', label: 'Explore Pro' }
        ]}
        chips={[
          'Laravel 13',
          'Go controller',
          'Next.js 16',
          'Docker Compose',
          'Traefik edge'
        ]}
      >
        <p>
          Vendra is a modular Laravel platform, a Go infrastructure controller,
          and a runtime-configured Next.js storefront. Three cooperating
          systems, each with one job, documented as one whole.
        </p>
      </LandingHero>

      <Section
        eyebrow="The product"
        title="Three systems, each visible in the work"
        lede="The boundaries are architectural, but the result is concrete: a storefront customers use, a platform operators understand, and a controller that reports exactly what it changed."
      >
        <FeatureSplit
          accent="storefront"
          index="01"
          eyebrow="Storefront · Presentation"
          title="One storefront image, shaped for each property"
          media={<Screenshot shot={storefrontShot} />}
          points={[
            'English and Persian routes, including right-to-left presentation',
            'Property identity and theme selected without forking feature code',
            'Catalogue, product, cart, checkout, blog, FAQ, and account surfaces',
            'The browser talks to the same-origin proxy, never directly to the API'
          ]}
          action={{
            href: '/docs/storefront',
            label: 'Explore the storefront'
          }}
        >
          <p>
            This is the real first-party florist storefront, not a design mock.
            The same feature modules serve every property while configuration
            carries the brand, locale set, contacts, and public origin.
          </p>
        </FeatureSplit>

        <FeatureSplit
          accent="platform"
          flip
          index="02"
          eyebrow="Platform · Business state"
          title="Domain packages behind operator-focused panels"
          media={<OperatorPanelPreview />}
          points={[
            'Thirty first-party packages with explicit contracts',
            'Three panels with different tenant-resolution boundaries',
            'Eight API modules exposed through stable resource contracts',
            'Subscriptions, properties, and tenancy remain business state'
          ]}
          action={{
            href: '/docs/platform/packages',
            label: 'Browse the package map'
          }}
        >
          <p>
            Laravel owns what merchants and operators decide. The visual model
            mirrors the real domains documented in the platform rather than
            inventing dashboard metrics from a production database.
          </p>
        </FeatureSplit>

        <FeatureSplit
          accent="controller"
          index="03"
          eyebrow="Controller · Runtime state"
          title="Operations speak in commands and health states"
          media={<ControllerConsole />}
          points={[
            'One Traefik edge and one certificate strategy',
            'A separate Compose project for every property',
            'Provisioning, recovery, hosts, and status are first-class commands',
            'The public web application never receives a Docker socket'
          ]}
          action={{
            href: '/docs/controller',
            label: 'How the controller works'
          }}
        >
          <p>
            Host mutation belongs to a small Go binary with a narrow API. Its
            interface is deliberately operational: desired state in, explicit
            status and references out.
          </p>
        </FeatureSplit>
      </Section>

      <Section
        align="center"
        eyebrow="Proof"
        title="Real businesses and first-party surfaces"
        lede="Named with permission, and linked to work that exists today."
        tone="muted"
      >
        <LogoWall customers={customers} />
        <div className="mt-12 grid gap-10 text-left lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="border-l-2 border-[var(--vendra-accent)] pl-6">
            <div className="text-xs font-bold tracking-[0.14em] text-[var(--vendra-accent)] uppercase">
              Proof, not promises
            </div>
            <p className="mt-3 text-xl leading-8 font-semibold tracking-tight">
              The gallery starts with what ships. Planned work stays in a
              compact roadmap instead of posing as an available product.
            </p>
            <Link
              className="mt-5 inline-flex gap-2 text-sm font-bold hover:text-[var(--vendra-accent)]"
              href="/showcase"
            >
              View the showcase <span aria-hidden="true">→</span>
            </Link>
          </div>
          <EditorialList
            items={[
              {
                title: 'Houshang Flowers storefront',
                description:
                  'A bilingual first-party reference deployment with property-owned branding.',
                href: '/showcase'
              },
              {
                title: 'Operator control panel',
                description:
                  'Filament surfaces for tenants, properties, subscriptions, and platform operations.',
                href: '/docs/platform'
              },
              {
                title: 'Infrastructure controller',
                description:
                  'The Go binary that provisions isolated property projects behind the shared edge.',
                href: '/docs/controller'
              }
            ]}
          />
        </div>
      </Section>

      <Section
        align="center"
        eyebrow="Quickstart"
        title="Running in three commands"
      >
        <Quickstart
          steps={[
            {
              label: '1 · Install',
              command: 'brew install vendra/tap/vendra'
            },
            { label: '2 · Initialise', command: 'vendra init my-shop' },
            { label: '3 · Start', command: 'vendra stack up' }
          ]}
        />
        <div className="mt-8 flex justify-center">
          <Link
            className="group inline-flex gap-1.5 text-[0.9375rem] font-semibold hover:text-[var(--vendra-accent)] [&>span]:transition-transform hover:[&>span]:translate-x-0.5"
            href="/docs/getting-started"
          >
            Full installation guide <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      {posts.length > 0 ? (
        <Section
          eyebrow="Latest writing"
          title="From the blog"
          lede="Notes on the technology the ecosystem runs on, and the decisions behind it."
        >
          <PostList posts={posts} root={blogRoot} />
          <div className="mt-8 flex">
            <Link
              className="group inline-flex gap-1.5 text-[0.9375rem] font-semibold hover:text-[var(--vendra-accent)] [&>span]:transition-transform hover:[&>span]:translate-x-0.5"
              href="/blog"
            >
              All posts <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Section>
      ) : null}

      <Section
        align="center"
        size="lg"
        title="Start with the getting-started guide"
        lede="Local source development or a production host installation — both paths are documented end to end."
        tone="muted"
        actions={[
          {
            href: '/docs/getting-started',
            label: 'Get started',
            primary: true
          },
          { href: '/docs/overview/architecture', label: 'View architecture' }
        ]}
      />
    </>
  )
}
