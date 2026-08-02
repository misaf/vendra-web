import type { Metadata } from 'next'
import {
  FaqList,
  LogoWall,
  Notice,
  PricingTable,
  Section,
  TeamGrid
} from '../../components/marketing'
import type { Plan } from '../../components/marketing'
import { team } from '../../lib/team'

export const metadata: Metadata = {
  title: 'Vendra Pro',
  description:
    'Commercial support, prioritised issues, and direct access to the team behind the Vendra ecosystem.'
}

/* -------------------------------------------------------------------------- */
/* TODO — PLACEHOLDER PRICING. NOTHING BELOW IS A REAL COMMERCIAL OFFER.      */
/*                                                                            */
/* Every price, seat count, and support window here is invented to fill the    */
/* layout. Before this page goes anywhere public, replace:                     */
/*                                                                            */
/*   1. `price` and `cadence` on each plan                                     */
/*   2. the `features` lists — especially seat counts and support hours        */
/*   3. `cta.href` — these point at /faq as a placeholder, and need to go to   */
/*      a real checkout, quote form, or mailto:                                */
/*   4. the `<Notice>` below, which exists to stop a draft being mistaken for  */
/*      a live price list — delete it only once 1–3 are done                   */
/*   5. the LogoWall names, which are placeholders on the landing page too     */
/*                                                                            */
/* `check:links` will fail the build if a cta.href points at a route that does */
/* not exist, so a half-finished edit here cannot ship silently.               */
/* -------------------------------------------------------------------------- */

const plans: Plan[] = [
  {
    name: 'Starter',
    price: 'TBD',
    cadence: '/ month',
    summary:
      'For a team running a single property and wanting a faster path past blockers.',
    features: [
      'Access to Pro examples and templates',
      'Prioritised GitHub issues',
      'PLACEHOLDER: 1 team seat',
      'Introduction call with the maintainers'
    ],
    cta: { href: '/faq', label: 'Subscribe' }
  },
  {
    name: 'Professional',
    price: 'TBD',
    cadence: '/ month',
    summary:
      'For teams operating several properties, with a support channel that has a name on it.',
    features: [
      'Everything in Starter',
      'PLACEHOLDER: up to 1 hour of email support per month',
      'PLACEHOLDER: 5 team seats',
      'Architecture review of your deployment'
    ],
    cta: { href: '/faq', label: 'Subscribe' },
    featured: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    summary:
      'For hosts running Vendra as infrastructure, with procurement and compliance requirements.',
    features: [
      'Everything in Professional',
      'PLACEHOLDER: 1 hour of voice or video support per month',
      'PLACEHOLDER: 10 team seats',
      'Custom procurement, invoicing, and terms'
    ],
    cta: { href: '/faq', label: 'Request a quote' }
  }
]


const faq = [
  {
    question: 'Is Vendra itself open source?',
    answer: (
      <p>
        The ecosystem repositories are public and the packages are first-party.
        A Pro subscription does not unlock the software — it funds the work and
        buys support, prioritisation, and access to the Pro examples.
      </p>
    ),
  },
  {
    question: 'Do I need a subscription to use Vendra commercially?',
    answer: (
      <p>
        No. You can build and operate commercial storefronts on the ecosystem
        without a subscription. Pro exists for teams that want a support
        relationship rather than permission.
      </p>
    )
  },
  {
    question: 'What counts as a team seat?',
    answer: (
      <p>
        PLACEHOLDER — define this before publishing. Typically one named person
        who can open prioritised issues and join support calls.
      </p>
    )
  },
  {
    question: 'Can we trial it first?',
    answer: (
      <p>
        PLACEHOLDER — decide whether a trial exists and on what terms, then
        replace this answer.
      </p>
    )
  }
]

/**
 * The Pro page.
 *
 * Structure follows a conventional three-tier commercial page: offer, pricing,
 * social proof, FAQ. What it deliberately does not do is present invented
 * numbers as though they were real — see the notice at the top of the page and
 * the TODO block above.
 */
export default function ProPage() {
  return (
    <>
      <Section
        eyebrow="Vendra Pro"
        title="Support the ecosystem, and get support back"
        lede="The Vendra packages are public and free to build on. Subscriptions fund the maintenance, and buy your team a direct line to the people who write it."
      >
        <Notice title="Draft — placeholder pricing">
          <p>
            Every price and limit on this page is a placeholder. This layout is
            ready for real numbers; it does not carry any yet, and nothing here
            is a commercial offer. See the TODO block in{' '}
            <code>app/pro/page.tsx</code> for exactly what to replace.
          </p>
        </Notice>
      </Section>

      <Section>
        <PricingTable plans={plans} />
      </Section>

      <Section tone="muted">
        <div className="vw-section-head vw-align-center">
          <div className="vendra-eyebrow">Used by</div>
          <h2 className="vw-section-title">Companies building on Vendra</h2>
          <p className="vw-section-lede">
            Placeholder names — swap for real customers, with permission, before
            launch.
          </p>
        </div>
        <LogoWall
          names={[
            'Your Company',
            'Another Team',
            'A Third Shop',
            'Someone Else',
            'One More'
          ]}
        />
      </Section>

      <Section
        eyebrow="Who you are buying from"
        title="The people behind Vendra"
        lede="A Pro subscription is a support relationship, so it is worth knowing who is on the other end of it."
        align="center"
      >
        <TeamGrid members={team} />
      </Section>

      <Section
        eyebrow="Questions"
        title="Before you subscribe"
        lede="Two of these still need real answers — they are marked."
      >
        <FaqList items={faq} />
      </Section>
    </>
  )
}
