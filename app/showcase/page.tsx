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
    href: '/docs/storefront',
    tag: 'First-party'
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
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight font-bold tracking-[-0.035em]">
            Building something on Vendra?
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-7 text-[var(--vendra-fg-subtle)]">
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
