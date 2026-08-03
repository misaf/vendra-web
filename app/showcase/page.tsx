import type { Metadata } from 'next'
import { Actions, Gallery, Notice, Section } from '../../components/marketing'

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
    title: 'Florist storefront',
    description:
      'The first-party reference storefront. Themed, internationalised, and deployed per property behind the shared Traefik edge.',
    href: '/storefront',
    tag: 'First-party'
  },
  {
    title: 'Vendra operator panel',
    description:
      'The Filament administration surface for tenants, properties, billing, and platform administration.',
    href: '/platform',
    tag: 'First-party'
  },
  {
    title: 'Ecosystem documentation',
    description:
      'This site: documentation, examples, and the blog, built on Nextra and validated by five offline checks.',
    href: '/overview',
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
  return (
    <>
      <Section
        eyebrow="Showcase"
        title="Built on Vendra"
        lede="What the ecosystem looks like in production."
      >
        <Notice title="Only first-party projects so far">
          <p>
            Every entry below is a Vendra project. Third-party projects will be
            added as their owners agree to be named — deliberately not filled
            with invented companies, since a fabricated showcase is a false
            endorsement rather than a placeholder.
          </p>
        </Notice>
      </Section>

      <Section>
        <Gallery items={projects} />
      </Section>

      <Section tone="muted">
        <div className="vw-section-head vw-align-center">
          <h2 className="vw-section-title">Building something on Vendra?</h2>
          <p className="vw-section-lede">
            We would like to feature it. Start a conversation and we will put
            together a short case study.
          </p>
          <Actions
            items={[{ href: '/faq', label: 'Get in touch', primary: true }]}
          />
        </div>
      </Section>
    </>
  )
}
