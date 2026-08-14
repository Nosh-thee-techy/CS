import { Router } from "express";
import { issueOtp, verifyOtp } from "../lib/otp.js";
import { isMocked } from "../clients/corePlatform.js";
import FarmerService from "../../../../backend/src/services/FarmerService.js";
import { sendSms, isAfricasTalkingReady } from "../../../../backend/src/clients/africasTalking.js";
import { t, ussdLocale } from "../../../../backend/src/lib/ussdCopy.js";

const router = Router();

router.post("/request", async (req, res) => {
  const memberId = String(req.body?.memberId || "").trim();
  if (!memberId) {
    return res.status(400).json({ error: "missing_member", success: false });
  }

  const code = issueOtp(memberId);
  const payload = { success: true, sent: true };

  const farmer = await FarmerService.findByLookup(memberId);
  const phone = farmer?.phoneNumber;
  const lang = ussdLocale(req.body?.lang || process.env.DEFAULT_LOCALE);

  if (phone && isAfricasTalkingReady()) {
    try {
      const sms = await sendSms({ to: phone, message: t(lang).otpSms(code) });
      payload.channel = sms.skipped ? "memory" : "sms";
    } catch (error) {
      console.warn("OTP SMS failed:", error.message);
      payload.channel = "memory";
      payload.smsError = true;
    }
  } else {
    payload.channel = "memory";
  }

  if (isMocked() || payload.channel === "memory") {
    payload.demoCode = code;
  }
  res.json(payload);
});

router.post("/verify", (req, res) => {
  const memberId = String(req.body?.memberId || "").trim();
  const otpCode = String(req.body?.otpCode || "").trim();
  const success = verifyOtp(memberId, otpCode);
  if (!success) {
    return res.status(401).json({
      success: false,
      message: "That code didn't match. Request a new one and try again.",
    });
  }
  res.json({ success: true });
});

export default router;
