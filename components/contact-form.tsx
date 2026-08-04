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
 * The contact form behind `/contact`.
 *
 * ## Why it posts somewhere else
 *
 * This site is `output: 'export'` — a directory of static files on GitHub
 * Pages. There is no server, no route handler, and no server action to receive
 * a submission, so the form posts to a third-party form endpoint named by
 * `NEXT_PUBLIC_CONTACT_ENDPOINT`. The shape it sends — a JSON body of named
 * fields, `Accept: application/json` — is what Formspree, Basin, Getform, and
 * Web3Forms all take, so the choice of service is a deployment decision rather
 * than a code change.
 *
 * With no endpoint configured this component renders nothing, and `/contact`
 * shows its direct-channels column alone. That is deliberate: a submit button
 * which silently drops the message is worse than no form at all, and it is
 * exactly the failure the audit found on the old `/pro` buttons — a control
 * that promises a conversation and delivers nothing. An unconfigured build
 * still leaves a page you can be reached through.
 *
 * ## What it does not collect
 *
 * Name, email, subject, message. No phone, no company size, no budget band,
 * and nothing resembling a credential or a payment detail. Every extra field
 * costs completions, and a static site posting to a third party is the wrong
 * place for anything sensitive.
 */

type Errors = Partial<Record<'name' | 'email' | 'message', string>>

const subjects = [
  'A plan or a quote',
  'Help with a deployment',
  'Something else'
] as const

/**
 * Validation, in one place so the submit handler and the blur handler cannot
 * disagree about what counts as valid. The email rule comes from form-kit, so
 * this form and the signup form accept exactly the same addresses.
 */
