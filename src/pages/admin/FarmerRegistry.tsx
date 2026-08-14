import React, { useState } from 'react';
import { Search, SlidersHorizontal, UserPlus } from 'lucide-react';
import { farmers, cooperatives, formatKES, initials, tierColor } from '../../lib/mockData';
import type { CreditTier } from '../../lib/mockData';
import { Link } from 'react-router-dom';

const tierOrder: CreditTier[] = ['platinum', 'gold', 'silver', 'bronze'];

export default function FarmerRegistry() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [coopFilter, setCoopFilter] = useState<string>('all');

  const filtered = farmers.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.county.toLowerCase().includes(q) || f.phone.includes(q);
    const matchTier = tierFilter === 'all' || f.creditTier === tierFilter;
    const matchCoop = coopFilter === 'all' || f.cooperativeId === coopFilter;
    return matchSearch && matchTier && matchCoop;
  });

  const tierCounts: Record<string, number> = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  farmers.forEach(f => tierCounts[f.creditTier]++);

  return (
    <div>
      <div className="page-header animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Farmer Registry</h2>
          <p>Credit tiers · cooperative membership · tea farmer profiles</p>
        </div>
        <button className="btn btn-primary"><UserPlus size={14} /> Register Farmer</button>
      </div>

      {/* Tier chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }} className="animate-fade-up delay-1">
        {[{ id: 'all', label: 'All', count: farmers.length }, ...tierOrder.map(t => ({ id: t, label: t.charAt(0).toUpperCase() + t.slice(1), count: tierCounts[t] }))].map(t => {
          const active = tierFilter === t.id;
          const tc = t.id === 'all' ? 'var(--text-secondary)' : tierColor(t.id as CreditTier);
          return (
            <button
              key={t.id}
              onClick={() => setTierFilter(active ? 'all' : t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 99, cursor: 'pointer',
                background: active ? `${tc}18` : 'var(--bg-raised)',
                color: active ? tc : 'var(--text-muted)',
                fontSize: '0.78rem', fontWeight: 600,
                border: active ? `1px solid ${tc}40` : '1px solid var(--border)',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: tc }} />
              {t.label}
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.7rem', opacity: 0.8 }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }} className="animate-fade-up delay-2">
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder="Search name, ID, county..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ maxWidth: 220 }} value={coopFilter} onChange={e => setCoopFilter(e.target.value)}>
          <option value="all">All Cooperatives</option>
          {cooperatives.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>
          <SlidersHorizontal size={13} />
          {filtered.length} of {farmers.length}
        </div>
      </div>

      {/* Grid */}
      <div className="farmer-grid">
        {filtered.map((farmer, i) => {
          const tc = tierColor(farmer.creditTier);
          const coop = cooperatives.find(c => c.id === farmer.cooperativeId);
          return (
            <Link key={farmer.id} to={`/app/loop/farmers/${farmer.id}`} style={{ textDecoration: 'none' }}>
              <div className={`card animate-fade-up delay-${Math.min(i + 1, 6)}`} style={{ padding: '18px 20px', cursor: 'pointer' }}>
                {/* Tier accent */}
                <div style={{ height: 2, background: tc, borderRadius: 99, marginBottom: 14, marginLeft: -20, marginRight: -20, marginTop: -18 }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.85rem', background: `linear-gradient(135deg, var(--terra-700), var(--terra-500))`, color: 'white' }}>
                    {initials(farmer.name)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{farmer.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{farmer.memberNumber}</div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: tc, background: `${tc}15`, border: `1px solid ${tc}30`, borderRadius: 99, padding: '2px 8px', flexShrink: 0 }}>
                    {farmer.creditTier.charAt(0).toUpperCase() + farmer.creditTier.slice(1)}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Score', val: `${farmer.creditScore}/100`, mono: true },
                    { label: 'County', val: farmer.county },
                    { label: 'Deliveries', val: farmer.totalDeliveries, mono: true },
                    { label: 'Vol. 90d', val: `${farmer.volumeKgLast90Days.toLocaleString()} kg`, mono: true },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: s.mono ? "'DM Mono',monospace" : 'inherit' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  🏭 {coop?.shortName}
                  {farmer.hasChama ? ` · 👥 ${farmer.chamaName}` : ''}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span className={`pill pill-${farmer.loopAccountStatus}`}>
                    <div className="pill-dot" style={{ background: farmer.loopAccountStatus === 'active' ? 'var(--green-500)' : farmer.loopAccountStatus === 'pending' ? 'var(--gold-400)' : 'var(--text-muted)' }} />
                    Loop {farmer.loopAccountStatus}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: "'DM Mono',monospace" }}>{formatKES(farmer.totalEarnedYTD)} YTD</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
