import { createHash } from "crypto";

const cache = new Map();
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const API_URL = (process.env.FEATHERLESS_API_URL || "https://api.featherless.ai/v1").replace(/\/$/, "");
const API_KEY = process.env.FEATHERLESS_API_KEY || "";
const MODEL = process.env.FEATHERLESS_MODEL || "Qwen/Qwen2.5-7B-Instruct";

const LANGUAGE_NAMES = {
  sw: "Kiswahili",
  lg: "Luganda",
  en: "English",
};

export function isFeatherlessEnabled() {
  return Boolean(API_KEY);
}

function hash(text) {
  return createHash("sha256").update(String(text)).digest("hex").slice(0, 16);
}

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet(key, value) {
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}

/**
 * Translates dynamic, per-farmer English text (why, action how/impact,
 * climate advisory). Static UI strings must NOT go through this.
 * Returns null when Featherless is unset or the call fails — caller falls back.
 */
export async function localizeDynamicContent(englishText, targetLanguage) {
  const text = String(englishText || "").trim();
  const lang = String(targetLanguage || "en").slice(0, 2).toLowerCase();
  if (!text) return text;
  if (lang === "en") return text;
  if (!API_KEY) return null;

  const cacheKey = `${lang}:${hash(text)}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const languageName = LANGUAGE_NAMES[lang] || lang;
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://readiness.kalicoop.co.ke",
        "X-Title": "My Readiness",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You translate into plain farmer-facing language for a Kenyan agricultural co-op. Keep meaning, keep numbers and names, no jargon. Return only the translation.",
          },
          {
            role: "user",
            content: `Translate to ${languageName}. Context: financial/agricultural, plain language, farmer-facing.\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Featherless translate failed", response.status);
      return null;
    }

    const body = await response.json();
    const translated = body?.choices?.[0]?.message?.content?.trim();
    if (!translated) return null;
    cacheSet(cacheKey, translated);
    return translated;
  } catch (error) {
    console.error("Featherless translate error", error.message);
    return null;
  }
}
