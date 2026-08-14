/**
 * Consumer of scoring data for My Readiness.
 *
 * Lookup order when CORE_PLATFORM_API_URL is unset:
 *   1. In-process Agricultural Credit Platform (Firestore farmers)
 *   2. Built-in demo profiles (KTDA-43456789, 0712345678, 12345678)
 *
 * This module never invents a score. Live scores come from CreditEngineService
 * (300–850) and are mapped to the 0–100 display scale the farmer UI uses.
 */

const BASE_URL = (process.env.CORE_PLATFORM_API_URL || "").replace(/\/$/, "");
const API_KEY = process.env.CORE_PLATFORM_API_KEY || "";
const LIVE_MODULE = new URL("../../../../backend/src/services/ReadinessService.js", import.meta.url);

let liveEnabled = null;

async function liveApi() {
  if (BASE_URL) return null;
  try {
    const mod = await import(LIVE_MODULE.href);
    liveEnabled = mod.isLive();
    return liveEnabled ? mod : null;
  } catch (error) {
    liveEnabled = false;
    console.warn("Readiness in-process core unavailable:", error.message);
    return null;
  }
}

const NAMED_PROFILES = {
  "KTDA-43456789": {
    farmerName: "Mary Wanjiku",
    memberNumber: "KTDA-43456789",
    farmerId: "F-001",
    cooperativeId: "C001",
    phoneNumber: "0700434567",
    score: 68,
    whyKey: "why_deliveries",
    strengths: ["delivery_consistency", "tenure"],
    gaps: ["chama_savings", "loan_repayment"],
    zoneId: "zone_rift",
  },
  "0712345678": {
    farmerName: "Samuel Kipchoge",
    memberNumber: "KTDA-22019834",
    farmerId: "F-009",
    cooperativeId: "C004",
    phoneNumber: "0712345678",
    score: 82,
    whyKey: "why_credit_ready",
    strengths: ["delivery_consistency", "chama_savings"],
    gaps: ["input_records", "tenure"],
    zoneId: "zone_central",
  },
  "12345678": {
    farmerName: "Amina Hassan",
    memberNumber: "KTDA-88110221",
    farmerId: "F-010",
    cooperativeId: "C003",
    phoneNumber: "0711881102",
    score: 41,
    whyKey: "why_building",
    strengths: ["tenure", "delivery_consistency"],
    gaps: ["chama_savings", "loan_repayment"],
    zoneId: "zone_coast",
  },
};

const ACTION_CATALOG = {
  delivery_consistency: {
    id: "act_deliver",
    key: "deliver_every_harvest",
    category: "agriculture",
    points: 8,
  },
  chama_savings: {
    id: "act_chama",
    key: "save_with_chama",
    category: "savings",
    points: 6,
  },
  loan_repayment: {
    id: "act_repay",
    key: "keep_repayments_current",
    category: "savings",
    points: 5,
  },
  tenure: {
    id: "act_meetings",
    key: "attend_coop_meetings",
    category: "agriculture",
    points: 3,
  },
  input_records: {
    id: "act_inputs",
    key: "keep_input_receipts",
    category: "climate",
    points: 4,
  },
};

const ADVISORIES = {
  zone_rift: "light_rainfall",
  zone_central: "good_planting",
  zone_coast: "heavy_rains",
  zone_western: "dry_spell",
};

const selfReports = new Map();
const loanApplications = new Map();

