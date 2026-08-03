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
    <details className="vw-navmenu">
      <summary
        className="vw-navmenu-trigger"
        data-active={active || undefined}
        aria-label={`${group.label} menu`}
      >
        {group.label}
        <svg
          aria-hidden="true"
          className="vw-navmenu-caret"
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
      <div className="vw-navmenu-panel">
        <div className="vw-navmenu-label">{group.label}</div>
        {group.items.map(item => {
          const current = isCurrent(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="vw-navmenu-item"
              aria-current={current ? 'page' : undefined}
            >
              <span className="vw-navmenu-item-main">
                <i aria-hidden="true">{item.label.slice(0, 1)}</i>
                {item.label}
              </span>
              <span className="vw-navmenu-arrow" aria-hidden="true">
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
        className={primary ? 'vw-topnav-cta' : 'vw-topnav-link'}
        aria-current={current ? 'page' : undefined}
      >
        {section.label}
      </Link>
    )
  }

  return (
    <nav className="vw-topnav max-lg:hidden" aria-label="Primary navigation">
      <div className="vw-topnav-links">
        {leadingSections.map(sectionLink)}
        {groups.map(group => (
          <NavMenu key={group.label} group={group} pathname={pathname} />
        ))}
        {remainingSections.map(sectionLink)}
      </div>
    </nav>
  )
}
