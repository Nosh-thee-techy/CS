const CACHE_KEY = "my-readiness:last-profile";

export async function fetchReadiness(lookup, lang) {
  const response = await fetch(
    `/api/readiness/${encodeURIComponent(lookup)}?lang=${encodeURIComponent(lang)}`,
  );

  if (response.status === 404) {
    const error = new Error("not_found");
    error.code = "not_found";
    throw error;
  }

  if (!response.ok) {
    const error = new Error("network");
    error.code = "network";
    throw error;
  }

  return response.json();
}

export async function completeAction(lookup, actionId) {
  const response = await fetch(
    `/api/readiness/${encodeURIComponent(lookup)}/actions/${encodeURIComponent(actionId)}/complete`,
    { method: "POST" },
  );

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
