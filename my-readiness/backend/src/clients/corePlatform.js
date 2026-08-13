/**
 * Thin client for the core platform's internal API.
 *
 * This service never talks to Neo4j or computes a score. When
 * CORE_PLATFORM_API_URL is unset, responses come from the mock below so
 * frontend work is not blocked. Swap happens here — route handlers stay the same.
 *
 * Draft contract (confirm with the core platform team before going live):
 *   GET  /internal/farmer/:lookup/score
 *   GET  /internal/farmer/:lookup/actions
 *   POST /internal/farmer/:lookup/actions/:id/complete
 *   GET  /internal/zone/:zoneId/advisory
 */

const BASE_URL = (process.env.CORE_PLATFORM_API_URL || "").replace(/\/$/, "");
const API_KEY = process.env.CORE_PLATFORM_API_KEY || "";
const USE_MOCK = !BASE_URL;

const NAMED_PROFILES = {
  "KTDA-43456789": {
    farmerName: "Mary Wanjiku",
    memberNumber: "KTDA-43456789",
    score: 68,
    band: "almost_there",
    whyKey: "why_deliveries",
    strengths: ["delivery_consistency", "tenure"],
    gaps: ["chama_savings", "loan_repayment"],
    zoneId: "zone_rift",
    disbursementEligible: false,
  },
  "0712345678": {
    farmerName: "Samuel Kipchoge",
    memberNumber: "KTDA-22019834",
    score: 82,
    band: "credit_ready",
    whyKey: "why_credit_ready",
    strengths: ["delivery_consistency", "chama_savings", "loan_repayment"],
    gaps: ["input_records"],
    zoneId: "zone_central",
    disbursementEligible: true,
  },
  "12345678": {
    farmerName: "Amina Hassan",
    memberNumber: "KTDA-88110221",
    score: 41,
    band: "building_trust",
    whyKey: "why_building",
    strengths: ["tenure"],
    gaps: ["delivery_consistency", "chama_savings", "loan_repayment"],
    zoneId: "zone_coast",
    disbursementEligible: false,
  },
};

const TEMPLATES = [
  {
    score: 74,
    band: "almost_there",
    whyKey: "why_deliveries",
    strengths: ["delivery_consistency", "tenure"],
    gaps: ["chama_savings"],
    zoneId: "zone_rift",
    disbursementEligible: false,
  },
  {
    score: 55,
    band: "almost_there",
    whyKey: "why_building",
    strengths: ["tenure"],
    gaps: ["delivery_consistency", "loan_repayment"],
    zoneId: "zone_central",
    disbursementEligible: false,
  },
  {
    score: 88,
    band: "credit_ready",
    whyKey: "why_credit_ready",
    strengths: ["delivery_consistency", "chama_savings", "loan_repayment"],
    gaps: ["input_records"],
    zoneId: "zone_western",
    disbursementEligible: true,
  },
];

const ACTION_CATALOG = {
  delivery_consistency: { id: "act_deliver", key: "deliver_every_harvest" },
  chama_savings: { id: "act_chama", key: "save_with_chama" },
  loan_repayment: { id: "act_repay", key: "keep_repayments_current" },
  tenure: { id: "act_meetings", key: "attend_coop_meetings" },
  input_records: { id: "act_inputs", key: "keep_input_receipts" },
};

const ADVISORIES = {
  zone_rift: "light_rainfall",
  zone_central: "good_planting",
  zone_coast: "heavy_rains",
  zone_western: "dry_spell",
};

const selfReports = new Map();

function normalizeLookup(lookup) {
  return String(lookup || "").trim().toUpperCase();
}

function hashLookup(lookup) {
  return [...lookup].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function resolveProfile(lookup) {
  const key = normalizeLookup(lookup);
  if (NAMED_PROFILES[key]) {
    return { ...NAMED_PROFILES[key] };
  }

  const template = TEMPLATES[hashLookup(key) % TEMPLATES.length];
  return {
    ...template,
    farmerName: "Co-op member",
    memberNumber: key || "UNKNOWN",
  };
}

function rankedActionsFor(profile, lookup) {
  const reports = selfReports.get(normalizeLookup(lookup)) || new Set();
  const gapActions = profile.gaps.map((signal) => ({
    ...ACTION_CATALOG[signal],
    verified: false,
    selfReported: reports.has(ACTION_CATALOG[signal].id),
  }));
  const strengthActions = profile.strengths
    .filter((signal) => ACTION_CATALOG[signal])
    .slice(0, 1)
    .map((signal) => ({
      ...ACTION_CATALOG[signal],
      verified: true,
      selfReported: false,
    }));

  const seen = new Set();
  return [...gapActions, ...strengthActions].filter((action) => {
    if (!action?.id || seen.has(action.id)) return false;
    seen.add(action.id);
    return true;
  });
}

async function coreFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
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
  if (USE_MOCK) {
    const profile = resolveProfile(lookup);
    if (!lookup?.trim()) {
      const error = new Error("Farmer not found");
      error.status = 404;
      throw error;
    }
    return profile;
  }
  return coreFetch(`/internal/farmer/${encodeURIComponent(lookup)}/score`);
}

export async function getFarmerActions(lookup) {
  if (USE_MOCK) {
    return rankedActionsFor(resolveProfile(lookup), lookup);
  }
  return coreFetch(`/internal/farmer/${encodeURIComponent(lookup)}/actions`);
}

export async function completeAction(lookup, actionId) {
  if (USE_MOCK) {
    const key = normalizeLookup(lookup);
    const reports = selfReports.get(key) || new Set();
    reports.add(actionId);
    selfReports.set(key, reports);
    return { ok: true, actionId, queuedForVerification: true, scoreUnchanged: true };
  }
  return coreFetch(
    `/internal/farmer/${encodeURIComponent(lookup)}/actions/${encodeURIComponent(actionId)}/complete`,
    { method: "POST" },
  );
}

export async function getZoneAdvisory(zoneId) {
  if (USE_MOCK) {
    return {
      zoneId,
      advisoryKey: ADVISORIES[zoneId] || "light_rainfall",
    };
  }
  return coreFetch(`/internal/zone/${encodeURIComponent(zoneId)}/advisory`);
}

export function isMocked() {
  return USE_MOCK;
}
