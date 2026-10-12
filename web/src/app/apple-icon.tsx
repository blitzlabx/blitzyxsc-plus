import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'blitzyxsc-plus';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0907',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="#e8b339"
          stroke="#e8b339"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2 L4 14 H10 L9 22 L20 9 H13 L13 2 Z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
