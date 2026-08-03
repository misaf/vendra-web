import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Actions,
  FeatureSplit,
  Gallery,
  LandingHero,
  LogoWall,
  Quickstart,
  Section,
  StackDiagram,
  TeamGrid
} from '../components/marketing'
import { PostList } from '../components/collection'
import { customers } from '../lib/customers'
import { blogRoot, getPosts } from '../lib/blog'
import { siteDescription } from '../lib/site'
import { team } from '../lib/team'

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

  return (
    <>
      <LandingHero
        eyebrow="Platform · Control plane · Storefront"
        title={
          <>
            {'Build commerce systems that stay '}
            <span className="vendra-gradient-text">understandable</span>
            {' at scale.'}
          </>
        }
        actions={[
          { href: '/docs/getting-started', label: 'Get started', primary: true },
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
        eyebrow="The stack"
        title="Three systems, three responsibilities"
        lede="Laravel owns business state. The controller owns host runtime state. The storefront owns presentation. Keeping those boundaries explicit is the central architectural rule."
      >
        <StackDiagram
          tiers={[
            {
              href: '/docs/storefront',
              label: 'Storefront',
              tech: 'Next.js 16',
              role: 'Presentation',
              detail:
                'Runtime-configured per property, with selectable themes. Owns presentation and browser-local state — never business state.'
            },
            {
              href: '/docs/platform',
              label: 'Platform',
              tech: 'Laravel 13',
              role: 'Business state',
              detail:
                'Filament panels, tenancy, billing, and 38 first-party packages. The source of truth for everything a merchant owns.'
            },
            {
              href: '/docs/controller',
              label: 'Controller',
              tech: 'Go',
              role: 'Host runtime',
              detail:
                'Provisions Compose projects, certificates, and DNS behind a single Traefik edge. A separate binary for a reason.'
            }
          ]}
        />
      </Section>

      <Section tone="muted">
        <div className="vw-section-head vw-align-center">
          <div className="vendra-eyebrow">Quickstart</div>
          <h2 className="vw-section-title">Running in three commands</h2>
        </div>
        <Quickstart
          steps={[
            { label: '1 · Install', command: 'brew install vendra/tap/vendra' },
            { label: '2 · Initialise', command: 'vendra init my-shop' },
            { label: '3 · Start', command: 'vendra stack up' }
          ]}
        />
        <div className="vw-actions" style={{ justifyContent: 'center' }}>
          <Link className="vw-arrow-link" href="/docs/getting-started">
            Full installation guide <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>

      <Section eyebrow="Why Vendra" title="Built to be taken apart">
        <FeatureSplit
          eyebrow="Modular by construction"
          title="Thirty-eight packages that do not know about each other"
          points={[
            'Every package depends on contracts, never on concrete models',
            'Tenant-aware work with no package importing the tenant model',
            'Split from one monorepo into path repositories on release',
            'Add a domain without touching the ones already there'
          ]}
          action={{ href: '/docs/platform/packages', label: 'Browse the packages' }}
        >
          <p>
            The platform is a Laravel application, but the domains live in
            first-party packages that are pinned, tested, and released
            independently. It costs discipline on every pull request, and it is
            what makes a fourteenth domain no harder to add than the second.
          </p>
        </FeatureSplit>

        <FeatureSplit
          flip
          eyebrow="Operations"
          title="Provisioning is a binary, not a background job"
          points={[
            'One Traefik edge, one certificate strategy',
            'A Compose project per property, isolated by construction',
            'Health checks, recovery, and backups as first-class commands',
            'The web application never holds a Docker socket'
          ]}
          action={{ href: '/docs/controller', label: 'How the controller works' }}
        >
          <p>
            Laravel could shell out to Docker itself. It does not, and the
            reason is a single line in the threat model — the application that
            accepts public traffic is not the one that can start containers.
          </p>
        </FeatureSplit>

        <FeatureSplit
          eyebrow="Storefronts"
          title="One codebase, many properties"
          points={[
            'Configuration resolved at runtime, not baked at build time',
            'Selectable theme pages composed per property',
            'Internationalised, with per-property locale sets',
            'Deploys as a single container image'
          ]}
          action={{ href: '/docs/storefront', label: 'Storefront architecture' }}
        >
          <p>
            The storefront reads which property it is serving at request time,
            so one built image backs every shop. Adding a property is a
            configuration change, not a fork.
          </p>
        </FeatureSplit>
      </Section>

      <Section tone="muted">
        <div className="vw-section-head vw-align-center">
          <div className="vendra-eyebrow">Used by</div>
          <h2 className="vw-section-title">Companies building on Vendra</h2>
          <p className="vw-section-lede">
            Florists, importers, and studios running their shops on the
            ecosystem.
          </p>
        </div>
        <LogoWall customers={customers} />
      </Section>

      <Section
        eyebrow="Showcase"
        title="What people build with it"
        lede="Storefronts, control panels, and internal tooling running on the ecosystem."
      >
        <Gallery
          items={[
            {
              title: 'Florist storefront',
              description:
                'The reference storefront: themed, internationalised, and deployed per property behind Traefik.',
              href: '/docs/storefront',
              tag: 'Reference'
            },
            {
              title: 'Operator control panel',
              description:
                'Filament panels for tenants, billing, and platform administration.',
              href: '/docs/platform',
              tag: 'Platform'
            },
            {
              title: 'Your project here',
              description:
                'Building something on Vendra? The showcase is open — get in touch and we will add it.',
              href: '/showcase'
            }
          ]}
        />
      </Section>

      {posts.length > 0 ? (
        <Section
          eyebrow="Latest writing"
          title="From the blog"
          lede="Notes on the technology the ecosystem runs on, and the decisions behind it."
        >
          <PostList posts={posts} root={blogRoot} />
          <div className="vw-actions">
            <Link className="vw-arrow-link" href="/blog">
              All posts <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Section>
      ) : null}

      <Section
        eyebrow="Who builds it"
        title="A small team, in the open"
        lede="Vendra is built by the people who answer for it. The same names appear on the commits, in the blog posts, and on a support call."
        align="center"
      >
        <TeamGrid members={team} />
        <div className="vw-actions" style={{ justifyContent: 'center' }}>
          <a
            className="vw-arrow-link"
            href="https://github.com/misaf"
            rel="noreferrer"
            target="_blank"
          >
            Built openly on GitHub <span aria-hidden="true">→</span>
          </a>
        </div>
      </Section>

      <Section tone="muted">
        <div className="vw-section-head vw-align-center">
          <h2 className="vw-section-title">
            Start with the getting-started guide
          </h2>
          <p className="vw-section-lede">
            Local source development or a production host installation — both
            paths are documented end to end.
          </p>
          <Actions
            items={[
              {
                href: '/docs/getting-started',
                label: 'Get started',
                primary: true
              },
              {
                href: '/docs/overview/architecture',
                label: 'View architecture'
              }
            ]}
          />
        </div>
      </Section>
    </>
  )
}
