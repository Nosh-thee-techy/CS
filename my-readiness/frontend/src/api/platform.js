import { API_BASE, apiUrl } from "./readiness.js";

const REPAYMENT_CALLBACK = `${API_BASE || "https://cs-fork.onrender.com"}/api/loans/loop-repayment-callback`;

async function jsonRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error?.message || payload?.message || "Request failed");
    error.status = response.status;
    throw error;
  }
  return payload?.data !== undefined ? payload.data : payload;
}

export async function requestLoan({ farmerId, cooperativeId, requestedAmount, purpose }) {
  return jsonRequest("/api/loans", {
    method: "POST",
    body: JSON.stringify({ farmerId, cooperativeId, requestedAmount, purpose }),
  });
}

export async function getLoansByFarmer(farmerId) {
  return jsonRequest(`/api/loans/farmer/${encodeURIComponent(farmerId)}`);
}

export async function getOutstandingLoans(farmerId) {
  return jsonRequest(`/api/loans/farmer/${encodeURIComponent(farmerId)}/outstanding`);
}

export async function promptLoanRepayment(loanId, { amount, mobileNo, reason } = {}) {
  return jsonRequest(`/api/loans/${encodeURIComponent(loanId)}/repayment-prompt`, {
    method: "POST",
    body: JSON.stringify({
      amount,
      mobileNo,
      callBackUrl: REPAYMENT_CALLBACK,
      reason: reason || "Loan repayment from My Readiness",
    }),
  });
}

export async function getPayoutsByFarmer(farmerId) {
  return jsonRequest(`/api/payouts/farmer/${encodeURIComponent(farmerId)}`);
}

export async function initiatePayout({ farmerId, cooperativeId }) {
  return jsonRequest("/api/payouts/initiate", {
    method: "POST",
    body: JSON.stringify({ farmerId, cooperativeId }),
  });
}

export async function getUnpaidProduce(farmerId) {
  return jsonRequest(`/api/produce/farmer/${encodeURIComponent(farmerId)}/unpaid`);
}

export async function getCredit(farmerId) {
  return jsonRequest(`/api/credit/${encodeURIComponent(farmerId)}`);
}
