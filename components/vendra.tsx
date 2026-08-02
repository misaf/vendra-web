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

/* -------------------------------------------------------------------------- */
/* Page furniture                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Introductory paragraph directly under a page heading.
 *
 * Renders a <div>, not a <p>: MDX wraps block children in their own <p>, and a
 * <p> inside a <p> is invalid HTML that breaks hydration. The inner paragraph
 * inherits this element's typography — see `.vendra-lede > p` in globals.css.
 */
export function Lede({ children }: { children: ReactNode }) {
  return <div className="vendra-lede">{children}</div>
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

const tones = {
  neutral: 'vendra-tag-neutral',
  emerald: 'vendra-tag-emerald',
  amber: 'vendra-tag-amber',
  red: 'vendra-tag-red'
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
  return <span className={`vendra-tag ${toneClass(tone)}`}>{children}</span>
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
        <span key={item} className="vendra-chip">
          {dot ? <span className="vendra-chip-dot" /> : null}
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
    <div className={`vendra-panel mt-5 p-5 ${className}`}>
      {title ? <div className="vendra-eyebrow mb-4">{title}</div> : null}
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
    <div className="vendra-hero mt-6 p-8 md:p-12">
      {eyebrow ? <div className="vendra-eyebrow">{eyebrow}</div> : null}
      <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 md:text-display dark:text-neutral-50">
        {title}
      </h1>
      {/* <div>, not <p>: MDX wraps block children in their own paragraph. */}
      <div className="vendra-hero-lede">{children}</div>
      {actions?.length ? (
        <div className="mt-8 flex flex-wrap gap-3">
          {actions.map(action => (
            <Link
              key={action.href}
              href={action.href}
              className={`vendra-btn ${action.primary ? 'vendra-btn-primary' : 'vendra-btn-secondary'}`}
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
        <Link key={item.href} href={item.href} className="vendra-feature">
          <div className="flex items-baseline justify-between gap-3">
            <span className="vendra-feature-title">{item.title}</span>
            <span className="vendra-feature-arrow" aria-hidden="true">
              →
            </span>
          </div>
          <p className="vendra-feature-desc">{item.description}</p>
          {item.meta ? (
            <div className="vendra-feature-meta">{item.meta}</div>
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
    <div className="vendra-next mt-12">
      <div className="vendra-eyebrow mb-4">{title}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(item => (
          <Link key={item.href} href={item.href} className="vendra-next-item">
            <span className="vendra-next-title">
              {item.title}
              <span className="vendra-feature-arrow" aria-hidden="true">
                →
              </span>
            </span>
            <span className="vendra-next-desc">{item.description}</span>
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
    <ol className="vendra-steps mt-5">
      {items.map((item, i) => (
        <li key={i} className="vendra-step">
          <span className="vendra-step-marker">{i + 1}</span>
          <div className="vendra-step-body">
            <div className="vendra-step-title">{item.title}</div>
            {item.body ? <p className="vendra-step-desc">{item.body}</p> : null}
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
    <dl className="vendra-deflist mt-5">
      {items.map(item => (
        <div key={item.term} className="vendra-def">
          <dt className="vendra-def-term">
            <code className="vendra-def-code">{item.term}</code>
            {item.tag ? <Tag tone={item.tag.tone}>{item.tag.label}</Tag> : null}
            {item.meta ? (
              <span className="vendra-def-meta">{item.meta}</span>
            ) : null}
          </dt>
          <dd className="vendra-def-desc">{item.description}</dd>
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
    <div className="vendra-commands mt-5">
      {items.map(item => (
        <div key={item.cmd} className="vendra-command">
          <code className="vendra-command-cmd">{item.cmd}</code>
          {item.description ? (
            <span className="vendra-command-desc">{item.description}</span>
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
      {label ? <div className="vendra-flow-label">{label}</div> : null}
      <div className="vendra-flow">
        {nodes.map((node, i) => (
          <span key={node} className="contents">
            {i > 0 ? (
              <span className="vendra-flow-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
            <span className="vendra-flow-node">{node}</span>
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
    <div className="vendra-stats mt-5">
      {items.map(item => (
        <div key={item.label} className="vendra-stat">
          <div className="vendra-stat-value">{item.value}</div>
          <div className="vendra-stat-label">{item.label}</div>
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
      <div className="vendra-boundary vendra-boundary-do">
        <div className="vendra-boundary-title">{doTitle}</div>
        <ul className="vendra-boundary-list">
          {dos.map(d => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
      <div className="vendra-boundary vendra-boundary-dont">
        <div className="vendra-boundary-title">{dontTitle}</div>
        <ul className="vendra-boundary-list">
          {donts.map(d => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
