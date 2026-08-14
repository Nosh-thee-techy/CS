import { Router } from "express";
import { getFlaggedAccounts } from "../clients/corePlatform.js";

const router = Router();

router.get("/flagged-accounts", async (_req, res) => {
  try {
    const accounts = await getFlaggedAccounts();
    res.json({ accounts });
  } catch (error) {
    const status = error.status || 502;
    res.status(status).json({ error: "upstream_error", message: error.message });
  }
});

export default router;
