'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

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
 * What stands in for the form when scripting is off.
 *
 * Both forms are `'use client'`, but a static export still prerenders their
 * markup into the HTML — so with JavaScript disabled, blocked, or merely still
 * loading, the fields are all there and completely dead. `onSubmit` is what
 * sends them, and no handler is bound; the `<form>` has no `action` either, so
 * pressing the button navigates to the same page with the answers in the query
 * string and drops them. Nothing reports it. The reader watches their message
 * disappear and gets an empty form back.
 *
 * That is the same failure the endpoint guard was written to prevent — a
 * control that promises a conversation and delivers nothing — one layer further
 * down, and it matters here more than it would elsewhere: the entire argument
 * for this page is that it is reachable, and `/contact` renders its direct
 * channels unconditionally for exactly that reason.
 *
 * `action` is deliberately not the fix. Pointing the form at the relay would
 * make the button work without scripting, but the reply is the Worker's JSON
 * body, so the reader would land on a bare `{"ok":true}` in place of the page —
 * a worse answer than being told to use a link that works.
 *
 * The `<style>` hides the form rather than leaving it above the notice. A
 * visible form beside a note saying the form does not work is an invitation to
 * try it anyway. Inside `<noscript>` the rule only ever parses when scripting is
 * off; with scripting on, the element is inert and the UA stylesheet keeps it
 * out of the layout regardless.
 */
export function NoScriptNotice({ children }: { children: ReactNode }) {
  return (
    <noscript>
      <style>{`[data-js-form]{display:none!important}`}</style>
      <div className="rounded-xl border border-dashed border-[var(--vendra-line-strong)] p-6">
        <p className="text-base font-bold text-[var(--vendra-fg)]">
          This form needs JavaScript
        </p>
        {/* A <p>, not a <div>: the marketing surface styles inline links with
            `main[data-surface='marketing'] p a` and nothing else, so a link in
            here would otherwise render as body-coloured, unemphasised text —
            which is the exact gap that rule was added to close. */}
        <p className="mt-2 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
          {children}
        </p>
      </div>
    </noscript>
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
