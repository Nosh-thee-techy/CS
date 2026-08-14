import type { Cooperative, Farmer } from './mockData';

export type ApplicationStatus = 'awaiting_climate' | 'ready_for_review' | 'escalated' | 'disbursed';
export type DemographicSegment = 'Women' | 'Youth' | 'PWD' | 'General';
export type StanceId = 'approve_flexible' | 'approve_standard' | 'refer_committee' | 'decline_with_reason';
export type CreditDecision = 'Approved' | 'Referred' | 'Declined';

export type ClimateSignal = {
  zoneCode: string;
  zoneName: string;
  spi: number;
  rainfallMmLast30d: number;
  pestProximityKm: number;
  lastSyncIso: string;
  advisory?: string;
  lat: number;
  lon: number;
};

export type ScoreDriver = { label: string; points: number; detail: string };

export type ScoreBreakdown = {
  total: number;
  band: 'Approve' | 'Refer' | 'Decline';
  drivers: ScoreDriver[];
  drags: ScoreDriver[];
  assetSubstituteApplied: boolean;
};

export type AuditEntry = {
  id: string;
  farmerId: string;
  farmerName: string;
  officer: string;
  decision: CreditDecision;
  stance: StanceId;
  score: number;
  notes: string;
  timestampIso: string;
};

export type PipelineRun = {
  source: string;
  lastRunIso: string;
  status: 'ok' | 'warn' | 'fail';
  message: string;
};

export type SmsMessage = {
  id: string;
  farmerId: string;
  to: string;
  body: string;
  category: 'decision' | 'climate' | 'registration';
  sentIso: string;
};

