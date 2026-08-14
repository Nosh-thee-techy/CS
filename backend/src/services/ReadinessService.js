import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase.js';
import FarmerService from './FarmerService.js';
import CreditEngineService from './CreditEngineService.js';
import LoanService from './LoanService.js';
import demo from '../data/demoStore.js';

const REPORTS_COLLECTION = 'readiness_self_reports';
const memoryReports = new Map();

const ACTION_CATALOG = {
  delivery_consistency: {
    id: 'act_deliver',
    key: 'deliver_every_harvest',
    category: 'agriculture',
    points: 8,
  },
  chama_savings: {
    id: 'act_chama',
    key: 'save_with_chama',
    category: 'savings',
    points: 6,
  },
  loan_repayment: {
    id: 'act_repay',
    key: 'keep_repayments_current',
    category: 'savings',
    points: 5,
  },
  tenure: {
    id: 'act_meetings',
    key: 'attend_coop_meetings',
    category: 'agriculture',
    points: 3,
  },
  input_records: {
    id: 'act_inputs',
    key: 'keep_input_receipts',
    category: 'climate',
    points: 4,
  },
};

function toDisplayScore(coreScore) {
  const n = Number(coreScore);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.min(100, Math.max(0, (n - 300) / 5.5)));
}

function eligibilityFromScore(score, maxLoanLimit) {
  const amount = Math.max(0, Math.round(Number(maxLoanLimit) || 0));
  if (amount > 0) {
    return {
      disbursementEligible: true,
      eligibleAmount: amount,
      nextTierScore: score >= 75 ? null : 75,
      nextTierAmount: null,
      applyThreshold: 50,
    };
  }
  if (score >= 50) {
    return {
      disbursementEligible: false,
      eligibleAmount: 0,
      nextTierScore: 75,
      nextTierAmount: 20000,
      applyThreshold: 50,
    };
  }
  return {
    disbursementEligible: false,
    eligibleAmount: 0,
    nextTierScore: 50,
    nextTierAmount: null,
    applyThreshold: 50,
  };
}

function bandFromScore(score) {
  if (score >= 75) return 'credit_ready';
  if (score >= 50) return 'almost_there';
  return 'building_trust';
}

function signalsFrom(credit, farmer) {
  const deliveryOk = (credit.deliveryConsistencyScore || 0) >= 50;
  const produceOk = (credit.totalProduceKgHistorical || 0) > 0;
  const lowRisk = credit.riskTier === 'LOW';
  const created = farmer.createdAt ? new Date(farmer.createdAt).getTime() : Date.now();
  const tenureOk = Date.now() - created >= 365 * 24 * 60 * 60 * 1000;
  const display = toDisplayScore(credit.score);

  const ranked = [
    { key: 'delivery_consistency', ok: deliveryOk },
    { key: 'input_records', ok: produceOk },
    { key: 'loan_repayment', ok: lowRisk },
    { key: 'tenure', ok: tenureOk },
    { key: 'chama_savings', ok: display >= 75 },
  ];

  return {
    strengths: ranked.filter((row) => row.ok).slice(0, 2).map((row) => row.key),
    gaps: ranked.filter((row) => !row.ok).slice(0, 2).map((row) => row.key),
  };
}

function loanPayment(loan) {
  const rawStatus = {
    PENDING: 'pending',
    APPROVED: 'pending',
    DISBURSED: 'completed',
    REPAID: 'completed',
    REJECTED: 'failed',
    DEFAULTED: 'failed',
  }[loan.status] || 'pending';

  return {
    id: loan.loanId,
    kind: loan.status === 'REPAID' ? 'loan_repayment' : 'disbursement',
    rawStatus,
    amount: loan.approvedAmount || loan.requestedAmount || 0,
  };
}

async function loadLoans(farmerId) {
  return LoanService.getLoansByFarmer(farmerId);
}

async function loadPayouts(farmerId) {
  if (!isFirebaseReady()) return demo.listPayouts(farmerId);
  const snapshot = await getDocs(query(collection(db, 'payouts'), where('farmerId', '==', farmerId)));
  return snapshot.docs.map((row) => row.data());
}

function payoutStatus(status) {
  if (status === 'COMPLETED' || status === 'LOOP_PROCESSING') return 'completed';
  if (status === 'FAILED') return 'failed';
  return 'pending';
}

function payoutToDeduction(payout) {
  return {
    id: payout.payoutId,
    reason: 'loan_recovery',
    gross: Number(payout.grossProduceAmount) || 0,
    deducted: Number(payout.loanDeductionAmount) || 0,
    net: Number(payout.netPayoutAmount) || 0,
    rawStatus: payoutStatus(payout.status),
  };
}

function payoutToPayment(payout) {
  return {
    id: payout.payoutId,
    kind: 'settlement',
    rawStatus: payoutStatus(payout.status),
    amount: Number(payout.netPayoutAmount) || 0,
  };
}

