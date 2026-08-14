import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  farmers as mockFarmers,
  cooperatives as mockCoops,
  deliveries as mockDeliveries,
  paymentBatches as mockBatches,
  loans as mockLoans,
  kpis as mockKpis,
} from './mockData';
import type { Cooperative, Delivery, Farmer, Loan, PaymentBatch } from './mockData';
import {
  enrichFarmer,
  seedAuditLog,
  seedSmsOutbox,
  pipelineRuns as seedPipeline,
  climateSignals,
  decisionSms,
  STANCES,
  walkInFarmer,
  computeScore,
} from './officerDesk';
import { api } from './api';
import type {
  ApplicationStatus,
  AuditEntry,
  ClimateSignal,
  OfficerFarmer,
  PipelineRun,
  SmsMessage,
  StanceId,
} from './officerDesk';

export const READINESS_URL = import.meta.env.VITE_READINESS_URL || 'http://localhost:5174';

type Snapshot = {
  source: string;
  sessionFarmerId: string;
  cooperatives: Cooperative[];
  farmers: Farmer[];
  deliveries: Delivery[];
  paymentBatches: PaymentBatch[];
  loans: Loan[];
  kpis: typeof mockKpis;
};

const fallback: Snapshot = {
  source: 'local-mock',
  sessionFarmerId: 'F-001',
  cooperatives: mockCoops,
  farmers: mockFarmers,
  deliveries: mockDeliveries,
  paymentBatches: mockBatches,
  loans: mockLoans,
  kpis: mockKpis,
};

type PlatformValue = Snapshot & {
  loading: boolean;
  graphLive: boolean;
  officers: OfficerFarmer[];
  auditLog: AuditEntry[];
  smsOutbox: SmsMessage[];
  pipeline: PipelineRun[];
  climate: Record<string, ClimateSignal>;
  refresh: () => Promise<void>;
  sessionFarmer: Farmer;
  getFarmerById: (id: string) => OfficerFarmer | undefined;
  getCoopById: (id: string) => Cooperative | undefined;
  getDeliveriesByFarmer: (id: string) => Delivery[];
  getLoansByFarmer: (id: string) => Loan[];
  readinessHref: (lookup: string, tab?: 'score' | 'loan' | 'improve') => string;
  commitDecision: (farmerId: string, stance: StanceId, notes: string, officer?: string) => Promise<{ sms: SmsMessage; audit: AuditEntry }>;
  sendSms: (farmerId: string, body: string) => SmsMessage | null;
  registerWalkIn: (input: { name?: string; phone: string; nationalId?: string; cooperativeId?: string; cropType?: string; acreage?: number; notes?: string }) => Promise<OfficerFarmer>;
  syncClimate: () => { zonesUpdated: number; farmersPromoted: number };
  setQueueStatus: (farmerId: string, status: ApplicationStatus) => void;
};

