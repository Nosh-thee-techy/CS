import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Wheat, Home, Users } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import { formatKES, initials } from '../../lib/mockData';
import { formatRelative, computeScore, STATUS_META, SEGMENT_META } from '../../lib/officerDesk';
import { usePlatform } from '../../lib/PlatformContext';

export default function FarmerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getFarmerById, getCoopById, getDeliveriesByFarmer, getLoansByFarmer,
    readinessHref, climate, auditLog, smsOutbox, sendSms,
  } = usePlatform();
  const farmer = getFarmerById(id || '');
  const [smsBody, setSmsBody] = useState('');
  const [sent, setSent] = useState('');

  const score = useMemo(() => (farmer ? computeScore(farmer, climate[farmer.zoneCode]) : null), [farmer, climate]);

  if (!farmer || !score) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
        <h3>Farmer not found</h3>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/app/loop')}>← Queue</button>
      </div>
    );
  }

  const coop = getCoopById(farmer.cooperativeId);
  const farmerDeliveries = getDeliveriesByFarmer(farmer.id);
  const farmerLoans = getLoansByFarmer(farmer.id);
  const sms = smsOutbox.filter((m) => m.farmerId === farmer.id);
  const audit = auditLog.filter((a) => a.farmerId === farmer.id);
  const chart = [
    { name: 'Co-op', pts: farmer.deliveryConsistency },
    { name: 'Chama', pts: farmer.chamaScore },
    { name: 'Repay', pts: farmer.repaymentScore },
    { name: 'Risk', pts: farmer.riskScore },
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/loop')} style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={13} /> Queue
      </button>

      <div className="card-clean" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: 'var(--loop-dark)', color: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem',
        }}>{initials(farmer.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{farmer.name}</h2>
            <span className="status-pill" style={{ background: SEGMENT_META[farmer.segment].bg, color: SEGMENT_META[farmer.segment].color }}>{farmer.segment}</span>
            <span className={`status-pill ${STATUS_META[farmer.queueStatus].pill}`}>{STATUS_META[farmer.queueStatus].label}</span>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {farmer.phone}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {farmer.ward}, {farmer.county}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Wheat size={11} /> {farmer.cropType} · {farmer.farmSizeAcres} acres</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Home size={11} /> {coop?.name}</span>
            {farmer.hasChama && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {farmer.chamaName}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={readinessHref(farmer.memberNumber)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>My Readiness</a>
          <Link to={`/app/loop/scorecard/${farmer.id}`} className="btn btn-orange btn-sm" style={{ textDecoration: 'none' }}>Review loan</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        <div className="card-dark" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>Score</div>
          <div className="tabular" style={{ fontSize: '3rem', fontWeight: 900, color: '#FFFFFF' }}>{score.total}</div>
          <div style={{ color: 'var(--loop-orange)', fontWeight: 800 }}>{score.band}</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.7, marginTop: 8 }}>This page does not decide the loan</div>
        </div>
        <div className="card-clean">
          <h4>Signal mix</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chart} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="pts" fill="var(--loop-orange)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card-clean">
          <h4>Drivers</h4>
          {score.drivers.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <span>{d.label}</span>
              <span className="tabular" style={{ color: '#065F46', fontWeight: 800 }}>+{d.points}</span>
            </div>
          ))}
        </div>
        <div className="card-clean">
          <h4>Drags</h4>
          {score.drags.length === 0 && <p>No climate drags on this file.</p>}
          {score.drags.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
              <span>{d.label}</span>
              <span className="tabular" style={{ color: '#991B1B', fontWeight: 800 }}>{d.points}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-clean">
        <h4>Deliveries</h4>
        {farmerDeliveries.length === 0 && <p>No deliveries recorded.</p>}
        {farmerDeliveries.map((d) => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{d.weightKg} kg · Grade {d.grade} · {d.date}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.id}</div>
            </div>
            <div className="tabular" style={{ fontWeight: 800 }}>{formatKES(d.netAmount)}</div>
          </div>
        ))}
      </div>

      <div className="card-clean">
        <h4>Loans</h4>
        {farmerLoans.length === 0 && <p>No loans on record.</p>}
        {farmerLoans.map((loan) => (
          <div key={loan.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{loan.purpose}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{loan.status} · {loan.appliedDate}</div>
            </div>
            <div className="tabular" style={{ fontWeight: 800 }}>{formatKES(loan.amount)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card-clean">
          <h4>SMS trail</h4>
          {sms.length === 0 && <p>No messages yet.</p>}
          {sms.map((m) => (
            <div key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatRelative(m.sentIso)} · {m.category}</div>
              <div style={{ fontSize: '0.82rem', marginTop: 4 }}>{m.body}</div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input className="input" value={smsBody} onChange={(e) => setSmsBody(e.target.value)} placeholder="Send an SMS…" />
            <button
              className="btn btn-orange btn-sm"
              onClick={() => {
                if (!smsBody.trim()) return;
                sendSms(farmer.id, smsBody.trim());
                setSent('Queued on the mock outbox');
                setSmsBody('');
              }}
            >
              Send
            </button>
          </div>
          {sent && <div style={{ fontSize: '0.72rem', color: 'var(--emerald-green)', marginTop: 6 }}>{sent}</div>}
        </div>
        <div className="card-clean">
          <h4>Audit</h4>
          {audit.length === 0 && <p>No decisions on this file.</p>}
          {audit.map((a) => (
            <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 800 }}>{a.decision} · {a.score}/100</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.officer} · {formatRelative(a.timestampIso)}</div>
              {a.notes && <div style={{ fontSize: '0.8rem', marginTop: 4 }}>{a.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
