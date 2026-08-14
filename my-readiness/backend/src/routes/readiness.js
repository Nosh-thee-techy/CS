import { Router } from "express";
import multer from "multer";
import {
  completeAction,
  getFarmerActions,
  getFarmerScore,
  getZoneAdvisory,
  submitLoanApplication,
} from "../clients/corePlatform.js";
import { localizeProfile, supportedLocale } from "../lib/localize.js";
import { verifyOtp } from "../lib/otp.js";
import { lookupRateLimit } from "../lib/rateLimit.js";

const router = Router();
const PURPOSES = new Set(["input_purchase", "farm_equipment", "other"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

function notFound(res) {
  return res.status(404).json({
    error: "not_found",
    message: "We couldn't find that number. Check it and try again.",
  });
}

async function loadProfile(lookup, lang) {
  const score = await getFarmerScore(lookup);
  if (!score) return null;
  const [actions, advisory] = await Promise.all([
    getFarmerActions(lookup),
    score.zoneId ? getZoneAdvisory(score.zoneId) : Promise.resolve(null),
  ]);
  return localizeProfile(score, actions, advisory, lang);
}

router.get("/:lookup", lookupRateLimit, async (req, res) => {
  const lookup = decodeURIComponent(req.params.lookup || "").trim();
  const lang = supportedLocale(req.query.lang || process.env.DEFAULT_LOCALE);

  if (!lookup) {
    return res.status(400).json({ error: "missing_lookup" });
  }

  try {
    const profile = await loadProfile(lookup, lang);
    if (!profile) return notFound(res);
    res.json(profile);
  } catch (error) {
    const status = error.status || 502;
    if (status === 404) return notFound(res);
    if (status === 429) {
      return res.status(429).json({
        error: "rate_limited",
        message: "Too many lookups. Wait a moment and try again.",
      });
    }
    console.error("GET /api/readiness failed", error);
    res.status(status).json({ error: "upstream_error", message: error.message });
  }
});

router.post(
  "/:lookup/actions/:actionId/complete",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    const lookup = decodeURIComponent(req.params.lookup || "").trim();
    const { actionId } = req.params;

    if (!lookup || !actionId) {
      return res.status(400).json({ error: "missing_params" });
    }

    const photo = req.files?.photo?.[0];
    const audio = req.files?.audio?.[0];
    const evidence = {
      photo: Boolean(photo),
      audio: Boolean(audio),
      note: String(req.body?.note || "").trim().slice(0, 280),
      photoMime: photo?.mimetype || null,
      audioMime: audio?.mimetype || null,
      photoBytes: photo?.size || 0,
      audioBytes: audio?.size || 0,
    };

    try {
      const result = await completeAction(lookup, actionId, evidence);
      res.json({
        ok: true,
        scoreUnchanged: true,
        queuedForVerification: true,
        evidence,
        ...result,
      });
    } catch (error) {
      const status = error.status || 502;
      console.error("POST action complete failed", error);
      res.status(status).json({ error: "upstream_error", message: error.message });
    }
  },
);

router.post("/:lookup/loan-application", async (req, res) => {
  const lookup = decodeURIComponent(req.params.lookup || "").trim();
  const purpose = String(req.body?.purpose || "");
  const otpCode = String(req.body?.otpCode || "");

  if (!lookup) {
    return res.status(400).json({ error: "missing_lookup" });
  }
  if (!PURPOSES.has(purpose)) {
    return res.status(400).json({ error: "invalid_purpose" });
  }
  if (!verifyOtp(lookup, otpCode)) {
    return res.status(401).json({
      error: "otp_invalid",
      message: "That code didn't match. Request a new one and try again.",
    });
  }

  try {
    const application = await submitLoanApplication(lookup, purpose);
    res.json({ ok: true, application });
  } catch (error) {
    const status = error.status || 502;
    const reason =
      error.code === "pending_application"
        ? "already have a pending application"
        : error.code === "not_eligible"
          ? "Not eligible"
          : error.message;
    console.error("POST loan application failed", error);
    res.status(status).json({ error: error.code || "upstream_error", message: reason });
  }
});

export default router;
