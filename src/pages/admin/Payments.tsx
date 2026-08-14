import React, { useState } from 'react';
import { paymentBatches, formatKES } from '../../lib/mockData';
import type { PaymentStatus } from '../../lib/mockData';
import { Zap, CheckCircle2, Clock, AlertCircle, Users, Building2 } from 'lucide-react';

const columns: { status: PaymentStatus; label: string; color: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'Pending', color: 'var(--text-muted)', icon: <Clock size={13} /> },
  { status: 'approved', label: 'Approved', color: 'var(--sky-400)', icon: <CheckCircle2 size={13} /> },
  { status: 'processing', label: 'Processing', color: 'var(--violet-400)', icon: <Zap size={13} /> },
  { status: 'paid', label: 'Paid', color: 'var(--green-400)', icon: <CheckCircle2 size={13} /> },
];

function BatchCard({ batch, color }: { batch: typeof paymentBatches[0]; color: string }) {
  return (
    <div className="card" style={{ padding: '14px 16px', marginBottom: 10, cursor: 'pointer' }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{batch.description}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>{batch.id}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        <Building2 size={10} color="var(--text-muted)" />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{batch.cooperativeName}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{formatKES(batch.totalAmount)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Users size={10} color="var(--text-muted)" />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{batch.farmerCount} farmers</span>
          </div>
        </div>
        {batch.loopBatchRef && (
          <div style={{ fontSize: '0.64rem', color: 'var(--gold-300)', background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 5, padding: '2px 7px' }}>
            🔁 {batch.loopBatchRef}
          </div>
        )}
      </div>
      {batch.status === 'pending' && (
        <button className="btn btn-green btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          <CheckCircle2 size={11} /> Approve
        </button>
      )}
      {batch.status === 'approved' && (
        <button className="btn btn-gold btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          <Zap size={11} /> Execute via Loop
        </button>
      )}
    </div>
  );
}

export default function Payments() {
  const getByStatus = (s: PaymentStatus) => paymentBatches.filter(b => b.status === s);
  const pendingTotal = paymentBatches.filter(b => b.status === 'pending').reduce((a, b) => a + b.totalAmount, 0);

  return (
    <div>
      <div className="page-header animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Loop Disbursements</h2>
          <p>Cooperative payment batches · B2C execution via Loop · M-Pesa</p>
        </div>
        <button className="btn btn-primary"><Zap size={14} /> Create Batch</button>
      </div>

      {pendingTotal > 0 && (
        <div className="card animate-fade-up delay-1" style={{ padding: '14px 18px', marginBottom: 18, border: '1px solid rgba(232,184,75,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={15} color="var(--gold-400)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatKES(pendingTotal)}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> pending across {getByStatus('pending').length} batches</span>
          </div>
          <button className="btn btn-gold btn-sm"><Zap size={12} /> Execute Approved</button>
        </div>
      )}

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="animate-fade-up delay-2">
        {columns.map(col => {
          const batches = getByStatus(col.status);
          const total = batches.reduce((a, b) => a + b.totalAmount, 0);
          return (
            <div key={col.status}>
              <div style={{
                padding: '9px 12px', marginBottom: 12,
                background: 'var(--bg-raised)', borderRadius: 9,
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: col.color }}>
                  {col.icon}
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{col.label}</span>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: `${col.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.66rem', fontWeight: 700, color: col.color }}>{batches.length}</span>
                </div>
                {total > 0 && <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: "'DM Mono',monospace" }}>{formatKES(total)}</span>}
              </div>
              {batches.map(b => <BatchCard key={b.id} batch={b} color={col.color} />)}
              {batches.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.78rem', opacity: 0.5 }}>—</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
