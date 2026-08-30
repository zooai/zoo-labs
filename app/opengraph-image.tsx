import { ImageResponse } from 'next/og'

// Prerender the card at build time; `output: export` has no server to render it on request.
export const dynamic = 'force-static'
export const alt = 'Zoo Labs — open AI research network'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// A branded share card so a shared zoolabs.io link unfurls with the Zoo mark
// and tagline rather than a blank preview. Prerendered at build (static export).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0a0a0a',
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 24,
              background: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0a0a',
              fontSize: 68,
              fontWeight: 700,
            }}
          >
            Z
          </div>
          <div style={{ color: '#fafafa', fontSize: 76, fontWeight: 700 }}>Zoo Labs</div>
        </div>
        <div style={{ color: '#a3a3a3', fontSize: 34, marginTop: 36, maxWidth: 900, lineHeight: 1.35 }}>
          Open AI research network — decentralized AI experiments, DeSci, and community-driven research.
        </div>
      </div>
    ),
    size,
  )
}
