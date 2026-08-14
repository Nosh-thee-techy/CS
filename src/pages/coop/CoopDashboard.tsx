import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Users, Banknote, Zap, ArrowRight } from 'lucide-react';
import { cooperatives, farmers, deliveries, paymentBatches, formatKES } from '../../lib/mockData';

const myFarmers = farmers.filter(f => f.cooperativeId === 'C001');
const myBatches = paymentBatches.filter(b => b.cooperativeId === 'C001');
const recentDeliveries = deliveries.filter(d => d.cooperativeId === 'C001').slice(0, 5);

export default function CoopDashboard() {
  const pendingDeliveries = deliveries.filter(d => d.cooperativeId === 'C001' && d.status !== 'paid').length;
  const totalThisMonth = deliveries.filter(d => d.cooperativeId === 'C001' && d.status === 'paid').reduce((a, d) => a + d.netAmount, 0);

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header Banner */}
      <div className="card-clean" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Kiambu Tea Growers SACCO</h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Factory #KTG-01 · Kiambu County · {myFarmers.length} Registered Farmers
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/app/coop/log" style={{ textDecoration: 'none' }}>
            <button className="btn btn-orange">
              <Plus size={15} /> Log Tea Delivery
            </button>
          </Link>
          <Link to="/app/coop/payments" style={{ textDecoration: 'none' }}>
            <button className="btn btn-dark">
              <Zap size={15} /> Disburse Payments
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        {[
          { title: 'Registered Farmers', val: myFarmers.length, sub: 'Kiambu Factory', color: 'var(--loop-dark)' },
          { title: 'Pending Deliveries', val: pendingDeliveries, sub: 'Awaiting batching', color: 'var(--gold-amber)' },
          { title: 'Disbursed This Month', val: formatKES(totalThisMonth), sub: 'via Loop B2C', color: 'var(--emerald-green)' },
          { title: 'Active Batches', val: myBatches.length, sub: 'Factory settlements', color: 'var(--sky-blue)' },
        ].map((k, i) => (
          <div key={i} className="card-clean">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{k.title}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.6rem', fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>

        {/* Deliveries Log */}
        <div className="card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3>Recent Deliveries Log</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily leaf weighing & grading log</div>
            </div>
            <Link to="/app/coop/log" style={{ textDecoration: 'none' }}>
              <button className="btn btn-outline btn-sm">+ Log New</button>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentDeliveries.map(d => (
              <div key={d.id} style={{
                background: 'var(--bg-app)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: d.grade === 'A' ? 'var(--emerald-soft)' : 'var(--gold-soft)',
                    color: d.grade === 'A' ? '#065F46' : '#92400E',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontFamily: "'DM Mono', monospace",
                  }}>
                    {d.grade}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{d.farmerName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.weightKg} kg · Rate: KES {d.ratePerKg}/kg · {d.date}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: '0.95rem' }}>{formatKES(d.netAmount)}</div>
                  <span className={`status-pill ${d.status === 'paid' ? 'status-paid' : 'status-pending'}`}>
                    {d.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Batches */}
        <div className="card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3>Payment Batches</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cooperative settlement batches</div>
            </div>
            <Link to="/app/coop/payments" style={{ textDecoration: 'none' }}>
              <button className="btn btn-outline btn-sm">All Batches <ArrowRight size={12} /></button>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myBatches.map(b => (
              <div key={b.id} style={{
                background: 'var(--bg-app)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{b.period}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.farmerCount} farmers included</div>
                  </div>
                  <span className={`status-pill ${b.status === 'paid' ? 'status-paid' : b.status === 'approved' ? 'status-approved' : 'status-pending'}`}>
                    {b.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: '1rem', color: 'var(--loop-dark)' }}>
                    {formatKES(b.totalAmount)}
                  </div>
                  {b.status === 'approved' && (
                    <button className="btn btn-orange btn-sm"><Zap size={13} /> Disburse</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
