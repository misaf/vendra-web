/**
 * The people behind Vendra.
 *
 * Data lives here rather than in a page because the team is rendered in two
 * places — the landing page and `/pro` — and a second copy is how the two would
 * quietly drift apart. `components/marketing.tsx` renders it; this file decides
 * who is on it, in the same split as `lib/collection.ts` and
 * `components/collection.tsx`.
 *
 * Bios are written without pronouns. That is not squeamishness: it means a
 * member's entry never has to be corrected for a detail the site does not
 * otherwise need, and nobody gets misgendered by a copy-paste.
 */

import { basePath } from './site'

export type TeamMember = {
  name: string
  role: string
  /**
   * Public path to a square portrait, served from `public/team/`, base path
   * included. `components/marketing.tsx` renders these through a plain <img>,
   * and Next rewrites neither <img> src values nor strings — so on a project
   * site the prefix has to be baked in here, exactly as `lib/authors.ts` does
   * for avatars.
   */
  photo: string
  /** One line on what they actually do. */
  bio?: string
  links?: { label: string; href: string }[]
}

export const team: TeamMember[] = [
  {
    name: 'Misaf',
    role: 'Founder',
    photo: `${basePath}/team/misaf.jpg`,
    bio: 'Builds the platform, the controller, and most of what is written about them.',
    links: [
      { label: 'GitHub', href: 'https://github.com/misaf' },
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/ehsan-mahmoodi-a10aba283/'
      },
      { label: 'Instagram', href: 'https://www.instagram.com/misaf1990' },
      { label: 'YouTube', href: 'https://www.youtube.com/@misaf1990' }
    ]
  },
  {
    name: 'Arefeh',
    role: 'Support',
    photo: `${basePath}/team/arefeh.jpg`,
    bio: 'Answers the questions that become FAQ entries, and keeps subscribers unblocked.',
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/karimiii.71' }
    ]
  }
]
