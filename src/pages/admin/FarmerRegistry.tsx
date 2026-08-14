import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { formatKES, initials } from '../../lib/mockData';
import { STATUS_META, SEGMENT_META } from '../../lib/officerDesk';
import type { DemographicSegment } from '../../lib/officerDesk';
import { Link } from 'react-router-dom';
import { usePlatform } from '../../lib/PlatformContext';

export default function FarmerRegistry() {
  const { officers, cooperatives } = usePlatform();
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<DemographicSegment | 'all'>('all');

  const filtered = officers.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.memberNumber.toLowerCase().includes(q) || f.phone.includes(q);
    return matchSearch && (segment === 'all' || f.segment === segment);
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Farmer file cabinet</h2>
        <p>Full registry. Profile does not decide the loan — Review opens the scorecard.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', 'Women', 'Youth', 'PWD', 'General'] as const).map((s) => (
          <button key={s} className={`filter-pill ${segment === s ? 'active' : ''}`} onClick={() => setSegment(s)}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 18 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" style={{ paddingLeft: 32 }} placeholder="Search name, KTDA ID, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered.map((farmer) => {
          const coop = cooperatives.find((c) => c.id === farmer.cooperativeId);
          return (
            <div key={farmer.id} className="card-clean">
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: 'var(--loop-dark)', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                }}>{initials(farmer.name)}</div>
                <div>
                  <div style={{ fontWeight: 800 }}>{farmer.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{farmer.memberNumber}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className="status-pill" style={{ background: SEGMENT_META[farmer.segment].bg, color: SEGMENT_META[farmer.segment].color }}>{farmer.segment}</span>
                <span className={`status-pill ${STATUS_META[farmer.queueStatus].pill}`}>{STATUS_META[farmer.queueStatus].label}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>{coop?.shortName} · {formatKES(farmer.requestedKes)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/app/loop/farmers/${farmer.id}`} className="btn btn-outline btn-sm" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>Profile</Link>
                <Link to={`/app/loop/scorecard/${farmer.id}`} className="btn btn-orange btn-sm" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>Review</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
