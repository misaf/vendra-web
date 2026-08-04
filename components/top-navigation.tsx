'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavGroup, NavSection } from '../lib/navigation'
import { Chevron } from './icons'

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavMenu({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = group.items.some(item => isCurrent(pathname, item.href))
  const ref = useRef<HTMLDetailsElement>(null)

  /* A bare <details> is a menu that only closes by clicking its own trigger
     again: clicking the page, pressing Escape, or following a link inside it
     all leave it hanging open. Restore the three dismissals a menu is expected
     to have. `pointerdown` rather than `click` so the menu is gone before the
     thing underneath reacts. */
  useEffect(() => {
    const close = () => {
      if (ref.current) ref.current.open = false
    }

    const onPointerDown = (event: PointerEvent) => {
      const node = event.target
      if (node instanceof Node && !ref.current?.contains(node)) close()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !ref.current?.open) return
      close()
      // Escape from inside a menu would otherwise drop focus on a hidden
      // element and send the next Tab back to the top of the page.
      ref.current.querySelector('summary')?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  /* Following a link inside the menu is a client-side navigation, which leaves
     the DOM — and the open menu — exactly as it was. */
  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])

  return (
    /* `name` makes the menus an exclusive group: opening one closes its
       siblings, natively. Browsers without it keep today's behaviour, where two
       can be open at once, which is untidy rather than broken. */
    <details className="group relative" name="vendra-nav" ref={ref}>
      <summary
        className={`relative inline-flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors [&::-webkit-details-marker]:hidden ${active ? 'bg-[var(--vendra-muted)] text-[var(--vendra-fg)] after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-[var(--vendra-accent)]' : 'text-[var(--vendra-fg-muted)] hover:bg-[var(--vendra-muted)] hover:text-[var(--vendra-fg)]'} group-open:bg-[var(--vendra-muted)] group-open:text-[var(--vendra-fg)]`}
        aria-label={`${group.label} menu`}
      >
        {group.label}
        <Chevron className="transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <div className="absolute top-[calc(100%+0.65rem)] left-1/2 z-40 flex min-w-48 -translate-x-1/2 flex-col rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] p-2 shadow-[var(--vendra-shadow-md)] backdrop-blur-xl">
        <div className="px-2.5 pt-1.5 pb-2 label text-[var(--vendra-fg-subtle)]">
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
                {/* `text-xs`, not the `text-[0.65rem]` this carried. That step
                    is 10.4px — the smallest type anywhere on the site, and an
                    ad-hoc value outside the scale besides. `OperatorPanelPreview`
                    was moved off the identical value for the identical reason;
                    this was the last copy of it left. A 12px glyph still sits
                    comfortably inside the 24px box. */}
                <i
                  className="grid size-6 place-items-center rounded-md border border-[var(--vendra-line)] bg-[var(--vendra-surface)] font-mono text-xs font-bold text-[var(--vendra-accent-text)] not-italic"
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
  const compactRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const close = () => {
      if (compactRef.current) compactRef.current.open = false
    }

    const onPointerDown = (event: PointerEvent) => {
      const node = event.target
      if (node instanceof Node && !compactRef.current?.contains(node)) close()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !compactRef.current?.open) return
      close()
      compactRef.current.querySelector('summary')?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (compactRef.current) compactRef.current.open = false
  }, [pathname])

  const sectionLink = (section: NavSection) => {
    const current = isCurrent(pathname, section.href)
    const primary = section.href === '/pro'
    return (
      <Link
        key={section.href}
        href={section.href}
        className={
          primary
            ? // Same fill pair as the primary `Actions` button in
              // `components/marketing.tsx`, for the same reason: white on the
              // plain accent is 3.3:1 at the light theme, and this label is
              // 13px bold. The strong step and its paired foreground carry the
              // contrast on both themes. The 1px hover lift is gone rather
              // than enlarged — on a control this small it read as jitter, and
              // the glow step alone is the clearer response.
              'ml-1 inline-flex min-h-9 items-center rounded-full border border-[var(--vendra-accent-strong)] bg-[var(--vendra-accent-strong)] px-4 text-[0.8125rem] font-bold text-[var(--vendra-on-accent)] shadow-[var(--vendra-glow-sm)] transition hover:border-[var(--vendra-accent)] hover:bg-[var(--vendra-accent)] hover:shadow-[var(--vendra-glow-md)]'
            : `relative inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ${current ? 'bg-[var(--vendra-muted)] text-[var(--vendra-fg)] after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-[var(--vendra-accent)]' : 'text-[var(--vendra-fg-muted)] hover:bg-[var(--vendra-muted)] hover:text-[var(--vendra-fg)]'}`
        }
        aria-current={current ? 'page' : undefined}
      >
        {section.label}
      </Link>
    )
  }

  return (
    <>
      <nav
        className="hidden items-center xl:flex"
        aria-label="Primary navigation"
      >
        <div className="flex items-center gap-1">
          {groups.map(group => (
            <NavMenu key={group.label} group={group} pathname={pathname} />
          ))}
          {sections.map(sectionLink)}
        </div>
      </nav>

      {/* `md`, not `lg`, and the difference was a viewport band with no
          navigation in it at all.

          Three controls divide this axis and they have to tile it without a
          gap: the full nav above `xl` (80rem), this menu below it, and Nextra's
          own hamburger, which is `md:hidden` — visible only *below* 48rem.
          Starting this one at `lg` (64rem) left 48–64rem covered by none of
          them: the hamburger had already switched off and this had not switched
          on, so a tablet in portrait got a header with a wordmark, a search
          box, and a theme toggle. No menu button, no links, nothing to open.

          Anchoring to `md` is what makes the tiling exact rather than
          approximate — this menu now begins on the same breakpoint the
          hamburger ends on, so the three ranges meet edge to edge and there is
          no width at which the site has no way to navigate. */}
      <details
        className="group relative hidden md:block xl:hidden"
        ref={compactRef}
      >
        <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-lg border border-[var(--vendra-line)] px-3 text-sm font-semibold text-[var(--vendra-fg-muted)] transition hover:bg-[var(--vendra-muted)] hover:text-[var(--vendra-fg)] [&::-webkit-details-marker]:hidden">
          Menu
          <Chevron className="transition-transform duration-150 group-open:rotate-180" />
        </summary>
        <nav
          className="absolute top-[calc(100%+0.65rem)] right-0 z-40 min-w-64 rounded-xl border border-[var(--vendra-line)] bg-[var(--vendra-surface-raised)] p-2 shadow-[var(--vendra-shadow-md)] backdrop-blur-xl"
          aria-label="Compact primary navigation"
        >
          {groups.map(group => (
            <div key={group.label}>
              <div className="px-2.5 pt-1.5 pb-1 label text-[var(--vendra-fg-subtle)]">
                {group.label}
              </div>
              {group.items.map(item => {
                const current = isCurrent(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-lg px-2.5 py-2 text-sm transition-colors ${current ? 'bg-[var(--vendra-muted)] text-[var(--vendra-fg)]' : 'text-[var(--vendra-fg-muted)] hover:bg-[var(--vendra-muted)] hover:text-[var(--vendra-fg)]'}`}
                    aria-current={current ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
          <div className="mt-1 border-t border-[var(--vendra-line)] pt-1">
            {sections.map(section => {
              const current = isCurrent(pathname, section.href)
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`flex items-center rounded-lg px-2.5 py-2 text-sm transition-colors ${current ? 'bg-[var(--vendra-muted)] font-semibold text-[var(--vendra-fg)]' : 'text-[var(--vendra-fg-muted)] hover:bg-[var(--vendra-muted)] hover:text-[var(--vendra-fg)]'}`}
                  aria-current={current ? 'page' : undefined}
                >
                  {section.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </details>
    </>
  )
}
