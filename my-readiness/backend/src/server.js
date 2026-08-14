/**
 * Optional standalone BFF (port 3001).
 * In this monorepo, My Readiness is mounted on the main API:
 *   npm run dev --prefix ../backend   → http://localhost:3000
 */
import "dotenv/config";
import cors from "cors";
import express from "express";
import { isMocked } from "./clients/corePlatform.js";
import adminRouter from "./routes/admin.js";
import otpRouter from "./routes/otp.js";
import readinessRouter from "./routes/readiness.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "my-readiness",
    corePlatform: isMocked() ? "mock" : "live",
  });
});

app.use("/api/otp", otpRouter);
app.use("/api/admin", adminRouter);
app.use("/api/readiness", readinessRouter);

app.listen(port, () => {
  console.log(`My Readiness API on http://localhost:${port} (${isMocked() ? "mock" : "live"} core platform)`);
});
