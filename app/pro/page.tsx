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
import { MarketingPage } from '../../components/page-wrapper'
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

/* `websites` and `trialDays` are the allowance the meter draws, and they are
   the same two columns the subscription enforces — `max_units` and
   `trial_days`. They are not repeated in `features`: a bullet reading "3
   websites" next to a meter showing three slots is the same fact twice, and
   the two would drift apart the first time a limit changed. `inherits` carries
   what used to be the "Everything in Basic" bullet, for the same reason it is
   not a feature — it is the previous column restated, not a thing this tier
   adds. */
const plans: Plan[] = [
  {
    name: 'Free trial',
    price: 'Free',
    cadence: 'for 7 days',
    websites: 1,
    trialDays: 7,
    summary:
      'Build one real website and take it end to end before paying anything.',
    features: [
      'Every platform feature — nothing is held back',
      'No card required to start',
      'Data kept 30 days after it stops'
    ],
    cta: { href: '/docs/getting-started', label: 'Start building' }
  },
  {
    name: 'Basic',
    price: '€10',
    cadence: '/ month',
    websites: 1,
    summary: 'For a reseller running a single client website in production.',
    features: [
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
    websites: 3,
    inherits: 'Basic',
    summary:
      'For resellers carrying a small portfolio of client shops at once.',
    features: [
      'Priority on issues you report',
      'Architecture review of your deployment'
    ],
    cta: { href: '/faq', label: 'Talk to us' },
    featured: true
  },
  {
    name: 'More than three',
    price: 'Let’s talk',
    websites: 'open',
    inherits: 'Pro',
    summary:
      'Running a larger portfolio? The limit is a number in your plan, and we will set it with you.',
    features: [
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
 * The order is the conventional commercial one — offer, pricing, proof, FAQ —
 * because a reseller pricing a build is looking for those things in that
 * order, and rearranging them to be different would cost the reader to buy
 * nothing. What carries the page instead is the tier meter: the allowance is
 * the only variable across four otherwise identical columns, so it is drawn in
 * the unit the subscription counts rather than listed as a bullet.
 *
 * The prices are real; what is still missing is a way to act on them — see the
 * notice at the top of the page and the TODO block above.
 *
 * Sizes are set per band rather than left at the default, on the same argument
 * as the landing page: four bands of identical padding read as four equals,
 * and this page is not four equals. The pricing table is the argument, the
 * logo wall and the FAQ are supporting evidence, and the accent band is the
 * arrival — the one lever that says stop here, spent once.
 */
export default function ProPage() {
  return (
    <MarketingPage>
      <Section
        titleAs="h1"
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

      {/* `loose`: the tiers are what the page is for, and the band above it is
          a notice rather than a header — at the default rhythm the table sat
          the same distance from the draft warning as its own cards sat from
          each other, so the warning read as the table's first row. */}
      <Section size="loose">
        <PricingTable plans={plans} />
      </Section>

      {/* `compact`: a row of logos is already one tight object. */}
      <Section
        size="compact"
        align="center"
        eyebrow="Used by"
        title="Companies building on Vendra"
        lede="Florists, importers, and studios running their shops on the ecosystem."
        tone="muted"
      >
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
        size="compact"
        eyebrow="Questions"
        title="Before you sign up"
        lede="The things resellers ask before they start."
      >
        <FaqList items={faq} />
      </Section>

      {/* The page ended on the last collapsed FAQ row — a hairline rule and
          then the footer — which left the one page on the site that is asking
          for money as the only marketing page with no close. `accent` to match
          the landing, about, and showcase arrivals.

          The trial is the primary action rather than "Talk to us": sign-up is
          not open, so the conversation is the slower path, and the trial is
          the one thing a reseller can actually do today. */}
      <Section
        align="center"
        size="lg"
        tone="accent"
        title="Start with one website"
        lede="The trial runs the whole platform for seven days with nothing held back. When a client signs, the limit is the only thing that changes."
        actions={[
          {
            href: '/docs/getting-started',
            label: 'Start building',
            primary: true
          },
          { href: '/faq', label: 'Talk to us' }
        ]}
      />
    </MarketingPage>
  )
}
