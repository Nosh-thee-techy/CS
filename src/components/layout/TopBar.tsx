import React, { useEffect, useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { usePlatform } from '../../lib/PlatformContext';

type Portal = 'coop' | 'loop';
type Lang = 'en' | 'sw' | 'fr';

const portalUserInfo: Record<Portal, { name: string; subtitle: string; initial: string }> = {
  coop: { name: 'Kiambu Factory Admin', subtitle: 'Kiambu / Factory #01', initial: 'KF' },
  loop: { name: 'Jane Mwangi', subtitle: 'Branch officer · Kiambu', initial: 'JM' },
};

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'sw', label: 'SW' },
  { code: 'fr', label: 'FR' },
];

export default function TopBar({ portal }: { portal: Portal }) {
  const { graphLive, source } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('loop-lang') as Lang) || 'en');
  const user = portalUserInfo[portal];

  useEffect(() => {
    localStorage.setItem('loop-lang', lang);
  }, [lang]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      document.getElementById('officer-search')?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
      <div className="search-input-pill">
        <Search size={16} color="var(--text-muted)" />
        <input
          id="officer-search"
          type="text"
          placeholder={portal === 'loop' ? 'Search farmer, KTDA ID, phone…  (/)' : 'Search tea farmer, factory, transaction...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {portal === 'loop' && (
          <span className={`live-badge ${graphLive ? 'on' : 'off'}`}>
            <span className="live-dot" />
            {graphLive ? 'Live · API' : 'Mock data'}
          </span>
        )}

        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-app)', borderRadius: 999, padding: 3, border: '1px solid var(--border-light)' }}>
          {LANGS.map(item => (
            <button
              key={item.code}
              onClick={() => setLang(item.code)}
              style={{
                border: 'none',
                background: lang === item.code ? 'var(--loop-dark)' : 'transparent',
                color: lang === item.code ? '#FFFFFF' : 'var(--text-muted)',
                borderRadius: 999,
                padding: '4px 8px',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--bg-app)', border: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              position: 'relative',
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
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginBottom: 12 }}>Branch notes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700 }}>Queue: waiting for weather</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Sync climate on Logs to promote farmers</div>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-app)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700 }}>Data source</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{source}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-app)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 14px 4px 6px',
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
          <ChevronDown size={12} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}
