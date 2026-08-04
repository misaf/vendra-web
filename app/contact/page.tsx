import type { Metadata } from 'next'
import { Section } from '../../components/marketing'
import { ContactForm } from '../../components/contact-form'
import { MarketingPage } from '../../components/page-wrapper'
import { ExternalMark } from '../../components/icons'
import { contactEndpoint } from '../../lib/site'
import { team } from '../../lib/team'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Reach the team behind Vendra about a plan, a deployment, or anything else.'
}

/**
 * The contact page.
 *
 * It exists because an audit found that every commercial call to action on
 * `/pro` — "Talk to us" on three tiers and "Get in touch" on the fourth —
 * pointed at `/faq`, and `/faq` contained no way to contact anybody: no
 * address, no form, and not the word "contact" anywhere on it. Four buttons on
 * the one page that asks for money promised a conversation and delivered a list
 * of questions.
 *
 * So the page is built around being reachable rather than around the form. The
 * direct channels below render unconditionally and the form renders only when
 * `NEXT_PUBLIC_CONTACT_ENDPOINT` is set (a static export has nothing to receive
 * a POST — see `components/contact-form.tsx`). A build with no endpoint
 * configured is therefore still a working contact page, which is the property
 * the old `/faq` destination was missing.
 */

/** Everyone on the team who has published a way to reach them. */
const channels = team.flatMap(member =>
  (member.links ?? []).map(link => ({
    person: member.name,
    role: member.role,
    label: link.label,
    href: link.href
  }))
)

export default function ContactPage() {
  return (
    <MarketingPage>
      <Section
        titleAs="h1"
        eyebrow="Contact"
        title="Talk to the people who build it"
        lede="Questions about a plan, a deployment that is misbehaving, or whether Vendra fits what you are building. The same two people answer all of it."
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-16">
          <div>
            {/* The right-hand column has always had its heading; this one did
                not, so the page's outline ran h1 → "Direct channels" and the
                form — the thing the page is for — appeared under no heading at
                all. A reader navigating by heading was taken straight past it
                to the alternative, and a reader skimming the two columns had
                one labelled and one not. Same treatment as its neighbour, so
                the columns now read as a pair.

                `text-lg font-bold tracking-tight` and not the `label` utility
                both of these carried. `label` is 12px uppercase mono — the
                site's eyebrow, and everywhere else on the marketing surface it
                sits *above* a real heading rather than being one. Used as the
                heading itself it put the column titles two steps below the
                15px prose they introduce, so the page's second level was the
                smallest text in the column and the eye had nothing to land on
                between the h1 and the body. This is the same step
                `PricingTable` sets its plan names at, which is the same job:
                an h2 inside a section band. */}
            <h2 className="text-lg font-bold tracking-tight">Send a message</h2>
            <div className="mt-5">
              {contactEndpoint ? (
                <ContactForm />
              ) : (
                /* Not an error state and not styled as one — for a reader this
                   is simply a page that offers direct channels. The build is
                   what is unfinished, and the note that says so is addressed to
                   whoever is deploying it. */
                <div className="rounded-xl border border-dashed border-[var(--vendra-line-strong)] p-6">
                  <p className="text-base font-bold text-[var(--vendra-fg)]">
                    The form is not switched on yet
                  </p>
                  <p className="mt-2 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
                    Use one of the direct channels instead — they reach the same
                    two people, and they reach them now.
                  </p>
                  <p className="mt-3 text-[0.8125rem] leading-6 text-[var(--vendra-fg-subtle)]">
                    Deploying this site? Set{' '}
                    <code>NEXT_PUBLIC_CONTACT_ENDPOINT</code> to a form endpoint
                    and the form replaces this notice.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Direct channels
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
              Public profiles, so you can see who you would be talking to before
              you write.
            </p>
            <ul className="mt-5 m-0 list-none border-t border-[var(--vendra-line)] p-0">
              {channels.map(channel => (
                <li
                  className="border-b border-[var(--vendra-line)]"
                  key={`${channel.person}-${channel.label}`}
                >
                  <a
                    className="relative flex items-center justify-between gap-4 py-3.5 text-[0.9375rem] transition-colors hover:text-[var(--vendra-accent-text)]"
                    href={channel.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span>
                      <strong className="block font-semibold">
                        {channel.label}
                      </strong>
                      <span className="text-[0.8125rem] text-[var(--vendra-fg-subtle)]">
                        {channel.person} · {channel.role}
                      </span>
                    </span>
                    <ExternalMark />
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[0.8125rem] leading-6 text-[var(--vendra-fg-subtle)]">
              Reporting something broken? The{' '}
              <a
                className="relative underline underline-offset-2 hover:text-[var(--vendra-fg)]"
                href="https://github.com/misaf"
                rel="noreferrer"
                target="_blank"
              >
                GitHub profile
                <ExternalMark />
              </a>{' '}
              is the fastest route, and the issue stays public where the next
              person can find it.
            </p>
          </div>
        </div>
      </Section>
    </MarketingPage>
  )
}
