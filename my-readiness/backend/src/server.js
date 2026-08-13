import "dotenv/config";
import cors from "cors";
import express from "express";
import { isMocked } from "./clients/corePlatform.js";
import readinessRouter from "./routes/readiness.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "my-readiness",
    corePlatform: isMocked() ? "mock" : "live",
  });
});

app.use("/api/readiness", readinessRouter);

app.listen(port, () => {
  console.log(`My Readiness API on http://localhost:${port} (${isMocked() ? "mock" : "live"} core platform)`);
});
