import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '../../components/marketing'
import { SignupForm } from '../../components/signup-form'
import { MarketingPage } from '../../components/page-wrapper'
import { contactEndpoint } from '../../lib/site'

export const metadata: Metadata = {
  title: 'Early access',
  description:
    'Join the list we write to when self-serve sign-up for Vendra opens.'
}

/**
 * The early-access page.
 *
 * It captures an email address and does not create an account, because nothing
 * here can: the site is a static export and the platform that owns accounts is
 * not reachable from it. `/pro` already says sign-up is not open, so a form
 * that behaved as though it were would contradict the page it is reached from.
 *
 * The honesty is the design. Every element on this page says what happens next
 * and when — what the list is for, what does not arrive, and what to do instead
 * if waiting is not an option. A waitlist that is vague about those is read as
 * a newsletter trap, and the address it collects is worth nothing.
 *
 * When self-serve provisioning lands, the account signup that replaces this
 * posts to the platform's auth API. It must not reuse `contact-worker` — see
 * the note in `components/signup-form.tsx`.
 */
export default function SignupPage() {
  return (
    <MarketingPage>
      <Section
        titleAs="h1"
        eyebrow="Early access"
        title="Be first when sign-up opens"
        lede="Self-serve sign-up is not open yet. Leave an address and we will write once — when it is, and not before."
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.75fr)] lg:gap-16">
          <div>
            {contactEndpoint ? (
              <SignupForm />
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--vendra-line-strong)] p-6">
                <p className="text-base font-bold text-[var(--vendra-fg)]">
                  The list is not switched on yet
                </p>
                <p className="mt-2 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
                  <Link href="/contact">Get in touch</Link> instead — the same
                  two people read it, and it works now.
                </p>
                <p className="mt-3 text-[0.8125rem] leading-6 text-[var(--vendra-fg-subtle)]">
                  Deploying this site? Set{' '}
                  <code>NEXT_PUBLIC_CONTACT_ENDPOINT</code> and the form
                  replaces this notice.
                </p>
              </div>
            )}
          </div>

          <aside>
            <h2 className="label text-[var(--vendra-fg-subtle)]">
              What this is
            </h2>
            <ul className="mt-4 m-0 list-none border-t border-[var(--vendra-line)] p-0 text-[0.9375rem] leading-6">
              {[
                [
                  'One message, once',
                  'Sent when self-serve sign-up opens. There is no newsletter and no drip sequence attached to this list.'
                ],
                [
                  'Not an account',
                  'Nothing is provisioned and no password is asked for. You are reserving a place in the queue, not creating a login.'
                ],
                [
                  'Not a commitment',
                  'No card, no plan chosen, and no obligation to take one when the message arrives.'
                ]
              ].map(([title, body]) => (
                <li
                  className="border-b border-[var(--vendra-line)] py-3.5"
                  key={title}
                >
                  <strong className="block font-semibold">{title}</strong>
                  <span className="mt-1 block text-[0.875rem] leading-6 text-[var(--vendra-fg-muted)]">
                    {body}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[0.875rem] leading-6 text-[var(--vendra-fg-muted)]">
              Cannot wait? The platform is public and documented — the{' '}
              <Link href="/docs/getting-started">getting-started guide</Link>{' '}
              runs from an empty machine to a working storefront today, without
              an account of any kind.
            </p>
          </aside>
        </div>
      </Section>

      <Section
        align="center"
        size="lg"
        tone="accent"
        title="Or start a conversation now"
        lede="Resellers pricing a build do not have to wait for the queue — plans are agreed directly until self-serve opens."
        actions={[
          { href: '/contact', label: 'Talk to us', primary: true },
          { href: '/pro', label: 'See the plans' }
        ]}
      />
    </MarketingPage>
  )
}
