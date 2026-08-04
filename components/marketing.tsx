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
import { Chevron, ExternalMark } from './icons'

/* -------------------------------------------------------------------------- */
/* Page furniture                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The labelled boundary rule — the site's one recurring structural device.
 *
 * A hairline with a short lead-in, a mono label sitting on the line, and the
 * rule running out to the full width. It is drawn after a dimension callout on
 * an engineering plan, and it is here because the product's whole argument is
 * about where the lines are: three systems, each with one job, and the value
 * living in the interfaces between them. So the site's dividers stopped being
 * neutral separators and started naming what they separate.
 *
 * That is also the rule for using it. The label has to be the name of a real
 * seam — `same-origin proxy`, `controller api`, `tenant resolution` — not a
 * caption and not an ordinal. This device replaced the `01 / 02 / 03` markers
 * that used to run down the landing page, which asserted a sequence the
 * content does not have: the storefront, the platform, and the controller are
 * layers that run at the same time, not steps taken in order, and numbering
 * them told readers to look for a progression that was never there.
 *
 * Deliberately uncoloured. The three tier hues mean "this belongs to that
 * system", and a boundary belongs to neither of the systems it divides —
 * colouring it would break the one rule that makes the palette readable.
 */
export function BoundaryRule({
  label,
  className = ''
}: {
  label?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      aria-hidden={label ? undefined : true}
    >
      <i className="h-px w-6 shrink-0 bg-[var(--vendra-line-strong)]" />
      {label ? (
        <span className="label shrink-0 text-[var(--vendra-fg-subtle)]">
          {label}
        </span>
      ) : null}
      <i className="h-px flex-1 bg-[var(--vendra-line)]" />
    </div>
  )
}

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
  size = 'default',
  titleAs: Heading = 'h2'
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
  /**
   * Heading level for the title. `h2` everywhere except the band that opens a
   * page, which passes `h1`.
   *
   * A page built only out of `Section`s had no `h1` at all — five of the six
   * marketing pages were in that state, because the landing page is the only
   * one whose opening band is a `LandingHero` and that component brings its
   * own. The level is a prop rather than "the first section is an h1" inferred
   * from position: `/pro` opens with a band whose real job is the draft
   * notice, and a component that guesses would have to guess wrong somewhere.
   *
   * Level only. The size stays `text-title` either way — the opening band is
   * not visually louder for being the document title, and on these pages the
   * loud element is the figure or the table below it.
   */
  titleAs?: 'h1' | 'h2'
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
            {/* Left-aligned sections get the boundary rule, centred ones get
                the bare label: the rule is a margin device — it starts at the
                text edge and runs out to the page — and centring it puts a
                dimension callout in the middle of nothing. */}
            {eyebrow ? (
              align === 'center' ? (
                <div className="label text-[var(--vendra-fg-subtle)]">
                  {eyebrow}
                </div>
              ) : (
                <BoundaryRule label={eyebrow} />
              )
            ) : null}
            {title ? (
              <Heading
                className={`font-display text-title font-bold ${eyebrow ? 'mt-5' : ''}`}
              >
                {title}
              </Heading>
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
          // `relative` so the visually-hidden span inside `ExternalMark` has
          // this button as its containing block rather than escaping to the
          // page and dragging the layout with it.
          <a
            key={item.href}
            href={item.href}
            className={`relative ${buttonClass(item.primary)}`}
            rel="noreferrer"
            target="_blank"
          >
            {item.label}
            <ExternalMark />
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
  // No ambient wash behind the hero any more. Two radial blooms, violet at the
  // top left and sky at the top right, used to bleed across the whole band.
  // They were the last of the glossy treatment the rest of this surface has
  // dropped, and they broke the one rule that makes the palette readable: a
  // tier hue means "this belongs to that system", and these belonged to
  // nothing — the storefront's violet was simply the colour of the top-left
  // corner. The `HeroCanvas` lattice behind this still carries all three hues,
  // and it is entitled to: its three planes *are* the three tiers.
  return (
    <section className="relative overflow-hidden py-16 min-[36rem]:pt-20 max-[36rem]:py-12">
      <HeroCanvas />
      {/* 1.25/0.75, up from 1.08/0.92, and a tighter gap cap. The figure is a
          list of three short rows and does not grow to fill what it is given,
          so the columns were near enough equal while their contents were not —
          and the headline, which does use every pixel it is handed, was paying
          for the surplus in line breaks. */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1.25fr)_minmax(21rem,0.75fr)] items-center gap-[clamp(2.5rem,5vw,5rem)] px-6 max-[64rem]:grid-cols-1">
        <div className="max-[64rem]:max-w-3xl">
          {eyebrow ? <BoundaryRule label={eyebrow} /> : null}
          {/* 22ch, not the 17ch this was set to for the previous display face.
              A measure is counted in characters but set for a width, and the
              headline face is now drawn past semi-expanded — so the same count
              bought a much narrower column, broke the headline to five lines,
              and left `stay` alone on one of them. The wider face has to be
              paid for in measure or it is not worth having. */}
          <h1 className="mt-6 max-w-[22ch] font-display text-hero font-[750] text-balance">
            {title}
          </h1>
          {children ? (
            <div className="mt-6 max-w-160 text-lg leading-[1.8] text-[var(--vendra-fg-muted)]">
              {children}
            </div>
          ) : null}
          <Actions items={actions} />
          {/* Set as one mono line under a rule rather than as a row of pills.
              Four rounded chips are the standard way to list a stack, and they
              read as badges — things claimed about the product. This is a
              manifest: the things the product is actually assembled from, in
              the face the rest of the page uses for anything the system says
              about itself. It also stops competing with the figure alongside,
              which is where the hero's weight is supposed to go. */}
          {chips.length ? (
            <div className="mt-10 border-t border-[var(--vendra-line)] pt-4">
              <ul className="label m-0 flex list-none flex-wrap gap-x-3 gap-y-2 p-0 text-[var(--vendra-fg-muted)]">
                {chips.map((chip, i) => (
                  <li className="flex gap-3" key={chip}>
                    {i > 0 ? (
                      <span
                        aria-hidden="true"
                        className="text-[var(--vendra-line-strong)]"
                      >
                        /
                      </span>
                    ) : null}
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <HeroArchitecture />
      </div>
    </section>
  )
}

/**
 * The three tiers of the hero figure, top to bottom, each with the boundary
 * that separates it from the one below.
 *
 * `boundary` is the load-bearing field and the reason this figure exists. Both
 * values are real interfaces the reference documents, not labels invented for
 * the diagram: the storefront reaches the platform only through a same-origin
 * proxy (`/docs/storefront/configuration`), and the platform reaches the
 * controller only through its narrow desired-state API (`/docs/controller`).
 * The last tier has no boundary below it — nothing is underneath the
 * controller, which is the point of it owning host mutation alone.
 */
const heroSystems = [
  {
    href: '/docs/storefront',
    code: 'S',
    label: 'Storefront',
    tech: 'Next.js',
    role: 'Presentation',
    signal: '2 locales',
    boundary: 'same-origin proxy',
    accent:
      '[--hero-accent:var(--vendra-accent-2)] [--hero-accent-text:var(--vendra-accent-2-text)]'
  },
  {
    href: '/docs/platform',
    code: 'P',
    label: 'Platform',
    tech: 'Laravel',
    role: 'Business state',
    signal: '30 packages',
    boundary: 'controller api',
    accent:
      '[--hero-accent:var(--vendra-accent)] [--hero-accent-text:var(--vendra-accent-text)]'
  },
  {
    href: '/docs/controller',
    code: 'C',
    label: 'Controller',
    tech: 'Go',
    role: 'Runtime state',
    signal: 'Healthy',
    boundary: null,
    accent:
      '[--hero-accent:var(--vendra-accent-3)] [--hero-accent-text:var(--vendra-accent-3-text)]'
  }
]

/**
 * The hero figure: the three tiers as a plan sheet, with the interfaces
 * between them drawn and named.
 *
 * This used to be a floating glass panel — a large radius, a backdrop blur, an
 * accent bloom behind it, a gradient border, and three rounded cards each
 * badged `01`, `02`, `03` with an animated arrow between them. Every one of
 * those is the house style of the current generation of developer-tool landing
 * pages, and together they said nothing about Vendra that they would not have
 * said about any other product. The arrows were the worst of it: they drew
 * flow between the tiers without ever naming what flows or how, which is
 * exactly the question the architecture exists to answer.
 *
 * So the panel is now a drawing. Square corners, one hairline border, no blur
 * and no glow, and the space between two tiers is not an arrow but a
 * `BoundaryRule` carrying the name of the real interface that crosses it. The
 * figure and the page are then making the same claim in the same words.
 */
/* No `aria-label` on the <figure> any more. It read "The three Vendra systems
   and the interfaces between them", which is a good description — and as an
   `aria-label` on an element that also has a `figcaption`, it *replaced* that
   caption as the accessible name. The visible words were the ones being
   suppressed. The caption now names the figure, and the sentence the label
   carried is folded into it as a visually-hidden description. */
function HeroArchitecture() {
  return (
    <figure className="relative m-0 w-full max-w-xl border border-[var(--vendra-line-strong)] bg-[var(--vendra-surface)] p-5 backdrop-blur-xl">
      {/* The title block, after the one on a drawing sheet: what the figure is,
          and the sheet's own reference in the corner. */}
      <figcaption className="label flex items-baseline justify-between gap-4 pb-5 text-[var(--vendra-fg-subtle)]">
        {/* "2 interfaces", not the "three clear boundaries" this said before.
            The old figure could make an uncountable claim because it drew no
            boundaries — only arrows. This one draws them, and there are two,
            so a reader who counts has to find what the caption promised. */}
        <span>
          One system
          {/* The description the old aria-label carried, available to a screen
              reader without adding a second visible line to a title block whose
              whole point is that it is two short words in the corners. */}
          <span className="absolute size-px overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap">
            : the three Vendra systems and the interfaces between them
          </span>
        </span>
        <span className="text-[var(--vendra-fg-subtle)]/70">2 interfaces</span>
      </figcaption>

      <div className="flex flex-col">
        {heroSystems.map(system => (
          <div className={system.accent} key={system.href}>
            <Link
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-4 border-l-2 border-[var(--hero-accent)] py-3.5 pl-4 transition-[background-color,padding] hover:bg-[color-mix(in_srgb,var(--hero-accent),transparent_94%)] hover:pl-5"
              href={system.href}
            >
              {/* The tier's initial, not its position in a list. It is the same
                  letter used for this tier everywhere else on the site, so the
                  figure is legible against the footer key and the docs. */}
              <span className="label text-[1rem] leading-none font-bold tracking-normal text-[var(--hero-accent-text)]">
                {system.code}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <strong className="text-[0.9375rem] tracking-[-0.01em]">
                  {system.label}
                </strong>
                <small className="text-xs text-[var(--vendra-fg-subtle)]">
                  {system.role}
                </small>
              </span>
              <span className="flex flex-col items-end gap-1 max-[36rem]:hidden">
                <span className="label text-[var(--vendra-fg-muted)]">
                  {system.tech}
                </span>
                <span className="label text-[var(--hero-accent-text)]">
                  {system.signal}
                </span>
              </span>
            </Link>
            {system.boundary ? (
              <BoundaryRule className="py-1" label={system.boundary} />
            ) : null}
          </div>
        ))}
      </div>

      {/* The axis the whole stack is read along. Kept from the previous figure
          because it is the one piece of it that carried an idea: the tiers are
          not a hierarchy, they are the span between what a merchant decides
          and what a customer sees. */}
      {/* `aria-hidden` moved off this row and onto the rule inside it. The
          comment above says this was kept because it is the one piece of the
          old figure that carried an idea — and hiding the whole row withheld
          exactly that idea from the readers least able to infer it from the
          layout. The decorative part is the line between the two words, not
          the two words. */}
      <div className="label mt-5 flex items-center gap-3 border-t border-[var(--vendra-line)] pt-4 text-[var(--vendra-fg-subtle)]">
        <span>merchant intent</span>
        <i
          className="h-px flex-1 bg-[var(--vendra-line-strong)]"
          aria-hidden="true"
        />
        <span>customer experience</span>
      </div>
    </figure>
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
  /**
   * Set on a shot that renders above the fold, which switches it from lazy to
   * eager with a high fetch priority.
   *
   * `Screenshot` hardcoded `loading="lazy"`, which is right for the gallery
   * grids and the feature splits it was written for and wrong for the one
   * place it is the first thing on the page: `FeaturedProject` puts a
   * 1600×1000 capture at the top of `/ui` and `/showcase`, where it is the LCP
   * element. Lazy-loading the largest element in the initial viewport defers
   * the very request the browser should be racing, so the page opens on an
   * empty frame that fills in late.
   */
  priority?: boolean
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
          <span className="min-w-0 flex-1 truncate rounded-md bg-[var(--vendra-muted)] px-2 py-0.5 text-center font-mono text-xs text-[var(--vendra-fg-subtle)]">
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
        loading={shot.priority ? 'eager' : 'lazy'}
        fetchPriority={shot.priority ? 'high' : undefined}
        decoding={shot.priority ? 'sync' : 'async'}
      />
    </figure>
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
        {/* `text-xs` throughout rather than the `text-[0.65rem]` these carried.
            That step is 10.4px, which is below anything else on the site and
            below the point where a label is comfortably readable — and it was
            an ad-hoc value besides, sitting outside the type scale the rest of
            the surface is held to. */}
        <div>
          <div className="text-sm font-bold">Operator</div>
          <div className="text-xs text-[var(--vendra-fg-subtle)]">
            Tenants · properties · subscriptions
          </div>
        </div>
        <span className="rounded-full bg-[color-mix(in_srgb,var(--vendra-accent),transparent_88%)] px-2.5 py-1 text-xs font-bold text-[var(--vendra-accent-text)]">
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
            <span className="text-xs text-[var(--vendra-fg-subtle)]">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="p-3">
        <div className="mb-2 px-2 label text-[var(--vendra-fg-subtle)]">
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
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs text-neutral-400">
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
        {/* The dots are `aria-hidden`. Each one is a U+25CF announced as "black
            circle", and the word beside it already says `healthy` — so a screen
            reader read this block as "black circle edge healthy black circle
            platform healthy…", three pieces of punctuation noise in a nine-word
            figure. The colour is the redundant cue here, not the text, which is
            the right way round: hiding the glyph costs a sighted reader nothing
            and costs everyone else three false words. */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 text-neutral-400">
          <span aria-hidden="true" className="text-emerald-400">
            ●
          </span>
          <span>edge</span>
          <span className="text-neutral-200">healthy</span>
          <span aria-hidden="true" className="text-emerald-400">
            ●
          </span>
          <span>platform</span>
          <span className="text-neutral-200">healthy</span>
          <span aria-hidden="true" className="text-emerald-400">
            ●
          </span>
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
  code,
  title,
  children,
  points = [],
  media,
  action,
  accent = 'platform',
  flip = false
}: {
  eyebrow?: string
  /**
   * The tier's initial — `S`, `P`, `C`. Was `index`, taking `01`/`02`/`03`,
   * which numbered three things that do not happen in an order: the storefront,
   * the platform, and the controller all run at once. The initial says which
   * system the row is about, which is the only thing the marker was ever
   * needed for.
   */
  code?: string
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

  // No accent bloom behind the row any more. It was a 288px circle under a
  // 64px blur, tinted to 5.5% opacity — a soft coloured haze that had to be
  // clipped by `overflow-hidden` so it could not widen the page, and that
  // clipping was itself delicate enough to need a paragraph explaining where
  // the circle had to sit for the seam not to show. All of that upkeep bought
  // an effect most readers would not notice and none could name. The row now
  // says which tier it belongs to the same way every other element does: with
  // the tier's colour on the boundary rule at its head.
  return (
    <div
      className={`group relative grid items-start gap-10 border-t border-[var(--vendra-line)] py-16 first:border-t-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:gap-20 ${accentClass}`}
    >
      <div className={flip ? 'lg:order-2' : ''}>
        {/* The boundary rule again, with the lead-in taking the tier's colour:
            this row does belong to one system, unlike a rule drawn between
            two. */}
        {eyebrow || code ? (
          <div className="flex items-center gap-3">
            <i className="h-px w-6 shrink-0 bg-[var(--feature-accent)]" />
            {code ? (
              <span className="label shrink-0 font-bold text-[var(--feature-accent-text)]">
                {code}
              </span>
            ) : null}
            {eyebrow ? (
              <span className="label shrink-0 text-[var(--vendra-fg-subtle)]">
                {eyebrow}
              </span>
            ) : null}
            <i className="h-px flex-1 bg-[var(--vendra-line)]" />
          </div>
        ) : null}
        <h3 className="mt-5 max-w-xl font-display text-subtitle font-bold">
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
            className="group relative flex items-center gap-2.5 text-[var(--vendra-fg-subtle)] transition-colors hover:text-[var(--vendra-fg)]"
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
              {/* Four legibility penalties used to compound here: 0.6rem
                  (9.6px measured), 0.22em tracking, uppercase, and `opacity-80`
                  on top of an already-subtle inherited colour. Measured in the
                  browser that landed at 3.53:1 — under the 4.5:1 this needs —
                  on the smallest text anywhere on the site.

                  The opacity is what had to go rather than shrink: it was
                  dimming an inherited colour that the token layer had already
                  tuned, so the one value nobody could reason about was the one
                  deciding the contrast. Size and tracking come back toward the
                  `label` utility's numbers; the logotype still reads as a
                  logotype, and now it reads. */}
              {customer.sub ? (
                <span className="mt-1 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                  {customer.sub}
                </span>
              ) : null}
            </span>
            {/* Only the entries that actually link out get the mark — a
                customer without an `href` renders as a plain <div>. */}
            {customer.href ? <ExternalMark /> : null}
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
          <div className="mb-2 label text-[var(--vendra-fg-subtle)]">
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

/**
 * One entry in a gallery, shared by `FeaturedProject` and `EditorialList`.
 *
 * The `Gallery` card grid and the `GalleryGroup` wrapper around it used to live
 * here and are gone: nothing imported either one. Every gallery page — Examples,
 * UI, Showcase — had already moved to the editorial list and the roadmap,
 * because a grid of cards where most are disabled placeholders was the layout
 * those pages were rewritten to stop using. The dead grid also still carried
 * `opacity-75` on its "Planned" card, which put muted body text at roughly
 * 4.1:1; it never shipped, and it is not left lying around to be adopted.
 */
export type GalleryItem = {
  title: string
  description: string
  href?: string
  tag?: string
  /** Marks an entry that has no destination yet. */
  planned?: boolean
  /**
   * A capture of the thing the entry describes. Drop the file in
   * `public/shots/` and point at `/shots/<name>.png`; 1600×1000 (16:10 at 2x)
   * matches the frame, and anything else is cropped to it from the top.
   */
  shot?: Shot
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
        {/* The lead shot opens the page, so it is the LCP element rather than
            something to defer. The inset secondary stays lazy. */}
        <Screenshot shot={{ ...item.shot, priority: true }} />
        {secondaryShot ? (
          <div className="absolute right-0 bottom-0 w-[58%] shadow-[var(--vendra-shadow-lg)]">
            <Screenshot shot={secondaryShot} />
          </div>
        ) : null}
      </div>
      <div>
        <div className="label text-[var(--vendra-accent-text)]">{eyebrow}</div>
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

/**
 * Available work in an editorial list, without turning every entry into a card.
 *
 * Unnumbered, on the same argument as `RoadmapList`: these are guides grouped
 * by area, and a reader can start at whichever one matches the task in front
 * of them. An ordinal in the first column made them look like chapters, which
 * is a reading order the set does not have and the copy never claims.
 */
export function EditorialList({ items }: { items: GalleryItem[] }) {
  return (
    <div className="border-t border-[var(--vendra-line)]">
      {items.map(item => {
        const body = (
          <>
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
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-[var(--vendra-line)] py-5 transition hover:pl-2 hover:text-[var(--vendra-accent-text)]"
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

/**
 * Compact roadmap: visible intent without letting unavailable work dominate.
 *
 * `ul`, and no ordinals. Both used to be `ol` with an `01 / 02 / 03` marker in
 * the first column, which is the same claim `BoundaryRule` was built to stop
 * the landing page making — see the note there. A roadmap is the clearest case
 * of it: nothing here has been scheduled, so a number beside "Account blocks"
 * announced a delivery position that no one had decided, and the reader who
 * trusted it would have been reading a commitment out of an alphabetised list.
 * The area label already carries the only grouping these items really have.
 */
export function RoadmapList({
  items
}: {
  items: { title: string; area?: string }[]
}) {
  return (
    <ul className="m-0 grid list-none gap-x-8 border-t border-[var(--vendra-line)] p-0 md:grid-cols-2">
      {items.map(item => (
        <li
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--vendra-line)] py-4"
          key={item.title}
        >
          <span className="text-sm font-semibold">{item.title}</span>
          {item.area ? (
            <span className="label text-[var(--vendra-fg-subtle)]">
              {item.area}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
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
  /**
   * Concurrent websites the plan allows — `max_units` in the vendra-
   * subscription plans table, which is the number actually enforced.
   *
   * `'open'` is the tier whose count is agreed rather than fixed. It is not
   * "unlimited": the limit is still a number in the subscription, it is just
   * one nobody has picked yet, and drawing it as infinity would promise
   * something the schema cannot express.
   */
  websites: number | 'open'
  /** Set on a tier whose allowance stops being served after `trialDays`. */
  trialDays?: number
  /** The tier this one builds on, rendered as an inheritance line. */
  inherits?: string
  /** Only what this tier adds. Anything inherited belongs in `inherits`. */
  features: string[]
  cta: { href: string; label: string }
  featured?: boolean
}

/** How many slots to draw before the open-ended tier trails off. */
const openSlotCount = 3

/**
 * The website allowance, drawn as the units it is counted in.
 *
 * This is the one figure that separates the tiers — the page's own lede says
 * the limit is the only thing that changes — and as a feature bullet reading
 * "3 websites" it sat in the list at the same weight as "Email support", which
 * is the template's way of hiding the only real variable. Drawing it puts the
 * axis back: four cards in a row, and the thing that ascends across them is
 * visible before any of the prose is read.
 *
 * Deliberately not coloured by tier. The three brand hues mean "this belongs
 * to that system" — storefront, platform, controller — and a subscription tier
 * is not one of the three systems, so giving Pro the sky blue would say
 * something false in the one palette rule the site keeps everywhere else. The
 * slots are accent-on-line like every other quantity on the marketing surface.
 *
 * The trial's slot is dashed rather than solid because that allowance expires;
 * `trialDays` is the same 7 the copy quotes and the `trial_days` column
 * enforces. The open tier draws three solid slots and then stops at a rule
 * that runs to the card edge, which reads as "and onward from here" without
 * claiming a number the plan has not agreed.
 */
function SlotMeter({
  websites,
  trialDays
}: {
  websites: number | 'open'
  trialDays?: number
}) {
  const open = websites === 'open'
  const count = open ? openSlotCount : websites
  // Kept to one line each. The caption sits between the meter and the price,
  // so a caption that wraps pushes its own price a line below the other three
  // and breaks the row a reader is scanning across — which is the single thing
  // four columns exist to make possible. "at once" is not repeated here: the
  // page title and lede both already say it, and spending eight characters
  // restating them is what pushed this caption onto a second line.
  const caption = open
    ? 'websites, as agreed'
    : `${count === 1 ? 'website' : 'websites'}${trialDays ? ` · ${trialDays} days` : ''}`

  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <i
            key={i}
            // The trial slot is dashed because the allowance expires, but it
            // still has to read as one website granted rather than one
            // withheld: at a light enough fill it looked like the empty slot
            // in a "1 of 3 used" meter, which is the opposite of what the
            // trial offers. Dashed edge, fill kept present.
            className={`h-6 w-4 rounded-[0.1875rem] border ${
              trialDays
                ? 'border-dashed border-[var(--vendra-accent)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_55%)]'
                : 'border-[var(--vendra-accent-strong)] bg-[var(--vendra-accent-strong)]'
            }`}
          />
        ))}
        {open ? (
          <i className="ml-0.5 h-px flex-1 bg-[linear-gradient(90deg,var(--vendra-line-strong),transparent)]" />
        ) : null}
      </div>
      <div className="label mt-2.5 text-[var(--vendra-fg-subtle)]">
        <span className="text-[var(--vendra-fg)]">{open ? 'n' : count}</span>{' '}
        {caption}
      </div>
    </div>
  )
}

/**
 * Pricing tiers.
 *
 * The component takes prices as opaque strings so a tier can read "Free" or
 * "Let's talk" alongside "€10" without special-casing. The figures themselves
 * live in `app/pro/page.tsx`, next to the TODO block that tracks what on that
 * page is still unbuilt.
 *
 * Four columns, not three. There are four tiers, and `lg:grid-cols-3` orphaned
 * the fourth onto a row of its own with two thirds of the row empty — which
 * put "more than three websites", the tier for the largest resellers on the
 * page, in the position that reads as an afterthought. One row also lets the
 * meters line up, and once they do the ascending allowance is legible straight
 * across the band.
 *
 * No "Most popular" flag. Sign-up is not open, so no tier has been bought once
 * and the badge asserted a popularity that could not exist; on a page whose
 * own notice says it is a draft, that was the one element making a claim the
 * rest of the page was careful not to make. The accent border and glow already
 * mark the recommended tier without saying anything untrue.
 */
export function PricingTable({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={`relative flex flex-col rounded-2xl border p-6 ${plan.featured ? 'border-[var(--vendra-accent)] bg-[color-mix(in_srgb,var(--vendra-accent),transparent_95%)] shadow-[var(--vendra-glow-lg)]' : 'border-[var(--vendra-line)] bg-[var(--vendra-surface)]'}`}
        >
          {/* `h2`, not `h3`. The band this table sits in has no title of its
              own — deliberately, since the band above it is the draft notice —
              so an `h3` here hung directly off the page `h1` with nothing at
              level 2 between them. The measured outline ran h1 → h3 h3 h3 h3 →
              h2 h2 h2 h2: a skipped level on the way in and a jump back up on
              the way out. Each plan is a top-level chunk of this page, so
              level 2 is also the honest description of it. */}
          <h2 className="text-lg font-bold tracking-tight">{plan.name}</h2>

          {/* Above the price, because the allowance is what the tier sells and
              the figure is what it costs — and on this page the allowance is
              the only thing that moves. */}
          <SlotMeter websites={plan.websites} trialDays={plan.trialDays} />

          {/* `font-display` here and nowhere else in the card: the price is the
              one number on the page a reader is comparing across four columns,
              and Archivo's width axis is what makes it scannable at a glance
              rather than another bold sans figure. */}
          <div className="font-display mt-5 text-3xl font-bold">
            {plan.price}
            {plan.cadence ? (
              <span className="ml-1 align-middle text-sm font-normal text-[var(--vendra-fg-subtle)]">
                {plan.cadence}
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-6 text-[var(--vendra-fg-muted)]">
            {plan.summary}
          </p>

          {/* Hairline rules rather than a column of ✓ glyphs. The checkmark is
              the pricing table's most reproduced element, and it was doing no
              work here: nothing in these lists is ever absent, so every row
              carried a tick confirming the row existed. */}
          <ul className="mt-5 mb-6 flex flex-1 list-none flex-col gap-0 p-0 text-sm">
            {plan.inherits ? (
              // Inheritance is a different kind of statement from a feature —
              // it is the whole of another column restated in three words — so
              // it is set apart rather than made bullet one of four.
              <li className="mb-3 border-y border-[var(--vendra-line)] py-2.5 text-[0.8125rem] text-[var(--vendra-fg-subtle)]">
                Everything in{' '}
                <span className="font-semibold text-[var(--vendra-fg-muted)]">
                  {plan.inherits}
                </span>
                , plus:
              </li>
            ) : null}
            {plan.features.map(feature => (
              <li
                className="border-b border-[var(--vendra-line)] py-2.5 leading-6 last:border-b-0"
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
            <div className="mt-1 label text-[var(--vendra-accent-text)]">
              {member.role}
            </div>
            {member.bio ? (
              <p className="mt-2.5 max-w-sm text-sm leading-6 text-[var(--vendra-fg-muted)]">
                {member.bio}
              </p>
            ) : null}
            {member.links?.length ? (
              /* `role="group"` is what makes the label below say anything. On
                 a bare <div> an `aria-label` is discarded — a generic element
                 with no role has no accessible name to set — so the row read as
                 four unattributed "GitHub, LinkedIn…" links with nothing tying
                 them to the person whose card they are on. On a grid of four
                 team members that is sixteen identical links and no way to tell
                 whose is whose. */
              <div
                className="mt-auto flex flex-wrap justify-center gap-1.5 pt-4"
                aria-label={`${member.name}'s profiles`}
                role="group"
              >
                {member.links.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`relative inline-flex items-center gap-1.5 rounded-full border border-[var(--vendra-line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--vendra-fg-muted)] transition hover:bg-[var(--vendra-muted)] ${socialHover[link.label] ?? 'hover:border-[var(--vendra-accent)] hover:text-[var(--vendra-fg)]'}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <SocialIcon label={link.label} />
                    {link.label}
                    <ExternalMark />
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
