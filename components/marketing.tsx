/**
 * Blocks for the marketing surface: the landing page, `/pro`, and the three
 * galleries.
 *
 * Kept separate from `components/vendra.tsx`, which is the in-page vocabulary
 * documentation authors use inside MDX. These are page-level compositions —
 * wider, louder, and deliberately not registered as global MDX components, so a
 * docs page cannot accidentally drop a pricing table into a reference section.
 *
 * Styling reuses the `.vendra-*` tokens and adds a `.vw-*` layer in
 * `app/globals.css` for the marketing-only pieces.
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
    <section className={`vw-section vw-section-${tone}`}>
      <div className="vw-container">
        {eyebrow || title || lede ? (
          <header className={`vw-section-head vw-align-${align}`}>
            {eyebrow ? <div className="vendra-eyebrow">{eyebrow}</div> : null}
            {title ? <h2 className="vw-section-title">{title}</h2> : null}
            {lede ? <p className="vw-section-lede">{lede}</p> : null}
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
  return (
    <div className="vw-actions">
      {items.map(item =>
        item.external ? (
          <a
            key={item.href}
            href={item.href}
            className={`vendra-btn ${item.primary ? 'vendra-btn-primary' : 'vendra-btn-secondary'}`}
            rel="noreferrer"
            target="_blank"
          >
            {item.label}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={`vendra-btn ${item.primary ? 'vendra-btn-primary' : 'vendra-btn-secondary'}`}
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
    <section className="vw-hero">
      <HeroCanvas />
      <div className="vw-container">
        {eyebrow ? <div className="vendra-eyebrow">{eyebrow}</div> : null}
        <h1 className="vw-hero-title">{title}</h1>
        {children ? <div className="vw-hero-lede">{children}</div> : null}
        <Actions items={actions} />
        {chips.length ? (
          <div className="vw-hero-chips">
            {chips.map(chip => (
              <span key={chip} className="vendra-chip">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
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
    <div className="vw-stack" role="list">
      {tiers.map((tier, i) => (
        <div className="vw-stack-row" key={tier.href} role="listitem">
          <Link href={tier.href} className="vw-stack-tier">
            <div className="vw-stack-head">
              <span className="vw-stack-label">{tier.label}</span>
              <span className="vendra-tag vendra-tag-neutral">{tier.tech}</span>
            </div>
            <div className="vw-stack-role">{tier.role}</div>
            <p className="vw-stack-detail">{tier.detail}</p>
          </Link>
          {i < tiers.length - 1 ? (
            <div className="vw-stack-arrow" aria-hidden="true">
              ↓
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/** Alternating text/visual feature band. */
export function FeatureSplit({
  eyebrow,
  title,
  children,
  points = [],
  action,
  flip = false
}: {
  eyebrow?: string
  title: ReactNode
  children?: ReactNode
  points?: string[]
  action?: { href: string; label: string }
  flip?: boolean
}) {
  return (
    <div className={`vw-split ${flip ? 'vw-split-flip' : ''}`}>
      <div className="vw-split-copy">
        {eyebrow ? <div className="vendra-eyebrow">{eyebrow}</div> : null}
        <h3 className="vw-split-title">{title}</h3>
        {children ? <div className="vw-split-body">{children}</div> : null}
        {action ? (
          <Link className="vw-arrow-link" href={action.href}>
            {action.label} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
      <ul className="vw-split-points">
        {points.map(point => (
          <li key={point}>{point}</li>
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
    <div className="vw-logos">
      {customers.map(customer => {
        // A plain <a>, not next/link: these are other people's sites, so there
        // is no route to prefetch and nothing for `basePath` to rewrite.
        const Tag = customer.href ? 'a' : 'div'
        return (
          <Tag
            className="vw-logo"
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
              className="vw-logo-mark"
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
            <span className="vw-logo-type">
              <span className="vw-logo-lead">{customer.lead}</span>
              {customer.sub ? (
                <span className="vw-logo-sub">{customer.sub}</span>
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
    <div className="vw-quickstart">
      {steps.map(step => (
        <div className="vw-quickstart-step" key={step.command}>
          <div className="vw-quickstart-label">{step.label}</div>
          <pre className="vw-quickstart-code">
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
    <div className="vw-gallery">
      {items.map(item => {
        const body = (
          <>
            <div className="vw-card-head">
              <h3 className="vw-card-title">{item.title}</h3>
              {item.tag ? (
                <span className="vendra-tag vendra-tag-neutral">
                  {item.tag}
                </span>
              ) : null}
            </div>
            <p className="vw-card-desc">{item.description}</p>
            {item.planned ? (
              <span className="vw-card-planned">Planned</span>
            ) : null}
          </>
        )

        return item.href ? (
          <Link
            key={item.title}
            href={item.href}
            className="vw-card vw-card-link"
          >
            {body}
          </Link>
        ) : (
          <div key={item.title} className="vw-card vw-card-static">
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
    <div className="vw-gallery-groups">
      {groups.map(group => (
        <div key={group.title}>
          <h3 className="vw-group-title">{group.title}</h3>
          {group.description ? (
            <p className="vw-group-desc">{group.description}</p>
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
    <div className="vw-plans">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={`vw-plan ${plan.featured ? 'vw-plan-featured' : ''}`}
        >
          {plan.featured ? (
            <div className="vw-plan-badge">Most popular</div>
          ) : null}
          <h3 className="vw-plan-name">{plan.name}</h3>
          <div className="vw-plan-price">
            {plan.price}
            {plan.cadence ? (
              <span className="vw-plan-cadence">{plan.cadence}</span>
            ) : null}
          </div>
          <p className="vw-plan-summary">{plan.summary}</p>
          <ul className="vw-plan-features">
            {plan.features.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <Link
            href={plan.cta.href}
            className={`vendra-btn ${plan.featured ? 'vendra-btn-primary' : 'vendra-btn-secondary'} vw-plan-cta`}
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
    <div className="vw-notice">
      <div className="vw-notice-title">{title}</div>
      <div className="vw-notice-body">{children}</div>
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
    <div className="vw-faq">
      {items.map(item => (
        <details key={item.question} className="vw-faq-item">
          <summary className="vw-faq-q">{item.question}</summary>
          <div className="vw-faq-a">{item.answer}</div>
        </details>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

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
  return (
    <div className="vw-team">
      {members.map(member => {
        const portrait = (
          <>
            <img
              className="vw-team-photo"
              src={member.photo}
              alt={`${member.name}, ${member.role}`}
              width={320}
              height={320}
              loading="lazy"
              decoding="async"
            />
            <div className="vw-team-name">{member.name}</div>
            <div className="vw-team-role">{member.role}</div>
            {member.bio ? <p className="vw-team-bio">{member.bio}</p> : null}
          </>
        )

        return member.href ? (
          <a
            key={member.name}
            className="vw-team-member vw-team-link"
            href={member.href}
            rel="noreferrer"
            target="_blank"
          >
            {portrait}
          </a>
        ) : (
          <div key={member.name} className="vw-team-member">
            {portrait}
          </div>
        )
      })}
    </div>
  )
}
