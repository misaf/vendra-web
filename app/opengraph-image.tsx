import { ImageResponse } from 'next/og'
import { siteDescription, siteName } from '../lib/site'

/**
 * Social share card, generated at build time.
 *
 * Deliberately plain: the site's own hero effects (grid mask, radial glow,
 * gradient text) rely on CSS that Satori — the renderer behind ImageResponse —
 * does not support. This reproduces the palette and the wordmark instead of
 * failing to reproduce the hero.
 */
export const alt = `${siteName} — documentation`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Emitted once at build time — `output: 'export'` has no server to render it.
export const dynamic = 'force-static'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#09090b',
          padding: 80
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fafafa',
              color: '#09090b',
              fontSize: 38,
              fontWeight: 700,
              borderRadius: 14
            }}
          >
            V
          </div>
          <div style={{ color: '#a1a1aa', fontSize: 30, letterSpacing: 4 }}>
            PLATFORM · CONTROLLER · STOREFRONT
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#fafafa',
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -2
            }}
          >
            {siteName}
          </div>
          <div
            style={{
              marginTop: 24,
              color: '#a1a1aa',
              fontSize: 32,
              lineHeight: 1.4,
              maxWidth: 900
            }}
          >
            {siteDescription}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            height: 8,
            width: 220,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #2bb47c, #2b9db4)'
          }}
        />
      </div>
    ),
    size
  )
}