function validate(values: {
  name: string
  email: string
  message: string
}): Errors {
  const errors: Errors = {}

  if (!values.name.trim()) {
    errors.name = 'Enter your name so we know who is writing.'
  }

  const email = validateEmail(values.email)
  if (email) errors.email = email

  if (!values.message.trim()) {
    errors.message = 'Tell us what you need, even briefly.'
  } else if (values.message.trim().length < 10) {
    errors.message = 'A little more detail will get you a better answer.'
  }

  return errors
}

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const id = useId()
  const { status, setStatus, statusRef } = useSubmitStatus<HTMLDivElement>()
  const [errors, setErrors] = useState<Errors>({})
  /* Errors appear on blur only after the first submit attempt. Validating a
     field the moment someone tabs out of it — before they have tried to send
     anything — scolds them for an empty box they were always going to fill in
     on the way past. */
  const [submitted, setSubmitted] = useState(false)

  if (!contactEndpoint) return null

  const fieldId = (name: string) => `${id}-${name}`
  const errorId = (name: string) => `${id}-${name}-error`
  const hintId = (name: string) => `${id}-${name}-hint`

  const read = () => {
    const data = new FormData(formRef.current!)
    return {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      subject: String(data.get('subject') ?? ''),
      // Honeypot. A real person never sees this field, so anything in it is a
      // bot filling every input it can find.
      company: String(data.get('company') ?? '')
    }
  }

  const revalidate = () => {
    if (submitted) setErrors(validate(read()))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const values = read()
    const found = validate(values)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      // Send focus to the first field that needs attention rather than leaving
      // the reader to hunt for the red text — on a long form the first error
      // can be off-screen by the time the button is reached.
      const first = Object.keys(found)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }

    // Silently accept and discard a honeypot hit: telling a bot it failed is
    // how it learns to stop tripping the trap.
    if (values.company) {
      setStatus({ state: 'sent' })
      return
    }

    setStatus({ state: 'sending' })

    try {
      await postForm(contactEndpoint, {
        form: 'contact',
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject,
        message: values.message.trim()
      })

      setStatus({ state: 'sent' })
      formRef.current?.reset()
      setSubmitted(false)
    } catch {
      /* The message stays in the fields — `reset()` runs only on success. An
         error that wipes what someone just typed turns a retry into a rewrite,
         and it is the one failure mode that loses the enquiry outright. */
      setStatus({ state: 'error', message: sendFailed })
    }
  }

  const sending = status.state === 'sending'

  if (status.state === 'sent') {
    return (
      <div
        className="rounded-xl border border-[color-mix(in_srgb,var(--vendra-accent),transparent_55%)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_92%)] p-6"
        ref={statusRef}
        role="status"
        tabIndex={-1}
      >
        <p className="text-base font-bold text-[var(--vendra-fg)]">
          Thanks — that reached us.
        </p>
        <p className="mt-2 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
          We answer from a small team rather than a queue, usually within a
          couple of working days. If it is urgent, the direct channels below get
          there faster.
        </p>
        <button
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-[var(--vendra-line-strong)] px-4 text-sm font-semibold text-[var(--vendra-fg-muted)] transition hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-fg)]"
          onClick={() => setStatus({ state: 'idle' })}
          type="button"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={onSubmit}
      ref={formRef}
    >
      {/* `noValidate` turns off the browser's own bubbles so the inline
          messages above are the only ones, rather than two validation systems
          disagreeing in two visual languages. The `type` and `autocomplete`
          attributes stay: they are what give a phone the right keyboard and
          the address book, and they do that whether or not validation runs. */}

      <div>
        <label className={labelClass} htmlFor={fieldId('name')}>
          Your name
        </label>
        <input
          aria-describedby={errors.name ? errorId('name') : undefined}
          aria-invalid={errors.name ? true : undefined}
          autoComplete="name"
          className={`mt-1.5 ${fieldClass(!!errors.name)}`}
          id={fieldId('name')}
          name="name"
          onBlur={revalidate}
          type="text"
        />
        <FieldError id={errorId('name')}>{errors.name}</FieldError>
      </div>

      <div>
        <label className={labelClass} htmlFor={fieldId('email')}>
          Email
        </label>
        <span className={hintClass} id={hintId('email')}>
          The address we reply to. Nothing else is sent here.
        </span>
        <input
          aria-describedby={
            errors.email
              ? `${hintId('email')} ${errorId('email')}`
              : hintId('email')
          }
          aria-invalid={errors.email ? true : undefined}
          autoComplete="email"
          className={`mt-1.5 ${fieldClass(!!errors.email)}`}
          id={fieldId('email')}
          inputMode="email"
          name="email"
          onBlur={revalidate}
          type="email"
        />
        <FieldError id={errorId('email')}>{errors.email}</FieldError>
      </div>

      <div>
        <label className={labelClass} htmlFor={fieldId('subject')}>
          What is this about?
        </label>
        <select
          className={`mt-1.5 ${fieldClass(false)}`}
          defaultValue={subjects[0]}
          id={fieldId('subject')}
          name="subject"
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor={fieldId('message')}>
          Message
        </label>
        <span className={hintClass} id={hintId('message')}>
          If it is about a deployment, the more concrete the better — what you
          ran, what happened, and what you expected.
        </span>
        <textarea
          aria-describedby={
            errors.message
              ? `${hintId('message')} ${errorId('message')}`
              : hintId('message')
          }
          aria-invalid={errors.message ? true : undefined}
          className={`mt-1.5 min-h-40 resize-y ${fieldClass(!!errors.message)}`}
          id={fieldId('message')}
          name="message"
          onBlur={revalidate}
          rows={6}
        />
        <FieldError id={errorId('message')}>{errors.message}</FieldError>
      </div>

      <Honeypot id={fieldId('company')} />

      {/* The live region is always in the DOM rather than mounted on failure:
          a region that appears at the same moment its text does is frequently
          missed by screen readers, which need it present to observe it. */}
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
        {sending ? 'Sending your message…' : ''}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--vendra-accent-strong)] bg-[var(--vendra-accent-strong)] px-5 text-sm font-semibold text-[var(--vendra-on-accent)] shadow-[var(--vendra-glow-sm)] transition hover:border-[var(--vendra-accent)] hover:bg-[var(--vendra-accent)] hover:shadow-[var(--vendra-glow-md)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={sending}
          type="submit"
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
        <p className="text-[0.8125rem] text-[var(--vendra-fg-subtle)]">
          We reply from a small team, usually within a couple of working days.
        </p>
      </div>
    </form>
  )
}
