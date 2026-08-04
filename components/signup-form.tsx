'use client'

import { useId, useRef, useState } from 'react'
import { contactEndpoint } from '../lib/site'
import {
  FieldError,
  Honeypot,
  fieldClass,
  hintClass,
  labelClass,
  postForm,
  sendFailed,
  useSubmitStatus,
  validateEmail
} from './form-kit'

/**
 * Early-access signup.
 *
 * ## What this is not
 *
 * It does not create an account, and it asks for no password. That is not a
 * simplification — it is the only honest form this can take today. `/pro` says
 * in its own notice that sign-up is not open and there is no self-serve
 * checkout, and nothing in this repository can create an account: the site is a
 * static export and the Laravel platform that owns accounts is not reachable
 * from it. A form that collected a password would have nowhere to send it
 * except the mail relay, and mailing plaintext passwords to an inbox is the
 * wrong answer to every question.
 *
 * So this captures interest and nothing else. When self-serve provisioning
 * exists, the account signup that replaces this should post to the platform's
 * own auth API over HTTPS and must never touch `contact-worker`.
 *
 * ## Two shapes, one form
 *
 * `compact` renders the email-only row embedded in `/pro`, beside the tiers,
 * where the reader is mid-decision and anything longer than one field is a
 * reason to leave. The full form on `/signup` asks two more questions, both
 * optional, because someone who navigated to a page called Signup has already
 * decided and the answers make the follow-up useful rather than generic.
 *
 * One component rather than two so the payload, the validation, and the
 * confirmation wording cannot drift between the page and the widget that feeds
 * it.
 */

const scales = [
  'Just me',
  'A handful of client sites',
  'A larger portfolio',
  'Still deciding'
] as const

