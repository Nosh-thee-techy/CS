import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronRight, ArrowUpRight } from 'lucide-react';
import { loans, formatKES } from '../../lib/mockData';
import type { LoanStatus } from '../../lib/mockData';

const pipeline: { status: LoanStatus; label: string; color: string }[] = [
  { status: 'applied', label: 'Applied', color: 'var(--text-muted)' },
  { status: 'scored', label: 'Scored', color: 'var(--sky-400)' },
  { status: 'approved', label: 'Approved', color: 'var(--violet-400)' },
  { status: 'disbursed', label: 'Disbursed', color: 'var(--gold-400)' },
  { status: 'repaying', label: 'Repaying', color: 'var(--green-400)' },
  { status: 'closed', label: 'Closed', color: 'var(--text-muted)' },
];

const loanStatusColor: Record<LoanStatus, string> = {
  applied: 'var(--text-muted)', scored: 'var(--sky-400)', approved: 'var(--violet-400)',
  disbursed: 'var(--gold-400)', repaying: 'var(--green-400)', closed: 'var(--text-muted)',
};

export default function Loans() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = filterStatus === 'all' ? loans : loans.filter(l => l.status === filterStatus);
  const selectedLoan = loans.find(l => l.id === selected);
  const statusCounts: Record<string, number> = {};
  loans.forEach(l => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });

  return (
    <div>
      <div className="page-header animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Credit Scoring & Loans</h2>
          <p>Applied → Scored → Approved → Disbursed (Loop) → Repaying → Closed</p>
        </div>
      </div>

      {/* Pipeline */}
      <div className="card animate-fade-up delay-1" style={{ padding: '12px 18px', marginBottom: 18, overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>
          {pipeline.map((stage, i) => {
            const count = statusCounts[stage.status] || 0;
            const active = filterStatus === stage.status;
            return (
              <React.Fragment key={stage.status}>
                <button onClick={() => setFilterStatus(active ? 'all' : stage.status)} style={{
                  background: active ? `${stage.color}18` : 'transparent',
                  border: active ? `1px solid ${stage.color}40` : '1px solid transparent',
                  borderRadius: 8, padding: '8px 14px', cursor: 'pointer', transition: 'var(--transition)',
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage.label}</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}>{count}</div>
                </button>
                {i < pipeline.length - 1 && <ChevronRight size={13} color="var(--border-strong)" style={{ flexShrink: 0 }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLoan ? '1fr 370px' : '1fr', gap: 16 }}>
        {/* List */}
        <div className="card animate-fade-up delay-2" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>{filtered.length} loans {filterStatus !== 'all' ? `· ${filterStatus}` : ''}</div>
          {filtered.map((loan, i) => {
            const color = loanStatusColor[loan.status];
            const isSelected = selected === loan.id;
            return (
              <div key={loan.id} onClick={() => setSelected(isSelected ? null : loan.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '11px 10px',
                borderRadius: 8, cursor: 'pointer', transition: 'var(--transition)',
                background: isSelected ? 'var(--bg-hover)' : 'transparent',
                border: isSelected ? '1px solid var(--border-strong)' : '1px solid transparent',
                marginBottom: 4,
              }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{loan.farmerName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loan.purpose}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{formatKES(loan.amount)}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color }}>{loan.status}</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{loan.creditScoreAtApplication}</div>
                  <div style={{ fontSize: '0.52rem', color: 'var(--text-muted)' }}>score</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedLoan && (
          <div className="card card-terra animate-scale-in" style={{ padding: '20px 22px', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedLoan.farmerName}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedLoan.id}</div>
              </div>
              <Link to={`/app/loop/farmers/${selectedLoan.farmerId}`} style={{ textDecoration: 'none' }}>
                <button className="btn btn-ghost btn-sm"><ArrowUpRight size={12} /> Profile</button>
              </Link>
            </div>
            {[
              { label: 'Amount', value: formatKES(selectedLoan.amount) },
              { label: 'Purpose', value: selectedLoan.purpose },
              { label: 'Interest', value: `${selectedLoan.interestRate}% p.a.` },
              { label: 'Status', value: selectedLoan.status.toUpperCase() },
              { label: 'Applied', value: selectedLoan.appliedDate },
              ...(selectedLoan.approvedDate ? [{ label: 'Approved', value: selectedLoan.approvedDate }] : []),
              ...(selectedLoan.disbursedDate ? [{ label: 'Disbursed', value: selectedLoan.disbursedDate }] : []),
              ...(selectedLoan.dueDate ? [{ label: 'Due Date', value: selectedLoan.dueDate }] : []),
              ...(selectedLoan.loopRef ? [{ label: 'Loop Ref', value: selectedLoan.loopRef }] : []),
              { label: 'Score at Application', value: `${selectedLoan.creditScoreAtApplication}/100` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: 180 }}>{row.value}</span>
              </div>
            ))}
            {selectedLoan.status === 'repaying' && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Repayment</span>
                  <span style={{ color: 'var(--green-400)', fontWeight: 600 }}>{Math.round((selectedLoan.repaidAmount / selectedLoan.amount) * 100)}%</span>
                </div>
                <div className="score-bar-track" style={{ height: 6 }}>
                  <div style={{ height: '100%', width: `${(selectedLoan.repaidAmount / selectedLoan.amount) * 100}%`, background: 'var(--green-500)', borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatKES(selectedLoan.repaidAmount)} / {formatKES(selectedLoan.amount)}</div>
              </div>
            )}
            {selectedLoan.status === 'approved' && (
              <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
                <Zap size={14} /> Disburse via Loop
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
