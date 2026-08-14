import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Banknote, CreditCard, ArrowRight, Zap } from 'lucide-react';
import { farmers, deliveries, getDeliveriesByFarmer, formatKES, initials } from '../../lib/mockData';

const farmer = farmers[0];
const myDeliveries = getDeliveriesByFarmer('F-001');

export default function FarmerDashboard() {
  const totalEarned = myDeliveries.filter(d => d.status === 'paid').reduce((a, d) => a + d.netAmount, 0);
  const pendingAmount = myDeliveries.filter(d => d.status === 'payment_pending').reduce((a, d) => a + d.netAmount, 0);

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Welcome Banner */}
      <div className="card-clean" style={{ background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 54, height: 54, borderRadius: '50%',
              background: 'var(--loop-dark)', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.2rem',
            }}>
              {initials(farmer.name)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 2 }}>Welcome, {farmer.name.split(' ')[0]} 👋</h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {farmer.memberNumber} · Kiambu SACCO · {farmer.cropType}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/app/farmer/deliveries" style={{ textDecoration: 'none' }}>
              <button className="btn btn-dark btn-sm">
                View All Deliveries
              </button>
            </Link>
            <button className="btn btn-orange btn-sm">
              <Zap size={14} /> Request Loan Advance
            </button>
          </div>
        </div>
      </div>

      {/* Top Row KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>

        {/* Weather */}
        <div className="card-clean">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Plucking Weather</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--loop-dark)' }}>25°C</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Kiambu Highland · 86% Humidity</div>
        </div>

        {/* Paid */}
        <div className="card-clean">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Paid This Month</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.6rem', fontWeight: 900, color: 'var(--emerald-green)' }}>
            {formatKES(totalEarned)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Disbursed to M-Pesa</div>
        </div>

        {/* Pending */}
        <div className="card-clean">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Pending Payout</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold-amber)' }}>
            {formatKES(pendingAmount)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Awaiting batch payout</div>
        </div>

        {/* Credit Score */}
        <div className="card-clean">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Credit Score</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.6rem', fontWeight: 900, color: 'var(--loop-orange)' }}>
            {farmer.creditScore}/100
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--loop-orange)', fontWeight: 800, marginTop: 4 }}>★ Gold Tier Status</div>
        </div>

      </div>

      {/* Main Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20 }}>

        {/* Recent Deliveries */}
        <div className="card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3>Recent Deliveries</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Itemised weight, grade & net M-Pesa payouts</div>
            </div>
            <Link to="/app/farmer/deliveries" style={{ textDecoration: 'none' }}>
              <button className="btn btn-outline btn-sm">Full History <ArrowRight size={12} /></button>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myDeliveries.map(d => (
              <div key={d.id} style={{
                background: 'var(--bg-app)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)', padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: d.grade === 'A' ? 'var(--emerald-soft)' : 'var(--gold-soft)',
                    color: d.grade === 'A' ? '#065F46' : '#92400E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '0.9rem', fontFamily: "'DM Mono', monospace",
                  }}>
                    {d.grade}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {d.weightKg} kg · Grade {d.grade} · KES {d.ratePerKg}/kg
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {d.date} at {d.time || '08:45 AM'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 900, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {formatKES(d.netAmount)}
                  </div>
                  <span className={`status-pill ${d.status === 'paid' ? 'status-paid' : 'status-pending'}`}>
                    {d.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Score Breakdown Side Card */}
        <div className="card-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#FFFFFF', marginBottom: 4 }}>Credit Score Breakdown</h3>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: 18 }}>
              Calculated automatically by Loop
            </div>

            {[
              { label: 'Delivery Consistency', val: farmer.deliveryConsistency },
              { label: 'Chama Savings Activity', val: farmer.chamaScore },
              { label: 'Repayment History', val: farmer.repaymentScore },
              { label: 'Farm Risk Index', val: farmer.riskScore },
            ].map(dim => (
              <div key={dim.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>{dim.label}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, color: 'var(--loop-orange)' }}>{dim.val}/25</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${(dim.val / 25) * 100}%`, height: '100%', background: 'var(--loop-orange)', borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px',
            fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', marginTop: 16,
          }}>
            💡 High credit score qualifies you for <strong>0% interest input advances</strong> during tea plucking season.
          </div>
        </div>

      </div>

    </div>
  );
}
