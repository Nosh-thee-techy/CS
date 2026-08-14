import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { disbursementTrend } from '../../lib/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) => `KES ${(v / 1_000_000).toFixed(2)}M`;
  return (
    <div style={{
      background: 'var(--bg-raised)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 16px', boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 24, marginBottom: 3 }}>
          <span style={{ fontSize: '0.78rem', color: p.color }}>{p.name}</span>
          <span style={{ fontSize: '0.78rem', fontFamily: "'DM Mono',monospace", color: 'var(--text-primary)' }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function DisbursementChart() {
  return (
    <div className="glass-card accent-emerald" style={{ padding: '20px 22px', height: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ color: 'var(--text-primary)' }}>LOOP Disbursement Activity</h4>
        <p style={{ fontSize: '0.77rem', marginTop: 2 }}>Monthly approved vs disbursed via LOOP · KES</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={disbursementTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="grad-approved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-disbursed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `${(v / 1e6).toFixed(0)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{value}</span>}
          />
          <Area type="monotone" dataKey="approved" name="Approved" stroke="#10b981" fill="url(#grad-approved)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="disbursed" name="Disbursed (LOOP)" stroke="#fbbf24" fill="url(#grad-disbursed)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
