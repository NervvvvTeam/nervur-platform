const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const MonitoredSite = require("../models/MonitoredSite");

// ═══ Health check function ═══
async function checkSiteHealth(domain) {
  const results = {};

  // 1. Uptime check (HTTP request)
  try {
    const start = Date.now();
    const resp = await fetch(`https://${domain}`, { signal: AbortSignal.timeout(10000) });
    results.uptime = { status: resp.ok, responseTime: Date.now() - start, statusCode: resp.status };
  } catch (e) {
    results.uptime = { status: false, error: e.message };
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
    results.ssl = { valid: true, expiryDate: cert.valid_to, daysLeft, issuer: cert.issuer?.O || "Unknown" };
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
    results.dns = { aRecords: records, mxRecords: mx.map(m => m.exchange), spf: hasSPF, dmarc: hasDMARC };
  } catch (e) {
    results.dns = { error: e.message };
  }

  // 4. Domain WHOIS (simplified — use demo data)
  const domainHash = domain.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const daysUntilExpiry = 90 + (domainHash % 300);
  results.domain = { daysUntilExpiry, expiryEstimate: new Date(Date.now() + daysUntilExpiry * 86400000).toISOString() };

  // 5. Calculate overall score
  let score = 0;
  if (results.uptime?.status) score += 25;
  if (results.ssl?.valid && results.ssl.daysLeft > 14) score += 25;
  if (results.dns?.aRecords?.length > 0) score += 15;
  if (results.dns?.spf) score += 10;
  if (results.dns?.dmarc) score += 10;
  if (results.domain?.daysUntilExpiry > 30) score += 15;
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

    // Check if already monitored
    const existing = await MonitoredSite.findOne({ userId: req.userId, domain: cleanDomain });
    if (existing) {
      return res.status(409).json({ error: "Ce domaine est déjà surveillé." });
    }

    // Run initial health check
    const healthResults = checkSiteHealth(cleanDomain);
    const health = await healthResults;

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
        checkedAt: new Date(),
      },
      history: [{ score: health.score, checkedAt: new Date() }],
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
      checkedAt: new Date(),
    };
    site.history.push({ score: health.score, checkedAt: new Date() });

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
