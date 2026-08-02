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
  items: { href: string; label: string; primary?: boolean; external?: boolean }[]
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
 * "Used by" wall.
 *
 * Renders names as text rather than logos: a logo wall of companies that have
 * not agreed to appear would be a false endorsement, and text placeholders are
 * honest about being placeholders until real permission exists.
 */
export function LogoWall({ names }: { names: string[] }) {
  return (
    <div className="vw-logos">
      {names.map(name => (
        <span key={name} className="vw-logo">
          {name}
        </span>
      ))}
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
          <Link key={item.title} href={item.href} className="vw-card vw-card-link">
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
 * Every number rendered here is a placeholder — see the banner on `/pro` and
 * the TODO block in `app/pro/page.tsx`. The component takes prices as opaque
 * strings so a tier can read "TBD" or "Custom" without special-casing.
 */
export function PricingTable({ plans }: { plans: Plan[] }) {
  return (
    <div className="vw-plans">
      {plans.map(plan => (
        <div
          key={plan.name}
          className={`vw-plan ${plan.featured ? 'vw-plan-featured' : ''}`}
        >
          {plan.featured ? <div className="vw-plan-badge">Most popular</div> : null}
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
