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
import { customers } from '../../lib/customers'
import { team } from '../../lib/team'

export const metadata: Metadata = {
  title: 'Vendra Pro',
  description:
    'Reseller plans for the Vendra ecosystem, counted in the number of websites you can run at once.'
}

/* -------------------------------------------------------------------------- */
/* Prices are set: Basic €10/month, Pro €20/month. The rest of the structure   */
/* was already real — reseller subscribers, limits counted in concurrent       */
/* websites, a 7-day free trial, and a conversation above three.               */
/*                                                                            */
/* TODO before this page goes public:                                          */
/*                                                                            */
/*   1. `cta.href` on the paid tiers — they point at /faq as a placeholder and */
/*      need a real contact route, quote form, or mailto:                      */
/*                                                                            */
/* Now that the page quotes a figure it reads as a commercial offer, which     */
/* raises the cost of the two things it PROMISES that the platform does not    */
/* yet do:                                                                     */
/*                                                                            */
/*   a. "goes offline after 7 days" needs grace_days = 0 on the trial plan.    */
/*      Subscription::suspendAt() is ends_at + grace_days, so any non-zero     */
/*      value leaves the site serving past day 7 and this copy becomes false.  */
/*   b. "data kept 30 days, then gone" has no implementation. vendra-          */
/*      subscription has no purge or retention job — data currently stays      */
/*      indefinitely. Promising deletion and not deleting is the wrong way     */
/*      round to be wrong about data.                                          */
/*                                                                            */
/* Keep this page in step with the `plans` table in vendra-subscription:       */
/* max_units is the website count, trial_days the 7, grace_days the window     */
/* after expiry. If a number here disagrees with a column there, the column    */
/* wins — it is what actually gets enforced.                                   */
/* -------------------------------------------------------------------------- */

const plans: Plan[] = [
  {
    name: 'Free trial',
    price: 'Free',
    cadence: 'for 7 days',
    summary:
      'Build one real website and take it end to end before paying anything.',
    features: [
      '1 website',
      'Every platform feature — nothing is held back',
      'No card required to start',
      'Goes offline after 7 days — data kept 30'
    ],
    cta: { href: '/docs/getting-started', label: 'Start building' }
  },
  {
    name: 'Basic',
    price: '€10',
    cadence: '/ month',
    summary: 'For a reseller running a single client website in production.',
    features: [
      '1 website',
      'No time limit',
      'Email support',
      'Upgrade without rebuilding anything'
    ],
    cta: { href: '/faq', label: 'Talk to us' }
  },
  {
    name: 'Pro',
    price: '€20',
    cadence: '/ month',
    summary:
      'For resellers carrying a small portfolio of client shops at once.',
    features: [
      '3 websites',
      'Everything in Basic',
      'Priority on issues you report',
      'Architecture review of your deployment'
    ],
    cta: { href: '/faq', label: 'Talk to us' },
    featured: true
  },
  {
    name: 'More than three',
    price: 'Let’s talk',
    summary:
      'Running a larger portfolio? The limit is a number in your plan, and we will set it with you.',
    features: [
      'Website count agreed with you',
      'Everything in Pro',
      'Custom invoicing and terms',
      'A direct line rather than a queue'
    ],
    cta: { href: '/faq', label: 'Get in touch' }
  }
]

const faq = [
  {
    question: 'Who are these plans for?',
    answer: (
      <p>
        Resellers — agencies and builders who run Vendra websites on behalf of
        their own clients. There is no plan sold to a shop&rsquo;s end
        customers, because a shop&rsquo;s customers are not our customers: they
        are yours.
      </p>
    )
  },
  {
    question: 'What counts toward my website limit?',
    answer: (
      <p>
        Websites you are running right now, not websites you have ever created.
        The limit is checked against your current count, so removing a website
        frees its slot immediately and a client who leaves does not keep
        occupying your plan.
      </p>
    )
  },
  {
    question: 'What happens when the 7 days are up?',
    answer: (
      <p>
        The website goes offline. Your data is kept for 30 days, so if you pick
        a plan within that window the site comes back as you left it. After 30
        days it is gone. Nothing is deleted the moment the trial ends, and
        nothing is charged automatically.
      </p>
    )
  },
  {
    question: 'Can I move down a plan?',
    answer: (
      <p>
        Yes, as long as you are within the smaller plan&rsquo;s limit first. You
        cannot drop to a 1-website plan while running three — the subscription
        refuses it rather than silently choosing which two of your client sites
        to switch off.
      </p>
    )
  },
  {
    question: 'Do I need a card to try it?',
    answer: (
      <p>
        No. The free trial starts without one. Note that this means the trial
        does not roll into a paid plan on its own — you choose a plan when you
        are ready.
      </p>
    )
  },
  {
    question: 'Do I have to pay to use Vendra commercially?',
    answer: (
      <p>
        The ecosystem repositories are public and you can build on them. Plans
        exist for resellers who want the hosted platform, the limits managed for
        them, and somebody to call.
      </p>
    )
  }
]

/**
 * The Pro page.
 *
 * Structure follows a conventional three-tier commercial page: offer, pricing,
 * social proof, FAQ. The prices are real; what is still missing is a way to act
 * on them — see the notice at the top of the page and the TODO block above.
 */
export default function ProPage() {
  return (
    <>
      <Section
        eyebrow="Vendra for resellers"
        title="Plans are counted in websites"
        lede="Build client shops on Vendra and pay for how many you run at once. Start free for seven days, and move up when a client signs — the limit is the only thing that changes."
      >
        <Notice title="Draft — sign-up is not open yet">
          <p>
            Prices are set: <strong>€10 a month</strong> for Basic and{' '}
            <strong>€20 a month</strong> for Pro, both per month and counted in
            concurrent websites. There is no self-serve checkout yet, so every
            plan below starts as a conversation. See the TODO block in{' '}
            <code>app/pro/page.tsx</code>.
          </p>
        </Notice>
      </Section>

      <Section>
        <PricingTable plans={plans} />
      </Section>

      <Section tone="muted">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="text-xs font-semibold tracking-[0.16em] text-[var(--vendra-fg-subtle)] uppercase">
            Used by
          </div>
          <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight font-bold tracking-[-0.035em]">
            Companies building on Vendra
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-7 text-[var(--vendra-fg-subtle)]">
            Florists, importers, and studios running their shops on the
            ecosystem.
          </p>
        </div>
        <LogoWall customers={customers} />
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
        title="Before you sign up"
        lede="The things resellers ask before they start."
      >
        <FaqList items={faq} />
      </Section>
    </>
  )
}
