import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Banknote, CreditCard, Users,
  BarChart3, Settings, LogOut, Smartphone, Building2, Zap,
  Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import { LimaNaLoopLogo } from '../ui/LimaNaLoopLogo';

type Portal = 'farmer' | 'coop' | 'loop';

interface SidebarProps {
  portal: Portal;
}

const portalConfig: Record<Portal, {
  label: string; sublabel: string;
  badge: string;
  user: string; role: string; initials: string;
  nav: { label: string; icon: React.ReactNode; to: string }[];
}> = {
  farmer: {
    label: 'LIMA NA LOOP', sublabel: 'Farmer Portal',
    badge: 'Farmer',
    user: 'Wanjiku Kamau', role: 'Kiambu Farmer', initials: 'WK',
    nav: [
      { label: 'Dashboard', icon: <LayoutDashboard size={17} />, to: '/app/farmer' },
      { label: 'My Deliveries', icon: <Package size={17} />, to: '/app/farmer/deliveries' },
      { label: 'My Payments', icon: <Banknote size={17} />, to: '/app/farmer/payments' },
      { label: 'Credit Score', icon: <CreditCard size={17} />, to: '/app/farmer/score' },
      { label: 'Loan Request', icon: <Zap size={17} />, to: '/app/farmer/loans' },
    ],
  },
  coop: {
    label: 'LIMA NA LOOP', sublabel: 'Cooperative Portal',
    badge: 'Factory SACCO',
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
    label: 'LIMA NA LOOP', sublabel: 'Loop Platform',
    badge: 'Loop System',
    user: 'Platform Admin', role: 'Loop Operations', initials: 'LA',
    nav: [
      { label: 'Dashboard', icon: <LayoutDashboard size={17} />, to: '/app/loop' },
      { label: 'Farmer Registry', icon: <Users size={17} />, to: '/app/loop/farmers' },
      { label: 'Disbursements', icon: <Banknote size={17} />, to: '/app/loop/payments' },
      { label: 'Credit Scoring', icon: <CreditCard size={17} />, to: '/app/loop/loans' },
      { label: 'Analytics', icon: <BarChart3 size={17} />, to: '/app/loop/analytics' },
      { label: 'Settings', icon: <Settings size={17} />, to: '/app/loop/settings' },
    ],
  },
};

export default function Sidebar({ portal }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cfg = portalConfig[portal];

  const isActive = (to: string) => {
    const navItems = cfg.nav;
    const firstItem = navItems[0].to;
    if (to === firstItem) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside style={{
      width: collapsed ? 76 : 'var(--sidebar-width)',
      minWidth: collapsed ? 76 : 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--loop-dark)',
      color: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative', zIndex: 20, overflow: 'hidden',
      borderRight: '1px solid var(--border-dark)',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: collapsed ? '18px 0' : '20px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <LimaNaLoopLogo size={collapsed ? 34 : 36} showText={!collapsed} textColor="#FFFFFF" />
      </div>

      {/* Portal Switcher Buttons */}
      {!collapsed && (
        <div style={{ padding: '0 16px 14px', borderBottom: '1px solid var(--border-dark)' }}>
          <div style={{ fontSize: '0.62rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Switch Portal
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'farmer', icon: '🌿', route: '/app/farmer', label: 'Farmer' },
              { id: 'coop', icon: '🏭', route: '/app/coop', label: 'Coop' },
              { id: 'loop', icon: '🔁', route: '/app/loop', label: 'Loop' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => navigate(p.route)}
                title={p.label}
                style={{
                  flex: 1, padding: '6px 2px',
                  background: portal === p.id ? 'var(--loop-orange)' : 'rgba(255,255,255,0.06)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                  transition: 'var(--transition)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <span>{p.icon}</span>
                <span style={{ fontSize: '0.68rem' }}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: collapsed ? '16px 8px' : '16px 14px', overflowY: 'auto' }}>
        {cfg.nav.map(item => {
          const active = isActive(item.to);
          return (
            <NavLink key={item.to} to={item.to} style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }} end={item.to === cfg.nav[0].to}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 0' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12, cursor: 'pointer',
                transition: 'var(--transition)',
                background: active ? 'var(--loop-orange)' : 'transparent',
                color: active ? '#FFFFFF' : '#9CA3AF',
                fontWeight: active ? 700 : 500,
              }}>
                <span style={{ color: active ? '#FFFFFF' : 'inherit' }}>{item.icon}</span>
                {!collapsed && <span style={{ fontSize: '0.88rem' }}>{item.label}</span>}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Card */}
      {!collapsed && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            background: 'var(--loop-dark-surface)',
            border: '1px solid var(--border-dark)',
            borderRadius: 16,
            padding: '16px',
            color: '#FFFFFF',
            textAlign: 'center',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--loop-orange)', margin: '0 auto 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', color: '#FFFFFF',
            }}>
              🔁
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 2 }}>
              {portal === 'coop' ? 'Log New Batch' : portal === 'farmer' ? 'Quick Delivery Form' : 'Loop B2C Engine'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: 12 }}>
              {portal === 'coop' ? 'Record daily tea weighing' : portal === 'farmer' ? 'Check expected payout' : 'M-Pesa API connected'}
            </div>
            <button
              onClick={() => {
                if (portal === 'coop') navigate('/app/coop/log');
                else if (portal === 'farmer') navigate('/app/farmer/deliveries');
                else navigate('/app/loop/payments');
              }}
              className="btn btn-orange btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} />
              {portal === 'coop' ? 'Add Record' : portal === 'farmer' ? 'Deliveries' : 'Execute B2C'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Log Out */}
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
