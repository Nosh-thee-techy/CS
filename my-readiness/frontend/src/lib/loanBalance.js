const INSTALLMENT_KES = 1500;

function isFailedPayment(payment) {
  const raw = String(payment.rawStatus || "").toLowerCase();
  if (raw) return raw === "failed";
  const status = String(payment.status || "").toLowerCase();
  return status.includes("fail") || status.includes("imeshindwa");
}

function isPendingPayment(payment) {
  const raw = String(payment.rawStatus || "").toLowerCase();
  if (raw) return raw === "pending";
  const status = String(payment.status || "").toLowerCase();
  return status.includes("pending") || status.includes("inasubiri");
}

function countsAsPosted(payment) {
  return !isFailedPayment(payment) && !isPendingPayment(payment);
}

export function summarizeLoan(payments) {
  let disbursed = 0;
  let repaid = 0;

  for (const payment of payments || []) {
    const amount = Number(payment.amount) || 0;
    if (payment.kind === "disbursement" && countsAsPosted(payment)) {
      disbursed += amount;
    }
    if (payment.kind === "loan_repayment" && !isFailedPayment(payment)) {
      repaid += amount;
    }
  }

  const outstanding = Math.max(0, disbursed - repaid);
  const installment = outstanding > 0 ? Math.min(INSTALLMENT_KES, outstanding) : 0;

  return { disbursed, repaid, outstanding, installment };
}
