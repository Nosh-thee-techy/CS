import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { usePlatform } from '../../lib/PlatformContext';
import { api } from '../../lib/api';
import { formatKES, initials } from '../../lib/mockData';
import {
  computeScore, STANCES, STATUS_META, SEGMENT_META,
} from '../../lib/officerDesk';
import type { StanceId } from '../../lib/officerDesk';

export default function Scorecard() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getFarmerById, getCoopById, climate, graphLive, commitDecision } = usePlatform();
  const farmer = getFarmerById(id);
  const [stance, setStance] = useState<StanceId>('approve_flexible');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [payout, setPayout] = useState('');

  const zone = farmer ? climate[farmer.zoneCode] : undefined;
  const score = useMemo(() => (farmer ? computeScore(farmer, zone) : null), [farmer, zone]);

  if (!farmer || !score) {
    return (
      <div className="card-clean" style={{ textAlign: 'center', padding: 48 }}>
        <h3>Farmer not found</h3>
        <Link to="/app/loop" className="btn btn-ghost" style={{ marginTop: 12, textDecoration: 'none' }}>← Back to queue</Link>
      </div>
    );
  }

  const coop = getCoopById(farmer.cooperativeId);
  const bandColor = score.band === 'Approve' ? 'var(--emerald-green)' : score.band === 'Refer' ? 'var(--gold-amber)' : 'var(--rose-red)';

  async function commit() {
    if (!farmer) return;
    setBusy(true);
    setError('');
    try {
      const result = await commitDecision(farmer.id, stance, notes);
      setBusy(false);
      navigate('/app/loop', { state: { flash: result.sms.body } });
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : 'Could not write the decision.');
    }
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Link to="/app/loop" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700 }}>← Back to queue</Link>
      <div>
        <span className={`live-badge ${graphLive ? 'on' : 'off'}`}>
          <span className="live-dot" />
          {graphLive ? 'Live · Neo4j' : 'Graph walk on mock data'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card-clean">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: 'var(--loop-dark)', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                }}>{initials(farmer.name)}</div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{farmer.id} · {coop?.shortName}</div>
                  <h2 style={{ marginTop: 2 }}>{farmer.name}</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    <span className="status-pill" style={{ background: SEGMENT_META[farmer.segment].bg, color: SEGMENT_META[farmer.segment].color }}>{farmer.segment}</span>
                    <span className="status-pill status-pending">{farmer.cropType} · {farmer.farmSizeAcres} acres</span>
                    <span className="status-pill status-approved">{farmer.zoneName}</span>
                    <span className={`status-pill ${STATUS_META[farmer.queueStatus].pill}`}>{STATUS_META[farmer.queueStatus].label}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Requested</div>
                <div className="tabular" style={{ fontSize: '1.6rem', fontWeight: 900 }}>{formatKES(farmer.requestedKes)}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>via {farmer.registeredVia}</div>
              </div>
            </div>
          </div>

          {score.assetSubstituteApplied && (
            <div className="card-clean" style={{ borderColor: 'var(--gold-amber)', background: 'var(--gold-soft)' }}>
              <div style={{ fontWeight: 800 }}>Asset-substitute banner</div>
              <p style={{ marginTop: 4 }}>No land title. Lease / co-op tenure is standing in as collateral — this is visible, not a black box.</p>
            </div>
          )}

          <div>
            <h3>Why this score</h3>
            <p style={{ marginBottom: 12 }}>Graph walk: Farmer → Chama → Cooperative → ClimateZone. Officers never see a probability without drivers and drags.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="card-clean">
                <div style={{ fontWeight: 800, color: '#065F46', marginBottom: 10 }}>Drivers</div>
                {score.drivers.length === 0 && <p>No boosters on this file.</p>}
                {score.drivers.map((d) => (
                  <div key={d.label} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span>{d.label}</span>
                      <span className="tabular" style={{ color: '#065F46' }}>+{d.points}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.detail}</div>
                  </div>
                ))}
              </div>
              <div className="card-clean">
                <div style={{ fontWeight: 800, color: '#991B1B', marginBottom: 10 }}>Drags</div>
                {score.drags.length === 0 && <p>No climate or pest drags.</p>}
                {score.drags.map((d) => (
                  <div key={d.label} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span>{d.label}</span>
                      <span className="tabular" style={{ color: '#991B1B' }}>{d.points}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-clean">
            <h3>Climate</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
              {[
                { label: 'SPI', value: zone?.spi.toFixed(1) ?? '—' },
                { label: 'Rain 30d', value: `${zone?.rainfallMmLast30d ?? '—'} mm` },
                { label: 'Pest', value: `${zone?.pestProximityKm ?? '—'} km` },
              ].map((row) => (
                <div key={row.label} style={{ background: 'var(--bg-app)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{row.label}</div>
                  <div className="tabular" style={{ fontWeight: 900, fontSize: '1.2rem', marginTop: 4 }}>{row.value}</div>
                </div>
              ))}
            </div>
            {zone?.advisory && <p style={{ marginTop: 12 }}>{zone.advisory}</p>}
          </div>

          <div className="card-clean">
            <h3>Farmer SMS vs officer narrative</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div style={{ background: 'var(--sky-soft)', borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, marginBottom: 8 }}>Farmer SMS preview</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', lineHeight: 1.5 }}>
                  KaLI Rating: {score.total}/100. Band {score.band}. {score.drivers[0]?.label || 'Build deliveries'} is helping. Next: keep chama and factory weights on time.
                </div>
              </div>
              <div style={{ background: 'var(--bg-app)', borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, marginBottom: 8 }}>Officer narrative</div>
                <p style={{ fontSize: '0.82rem' }}>
                  {farmer.name}: {score.drivers.length} drivers, {score.drags.length} drags, unified score {score.total}/100 ({score.band}).
                  SPI {zone?.spi.toFixed(1)}. {score.assetSubstituteApplied ? 'Asset substitute applied.' : 'Title or substitute already in the walk.'}
                </p>
              </div>
            </div>
          </div>

          <div className="card-clean">
            <h3>Commit stance</h3>
            <p>Writes a DECIDED edge, an audit node, and an SMS. Optional Loop payout after approve.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
              {STANCES.map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    border: stance === opt.id ? '2px solid var(--loop-orange)' : '1px solid var(--border-light)',
                    background: stance === opt.id ? 'var(--loop-orange-soft)' : 'var(--bg-app)',
                    borderRadius: 14, padding: 12, cursor: 'pointer',
                  }}
                >
                  <input type="radio" name="stance" checked={stance === opt.id} onChange={() => setStance(opt.id)} style={{ marginRight: 8 }} />
                  <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{opt.label}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{opt.hint}</div>
                </label>
              ))}
            </div>
            <textarea
              className="input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Field notes, supervisor consult, reason for decline…"
              style={{ marginTop: 12, resize: 'vertical' }}
            />
            {error && <p style={{ color: 'var(--rose-red)', marginTop: 8 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-orange" disabled={busy} onClick={commit}>
                {busy ? 'Writing…' : 'Commit decision & SMS'}
              </button>
              <Link to="/app/loop" className="btn btn-outline" style={{ textDecoration: 'none' }}>Cancel</Link>
            </div>
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-dark" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Canonical score</div>
            <div className="tabular" style={{ fontSize: '4rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, margin: '8px 0' }}>{score.total}</div>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: 99,
              background: bandColor, color: '#FFFFFF', fontWeight: 800, fontSize: '0.78rem',
            }}>{score.band} {score.band === 'Approve' ? '≥ 65' : score.band === 'Refer' ? '50–64' : '< 50'}</div>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: 12, fontSize: '0.78rem' }}>
              Display {farmer.creditScore}/100 from the engine · this card is the graph walk you underwrite against.
            </p>
          </div>
          <div className="card-clean">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Harvest window</div>
            <div style={{ fontSize: '0.85rem' }}>{farmer.harvestMonth} · {farmer.farmSizeAcres} acres · {farmer.cropType}</div>
            <Link to={`/app/loop/farmers/${farmer.id}`} className="btn btn-outline btn-sm" style={{ marginTop: 12, textDecoration: 'none', width: '100%' }}>Open full file</Link>
          </div>
          {stance.startsWith('approve') && (
            <div className="card-clean">
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Optional Loop payout</div>
              <p>After approve, fire B2C to the farmer wallet.</p>
              <button
                className="btn btn-dark btn-sm"
                style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                onClick={async () => {
                  try {
                    const result = await api.initiatePayout({
                      farmerId: farmer.id,
                      cooperativeId: farmer.cooperativeId,
                    });
                    const payoutId = result.payout?.payoutId || `PAY-${Date.now().toString().slice(-6)}`;
                    setPayout(`${payoutId} · ${formatKES(result.payout?.netPayoutAmount || farmer.requestedKes)} queued`);
                  } catch (err) {
                    setPayout(err instanceof Error ? err.message : 'Payout failed');
                  }
                }}
              >
                <Zap size={13} /> Disburse via Loop
              </button>
              {payout && <div style={{ fontSize: '0.72rem', color: 'var(--emerald-green)', fontWeight: 700, marginTop: 8 }}>{payout}</div>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