async function loadReports(farmerId) {
  const reports = new Map();
  for (const [key, row] of memoryReports) {
    if (row.farmerId === farmerId) {
      reports.set(row.actionId, {
        photo: Boolean(row.photo),
        audio: Boolean(row.audio),
        note: Boolean(row.note),
      });
    }
  }
  if (!isFirebaseReady()) return reports;
  const snapshot = await getDocs(query(collection(db, REPORTS_COLLECTION), where('farmerId', '==', farmerId)));
  for (const snap of snapshot.docs) {
    const row = snap.data();
    reports.set(row.actionId, {
      photo: Boolean(row.photo),
      audio: Boolean(row.audio),
      note: Boolean(row.note),
    });
  }
  return reports;
}

function rankedActionsFor(profile, reports) {
  const fromGaps = profile.gaps.map((signal) => ({
    ...ACTION_CATALOG[signal],
    verified: false,
    selfReported: reports.has(ACTION_CATALOG[signal].id),
    evidence: reports.get(ACTION_CATALOG[signal].id) || null,
    recommended: true,
  }));
  const fromStrengths = profile.strengths
    .filter((signal) => ACTION_CATALOG[signal])
    .slice(0, 1)
    .map((signal) => ({
      ...ACTION_CATALOG[signal],
      verified: true,
      selfReported: false,
      recommended: false,
    }));

  const seen = new Set();
  return [...fromGaps, ...fromStrengths]
    .filter((action) => {
      if (!action?.id || seen.has(action.id)) return false;
      seen.add(action.id);
      return true;
    })
    .sort((a, b) => b.points - a.points);
}

async function buildProfile(farmer) {
  const credit = await CreditEngineService.getCreditProfile(farmer.farmerId);
  const score = toDisplayScore(credit.score);
  const { strengths, gaps } = signalsFrom(credit, farmer);
  const loans = await loadLoans(farmer.farmerId);
  const payouts = await loadPayouts(farmer.farmerId);
  const pending = loans.find((loan) => loan.status === 'PENDING');
  const deductions = payouts
    .map(payoutToDeduction)
    .filter((row) => row.gross > 0);

  return {
    farmerName: farmer.fullName,
    memberNumber: farmer.memberNumber || farmer.nationalId || farmer.farmerId,
    farmerId: farmer.farmerId,
    cooperativeId: farmer.cooperativeId,
    phoneNumber: farmer.phoneNumber,
    score,
    whyKey: null,
    why: credit.aiExplanation || '',
    strengths,
    gaps,
    zoneId: farmer.zoneId || 'zone_rift',
    band: bandFromScore(score),
    ...eligibilityFromScore(score, credit.maxLoanLimit),
    lastUpdated: credit.lastCalculatedAt || new Date().toISOString(),
    loanApplication: pending
      ? {
          status: 'pending',
          amount: pending.requestedAmount,
          purpose: pending.purpose || null,
          reference: pending.loanId,
        }
      : null,
    payments: [...loans.map(loanPayment), ...payouts.map(payoutToPayment)],
    deductions,
  };
}

export function isLive() {
  return true;
}

export async function getReadinessScore(lookup) {
  const farmer = await FarmerService.findByLookup(lookup);
  if (!farmer) return null;
  return buildProfile(farmer);
}

export async function getReadinessActions(lookup) {
  const farmer = await FarmerService.findByLookup(lookup);
  if (!farmer) return null;
  const profile = await buildProfile(farmer);
  const reports = await loadReports(farmer.farmerId);
  return rankedActionsFor(profile, reports);
}

export async function completeReadinessAction(lookup, actionId, evidence = {}) {
  const farmer = await FarmerService.findByLookup(lookup);
  if (!farmer) return null;

  const stored = {
    farmerId: farmer.farmerId,
    actionId,
    photo: Boolean(evidence.photo),
    audio: Boolean(evidence.audio),
    note: Boolean(evidence.note),
    createdAt: new Date().toISOString(),
  };
  if (isFirebaseReady()) {
    await setDoc(doc(db, REPORTS_COLLECTION, `${farmer.farmerId}_${actionId}`), stored, { merge: true });
  } else {
    memoryReports.set(`${farmer.farmerId}_${actionId}`, stored);
  }
  return { ok: true, actionId, queuedForVerification: true, scoreUnchanged: true, evidence: stored };
}

export async function submitReadinessLoan(lookup, purpose) {
  const farmer = await FarmerService.findByLookup(lookup);
  if (!farmer) return null;

  const profile = await buildProfile(farmer);
  if (!profile.disbursementEligible) {
    const error = new Error('Not eligible');
    error.status = 403;
    error.code = 'not_eligible';
    throw error;
  }
  if (profile.loanApplication?.status === 'pending') {
    const error = new Error('already have a pending application');
    error.status = 409;
    error.code = 'pending_application';
    throw error;
  }

  const { loan } = await LoanService.requestLoan({
    farmerId: farmer.farmerId,
    cooperativeId: farmer.cooperativeId,
    requestedAmount: profile.eligibleAmount || profile.loanApplication?.amount || 0,
    purpose,
  });

  return {
    status: 'pending',
    amount: loan.requestedAmount,
    purpose: loan.purpose,
    reference: loan.loanId,
  };
}

export async function getFlaggedReadinessAccounts() {
  return [];
}
