import React from 'react';
import { Link } from 'react-router-dom';
import {
  farmers, cooperatives, paymentBatches, loans, kpis,
  productionComparison, growthActivity, formatKES
} from '../../lib/mockData';
import {
  Zap, ArrowUpRight, Play, Sun, Wind, Droplets, Sliders
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--loop-dark)', color: '#FFFFFF', padding: '8px 12px',
      borderRadius: 10, boxShadow: '0 4px 14px rgba(0,0,0,0.2)', fontSize: '0.78rem',
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{ fontWeight: 800, marginBottom: 4, color: 'var(--loop-orange)' }}>{label}</div>
      <div>Current Year: {payload[0]?.value} kg</div>
      <div style={{ opacity: 0.8 }}>Last Year: {payload[1]?.value} kg</div>
    </div>
  );
};

export default function LoopDashboard() {
  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ─── TOP ROW: 3 KEY WIDGETS (Weather, Plant Activity, Hero Banner) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 20 }}>

        {/* CARD 1: Weather & Tea Plucking Conditions */}
        <div className="card-clean" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tea Plucking Weather</div>
              <h3 style={{ fontSize: '1.25rem', marginTop: 2 }}>Monday</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(14th August, 2026)</div>
            </div>

            <div style={{
              width: 86, height: 86, borderRadius: '50%',
              background: 'conic-gradient(#FF5F00 0% 75%, #F3F4F6 75% 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 0 0 10px #FFFFFF',
              position: 'relative',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1 }}>25°C</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>High Temp</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--loop-dark)', lineHeight: 1 }}>
              29°C
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
              9.35 sunlight hours · Ideal tea leaf plucking quality
            </div>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-light)',
            fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Wind size={13} color="var(--loop-orange)" /> 0km/h</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Droplets size={13} color="var(--loop-orange)" /> 86% Hum</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Sun size={13} color="var(--gold-amber)" /> 1007hPa</span>
          </div>
        </div>

        {/* CARD 2: Plant Growth & Delivery Activity */}
        <div className="card-clean" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <h4 style={{ fontSize: '0.95rem' }}>Tea Growth & Delivery Activity</h4>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Plucking cycle milestones</div>
            </div>
            <span className="status-pill status-paid" style={{ fontSize: '0.68rem' }}>Weekly</span>
          </div>

          <div style={{ width: '100%', height: 110, marginTop: 6 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthActivity} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <Line
                  type="monotone"
                  dataKey="cm"
                  stroke="var(--loop-dark)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--loop-orange)', r: 6, stroke: 'var(--loop-dark)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800,
            marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-light)',
          }}>
            <span>Seed Phase (W1)</span>
            <span>Final Growth (W3)</span>
            <span style={{ color: 'var(--loop-orange)' }}>Vegetation (W2)</span>
          </div>
        </div>

        {/* CARD 3: Featured Harvest Visual Banner */}
        <div style={{
          position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          boxShadow: 'var(--shadow-card)', minHeight: 200,
        }}>
          <img
            src="/hero-farmer.png"
            alt="Kenyan Tea Farmer"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(20,26,33,0.1) 0%, rgba(20,26,33,0.85) 100%)',
            padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            color: '#FFFFFF',
          }}>
            <div style={{
              background: 'var(--loop-orange)', color: '#FFFFFF',
              padding: '3px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 800,
              display: 'inline-block', width: 'fit-content', marginBottom: 6,
            }}>
              KENYA TEA BELT
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.25 }}>
              Kiambu & Nandi High Season
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.88, marginTop: 4 }}>
              680,000 Smallholders connected via Loop
            </div>
          </div>
        </div>

      </div>

      {/* ─── MAIN ROW: LARGE STACKED BAR CHART & DARK FEATURED CARD ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20 }}>

        {/* LEFT: Summary of Production & Payout Settlement Chart Card */}
        <div className="card-clean" style={{ padding: '24px 26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Summary of Production & Payouts</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Comparing current year vs last year monthly delivery volume (kg)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.75rem', fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--loop-orange)' }} />
                  Current Year
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--loop-dark)' }} />
                  Last Year
                </span>
              </div>

              <button style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-app)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Sliders size={14} color="var(--text-main)" />
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="currentYear" stackId="a" fill="var(--loop-orange)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastYear" stackId="a" fill="var(--loop-dark)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Official LOOP B2C Engine Dark Card */}
        <div className="card-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              width: '100%', height: 130, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #1E2630 0%, #141A21 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 18, overflow: 'hidden', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src="/hero-coop.png"
                alt="Cooperative Office"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(20, 26, 33, 0.4)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem' }}>
                Lima na Loop B2C Engine
              </h3>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--loop-orange)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: 'var(--shadow-orange)',
              }}>
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              </div>
            </div>

            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--loop-orange)', fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>
                <span>18.90 M-Pesa/sec</span>
                <span>36.00 Peak</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--loop-orange)', borderRadius: 99 }} />
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55 }}>
              Loop B2C automatically calculates factory weights, deducts SACCO loans & levies, and disburses net funds to farmer M-Pesa wallets in under 60 seconds.
            </p>
          </div>

          <button className="btn btn-orange" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
            <Zap size={15} /> Execute Pending Batches
          </button>
        </div>

      </div>

      {/* ─── BOTTOM SECTION: FARMER CREDIT SCORE REGISTRY ─── */}
      <div className="card-clean">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3>Farmer Credit Score Registry</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified data from cooperatives, chama activity & repayment history</div>
          </div>
          <Link to="/app/loop/farmers" style={{ textDecoration: 'none' }}>
            <button className="btn btn-outline btn-sm">
              View All Registry <ArrowUpRight size={13} />
            </button>
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Farmer</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Cooperative</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>County</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Credit Score</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Tier</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Loop Status</th>
                <th style={{ textAlign: 'right', padding: '10px 14px' }}>YTD Earnings</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(f => {
                const coop = cooperatives.find(c => c.id === f.cooperativeId);
                return (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--text-main)' }}>
                      <div>{f.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{f.memberNumber}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{coop?.shortName}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{f.county}</td>
                    <td style={{ padding: '12px 14px', fontFamily: "'DM Mono', monospace", fontWeight: 800, color: 'var(--loop-dark)' }}>
                      {f.creditScore}/100
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`status-pill ${f.creditTier === 'platinum' ? 'status-paid' : f.creditTier === 'gold' ? 'status-pending' : 'status-approved'}`}>
                        {f.creditTier}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`status-pill ${f.loopAccountStatus === 'active' ? 'status-paid' : 'status-pending'}`}>
                        {f.loopAccountStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: "'DM Mono', monospace", fontWeight: 800 }}>
                      {formatKES(f.totalEarnedYTD)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
