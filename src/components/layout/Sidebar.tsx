import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/lima-na-loop-logo.png';
import {
  LayoutDashboard, Map as MapIcon, Smartphone, Activity, Share2, Puzzle,
  Banknote, LogOut, ChevronLeft, ChevronRight, Plus, Package, Users, BarChart3
} from 'lucide-react';

type Portal = 'coop' | 'loop';

interface SidebarProps {
  portal: Portal;
}

const portalConfig: Record<Portal, {
  label: string; sublabel: string;
  user: string; role: string; initials: string;
  nav: { label: string; icon: React.ReactNode; to: string }[];
}> = {
  coop: {
    label: 'LIMA NA LOOP', sublabel: 'Cooperative Portal',
    user: 'Kiambu Tea SACCO', role: 'Factory Manager', initials: 'KT',
    nav: [
      { label: 'Dashboard', icon: <LayoutDashboard size={17} />, to: '/app/coop' },
      { label: 'Log Delivery', icon: <Package size={17} />, to: '/app/coop/log' },
      { label: 'Farmer Registry', icon: <Users size={17} />, to: '/app/coop/farmers' },
      { label: 'Payment Batches', icon: <Banknote size={17} />, to: '/app/coop/payments' },
      { label: 'Reports', icon: <BarChart3 size={17} />, to: '/app/coop/reports' },
    ],
  },
  loop: {
    label: 'LIMA NA LOOP', sublabel: 'Branch desk',
    user: 'Jane Mwangi', role: 'Loan officer', initials: 'JM',
    nav: [
      { label: 'Portfolio', icon: <LayoutDashboard size={17} />, to: '/app/loop' },
      { label: 'Map', icon: <MapIcon size={17} />, to: '/app/loop/map' },
      { label: 'Phone', icon: <Smartphone size={17} />, to: '/app/loop/phone' },
      { label: 'Logs', icon: <Activity size={17} />, to: '/app/loop/logs' },
      { label: 'Graph', icon: <Share2 size={17} />, to: '/app/loop/graph' },
      { label: 'Tech', icon: <Puzzle size={17} />, to: '/app/loop/partners' },
    ],
  },
};

export default function Sidebar({ portal }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cfg = portalConfig[portal];

  const isActive = (to: string) => {
    const firstItem = cfg.nav[0].to;
    if (to === firstItem) {
      return location.pathname === to
        || location.pathname.startsWith('/app/loop/scorecard')
        || location.pathname.startsWith('/app/loop/farmers');
    }
    return location.pathname.startsWith(to);
  };

  return (
    <aside style={{
      width: collapsed ? 84 : 'var(--sidebar-width)',
      minWidth: collapsed ? 84 : 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--loop-dark)',
      color: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative', zIndex: 20, overflow: 'hidden',
      borderRight: '1px solid var(--border-dark)',
    }}>
      <div style={{
        padding: collapsed ? '22px 0' : '22px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <img
          src={logoImg}
          alt="Lima na Loop Logo"
          style={{
            width: 36,
            height: 36,
            objectFit: 'contain',
            borderRadius: 8,
            flexShrink: 0,
          }}
        />
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {cfg.label}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--loop-orange)', marginTop: 3, fontWeight: 800, letterSpacing: '0.05em' }}>
              {cfg.sublabel.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={{ padding: '0 16px 14px', borderBottom: '1px solid var(--border-dark)' }}>
          <div style={{ fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Switch desk
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'coop', route: '/app/coop', label: 'Coop' },
              { id: 'loop', route: '/app/loop', label: 'Officer' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => navigate(p.route)}
                style={{
                  flex: 1, padding: '7px 2px',
                  background: portal === p.id ? 'var(--loop-orange)' : 'rgba(255,255,255,0.06)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: collapsed ? '16px 8px' : '16px 14px', overflowY: 'auto' }}>
        {cfg.nav.map(item => {
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === cfg.nav[0].to}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.to);
              }}
              style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 0' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                flexDirection: collapsed ? 'column' : 'row',
                borderRadius: 12, cursor: 'pointer',
                transition: 'var(--transition)',
                background: active ? 'var(--loop-orange)' : 'transparent',
                color: active ? '#FFFFFF' : '#9CA3AF',
                fontWeight: active ? 700 : 500,
              }}>
                <span style={{ color: active ? '#FFFFFF' : 'inherit' }}>{item.icon}</span>
                <span style={{ fontSize: collapsed ? '0.62rem' : '0.88rem' }}>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && portal === 'loop' && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            background: 'var(--loop-dark-surface)',
            border: '1px solid var(--border-dark)',
            borderRadius: 16,
            padding: '16px',
            color: '#FFFFFF',
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 4 }}>See the why</div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: 12 }}>
              Co-op deliveries, chama, guarantees, weather — then write a stance the farmer can get by SMS.
            </div>
            <button
              onClick={() => navigate('/app/loop/payments')}
              className="btn btn-orange btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} /> Loop B2C batches
            </button>
          </div>
        </div>
      )}

      {!collapsed && portal === 'coop' && (
        <div style={{ padding: '0 16px 14px' }}>
          <button
            onClick={() => navigate('/app/coop/log')}
            className="btn btn-orange btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Plus size={14} /> Add Record
          </button>
        </div>
      )}

      <div style={{
        padding: collapsed ? '14px 0' : '14px 16px',
        borderTop: '1px solid var(--border-dark)',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <LogOut size={15} color="#9CA3AF" />
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 600 }}>LOG OUT</span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
