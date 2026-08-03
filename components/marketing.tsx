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
import { Chevron } from './icons'

/* -------------------------------------------------------------------------- */
/* Page furniture                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Vertical rhythm, as one ordered scale rather than a boolean.
 *
 * `lg` used to be the only step above the default, which meant a page had
 * exactly one lever — "land here" — and no way to say anything quieter. So
 * every band that was not the closing call to action carried identical
 * padding, and the landing page read as a list of equals: three feature
 * splits, a quickstart, a logo wall, and a blog roll, all the same height
 * apart, with no indication which of them was the argument and which were
 * supporting evidence.
 *
 * Four steps, chosen so the section's padding can follow its content's own
 * density instead of contradicting it:
 *
 *   compact  a band whose content is already one tight object — three
 *            command rows, a row of logos. Padding matched to a taller band
 *            just adds air around something that has none.
 *   default  the ordinary case.
 *   loose    a long band that needs room to be read as one argument rather
 *            than as several. The landing product section is this: three
 *            feature splits that otherwise run together.
 *   lg       arrival. Still the one lever that says stop here, so spending it
 *            more than once a page spends it on nothing.
 *
 * The header spacing moves with the step for the same reason the type scale
 * carries its own leading: a `loose` band with a `default` header gap has the
 * heading floating unattached to either neighbour.
 */
const sectionPadding = {
  compact: 'py-10 md:py-12',
  default: 'py-14 md:py-18',
  loose: 'py-18 md:py-24',
  lg: 'py-20 md:py-30'
} as const

const sectionHeaderGap = {
  compact: 'mb-8',
  default: 'mb-10',
  loose: 'mb-14',
  lg: 'mb-10'
} as const

/**
 * Band treatments.
 *
 * `muted` was doing all of the separation on its own, which is why the landing
 * page put the logo wall and the closing call to action in what looked like
 * the same band twice — a repeat rather than a rhythm. `accent` is the second
 * treatment: no dot grid, a wash of the two brand hues bleeding in from the
 * edges, and an accent-tinted rule. It reads as the end of a page rather than
 * as another neutral shelf, and it is the only place on the marketing surface
 * where the brand colour fills space rather than marking it.
 */
const sectionTone = {
  plain: '',
  muted:
    'border-y border-[var(--vendra-line)] bg-[var(--vendra-muted)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(var(--vendra-line)_1px,transparent_1px),linear-gradient(90deg,var(--vendra-line)_1px,transparent_1px)] before:bg-size-[3rem_3rem] before:opacity-30 before:[mask-image:radial-gradient(circle_at_50%_50%,black,transparent_75%)]',
  accent:
    'border-y border-[color-mix(in_srgb,var(--vendra-accent),transparent_78%)] bg-[radial-gradient(ellipse_at_50%_-30%,color-mix(in_srgb,var(--vendra-accent),transparent_86%),transparent_65%),radial-gradient(ellipse_at_50%_130%,color-mix(in_srgb,var(--vendra-accent-2),transparent_90%),transparent_60%)]'
} as const

/**
 * Full-bleed section band. The marketing pages run outside the docs content
 * column, so each section owns its own width and rhythm.
 */
