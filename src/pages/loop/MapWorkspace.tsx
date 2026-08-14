import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudRain, MapPin, Thermometer, Wind } from 'lucide-react';
import { usePlatform } from '../../lib/PlatformContext';
import { computeScore, STATUS_META } from '../../lib/officerDesk';
import type { OfficerFarmer } from '../../lib/officerDesk';

type Weather = { temp: number; rain: number; wind: number; humidity: number };

const W = 720;
const H = 560;

function project(lat: number, lon: number) {
  const x = ((lon - 29.4) / (42.0 - 29.4)) * W;
  const y = ((5.1 - lat) / (5.1 + 4.8)) * H;
  return { x, y };
}

function riskColor(farmer: OfficerFarmer, spi: number) {
  const score = computeScore(farmer).total;
  if (spi <= -1 || score < 50) return '#EF4444';
  if (score < 65) return '#F59E0B';
  return '#10B981';
}

export default function MapWorkspace() {
  const { officers, climate, graphLive } = usePlatform();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoneCode, setZoneCode] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherErr, setWeatherErr] = useState('');

  const selected = officers.find((f) => f.id === selectedId);
  const zone = zoneCode ? climate[zoneCode] : selected ? climate[selected.zoneCode] : null;

  const zones = useMemo(() => Object.values(climate), [climate]);

  useEffect(() => {
    if (!zone) return;
    setWeather(null);
    setWeatherErr('');
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${zone.lat}&longitude=${zone.lon}&current=temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m`)
      .then((r) => r.json())
      .then((body) => {
        const c = body.current;
        if (!c) throw new Error('no current');
        setWeather({ temp: c.temperature_2m, rain: c.precipitation, wind: c.wind_speed_10m, humidity: c.relative_humidity_2m });
      })
      .catch(() => {
        setWeatherErr('Open-Meteo unreachable — showing zone SPI from the desk cache.');
      });
  }, [zone?.zoneCode, zone?.lat, zone?.lon]);

  return (
    <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
      <div className="card-clean" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h2>Kenya / Uganda map</h2>
            <p>Pins coloured by risk. Zone click loads Open-Meteo. Pin click opens the scorecard.</p>
          </div>
          <span className={`live-badge ${graphLive ? 'on' : 'off'}`}>{graphLive ? 'Live pins' : 'Mock pins'}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#EEF1F4', borderRadius: 16 }}>
          <path d="M210,80 L280,50 L360,70 L430,40 L510,90 L560,160 L540,260 L500,340 L430,430 L360,500 L280,520 L210,470 L170,360 L150,240 Z" fill="#D6DDE4" stroke="#9CA3AF" />
          <path d="M150,140 L210,80 L170,220 L150,320 L90,280 L70,180 Z" fill="#C5CDD6" stroke="#9CA3AF" />
          <text x="360" y="280" textAnchor="middle" fill="#6B7280" fontSize="14" fontWeight="800">KENYA</text>
          <text x="130" y="200" textAnchor="middle" fill="#6B7280" fontSize="12" fontWeight="800">UGANDA</text>
          {zones.map((z) => {
            const p = project(z.lat, z.lon);
            const active = zone?.zoneCode === z.zoneCode;
            return (
              <g key={z.zoneCode} onClick={() => { setZoneCode(z.zoneCode); setSelectedId(null); }} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={active ? 28 : 22} fill={z.spi <= -1 ? 'rgba(239,68,68,0.2)' : 'rgba(255,95,0,0.15)'} />
                <text x={p.x} y={p.y + 36} textAnchor="middle" fontSize="10" fill="#4B5563">{z.zoneName}</text>
              </g>
            );
          })}
          {officers.map((f) => {
            const p = project(f.lat, f.lon);
            const color = riskColor(f, climate[f.zoneCode]?.spi ?? 0);
            return (
              <circle
                key={f.id}
                cx={p.x}
                cy={p.y}
                r={selectedId === f.id ? 9 : 6}
                fill={color}
                stroke="#FFFFFF"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onClick={() => { setSelectedId(f.id); setZoneCode(f.zoneCode); }}
                onDoubleClick={() => navigate(`/app/loop/scorecard/${f.id}`)}
              />
            );
          })}
        </svg>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: '#10B981', marginRight: 6 }} />Approve</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: '#F59E0B', marginRight: 6 }} />Refer</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: '#EF4444', marginRight: 6 }} />Decline / drought</span>
        </div>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card-clean">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
            <CloudRain size={16} color="var(--loop-orange)" /> Zone weather
          </div>
          {zone ? (
            <>
              <h3 style={{ marginTop: 8 }}>{zone.zoneName}</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SPI {zone.spi.toFixed(1)} · {zone.rainfallMmLast30d} mm / 30d</div>
              {weather && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  <WeatherCell icon={<Thermometer size={13} />} label="Temp" value={`${weather.temp}°C`} />
                  <WeatherCell icon={<CloudRain size={13} />} label="Rain" value={`${weather.rain} mm`} />
                  <WeatherCell icon={<Wind size={13} />} label="Wind" value={`${weather.wind}`} />
                  <WeatherCell icon={<MapPin size={13} />} label="Humidity" value={`${weather.humidity}%`} />
                </div>
              )}
              {weatherErr && <p style={{ marginTop: 8 }}>{weatherErr}</p>}
              {zone.advisory && <p style={{ marginTop: 8 }}>{zone.advisory}</p>}
            </>
          ) : (
            <p style={{ marginTop: 8 }}>Click a zone or pin.</p>
          )}
        </div>

        {selected && (
          <div className="card-clean">
            <div style={{ fontWeight: 800 }}>{selected.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{STATUS_META[selected.queueStatus].label}</div>
            <button className="btn btn-orange btn-sm" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} onClick={() => navigate(`/app/loop/scorecard/${selected.id}`)}>
              Open scorecard
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function WeatherCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ background: 'var(--bg-app)', borderRadius: 10, padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{icon}{label}</div>
      <div className="tabular" style={{ fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}
