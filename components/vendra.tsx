/**
 * Vendra documentation design system.
 *
 * Every component here is registered globally in `mdx-components.tsx`, so MDX
 * pages use them without imports. Components take array props rather than
 * nested JSX children wherever possible — MDX indentation rules make deeply
 * nested markup fragile.
 *
 * The prop types below are enforced for `.tsx` callers and in the editor, but
 * `tsc` does not typecheck `.mdx`, which is where almost every call site lives.
 * Anything that must not be got wrong silently is therefore also validated at
 * runtime: pages are prerendered, so a bad prop fails `next build` rather than
 * rendering something subtly wrong in production.
 */

import type { ReactNode } from 'react'
import Link from 'next/link'

/* The shared eyebrow. `label` is the site-wide utility defined in
   `globals.css` — mono, uppercase, one tracking value — so a docs eyebrow and
   a marketing eyebrow are the same object rather than two that happen to
   resemble each other. Only the colour is added here. */
const eyebrowClass = 'label text-[var(--vendra-fg-subtle)]'

/* -------------------------------------------------------------------------- */
/* Page furniture                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Introductory paragraph directly under a page heading.
 *
 * Renders a <div>, not a <p>: MDX wraps block children in their own <p>, and a
 * <p> inside a <p> is invalid HTML that breaks hydration. The inner paragraph
 * inherits this element's typography from the parent utility classes.
 */
export function Lede({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 max-w-184 text-[1.0625rem] leading-7 text-[var(--vendra-fg-muted)] [&>p]:m-0 [&>p]:text-inherit [&>p]:leading-inherit [&>p]:text-inherit">
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

const tones = {
  neutral:
    'border-[var(--vendra-line-strong)] bg-[var(--vendra-muted)] text-[var(--vendra-fg-muted)]',
  emerald:
    'border-[color-mix(in_srgb,var(--vendra-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--vendra-accent)_12%,transparent)] text-[var(--vendra-accent-text)]',
  amber:
    'border-amber-600/30 bg-amber-500/12 text-amber-700 dark:text-amber-300',
  red: 'border-red-600/30 bg-red-500/12 text-red-700 dark:text-red-300'
} as const

export type Tone = keyof typeof tones

/**
 * Resolves a tone to its class, rejecting unknown values.
 *
 * A silent fallback to `neutral` was the failure mode worth closing: a typo
 * such as `tone="emerlad"` renders a plausible-looking grey pill, so a status
 * meant to read as "supported" quietly reads as "no opinion" instead.
 */
function toneClass(tone: Tone): string {
  const className = tones[tone]
  if (!className) {
    throw new Error(
      `<Tag tone="${tone}"> is not a known tone. Use one of: ${Object.keys(tones).join(', ')}.`
    )
  }
  return className
}

/** Inline status pill, e.g. <Tag tone="emerald">Public</Tag> */
export function Tag({
  children,
  tone = 'neutral'
}: {
  children: ReactNode
  tone?: Tone
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass(tone)}`}
    >
      {children}
    </span>
  )
}

/** Row of pills. Pass `dot` for the accent marker used in the hero. */
export function ChipRow({
  items,
  className = '',
  dot = false
}: {
  items: string[]
  className?: string
  dot?: boolean
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map(item => (
        <span
          key={item}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--vendra-line-strong)] bg-[var(--vendra-surface-raised)] px-3 py-1.5 text-[0.8125rem] leading-5 font-medium text-[var(--vendra-fg-muted)]"
        >
          {dot ? (
            <span className="size-2 shrink-0 rounded-full bg-[var(--vendra-accent)]" />
          ) : null}
          {item}
        </span>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

/** Bordered surface with an optional title. */
export function Panel({
  title,
  children,
  className = ''
}: {
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`mt-5 rounded-2xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] p-5 ${className}`}
    >
      {title ? <div className={`${eyebrowClass} mb-4`}>{title}</div> : null}
      {children}
    </div>
  )
}

export type HeroAction = {
  href: string
  label: string
  primary?: boolean
}

/** Landing hero. */
export function Hero({
  eyebrow,
  title,
  children,
  actions,
  chips
}: {
  eyebrow?: ReactNode
  title: ReactNode
  children: ReactNode
  actions?: HeroAction[]
  chips?: string[]
}) {
  return (
    <div className="relative isolate mt-6 overflow-hidden rounded-3xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] p-8 before:absolute before:inset-0 before:-z-2 before:bg-[linear-gradient(to_right,var(--vendra-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--vendra-line)_1px,transparent_1px)] before:bg-size-[56px_56px] before:[mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_30%,transparent_75%)] after:absolute after:inset-[-40%_40%_40%_-20%] after:-z-1 after:bg-[radial-gradient(circle,hsla(var(--nextra-primary-hue),var(--nextra-primary-saturation),var(--nextra-primary-lightness),0.16),transparent_65%)] md:p-12">
      {eyebrow ? <div className={eyebrowClass}>{eyebrow}</div> : null}
      {/* `data-display` opts this heading out of the `main h1` size in
          `globals.css`, which would otherwise win — see the note there. */}
      <h1
        data-display=""
        className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight text-neutral-950 md:text-display dark:text-neutral-50"
      >
        {title}
      </h1>
      {/* <div>, not <p>: MDX wraps block children in their own paragraph. */}
      <div className="mt-6 max-w-168 text-base leading-7 text-[var(--vendra-fg-muted)] md:text-lg [&>p]:m-0 [&>p]:text-inherit [&>p]:leading-inherit [&>p]:text-inherit">
        {children}
      </div>
      {actions?.length ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {actions.map(action => (
            <Link
              key={action.href}
              href={action.href}
              // The pill shape is this component's own — a docs hero, not a
              // marketing band — but the colours are the same accent pair the
              // marketing buttons use (`actionButtonClass` in
              // `components/marketing.tsx`). They were a third hardcoded copy
              // of `neutral-950`/`neutral-50`, outside the token layer and
              // therefore immune to a brand-hue change, which is the drift the
              // accent tokens exist to prevent.
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${action.primary ? 'border-[var(--vendra-accent-strong)] bg-[var(--vendra-accent-strong)] text-[var(--vendra-on-accent)] hover:border-[var(--vendra-accent)] hover:bg-[var(--vendra-accent)]' : 'border-[var(--vendra-line-strong)] text-[var(--vendra-fg-muted)] hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-fg)]'}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
      {chips?.length ? <ChipRow items={chips} className="mt-10" dot /> : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export type FeatureItem = {
  href: string
  title: ReactNode
  description: ReactNode
  meta?: ReactNode
  icon?: ReactNode
}

/** Primary link grid for section landing pages. */
export function FeatureGrid({
  items,
  cols = 2
}: {
  items: FeatureItem[]
  cols?: 2 | 3
}) {
  return (
    <div
      className={`vendra-grid mt-5 grid gap-3 ${cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}
    >
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className="group block rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] px-5 py-4 text-inherit no-underline transition hover:-translate-y-0.75 hover:border-[var(--vendra-accent)] hover:bg-[var(--vendra-surface-raised)] hover:shadow-[var(--vendra-glow-sm)]"
        >
          <div className="flex items-center gap-3">
            {item.icon ? (
              <span
                className="grid size-8 shrink-0 place-items-center rounded-lg border border-[color-mix(in_srgb,var(--vendra-accent),transparent_70%)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_91%)] font-mono text-[0.65rem] font-bold text-[var(--vendra-accent-text)]"
                aria-hidden="true"
              >
                {item.icon}
              </span>
            ) : null}
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
              <span className="text-[0.9375rem] font-semibold tracking-tight text-[var(--vendra-fg)]">
                {item.title}
              </span>
              <span
                className="text-[var(--vendra-fg-subtle)] transition group-hover:translate-x-0.5 group-hover:text-[var(--vendra-accent-text)]"
                aria-hidden="true"
              >
                →
              </span>
            </div>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-[var(--vendra-fg-muted)]">
            {item.description}
          </p>
          {item.meta ? (
            <div className="mt-3 font-mono text-xs text-[var(--vendra-fg-subtle)]">
              {item.meta}
            </div>
          ) : null}
        </Link>
      ))}
    </div>
  )
}

