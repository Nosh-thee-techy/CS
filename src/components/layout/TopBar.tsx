import React, { useState } from 'react';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';

type Portal = 'farmer' | 'coop' | 'loop';

const portalUserInfo: Record<Portal, { name: string; subtitle: string; initial: string; badge: string }> = {
  farmer: { name: 'Wanjiku Kamau', subtitle: 'Kiambu / Tea Farmer', initial: 'WK', badge: 'Farmer Portal' },
  coop: { name: 'Kiambu Factory Admin', subtitle: 'Kiambu / Factory #01', initial: 'KF', badge: 'Cooperative' },
  loop: { name: 'Loop Admin', subtitle: 'Central Platform / Kenya', initial: 'LA', badge: 'Loop Platform' },
};

export default function TopBar({ portal }: { portal: Portal }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const user = portalUserInfo[portal];

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: '#FFFFFF',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky', top: 0, zIndex: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }}>
      {/* Search Input Pill */}
      <div className="search-input-pill">
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search tea farmer, factory, transaction..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Chat Button */}
        <button style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--bg-app)', border: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)',
          transition: 'var(--transition)',
        }}>
          <MessageSquare size={16} />
        </button>

        {/* Notifications Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--bg-app)', border: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'var(--transition)', position: 'relative',
            }}
          >
            <Bell size={16} />
            <div style={{
              position: 'absolute', top: 8, right: 8,
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--loop-orange)', border: '2px solid #FFFFFF',
            }} />
          </button>

          {notifOpen && (
            <div className="animate-fade" style={{
              position: 'absolute', top: 48, right: 0, width: 300,
              background: '#FFFFFF', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', padding: 16,
              boxShadow: 'var(--shadow-card-hover)', zIndex: 100,
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Notifications</span>
                <span className="status-pill status-paid">LOOP Live</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700 }}>Delivery Confirmed (42kg)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Wanjiku Kamau · Net Payout: KES 1,050</div>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700 }}>Loop B2C Disbursement Approved</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Batch #033 · KES 640,000</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-app)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 14px 4px 6px',
          cursor: 'pointer',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--loop-dark)',
            color: '#FFFFFF', fontWeight: 800, fontSize: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user.initial}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {user.subtitle}
            </div>
          </div>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--loop-orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginLeft: 4,
          }}>
            <ChevronDown size={12} color="#FFFFFF" />
          </div>
        </div>
      </div>
    </header>
  );
}
