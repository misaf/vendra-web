'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const endpoint = process.env.NEXT_PUBLIC_DOCS_TELEMETRY_ENDPOINT

function send(
  event: 'page_view' | 'page_exit',
  path: string,
  duration?: number
) {
  if (!endpoint || navigator.doNotTrack === '1') return
  const body = JSON.stringify({ event, path, duration })
  navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
}

/**
 * Optional aggregate docs telemetry for a static export.
 *
 * It sends no identity, referrer, search text, or browser fingerprint. When the
 * endpoint is unset—or Do Not Track is enabled—it performs no network request.
 */
export function DocsTelemetry() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname.startsWith('/docs')) return
    const started = Date.now()
    send('page_view', pathname)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        send('page_exit', pathname, Date.now() - started)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [pathname])

  return null
}
