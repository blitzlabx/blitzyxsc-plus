import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'blitzyxsc-plus — no-auth X/Twitter data API by Blitz (blitzlabx)';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage:
            'radial-gradient(ellipse at top, rgba(232,179,57,0.18), transparent 60%)',
          backgroundColor: '#0a0907',
          color: '#f5f5f0',
          fontFamily: 'monospace',
          padding: '60px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(64,58,32,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(64,58,32,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.3,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="#e8b339"
            stroke="#e8b339"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2 L4 14 H10 L9 22 L20 9 H13 L13 2 Z" />
          </svg>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, letterSpacing: '-2px' }}>
            blitzyxsc-<span style={{ color: '#e8b339' }}>plus</span>
          </div>
        </div>
        <div style={{ fontSize: 28, color: '#a8a395', marginBottom: 16 }}>
          no-auth X/Twitter data API
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 8,
            fontSize: 18,
            color: '#a8a395',
          }}
        >
          <span style={{ color: '#e8b339' }}>#</span>
          <span>NO API KEY</span>
          <span style={{ color: '#e8b339' }}>#</span>
          <span>NO OAUTH</span>
          <span style={{ color: '#e8b339' }}>#</span>
          <span>NO BULLSHIT</span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#a8a395',
          }}
        >
          by Blitz (@blitzlabx) — MIT
        </div>
      </div>
    ),
    { ...size },
  );
}
