/**
 * Icons shared across the marketing blocks and the navigation.
 *
 * Its own module rather than an export from `components/marketing.tsx`: the
 * navigation is a client component, and importing one icon from that file would
 * pull every marketing block — the pricing table, the team grid, the hero — into
 * the client bundle behind it.
 */

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
