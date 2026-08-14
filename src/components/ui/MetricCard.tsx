import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  accent?: 'emerald' | 'amber' | 'violet' | 'sky' | 'rose';
  icon?: React.ReactNode;
  delay?: number;
}

const accentColors = {
  emerald: 'var(--emerald-500)',
  amber: 'var(--amber-400)',
  violet: 'var(--violet-400)',
  sky: 'var(--sky-400)',
  rose: 'var(--rose-500)',
};

export default function MetricCard({ label, value, sub, trend, trendText, accent = 'emerald', icon, delay = 0 }: MetricCardProps) {
  const color = accentColors[accent];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--emerald-400)' : trend === 'down' ? 'var(--rose-500)' : 'var(--text-muted)';

  return (
    <div
      className={`glass-card accent-${accent} animate-fade-up`}
      style={{
        padding: '20px 22px',
        animationDelay: `${delay}s`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow in corner */}
      <div style={{
        position: 'absolute', bottom: -20, right: -20,
        width: 80, height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        {icon && (
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '1.75rem', fontWeight: 500,
        color: 'var(--text-primary)',
        lineHeight: 1,
        marginBottom: 8,
      }}>
        {value}
      </div>

      {(trendText || sub) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {trend && <TrendIcon size={12} color={trendColor} />}
          <span style={{ fontSize: '0.75rem', color: trend ? trendColor : 'var(--text-muted)' }}>
            {trendText || sub}
          </span>
        </div>
      )}
    </div>
  );
}
