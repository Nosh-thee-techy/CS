import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

interface ScoreBreakdownBarProps {
  label: string;
  score: number; // out of 25
  signals: string[];
  description?: string;
  delay?: number;
}

export default function ScoreBreakdownBar({ label, score, signals, description, delay = 0 }: ScoreBreakdownBarProps) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(true), delay * 1000 + 100);
    return () => clearTimeout(timeout);
  }, [delay]);

  const pct = (score / 25) * 100;
  const color = pct >= 80 ? 'var(--emerald-500)' : pct >= 60 ? 'var(--amber-400)' : pct >= 40 ? '#f97316' : 'var(--rose-500)';

  return (
    <div ref={ref} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          {description && (
            <Info size={12} color="var(--text-muted)" aria-label={description} style={{ cursor: 'help' }} />
          )}
        </div>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontWeight: 500,
          fontSize: '1rem', color,
        }}>
          {score}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 2 }}>/25</span>
        </span>
      </div>

      {/* Track */}
      <div style={{
        height: 8, background: 'rgba(255,255,255,0.05)',
        borderRadius: 99, overflow: 'hidden', marginBottom: 10,
      }}>
        <div style={{
          height: '100%',
          width: animated ? `${pct}%` : '0%',
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: 99,
          transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>

      {/* Signals */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {signals.map((sig, i) => (
          <div key={i} style={{
            fontSize: '0.71rem', color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '2px 8px',
          }}>
            {sig}
          </div>
        ))}
      </div>
    </div>
  );
}
