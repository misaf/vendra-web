/**
 * Vendra documentation design system.
 *
 * Every component here is registered globally in `mdx-components.tsx`, so MDX
 * pages use them without imports. Components take array props rather than
 * nested JSX children wherever possible — MDX indentation rules make deeply
 * nested markup fragile.
 */

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
export function Lede({ children }) {
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
}

/** Inline status pill, e.g. <Tag tone="emerald">Public</Tag> */
export function Tag({ children, tone = 'neutral', ...props }) {
  return (
    <span className={`vendra-tag ${tones[tone] ?? tones.neutral}`} {...props}>
      {children}
    </span>
  )
}

/** Row of pills. Pass `dot` for the accent marker used in the hero. */
export function ChipRow({ items, className = '', dot = false }) {
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
export function Panel({ title, children, className = '' }) {
  return (
    <div className={`vendra-panel mt-5 p-5 ${className}`}>
      {title ? <div className="vendra-eyebrow mb-4">{title}</div> : null}
      {children}
    </div>
  )
}

/** Landing hero. */
export function Hero({ eyebrow, title, children, actions, chips }) {
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
            <a
              key={action.href}
              href={action.href}
              className={`vendra-btn ${action.primary ? 'vendra-btn-primary' : 'vendra-btn-secondary'}`}
            >
              {action.label}
            </a>
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

/**
 * Primary link grid for section landing pages.
 * items: { href, title, description, meta? }
 */
export function FeatureGrid({ items, cols = 2 }) {
  return (
    <div
      className={`vendra-grid mt-5 grid gap-3 ${cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}
    >
      {items.map(item => (
        <a key={item.href} href={item.href} className="vendra-feature">
          <div className="flex items-baseline justify-between gap-3">
            <span className="vendra-feature-title">{item.title}</span>
            <span className="vendra-feature-arrow" aria-hidden="true">
              →
            </span>
          </div>
          <p className="vendra-feature-desc">{item.description}</p>
          {item.meta ? <div className="vendra-feature-meta">{item.meta}</div> : null}
        </a>
      ))}
    </div>
  )
}

/** End-of-page continuation links. items: { href, title, description } */
export function NextSteps({ items, title = 'Next' }) {
  return (
    <div className="vendra-next mt-12">
      <div className="vendra-eyebrow mb-4">{title}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(item => (
          <a key={item.href} href={item.href} className="vendra-next-item">
            <span className="vendra-next-title">
              {item.title}
              <span className="vendra-feature-arrow" aria-hidden="true">
                →
              </span>
            </span>
            <span className="vendra-next-desc">{item.description}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Structured content                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Numbered procedure rendered as a connected timeline.
 * items: { title, body }
 */
export function Steps({ items }) {
  return (
    <ol className="vendra-steps mt-5">
      {items.map((item, i) => (
        <li key={item.title} className="vendra-step">
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

/**
 * Reference list for keys, variables, and fields. Reads better than a
 * three-column table at narrow widths, where descriptions get crushed.
 * items: { term, description, meta?, tag? }
 */
export function DefList({ items }) {
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

/**
 * Command reference: each entry is an invocation plus what it does.
 * items: { cmd, description? }
 */
export function CommandList({ items }) {
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
export function Flow({ nodes, label }) {
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

/** Grid of label/value pairs for "at a glance" summaries. */
export function StatRow({ items }) {
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
 * `dos` and `donts` are string arrays.
 */
export function Boundary({ dos, donts, doTitle = 'Does', dontTitle = 'Does not' }) {
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
