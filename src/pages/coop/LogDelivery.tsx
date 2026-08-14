import React, { useState } from 'react';
import { farmers, gradeRates, formatKES } from '../../lib/mockData';
import type { Grade } from '../../lib/mockData';
import { Send, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LogDelivery() {
  const [farmerId, setFarmerId] = useState('F-001');
  const [weightKg, setWeightKg] = useState(42);
  const [grade, setGrade] = useState<Grade>('A');
  const [submitted, setSubmitted] = useState(false);

  const farmer = farmers.find(f => f.id === farmerId);
  const rate = gradeRates[grade];
  const gross = weightKg * rate;
  const saccoLevy = Math.round(gross * 0.1);
  const factoryCharge = Math.round(gross * 0.067);
  const net = gross - saccoLevy - factoryCharge;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade" style={{ maxWidth: 540, margin: '30px auto' }}>
        <div className="card-clean" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--emerald-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 16px',
          }}>
            ✅
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Delivery Logged Successfully!</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            An instant SMS confirmation has been pushed to {farmer?.name}'s phone via LOOP Platform.
          </p>

          <div style={{
            background: 'var(--bg-app)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)', padding: 18, textAlign: 'left', marginBottom: 24,
            fontSize: '0.85rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Farmer</span>
              <span style={{ fontWeight: 800 }}>{farmer?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Weight & Grade</span>
              <span style={{ fontWeight: 800 }}>{weightKg} kg · Grade {grade}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gross Amount</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{formatKES(gross)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--rose-red)' }}>
              <span>Deductions (SACCO + Factory)</span>
              <span style={{ fontFamily: "'DM Mono', monospace" }}>−{formatKES(saccoLevy + factoryCharge)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '2px dashed var(--border-light)', marginTop: 6, fontWeight: 900 }}>
              <span>Net to M-Pesa Wallet</span>
              <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--emerald-green)', fontSize: '1.1rem' }}>{formatKES(net)}</span>
            </div>
          </div>

          <button className="btn btn-orange btn-lg" style={{ width: '100%' }} onClick={() => setSubmitted(false)}>
            Log Another Delivery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/app/coop" style={{ textDecoration: 'none' }}>
          <button className="btn btn-outline btn-sm"><ArrowLeft size={14} /> Back to Dashboard</button>
        </Link>
        <div>
          <h2>Log Tea Delivery</h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Digital leaf weighing, quality grading & instant confirmation SMS</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="card-clean" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
              Select Tea Farmer
            </label>
            <select className="input" value={farmerId} onChange={e => setFarmerId(e.target.value)}>
              {farmers.filter(f => f.cooperativeId === 'C001').map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.memberNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>
              Green Leaf Weight (Kg)
            </label>
            <input
              type="number" className="input" min={1} max={500}
              value={weightKg}
              onChange={e => setWeightKg(Number(e.target.value))}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, display: 'block', marginBottom: 8 }}>
              Assigned Leaf Grade
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {(['A', 'B', 'C'] as Grade[]).map(g => (
                <button
                  key={g} type="button"
                  onClick={() => setGrade(g)}
                  style={{
                    padding: '14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    border: grade === g ? '2px solid var(--loop-orange)' : '1px solid var(--border-light)',
                    background: grade === g ? 'var(--loop-orange-soft)' : 'var(--bg-app)',
                    color: grade === g ? 'var(--loop-orange)' : 'var(--text-main)',
                    fontWeight: 900, fontSize: '1rem', transition: 'var(--transition)',
                  }}
                >
                  Grade {g}
                  <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.8, marginTop: 2 }}>KES {gradeRates[g]}/kg</div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-orange btn-lg" style={{ marginTop: 8 }}>
            <Send size={16} /> Record Delivery & Push SMS
          </button>

        </form>

        {/* Live Calculation Preview & SMS Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="card-clean">
            <h4 style={{ marginBottom: 12 }}>Itemised Payment Statement Preview</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gross Payout ({weightKg}kg × KES {rate})</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800 }}>{formatKES(gross)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--rose-red)' }}>
                <span>− SACCO Levy (10%)</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>−{formatKES(saccoLevy)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--rose-red)' }}>
                <span>− Factory Charge</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>−{formatKES(factoryCharge)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '2px solid var(--border-light)', fontWeight: 900 }}>
                <span>Net to Farmer M-Pesa Wallet</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--emerald-green)', fontSize: '1.05rem' }}>{formatKES(net)}</span>
              </div>
            </div>
          </div>

          <div className="card-dark">
            <div style={{ fontSize: '0.68rem', color: 'var(--loop-orange)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              📱 SMS Confirmation Preview
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12,
              fontSize: '0.78rem', color: '#FFFFFF', lineHeight: 1.5,
              borderLeft: '3px solid var(--loop-orange)',
            }}>
              "Lima na Loop: {farmer?.name.split(' ')[0]}, your {weightKg} kg of Grade {grade} tea has been recorded at Kiambu Factory. Expected payout: {formatKES(net)}."
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
