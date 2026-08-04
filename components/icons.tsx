/**
 * Icons shared across the marketing blocks and the navigation.
 *
 * Its own module rather than an export from `components/marketing.tsx`: the
 * navigation is a client component, and importing one icon from that file would
 * pull every marketing block — the pricing table, the team grid, the hero — into
 * the client bundle behind it.
 */

/**
 * The mark and the announcement for a link that leaves the site in a new tab.
 *
 * Both halves together, because shipping one without the other is the usual
 * way this gets half-done: the arrow tells a sighted reader and the
 * visually-hidden text tells a screen reader, and a link that opens a new tab
 * owes both of them the warning. Without it the Back button silently stops
 * working, which is the one navigation control every reader assumes.
 *
 * The span is hidden with the standard clip rectangle rather than
 * `display: none` or `visibility: hidden`, either of which would take it out of
 * the accessibility tree along with the visual layout and leave nothing to
 * announce.
 */
export function ExternalMark() {
  return (
    <>
      <svg
        aria-hidden="true"
        className="ml-0.5 inline-block size-3 shrink-0 self-center opacity-70"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 2.5H2.5v7h7v-2" />
        <path d="M7 2.5h2.5V5" />
        <path d="M9.5 2.5 5.5 6.5" />
      </svg>
      <span className="absolute size-px overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap">
        (opens in a new tab)
      </span>
    </>
  )
}

/** The disclosure mark, on a 12×12 box to sit on the cap height of 14px text. */
export function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 12 12"
      width="12"
      height="12"
    >
      <path
        d="m3 4.5 3 3 3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
