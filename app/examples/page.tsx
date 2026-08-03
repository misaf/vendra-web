import type { Metadata } from 'next'
import { EditorialList, RoadmapList, Section } from '../../components/marketing'

export const metadata: Metadata = {
  title: 'Examples',
  description:
    'Worked examples across the Vendra platform, controller, and storefront — grouped by the problem they solve.'
}

/* -------------------------------------------------------------------------- */
/* TODO — ROADMAP. Planned entries render in a compact roadmap below the       */
/* available guides, never as disabled product cards.                          */
/*                                                                            */
/* To land an example: write the page, then give its entry an `href`, drop     */
/* `planned`, and `check:links` will start policing that link like any other.  */
/* Entries that already point at existing documentation are linked today.      */
/* -------------------------------------------------------------------------- */

const groups = [
  {
    title: 'Platform',
    description:
      'Working against the Laravel application and its first-party packages.',
    items: [
      {
        title: 'Adding a first-party package',
        description:
          'Scaffold a domain package, wire its service provider, and pin it for release.',
        href: '/docs/platform/packages',
        tag: 'Guide'
      },
      {
        title: 'Tenant-aware queries without the tenant model',
        description:
          'Resolve the current tenant through a contract so the package stays independent.',
        planned: true
      },
      {
        title: 'Custom Filament panel',
        description:
          'Register a panel, scope it to a tenant, and gate it behind a permission.',
        planned: true
      },
      {
        title: 'Extending the subscription engine',
        description:
          'React to Paid, Activated, and GraceExpired events from the host application.',
        planned: true
      }
    ]
  },
  {
    title: 'Controller',
    description: 'Provisioning, certificates, and the host runtime.',
    items: [
      {
        title: 'Provisioning a property',
        description:
          'From an API call to a running Compose project behind the shared edge.',
        href: '/docs/controller',
        tag: 'Guide'
      },
      {
        title: 'Wildcard certificates via DNS-01',
        description:
          'Issue a wildcard for tenant admin hosts without exposing each one.',
        planned: true
      },
      {
        title: 'Recovering a failed stack',
        description:
          'Diagnose a container that refuses to start and bring it back safely.',
        href: '/docs/operations/troubleshooting',
        tag: 'Operations'
      }
    ]
  },
  {
    title: 'Storefront',
    description: 'Runtime configuration, theming, and deployment.',
    items: [
      {
        title: 'Selecting a theme per property',
        description:
          'Compose page templates from a theme without forking the storefront.',
        href: '/docs/storefront/configuration',
        tag: 'Guide'
      },
      {
        title: 'Adding a locale',
        description:
          'Wire a new message catalogue and per-property locale set.',
        planned: true
      },
      {
        title: 'Deploying behind Traefik',
        description:
          'Build once, run per property, and route through the shared edge.',
        href: '/docs/storefront/deployment',
        tag: 'Guide'
      }
    ]
  },
  {
    title: 'API',
    description: 'Integrating against the public and internal contracts.',
    items: [
      {
        title: 'Reading the catalogue over JSON:API',
        description:
          'Filtering, sparse fieldsets, and pagination against the public API.',
        href: '/docs/api',
        tag: 'Reference'
      },
      {
        title: 'Implementing a resource provider',
        description: 'Back a resource with something other than Eloquent.',
        planned: true
      },
      {
        title: 'Webhook consumers',
        description: 'Receive and verify platform events in another system.',
        planned: true
      }
    ]
  }
]

export default function ExamplesPage() {
  const planned = groups.flatMap(group =>
    group.items
      .filter(item => 'planned' in item && item.planned)
      .map(item => ({ title: item.title, area: group.title }))
  )

  return (
    <>
      <Section
        eyebrow="Examples"
        title="Complete paths through real tasks"
        lede="Available guides come first. Each one follows a task to a working result instead of stopping at an isolated snippet."
      />

      <Section eyebrow="Available" title="Start with what ships">
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
          {groups.map(group => {
            const available = group.items.filter(
              item => !('planned' in item && item.planned)
            )
            if (available.length === 0) return null

            return (
              <div key={group.title}>
                <h3 className="text-xl font-bold tracking-tight">
                  {group.title}
                </h3>
                <p className="mt-1.5 mb-5 text-sm leading-6 text-[var(--vendra-fg-muted)]">
                  {group.description}
                </p>
                <EditorialList items={available} />
              </div>
            )
          })}
        </div>
      </Section>

      <Section
        eyebrow="Roadmap"
        title="Planned examples"
        lede="These are the next complete guides—not disabled cards pretending to be usable today."
        tone="muted"
      >
        <RoadmapList items={planned} />
      </Section>
    </>
  )
}
