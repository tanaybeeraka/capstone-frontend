import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./errors.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";

const app = express();

// Render sits behind a proxy; this lets rate limiting see the real client IP.
app.set("trust proxy", 1);
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: "50kb" }));

// Render pings this often. It doesn't touch the database, so Neon can still scale to zero when idle.
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found." });
});
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Bone Buddies API listening on port ${config.port}`);
});
