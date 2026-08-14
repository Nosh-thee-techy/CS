import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { ArrowRight, ClipboardPlus, CloudRain, TrendingUp, Users } from 'lucide-react';
import { usePlatform } from '../../lib/PlatformContext';
import { formatKES, initials } from '../../lib/mockData';
import {
  formatRelative, weeklyTrend, STATUS_META, SEGMENT_META,
} from '../../lib/officerDesk';
import type { ApplicationStatus, DemographicSegment } from '../../lib/officerDesk';

const segmentTabs: ('All' | DemographicSegment)[] = ['All', 'Women', 'Youth', 'PWD', 'General'];
const SEGMENT_COLORS: Record<DemographicSegment, string> = {
  Women: 'var(--loop-orange)',
  Youth: 'var(--gold-amber)',
  PWD: 'var(--sky-blue)',
  General: 'var(--loop-dark)',
};

const tooltipStyle = {
  background: 'var(--loop-dark)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 10,
  fontSize: 12,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

export default function LoopDashboard() {
  const { officers, climate, graphLive, cooperatives, registerWalkIn } = usePlatform();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [segment, setSegment] = useState<'All' | DemographicSegment>('All');
  const [q, setQ] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [intake, setIntake] = useState({ phone: '', nationalId: '', cooperativeId: 'C001', cropType: 'Green Tea', acreage: '1', notes: '' });

  const counts = useMemo(() => {
    const c: Record<ApplicationStatus, number> = {
      awaiting_climate: 0, ready_for_review: 0, escalated: 0, disbursed: 0,
    };
    officers.forEach((f) => { c[f.queueStatus] += 1; });
    return c;
  }, [officers]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return officers
      .filter((f) => (statusFilter === 'all' ? true : f.queueStatus === statusFilter))
      .filter((f) => (segment === 'All' ? true : f.segment === segment))
      .filter((f) => {
        if (!term) return true;
        return f.name.toLowerCase().includes(term)
          || f.nationalId.toLowerCase().includes(term)
          || f.memberNumber.toLowerCase().includes(term)
          || f.phone.replace(/\s/g, '').includes(term.replace(/\s/g, ''));
      });
  }, [officers, statusFilter, segment, q]);

  useEffect(() => { setSelectedIndex(0); }, [statusFilter, segment, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'j') setSelectedIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      if (e.key === 'k') setSelectedIndex((i) => Math.max(i - 1, 0));
      if (e.key === 'Enter') {
        const farmer = filtered[selectedIndex];
        if (farmer) navigate(`/app/loop/scorecard/${farmer.id}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, selectedIndex, navigate]);

  const segmentData = (['Women', 'Youth', 'PWD', 'General'] as DemographicSegment[]).map((s) => ({
    name: s,
    value: officers.filter((f) => f.segment === s).length,
  }));

  const zoneRain = Object.values(climate).map((z) => ({
    zone: z.zoneName.replace(' Highlands', '').replace(' Plateau', '').replace(' South', ''),
    mm: z.rainfallMmLast30d,
    spi: z.spi,
  }));

  function submitIntake(e: React.FormEvent) {
    e.preventDefault();
    void (async () => {
      try {
        const farmer = await registerWalkIn({
          phone: intake.phone,
          nationalId: intake.nationalId,
          cooperativeId: intake.cooperativeId,
          cropType: intake.cropType,
          acreage: Number(intake.acreage) || 1,
          notes: intake.notes,
        });
        setToast(`${farmer.name} queued — waiting for weather`);
        setIntake({ phone: '', nationalId: '', cooperativeId: 'C001', cropType: 'Green Tea', acreage: '1', notes: '' });
        setIntakeOpen(false);
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Could not register farmer');
      }
      setTimeout(() => setToast(''), 3200);
    })();
  }

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {toast && (
        <div className="card-clean" style={{ padding: '10px 16px', borderColor: 'var(--loop-orange)', color: 'var(--loop-dark)', fontWeight: 700, fontSize: '0.85rem' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--loop-orange)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{today}</div>
          <h1 style={{ fontSize: '2rem', marginTop: 4 }}>Today’s loan queue</h1>
          <p style={{ marginTop: 6, maxWidth: 520 }}>
            Triage, not underwriting. Open a scorecard to see why — co-op deliveries, chama, peer guarantees, weather — then write a stance the farmer can get by SMS.
          </p>
          {graphLive && <span className="live-badge on" style={{ marginTop: 8 }}>Live · Neo4j</span>}
        </div>
        <Link to="/app/loop/phone" style={{ textDecoration: 'none' }}>
          <button className="btn btn-dark">Open farmer phone <ArrowRight size={14} /></button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {([
          ['ready_for_review', counts.ready_for_review],
          ['awaiting_climate', counts.awaiting_climate],
          ['escalated', counts.escalated],
          ['disbursed', counts.disbursed],
        ] as [ApplicationStatus, number][]).map(([key, value]) => (
          <button
            key={key}
            className="card-clean"
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            style={{
              textAlign: 'left', cursor: 'pointer',
              borderColor: statusFilter === key ? 'var(--loop-orange)' : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_META[key].dot }} />
              {STATUS_META[key].label}
            </div>
            <div className="tabular" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--loop-dark)', marginTop: 8, lineHeight: 1 }}>{value}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
        <div className="card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <TrendingUp size={14} color="var(--loop-orange)" /> Weekly trend
              </div>
              <h3 style={{ marginTop: 4 }}>Last 8 weeks</h3>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', fontWeight: 700 }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: 'var(--loop-orange)', marginRight: 6 }} />Requested</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: 'var(--loop-dark)', marginRight: 6 }} />Sent</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="w" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="requested" stroke="var(--loop-orange)" fill="rgba(255,95,0,0.18)" strokeWidth={2.4} />
              <Area type="monotone" dataKey="sent" stroke="var(--loop-dark)" fill="rgba(20,26,33,0.12)" strokeWidth={2.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-clean">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <Users size={14} color="var(--loop-orange)" /> Who is applying
          </div>
          <h3 style={{ marginTop: 4 }}>{officers.length} people</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 200 }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={segmentData} dataKey="value" innerRadius={42} outerRadius={72} paddingAngle={3}>
                  {segmentData.map((s) => <Cell key={s.name} fill={SEGMENT_COLORS[s.name]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul style={{ listStyle: 'none', flex: 1, fontSize: '0.82rem' }}>
              {segmentData.map((s) => (
                <li key={s.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: SEGMENT_COLORS[s.name], marginRight: 8 }} />{s.name}</span>
                  <span className="tabular" style={{ fontWeight: 800 }}>{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card-clean">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          <CloudRain size={14} color="var(--loop-orange)" /> Rainfall by zone · last 30 days (mm)
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={zoneRain} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="zone" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="mm" radius={[8, 8, 0, 0]}>
              {zoneRain.map((z) => (
                <Cell key={z.zone} fill={z.spi <= -1 ? 'var(--rose-red)' : z.spi <= -0.5 ? 'var(--gold-amber)' : 'var(--loop-orange)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card-clean">
        <button type="button" onClick={() => setIntakeOpen((o) => !o)} style={{ width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--loop-orange-soft)', color: 'var(--loop-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardPlus size={18} />
            </div>
            <div>
              <h3>Field intake</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Register a walk-in through the same ingest path as USSD</div>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--loop-orange)' }}>{intakeOpen ? 'Hide' : 'Open'}</span>
        </button>
        {intakeOpen && (
          <form onSubmit={submitIntake} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Phone<input className="input" required value={intake.phone} onChange={(e) => setIntake({ ...intake, phone: e.target.value })} placeholder="07…" style={{ marginTop: 4 }} /></label>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>National ID<input className="input" value={intake.nationalId} onChange={(e) => setIntake({ ...intake, nationalId: e.target.value })} style={{ marginTop: 4 }} /></label>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Factory
              <select className="input" value={intake.cooperativeId} onChange={(e) => setIntake({ ...intake, cooperativeId: e.target.value })} style={{ marginTop: 4 }}>
                {cooperatives.map((c) => <option key={c.id} value={c.id}>{c.shortName}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Crop / acres
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input className="input" value={intake.cropType} onChange={(e) => setIntake({ ...intake, cropType: e.target.value })} />
                <input className="input" type="number" min={0.1} step={0.1} value={intake.acreage} onChange={(e) => setIntake({ ...intake, acreage: e.target.value })} style={{ maxWidth: 90 }} />
              </div>
            </label>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, gridColumn: '1 / -1' }}>Notes<textarea className="input" value={intake.notes} onChange={(e) => setIntake({ ...intake, notes: e.target.value })} rows={2} style={{ marginTop: 4, resize: 'vertical' }} /></label>
            <button className="btn btn-orange" type="submit" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>Submit to ingest pipeline</button>
          </form>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h2>Queue</h2>
            <p>{filtered.length} of {officers.length} farmers · <kbd style={{ border: '1px solid var(--border-light)', borderRadius: 4, padding: '0 5px', fontSize: 11 }}>j</kbd> <kbd style={{ border: '1px solid var(--border-light)', borderRadius: 4, padding: '0 5px', fontSize: 11 }}>k</kbd> · Enter to review</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {segmentTabs.map((s) => (
              <button key={s} className={`filter-pill ${segment === s ? 'active' : ''}`} onClick={() => setSegment(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <div className="search-input-pill" style={{ maxWidth: 280 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter this queue…" />
          </div>
          <button className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All {officers.length}</button>
          {(Object.keys(STATUS_META) as ApplicationStatus[]).map((s) => (
            <button key={s} className={`filter-pill ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: STATUS_META[s].dot }} />
              {STATUS_META[s].label} {counts[s]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((f, index) => {
            const coop = cooperatives.find((c) => c.id === f.cooperativeId);
            const selected = index === selectedIndex;
            return (
              <div
                key={f.id}
                className="card-clean"
                style={{
                  padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                  borderColor: selected ? 'var(--loop-orange)' : undefined,
                  boxShadow: selected ? '0 0 0 3px rgba(255,95,0,0.15)' : undefined,
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: 'var(--loop-dark)', color: '#FFFFFF', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{initials(f.name)}</div>
                  <div>
                    <Link to={`/app/loop/farmers/${f.id}`} style={{ fontWeight: 800, color: 'var(--text-main)', textDecoration: 'none' }}>{f.name}</Link>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.phone} · {f.cropType}</div>
                  </div>
                </div>
                <div>
                  <span className="status-pill" style={{ background: SEGMENT_META[f.segment].bg, color: SEGMENT_META[f.segment].color }}>{f.segment}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>{coop?.shortName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatRelative(f.submittedIso)}</div>
                  <div className="tabular" style={{ fontWeight: 900, fontSize: '1.05rem' }}>{formatKES(f.requestedKes)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: STATUS_META[f.queueStatus].dot }} />
                    {STATUS_META[f.queueStatus].label}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Link to={`/app/loop/farmers/${f.id}`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-outline btn-sm">Profile</button>
                  </Link>
                  <Link to={`/app/loop/scorecard/${f.id}`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-orange btn-sm">Review <ArrowRight size={12} /></button>
                  </Link>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="card-clean" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No farmers match this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
