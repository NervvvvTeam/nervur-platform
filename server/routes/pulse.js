const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const MonitoredSite = require("../models/MonitoredSite");

// ═══ Security headers to check ═══
const SECURITY_HEADERS = [
  { key: "x-frame-options", label: "X-Frame-Options" },
  { key: "content-security-policy", label: "Content-Security-Policy" },
  { key: "x-content-type-options", label: "X-Content-Type-Options" },
  { key: "strict-transport-security", label: "Strict-Transport-Security" },
  { key: "referrer-policy", label: "Referrer-Policy" },
  { key: "permissions-policy", label: "Permissions-Policy" },
];

// ═══ Health check function ═══
async function checkSiteHealth(domain) {
  const results = {};

  // 1. Uptime check (HTTP request) + Security headers + HTTP/2
  try {
    const start = Date.now();
    const resp = await fetch(`https://${domain}`, { signal: AbortSignal.timeout(10000) });
    results.uptime = { status: resp.ok, responseTime: Date.now() - start, statusCode: resp.status };

    // Security headers check
    const headerResults = {};
    for (const { key, label } of SECURITY_HEADERS) {
      headerResults[key] = {
        label,
        present: resp.headers.has(key),
        value: resp.headers.get(key) || null,
      };
    }
    results.securityHeaders = headerResults;

    // HTTP/2 check (from response headers — alt-svc or upgrade)
    const altSvc = resp.headers.get("alt-svc") || "";
    const hasH2 = altSvc.includes("h2") || altSvc.includes("h3");
    results.http2 = { supported: hasH2, altSvc: altSvc || null };
  } catch (e) {
    results.uptime = { status: false, error: e.message };
    results.securityHeaders = {};
    results.http2 = { supported: false, error: e.message };
  }

  // 2. SSL certificate check
  try {
    const tls = require("tls");
    const cert = await new Promise((resolve, reject) => {
      const socket = tls.connect(443, domain, { servername: domain }, () => {
        const c = socket.getPeerCertificate();
        socket.end();
        resolve(c);
      });
      socket.on("error", reject);
      setTimeout(() => { socket.destroy(); reject(new Error("timeout")); }, 5000);
    });
    const expiryDate = new Date(cert.valid_to);
    const daysLeft = Math.floor((expiryDate - Date.now()) / 86400000);
    results.ssl = { valid: true, expiryDate: cert.valid_to, daysLeft, issuer: cert.issuer?.O || "Unknown", subject: cert.subject?.CN || domain };
  } catch (e) {
    results.ssl = { valid: false, error: e.message };
  }

  // 3. DNS check
  try {
    const dns = require("dns").promises;
    const records = await dns.resolve(domain, "A");
    const mx = await dns.resolve(domain, "MX").catch(() => []);
    const txt = await dns.resolve(domain, "TXT").catch(() => []);
    const hasSPF = txt.some(t => t.join("").includes("v=spf1"));
    const hasDMARC = await dns.resolve(`_dmarc.${domain}`, "TXT").then(r => r.length > 0).catch(() => false);
    const hasDKIM = await dns.resolve(`default._domainkey.${domain}`, "TXT").then(r => r.length > 0).catch(() => false);
    results.dns = { aRecords: records, mxRecords: mx.map(m => m.exchange), spf: hasSPF, dmarc: hasDMARC, dkim: hasDKIM };
  } catch (e) {
    results.dns = { error: e.message };
  }

  // 4. Domain WHOIS (simplified — use demo data)
  const domainHash = domain.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const daysUntilExpiry = 90 + (domainHash % 300);
  results.domain = { daysUntilExpiry, expiryEstimate: new Date(Date.now() + daysUntilExpiry * 86400000).toISOString() };

  // 5. Calculate overall score
  let score = 0;
  if (results.uptime?.status) score += 20;
  if (results.ssl?.valid && results.ssl.daysLeft > 14) score += 20;
  if (results.dns?.aRecords?.length > 0) score += 10;
  if (results.dns?.spf) score += 10;
  if (results.dns?.dmarc) score += 10;
  if (results.domain?.daysUntilExpiry > 30) score += 10;

  // Security headers score (up to 20 points)
  if (results.securityHeaders && typeof results.securityHeaders === "object") {
    const headerKeys = Object.keys(results.securityHeaders);
    const presentCount = headerKeys.filter(k => results.securityHeaders[k]?.present).length;
    const headerScore = headerKeys.length > 0 ? Math.round((presentCount / headerKeys.length) * 20) : 0;
    score += headerScore;
  }

  results.score = score;

  return results;
}

// ═══ POST /api/pulse/sites — Add a site to monitor ═══
router.post("/sites", authMiddleware, async (req, res) => {
  try {
    const { domain, alertEmail } = req.body;
    if (!domain || typeof domain !== "string" || domain.trim().length === 0) {
      return res.status(400).json({ error: "Un domaine est requis." });
    }

    // Clean domain
    const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");

    // Max 10 sites per user
    const count = await MonitoredSite.countDocuments({ userId: req.userId });
    if (count >= 10) {
      return res.status(400).json({ error: "Limite de 10 sites atteinte. Supprimez un site pour en ajouter un nouveau." });
    }

    // Check if already monitored
    const existing = await MonitoredSite.findOne({ userId: req.userId, domain: cleanDomain });
    if (existing) {
      return res.status(409).json({ error: "Ce domaine est déjà surveillé." });
    }

    // Run initial health check
    const health = await checkSiteHealth(cleanDomain);

    const site = await MonitoredSite.create({
      userId: req.userId,
      domain: cleanDomain,
      alertEmail: alertEmail || undefined,
      lastCheck: {
        score: health.score,
        uptime: health.uptime,
        ssl: health.ssl,
        dns: health.dns,
        domain: health.domain,
        securityHeaders: health.securityHeaders,
        http2: health.http2,
        checkedAt: new Date(),
      },
      history: [{
        score: health.score,
        responseTime: health.uptime?.responseTime || null,
        uptimeStatus: health.uptime?.status || false,
        checkedAt: new Date(),
      }],
    });

    res.status(201).json(site);
  } catch (err) {
    console.error("[Pulse] Erreur ajout site:", err.message);
    res.status(500).json({ error: "Erreur lors de l'ajout du site." });
  }
});

