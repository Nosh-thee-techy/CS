import React, { useState } from 'react';
import { formatKES } from '../../lib/mockData';
import type { PaymentStatus } from '../../lib/mockData';
import { Zap, CheckCircle2, Clock, AlertCircle, Users } from 'lucide-react';
import { usePlatform } from '../../lib/PlatformContext';
import { api } from '../../lib/api';

const stages: { status: PaymentStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'Pending Approval', color: 'var(--text-muted)', icon: <Clock size={13} /> },
  { status: 'approved', label: 'Approved for Payout', color: 'var(--sky-blue)', icon: <CheckCircle2 size={13} /> },
  { status: 'processing', label: 'Processing B2C', color: 'var(--gold-amber)', icon: <Zap size={13} /> },
  { status: 'paid', label: 'Disbursed', color: 'var(--emerald-green)', icon: <CheckCircle2 size={13} /> },
];

export default function CoopPayments() {
  const { paymentBatches, refresh } = usePlatform();
  const [active, setActive] = useState<PaymentStatus | 'all'>('all');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const myBatches = paymentBatches.filter(b => b.cooperativeId === 'C001');
  const visible = active === 'all' ? myBatches : myBatches.filter(b => b.status === active);

  const pendingTotal = myBatches.filter(b => b.status === 'pending').reduce((a, b) => a + b.totalAmount, 0);
  const approvedBatches = myBatches.filter(b => b.status === 'approved');

  async function runBulk() {
    setBusy('bulk');
    setNotice('');
    try {
      await api.bulkPayout('C001');
      await refresh();
      setNotice('Bulk payout sent for Kiambu SACCO.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Bulk payout failed');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Payment Batches & Disbursements</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Approve and disburse farmer payments via Loop B2C · M-Pesa Integration</p>
        </div>
        <button className="btn btn-orange">+ Create New Batch</button>
      </div>
      {notice && (
        <div className="card-clean" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{notice}</div>
      )}

      {pendingTotal > 0 && (
        <div className="card-clean" style={{
          padding: '14px 20px',
          border: '1px solid var(--gold-amber)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <AlertCircle size={18} color="var(--gold-amber)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatKES(pendingTotal)}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> pending approval across {myBatches.filter(b => b.status === 'pending').length} settlement batches.</span>
          </div>
          {approvedBatches.length > 0 && (
            <button className="btn btn-orange btn-sm" disabled={Boolean(busy)} onClick={() => void runBulk()}>
              <Zap size={13} /> {busy === 'bulk' ? 'Sending…' : 'Execute Approved Batches'}
            </button>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card-clean" style={{ padding: '10px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActive('all')}
          style={{
            padding: '7px 16px', borderRadius: 99, border: 'none',
            background: active === 'all' ? 'var(--loop-dark)' : 'var(--bg-app)',
            color: active === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem',
            transition: 'var(--transition)',
          }}
        >
          All Batches ({myBatches.length})
        </button>
        {stages.map(s => {
          const cnt = myBatches.filter(b => b.status === s.status).length;
          const isActive = active === s.status;
          return (
            <button
              key={s.status}
              onClick={() => setActive(s.status)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 99, border: 'none',
                background: isActive ? 'var(--loop-orange)' : 'var(--bg-app)',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem',
                transition: 'var(--transition)',
              }}
            >
              {s.icon}
              {s.label} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Batch Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map((batch) => {
          const stage = stages.find(s => s.status === batch.status)!;
          return (
            <div key={batch.id} className="card-clean" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>{batch.id}</span>
                    <span className={`status-pill ${batch.status === 'paid' ? 'status-paid' : batch.status === 'approved' ? 'status-approved' : 'status-pending'}`}>
                      {stage.label}
                    </span>
                    {batch.loopBatchRef && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--loop-orange)', background: 'var(--loop-orange-soft)', borderRadius: 6, padding: '2px 8px' }}>
                        🔁 {batch.loopBatchRef}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{batch.description}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span><Users size={12} style={{ display: 'inline', marginRight: 4 }} /> {batch.farmerCount} Farmers</span>
                    <span>Created: {batch.createdDate}</span>
                    {batch.disbursedDate && <span style={{ color: 'var(--emerald-green)', fontWeight: 700 }}>✓ Disbursed {batch.disbursedDate}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{formatKES(batch.totalAmount)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg {formatKES(Math.round(batch.totalAmount / batch.farmerCount))}/farmer</div>
                  </div>

                  <div>
                    {batch.status === 'pending' && (
                      <button className="btn btn-dark btn-sm"><CheckCircle2 size={12} /> Approve Batch</button>
                    )}
                    {batch.status === 'approved' && (
                      <button className="btn btn-orange btn-sm" disabled={Boolean(busy)} onClick={() => void runBulk()}>
                        <Zap size={12} /> {busy ? 'Sending…' : 'Disburse via Loop'}
                      </button>
                    )}
                    {batch.status === 'paid' && (
                      <button className="btn btn-outline btn-sm">Statement</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
