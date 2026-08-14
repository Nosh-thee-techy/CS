const RENDER_API = "https://cs-fork.onrender.com";
const envBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE = (
  envBase !== undefined && String(envBase).trim() !== ""
    ? String(envBase)
    : import.meta.env.DEV
      ? ""
      : RENDER_API
).replace(/\/$/, "");

function apiUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export { apiUrl, API_BASE };

const CACHE_KEY = "my-readiness:last-profile";

export async function fetchReadiness(lookup, lang) {
  const response = await fetch(
    apiUrl(`/api/readiness/${encodeURIComponent(lookup)}?lang=${encodeURIComponent(lang)}`),
  );

  if (response.status === 404) {
    const error = new Error("not_found");
    error.code = "not_found";
    throw error;
  }

  if (response.status === 429) {
    const error = new Error("rateLimited");
    error.code = "rateLimited";
    throw error;
  }

  if (!response.ok) {
    const error = new Error("network");
    error.code = "network";
    throw error;
  }

  return response.json();
}

export async function completeAction(lookup, actionId, evidence = {}) {
  const body = new FormData();
  if (evidence.note) body.append("note", evidence.note);
  if (evidence.photo) body.append("photo", evidence.photo);
  if (evidence.audio) body.append("audio", evidence.audio);

  const response = await fetch(
    apiUrl(`/api/readiness/${encodeURIComponent(lookup)}/actions/${encodeURIComponent(actionId)}/complete`),
    { method: "POST", body },
  );

  if (!response.ok) {
    const error = new Error("network");
    error.code = "network";
    throw error;
  }

  return response.json();
}

export async function submitLoan(lookup, purpose, otpCode) {
  const response = await fetch(
    apiUrl(`/api/readiness/${encodeURIComponent(lookup)}/loan-application`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose, otpCode }),
    },
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "loan_error");
    error.code = body.error || "loan_error";
    error.message = body.message || "loan_error";
    throw error;
  }
  return body;
}

export async function requestOtp(memberId) {
  const response = await fetch(apiUrl("/api/otp/request"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "otp_error");
    error.code = body.error || "otp_error";
    throw error;
  }
  return body;
}

export async function fetchFlaggedAccounts() {
  const response = await fetch(apiUrl("/api/admin/flagged-accounts"));
  if (!response.ok) {
    const error = new Error("network");
    error.code = "network";
    throw error;
  }
  return response.json();
}

export function cacheProfile(lookup, profile) {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ lookup, profile, savedAt: Date.now() }),
  );
}

export function readCachedProfile(lookup) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (lookup && parsed.lookup?.toUpperCase() !== lookup.toUpperCase()) return null;
    return parsed;
  } catch {
    return null;
  }
}
