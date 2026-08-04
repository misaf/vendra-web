'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The parts `ContactForm` and `SignupForm` share.
 *
 * Extracted rather than copied because the two forms differ only in their
 * fields: the submit lifecycle, the focus handling, and the field styling are
 * the same problem solved once. A second copy of the status machinery is how
 * the two would drift — and the specific thing that would drift is the focus
 * effect below, which is subtle enough that a copy would almost certainly lose
 * it. `actionButtonClass` in `components/marketing.tsx` carries the same note
 * for the same reason.
 */

export type Status =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'sent' }
  | { state: 'error'; message: string }

/**
 * Submit status, plus the ref that receives focus when it resolves.
 *
 * The focus lives in an effect and not at the end of the submit handler. Doing
 * it inline looks right and does nothing on the path that matters: a successful
 * send usually swaps the whole form out for a confirmation, so at the moment
 * the handler finishes, the element being reached for has not rendered yet and
 * the one the ref holds is about to unmount. Focus lands on <body> — and
 * because the confirmation is a live region that still reads aloud, the failure
 * is invisible unless you check where focus actually went. An effect runs after
 * commit, so by then the element exists.
 */
export function useSubmitStatus<T extends HTMLElement>() {
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const statusRef = useRef<T>(null)

  useEffect(() => {
    if (status.state === 'sent' || status.state === 'error') {
      statusRef.current?.focus()
    }
  }, [status.state])

  return { status, setStatus, statusRef }
}

/**
 * The generic failure message.
 *
 * Names something the reader can act on — retry, or use another route — rather
 * than reporting a status code they cannot do anything with. The upstream
 * detail is deliberately not surfaced: the relay logs it, and a form service's
 * error text names accounts and domains.
 */
export const sendFailed =
  'That did not send — the connection or the form service may be down. What you typed is still here, so you can try again, or reach us through the direct channels.'

/**
 * POSTs a payload and resolves to nothing, or throws.
 *
 * Callers keep their own field shapes; this only owns the transport, so the two
 * forms cannot disagree about headers or about what counts as a failed send.
 */
export async function postForm(
  endpoint: string,
  payload: Record<string, unknown>
) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error(String(response.status))
}

/** A loose email check — see the note in `validateEmail`. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Deliberately permissive: a non-empty local part, an `@`, and a dot in the
 * domain. Anything stricter rejects addresses that are genuinely valid —
 * plus-addressing, new TLDs, quoted locals — and the cost of a false reject is
 * that someone with an unusual address cannot reach us at all. Whether the mail
 * arrives is the real test, and it is one only sending can run.
 */
export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Enter an email address so we can reply.'
  if (!EMAIL.test(email)) {
    return 'That does not look like an email address — check for a typo.'
  }
  return undefined
}

export const fieldClass = (invalid: boolean) =>
  `w-full rounded-lg border bg-[var(--vendra-surface-raised)] px-3.5 py-2.5 text-[0.9375rem] leading-6 text-[var(--vendra-fg)] transition-colors placeholder:text-[var(--vendra-fg-subtle)] ${
    invalid
      ? 'border-red-600 dark:border-red-400'
      : 'border-[var(--vendra-line-strong)] hover:border-[var(--vendra-fg-subtle)]'
  }`

export const labelClass = 'block text-sm font-semibold text-[var(--vendra-fg)]'

export const hintClass =
  'mt-1 block text-[0.8125rem] text-[var(--vendra-fg-subtle)]'

/** The inline message under a field. */
export function FieldError({
  id,
  children
}: {
  id: string
  children?: string
}) {
  if (!children) return null
  return (
    <p
      className="mt-1.5 text-[0.8125rem] font-medium text-red-700 dark:text-red-400"
      id={id}
    >
      {children}
    </p>
  )
}

/**
 * The spam trap.
 *
 * Taken out of the layout and out of the tab order, but not `display: none` —
 * a bot that reads computed styles skips hidden fields, and this one has to
 * look fillable. `aria-hidden` keeps it away from screen readers, which would
 * otherwise be the only humans who meet it.
 */
export function Honeypot({ id }: { id: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute size-px overflow-hidden [clip:rect(0,0,0,0)]"
    >
      <label htmlFor={id}>Company (leave this empty)</label>
      <input
        autoComplete="off"
        id={id}
        name="company"
        tabIndex={-1}
        type="text"
      />
    </div>
  )
}