export function SignupForm({ compact = false }: { compact?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()
  const { status, setStatus, statusRef } = useSubmitStatus<HTMLDivElement>()
  const [error, setError] = useState<string | undefined>()
  const [submitted, setSubmitted] = useState(false)

  if (!contactEndpoint) return null

  const emailId = `${id}-email`
  const errorId = `${id}-email-error`
  const hintId = `${id}-email-hint`

  const read = () => {
    const data = new FormData(formRef.current!)
    return {
      email: String(data.get('email') ?? ''),
      name: String(data.get('name') ?? ''),
      scale: String(data.get('scale') ?? ''),
      company: String(data.get('company') ?? '')
    }
  }

  const revalidate = () => {
    if (submitted) setError(validateEmail(read().email))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const values = read()
    const found = validateEmail(values.email)
    setError(found)

    if (found) {
      formRef.current?.querySelector<HTMLElement>('[name="email"]')?.focus()
      return
    }

    // Accept and drop a honeypot hit rather than reporting it — see the note in
    // `Honeypot`.
    if (values.company) {
      setStatus({ state: 'sent' })
      return
    }

    setStatus({ state: 'sending' })

    try {
      await postForm(contactEndpoint, {
        form: 'waitlist',
        email: values.email.trim(),
        name: values.name.trim(),
        scale: values.scale
      })
      setStatus({ state: 'sent' })
      formRef.current?.reset()
      setSubmitted(false)
    } catch {
      // No `reset()` on this path: the address stays in the field so a retry is
      // a second click rather than a second typing.
      setStatus({ state: 'error', message: sendFailed })
    }
  }

  const sending = status.state === 'sending'

  if (status.state === 'sent') {
    return (
      <div
        className={`rounded-xl border border-[color-mix(in_srgb,var(--vendra-accent),transparent_55%)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_92%)] ${compact ? 'p-4' : 'p-6'}`}
        ref={statusRef}
        role="status"
        tabIndex={-1}
      >
        <p className="text-base font-bold text-[var(--vendra-fg)]">
          You are on the list.
        </p>
        <p className="mt-2 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
          We will write when self-serve sign-up opens. Nothing else goes to this
          address, and there is no newsletter attached to it.
        </p>
      </div>
    )
  }

  return (
    <form
      className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-5'}
      noValidate
      onSubmit={onSubmit}
      ref={formRef}
    >
      <div className={compact ? 'flex flex-wrap items-start gap-3' : undefined}>
        <div className={compact ? 'min-w-56 flex-1' : undefined}>
          <label className={labelClass} htmlFor={emailId}>
            Email
          </label>
          {compact ? null : (
            <span className={hintClass} id={hintId}>
              Where we write when sign-up opens. Nothing else is sent here.
            </span>
          )}
          <input
            aria-describedby={
              compact
                ? error
                  ? errorId
                  : undefined
                : error
                  ? `${hintId} ${errorId}`
                  : hintId
            }
            aria-invalid={error ? true : undefined}
            autoComplete="email"
            className={`mt-1.5 ${fieldClass(!!error)}`}
            id={emailId}
            inputMode="email"
            name="email"
            onBlur={revalidate}
            placeholder={compact ? 'you@example.com' : undefined}
            type="email"
          />
          {compact ? <FieldError id={errorId}>{error}</FieldError> : null}
        </div>

        {compact ? (
          <button
            className="mt-[1.6rem] inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--vendra-accent-strong)] bg-[var(--vendra-accent-strong)] px-5 text-sm font-semibold text-[var(--vendra-on-accent)] shadow-[var(--vendra-glow-sm)] transition hover:border-[var(--vendra-accent)] hover:bg-[var(--vendra-accent)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={sending}
            type="submit"
          >
            {sending ? 'Joining…' : 'Join the list'}
          </button>
        ) : null}
      </div>

      {compact ? null : (
        <>
          <FieldError id={errorId}>{error}</FieldError>

          <div>
            <label className={labelClass} htmlFor={`${id}-name`}>
              Your name{' '}
              <span className="font-normal text-[var(--vendra-fg-subtle)]">
                (optional)
              </span>
            </label>
            <input
              autoComplete="name"
              className={`mt-1.5 ${fieldClass(false)}`}
              id={`${id}-name`}
              name="name"
              type="text"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor={`${id}-scale`}>
              How many sites are you thinking about?{' '}
              <span className="font-normal text-[var(--vendra-fg-subtle)]">
                (optional)
              </span>
            </label>
            <span className={hintClass} id={`${id}-scale-hint`}>
              Plans are counted in concurrent websites, so this tells us which
              tier to talk to you about.
            </span>
            <select
              aria-describedby={`${id}-scale-hint`}
              className={`mt-1.5 ${fieldClass(false)}`}
              defaultValue={scales[3]}
              id={`${id}-scale`}
              name="scale"
            >
              {scales.map(scale => (
                <option key={scale} value={scale}>
                  {scale}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <Honeypot id={`${id}-company`} />

      {/* Present from the first render rather than mounted on failure: a live
          region that appears at the same moment its text does is frequently
          missed, because there was nothing there to be observed. */}
      <div
        aria-live="polite"
        className={
          status.state === 'error'
            ? 'rounded-lg border border-red-600/40 bg-red-500/8 p-4 text-[0.9375rem] leading-6 text-red-800 dark:border-red-400/40 dark:text-red-300'
            : 'sr-only'
        }
        ref={statusRef}
        tabIndex={-1}
      >
        {status.state === 'error' ? status.message : ''}
        {sending ? 'Sending…' : ''}
      </div>

      {compact ? (
        <p className="text-[0.8125rem] leading-6 text-[var(--vendra-fg-subtle)]">
          Sign-up is not open yet — this is the list we write to when it is.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--vendra-accent-strong)] bg-[var(--vendra-accent-strong)] px-5 text-sm font-semibold text-[var(--vendra-on-accent)] shadow-[var(--vendra-glow-sm)] transition hover:border-[var(--vendra-accent)] hover:bg-[var(--vendra-accent)] hover:shadow-[var(--vendra-glow-md)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={sending}
            type="submit"
          >
            {sending ? 'Joining…' : 'Join the early-access list'}
          </button>
          <p className="text-[0.8125rem] text-[var(--vendra-fg-subtle)]">
            One message when sign-up opens. No newsletter.
          </p>
        </div>
      )}
    </form>
  )
}
