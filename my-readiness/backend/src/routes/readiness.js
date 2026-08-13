import { Router } from "express";
import {
  completeAction,
  getFarmerActions,
  getFarmerScore,
  getZoneAdvisory,
} from "../clients/corePlatform.js";
import { localizeProfile, supportedLocale } from "../lib/localize.js";

const router = Router();

function notFound(res, lookup) {
  return res.status(404).json({
    error: "not_found",
    message: `No farmer found for "${lookup}".`,
  });
}

router.get("/:lookup", async (req, res) => {
  const lookup = decodeURIComponent(req.params.lookup || "").trim();
  const lang = supportedLocale(req.query.lang || process.env.DEFAULT_LOCALE);

  if (!lookup) {
    return res.status(400).json({ error: "missing_lookup" });
  }

  try {
    const score = await getFarmerScore(lookup);
    if (!score) return notFound(res, lookup);

    const [actions, advisory] = await Promise.all([
      getFarmerActions(lookup),
      score.zoneId ? getZoneAdvisory(score.zoneId) : Promise.resolve(null),
    ]);

    const profile = localizeProfile(score, actions, advisory, lang);
    profile.voiceGreetingUrl = `/api/readiness/${encodeURIComponent(lookup)}/greeting?lang=${lang}`;
    res.json(profile);
  } catch (error) {
    const status = error.status || 502;
    if (status === 404) return notFound(res, lookup);
    console.error("GET /api/readiness failed", error);
    res.status(status).json({ error: "upstream_error", message: error.message });
  }
});

router.post("/:lookup/actions/:actionId/complete", async (req, res) => {
  const lookup = decodeURIComponent(req.params.lookup || "").trim();
  const { actionId } = req.params;

  if (!lookup || !actionId) {
    return res.status(400).json({ error: "missing_params" });
  }

  try {
    const result = await completeAction(lookup, actionId);
    res.json({
      ok: true,
      scoreUnchanged: true,
      queuedForVerification: true,
      ...result,
    });
  } catch (error) {
    const status = error.status || 502;
    console.error("POST action complete failed", error);
    res.status(status).json({ error: "upstream_error", message: error.message });
  }
});

export default router;
