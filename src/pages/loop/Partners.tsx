import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PARTNER_STACK } from '../../lib/officerDesk';
import { usePlatform } from '../../lib/PlatformContext';
import { apiUrl } from '../../lib/api';

export default function Partners() {
  const { graphLive, source } = usePlatform();
  const [atLive, setAtLive] = useState(false);
  const [atDetail, setAtDetail] = useState('');

  useEffect(() => {
    fetch(apiUrl('/api/at/status'))
      .then((res) => res.json())
      .then((payload) => {
        const row = payload?.data;
        if (!row) return;
        setAtLive(Boolean(row.sandbox));
        setAtDetail(
          row.smsOutbound
            ? `Sandbox username ${row.username}. USSD ${row.shortCode}. SMS SDK ready.`
            : `Sandbox username ${row.username}. USSD inbound is live. Set AT_API_KEY for SMS.`,
        );
      })
      .catch(() => setAtLive(false));
  }, []);

  const liveMap: Record<string, boolean> = {
    loop: true,
    neo4j: graphLive,
    featherless: false,
    masumi: false,
    at: atLive,
    meteo: true,
    ml: true,
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Partner tech</h2>
        <p>Which rails are live vs stub. Source: {source}. Loop B2C is the payout path on this desk.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {PARTNER_STACK.map((p) => {
          const live = liveMap[p.key] ?? p.live;
          return (
            <div key={p.key} className="card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.provider}</div>
                </div>
                {live ? <CheckCircle2 size={18} color="var(--emerald-green)" /> : <XCircle size={18} color="var(--text-muted)" />}
              </div>
              <p style={{ marginTop: 10 }}>{p.key === 'at' && atDetail ? atDetail : p.detail}</p>
              <span className={`status-pill ${live ? 'status-paid' : 'status-pending'}`}>{live ? 'Live' : 'Stub'}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Link to="/app/loop/payments" className="btn btn-orange" style={{ textDecoration: 'none' }}>
          Open Loop B2C batches <ExternalLink size={14} />
        </Link>
        <Link to="/app/loop/phone" className="btn btn-outline" style={{ textDecoration: 'none' }}>Phone simulator</Link>
        <a className="btn btn-outline" href="https://simulator.africastalking.com:1517/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          AT simulator
        </a>
      </div>
    </div>
  );
}
