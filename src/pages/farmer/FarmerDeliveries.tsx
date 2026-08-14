import React from 'react';
import { deliveries, formatKES } from '../../lib/mockData';

const myDeliveries = deliveries.filter(d => d.farmerId === 'F-001');

const statusLabel: Record<string, string> = {
  recorded: 'Recorded', graded: 'Graded',
  payment_pending: 'Payment Pending', paid: 'Paid',
};

export default function FarmerDeliveries() {
  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2>My Tea Deliveries</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Every delivery, quality grade, and itemised payment breakdown — fully transparent.</p>
      </div>

      {/* 4-Step Process Flow Explainer */}
      <div className="card-clean" style={{ padding: '16px 22px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {[
            { step: '1', label: 'Leaf Delivered', desc: 'Logged at factory scale', icon: '🌿' },
            { step: '2', label: 'Weighed & Graded', desc: 'Grade A, B, or C assigned', icon: '⚖️' },
            { step: '3', label: 'Deductions Applied', desc: 'SACCO & input levies', icon: '📋' },
            { step: '4', label: 'Disbursed to M-Pesa', desc: 'Under 60 seconds via Loop', icon: '📱' },
          ].map((s, i) => (
            <React.Fragment key={s.step}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'var(--bg-app)', border: '1px solid var(--border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>{s.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              </div>
              {i < 3 && <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 700 }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Delivery Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {myDeliveries.map(d => (
          <div key={d.id} className="card-clean" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>{d.id}</span>
                  <span className="status-pill status-approved">Grade {d.grade}</span>
                  <span className={`status-pill ${d.status === 'paid' ? 'status-paid' : 'status-pending'}`}>{statusLabel[d.status]}</span>
                </div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 800 }}>
                  {d.weightKg} kg · Rate: KES {d.ratePerKg}/kg · Date: {d.date}
                </div>
              </div>

              {d.loopTransactionRef && (
                <div style={{
                  fontSize: '0.72rem', fontWeight: 800, color: 'var(--loop-orange)',
                  background: 'var(--loop-orange-soft)', borderRadius: 8, padding: '4px 10px',
                }}>
                  🔁 {d.loopTransactionRef}
                </div>
              )}
            </div>

            {/* Payment Breakdown Box */}
            <div style={{
              marginTop: 16, background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)',
              padding: '14px 18px', border: '1px solid var(--border-light)',
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, fontWeight: 800 }}>
                Itemised Payment Statement
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0' }}>
                <span>Gross Payout ({d.weightKg} kg × KES {d.ratePerKg})</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{formatKES(d.grossAmount)}</span>
              </div>
              {d.deductions.map((ded, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0', color: 'var(--rose-red)' }}>
                  <span>− {ded.label}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>−{formatKES(ded.amount)}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem',
                paddingTop: 10, marginTop: 6, borderTop: '2px solid var(--border-light)', fontWeight: 900,
              }}>
                <span style={{ color: 'var(--text-main)' }}>Net Transfer to M-Pesa Wallet</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--emerald-green)', fontSize: '1.15rem' }}>{formatKES(d.netAmount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
