import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Smartphone, Building2, Zap, ShieldCheck } from 'lucide-react';
import { LimaNaLoopLogo } from '../components/ui/LimaNaLoopLogo';

const portals = [
  {
    id: 'farmer',
    icon: '🌿',
    title: 'Farmer Portal',
    subtitle: 'Smallholder M-Pesa Wallet',
    desc: 'Itemised payout statements, delivery confirmation SMS & agricultural credit score.',
    route: '/app/farmer',
    badge: 'M-Pesa Connected',
  },
  {
    id: 'coop',
    icon: '🏭',
    title: 'Cooperative Portal',
    subtitle: 'Factory & SACCO Management',
    desc: 'Digital leaf weighing, tea quality grading & automated payment batch approval.',
    route: '/app/coop',
    badge: 'KTG-01 Factory',
  },
  {
    id: 'loop',
    icon: '🔁',
    title: 'Loop Platform',
    subtitle: 'Financial Engine & Credit Scoring',
    desc: 'Central credit engine, risk analytics & Daraja 3.0 B2C payout execution.',
    route: '/app/loop',
    badge: 'Loop Financial Infra',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handlePortalSelect = (id: string, route: string) => {
    setSelectedId(id);
    setTimeout(() => {
      navigate(route);
    }, 350);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #F3F4F6 0%, #EFF1F5 60%, #FFFFFF 100%)',
      display: 'grid',
      gridTemplateColumns: '1.05fr 0.95fr',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Decorative Brand Accent Background Glow */}
      <div style={{
        position: 'absolute', top: -100, left: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 95, 0, 0.12) 0%, rgba(255,255,255,0) 70%)',
        pointerEvents: 'none',
      }} />

      {/* ─── LEFT COLUMN: HERO POSTER TYPOGRAPHY & PORTAL SELECTOR ─── */}
      <div style={{
        padding: '56px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Brand Header Badge */}
        <div>
          <div style={{ marginBottom: 32 }}>
            <LimaNaLoopLogo size={48} showText={true} textColor="var(--loop-dark)" />
          </div>

          {/* Hero Main Headline */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--loop-orange)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Aesthetic Agricultural Credit & Supply Chain Financing
            </div>
            <h1 style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              color: 'var(--loop-dark)',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              marginBottom: 14,
            }}>
              Lima na <br />
              <span style={{ color: 'var(--loop-orange)' }}>Loop</span>
            </h1>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: 480,
              fontWeight: 500,
            }}>
              100% payment transparency and instant working capital for Kenya's <strong>680,000 smallholder tea farmers</strong>.
            </p>
          </div>

          {/* Launch Date Tag */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            fontSize: '0.78rem', fontWeight: 800, color: 'var(--loop-dark)',
            marginBottom: 32, letterSpacing: '0.08em',
          }}>
            <span style={{ borderBottom: '2px solid var(--loop-orange)', paddingBottom: 2 }}>AUGUST 2026</span>
            <span>·</span>
            <span>KENYA TEA FACTORY INFRASTRUCTURE</span>
          </div>
        </div>

        {/* Portal Selection Cards (100% English & LOOP Branding!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--loop-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Select Portal to Access Dashboard:
          </div>

          {portals.map(p => {
            const isSelected = selectedId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handlePortalSelect(p.id, p.route)}
                style={{
                  background: isSelected ? 'var(--loop-dark)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--loop-dark)',
                  border: isSelected ? '2px solid var(--loop-dark)' : '1px solid var(--border-light)',
                  borderRadius: 16,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-card)',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--loop-orange)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: isSelected ? 'var(--loop-orange)' : 'var(--loop-orange-soft)',
                    color: isSelected ? '#FFFFFF' : 'var(--loop-orange)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', fontWeight: 800, flexShrink: 0,
                  }}>
                    {p.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>{p.title}</span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        padding: '2px 8px', borderRadius: 99,
                        background: isSelected ? 'rgba(255,255,255,0.15)' : 'var(--bg-app)',
                        color: isSelected ? 'var(--loop-orange)' : 'var(--text-secondary)',
                      }}>
                        {p.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', opacity: isSelected ? 0.85 : 0.7, marginTop: 3 }}>
                      {p.desc}
                    </div>
                  </div>
                </div>

                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: isSelected ? 'var(--loop-orange)' : 'var(--bg-app)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isSelected ? '#FFFFFF' : 'var(--loop-dark)', flexShrink: 0,
                }}>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 32,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <ShieldCheck size={16} color="var(--loop-orange)" /> 77 KTDA Affiliated Factories
          </span>
          <span>·</span>
          <span>KSh 140B Industry Infrastructure</span>
        </div>

      </div>

      {/* ─── RIGHT COLUMN: TEA FARMER HERO PANEL WITH LOOP BRAND OVERLAY ─── */}
      <div style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}>
        <img
          src="/hero-poster.png"
          alt="Kenyan Tea Farmer"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        {/* Overlay styling */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(20,26,33,0.15) 0%, rgba(20,26,33,0.85) 100%)',
        }} />

        {/* Overlay Card on Poster */}
        <div style={{
          position: 'absolute', bottom: 48, left: 40, right: 40,
          background: 'rgba(20, 26, 33, 0.9)',
          backdropFilter: 'blur(16px)',
          borderRadius: 20, padding: '24px 28px',
          color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.55, marginBottom: 14 }}>
            "The money received as bonus was deducted by banks and SACCOs without breakdown. With Lima na Loop, we see every shilling before it hits M-Pesa."
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--loop-orange)', fontWeight: 800 }}>
            — Patrick Langat, Tea Farmer · Bomet County
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: '1.2rem', color: 'var(--loop-orange)' }}>680,000</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>Smallholder Farmers</div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: '1.2rem', color: '#FFFFFF' }}>KSh 4.2B</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>Saved in Disputes</div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: '1.2rem', color: 'var(--loop-orange)' }}>&lt; 60 sec</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>M-Pesa Payout Speed</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
