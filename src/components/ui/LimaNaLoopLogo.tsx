import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
  variant?: 'full' | 'icon' | 'dark';
}

export const LimaNaLoopLogo: React.FC<LogoProps> = ({
  size = 36,
  showText = false,
  textColor = '#FFFFFF',
  className = '',
  variant = 'full',
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        userSelect: 'none',
      }}
      className={className}
    >
      {/* ─── BRAND LOGO SVG MARK ─── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Outer L Loop Track */}
        <path
          d="M 28 20 C 18 20 16 32 16 42 L 16 80 C 16 94 26 102 40 102 L 68 102 C 78 102 84 96 84 88 C 84 80 78 78 68 78 L 40 78 C 34 78 30 74 30 68 L 30 42 C 30 32 28 20 28 20 Z"
          fill="#FF5500"
        />

        {/* Inner L Track & Leaf Stem */}
        <path
          d="M 44 48 C 38 48 38 54 38 60 L 38 80 C 38 88 42 92 50 92 L 62 92 C 68 92 70 88 70 84 C 70 80 66 78 60 78 L 52 78 C 48 78 48 74 48 70 L 48 60 C 48 54 44 48 44 48 Z"
          fill="#FF5500"
        />

        {/* Agricultural Leaf Sprout */}
        <path
          d="M 38 80 C 42 62 56 42 82 32 C 74 52 64 66 42 80 Z"
          fill="#FF5500"
        />

        {/* Growth Arrow (Top Right) */}
        <path
          d="M 72 26 L 82 16 M 82 16 L 74 16 M 82 16 L 82 24"
          stroke="#FF8844"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Security Shield Icon (Top Right) */}
        <path
          d="M 94 14 C 100 14 104 12 104 12 C 104 12 104 22 104 26 C 104 34 98 38 94 40 C 90 38 84 34 84 26 C 84 22 84 12 84 12 C 84 12 88 14 94 14 Z"
          stroke="#FF8844"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* LOOP Brand Tagline text at base */}
        <text
          x="54"
          y="98"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="900"
          fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          letterSpacing="1.5"
        >
          LOOP
        </text>
      </svg>

      {/* ─── BRAND TYPOGRAPHY ─── */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: size > 40 ? '1.4rem' : '1.05rem',
              color: textColor,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Lima na <span style={{ color: '#FF5500' }}>Loop</span>
          </div>
          <div
            style={{
              fontSize: '0.62rem',
              color: '#FF5500',
              marginTop: 4,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Powered by LOOP
          </div>
        </div>
      )}
    </div>
  );
};

export default LimaNaLoopLogo;
