import type { Metadata } from 'next'
import {
  EditorialList,
  FeaturedProject,
  RoadmapList,
  Section
} from '../../components/marketing'
import { basePath } from '../../lib/site'

export const metadata: Metadata = {
  title: 'Showcase',
  description:
    'Storefronts, control panels, and internal tools built on the Vendra ecosystem.'
}

/* -------------------------------------------------------------------------- */
/* TODO — SCAFFOLD. A showcase is only worth publishing with real projects in  */
/* it, and it is the one section here that cannot be filled in by writing:     */
/* each entry needs a real deployment and the owner's permission to be named.  */
/*                                                                            */
/* Until then this lists the first-party reference projects, which are real,   */
/* and a single planned slot. Do not add invented companies — a fabricated     */
/* showcase is a false endorsement, not a placeholder.                         */
/* -------------------------------------------------------------------------- */

const projects = [
  {
    title: 'Houshang Flowers storefront',
    description:
      'The bilingual reference storefront: property-branded, theme-selected, and deployed behind the shared Traefik edge.',
    href: '/docs/storefront',
    tag: 'Available',
    shot: {
      src: `${basePath}/shots/storefront-home.png`,
      alt: 'The Houshang Flowers English storefront home page with navigation, shopping actions, and a large floral arrangement',
      width: 1600,
      height: 1000,
      host: 'houshang-flowers.com/en'
    }
  },
  {
    title: 'Vendra operator panel',
    description:
      'The Filament administration surface for tenants, properties, billing, and platform administration.',
    href: '/docs/platform',
    tag: 'First-party'
  },
  {
    title: 'Ecosystem documentation',
    description:
      'This site: documentation, examples, and the blog, built on Nextra and validated by five offline checks.',
    href: '/docs/overview',
    tag: 'First-party'
  },
  {
    title: 'Your project here',
    description:
      'Running Vendra in production? Get in touch and we will add it, with your logo and a short case study.',
    planned: true
  }
]

export default function ShowcasePage() {
  const [featured, ...available] = projects.filter(project => !project.planned)
  const planned = projects
    .filter(project => project.planned)
    .map(project => ({ title: project.title, area: 'Community' }))

  if (!featured?.href || !featured.shot) return null

  return (
    <>
      <Section
        eyebrow="Showcase"
        title={'Work that exists, shown as\u00a0it\u00a0is'}
        lede="First-party surfaces today; customer case studies as their owners approve publication. No invented projects and no placeholder screenshots."
      >
        <FeaturedProject
          item={{ ...featured, href: featured.href, shot: featured.shot }}
        />
      </Section>

      <Section
        eyebrow="More surfaces"
        title="The rest of the first-party system"
        tone="muted"
      >
        <EditorialList items={available} />
      </Section>

      {planned.length ? (
        <Section
          eyebrow="Next"
          title="A small public roadmap"
          lede="Future work is listed compactly so it stays visible without competing with what is available."
        >
          <RoadmapList items={planned} />
        </Section>
      ) : null}

      <Section
        align="center"
        size="lg"
        title="Building something on Vendra?"
        lede="We would like to feature it—with your permission, a real image, and a short account of what you built."
        tone="muted"
        actions={[
          {
            href: 'https://github.com/misaf',
            label: 'Start a conversation',
            primary: true,
            external: true
          }
        ]}
      />
    </>
  )
}