const MOCK_DEDUCTIONS = {
  "KTDA-43456789": [
    {
      id: "ded_1",
      reason: "loan_recovery",
      gross: 5000,
      deducted: 800,
      net: 4200,
      rawStatus: "completed",
    },
  ],
  "0712345678": [
    {
      id: "ded_2",
      reason: "loan_recovery",
      gross: 8500,
      deducted: 1500,
      net: 7000,
      rawStatus: "completed",
    },
  ],
  "KTDA-22019834": [
    {
      id: "ded_2",
      reason: "loan_recovery",
      gross: 8500,
      deducted: 1500,
      net: 7000,
      rawStatus: "completed",
    },
  ],
  "12345678": [
    {
      id: "ded_3",
      reason: "loan_recovery",
      gross: 800,
      deducted: 0,
      net: 800,
      rawStatus: "failed",
    },
  ],
  "KTDA-88110221": [
    {
      id: "ded_3",
      reason: "loan_recovery",
      gross: 800,
      deducted: 0,
      net: 800,
      rawStatus: "failed",
    },
  ],
};

const MOCK_PAYMENTS = {
  "KTDA-43456789": [
    { id: "pay_1", kind: "settlement", rawStatus: "completed", amount: 4200 },
  ],
  "0712345678": [
    { id: "pay_2", kind: "disbursement", rawStatus: "pending", amount: 20000 },
    { id: "pay_3", kind: "loan_repayment", rawStatus: "completed", amount: 1500 },
  ],
  "KTDA-22019834": [
    { id: "pay_2", kind: "disbursement", rawStatus: "pending", amount: 20000 },
    { id: "pay_3", kind: "loan_repayment", rawStatus: "completed", amount: 1500 },
  ],
  "12345678": [
    { id: "pay_4", kind: "settlement", rawStatus: "failed", amount: 800 },
  ],
  "KTDA-88110221": [
    { id: "pay_4", kind: "settlement", rawStatus: "failed", amount: 800 },
  ],
};

const MOCK_FLAGS = [
  { memberNumber: "KTDA-88110221", farmerName: "Amina Hassan", reason: "duplicate_deliveries" },
  { memberNumber: "KTDA-22019834", farmerName: "Samuel Kipchoge", reason: "sudden_score_change" },
  { memberNumber: "KTDA-00991882", farmerName: "Unknown", reason: "ghost_member" },
];

function normalizeLookup(lookup) {
  return String(lookup || "").trim().toUpperCase();
}

function findNamed(lookup) {
  const key = normalizeLookup(lookup);
  if (NAMED_PROFILES[key]) return { lookupKey: key, profile: NAMED_PROFILES[key] };
  const match = Object.entries(NAMED_PROFILES).find(
    ([, profile]) => normalizeLookup(profile.memberNumber) === key,
  );
  if (!match) return null;
  return { lookupKey: match[0], profile: match[1] };
}

export function bandFromScore(score) {
  if (score >= 75) return "credit_ready";
  if (score >= 50) return "almost_there";
  return "building_trust";
}

