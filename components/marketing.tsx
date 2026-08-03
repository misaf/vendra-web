/**
 * Blocks for the marketing surface: the landing page, `/pro`, and the three
 * galleries.
 *
 * Kept separate from `components/vendra.tsx`, which is the in-page vocabulary
 * documentation authors use inside MDX. These are page-level compositions —
 * wider, louder, and deliberately not registered as global MDX components, so a
 * docs page cannot accidentally drop a pricing table into a reference section.
 *
 * Styling uses Tailwind utilities directly. Global CSS is reserved for shared
 * tokens and the few diagrams/effects that need complex selectors.
 */

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { TeamMember } from '../lib/team'
import type { Customer, CustomerMark } from '../lib/customers'
import { HeroCanvas } from './hero-canvas'

/* -------------------------------------------------------------------------- */
/* Page furniture                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Full-bleed section band. The marketing pages run outside the docs content
 * column, so each section owns its own width and rhythm.
 */
export function Section({
  children,
  eyebrow,
  title,
  lede,
  tone = 'plain',
  align = 'left'
}: {
  children?: ReactNode
  eyebrow?: string
  title?: ReactNode
  lede?: ReactNode
  tone?: 'plain' | 'muted'
  align?: 'left' | 'center'
}) {
  return (
    <section
      className={`relative py-18 ${tone === 'muted' ? 'border-y border-[var(--vendra-line)] bg-[var(--vendra-muted)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(var(--vendra-line)_1px,transparent_1px),linear-gradient(90deg,var(--vendra-line)_1px,transparent_1px)] before:bg-size-[3rem_3rem] before:opacity-22 before:[mask-image:radial-gradient(circle_at_50%_50%,black,transparent_75%)]' : ''}`}
    >
      <div className="relative mx-auto w-full max-w-6xl px-6">
        {eyebrow || title || lede ? (
          <header
            className={`mb-10 max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
          >
            {eyebrow ? (
              <div className="text-xs font-semibold tracking-[0.16em] text-[var(--vendra-fg-subtle)] uppercase">
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight font-bold tracking-[-0.035em]">
                {title}
              </h2>
            ) : null}
            {lede ? (
              <p className="mt-4 text-[1.0625rem] leading-7 text-[var(--vendra-fg-subtle)]">
                {lede}
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  )
}

export function Actions({
  items
}: {
  items: {
    href: string
    label: string
    primary?: boolean
    external?: boolean
  }[]
}) {
  const buttonClass = (primary?: boolean) =>
    `inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold no-underline transition ${primary ? 'border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800 dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-300' : 'border-[var(--vendra-line-strong)] text-[var(--vendra-fg-muted)] hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-fg)]'}`

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {items.map(item =>
        item.external ? (
          <a
            key={item.href}
            href={item.href}
            className={buttonClass(item.primary)}
            rel="noreferrer"
            target="_blank"
          >
            {item.label}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={buttonClass(item.primary)}
          >
            {item.label}
          </Link>
        )
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Landing blocks                                                             */
/* -------------------------------------------------------------------------- */

/** The opening band: headline, lede, calls to action, and supporting chips. */
export function LandingHero({
  eyebrow,
  title,
  children,
  actions,
  chips = []
}: {
  eyebrow?: string
  title: ReactNode
  children?: ReactNode
  actions: { href: string; label: string; primary?: boolean }[]
  chips?: string[]
}) {
  return (
    <section className="relative overflow-hidden py-16 min-[36rem]:pt-20 before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(circle_at_12%_-10%,rgb(124_58_237/12%),transparent_32rem),radial-gradient(circle_at_88%_0%,rgb(14_165_233/10%),transparent_28rem)] max-[36rem]:py-12">
      <HeroCanvas />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)] items-center gap-[clamp(2.5rem,6vw,6.5rem)] px-6 max-[64rem]:grid-cols-1">
        <div className="max-[64rem]:max-w-3xl">
          {eyebrow ? (
            <div className="text-xs font-semibold tracking-[0.16em] text-[var(--vendra-fg-subtle)] uppercase">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-4 max-w-[17ch] text-[clamp(2.25rem,6vw,4rem)] leading-[1.03] font-[750] tracking-[-0.045em]">
            {title}
          </h1>
          {children ? (
            <div className="mt-6 max-w-160 text-lg leading-[1.8] text-[var(--vendra-fg-subtle)]">
              {children}
            </div>
          ) : null}
          <Actions items={actions} />
          {chips.length ? (
            <div className="mt-9 flex flex-wrap gap-2">
              {chips.map(chip => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--vendra-line-strong)] bg-[var(--vendra-surface-raised)] px-3 py-1.5 text-[0.8125rem] leading-5 font-medium text-[var(--vendra-fg-muted)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <HeroArchitecture />
      </div>
    </section>
  )
}

const heroSystems = [
  {
    href: '/docs/platform',
    index: '01',
    label: 'Platform',
    tech: 'Laravel',
    role: 'Business state'
  },
  {
    href: '/docs/controller',
    index: '02',
    label: 'Controller',
    tech: 'Go',
    role: 'Runtime state'
  },
  {
    href: '/docs/storefront',
    index: '03',
    label: 'Storefront',
    tech: 'Next.js',
    role: 'Presentation'
  }
]

function HeroArchitecture() {
  return (
    <div
      className="relative w-full max-w-xl rounded-[1.25rem] border border-[var(--vendra-line-strong)] bg-[linear-gradient(var(--vendra-surface-raised),var(--vendra-surface-raised))_padding-box,linear-gradient(145deg,rgb(124_58_237/35%),rgb(16_185_129/15%))_border-box] p-3 shadow-[0_30px_80px_-45px_rgb(18_18_30/55%)] backdrop-blur-2xl before:absolute before:inset-[2rem_12%_1rem] before:-z-1 before:bg-[var(--vendra-accent)] before:opacity-10 before:blur-[5rem]"
      aria-label="Vendra system architecture"
    >
      <div className="flex items-center justify-between gap-4 px-1 pt-1.5 pb-3.5 text-[0.6875rem] font-bold tracking-[0.08em] text-[var(--vendra-fg-subtle)] uppercase max-[36rem]:flex-col max-[36rem]:items-start max-[36rem]:gap-1.5">
        <span>One system</span>
        <span className="inline-flex items-center gap-1.5">
          <i
            className="size-[0.45rem] rounded-full bg-[var(--vendra-accent)] shadow-[0_0_0.75rem_var(--vendra-accent)] [animation:vw-status-pulse_2.4s_ease-in-out_infinite]"
            aria-hidden="true"
          />{' '}
          Three clear boundaries
        </span>
      </div>
      <div className="flex flex-col">
        {heroSystems.map((system, index) => (
          <div key={system.href}>
            <Link
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[0.85rem] border border-[var(--vendra-line)] bg-[color-mix(in_srgb,var(--vendra-surface-raised),transparent_8%)] p-4 transition hover:translate-x-0.75 hover:border-[color-mix(in_srgb,var(--vendra-accent),transparent_25%)] hover:shadow-[0_12px_30px_-24px_var(--vendra-accent)]"
              href={system.href}
            >
              <span className="grid size-8 place-items-center rounded-[0.55rem] bg-[var(--vendra-muted)] font-mono text-[0.7rem] font-[750] text-[var(--vendra-accent)]">
                {system.index}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="text-[0.925rem] tracking-[-0.015em]">
                  {system.label}
                </strong>
                <small className="text-xs text-[var(--vendra-fg-subtle)]">
                  {system.role}
                </small>
              </span>
              <span className="font-mono text-[0.6875rem] text-[var(--vendra-fg-muted)] max-[36rem]:hidden">
                {system.tech}
              </span>
            </Link>
            {index < heroSystems.length - 1 ? (
              <div
                className="relative ml-4 grid h-7 w-8 place-items-center text-[var(--vendra-accent)]"
                aria-hidden="true"
              >
                <span className="absolute h-full w-px bg-[var(--vendra-line-strong)]" />
                <b
                  className={`z-1 rotate-90 bg-[var(--vendra-surface-raised)] p-0.5 text-xs [animation:vw-flow-step_2.4s_ease-in-out_infinite] ${index === 1 ? '[animation-delay:0.8s]' : ''}`}
                >
                  →
                </b>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div
        className="flex items-center justify-between gap-4 px-1 pt-3.5 pb-1 text-[0.6875rem] font-bold tracking-[0.04em] text-[var(--vendra-fg-subtle)]"
        aria-hidden="true"
      >
        <span>merchant intent</span>
        <i className="h-px flex-1 bg-linear-to-r from-transparent via-[var(--vendra-line-strong)] to-transparent" />
        <span>customer experience</span>
      </div>
    </div>
  )
}

/**
 * The stack diagram that stands in for React Flow's live editor.
 *
 * Static rather than interactive on purpose: the thing being sold here is an
 * architecture, and an animated widget that does not represent a real system
 * would be decoration. Each tier links to the reference that describes it.
 */
export function StackDiagram({
  tiers
}: {
  tiers: {
    href: string
    label: string
    role: string
    detail: string
    tech: string
  }[]
}) {
  return (
    <div
      className="flex flex-col items-stretch min-[60rem]:grid min-[60rem]:grid-cols-3 min-[60rem]:gap-4"
      role="list"
    >
      {tiers.map((tier, i) => (
        <div className="min-[60rem]:contents" key={tier.href} role="listitem">
          <Link
            href={tier.href}
            className="block rounded-[0.9rem] border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] px-6 py-5 transition hover:-translate-y-0.5 hover:border-[var(--vendra-accent)]"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[1.05rem] font-[650] tracking-[-0.02em]">
                {tier.label}
              </span>
              <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[var(--vendra-line-strong)] bg-[var(--vendra-muted)] px-2 py-0.5 text-xs font-medium text-[var(--vendra-fg-muted)]">
                {tier.tech}
              </span>
            </div>
            <div className="mt-1.5 text-[0.8125rem] font-semibold tracking-[0.04em] text-[var(--vendra-fg-subtle)] uppercase">
              {tier.role}
            </div>
            <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-[var(--vendra-fg-subtle)]">
              {tier.detail}
            </p>
            <div
              className={`mt-4 grid h-18 gap-1.5 overflow-hidden rounded-[0.6rem] border border-[var(--vendra-line)] bg-[var(--vendra-muted)] p-2.5 [&>span]:block [&>span]:min-h-1.5 [&>span]:rounded-full [&>span]:bg-[var(--vendra-line-strong)] ${i === 1 ? 'grid-cols-3' : i === 2 ? 'grid-cols-[0.55fr_1.45fr]' : 'grid-cols-[1.3fr_0.8fr]'}`}
              aria-hidden="true"
            >
              <span
                className={`${i === 1 ? '!col-span-3' : '!row-span-3'} !rounded-md !bg-[linear-gradient(145deg,color-mix(in_srgb,var(--vendra-accent),transparent_72%),color-mix(in_srgb,#7c3aed,transparent_82%))]`}
              />
              <span />
              <span />
              <span />
            </div>
          </Link>
          {i < tiers.length - 1 ? (
            <div
              className="py-2 text-center text-[var(--vendra-fg-subtle)] min-[60rem]:hidden"
              aria-hidden="true"
            >
              ↓
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/** Alternating editorial rows for the architectural reasons behind Vendra. */
export function FeatureSplit({
  eyebrow,
  index,
  title,
  children,
  points = [],
  action,
  flip = false
}: {
  eyebrow?: string
  index?: string
  title: ReactNode
  children?: ReactNode
  points?: string[]
  action?: { href: string; label: string }
  flip?: boolean
}) {
  return (
    <div className="group relative grid items-start gap-10 border-t border-[var(--vendra-line)] py-14 first:border-t-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:gap-20">
      <div className={flip ? 'lg:order-2' : ''}>
        {eyebrow || index ? (
          <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] uppercase">
            {index ? (
              <span className="font-mono tracking-normal text-[var(--vendra-accent)]">
                {index}
              </span>
            ) : null}
            {eyebrow ? (
              <span className="text-[var(--vendra-fg-subtle)]">{eyebrow}</span>
            ) : null}
          </div>
        ) : null}
        <h3 className="mt-3 max-w-xl text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold tracking-[-0.03em]">
          {title}
        </h3>
        {children ? (
          <div className="mt-3 leading-7 text-[var(--vendra-fg-subtle)]">
            {children}
          </div>
        ) : null}
        {action ? (
          <Link
            className="group mt-5 inline-flex gap-1.5 text-[0.9375rem] font-semibold hover:text-[var(--vendra-accent)]"
            href={action.href}
          >
            {action.label} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
      <ul className="m-0 overflow-hidden rounded-2xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] p-0 shadow-[0_18px_45px_-42px_var(--vendra-fg)]">
        {points.map(point => (
          <li
            className="relative border-t border-[var(--vendra-line)] py-4 pr-5 pl-11 text-[0.9375rem] leading-6 first:border-t-0 before:absolute before:top-[1.4rem] before:left-5 before:size-1.5 before:rounded-full before:bg-[var(--vendra-accent)] before:shadow-[0_0_0_4px_color-mix(in_srgb,var(--vendra-accent),transparent_88%)]"
            key={point}
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The inline marks a logotype can be drawn with.
 *
 * Hand-written SVG paths on a 24×24 box, stroked in `currentColor` so each one
 * inherits the logotype's colour and the theme's foreground without a second
 * set of dark-mode rules. No image files: see the note in `lib/customers.ts`.
 */
const customerMarks: Record<CustomerMark, ReactNode> = {
  // A three-petal bloom on a stem — florist. Petals are plain circles rather
  // than drawn curves: at 1.6rem anything more detailed turns to mush.
  bloom: (
    <>
      <circle cx="12" cy="6.4" r="2.6" />
      <circle cx="16.2" cy="10.2" r="2.6" />
      <circle cx="7.8" cy="10.2" r="2.6" />
      <path d="M12 20v-7" />
      <path d="M12 17c-1.9 0-3.3-1.1-3.9-2.7" />
    </>
  ),
  // Two arrows crossing in opposite directions — import and export.
  trade: (
    <>
      <path d="M4 9h13" />
      <path d="M13.5 5.5 17 9l-3.5 3.5" />
      <path d="M20 15H7" />
      <path d="M10.5 11.5 7 15l3.5 3.5" />
    </>
  ),
  // A single leaf with its vein — floral art, quieter than the bloom.
  leaf: (
    <>
      <path d="M19 5c0 7.2-3.9 11.4-9.4 11.4A5.6 5.6 0 0 1 4 10.8C4 6.5 9.1 5 19 5Z" />
      <path d="M16 8c-4.4 1.6-7.6 4.9-9.5 10" />
    </>
  ),
  // A fast shield/track mark — sport and forward motion.
  sport: (
    <>
      <path d="M12 3.5 20 7v5.2c0 4.1-3.2 7-8 8.3-4.8-1.3-8-4.2-8-8.3V7l8-3.5Z" />
      <path d="m8 14 3-5 1.6 3H16" />
      <path d="M7 16h8" />
    </>
  )
}

/**
 * "Used by" wall.
 *
 * Each business is set as a logotype in the site's own typography — a mark, the
 * lead word, and a tracked line under it — rather than as an uploaded logo
 * file. That keeps the wall sharp at any size, correct in both themes, and free
 * of image weight, and it means a business can go up without anyone chasing a
 * vector file first. The three marks differ enough that the entries do not read
 * as one repeated shape.
 *
 * A wall of customer names is read as an endorsement, so only businesses that
 * have agreed to appear belong in `lib/customers.ts`.
 */
export function LogoWall({ customers }: { customers: Customer[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
      {customers.map(customer => {
        // A plain <a>, not next/link: these are other people's sites, so there
        // is no route to prefetch and nothing for `basePath` to rewrite.
        const Tag = customer.href ? 'a' : 'div'
        return (
          <Tag
            className="group flex items-center gap-2.5 text-[var(--vendra-fg-subtle)] transition-colors hover:text-[var(--vendra-fg)]"
            key={customer.name}
            title={customer.name}
            {...(customer.href
              ? {
                  href: customer.href,
                  target: '_blank',
                  rel: 'noopener noreferrer'
                }
              : {})}
          >
            <svg
              className="size-6 shrink-0 opacity-85 transition group-hover:text-[var(--vendra-accent)] group-hover:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {customerMarks[customer.mark]}
            </svg>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">
                {customer.lead}
              </span>
              {customer.sub ? (
                <span className="mt-1 text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-80">
                  {customer.sub}
                </span>
              ) : null}
            </span>
          </Tag>
        )
      })}
    </div>
  )
}

/** Quickstart command block. */
export function Quickstart({
  steps
}: {
  steps: { label: string; command: string }[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {steps.map(step => (
        <div key={step.command}>
          <div className="mb-2 text-xs font-bold tracking-[0.12em] text-[var(--vendra-fg-subtle)] uppercase">
            {step.label}
          </div>
          <pre className="m-0 overflow-x-auto rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-muted)] px-4 py-3.5 font-mono text-[0.8125rem] leading-6">
            <code>{step.command}</code>
          </pre>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Galleries                                                                  */
/* -------------------------------------------------------------------------- */

export type GalleryItem = {
  title: string
  description: string
  href?: string
  tag?: string
  /** Marks an entry that has no destination yet. */
  planned?: boolean
}

/**
 * Card grid behind Examples, UI, and Showcase.
 *
 * An item without an `href` renders as a non-interactive card labelled
 * "Planned", so a gallery can be laid out before its contents exist without
 * shipping links that go nowhere — `check:links` would catch those anyway.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4">
      {items.map(item => {
        const body = (
          <>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight">
                {item.title}
              </h3>
              {item.tag ? (
                <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[var(--vendra-line-strong)] bg-[var(--vendra-muted)] px-2 py-0.5 text-xs font-medium text-[var(--vendra-fg-muted)]">
                  {item.tag}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--vendra-fg-subtle)]">
              {item.description}
            </p>
            {item.planned ? (
              <span className="mt-3 self-start rounded-md border border-dashed border-[var(--vendra-line)] px-2 py-0.5 text-xs">
                Planned
              </span>
            ) : null}
          </>
        )

        return item.href ? (
          <Link
            key={item.title}
            href={item.href}
            className="flex flex-col rounded-xl border border-[var(--vendra-line)] px-5 py-4 transition hover:-translate-y-0.5 hover:border-[var(--vendra-accent)]"
          >
            {body}
          </Link>
        ) : (
          <div
            key={item.title}
            className="flex flex-col rounded-xl border border-dashed border-[var(--vendra-line)] px-5 py-4 opacity-75"
          >
            {body}
          </div>
        )
      })}
    </div>
  )
}

/** Grouped gallery, for Examples' by-category layout. */
export function GalleryGroup({
  groups
}: {
  groups: { title: string; description?: string; items: GalleryItem[] }[]
}) {
  return (
    <div className="flex flex-col gap-12">
      {groups.map(group => (
        <div key={group.title}>
          <h3 className="text-xl font-bold tracking-tight">{group.title}</h3>
          {group.description ? (
            <p className="mt-1.5 mb-5 text-[0.9375rem] leading-7 text-[var(--vendra-fg-subtle)]">
              {group.description}
            </p>
          ) : null}
          <Gallery items={group.items} />
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Pro                                                                        */
/* -------------------------------------------------------------------------- */

export type Plan = {
  name: string
  price: string
  cadence?: string
  summary: string
  features: string[]
  cta: { href: string; label: string }
  featured?: boolean
}

/**
 * Pricing tiers.
 *
 * The component takes prices as opaque strings so a tier can read "Free" or
 * "Let's talk" alongside "€10" without special-casing. The figures themselves
 * live in `app/pro/page.tsx`, next to the TODO block that tracks what on that
 * page is still unbuilt.
 */
export function PricingTable({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={`relative flex flex-col rounded-2xl border p-6 ${plan.featured ? 'border-[var(--vendra-accent)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_95%)] shadow-[0_20px_50px_-35px_var(--vendra-accent)]' : 'border-[var(--vendra-line)] bg-[var(--vendra-surface)]'}`}
        >
          {plan.featured ? (
            <div className="absolute -top-3 left-5 rounded-full bg-[var(--vendra-accent)] px-3 py-1 text-xs font-bold text-white">
              Most popular
            </div>
          ) : null}
          <h3 className="text-lg font-bold tracking-tight">{plan.name}</h3>
          <div className="mt-4 text-3xl font-bold tracking-tight">
            {plan.price}
            {plan.cadence ? (
              <span className="ml-1 text-sm font-normal text-[var(--vendra-fg-subtle)]">
                {plan.cadence}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--vendra-fg-subtle)]">
            {plan.summary}
          </p>
          <ul className="my-5 flex flex-1 list-none flex-col gap-2 p-0 text-sm">
            {plan.features.map(feature => (
              <li
                className="flex gap-2 before:text-[var(--vendra-accent)] before:content-['✓']"
                key={feature}
              >
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href={plan.cta.href}
            className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition ${plan.featured ? 'border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800 dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950' : 'border-[var(--vendra-line-strong)] text-[var(--vendra-fg-muted)] hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-fg)]'}`}
          >
            {plan.cta.label}
          </Link>
        </div>
      ))}
    </div>
  )
}

/** A standout notice — used to mark the Pro page's placeholder pricing. */
export function Notice({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-[color-mix(in_srgb,var(--vendra-accent),transparent_55%)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_94%)] p-5">
      <div className="text-sm font-bold text-[var(--vendra-fg)]">{title}</div>
      <div className="mt-2 text-[0.9375rem] leading-7 text-[var(--vendra-fg-subtle)]">
        {children}
      </div>
    </div>
  )
}

/** Question and answer pairs for the Pro FAQ band. */
export function FaqList({
  items
}: {
  items: { question: string; answer: ReactNode }[]
}) {
  return (
    <div className="flex flex-col border-t border-[var(--vendra-line)]">
      {items.map(item => (
        <details
          key={item.question}
          className="group border-b border-[var(--vendra-line)]"
        >
          <summary className="cursor-pointer list-none py-4 text-base font-semibold [&::-webkit-details-marker]:hidden after:float-right after:text-[var(--vendra-fg-subtle)] after:content-['+'] group-open:after:content-['−']">
            {item.question}
          </summary>
          <div className="pb-5 text-[0.9375rem] leading-7 text-[var(--vendra-fg-subtle)]">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The duotone used on the team portraits, as an SVG filter.
 *
 * The portraits are ordinary photographs taken in ordinary rooms; the filter is
 * what makes them look like they belong on the same page. Luminance is
 * flattened to grey, pushed for contrast, then mapped onto a four-stop violet
 * ramp — shadows to near-black, midtones to the brand violet, highlights to a
 * pale lavender. Tailwind pseudo-element utilities add the halftone dither and
 * edge fade on top.
 *
 * Done as a filter rather than by editing the image files so the source
 * photographs stay untouched and replaceable: drop in a new JPEG and it
 * arrives already in the house style, with no export step to remember.
 */
function PortraitFilter() {
  return (
    <svg className="absolute size-0" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="vendra-duotone"
          colorInterpolationFilters="sRGB"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          {/* Rec. 709 luminance, so skin tones and hair separate the way the
              eye expects rather than by raw channel average. */}
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0      0      0      1 0"
          />
          {/* Contrast first: the ramp below has nothing to grip on a flat,
              evenly-lit phone photo. */}
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.35" intercept="-0.18" />
            <feFuncG type="linear" slope="1.35" intercept="-0.18" />
            <feFuncB type="linear" slope="1.35" intercept="-0.18" />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.05 0.29 0.63 0.96" />
            <feFuncG type="table" tableValues="0.04 0.19 0.51 0.94" />
            <feFuncB type="table" tableValues="0.11 0.55 0.87 1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}

function SocialIcon({ label }: { label: string }) {
  const paths: Record<string, ReactNode> = {
    GitHub: (
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    ),
    LinkedIn: (
      <path d="M6.5 8.2H3.2V19h3.3V8.2ZM4.85 3A1.92 1.92 0 1 0 4.85 6.84 1.92 1.92 0 0 0 4.85 3ZM19.2 12.8c0-3.25-1.73-4.76-4.04-4.76a3.5 3.5 0 0 0-3.17 1.74V8.2H8.7V19H12v-5.35c0-1.41.27-2.78 2.02-2.78 1.73 0 1.75 1.62 1.75 2.87V19h3.3l.13-6.2Z" />
    ),
    Instagram: (
      <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm-.18 2A3.02 3.02 0 0 0 4 7.02v9.96A3.02 3.02 0 0 0 7.02 20h9.96A3.02 3.02 0 0 0 20 16.98V7.02A3.02 3.02 0 0 0 16.98 4H7.02ZM17.5 5.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    ),
    YouTube: (
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    )
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5 shrink-0 fill-current"
    >
      {paths[label]}
    </svg>
  )
}

/**
 * The people behind Vendra.
 *
 * Deliberately distinct from `LogoWall`, which is the customer social-proof
 * band ("used by"). Faces belong here and names of companies belong there;
 * putting a person in the logo wall would read as that person's employer
 * endorsing the product.
 *
 * Portraits are plain <img> at 2x the rendered size, cropped square at build
 * time rather than by CSS, so the circle never crops a face badly on a narrow
 * viewport.
 */
export function TeamGrid({ members }: { members: TeamMember[] }) {
  const socialHover: Record<string, string> = {
    GitHub: 'hover:border-[#6e7681] hover:text-[var(--vendra-fg)]',
    LinkedIn: 'hover:border-[#0a66c2] hover:text-[#0a66c2]',
    Instagram: 'hover:border-[#d946ef] hover:text-[#c026d3]',
    YouTube: 'hover:border-[#ff0033] hover:text-[#e6002e]'
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-[repeat(auto-fit,minmax(17rem,1fr))] gap-6">
      <PortraitFilter />
      {members.map(member => {
        return (
          <div
            key={member.name}
            className="group flex flex-col items-center rounded-2xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] px-6 pt-8 pb-6 text-center transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--vendra-accent),transparent_50%)] hover:shadow-[0_22px_45px_-38px_var(--vendra-accent)]"
          >
            <span className="relative block size-40 overflow-hidden rounded-full transition-transform before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_50%_40%,transparent_42%,rgb(10_6_24/28%)_74%,rgb(10_6_24/70%)_100%)] after:pointer-events-none after:absolute after:inset-0 after:z-2 after:rounded-[inherit] after:bg-[radial-gradient(circle_at_center,rgb(0_0_0/60%)_30%,transparent_31%)] after:bg-size-[3px_3px] after:opacity-60 after:mix-blend-overlay group-hover:scale-[1.025]">
              <img
                className="block size-full object-cover [filter:url(#vendra-duotone)] [mask-image:radial-gradient(circle_at_50%_40%,black_44%,rgb(0_0_0/50%)_68%,transparent_97%)]"
                src={member.photo}
                alt={`${member.name}, ${member.role}`}
                width={320}
                height={320}
                loading="lazy"
                decoding="async"
              />
            </span>
            <div className="mt-4 text-[1.05rem] font-semibold tracking-tight">
              {member.name}
            </div>
            <div className="mt-1 text-xs font-bold tracking-[0.1em] text-[var(--vendra-accent)] uppercase">
              {member.role}
            </div>
            {member.bio ? (
              <p className="mt-2.5 max-w-sm text-sm leading-6 text-[var(--vendra-fg-subtle)]">
                {member.bio}
              </p>
            ) : null}
            {member.links?.length ? (
              <div
                className="mt-4 flex flex-wrap justify-center gap-1.5"
                aria-label={`${member.name}'s profiles`}
              >
                {member.links.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--vendra-line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--vendra-fg-muted)] transition hover:-translate-y-px hover:bg-[var(--vendra-muted)] ${socialHover[link.label] ?? 'hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-fg)]'}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <SocialIcon label={link.label} />
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
