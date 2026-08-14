const TTL_MS = 5 * 60_000;
const codes = new Map();

function normalizeMember(memberId) {
  return String(memberId || "").trim().toUpperCase();
}

export function issueOtp(memberId) {
  const key = normalizeMember(memberId);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  codes.set(key, { code, expiresAt: Date.now() + TTL_MS });
  return code;
}

export function verifyOtp(memberId, otpCode) {
  const key = normalizeMember(memberId);
  const record = codes.get(key);
  if (!record || Date.now() > record.expiresAt) {
    codes.delete(key);
    return false;
  }
  if (String(otpCode || "").trim() !== record.code) return false;
  codes.delete(key);
  return true;
}