export type OfficerFarmer = Farmer & {
  segment: DemographicSegment;
  queueStatus: ApplicationStatus;
  requestedKes: number;
  harvestMonth: string;
  registeredVia: 'USSD' | 'Walk-in' | 'Cooperative roster';
  submittedIso: string;
  zoneCode: string;
  zoneName: string;
  lat: number;
  lon: number;
  cooperativeDeliveryYears: number;
  chamaMonthsConsistent: number;
  hasLandOwnership: 0 | 1;
  leaseDurationMonths: number;
  peerGuaranteed: boolean;
  fieldVerified: boolean;
  vulnerabilityTag: string;
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();

export const COUNTY_GEO: Record<string, { lat: number; lon: number; zoneCode: string; zoneName: string }> = {
  Kiambu: { lat: -1.17, lon: 36.83, zoneCode: 'KE-CEN-01', zoneName: 'Mt. Kenya South' },
  Meru: { lat: 0.05, lon: 37.65, zoneCode: 'KE-CEN-01', zoneName: 'Mt. Kenya South' },
  Nandi: { lat: 0.18, lon: 35.10, zoneCode: 'KE-RIFT-02', zoneName: 'Uasin Gishu Plateau' },
  Kericho: { lat: -0.37, lon: 35.28, zoneCode: 'KE-RIFT-04', zoneName: 'Kericho Highlands' },
  Nyamira: { lat: -0.56, lon: 34.94, zoneCode: 'KE-NYZ-03', zoneName: 'Nyanza Highlands' },
  Kilifi: { lat: -3.63, lon: 39.85, zoneCode: 'KE-EAS-02', zoneName: 'Coastal Belt' },
  Bomet: { lat: -0.78, lon: 35.34, zoneCode: 'KE-RIFT-04', zoneName: 'Kericho Highlands' },
};

export const climateSignals: Record<string, ClimateSignal> = {
  'KE-CEN-01': { zoneCode: 'KE-CEN-01', zoneName: 'Mt. Kenya South', spi: 0.2, rainfallMmLast30d: 88, pestProximityKm: 80, lastSyncIso: hoursAgo(4), lat: -0.6, lon: 37.1 },
  'KE-RIFT-02': { zoneCode: 'KE-RIFT-02', zoneName: 'Uasin Gishu Plateau', spi: 0.4, rainfallMmLast30d: 78, pestProximityKm: 60, lastSyncIso: hoursAgo(4), lat: 0.5, lon: 35.3 },
  'KE-RIFT-04': { zoneCode: 'KE-RIFT-04', zoneName: 'Kericho Highlands', spi: -1.6, rainfallMmLast30d: 22, pestProximityKm: 14, lastSyncIso: hoursAgo(4), advisory: 'Fall armyworm detected 14 km NE — scout tea and maize plots within 72h.', lat: -0.4, lon: 35.3 },
  'KE-NYZ-03': { zoneCode: 'KE-NYZ-03', zoneName: 'Nyanza Highlands', spi: 0.9, rainfallMmLast30d: 110, pestProximityKm: 95, lastSyncIso: hoursAgo(4), lat: -0.5, lon: 34.8 },
  'KE-EAS-02': { zoneCode: 'KE-EAS-02', zoneName: 'Coastal Belt', spi: -0.3, rainfallMmLast30d: 54, pestProximityKm: 70, lastSyncIso: hoursAgo(4), lat: -3.5, lon: 39.6 },
};

const WOMEN_NAMES = /wanjiku|njeri|achieng|atieno|eunice|amina|grace|margaret|adhiambo|mary/i;
const YOUTH_IDS = new Set(['F-005', 'F-007', 'F-010']);
const PWD_IDS = new Set(['F-006']);

export function enrichFarmer(farmer: Farmer, index = 0): OfficerFarmer {
  const geo = COUNTY_GEO[farmer.county] || COUNTY_GEO.Kiambu;
  const years = Math.max(1, new Date().getFullYear() - Number((farmer.joinedDate || '2022').slice(0, 4)));
  const segment: DemographicSegment = PWD_IDS.has(farmer.id)
    ? 'PWD'
    : YOUTH_IDS.has(farmer.id)
      ? 'Youth'
      : WOMEN_NAMES.test(farmer.name)
        ? 'Women'
        : 'General';
  const queueStatus: ApplicationStatus =
    farmer.creditScore >= 85 ? 'disbursed'
      : farmer.creditScore < 60 ? 'awaiting_climate'
        : farmer.loopAccountStatus === 'pending' ? 'escalated'
          : 'ready_for_review';
  return {
    ...farmer,
    creditTier: farmer.creditTier || (farmer.creditScore >= 85 ? 'platinum' : farmer.creditScore >= 70 ? 'gold' : farmer.creditScore >= 50 ? 'silver' : 'bronze'),
    segment,
    queueStatus,
    requestedKes: Math.round((12000 + farmer.creditScore * 400) / 1000) * 1000,
    harvestMonth: 'October',
    registeredVia: index % 3 === 0 ? 'USSD' : index % 3 === 1 ? 'Walk-in' : 'Cooperative roster',
    submittedIso: hoursAgo(2 + index * 3),
    zoneCode: geo.zoneCode,
    zoneName: geo.zoneName,
    lat: geo.lat + (index % 4) * 0.04,
    lon: geo.lon + (index % 3) * 0.05,
    cooperativeDeliveryYears: years,
    chamaMonthsConsistent: farmer.hasChama ? Math.max(6, farmer.chamaScore * 1.2) : 0,
    hasLandOwnership: years >= 6 ? 1 : 0,
    leaseDurationMonths: years >= 6 ? 0 : years * 12,
    peerGuaranteed: farmer.creditScore >= 78,
    fieldVerified: farmer.creditScore >= 88,
    vulnerabilityTag: segment === 'Women' ? 'Female-headed HH' : segment === 'Youth' ? 'Youth' : segment === 'PWD' ? 'PWD' : 'Smallholder',
  };
}

export function computeScore(farmer: OfficerFarmer, climate?: ClimateSignal): ScoreBreakdown {
  const zone = climate || climateSignals[farmer.zoneCode] || climateSignals['KE-CEN-01'];
  const drivers: ScoreDriver[] = [];
  const drags: ScoreDriver[] = [];
  let assetSubstituteApplied = false;
  let score = 50;

  if (farmer.cooperativeDeliveryYears >= 3) {
    score += 15;
    drivers.push({ label: 'Co-op delivery ≥ 3 years', points: 15, detail: `${farmer.cooperativeDeliveryYears} years of deliveries (DELIVERS_TO)` });
  } else if (farmer.cooperativeDeliveryYears >= 1) {
    score += 8;
    drivers.push({ label: 'Emerging co-op ties', points: 8, detail: `${farmer.cooperativeDeliveryYears} year(s) with the factory` });
  } else {
    score -= 10;
    drags.push({ label: 'Thin co-op history', points: -10, detail: 'Less than 1 year of verifiable deliveries' });
  }

  if (farmer.hasChama && farmer.chamaMonthsConsistent >= 12) {
    score += 15;
    drivers.push({ label: 'Chama repayment ≥ 95%', points: 15, detail: `${farmer.chamaName || 'Chama'} · ${Math.round(farmer.chamaMonthsConsistent)} months (MEMBER_OF)` });
  } else if (farmer.hasChama) {
    score += 6;
    drivers.push({ label: 'Chama membership', points: 6, detail: `${farmer.chamaName || 'Savings group'} on file` });
  }

  if (farmer.peerGuaranteed) {
    score += 10;
    drivers.push({ label: 'Peer guarantee', points: 10, detail: 'GUARANTEES from an Excellent-standing farmer' });
  }

  if (farmer.hasLandOwnership === 1) {
    score += 10;
    drivers.push({ label: 'Land title on file', points: 10, detail: 'Title deed verified at the branch' });
  } else if (farmer.leaseDurationMonths >= 24 || farmer.cooperativeDeliveryYears >= 2) {
    assetSubstituteApplied = true;
    const pts = farmer.leaseDurationMonths >= 24 ? 15 : 10;
    score += pts;
    drivers.push({
      label: 'Asset substitute',
      points: pts,
      detail: farmer.leaseDurationMonths >= 24
        ? `${farmer.leaseDurationMonths}-month lease stands in for title`
        : `${farmer.cooperativeDeliveryYears}y co-op tenure substitutes for land title`,
    });
  }

  if (zone.spi <= -1.0) {
    score -= 15;
    drags.push({ label: 'Zone SPI ≤ −1.0', points: -15, detail: `SPI ${zone.spi.toFixed(1)} in ${zone.zoneName}` });
  } else if (zone.spi <= -0.5) {
    score -= 6;
    drags.push({ label: 'Below-normal rainfall', points: -6, detail: `SPI ${zone.spi.toFixed(1)} — monitor harvest` });
  } else if (zone.spi >= 0.5) {
    score += 6;
    drivers.push({ label: 'Favourable rainfall window', points: 6, detail: `SPI ${zone.spi.toFixed(1)} supports yield` });
  }

  if (zone.pestProximityKm <= 15) {
    score -= 10;
    drags.push({ label: 'Pest within 15 km', points: -10, detail: `Outbreak ${zone.pestProximityKm} km from the zone` });
  }

  if (farmer.fieldVerified) {
    score += 8;
    drivers.push({ label: 'Field-verified mitigation', points: 8, detail: 'Agronomist FieldVerification on the graph (+8)' });
  }

  const total = Math.max(0, Math.min(100, Math.round(score)));
  const band: ScoreBreakdown['band'] = total >= 65 ? 'Approve' : total >= 50 ? 'Refer' : 'Decline';
  return { total, band, drivers, drags, assetSubstituteApplied };
}

export function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.round(diffMs / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export const STATUS_META: Record<ApplicationStatus, { label: string; dot: string; pill: string }> = {
  awaiting_climate: { label: 'Waiting for weather', dot: 'var(--gold-amber)', pill: 'status-pending' },
  ready_for_review: { label: 'Ready to review', dot: 'var(--loop-orange)', pill: 'status-approved' },
  escalated: { label: 'Escalated', dot: 'var(--rose-red)', pill: 'status-failed' },
  disbursed: { label: 'Disbursed', dot: 'var(--emerald-green)', pill: 'status-paid' },
};

export const SEGMENT_META: Record<DemographicSegment, { label: string; color: string; bg: string }> = {
  Women: { label: 'Women', color: '#9A3412', bg: 'var(--loop-orange-soft)' },
  Youth: { label: 'Youth', color: '#92400E', bg: 'var(--gold-soft)' },
  PWD: { label: 'PWD', color: '#1E40AF', bg: 'var(--sky-soft)' },
  General: { label: 'General', color: '#374151', bg: 'var(--bg-raised)' },
};

export const STANCES: { id: StanceId; label: string; hint: string; decision: CreditDecision }[] = [
  { id: 'approve_flexible', label: 'Approve · Flexible', hint: 'Harvest-aligned repayment; SMS with rating', decision: 'Approved' },
  { id: 'approve_standard', label: 'Approve · Standard', hint: 'Default 6-month terms; SMS with rating', decision: 'Approved' },
  { id: 'refer_committee', label: 'Refer to committee', hint: 'Escalate to regional supervisor', decision: 'Referred' },
  { id: 'decline_with_reason', label: 'Decline with reason', hint: 'Rejection SMS is built from notes', decision: 'Declined' },
];

export const pipelineRuns: PipelineRun[] = [
  { source: 'Open-Meteo rainfall', lastRunIso: hoursAgo(4), status: 'ok', message: '5 tea-belt zones refreshed' },
  { source: 'ICPAC SPI index', lastRunIso: hoursAgo(6), status: 'ok', message: 'All zones in range' },
  { source: 'Factory delivery ledger', lastRunIso: hoursAgo(26), status: 'warn', message: 'Delayed sync from Nandi node' },
  { source: 'Loop B2C aggregator', lastRunIso: hoursAgo(2), status: 'ok', message: 'M-Pesa callbacks healthy' },
  { source: 'KALRO pest proximity', lastRunIso: hoursAgo(48), status: 'fail', message: 'Endpoint timeout — retrying' },
  { source: 'USSD session router', lastRunIso: hoursAgo(1), status: 'ok', message: '342 sessions in last 24h' },
];

export const seedAuditLog: AuditEntry[] = [
  { id: 'A-9001', farmerId: 'F-002', farmerName: 'Grace Njeri Waweru', officer: 'J. Mwangi', decision: 'Approved', stance: 'approve_flexible', score: 91, notes: 'Platinum deliveries, chama 95%+', timestampIso: hoursAgo(72) },
  { id: 'A-9002', farmerId: 'F-006', farmerName: 'Margaret Atieno Ouma', officer: 'J. Mwangi', decision: 'Approved', stance: 'approve_standard', score: 88, notes: 'Field-verified mitigation on file', timestampIso: hoursAgo(48) },
  { id: 'A-9003', farmerId: 'F-007', farmerName: 'Peter Njoroge Kariuki', officer: 'L. Akinyi', decision: 'Referred', stance: 'refer_committee', score: 43, notes: 'Awaiting weather ingest and chama evidence', timestampIso: hoursAgo(24) },
];

export const seedSmsOutbox: SmsMessage[] = [
  {
    id: 'SMS-2201', farmerId: 'F-002', to: '0756 789 012',
    body: 'KaLI Rating: 91/100. Approved. KES 60,000 via Loop. Repayment aligned to October harvest.',
    category: 'decision', sentIso: hoursAgo(72),
  },
  {
    id: 'SMS-2202', farmerId: 'F-001', to: '0712 345 678',
    body: 'KaLI Alert: Fall armyworm near Kericho belt. Scout your tea plots within 72h. Dial *384*11400# for tips.',
    category: 'climate', sentIso: hoursAgo(6),
  },
  {
    id: 'SMS-2203', farmerId: 'F-005', to: '0745 678 901',
    body: 'KaLI: Your application is waiting for weather. We will SMS when the Kericho zone SPI updates.',
    category: 'registration', sentIso: hoursAgo(12),
  },
];

export const weeklyTrend = [
  { w: 'W23', requested: 12, sent: 7 },
  { w: 'W24', requested: 15, sent: 9 },
  { w: 'W25', requested: 11, sent: 8 },
  { w: 'W26', requested: 18, sent: 10 },
  { w: 'W27', requested: 16, sent: 12 },
  { w: 'W28', requested: 21, sent: 14 },
  { w: 'W29', requested: 19, sent: 11 },
  { w: 'W30', requested: 14, sent: 9 },
];

export const PARTNER_STACK = [
  { key: 'loop', name: 'Loop B2C', provider: 'Loop Kenya · Daraja 3.0', live: true, detail: 'Factory settlement and loan disbursement to M-Pesa wallets.' },
  { key: 'neo4j', name: 'Neo4j graph', provider: 'Farmer → Chama → Co-op → Zone', live: false, detail: 'Officer pages keep working on mock data when the graph is down.' },
  { key: 'featherless', name: 'Featherless', provider: 'Hermes-3 narratives', live: false, detail: 'Farmer SMS vs officer audit narrative. Stub until API key is set.' },
  { key: 'masumi', name: 'Masumi', provider: 'Optional payout rail', live: false, detail: 'Scorecard can fire an optional disbursement after stance commit.' },
  { key: 'at', name: "Africa's Talking", provider: 'Sandbox · USSD · SMS · Voice', live: false, detail: 'Sandbox simulator at simulator.africastalking.com:1517. Callbacks: POST /api/ussd and POST /api/voice. SMS SDK needs AT_API_KEY.' },
  { key: 'meteo', name: 'Open-Meteo', provider: 'Free weather API', live: true, detail: 'Map zone click loads live rainfall, wind, and temperature.' },
  { key: 'ml', name: 'Credit engine', provider: 'CreditEngineService', live: true, detail: 'Graph walk: co-op +15, chama +15, guarantee +10, SPI −15, pest −10, field +8.' },
];

export function decisionSms(farmer: OfficerFarmer, score: ScoreBreakdown, stance: StanceId, notes: string): string {
  const decision = STANCES.find((s) => s.id === stance)?.decision || 'Referred';
  if (decision === 'Approved') {
    const terms = stance === 'approve_flexible' ? `Repayment aligned to ${farmer.harvestMonth} harvest.` : 'Standard 6-month schedule.';
    return `KaLI Rating: ${score.total}/100. Approved. KES ${farmer.requestedKes.toLocaleString()} via Loop. ${terms}`;
  }
  if (decision === 'Referred') {
    return `KaLI Rating: ${score.total}/100. Referred to committee. Your factory officer will follow up.`;
  }
  const reason = notes.trim() || 'Does not yet meet delivery and climate thresholds.';
  return `KaLI Rating: ${score.total}/100. Declined. ${reason}`.slice(0, 160);
}

export function walkInFarmer(input: {
  name?: string;
  phone: string;
  nationalId?: string;
  cooperativeId?: string;
  cropType?: string;
  acreage?: number;
}): Farmer {
  const id = `F-W${Date.now().toString().slice(-5)}`;
  return {
    id,
    name: input.name || `Walk-in ${input.phone.slice(-4)}`,
    phone: input.phone,
    nationalId: input.nationalId || id.replace(/\D/g, '').padStart(8, '2'),
    county: 'Kiambu',
    ward: 'Branch desk',
    cooperativeId: input.cooperativeId || 'C001',
    memberNumber: `WALK-${id.slice(-4)}`,
    cropType: input.cropType || 'Green Tea',
    farmSizeAcres: input.acreage || 1,
    creditScore: 58,
    creditTier: 'silver',
    joinedDate: new Date().toISOString().slice(0, 10),
    lastDeliveryDate: new Date().toISOString().slice(0, 10),
    totalDeliveries: 0,
    volumeKgLast90Days: 0,
    totalEarnedYTD: 0,
    hasChama: false,
    loopAccountStatus: 'pending',
    deliveryConsistency: 10,
    chamaScore: 8,
    repaymentScore: 12,
    riskScore: 14,
  };
}

export type { Cooperative };
