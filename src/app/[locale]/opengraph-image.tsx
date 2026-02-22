import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SidequestLab';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const title = locale === 'ko'
    ? 'SidequestLab'
    : 'SidequestLab';

  const subtitle = locale === 'ko'
    ? '다양한 사이드 프로젝트로 가치를 만드는 실험실'
    : 'A Lab That Creates Value Through Side Projects';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          backgroundImage: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#9ca3af',
              maxWidth: 800,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 18,
            color: '#6b7280',
          }}
        >
          sidequestlab-homepage.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