function eligibilityFromScore(score) {
  if (score >= 75) {
    return {
      disbursementEligible: true,
      eligibleAmount: 20000,
      nextTierScore: null,
      nextTierAmount: null,
      applyThreshold: 50,
    };
  }
  if (score >= 50) {
    return {
      disbursementEligible: true,
      eligibleAmount: 8000,
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

function resolveProfile(lookup) {
  const found = findNamed(lookup);
  if (!found) return null;

  const { lookupKey, profile: base } = found;
  const canonical = normalizeLookup(base.memberNumber);
  const eligibility = eligibilityFromScore(base.score);
  return {
    ...base,
    band: bandFromScore(base.score),
    ...eligibility,
    lastUpdated: new Date().toISOString(),
    loanApplication: loanApplications.get(canonical) || loanApplications.get(lookupKey) || null,
    payments: MOCK_PAYMENTS[lookupKey] || MOCK_PAYMENTS[canonical] || [],
    deductions: MOCK_DEDUCTIONS[lookupKey] || MOCK_DEDUCTIONS[canonical] || [],
  };
}

function rankedActionsFor(profile) {
  const reports = selfReports.get(normalizeLookup(profile.memberNumber)) || new Map();
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

async function coreFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = new Error(`Core platform ${response.status} for ${path}`);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function getFarmerScore(lookup) {
  if (BASE_URL) {
    return coreFetch(`/internal/farmer/${encodeURIComponent(lookup)}/score`);
  }
  const live = await liveApi();
  if (live) {
    const profile = await live.getReadinessScore(lookup);
    if (profile) return profile;
  }
  const profile = resolveProfile(lookup);
  if (!profile) {
    const error = new Error("Farmer not found");
    error.status = 404;
    throw error;
  }
  return profile;
}

export async function getFarmerActions(lookup) {
  if (BASE_URL) {
    return coreFetch(`/internal/farmer/${encodeURIComponent(lookup)}/actions`);
  }
  const live = await liveApi();
  if (live) {
    const actions = await live.getReadinessActions(lookup);
    if (actions) return actions;
  }
  const profile = resolveProfile(lookup);
  if (!profile) return [];
  return rankedActionsFor(profile);
}

export async function completeAction(lookup, actionId, evidence = {}) {
  if (BASE_URL) {
    return coreFetch(
      `/internal/farmer/${encodeURIComponent(lookup)}/actions/${encodeURIComponent(actionId)}/complete`,
      { method: "POST", body: JSON.stringify({ actionId, evidence }) },
    );
  }
  const live = await liveApi();
  if (live) {
    const result = await live.completeReadinessAction(lookup, actionId, evidence);
    if (result) return result;
  }
  const profile = resolveProfile(lookup);
  if (!profile) {
    const error = new Error("Farmer not found");
    error.status = 404;
    throw error;
  }
  const key = normalizeLookup(profile.memberNumber);
  const reports = selfReports.get(key) || new Map();
  const stored = {
    photo: Boolean(evidence.photo),
    audio: Boolean(evidence.audio),
    note: Boolean(evidence.note),
  };
  reports.set(actionId, stored);
  selfReports.set(key, reports);
  return { ok: true, actionId, queuedForVerification: true, scoreUnchanged: true, evidence: stored };
}

export async function submitLoanApplication(lookup, purpose) {
  if (BASE_URL) {
    return coreFetch(
      `/internal/farmer/${encodeURIComponent(lookup)}/loan-application`,
      { method: "POST", body: JSON.stringify({ purpose }) },
    );
  }
  const live = await liveApi();
  if (live) {
    const application = await live.submitReadinessLoan(lookup, purpose);
    if (application) return application;
  }
  const profile = resolveProfile(lookup);
  if (!profile) {
    const error = new Error("Farmer not found");
    error.status = 404;
    throw error;
  }
  if (!profile.disbursementEligible) {
    const error = new Error("Not eligible");
    error.status = 403;
    error.code = "not_eligible";
    throw error;
  }
  const key = normalizeLookup(profile.memberNumber);
  if (loanApplications.get(key)?.status === "pending") {
    const error = new Error("already have a pending application");
    error.status = 409;
    error.code = "pending_application";
    throw error;
  }
  const application = {
    status: "pending",
    amount: profile.eligibleAmount,
    purpose,
    reference: `LN-${key.slice(-6)}-${Date.now().toString().slice(-4)}`,
  };
  loanApplications.set(key, application);
  return application;
}

export async function getZoneAdvisory(zoneId) {
  if (BASE_URL) {
    return coreFetch(`/internal/zone/${encodeURIComponent(zoneId)}/advisory`);
  }
  return {
    zoneId,
    advisoryKey: ADVISORIES[zoneId] || "light_rainfall",
  };
}

export async function getFlaggedAccounts() {
  if (BASE_URL) {
    return coreFetch("/internal/admin/flagged-accounts");
  }
  const live = await liveApi();
  if (live) {
    const accounts = await live.getFlaggedReadinessAccounts();
    if (accounts) return accounts;
  }
  return MOCK_FLAGS.map((row) => ({
    ...row,
    flaggedAt: new Date().toISOString(),
  }));
}

export function isMocked() {
  if (BASE_URL) return false;
  return liveEnabled !== true;
}
