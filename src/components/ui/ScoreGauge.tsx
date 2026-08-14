import React, { useEffect, useRef } from 'react';
import type { CreditTier } from '../../lib/mockData';

interface ScoreGaugeProps {
  score: number;
  tier: CreditTier;
  size?: number;
}

const tierLabel: Record<CreditTier, string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

const tierGlow: Record<CreditTier, string> = {
  platinum: 'rgba(168,85,247,0.3)',
  gold: 'rgba(251,191,36,0.3)',
  silver: 'rgba(148,163,184,0.2)',
  bronze: 'rgba(194,113,79,0.2)',
};

export default function ScoreGauge({ score, tier, size = 200 }: ScoreGaugeProps) {
  const needleRef = useRef<SVGLineElement>(null);

  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size * 0.38;
  const strokeWidth = size * 0.065;

  // Arc helpers
  const polarToCartesian = (angle: number, r: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number, r: number) => {
    const s = polarToCartesian(startAngle, r);
    const e = polarToCartesian(endAngle, r);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  // Gauge spans from -140° to +140° (280° total)
  const startAngle = -140;
  const endAngle = 140;
  const range = endAngle - startAngle;
  const scoreAngle = startAngle + (score / 100) * range;

  // Needle animation on mount
  useEffect(() => {
    if (!needleRef.current) return;
    needleRef.current.style.transform = `rotate(${startAngle}deg)`;
    needleRef.current.style.transition = 'none';
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        if (needleRef.current) {
          needleRef.current.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
          needleRef.current.style.transform = `rotate(${scoreAngle}deg)`;
        }
      }, 200);
    });
    return () => cancelAnimationFrame(raf);
  }, [score, scoreAngle, startAngle]);

  // Gradient stop colours across the arc
  const gradId = `gauge-grad-${score}`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      filter: `drop-shadow(0 0 24px ${tierGlow[tier]})`,
    }}>
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
        <defs>
          {/* Gradient for the arc */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          {/* Clip to score position */}
          <clipPath id={`clip-${score}`}>
            <path d={describeArc(startAngle, scoreAngle, radius + strokeWidth)}
              strokeWidth={strokeWidth * 3}
              stroke="white"
              strokeLinecap="round"
              fill="none"
            />
          </clipPath>
        </defs>

        {/* Track */}
        <path
          d={describeArc(startAngle, endAngle, radius)}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <path
          d={describeArc(startAngle, scoreAngle, radius)}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(v => {
          const a = startAngle + (v / 100) * range;
          const inner = polarToCartesian(a, radius - strokeWidth * 0.8);
          const outer = polarToCartesian(a, radius + strokeWidth * 0.8);
          return (
            <line
              key={v}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Needle */}
        <g style={{ transformOrigin: `${cx}px ${cy}px` }} ref={needleRef}>
          <line
            x1={cx} y1={cy}
            x2={cx} y2={cy - radius + strokeWidth * 0.5}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.9}
          />
          <circle cx={cx} cy={cy} r={5} fill="white" opacity={0.9} />
        </g>

        {/* Score number */}
        <text
          x={cx} y={cy + 20}
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize={size * 0.14}
          fontFamily="'DM Mono', monospace"
          fontWeight="500"
        >
          {score}
        </text>
      </svg>

      {/* Tier label */}
      <div style={{
        fontSize: '0.72rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: tier === 'platinum' ? '#c4b5fd' :
              tier === 'gold' ? '#fcd34d' :
              tier === 'silver' ? '#cbd5e1' : '#d98a6f',
      }}>
        {tierLabel[tier]} Tier
      </div>
    </div>
  );
}
