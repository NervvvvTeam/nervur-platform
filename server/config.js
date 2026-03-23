// ═══════════════════════════════════════════════════════════════
// NERVUR — Environment Variable Validation
// Validates all required env vars exist at startup.
// Import this AFTER dotenv.config() but BEFORE anything else.
// ═══════════════════════════════════════════════════════════════

function validateEnv() {
  const errors = [];
  const warnings = [];

  // ── Critical: server will not start without these ──
  const required = [
    { key: "JWT_SECRET", minLength: 32, hint: "Generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"" },
  ];

  for (const { key, minLength, hint } of required) {
    const val = process.env[key];
    if (!val) {
      errors.push(`  MISSING: ${key} — ${hint || "Required"}`);
    } else if (minLength && val.length < minLength) {
      errors.push(`  WEAK: ${key} must be at least ${minLength} characters (currently ${val.length})`);
    }
  }

  // ── Recommended: app will work with reduced features ──
  const recommended = [
    { key: "MONGODB_URI", feature: "Sentinel Dashboard, user auth, data persistence" },
    { key: "NODE_ENV", feature: "Production security hardening (rate limits, CORS)" },
  ];

  // At least one AI key is needed
  const hasAI = process.env.ANTHROPIC_API_KEY || process.env["CLE_API_ANTHROPIC"]
    || process.env.OPENAI_API_KEY || process.env["CLE_API_OPENAI"];
  if (!hasAI) {
    warnings.push("  MISSING: ANTHROPIC_API_KEY or OPENAI_API_KEY — AI features will be disabled");
  }

  for (const { key, feature } of recommended) {
    if (!process.env[key]) {
      warnings.push(`  MISSING: ${key} — Needed for: ${feature}`);
    }
  }

  // ── Optional: nice to have ──
  const optional = [
    { key: "RESEND_API_KEY", feature: "Nexus email campaigns" },
    { key: "GOOGLE_API_KEY", feature: "PageSpeed Insights (Phantom/Atlas)" },
    { key: "GOOGLE_CLIENT_ID", feature: "Google Business OAuth (Sentinel)" },
    { key: "GOOGLE_CLIENT_SECRET", feature: "Google Business OAuth (Sentinel)" },
    { key: "DASHBOARD_URL", feature: "OAuth redirect URL (defaults to https://app.nervur.fr)" },
  ];

  for (const { key, feature } of optional) {
    if (!process.env[key]) {
      warnings.push(`  OPTIONAL: ${key} — ${feature}`);
    }
  }

  // ── JWT_SECRET strength check ──
  if (process.env.JWT_SECRET) {
    const secret = process.env.JWT_SECRET;
    if (secret === "changeme" || secret === "secret" || secret === "jwt_secret" || secret.length < 16) {
      errors.push("  INSECURE: JWT_SECRET is too weak. Use a random 64+ character string.");
    }
  }

  // ── NODE_ENV sanity ──
  if (process.env.NODE_ENV && !["development", "production", "test"].includes(process.env.NODE_ENV)) {
    warnings.push(`  UNUSUAL: NODE_ENV="${process.env.NODE_ENV}" — Expected: development, production, or test`);
  }

  // ── Print results ──
  if (errors.length > 0) {
    console.error("\n[SECURITY] FATAL — Missing or invalid environment variables:");
    errors.forEach(e => console.error(e));
    console.error("\nServer cannot start safely. Fix the above issues in your .env file.\n");
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn("\n[CONFIG] Environment warnings (non-blocking):");
    warnings.forEach(w => console.warn(w));
    console.warn("");
  }

  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT, 10) || 3001,
    isDev: process.env.NODE_ENV !== "production",
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
  };
}

module.exports = { validateEnv };
