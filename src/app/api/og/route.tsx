import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1d4ed8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle dot pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top-right glow (no filter — not supported in og) */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'rgba(251,191,36,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'rgba(29,78,216,0.18)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.35)',
            borderRadius: 40,
            padding: '8px 20px',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#4ade80',
            }}
          />
          <span style={{ color: '#fbbf24', fontSize: 18, fontWeight: 600, letterSpacing: '0.04em' }}>
            LIVE PLATFORM · pdrconnect.eu
          </span>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#fbbf24',
            letterSpacing: '-3px',
            lineHeight: 1.0,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          PDR Connect
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 30,
            color: 'rgba(255,255,255,0.82)',
            marginTop: 18,
            fontWeight: 400,
            letterSpacing: '0.01em',
            display: 'flex',
          }}
        >
          The Platform for PDR Professionals
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 3,
            background: 'linear-gradient(90deg, #fbbf24, #f97316)',
            borderRadius: 2,
            marginTop: 36,
            marginBottom: 36,
            display: 'flex',
          }}
        />

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {[
            { value: '1000+', label: 'Technicians', color: 'white' },
            { value: '48+',   label: 'Countries',   color: '#fbbf24' },
            { value: '€0',    label: 'Free to Join', color: '#4ade80' },
            { value: '4',     label: 'Languages',   color: '#60a5fa' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div
                  style={{
                    width: 1,
                    height: 60,
                    background: 'rgba(255,255,255,0.15)',
                    margin: '0 36px',
                    display: 'flex',
                  }}
                />
              )}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                    display: 'flex',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.55)',
                    marginTop: 6,
                    fontWeight: 500,
                    display: 'flex',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Roles pills */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 40,
          }}
        >
          {['PDR Technician', 'Car Painter', 'Preparer', 'Dismantler', 'Workshop / Client'].map(role => (
            <div
              key={role}
              style={{
                background: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 30,
                padding: '8px 18px',
                color: 'rgba(255,255,255,0.80)',
                fontSize: 15,
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {role}
            </div>
          ))}
        </div>

        {/* Bottom colour bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #1d4ed8, #fbbf24, #1d4ed8)',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
