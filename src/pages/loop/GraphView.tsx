import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../lib/PlatformContext';

type GraphNode = { id: string; name: string; type: 'farmer' | 'chama' | 'cooperative' | 'zone'; score: number | null };
type GraphLink = { source: string; target: string; type: string };
type LayoutNode = GraphNode & { x: number; y: number; vx: number; vy: number };

const W = 960;
const H = 620;
const COLORS: Record<string, string> = {
  farmer: 'var(--loop-orange)',
  chama: '#7C3AED',
  cooperative: 'var(--loop-dark)',
  zone: 'var(--gold-amber)',
};

function forceLayout(nodes: GraphNode[], links: GraphLink[]): LayoutNode[] {
  const layout: LayoutNode[] = nodes.map((n) => ({
    ...n,
    x: W / 2 + (Math.random() - 0.5) * W * 0.55,
    y: H / 2 + (Math.random() - 0.5) * H * 0.55,
    vx: 0,
    vy: 0,
  }));
  const nodeMap = new Map(layout.map((n) => [n.id, n]));
  for (let iter = 0; iter < 90; iter++) {
    const cooling = 1 - iter / 90;
    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const a = layout[i];
        const b = layout[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 2800 / (dist * dist);
        dx = (dx / dist) * force * cooling;
        dy = (dy / dist) * force * cooling;
        a.vx -= dx; a.vy -= dy;
        b.vx += dx; b.vy += dy;
      }
    }
    links.forEach((link) => {
      const a = nodeMap.get(link.source);
      const b = nodeMap.get(link.target);
      if (!a || !b) return;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 140) * 0.04 * cooling;
      dx = (dx / dist) * force;
      dy = (dy / dist) * force;
      a.vx += dx; a.vy += dy;
      b.vx -= dx; b.vy -= dy;
    });
    layout.forEach((n) => {
      n.x = Math.max(40, Math.min(W - 40, n.x + n.vx));
      n.y = Math.max(40, Math.min(H - 40, n.y + n.vy));
      n.vx *= 0.6;
      n.vy *= 0.6;
    });
  }
  return layout;
}

export default function GraphView() {
  const { officers, cooperatives, climate } = usePlatform();
  const navigate = useNavigate();
  const [hover, setHover] = useState<string | null>(null);

  const { nodes, links, layout } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    cooperatives.forEach((c) => nodes.push({ id: c.id, name: c.shortName, type: 'cooperative', score: null }));
    Object.values(climate).forEach((z) => nodes.push({ id: z.zoneCode, name: z.zoneName, type: 'zone', score: null }));
    const chamas = new Set<string>();
    officers.forEach((f) => {
      nodes.push({ id: f.id, name: f.name.split(' ')[0], type: 'farmer', score: f.creditScore });
      links.push({ source: f.id, target: f.cooperativeId, type: 'DELIVERS_TO' });
      links.push({ source: f.cooperativeId, target: f.zoneCode, type: 'LOCATED_IN' });
      if (f.hasChama && f.chamaName) {
        const cid = `CHAMA-${f.chamaName}`;
        if (!chamas.has(cid)) {
          chamas.add(cid);
          nodes.push({ id: cid, name: f.chamaName, type: 'chama', score: null });
        }
        links.push({ source: f.id, target: cid, type: 'MEMBER_OF' });
      }
      if (f.peerGuaranteed) {
        const guarantor = officers.find((o) => o.id !== f.id && o.creditScore >= 85);
        if (guarantor) links.push({ source: guarantor.id, target: f.id, type: 'GUARANTEES' });
      }
    });
    return { nodes, links, layout: forceLayout(nodes, links) };
  }, [officers, cooperatives, climate]);

  const pos = new Map(layout.map((n) => [n.id, n]));

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Graph view</h2>
        <p>Farmer → Chama → Cooperative → ClimateZone. Click a farmer to open their scorecard.</p>
      </div>
      <div className="card-clean" style={{ padding: 12, overflow: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minHeight: 520 }}>
          {links.map((l, i) => {
            const a = pos.get(l.source);
            const b = pos.get(l.target);
            if (!a || !b) return null;
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#D1D5DB" strokeWidth={1.2} />;
          })}
          {layout.map((n) => (
            <g
              key={n.id}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => { if (n.type === 'farmer') navigate(`/app/loop/scorecard/${n.id}`); }}
              style={{ cursor: n.type === 'farmer' ? 'pointer' : 'default' }}
            >
              <circle cx={n.x} cy={n.y} r={hover === n.id ? 16 : 12} fill={COLORS[n.type]} />
              <text x={n.x} y={n.y + 24} textAnchor="middle" fontSize="10" fill="#4B5563" fontWeight={700}>{n.name}</text>
            </g>
          ))}
        </svg>
        <div style={{ display: 'flex', gap: 14, padding: '8px 12px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          <span>Orange farmer</span>
          <span>Dark co-op</span>
          <span>Purple chama</span>
          <span>Amber zone</span>
        </div>
      </div>
    </div>
  );
}
