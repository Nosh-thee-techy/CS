const WINDOW_MS = 60_000;
const MAX = 10;
const hits = new Map();

export function lookupRateLimit(req, res, next) {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX) {
    return res.status(429).json({
      error: "rate_limited",
      message: "Too many lookups. Wait a moment and try again.",
    });
  }

  recent.push(now);
  hits.set(ip, recent);
  next();
}
