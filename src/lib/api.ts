/**
 * Agricultural Credit Platform API client.
 * Production default: https://cs-fork.onrender.com
 * Local `npm run dev` uses Vite's /api proxy unless VITE_API_BASE_URL is set.
 */

export const RENDER_API_BASE = 'https://cs-fork.onrender.com';

const envBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE = (
  envBase !== undefined && String(envBase).trim() !== ''
    ? String(envBase)
    : import.meta.env.DEV
      ? ''
      : RENDER_API_BASE
).replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

type Json = Record<string, unknown> | unknown[] | null;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers.has('Content-Type') && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(apiUrl(path), { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const payload = (contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text()) as { error?: { message?: string }; message?: string; success?: boolean; data?: T } | string;

  if (!response.ok) {
    const message =
      (typeof payload === 'object' && payload && (payload.error?.message || payload.message)) ||
      `Request failed (${response.status})`;
    throw new ApiError(String(message), response.status);
  }

  return payload as T;
}

type Envelope<T> = { success: boolean; data: T; count?: number; message?: string };

function unwrap<T>(body: Envelope<T> | T): T {
  if (body && typeof body === 'object' && 'success' in body && 'data' in (body as Envelope<T>)) {
    return (body as Envelope<T>).data;
  }
  return body as T;
}

export type ApiFarmer = {
  farmerId: string;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  cooperativeId: string;
  memberNumber?: string;
  status?: string;
  mpesaVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiProduce = {
  recordId: string;
  farmerId: string;
  cooperativeId: string;
  cropType: string;
  quantityKg: number;
  ratePerKg: number;
  totalAmount: number;
  payoutStatus?: string;
  produceDate?: string;
};

export type ApiLoan = {
  loanId: string;
  farmerId: string;
  farmerName?: string;
  cooperativeId: string;
  requestedAmount: number;
  approvedAmount?: number;
  outstandingBalance?: number;
  purpose?: string;
  status: string;
  creditScoreAtRequest?: number;
  loopTransactionRef?: string;
  createdAt?: string;
  disbursedAt?: string;
};

export type ApiCredit = {
  farmerId: string;
  score: number;
  displayScore?: number;
  riskTier: string;
  maxLoanLimit: number;
  aiExplanation?: string;
  lastCalculatedAt?: string;
};

export type ApiPayout = {
  payoutId: string;
  farmerId: string;
  cooperativeId: string;
  grossProduceAmount: number;
  loanDeductionAmount: number;
  netPayoutAmount: number;
  status: string;
  loopTransactionRef?: string;
  createdAt?: string;
};

export const api = {
  health: () => request<{ status: string; timestamp: string }>('/health'),

  registerFarmer: (body: {
    fullName: string;
    nationalId: string;
    phoneNumber: string;
    cooperativeId: string;
  }) => request<Envelope<ApiFarmer>>('/api/farmers', { method: 'POST', body: JSON.stringify(body) }).then(unwrap),

  getFarmer: (farmerId: string) =>
    request<Envelope<ApiFarmer>>(`/api/farmers/${encodeURIComponent(farmerId)}`).then(unwrap),

  listFarmersByCooperative: (cooperativeId: string) =>
    request<Envelope<ApiFarmer[]>>(`/api/farmers/cooperative/${encodeURIComponent(cooperativeId)}`).then(unwrap),

  listFarmers: () => request<Envelope<ApiFarmer[]>>('/api/farmers').then(unwrap),

  updateFarmer: (farmerId: string, body: Json) =>
    request<Envelope<ApiFarmer>>(`/api/farmers/${encodeURIComponent(farmerId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }).then(unwrap),

  deleteFarmer: (farmerId: string) =>
    request<Envelope<ApiFarmer>>(`/api/farmers/${encodeURIComponent(farmerId)}`, { method: 'DELETE' }).then(unwrap),

  recordProduce: (body: {
    farmerId: string;
    cooperativeId: string;
    cropType: string;
    quantityKg: number;
    ratePerKg: number;
  }) => request<Envelope<ApiProduce>>('/api/produce', { method: 'POST', body: JSON.stringify(body) }).then(unwrap),

  getProduceByFarmer: (farmerId: string, cooperativeId?: string) => {
    const query = cooperativeId ? `?cooperativeId=${encodeURIComponent(cooperativeId)}` : '';
    return request<Envelope<ApiProduce[]>>(`/api/produce/farmer/${encodeURIComponent(farmerId)}${query}`).then(unwrap);
  },

  getUnpaidProduce: (farmerId: string) =>
    request<Envelope<{ records: ApiProduce[]; grossTotal: number }>>(
      `/api/produce/farmer/${encodeURIComponent(farmerId)}/unpaid`,
    ).then(unwrap),

  getProduceStats: (farmerId: string) =>
    request<Envelope<Record<string, unknown>>>(`/api/produce/farmer/${encodeURIComponent(farmerId)}/stats`).then(unwrap),

  calculateCredit: (farmerId: string) =>
    request<Envelope<ApiCredit>>(`/api/credit/${encodeURIComponent(farmerId)}/calculate`, { method: 'POST' }).then(unwrap),

  getCredit: (farmerId: string) =>
    request<Envelope<ApiCredit>>(`/api/credit/${encodeURIComponent(farmerId)}`).then(unwrap),

  requestLoan: (body: { farmerId: string; cooperativeId: string; requestedAmount: number }) =>
    request<Envelope<{ loan: ApiLoan; creditProfile?: ApiCredit }>>('/api/loans', {
      method: 'POST',
      body: JSON.stringify(body),
    }).then(unwrap),

  decideLoan: (loanId: string, action: 'APPROVE' | 'REJECT', approvedAmount?: number) =>
    request<Envelope<ApiLoan>>(`/api/loans/${encodeURIComponent(loanId)}/decision`, {
      method: 'POST',
      body: JSON.stringify({ action, ...(approvedAmount != null ? { approvedAmount } : {}) }),
    }).then(unwrap),

  getLoan: (loanId: string) =>
    request<Envelope<ApiLoan>>(`/api/loans/${encodeURIComponent(loanId)}`).then(unwrap),

  getLoansByFarmer: (farmerId: string) =>
    request<Envelope<ApiLoan[]>>(`/api/loans/farmer/${encodeURIComponent(farmerId)}`).then(unwrap),

  getLoansByCooperative: (cooperativeId: string) =>
    request<Envelope<ApiLoan[]>>(`/api/loans/cooperative/${encodeURIComponent(cooperativeId)}`).then(unwrap),

  getOutstandingLoans: (farmerId: string) =>
    request<Envelope<{ activeLoans: ApiLoan[]; totalOutstanding: number }>>(
      `/api/loans/farmer/${encodeURIComponent(farmerId)}/outstanding`,
    ).then(unwrap),

  promptRepayment: (
    loanId: string,
    body: {
      amount?: number;
      mobileNo?: string;
      merchantTill?: string;
      callBackUrl?: string;
      reason?: string;
    } = {},
  ) =>
    request<Envelope<unknown>>(`/api/loans/${encodeURIComponent(loanId)}/repayment-prompt`, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then(unwrap),

  initiatePayout: (body: { farmerId: string; cooperativeId: string }) =>
    request<Envelope<{ payout: ApiPayout; breakdown?: Record<string, unknown> }>>('/api/payouts/initiate', {
      method: 'POST',
      body: JSON.stringify(body),
    }).then(unwrap),

  bulkPayout: (cooperativeId: string) =>
    request<Envelope<unknown>>('/api/payouts/bulk', {
      method: 'POST',
      body: JSON.stringify({ cooperativeId }),
    }).then(unwrap),

  getPayout: (payoutId: string) =>
    request<Envelope<ApiPayout>>(`/api/payouts/${encodeURIComponent(payoutId)}`).then(unwrap),

  getPayoutsByFarmer: (farmerId: string) =>
    request<Envelope<ApiPayout[]>>(`/api/payouts/farmer/${encodeURIComponent(farmerId)}`).then(unwrap),

  platformSnapshot: () => request<Envelope<Record<string, unknown>>>('/api/platform/snapshot').then(unwrap),
};