const PlatformContext = createContext<PlatformValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Snapshot>(fallback);
  const [loading, setLoading] = useState(true);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(seedAuditLog);
  const [smsOutbox, setSmsOutbox] = useState<SmsMessage[]>(seedSmsOutbox);
  const [pipeline, setPipeline] = useState<PipelineRun[]>(seedPipeline);
  const [climate, setClimate] = useState<Record<string, ClimateSignal>>(climateSignals);
  const [queueOverrides, setQueueOverrides] = useState<Record<string, ApplicationStatus>>({});
  const [walkIns, setWalkIns] = useState<Farmer[]>([]);
  const [verifiedIds, setVerifiedIds] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    try {
      const snapshot = await api.platformSnapshot();
      if (snapshot?.farmers) {
        const source = typeof snapshot.source === 'string' ? snapshot.source : 'api';
        setData({ ...fallback, ...snapshot, source } as Snapshot);
      }
    } catch {
      setData(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const officers = useMemo<OfficerFarmer[]>(() => {
    const merged = [...walkIns, ...data.farmers];
    const seen = new Set<string>();
    return merged
      .filter((row) => {
        if (seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
      })
      .map((row, index) => {
        const base = enrichFarmer(row, index);
        return {
          ...base,
          queueStatus: queueOverrides[row.id] || base.queueStatus,
          fieldVerified: verifiedIds[row.id] ?? base.fieldVerified,
        };
      });
  }, [data.farmers, walkIns, queueOverrides, verifiedIds]);

  const value = useMemo<PlatformValue>(() => {
    const sessionFarmer = data.farmers.find((row) => row.id === data.sessionFarmerId) || data.farmers[0];
    const getFarmerById = (id: string) =>
      officers.find((row) => row.id === id || row.nationalId === id || row.memberNumber === id);

    return {
      ...data,
      loading,
      graphLive: data.source !== 'local-mock',
      officers,
      auditLog,
      smsOutbox,
      pipeline,
      climate,
      refresh,
      sessionFarmer,
      getFarmerById,
      getCoopById: (id: string) => data.cooperatives.find((row) => row.id === id),
      getDeliveriesByFarmer: (id: string) => data.deliveries.filter((row) => row.farmerId === id),
      getLoansByFarmer: (id: string) => data.loans.filter((row) => row.farmerId === id),
      readinessHref: (lookup: string, tab = 'score') =>
        `${READINESS_URL}/?lookup=${encodeURIComponent(lookup)}&tab=${tab}`,
      commitDecision: async (farmerId, stance, notes, officer = 'J. Mwangi') => {
        const farmer = getFarmerById(farmerId);
        if (!farmer) throw new Error('Farmer not found');
        const score = computeScore(farmer, climate[farmer.zoneCode]);
        const meta = STANCES.find((s) => s.id === stance)!;
        const action = meta.decision === 'Approved' ? 'APPROVE' : meta.decision === 'Declined' ? 'REJECT' : null;

        if (action) {
          const existing = await api.getLoansByFarmer(farmerId).catch(() => []);
          const pending = existing.find((loan) => ['PENDING', 'APPROVED', 'applied', 'approved'].includes(loan.status));
          const loanId = pending?.loanId
            || (await api.requestLoan({
              farmerId,
              cooperativeId: farmer.cooperativeId,
              requestedAmount: farmer.requestedKes,
            })).loan.loanId;
          await api.decideLoan(loanId, action, farmer.requestedKes);
        } else {
          await api.calculateCredit(farmerId).catch(() => undefined);
        }

        const sms: SmsMessage = {
          id: `SMS-${Date.now()}`,
          farmerId,
          to: farmer.phone,
          body: decisionSms(farmer, score, stance, notes),
          category: 'decision',
          sentIso: new Date().toISOString(),
        };
        const audit: AuditEntry = {
          id: `A-${Date.now()}`,
          farmerId,
          farmerName: farmer.name,
          officer,
          decision: meta.decision,
          stance,
          score: score.total,
          notes,
          timestampIso: new Date().toISOString(),
        };
        setSmsOutbox((rows) => [sms, ...rows]);
        setAuditLog((rows) => [audit, ...rows]);
        setQueueOverrides((prev) => ({
          ...prev,
          [farmerId]: meta.decision === 'Approved' ? 'disbursed' : 'escalated',
        }));
        await refresh();
        return { sms, audit };
      },
      sendSms: (farmerId, body) => {
        const farmer = getFarmerById(farmerId);
        if (!farmer) return null;
        const sms: SmsMessage = {
          id: `SMS-${Date.now()}`,
          farmerId,
          to: farmer.phone,
          body,
          category: 'climate',
          sentIso: new Date().toISOString(),
        };
        setSmsOutbox((rows) => [sms, ...rows]);
        return sms;
      },
      registerWalkIn: async (input) => {
        const created = await api.registerFarmer({
          fullName: input.name || `Walk-in ${input.phone.slice(-4)}`,
          nationalId: input.nationalId || `2${Date.now().toString().slice(-7)}`,
          phoneNumber: input.phone,
          cooperativeId: input.cooperativeId || 'C001',
        });
        const farmer = walkInFarmer({
          ...input,
          name: created.fullName,
          nationalId: created.nationalId,
          cooperativeId: created.cooperativeId,
        });
        farmer.id = created.farmerId;
        farmer.memberNumber = created.memberNumber || farmer.memberNumber;
        farmer.phone = created.phoneNumber;
        setWalkIns((rows) => [farmer, ...rows]);
        await refresh();
        return enrichFarmer(farmer, 0);
      },
      syncClimate: () => {
        const next = { ...climate };
        let zonesUpdated = 0;
        Object.values(next).forEach((zone) => {
          zone.lastSyncIso = new Date().toISOString();
          if (zone.spi < 0) zone.spi = Math.min(0.4, zone.spi + 0.5);
          zonesUpdated += 1;
        });
        setClimate(next);
        let farmersPromoted = 0;
        const promotions: Record<string, ApplicationStatus> = {};
        officers.forEach((farmer) => {
          if (farmer.queueStatus === 'awaiting_climate') {
            promotions[farmer.id] = 'ready_for_review';
            farmersPromoted += 1;
          }
        });
        setQueueOverrides((prev) => ({ ...prev, ...promotions }));
        setPipeline((rows) => [
          { source: 'Open-Meteo rainfall', lastRunIso: new Date().toISOString(), status: 'ok', message: `${zonesUpdated} zones updated · ${farmersPromoted} farmers promoted` },
          ...rows.filter((r) => r.source !== 'Open-Meteo rainfall'),
        ]);
        return { zonesUpdated, farmersPromoted };
      },
      setQueueStatus: (farmerId, status) => {
        setQueueOverrides((prev) => ({ ...prev, [farmerId]: status }));
        if (status === 'disbursed') setVerifiedIds((prev) => ({ ...prev, [farmerId]: true }));
      },
    };
  }, [data, loading, refresh, officers, auditLog, smsOutbox, pipeline, climate]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const value = useContext(PlatformContext);
  if (!value) throw new Error('usePlatform must be used inside PlatformProvider');
  return value;
}