// ═══ GET /api/pulse/sites — List monitored sites ═══
router.get("/sites", authMiddleware, async (req, res) => {
  try {
    const sites = await MonitoredSite.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(sites);
  } catch (err) {
    console.error("[Pulse] Erreur liste sites:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des sites." });
  }
});

// ═══ GET /api/pulse/sites/:id — Get site health details ═══
router.get("/sites/:id", authMiddleware, async (req, res) => {
  try {
    const site = await MonitoredSite.findOne({ _id: req.params.id, userId: req.userId });
    if (!site) return res.status(404).json({ error: "Site non trouvé." });
    res.json(site);
  } catch (err) {
    console.error("[Pulse] Erreur détails site:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération du site." });
  }
});

// ═══ GET /api/pulse/sites/:id/status-page — Public-friendly health data ═══
router.get("/sites/:id/status-page", authMiddleware, async (req, res) => {
  try {
    const site = await MonitoredSite.findOne({ _id: req.params.id, userId: req.userId });
    if (!site) return res.status(404).json({ error: "Site non trouvé." });

    const check = site.lastCheck || {};
    const recentHistory = (site.history || []).slice(-30);

    // Calculate uptime percentage from history
    const totalChecks = recentHistory.length;
    const upChecks = recentHistory.filter(h => h.uptimeStatus).length;
    const uptimePercentage = totalChecks > 0 ? Math.round((upChecks / totalChecks) * 10000) / 100 : 100;

    // Build public-friendly response
    const statusPage = {
      domain: site.domain,
      status: check.uptime?.status ? "operational" : "down",
      uptimePercentage,
      lastChecked: check.checkedAt,
      responseTime: check.uptime?.responseTime || null,
      ssl: check.ssl ? {
        valid: check.ssl.valid,
        daysLeft: check.ssl.daysLeft,
        issuer: check.ssl.issuer,
      } : null,
      recentHistory: recentHistory.map(h => ({
        score: h.score,
        responseTime: h.responseTime,
        status: h.uptimeStatus ? "up" : "down",
        checkedAt: h.checkedAt,
      })),
    };

    res.json(statusPage);
  } catch (err) {
    console.error("[Pulse] Erreur status-page:", err.message);
    res.status(500).json({ error: "Erreur lors de la génération de la page de statut." });
  }
});

// ═══ POST /api/pulse/sites/:id/alert — Configure email alerts ═══
router.post("/sites/:id/alert", authMiddleware, async (req, res) => {
  try {
    const site = await MonitoredSite.findOne({ _id: req.params.id, userId: req.userId });
    if (!site) return res.status(404).json({ error: "Site non trouvé." });

    const { alertEmail, alerts } = req.body;

    if (alertEmail !== undefined) {
      if (alertEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alertEmail)) {
        return res.status(400).json({ error: "Adresse email invalide." });
      }
      site.alertEmail = alertEmail || undefined;
    }

    if (alerts && typeof alerts === "object") {
      if (typeof alerts.down === "boolean") site.alerts.down = alerts.down;
      if (typeof alerts.sslExpiring === "boolean") site.alerts.sslExpiring = alerts.sslExpiring;
      if (typeof alerts.domainExpiring === "boolean") site.alerts.domainExpiring = alerts.domainExpiring;
    }

    await site.save();
    res.json(site);
  } catch (err) {
    console.error("[Pulse] Erreur config alertes:", err.message);
    res.status(500).json({ error: "Erreur lors de la configuration des alertes." });
  }
});

// ═══ POST /api/pulse/sites/:id/check — Trigger health check ═══
router.post("/sites/:id/check", authMiddleware, async (req, res) => {
  try {
    const site = await MonitoredSite.findOne({ _id: req.params.id, userId: req.userId });
    if (!site) return res.status(404).json({ error: "Site non trouvé." });

    const health = await checkSiteHealth(site.domain);

    site.lastCheck = {
      score: health.score,
      uptime: health.uptime,
      ssl: health.ssl,
      dns: health.dns,
      domain: health.domain,
      securityHeaders: health.securityHeaders,
      http2: health.http2,
      checkedAt: new Date(),
    };
    site.history.push({
      score: health.score,
      responseTime: health.uptime?.responseTime || null,
      uptimeStatus: health.uptime?.status || false,
      checkedAt: new Date(),
    });

    // Keep only last 100 history entries
    if (site.history.length > 100) {
      site.history = site.history.slice(-100);
    }

    await site.save();
    res.json(site);
  } catch (err) {
    console.error("[Pulse] Erreur check site:", err.message);
    res.status(500).json({ error: "Erreur lors de la vérification du site." });
  }
});

// ═══ DELETE /api/pulse/sites/:id — Remove site ═══
router.delete("/sites/:id", authMiddleware, async (req, res) => {
  try {
    const site = await MonitoredSite.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!site) return res.status(404).json({ error: "Site non trouvé." });
    res.json({ success: true, message: "Site supprimé." });
  } catch (err) {
    console.error("[Pulse] Erreur suppression site:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression du site." });
  }
});

module.exports = router;