export function Section({
  children,
  eyebrow,
  title,
  lede,
  actions,
  tone = 'plain',
  align = 'left',
  size = 'default'
}: {
  children?: ReactNode
  eyebrow?: string
  title?: ReactNode
  lede?: ReactNode
  /** Calls to action under the lede — closing bands, mostly. */
  actions?: ActionItem[]
  /** See `sectionTone`. */
  tone?: keyof typeof sectionTone
  align?: 'left' | 'center'
  /** See `sectionPadding`. */
  size?: keyof typeof sectionPadding
}) {
  return (
    <section
      className={`relative ${sectionPadding[size]} ${sectionTone[tone]}`}
    >
      <div className="relative mx-auto w-full max-w-6xl px-6">
        {eyebrow || title || lede ? (
          <header
            className={`${sectionHeaderGap[size]} max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
          >
            {eyebrow ? (
              <div className="text-xs font-semibold tracking-[0.16em] text-[var(--vendra-fg-subtle)] uppercase">
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <h2
                className={`font-display text-title font-bold ${eyebrow ? 'mt-3' : ''}`}
              >
                {title}
              </h2>
            ) : null}
            {lede ? (
              <p className="mt-4 text-[1.0625rem] leading-7 text-[var(--vendra-fg-muted)]">
                {lede}
              </p>
            ) : null}
            {actions?.length ? <Actions align={align} items={actions} /> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  )
}

export type ActionItem = {
  href: string
  label: string
  primary?: boolean
  external?: boolean
}

/**
 * The button style, shared by every call to action on the marketing surface.
 *
 * A module-level function rather than one defined inside `Actions`, because
 * `PricingTable` draws the same button and used to carry its own copy of these
 * classes. The copy was still the hardcoded `neutral-950`/`neutral-50` pair
 * after `Actions` moved onto the accent tokens, so `/pro` shipped two primary
 * buttons that no longer looked alike. One definition, no drift.
 *
 * The primary fill is `--vendra-accent-strong`, not `--vendra-accent`. Every
 * other surface on these pages is accent-aware and the most important click
 * target was the one element that was not; it also sat outside the token layer
 * entirely, so a change to the brand hue would have left it behind. The strong
 * step rather than the accent itself because a 14px semibold label needs 4.5:1
 * against its fill — see the token definition in `globals.css` for the
 * measured numbers on both themes.
 *
 * Hover lightens toward the plain accent rather than darkening further: with a
 * saturated fill, moving away from the page is what reads as a response, and
 * on the dark theme darkening would move it toward the page.
 */
export const actionButtonClass = (primary?: boolean) =>
  `inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold no-underline transition ${primary ? 'border-[var(--vendra-accent-strong)] bg-[var(--vendra-accent-strong)] text-[var(--vendra-on-accent)] shadow-[var(--vendra-glow-sm)] hover:border-[var(--vendra-accent)] hover:bg-[var(--vendra-accent)] hover:shadow-[var(--vendra-glow-md)]' : 'border-[var(--vendra-line-strong)] text-[var(--vendra-fg-muted)] hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-fg)]'}`

export function Actions({
  items,
  align = 'left'
}: {
  items: ActionItem[]
  align?: 'left' | 'center'
}) {
  const buttonClass = actionButtonClass

  return (
    <div
      className={`mt-8 flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}
    >
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
    <section className="relative overflow-hidden py-16 min-[36rem]:pt-20 before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(circle_at_12%_-10%,color-mix(in_srgb,var(--vendra-accent-2),transparent_88%),transparent_32rem),radial-gradient(circle_at_88%_0%,color-mix(in_srgb,var(--vendra-accent-3),transparent_90%),transparent_28rem)] max-[36rem]:py-12">
      <HeroCanvas />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)] items-center gap-[clamp(2.5rem,6vw,6.5rem)] px-6 max-[64rem]:grid-cols-1">
        <div className="max-[64rem]:max-w-3xl">
          {eyebrow ? (
            <div className="text-xs font-semibold tracking-[0.16em] text-[var(--vendra-fg-subtle)] uppercase">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-4 max-w-[17ch] font-display text-hero font-[750]">
            {title}
          </h1>
          {children ? (
            <div className="mt-6 max-w-160 text-lg leading-[1.8] text-[var(--vendra-fg-muted)]">
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
    href: '/docs/storefront',
    index: '01',
    label: 'Storefront',
    tech: 'Next.js',
    role: 'Presentation',
    signal: '2 locales',
    accent:
      '[--hero-accent:var(--vendra-accent-2)] [--hero-accent-text:var(--vendra-accent-2-text)]'
  },
  {
    href: '/docs/platform',
    index: '02',
    label: 'Platform',
    tech: 'Laravel',
    role: 'Business state',
    signal: '30 packages',
    accent:
      '[--hero-accent:var(--vendra-accent)] [--hero-accent-text:var(--vendra-accent-text)]'
  },
  {
    href: '/docs/controller',
    index: '03',
    label: 'Controller',
    tech: 'Go',
    role: 'Runtime state',
    signal: 'Healthy',
    accent:
      '[--hero-accent:var(--vendra-accent-3)] [--hero-accent-text:var(--vendra-accent-3-text)]'
  }
]

function HeroArchitecture() {
  return (
    <div
      className="relative w-full max-w-xl rounded-[1.25rem] border border-[var(--vendra-line-strong)] bg-[linear-gradient(var(--vendra-surface-raised),var(--vendra-surface-raised))_padding-box,linear-gradient(145deg,color-mix(in_srgb,var(--vendra-accent-2),transparent_65%),color-mix(in_srgb,var(--vendra-accent),transparent_85%))_border-box] p-3 shadow-[var(--vendra-shadow-lg)] backdrop-blur-2xl before:absolute before:inset-[2rem_12%_1rem] before:-z-1 before:bg-[var(--vendra-accent)] before:opacity-10 before:blur-[5rem]"
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
          <div className={system.accent} key={system.href}>
            <Link
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[0.85rem] border border-[var(--vendra-line)] bg-[color-mix(in_srgb,var(--vendra-surface-raised),transparent_8%)] p-4 transition hover:translate-x-1 hover:border-[color-mix(in_srgb,var(--hero-accent),transparent_25%)] hover:shadow-[0_10px_26px_-16px_var(--hero-accent)]"
              href={system.href}
            >
              <span className="grid size-8 place-items-center rounded-[0.55rem] bg-[color-mix(in_srgb,var(--hero-accent),transparent_90%)] font-mono text-[0.7rem] font-[750] text-[var(--hero-accent-text)]">
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
              <span className="flex flex-col items-end gap-1 max-[36rem]:hidden">
                <span className="font-mono text-[0.6875rem] text-[var(--vendra-fg-muted)]">
                  {system.tech}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-semibold text-[var(--hero-accent-text)]">
                  <i className="size-1.5 rounded-full bg-current" />
                  {system.signal}
                </span>
              </span>
            </Link>
            {index < heroSystems.length - 1 ? (
              <div
                className="relative ml-4 grid h-7 w-8 place-items-center text-[var(--vendra-accent-text)]"
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
 * Per-tier accents, in the order the tiers are passed on the landing page:
 * storefront, platform, controller. The same three hues, in the same order,
 * colour the planes of the hero lattice — so the diagram and the figure above
 * it agree about which system is which rather than each picking its own
 * palette. Written out as whole class strings because Tailwind scans source
 * text: an interpolated `--vendra-accent-${n}` would never be generated.
 */
const tierHover = [
  'hover:border-[var(--vendra-accent-2)]',
  'hover:border-[var(--vendra-accent)]',
  'hover:border-[var(--vendra-accent-3)]'
]

const tierWash = [
  '!bg-[linear-gradient(145deg,color-mix(in_srgb,var(--vendra-accent-2),transparent_66%),color-mix(in_srgb,var(--vendra-accent-2),transparent_88%))]',
  '!bg-[linear-gradient(145deg,color-mix(in_srgb,var(--vendra-accent),transparent_66%),color-mix(in_srgb,var(--vendra-accent),transparent_88%))]',
  '!bg-[linear-gradient(145deg,color-mix(in_srgb,var(--vendra-accent-3),transparent_66%),color-mix(in_srgb,var(--vendra-accent-3),transparent_88%))]'
]

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
            className={`block rounded-[0.9rem] border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] px-6 py-5 transition hover:-translate-y-0.75 hover:shadow-[var(--vendra-shadow-sm)] ${tierHover[i] ?? tierHover[1]}`}
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
            <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-[var(--vendra-fg-muted)]">
              {tier.detail}
            </p>
            <div
              className={`mt-4 grid h-18 gap-1.5 overflow-hidden rounded-[0.6rem] border border-[var(--vendra-line)] bg-[var(--vendra-muted)] p-2.5 [&>span]:block [&>span]:min-h-1.5 [&>span]:rounded-full [&>span]:bg-[var(--vendra-line-strong)] ${i === 1 ? 'grid-cols-3' : i === 2 ? 'grid-cols-[0.55fr_1.45fr]' : 'grid-cols-[1.3fr_0.8fr]'}`}
              aria-hidden="true"
            >
              <span
                className={`${i === 1 ? '!col-span-3' : '!row-span-3'} !rounded-md ${tierWash[i] ?? tierWash[1]}`}
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

export type Shot = {
  /** Path under `public/`, base path applied by the caller's asset helper. */
  src: string
  /**
   * What the screenshot shows, for a reader who cannot see it. Not the page
   * title — "the orders table, filtered to unfulfilled" rather than "Orders".
   */
  alt: string
  /** Intrinsic pixel size. Required: without both, the frame reflows on load. */
  width: number
  height: number
  /** Host shown in the frame's address bar. Omit for a chrome-less plate. */
  host?: string
}

/**
 * A screenshot in browser chrome.
 *
 * The site argues for a product with a user interface and, until now, showed
 * none of it: outside four portraits there is not a single pixel of Vendra on
 * any page. This is the frame those screenshots go in — a title bar, an address
 * bar carrying the real host, and a fixed 16:10 plate so a row of cards keeps
 * its rhythm whether or not the images have loaded, and whatever the source
 * captures happen to be cropped to.
 *
 * Deliberately not a placeholder: with no `src` there is no frame and no
 * skeleton, and the surrounding component renders exactly as it does today.
 * A greyed-out mock of a panel that does not exist is the same false promise as
 * a showcase full of invented companies, which `app/showcase/page.tsx` already
 * refuses to make.
 */
export function Screenshot({ shot }: { shot: Shot }) {
  return (
    <figure className="m-0 overflow-hidden rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-muted)] shadow-[var(--vendra-shadow-md)]">
      {shot.host ? (
        <div className="flex items-center gap-2 border-b border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] px-3 py-2">
          <span className="flex gap-1" aria-hidden="true">
            <i className="size-2 rounded-full bg-[var(--vendra-line-strong)]" />
            <i className="size-2 rounded-full bg-[var(--vendra-line-strong)]" />
            <i className="size-2 rounded-full bg-[var(--vendra-line-strong)]" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-md bg-[var(--vendra-muted)] px-2 py-0.5 text-center font-mono text-[0.65rem] text-[var(--vendra-fg-subtle)]">
            {shot.host}
          </span>
        </div>
      ) : null}
      <img
        className="block aspect-16/10 w-full object-cover object-top"
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
        decoding="async"
      />
    </figure>
  )
}

/**
 * The routing model behind "one codebase, many properties", drawn.
 *
 * Every string in it is one the documentation already commits to — the
 * `<slug>.vendra.test` property hosts and the shared `api.vendra.test` from
 * `getting-started/local`, and the florist reference storefront that ships as
 * `vendra-storefront-florist`. Nothing here is a mock of a page that has not
 * been built; it is the architecture in the shape a reader recognises, which is
 * the same standard `HeroArchitecture` and the hero lattice are held to.
 */
export function PropertyRouting() {
  const hosts = ['florist.vendra.test', '<slug>.vendra.test']

  return (
    <div className="rounded-2xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] p-5 shadow-[var(--vendra-shadow-md)]">
      <div className="flex flex-col gap-2">
        {hosts.map(host => (
          <div
            className="flex items-center gap-2 rounded-lg border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] px-3 py-2"
            key={host}
          >
            <span className="flex gap-1" aria-hidden="true">
              <i className="size-1.5 rounded-full bg-[var(--vendra-line-strong)]" />
              <i className="size-1.5 rounded-full bg-[var(--vendra-line-strong)]" />
              <i className="size-1.5 rounded-full bg-[var(--vendra-line-strong)]" />
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--vendra-fg-muted)]">
              {host}
            </span>
          </div>
        ))}
      </div>

      <div
        className="my-3 flex items-center gap-2 text-[var(--vendra-accent-text)]"
        aria-hidden="true"
      >
        <i className="h-px flex-1 bg-[var(--vendra-line-strong)]" />
        <b className="text-xs">↓</b>
        <i className="h-px flex-1 bg-[var(--vendra-line-strong)]" />
      </div>

      <div className="rounded-lg border border-[color-mix(in_srgb,var(--vendra-accent),transparent_60%)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_92%)] px-3 py-2.5">
        <div className="font-mono text-xs font-semibold text-[var(--vendra-fg)]">
          vendra-storefront:latest
        </div>
        <div className="mt-1 text-xs text-[var(--vendra-fg-muted)]">
          One image. Identity arrives at container start, never at build time.
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-[var(--vendra-line)] px-3 py-2">
        <span className="font-mono text-xs text-[var(--vendra-fg-subtle)]">
          api.vendra.test
        </span>
        <span className="ml-auto text-[0.65rem] font-semibold tracking-[0.08em] text-[var(--vendra-fg-subtle)] uppercase">
          shared
        </span>
      </div>
    </div>
  )
}

/** A truthful, code-native view of the operator surface's current domains. */
export function OperatorPanelPreview() {
  const rows = [
    ['Tenants', 'Account boundary', 'Console · reseller'],
    ['Properties', 'Storefront identity', 'Console · reseller'],
    ['Subscriptions', 'Plan enforcement', 'Operator']
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] shadow-[var(--vendra-shadow-md)]">
      <div className="flex items-center justify-between border-b border-[var(--vendra-line)] px-4 py-3">
        <div>
          <div className="text-sm font-bold">Operator</div>
          <div className="text-[0.65rem] text-[var(--vendra-fg-subtle)]">
            Tenants · properties · subscriptions
          </div>
        </div>
        <span className="rounded-full bg-[color-mix(in_srgb,var(--vendra-accent),transparent_88%)] px-2.5 py-1 text-[0.65rem] font-bold text-[var(--vendra-accent-text)]">
          Platform
        </span>
      </div>
      <div className="grid grid-cols-3 border-b border-[var(--vendra-line)] bg-[var(--vendra-muted)]">
        {[
          ['30', 'Packages'],
          ['3', 'Panels'],
          ['8', 'API modules']
        ].map(([value, label]) => (
          <div
            className="border-l border-[var(--vendra-line)] px-4 py-3 first:border-l-0"
            key={label}
          >
            <strong className="block text-lg tracking-tight">{value}</strong>
            <span className="text-[0.65rem] text-[var(--vendra-fg-subtle)]">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="p-3">
        <div className="mb-2 px-2 text-[0.65rem] font-bold tracking-[0.12em] text-[var(--vendra-fg-subtle)] uppercase">
          Domain surfaces
        </div>
        {rows.map(([name, detail, scope]) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-[var(--vendra-line)] px-2 py-3 text-xs first:border-t-0"
            key={name}
          >
            <strong className="truncate">{name}</strong>
            <span className="text-[var(--vendra-fg-subtle)]">{detail}</span>
            <span className="rounded-full bg-[var(--vendra-muted)] px-2 py-0.5 font-semibold text-[var(--vendra-fg-subtle)]">
              {scope}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Controller output using commands and states the shipped CLI documents. */
export function ControllerConsole() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--vendra-line)] bg-neutral-950 text-neutral-100 shadow-[var(--vendra-shadow-lg)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[0.65rem] text-neutral-400">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="size-2 rounded-full bg-rose-400/70" />
          <i className="size-2 rounded-full bg-amber-300/70" />
          <i className="size-2 rounded-full bg-emerald-400/70" />
        </span>
        <span className="font-mono">vendra-controller</span>
      </div>
      <div className="space-y-4 p-5 font-mono text-[0.75rem] leading-6">
        <div>
          <span className="text-sky-400">$</span> vendra stack status
        </div>
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 text-neutral-400">
          <span className="text-emerald-400">●</span>
          <span>edge</span>
          <span className="text-neutral-200">healthy</span>
          <span className="text-emerald-400">●</span>
          <span>platform</span>
          <span className="text-neutral-200">healthy</span>
          <span className="text-emerald-400">●</span>
          <span>property/houshang-flowers</span>
          <span className="text-neutral-200">healthy</span>
        </div>
        <div className="border-t border-white/10 pt-4">
          <span className="text-sky-400">$</span> vendra stack hosts --write
          <div className="mt-1 text-neutral-500">
            wrote api, console and property hosts
          </div>
        </div>
      </div>
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
  media,
  action,
  accent = 'platform',
  flip = false
}: {
  eyebrow?: string
  index?: string
  title: ReactNode
  children?: ReactNode
  points?: string[]
  /**
   * A `Screenshot`, or a figure like `PropertyRouting`, above the points.
   * Composes with them rather than replacing them: a figure shows the shape of
   * the thing and the list carries the claims that have no picture, and a row
   * that trades its four selling points for one diagram has lost the argument
   * to win the layout.
   */
  media?: ReactNode
  action?: { href: string; label: string }
  accent?: 'storefront' | 'platform' | 'controller'
  flip?: boolean
}) {
  const accentClass = {
    storefront:
      '[--feature-accent:var(--vendra-accent-2)] [--feature-accent-text:var(--vendra-accent-2-text)]',
    platform:
      '[--feature-accent:var(--vendra-accent)] [--feature-accent-text:var(--vendra-accent-text)]',
    controller:
      '[--feature-accent:var(--vendra-accent-3)] [--feature-accent-text:var(--vendra-accent-3-text)]'
  }[accent]

  // The accent bloom (`before:`) is a 288px circle under a 64px blur, and the
  // row clips it — `overflow-hidden`, which the row needs so the bloom cannot
  // widen the page. It used to sit at `-right-24`, 96px *outside* the row, so
  // the clip cut through the circle's solid middle instead of through its
  // faded tail and left a hard vertical edge down the row's right side: a
  // rectangle of tinted background, which is the opposite of what a blurred
  // blob is for. At `right-16` the circle's edge is 64px inside the row, which
  // is exactly the blur radius, so the falloff reaches zero by the time it
  // meets the clip and there is no seam to see.
  return (
    <div
      className={`group relative grid items-start gap-10 overflow-hidden border-t border-[var(--vendra-line)] py-16 before:pointer-events-none before:absolute before:top-8 before:right-16 before:-z-1 before:size-72 before:rounded-full before:bg-[var(--feature-accent)] before:opacity-[0.055] before:blur-3xl first:border-t-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:gap-20 ${accentClass}`}
    >
      <div className={flip ? 'lg:order-2' : ''}>
        {eyebrow || index ? (
          <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] uppercase">
            {index ? (
              <span className="font-mono tracking-normal text-[var(--feature-accent-text)]">
                {index}
              </span>
            ) : null}
            {eyebrow ? (
              <span className="text-[var(--vendra-fg-subtle)]">{eyebrow}</span>
            ) : null}
          </div>
        ) : null}
        <h3 className="mt-3 max-w-xl font-display text-subtitle font-bold">
          {title}
        </h3>
        {children ? (
          <div className="mt-3 leading-7 text-[var(--vendra-fg-muted)]">
            {children}
          </div>
        ) : null}
        {action ? (
          <Link
            className="group mt-5 inline-flex gap-1.5 text-[0.9375rem] font-semibold hover:text-[var(--feature-accent-text)]"
            href={action.href}
          >
            {action.label} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
      <div className={`flex flex-col gap-4 ${flip ? 'lg:order-1' : ''}`}>
        {/* The accent frame below is drawn on the wrapper's own bounds, with
            the media inset from it by the wrapper's padding — not at
            `-inset-3`, hanging 12px outside the media on every side, which is
            what this used to do.

            Two things were wrong with the overhang. It was clipped: this
            column's outer edge is flush with the row's, and the row is
            `overflow-hidden` to contain the glow blob, so the frame lost
            exactly one side — the right on a normal row, the left on a `flip`
            one — and rendered as a three-sided box. And the side that did
            survive sat 12px outside the column, so it did not line up with the
            points list directly beneath it, which is bounded by the column
            itself.

            Padding instead of a negative inset fixes both at once: the frame is
            now exactly the column's width, so it aligns with the list and there
            is nothing outside the row to clip. */}
        {media ? (
          <div className="relative p-3 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[1.35rem] before:border before:border-[color-mix(in_srgb,var(--feature-accent),transparent_76%)]">
            {media}
          </div>
        ) : null}
        {points.length ? (
          <ul className="m-0 overflow-hidden border-y border-[var(--vendra-line)] bg-transparent p-0">
            {points.map(point => (
              <li
                className="relative border-t border-[var(--vendra-line)] py-4 pr-5 pl-9 text-[0.9375rem] leading-6 first:border-t-0 before:absolute before:top-[1.4rem] before:left-2 before:h-px before:w-4 before:bg-[var(--feature-accent)]"
                key={point}
              >
                {point}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
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
    /* Held to `max-w-4xl` inside the section's `max-w-6xl`: four logotypes
       spread across the full band sit far enough apart to read as four
       unrelated marks rather than one wall. */
    <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-14 gap-y-6">
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
            {customer.logo ? (
              <img
                className="h-7 w-auto max-w-24 object-contain grayscale transition group-hover:grayscale-0"
                src={customer.logo.src}
                alt=""
                width={customer.logo.width}
                height={customer.logo.height}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <svg
                className="size-6 shrink-0 opacity-85 transition group-hover:text-[var(--vendra-accent-text)] group-hover:opacity-100"
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
            )}
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
  /**
   * A capture of the thing the card describes. Drop the file in
   * `public/shots/` and point at `/shots/<name>.png`; 1600×1000 (16:10 at 2x)
   * matches the frame, and anything else is cropped to it from the top.
   * Cards without one keep the text-only layout.
   */
  shot?: Shot
}

/**
 * Card grid behind Examples, UI, and Showcase.
 *
 * An item without an `href` renders as a non-interactive card labelled
 * "Planned", so a gallery can be laid out before its contents exist without
 * shipping links that go nowhere — `check:links` would catch those anyway.
 *
 * A card with a `shot` leads with it. Capture a whole gallery or none of it:
 * the cards stretch to a shared height but their content is top-aligned, so a
 * single captured card in a row of three drops its title a frame's height below
 * its neighbours' and the row reads as broken rather than varied.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-4">
      {items.map(item => {
        const body = (
          <>
            {item.shot ? (
              <div className="mb-4">
                <Screenshot shot={item.shot} />
              </div>
            ) : null}
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
            <p className="mt-2 text-sm leading-6 text-[var(--vendra-fg-muted)]">
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
            className="flex flex-col rounded-xl border border-[var(--vendra-line)] px-5 py-4 transition hover:-translate-y-0.75 hover:border-[var(--vendra-accent)] hover:shadow-[var(--vendra-glow-sm)]"
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

/** One available project, given enough space to show the work rather than a card. */
export function FeaturedProject({
  item,
  secondaryShot,
  eyebrow = 'Available now'
}: {
  item: GalleryItem & { href: string; shot: Shot }
  secondaryShot?: Shot
  eyebrow?: string
}) {
  return (
    <Link
      href={item.href}
      className="group grid items-center gap-8 border-y border-[var(--vendra-line)] py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)] lg:gap-12"
    >
      <div
        className={`relative transition-transform duration-300 group-hover:-translate-y-1 ${secondaryShot ? 'pb-12 md:pr-16' : ''}`}
      >
        <Screenshot shot={item.shot} />
        {secondaryShot ? (
          <div className="absolute right-0 bottom-0 w-[58%] shadow-[var(--vendra-shadow-lg)]">
            <Screenshot shot={secondaryShot} />
          </div>
        ) : null}
      </div>
      <div>
        <div className="text-xs font-bold tracking-[0.14em] text-[var(--vendra-accent-text)] uppercase">
          {eyebrow}
        </div>
        <h3 className="mt-3 font-display text-subtitle font-bold">
          {item.title}
        </h3>
        <p className="mt-3 leading-7 text-[var(--vendra-fg-muted)]">
          {item.description}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold group-hover:text-[var(--vendra-accent-text)]">
          Explore the project <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}

/** Available work in an editorial list, without turning every entry into a card. */
export function EditorialList({ items }: { items: GalleryItem[] }) {
  return (
    <div className="border-t border-[var(--vendra-line)]">
      {items.map((item, index) => {
        const body = (
          <>
            <span className="font-mono text-xs text-[var(--vendra-fg-subtle)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>
              <strong className="block text-base tracking-tight">
                {item.title}
              </strong>
              <span className="mt-1 block text-sm leading-6 text-[var(--vendra-fg-muted)]">
                {item.description}
              </span>
            </span>
            <span className="text-[var(--vendra-fg-subtle)]" aria-hidden="true">
              →
            </span>
          </>
        )

        return item.href ? (
          <Link
            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] gap-4 border-b border-[var(--vendra-line)] py-5 transition hover:pl-2 hover:text-[var(--vendra-accent-text)]"
            href={item.href}
            key={item.title}
          >
            {body}
          </Link>
        ) : null
      })}
    </div>
  )
}

/** Compact roadmap: visible intent without letting unavailable work dominate. */
export function RoadmapList({
  items
}: {
  items: { title: string; area?: string }[]
}) {
  return (
    <ol className="m-0 grid list-none gap-x-8 border-t border-[var(--vendra-line)] p-0 md:grid-cols-2">
      {items.map((item, index) => (
        <li
          className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--vendra-line)] py-4"
          key={item.title}
        >
          <span className="font-mono text-xs text-[var(--vendra-fg-subtle)]">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold">{item.title}</span>
          {item.area ? (
            <span className="text-[0.65rem] font-bold tracking-[0.08em] text-[var(--vendra-fg-subtle)] uppercase">
              {item.area}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
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
            <p className="mt-1.5 mb-5 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
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
          className={`relative flex flex-col rounded-2xl border p-6 ${plan.featured ? 'border-[var(--vendra-accent)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_95%)] shadow-[var(--vendra-glow-lg)]' : 'border-[var(--vendra-line)] bg-[var(--vendra-surface)]'}`}
        >
          {plan.featured ? (
            // The accent-fill pair, not `bg-accent` + `text-white`: the plain
            // accent is a fill colour, and white on it is 3.27:1 — the same
            // miss the primary button had, in the same place, for the same
            // reason. Anything that puts a label *on* the accent needs the
            // strong step and `--vendra-on-accent`.
            <div className="absolute -top-3 left-5 rounded-full bg-[var(--vendra-accent-strong)] px-3 py-1 text-xs font-bold text-[var(--vendra-on-accent)]">
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
          <p className="mt-3 text-sm leading-6 text-[var(--vendra-fg-muted)]">
            {plan.summary}
          </p>
          <ul className="my-5 flex flex-1 list-none flex-col gap-2 p-0 text-sm">
            {plan.features.map(feature => (
              <li
                className="flex gap-2 before:text-[var(--vendra-accent-text)] before:content-['✓']"
                key={feature}
              >
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href={plan.cta.href}
            className={actionButtonClass(plan.featured)}
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
      <div className="mt-2 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
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
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold transition-colors hover:text-[var(--vendra-accent-text)] [&::-webkit-details-marker]:hidden">
            {item.question}
            {/* The same mark, at the same size, as the navbar's menu trigger —
                a chevron that rotates rather than a glyph that swaps, so the
                open and closed states are one element moving. */}
            <Chevron className="shrink-0 text-[var(--vendra-fg-subtle)] transition-transform duration-150 group-open:rotate-180" />
          </summary>
          <div className="pb-5 text-[0.9375rem] leading-7 text-[var(--vendra-fg-muted)]">
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
            className="group flex flex-col items-center rounded-2xl border border-[var(--vendra-line)] bg-[var(--vendra-surface)] px-6 pt-8 pb-6 text-center transition hover:-translate-y-0.75 hover:border-[color-mix(in_srgb,var(--vendra-accent),transparent_50%)] hover:shadow-[var(--vendra-glow-lg)]"
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
            <div className="mt-1 text-xs font-bold tracking-[0.1em] text-[var(--vendra-accent-text)] uppercase">
              {member.role}
            </div>
            {member.bio ? (
              <p className="mt-2.5 max-w-sm text-sm leading-6 text-[var(--vendra-fg-muted)]">
                {member.bio}
              </p>
            ) : null}
            {member.links?.length ? (
              <div
                className="mt-auto flex flex-wrap justify-center gap-1.5 pt-4"
                aria-label={`${member.name}'s profiles`}
              >
                {member.links.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--vendra-line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--vendra-fg-muted)] transition hover:bg-[var(--vendra-muted)] ${socialHover[link.label] ?? 'hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-fg)]'}`}
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
