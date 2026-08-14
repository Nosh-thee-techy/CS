import React, { useState } from 'react';
import { formatKES } from '../../lib/mockData';
import type { PaymentBatch, PaymentStatus } from '../../lib/mockData';
import { Zap, CheckCircle2, Clock } from 'lucide-react';
import { usePlatform } from '../../lib/PlatformContext';
import { api } from '../../lib/api';

const columns: { status: PaymentStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'Pending', color: 'var(--text-muted)', icon: <Clock size={13} /> },
  { status: 'approved', label: 'Approved', color: 'var(--sky-blue)', icon: <CheckCircle2 size={13} /> },
  { status: 'processing', label: 'Processing', color: 'var(--loop-orange)', icon: <Zap size={13} /> },
  { status: 'paid', label: 'Paid', color: 'var(--emerald-green)', icon: <CheckCircle2 size={13} /> },
];

function BatchCard({ batch, onDisburse, busy }: { batch: PaymentBatch; onDisburse: (cooperativeId: string) => void; busy: boolean }) {
  return (
    <div className="card-clean" style={{ padding: 14, marginBottom: 10 }}>
      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{batch.description}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '6px 0' }}>{batch.cooperativeName}</div>
      <div className="tabular" style={{ fontWeight: 900 }}>{formatKES(batch.totalAmount)}</div>
      {batch.loopBatchRef && (
        <div style={{ fontSize: '0.68rem', color: 'var(--loop-orange)', fontWeight: 800, marginTop: 6 }}>{batch.loopBatchRef}</div>
      )}
      {batch.status === 'approved' && (
        <button
          className="btn btn-orange btn-sm"
          style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}
          disabled={busy}
          onClick={() => onDisburse(batch.cooperativeId)}
        >
          <Zap size={12} /> {busy ? 'Sending…' : 'Execute via Loop'}
        </button>
      )}
    </div>
  );
}

export default function Payments() {
  const { paymentBatches, refresh } = usePlatform();
  const [busyCoop, setBusyCoop] = useState('');
  const [notice, setNotice] = useState('');
  const getByStatus = (s: PaymentStatus) => paymentBatches.filter((b) => b.status === s);
  const pendingTotal = paymentBatches.filter((b) => b.status === 'pending').reduce((a, b) => a + b.totalAmount, 0);

  async function disburse(cooperativeId: string) {
    setBusyCoop(cooperativeId);
    setNotice('');
    try {
      await api.bulkPayout(cooperativeId);
      await refresh();
      setNotice(`Bulk payout sent for ${cooperativeId}.`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Bulk payout failed');
    } finally {
      setBusyCoop('');
    }
  }

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Loop B2C disbursements</h2>
        <p>Factory settlement batches. Credit decisions still happen on the scorecard — this is the payout rail.</p>
      </div>

      {notice && (
        <div className="card-clean" style={{ marginBottom: 16, fontWeight: 700, fontSize: '0.85rem' }}>{notice}</div>
      )}

      {pendingTotal > 0 && (
        <div className="card-clean" style={{ marginBottom: 16 }}>
          <span className="tabular" style={{ fontWeight: 900 }}>{formatKES(pendingTotal)}</span>
          <span style={{ color: 'var(--text-muted)' }}> pending across {getByStatus('pending').length} batches</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {columns.map((col) => {
          const batches = getByStatus(col.status);
          return (
            <div key={col.status}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: col.color, fontWeight: 800, fontSize: '0.8rem' }}>
                {col.icon} {col.label}
                <span className="status-pill status-pending">{batches.length}</span>
              </div>
              {batches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  busy={busyCoop === batch.cooperativeId}
                  onDisburse={disburse}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
