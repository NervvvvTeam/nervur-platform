require("dotenv").config();

// ═══ Validate environment variables before anything else ═══
const { validateEnv } = require("./config");
const { isDev, PORT: configPort } = validateEnv();

// Support alternative variable names
if (!process.env.OPENAI_API_KEY && process.env["CLÉ_API_OPENAI"]) {
  process.env.OPENAI_API_KEY = process.env["CLÉ_API_OPENAI"];
}
if (!process.env.ANTHROPIC_API_KEY && process.env["CLÉ_API_ANTHROPIC"]) {
  process.env.ANTHROPIC_API_KEY = process.env["CLÉ_API_ANTHROPIC"];
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");

// ═══ Marketing site tool routes (existing) ═══
const sentinelRoutes = require("./routes/sentinel");
const vertexRoutes = require("./routes/vertex");
const signalRoutes = require("./routes/signal");
const phantomRoutes = require("./routes/phantom");
const nexusRoutes = require("./routes/nexus");
const nexusEmailRoutes = require("./routes/nexus-email");
const forgeRoutes = require("./routes/forge");
const oracleRoutes = require("./routes/oracle");
const atlasRoutes = require("./routes/atlas");
const fluxRoutes = require("./routes/flux");
const echoRoutes = require("./routes/echo");

// ═══ Sentinel Dashboard routes ═══
const sentinelAuthRoutes = require("./routes/sentinel-auth");
const sentinelBusinessRoutes = require("./routes/sentinel-businesses");
const sentinelReviewRoutes = require("./routes/sentinel-reviews");
const sentinelResponseRoutes = require("./routes/sentinel-responses");
const subscriptionRoutes = require("./routes/subscriptions");
const sentinelAnalyticsRoutes = require("./routes/sentinel-analytics");
const sentinelCompetitorRoutes = require("./routes/sentinel-competitors");
const sentinelToolsRoutes = require("./routes/sentinel-tools");
const vaultRoutes = require("./routes/vault");

const app = express();
const PORT = configPort;

// ═══ Security: Helmet headers (hardened) ═══
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding widget
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// ═══ Security: CORS — strict origin allowlist ═══
const ALLOWED_ORIGINS = [
  "https://nervur.fr",
  "https://www.nervur.fr",
  "https://app.nervur.fr",
];

// In development, also allow local dev servers
if (isDev) {
  ALLOWED_ORIGINS.push(
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
  );
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    // In production, consider tightening this
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS non autorisé"), false);
  },
  methods: ["POST", "GET", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24h
}));

// ═══ Security: Body size limit (1MB max) ═══
app.use(express.json({ limit: "1mb" }));

// ═══ Security: NoSQL Injection Prevention ═══
// Strips any keys starting with $ or containing . from req.body, req.query, req.params
app.use(mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized NoSQL injection attempt in ${key} from ${req.ip}`);
  },
}));

// ═══ Security: Global rate limit — 100 req/15min per IP ═══
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes, réessayez dans quelques minutes." },
});
app.use("/api/", globalLimiter);

// ═══ Security: Auth rate limit — 5 attempts/15min ═══
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de connexion. Réessayez dans 15 minutes." },
  skipSuccessfulRequests: false,
});
app.use("/api/sentinel-app/auth/login", authLimiter);
app.use("/api/sentinel-app/auth/init-admin", authLimiter);

// ═══ Security: AI generation rate limit — 10 req/min ═══
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes IA. Réessayez dans une minute." },
});
// Marketing tool AI endpoints
app.use("/api/sentinel/generate", aiLimiter);
app.use("/api/vertex/generate", aiLimiter);
app.use("/api/nexus/generate", aiLimiter);
app.use("/api/nexus/sequence", aiLimiter);
app.use("/api/nexus/calendar", aiLimiter);
app.use("/api/forge/generate", aiLimiter);
app.use("/api/oracle/analyze", aiLimiter);
app.use("/api/flux/generate", aiLimiter);
app.use("/api/echo/generate", aiLimiter);
app.use("/api/phantom/audit", aiLimiter);
app.use("/api/atlas/analyze", aiLimiter);
app.use("/api/signal/scan", aiLimiter);
// Dashboard AI endpoints
app.use("/api/sentinel-app/responses", aiLimiter);
app.use("/api/sentinel-app/analytics", aiLimiter);
app.use("/api/nexus/email/generate-email", aiLimiter);

// ═══ Security: Email send rate limit — 5 sends/hour ═══
const emailSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 50 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite d'envoi d'emails atteinte. Réessayez dans une heure." },
});
app.use("/api/nexus/email/campaigns/:id/send", emailSendLimiter);

// ═══ MongoDB Connection ═══
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("[NERVUR API] MongoDB connected"))
    .catch(err => console.error("[NERVUR API] MongoDB connection error:", err.message));
} else {
  console.warn("[NERVUR API] MONGODB_URI not set — Sentinel Dashboard disabled");
}

// ═══ Marketing site tool routes ═══
app.use("/api/sentinel", sentinelRoutes);
app.use("/api/vertex", vertexRoutes);
app.use("/api/signal", signalRoutes);
app.use("/api/phantom", phantomRoutes);
app.use("/api/nexus", nexusRoutes);
app.use("/api/nexus/email", nexusEmailRoutes);
app.use("/api/forge", forgeRoutes);
app.use("/api/oracle", oracleRoutes);
app.use("/api/atlas", atlasRoutes);
app.use("/api/flux", fluxRoutes);
app.use("/api/echo", echoRoutes);

// ═══ Sentinel Dashboard API routes ═══
app.use("/api/sentinel-app/auth", sentinelAuthRoutes);
app.use("/api/sentinel-app/businesses", sentinelBusinessRoutes);
app.use("/api/sentinel-app/reviews", sentinelReviewRoutes);
app.use("/api/sentinel-app/responses", sentinelResponseRoutes);
app.use("/api/sentinel-app/subscriptions", subscriptionRoutes);
app.use("/api/sentinel-app/analytics", sentinelAnalyticsRoutes);
app.use("/api/sentinel-app/competitors", sentinelCompetitorRoutes);
app.use("/api/sentinel-app/tools", sentinelToolsRoutes);
app.use("/api/vault", vaultRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    tools: ["sentinel", "vertex", "signal", "phantom", "nexus", "forge", "oracle", "atlas", "flux", "echo"],
    dashboard: { mongodb: mongoose.connection.readyState === 1 },
  });
});

// ═══ Serve frontend in production ═══
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[NERVUR API] Server running on port ${PORT}`);
  console.log(`[NERVUR API] Environment: ${isDev ? "development" : "production"}`);
  console.log(`[NERVUR API] Security: Helmet | CORS restricted | Rate limiting | Mongo sanitize`);

  // Initialize cron scanner if MongoDB is connected
  if (process.env.MONGODB_URI) {
    const { initReviewScanner } = require("./cron/review-scanner");
    initReviewScanner();
  }
});
