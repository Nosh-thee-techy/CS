import React, { useState } from 'react';
import { CloudRain } from 'lucide-react';
import { usePlatform } from '../../lib/PlatformContext';
import { formatRelative } from '../../lib/officerDesk';

const tone: Record<string, string> = {
  ok: 'status-paid',
  warn: 'status-pending',
  fail: 'status-failed',
};

export default function PipelineLogs() {
  const { pipeline, auditLog, syncClimate, graphLive } = usePlatform();
  const [flash, setFlash] = useState('');
  const [busy, setBusy] = useState(false);

  function runSync() {
    setBusy(true);
    const result = syncClimate();
    setFlash(`${result.zonesUpdated} zones updated · ${result.farmersPromoted} farmers moved waiting-for-weather → ready`);
    setBusy(false);
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2>Pipeline & logs</h2>
          <p>Climate pipeline status and the decision ledger. Sync can promote farmers from waiting-for-weather to ready.</p>
        </div>
        <button className="btn btn-orange" onClick={runSync} disabled={busy}>
          <CloudRain size={14} /> {busy ? 'Syncing…' : 'Sync climate'}
        </button>
      </div>
      {flash && <div className="card-clean" style={{ borderColor: 'var(--loop-orange)', fontWeight: 700 }}>{flash}</div>}

      <div className="card-clean">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3>Climate pipeline</h3>
          <span className={`live-badge ${graphLive ? 'on' : 'off'}`}>{graphLive ? 'Live' : 'Desk cache'}</span>
        </div>
        {pipeline.map((run) => (
          <div key={run.source + run.lastRunIso} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 800 }}>{run.source}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{run.message}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`status-pill ${tone[run.status]}`}>{run.status}</span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatRelative(run.lastRunIso)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-clean">
        <h3>Decision ledger</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <th style={{ padding: '8px 10px' }}>When</th>
              <th style={{ padding: '8px 10px' }}>Farmer</th>
              <th style={{ padding: '8px 10px' }}>Stance</th>
              <th style={{ padding: '8px 10px' }}>Score</th>
              <th style={{ padding: '8px 10px' }}>Officer</th>
              <th style={{ padding: '8px 10px' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px' }}>{formatRelative(row.timestampIso)}</td>
                <td style={{ padding: '10px', fontWeight: 800 }}>{row.farmerName}</td>
                <td style={{ padding: '10px' }}>{row.decision}</td>
                <td className="tabular" style={{ padding: '10px', fontWeight: 800 }}>{row.score}</td>
                <td style={{ padding: '10px' }}>{row.officer}</td>
                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
