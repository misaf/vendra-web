import type { Metadata } from 'next'
import {
  EditorialList,
  FeaturedProject,
  RoadmapList,
  Section
} from '../../components/marketing'
import { basePath } from '../../lib/site'
import { MarketingPage } from '../../components/page-wrapper'

export const metadata: Metadata = {
  title: 'UI',
  description:
    'Storefront themes, Filament panel presets, and templates you can start a Vendra property from.'
}

/* -------------------------------------------------------------------------- */
/* TODO — ROADMAP. The florist theme and operator panel are presented as       */
/* available work; distributable artefacts that do not exist yet stay in a     */
/* compact roadmap below them.                                                  */
/*                                                                            */
/* To land a template: publish it (a repository, a theme package, or a         */
/* documented preset), then give its entry an `href` and drop `planned`.       */
/* -------------------------------------------------------------------------- */

const themes = [
  {
    title: 'Florist',
    description:
      'The reference storefront theme: catalogue, product detail, cart, and checkout, fully internationalised.',
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
    title: 'Minimal catalogue',
    description:
      'A stripped-back theme for properties that sell a handful of products.',
    planned: true
  },
  {
    title: 'Single product',
    description:
      'A landing-page storefront built around one product and one checkout.',
    planned: true
  }
]

const panels = [
  {
    title: 'Operator panel preset',
    description:
      'Filament resources for tenants, properties, and billing, ready to register.',
    href: '/docs/platform',
    tag: 'Platform'
  },
  {
    title: 'Platform superadmin preset',
    description:
      'The cross-account administration panel, gated behind is_platform_admin.',
    planned: true
  }
]

const blocks = [
  {
    title: 'Checkout blocks',
    description:
      'Composable cart, address, and payment steps that read the storefront configuration.',
    planned: true
  },
  {
    title: 'Catalogue blocks',
    description:
      'Product grids, facets, and detail layouts shared across themes.',
    planned: true
  },
  {
    title: 'Account blocks',
    description:
      'Login, registration, and order history, with social login optional.',
    planned: true
  }
]

export default function UiPage() {
  const featured = themes[0]
  const available = [...themes.slice(1), ...panels, ...blocks].filter(
    item => !('planned' in item && item.planned)
  )
  const roadmap = [
    ...themes.slice(1).map(item => ({ ...item, area: 'Theme' })),
    ...panels.map(item => ({ ...item, area: 'Panel' })),
    ...blocks.map(item => ({ ...item, area: 'Block' }))
  ]
    .filter(item => 'planned' in item && item.planned)
    .map(item => ({ title: item.title, area: item.area }))

  return (
    <MarketingPage>
      <Section
        titleAs="h1"
        eyebrow="UI"
        title="A real theme before a catalogue of promises"
        lede="The florist storefront and operator panel are available today. Future themes and composable blocks follow as a compact roadmap."
      >
        <FeaturedProject
          eyebrow="Available theme"
          item={{ ...featured, href: featured.href!, shot: featured.shot! }}
          secondaryShot={{
            src: `${basePath}/shots/storefront-home-fa.png`,
            alt: 'The same Houshang Flowers home page in Persian with right-to-left navigation and content',
            width: 1600,
            height: 1000,
            host: 'houshang-flowers.com/fa'
          }}
        />
      </Section>

      <Section
        eyebrow="Available"
        title="Operator surfaces"
        lede="First-party administration built around the platform's existing domains."
        tone="muted"
      >
        <EditorialList items={available} />
      </Section>

      <Section
        size="compact"
        eyebrow="Roadmap"
        title="Themes, panels, and blocks still to come"
        lede="Visible enough to show direction, compact enough not to outnumber the work you can use."
      >
        <RoadmapList items={roadmap} />
      </Section>

      {/* Closes on the theme that exists rather than on the roadmap, for the
          same reason the roadmap is kept short: the page's argument is that
          the available work outweighs the promised work, and ending on the
          promises contradicted it. */}
      <Section
        align="center"
        size="lg"
        tone="accent"
        title="Use the theme that ships today"
        lede="The florist storefront runs in English and Persian, and it is configured rather than forked."
        actions={[
          {
            href: '/docs/storefront',
            label: 'Explore the storefront',
            primary: true
          },
          { href: '/showcase', label: 'See it in production' }
        ]}
      />
    </MarketingPage>
  )
}