export type NextStepItem = {
  href: string
  title: ReactNode
  description: ReactNode
}

/** End-of-page continuation links. */
export function NextSteps({
  items,
  title = 'Next'
}: {
  items: NextStepItem[]
  title?: ReactNode
}) {
  return (
    <div className="mt-12 border-t border-[var(--vendra-line)] pt-6">
      <div className={`${eyebrowClass} mb-4`}>{title}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] px-5 py-4 no-underline transition hover:border-[var(--vendra-accent)] hover:bg-[var(--vendra-surface-raised)]"
          >
            <span className="inline-flex items-center justify-between gap-3 font-semibold text-[var(--vendra-fg)]">
              {item.title}
              <span
                className="text-[var(--vendra-fg-subtle)] transition group-hover:translate-x-0.5 group-hover:text-[var(--vendra-accent-text)]"
                aria-hidden="true"
              >
                →
              </span>
            </span>
            <span className="mt-1.5 text-sm leading-6 text-[var(--vendra-fg-muted)]">
              {item.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Structured content                                                         */
/* -------------------------------------------------------------------------- */

export type StepItem = {
  title: ReactNode
  body?: ReactNode
}

/** Numbered procedure rendered as a connected timeline. */
export function Steps({ items }: { items: StepItem[] }) {
  return (
    <ol className="mt-5 m-0 list-none p-0">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative grid grid-cols-[1.75rem_1fr] gap-3.5 pb-6 last:pb-0 not-last:before:absolute not-last:before:top-8 not-last:before:bottom-1 not-last:before:left-3.5 not-last:before:w-px not-last:before:bg-[var(--vendra-line-strong)]"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--vendra-line-strong)] bg-[var(--vendra-surface-raised)] text-xs font-semibold text-[var(--vendra-accent-text)]">
            {i + 1}
          </span>
          <div className="pt-0.75">
            <div className="text-[0.9375rem] font-semibold text-[var(--vendra-fg)]">
              {item.title}
            </div>
            {item.body ? (
              <p className="mt-1 text-sm leading-6 text-[var(--vendra-fg-muted)]">
                {item.body}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

export type DefItem = {
  term: string
  description: ReactNode
  meta?: ReactNode
  tag?: { tone?: Tone; label: ReactNode }
}

/**
 * Reference list for keys, variables, and fields. Reads better than a
 * three-column table at narrow widths, where descriptions get crushed.
 */
export function DefList({ items }: { items: DefItem[] }) {
  return (
    <dl className="mt-5 overflow-hidden rounded-[0.875rem] border border-[var(--vendra-line)]">
      {items.map(item => (
        <div
          key={item.term}
          className="border-t border-[var(--vendra-line)] px-4.5 py-3.5 first:border-t-0"
        >
          <dt className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-[0.8125rem] font-semibold whitespace-normal text-[var(--vendra-fg)]">
              {item.term}
            </code>
            {item.tag ? <Tag tone={item.tag.tone}>{item.tag.label}</Tag> : null}
            {item.meta ? (
              <span className="text-xs text-[var(--vendra-fg-subtle)]">
                {item.meta}
              </span>
            ) : null}
          </dt>
          <dd className="mt-1.25 text-sm leading-6 text-[var(--vendra-fg-muted)]">
            {item.description}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export type CommandItem = {
  cmd: string
  description?: ReactNode
}

/** Command reference: each entry is an invocation plus what it does. */
export function CommandList({ items }: { items: CommandItem[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-[0.875rem] border border-[var(--vendra-line)]">
      {items.map(item => (
        <div
          key={item.cmd}
          className="grid items-baseline gap-x-5 gap-y-1 border-t border-[var(--vendra-line)] px-4.5 py-3 first:border-t-0 md:grid-cols-[minmax(0,22rem)_1fr]"
        >
          <code className="overflow-wrap-anywhere font-mono text-[0.8125rem] whitespace-normal text-[var(--vendra-fg)]">
            {item.cmd}
          </code>
          {item.description ? (
            <span className="text-sm leading-6 text-[var(--vendra-fg-muted)]">
              {item.description}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/**
 * A request/data path rendered as monospace nodes joined by arrows.
 * Replaces hand-drawn ASCII diagrams, which do not reflow on small screens.
 */
export function Flow({ nodes, label }: { nodes: string[]; label?: ReactNode }) {
  return (
    <div>
      {label ? (
        <div className="mb-2 text-xs font-medium text-[var(--vendra-fg-subtle)]">
          {label}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 font-mono text-[0.8125rem] leading-6">
        {nodes.map((node, i) => (
          <span key={node} className="contents">
            {i > 0 ? (
              <span
                className="text-[var(--vendra-fg-subtle)] select-none"
                aria-hidden="true"
              >
                →
              </span>
            ) : null}
            <span className="whitespace-nowrap rounded-lg border border-[var(--vendra-line-strong)] bg-[var(--vendra-surface-raised)] px-2.5 py-1 text-[var(--vendra-fg)]">
              {node}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export type StatItem = {
  label: string
  value: ReactNode
}

/** Grid of label/value pairs for "at a glance" summaries. */
export function StatRow({ items }: { items: StatItem[] }) {
  return (
    <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-[var(--vendra-line)] bg-[var(--vendra-line)] sm:grid-cols-2 lg:grid-cols-4">
      {items.map(item => (
        <div key={item.label} className="bg-white p-5 dark:bg-neutral-950">
          <div className="text-2xl font-semibold tracking-[-0.02em] text-[var(--vendra-fg)]">
            {item.value}
          </div>
          <div className="mt-1 text-sm text-[var(--vendra-fg-subtle)]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Two-column comparison of what a boundary does and does not cover.
 */
export function Boundary({
  dos,
  donts,
  doTitle = 'Does',
  dontTitle = 'Does not'
}: {
  dos: string[]
  donts: string[]
  doTitle?: ReactNode
  dontTitle?: ReactNode
}) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-[color-mix(in_srgb,var(--vendra-accent),transparent_65%)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_95%)] p-5">
        <div className="text-sm font-semibold text-[var(--vendra-accent-text)]">
          {doTitle}
        </div>
        <ul className="mt-3 list-none space-y-2 p-0 text-sm leading-6 text-[var(--vendra-fg-muted)] [&>li]:relative [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-[var(--vendra-fg-subtle)] [&>li]:before:content-['·']">
          {dos.map(d => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] p-5">
        <div className="text-sm font-semibold text-[var(--vendra-fg)]">
          {dontTitle}
        </div>
        <ul className="mt-3 list-none space-y-2 p-0 text-sm leading-6 text-[var(--vendra-fg-muted)] [&>li]:relative [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-[var(--vendra-fg-subtle)] [&>li]:before:content-['·']">
          {donts.map(d => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
