import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ControllerConsole,
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
import { MarketingPage } from '../components/page-wrapper'

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
    <MarketingPage>
      <LandingHero
        eyebrow="Storefront · Platform · Controller"
        // Set in one colour. The emphasised word used to carry a violet-to-
        // emerald gradient clipped to the glyphs, which is the single most
        // reproduced element on developer landing pages and the one thing here
        // that would have looked identical on a competitor's site. It also
        // spent both brand hues on decoration, in a palette whose whole rule is
        // that a colour means "this belongs to that system" — so the headline
        // was quietly claiming the sentence belonged to the storefront and the
        // platform at once. The emphasis it was doing is now the figure's job.
        title="Build commerce systems that stay understandable at scale."
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

      {/* `loose`: three feature splits in one band is the longest stretch on
          the site, and at the default rhythm the gap between two splits was
          the same as the gap between this section and the quickstart — so the
          argument read as six unrelated blocks rather than one section with
          three parts. */}
      <Section
        size="loose"
        eyebrow="The product"
        title="Three systems, each visible in the work"
        lede="The boundaries are architectural, but the result is concrete: a storefront customers use, a platform operators understand, and a controller that reports exactly what it changed."
      >
        <FeatureSplit
          accent="storefront"
          code="S"
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
          code="P"
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
          code="C"
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

      {/* `compact` for both of these: three command rows and a row of logos
          are each already one tight object, so the default padding was
          spending the page's tallest gaps on its shortest content. */}
      <Section
        size="compact"
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
            className="group inline-flex gap-1.5 text-[0.9375rem] font-semibold hover:text-[var(--vendra-accent-text)] [&>span]:transition-transform hover:[&>span]:translate-x-0.5"
            href="/docs/getting-started"
          >
            Full installation guide <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      <Section
        size="compact"
        align="center"
        eyebrow="Customers"
        title="Businesses using Vendra"
        tone="muted"
      >
        <LogoWall customers={customers} />
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
              className="group inline-flex gap-1.5 text-[0.9375rem] font-semibold hover:text-[var(--vendra-accent-text)] [&>span]:transition-transform hover:[&>span]:translate-x-0.5"
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
        // `accent`, not `muted`: the customers band above is already muted, and
        // two identical treatments on one page read as a repeat rather than as
        // a rhythm. This is the arrival, so it gets the one band on the site
        // where the brand colour fills space.
        tone="accent"
        actions={[
          {
            href: '/docs/getting-started',
            label: 'Get started',
            primary: true
          },
          { href: '/docs/overview/architecture', label: 'View architecture' }
        ]}
      />
    </MarketingPage>
  )
}
