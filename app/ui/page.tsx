import type { Metadata } from 'next'
import { Gallery, Notice, Section } from '../../components/marketing'

export const metadata: Metadata = {
  title: 'UI',
  description:
    'Storefront themes, Filament panel presets, and templates you can start a Vendra property from.'
}

/* -------------------------------------------------------------------------- */
/* TODO — SCAFFOLD. This section is the thinnest of the three galleries,       */
/* because the artefacts it lists do not exist yet as distributable            */
/* templates. The florist storefront is the only real one today.               */
/*                                                                            */
/* To land a template: publish it (a repository, a theme package, or a         */
/* documented preset), then give its entry an `href` and drop `planned`.       */
/* -------------------------------------------------------------------------- */

const themes = [
  {
    title: 'Florist',
    description:
      'The reference storefront theme: catalogue, product detail, cart, and checkout, fully internationalised.',
    href: '/storefront',
    tag: 'Available'
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
    href: '/platform',
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
    description: 'Login, registration, and order history, with social login optional.',
    planned: true
  }
]

export default function UiPage() {
  return (
    <>
      <Section
        eyebrow="UI"
        title="Themes, panels, and blocks"
        lede="Starting points for a Vendra property. A theme decides how a storefront looks and which pages it composes; a panel preset decides what an operator can do."
      >
        <Notice title="Scaffold">
          <p>
            Only the florist theme and the operator panel exist today — the rest
            are placeholders showing the intended shape of this section. Edit{' '}
            <code>app/ui/page.tsx</code> to fill them in.
          </p>
        </Notice>
      </Section>

      <Section eyebrow="Storefront" title="Themes">
        <Gallery items={themes} />
      </Section>

      <Section eyebrow="Platform" title="Panel presets" tone="muted">
        <Gallery items={panels} />
      </Section>

      <Section eyebrow="Composable" title="Blocks">
        <Gallery items={blocks} />
      </Section>
    </>
  )
}
