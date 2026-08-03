'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavGroup, NavSection } from '../lib/navigation'

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavMenu({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = group.items.some(item => isCurrent(pathname, item.href))

  return (
    <details className="group relative">
      <summary
        className={`relative inline-flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors [&::-webkit-details-marker]:hidden ${active ? 'bg-[var(--vendra-muted)] text-[var(--vendra-fg)] after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-[var(--vendra-accent)]' : 'text-[var(--vendra-fg-muted)] hover:bg-[var(--vendra-muted)] hover:text-[var(--vendra-fg)]'} group-open:bg-[var(--vendra-muted)] group-open:text-[var(--vendra-fg)]`}
        aria-label={`${group.label} menu`}
      >
        {group.label}
        <svg
          aria-hidden="true"
          className="transition-transform duration-150 group-open:rotate-180"
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
      </summary>
      <div className="absolute top-[calc(100%+0.65rem)] left-1/2 z-40 flex min-w-48 -translate-x-1/2 flex-col rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] p-2 shadow-[0_18px_40px_-20px_rgb(9_9_11/40%)] backdrop-blur-xl">
        <div className="px-2.5 pt-1.5 pb-2 text-[0.65rem] font-bold tracking-[0.1em] text-[var(--vendra-fg-subtle)] uppercase">
          {group.label}
        </div>
        {group.items.map(item => {
          const current = isCurrent(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group/item flex items-center justify-between gap-6 rounded-lg px-2.5 py-2 text-sm transition-colors ${current ? 'bg-[var(--vendra-muted)] text-[var(--vendra-fg)]' : 'text-[var(--vendra-fg-muted)] hover:bg-[var(--vendra-muted)] hover:text-[var(--vendra-fg)]'}`}
              aria-current={current ? 'page' : undefined}
            >
              <span className="inline-flex items-center gap-2">
                <i
                  className="grid size-6 place-items-center rounded-md border border-[var(--vendra-line)] bg-[var(--vendra-surface)] font-mono text-[0.65rem] font-bold text-[var(--vendra-accent)] not-italic"
                  aria-hidden="true"
                >
                  {item.label.slice(0, 1)}
                </i>
                {item.label}
              </span>
              <span
                className={`text-[var(--vendra-fg-subtle)] transition-all ${current ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100'}`}
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          )
        })}
      </div>
    </details>
  )
}

export function TopNavigation({
  groups,
  sections
}: {
  groups: NavGroup[]
  sections: NavSection[]
}) {
  const pathname = usePathname()
  const leadingSections = sections.filter(section =>
    ['/', '/docs'].includes(section.href)
  )
  const remainingSections = sections.filter(
    section => !['/', '/docs'].includes(section.href)
  )

  const sectionLink = (section: NavSection) => {
    const current = isCurrent(pathname, section.href)
    const primary = section.href === '/pro'
    return (
      <Link
        key={section.href}
        href={section.href}
        className={
          primary
            ? 'ml-1 inline-flex min-h-9 items-center rounded-full border border-[color-mix(in_srgb,var(--vendra-accent),transparent_45%)] bg-[var(--vendra-accent)] px-4 text-[0.8125rem] font-bold text-white shadow-[0_6px_18px_-10px_var(--vendra-accent)] transition hover:-translate-y-px hover:brightness-110'
            : `relative inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ${current ? 'bg-[var(--vendra-muted)] text-[var(--vendra-fg)] after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-[var(--vendra-accent)]' : 'text-[var(--vendra-fg-muted)] hover:bg-[var(--vendra-muted)] hover:text-[var(--vendra-fg)]'}`
        }
        aria-current={current ? 'page' : undefined}
      >
        {section.label}
      </Link>
    )
  }

  return (
    <nav
      className="flex items-center max-lg:hidden"
      aria-label="Primary navigation"
    >
      <div className="flex items-center gap-1">
        {leadingSections.map(sectionLink)}
        {groups.map(group => (
          <NavMenu key={group.label} group={group} pathname={pathname} />
        ))}
        {remainingSections.map(sectionLink)}
      </div>
    </nav>
  )
}
