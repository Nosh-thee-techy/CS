import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Wheat, Home, Users, Zap, Package } from 'lucide-react';
import { getFarmerById, getCoopById, getDeliveriesByFarmer, getLoansByFarmer, formatKES, tierColor, initials } from '../../lib/mockData';

const tabs = ['Credit Score', 'Deliveries', 'Loans', 'Chama'];

const loanStatusColor: Record<string, string> = {
  applied: 'var(--text-muted)', scored: 'var(--sky-400)', approved: 'var(--violet-400)',
  disbursed: 'var(--gold-400)', repaying: 'var(--green-400)', closed: 'var(--text-muted)',
};

export default function FarmerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const farmer = getFarmerById(id || '');
  const [activeTab, setActiveTab] = useState(0);

  if (!farmer) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>404</div>
        <div>Farmer not found</div>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/app/loop/farmers')}>← Back</button>
      </div>
    );
  }

  const coop = getCoopById(farmer.cooperativeId);
  const farmerDeliveries = getDeliveriesByFarmer(farmer.id);
  const farmerLoans = getLoansByFarmer(farmer.id);
  const tc = tierColor(farmer.creditTier);

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/app/loop/farmers')}>
        <ArrowLeft size={13} /> Farmer Registry
      </button>

      {/* Hero */}
      <div className="card" style={{ padding: 0, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${tc}, ${tc}60, transparent)` }} />
        <div style={{ padding: '22px 26px', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.1rem', fontWeight: 700, background: `linear-gradient(135deg, var(--terra-700), var(--terra-500))`, color: 'white', borderRadius: 14 }}>
            {initials(farmer.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 0 }}>{farmer.name}</h2>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', background: `${tc}18`, border: `1px solid ${tc}40`, borderRadius: 99, color: tc }}>
                {farmer.creditTier.charAt(0).toUpperCase() + farmer.creditTier.slice(1)} Tier
              </span>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[
                { icon: <Phone size={11} />, text: farmer.phone },
                { icon: <MapPin size={11} />, text: `${farmer.ward}, ${farmer.county}` },
                { icon: <Wheat size={11} />, text: `${farmer.cropType} · ${farmer.farmSizeAcres} acres` },
                { icon: <Home size={11} />, text: coop?.name },
                ...(farmer.hasChama ? [{ icon: <Users size={11} />, text: farmer.chamaName }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.77rem' }}>
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Member ID', value: farmer.memberNumber },
              { label: 'Joined', value: farmer.joinedDate.slice(0, 7) },
              { label: 'Deliveries', value: farmer.totalDeliveries },
              { label: 'Earned YTD', value: formatKES(farmer.totalEarnedYTD) },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{s.value}</div>
              </div>
            ))}
          </div>
          {farmer.loopAccountStatus === 'active' && (
            <button className="btn btn-gold" style={{ flexShrink: 0 }}><Zap size={14} /> Disburse via Loop</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px',
            fontSize: '0.85rem', fontWeight: activeTab === i ? 700 : 500,
            color: activeTab === i ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === i ? '2px solid var(--terra-500)' : '2px solid transparent',
            marginBottom: -1, transition: 'var(--transition)',
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }} className="animate-fade-in">
          {/* Score box */}
          <div className="card card-terra" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%', margin: '0 auto 16px',
              background: 'var(--bg-raised)', border: `4px solid ${tc}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '1.8rem', fontWeight: 700, color: tc }}>{farmer.creditScore}</span>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Score / 100</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>{farmer.creditTier.charAt(0).toUpperCase() + farmer.creditTier.slice(1)} Tier</div>
            <span className={`pill pill-${farmer.loopAccountStatus}`}>
              <div className="pill-dot" style={{ background: farmer.loopAccountStatus === 'active' ? 'var(--green-500)' : 'var(--gold-400)' }} />
              Loop {farmer.loopAccountStatus}
            </span>
          </div>
          {/* Breakdown */}
          <div className="card" style={{ padding: '22px 26px' }}>
            <h4 style={{ marginBottom: 4 }}>Score Breakdown</h4>
            <p style={{ fontSize: '0.77rem', marginBottom: 20 }}>Four dimensions · 25 points each</p>
            {[
              { label: 'Delivery Consistency', score: farmer.deliveryConsistency, desc: 'Regularity and volume of tea deliveries to cooperative' },
              { label: 'Chama Behaviour', score: farmer.chamaScore, desc: 'Savings group participation and contribution record' },
              { label: 'Repayment History', score: farmer.repaymentScore, desc: 'Loop loan repayment track record and timeliness' },
              { label: 'Agricultural Risk', score: farmer.riskScore, desc: 'Farm size, crop diversity, and seasonal exposure' },
            ].map(dim => (
              <div key={dim.label} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{dim.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{dim.desc}</div>
                  </div>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{dim.score}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>/25</span></span>
                </div>
                <div className="score-bar-track" style={{ height: 7 }}>
                  <div className="score-bar-fill" style={{ width: `${(dim.score / 25) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="card animate-fade-in" style={{ padding: '22px 26px' }}>
          <h4 style={{ marginBottom: 16 }}>Delivery Record</h4>
          {farmerDeliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No deliveries recorded</div>
          ) : farmerDeliveries.map((d, i) => (
            <div key={d.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '11px 0', borderBottom: i < farmerDeliveries.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: d.grade === 'A' ? 'rgba(109,158,96,0.15)' : d.grade === 'B' ? 'rgba(232,184,75,0.12)' : 'rgba(212,120,74,0.1)',
                border: `1px solid ${d.grade === 'A' ? 'rgba(109,158,96,0.3)' : d.grade === 'B' ? 'rgba(232,184,75,0.3)' : 'rgba(212,120,74,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: '0.72rem',
                color: d.grade === 'A' ? 'var(--green-400)' : d.grade === 'B' ? 'var(--gold-400)' : 'var(--terra-400)',
              }}>{d.grade}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{d.weightKg} kg · KES {d.ratePerKg}/kg · {d.date}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, color: 'var(--text-primary)' }}>{formatKES(d.netAmount)}</div>
                <div style={{ fontSize: '0.68rem', color: d.status === 'paid' ? 'var(--green-400)' : 'var(--gold-400)', fontWeight: 600, marginTop: 2 }}>{d.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 2 && (
        <div className="card animate-fade-in" style={{ padding: '22px 26px' }}>
          <h4 style={{ marginBottom: 16 }}>Loan History</h4>
          {farmerLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No loans on record</div>
          ) : farmerLoans.map((loan, i) => (
            <div key={loan.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '11px 0', borderBottom: i < farmerLoans.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{loan.purpose}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{loan.id} · {loan.appliedDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, color: 'var(--text-primary)' }}>{formatKES(loan.amount)}</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: loanStatusColor[loan.status], marginTop: 2, textTransform: 'uppercase' }}>{loan.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 3 && (
        <div className="card animate-fade-in" style={{ padding: '28px 26px' }}>
          {farmer.hasChama ? (
            <>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>👥</div>
              <h4 style={{ marginBottom: 6 }}>{farmer.chamaName}</h4>
              <p style={{ fontSize: '0.82rem' }}>Savings group membership confirmed. Chama financial records will be integrated here once the data partner API is connected.</p>
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-raised)', borderRadius: 9, border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Chama membership contributes <strong style={{ color: 'var(--text-primary)' }}>{farmer.chamaScore}/25</strong> to this farmer's credit score.
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <Users size={28} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div>No chama membership recorded.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
