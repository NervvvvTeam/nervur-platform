const express = require("express");
const { generateWithAI } = require("../services/ai");
const Audit = require("../models/Audit");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// Auth middleware (optional — saves audit if authenticated, does not block unauthenticated)
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token && token.split(".").length === 3) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        maxAge: "24h",
      });
      if (decoded.userId && mongoose.Types.ObjectId.isValid(decoded.userId)) {
        req.user = { id: decoded.userId, _id: decoded.userId, role: decoded.role };
      }
    } catch (e) { /* ignore — optional auth */ }
  }
  next();
}

// Use the shared hardened auth middleware for required-auth routes
const requireAuth = authMiddleware;

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch { return url; }
}

async function fetchLighthouse(url, strategy = "mobile", retries = 3) {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  const keyParam = apiKey ? `&key=${apiKey}` : "";
  const fullUrl = `${PSI_API}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=seo&category=best-practices${keyParam}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(fullUrl, { signal: AbortSignal.timeout(120000) });
      if (response.status === 429) {
        console.log(`[Phantom] Rate limited (429), retry ${attempt + 1}/${retries} in ${(attempt + 1) * 5}s...`);
        await new Promise(r => setTimeout(r, (attempt + 1) * 5000));
        continue;
      }
      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Phantom] PSI error ${response.status}:`, errText.substring(0, 300));
        throw new Error(`Lighthouse API: ${response.status}`);
      }
      return response.json();
    } catch (fetchErr) {
      if (attempt === retries - 1) throw fetchErr;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error("Google PageSpeed temporairement indisponible (rate limit). Reessayez dans 30 secondes.");
}

function extractDetailedAudits(psiData) {
  const audits = psiData.lighthouseResult?.audits || {};
  const cats = psiData.lighthouseResult?.categories || {};

  const scores = {
    performance: Math.round((cats.performance?.score || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    seo: Math.round((cats.seo?.score || 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
  };
  scores.global = Math.round((scores.performance * 0.25 + scores.accessibility * 0.2 + scores.seo * 0.25 + scores.bestPractices * 0.3));

  const allIssues = [];
  for (const [key, audit] of Object.entries(audits)) {
    if (!audit || audit.score === null || audit.score === undefined) continue;
    if (audit.score >= 0.9) continue;

    let category = "performance";
    const catRefs = {
      performance: cats.performance?.auditRefs?.map(r => r.id) || [],
      accessibility: cats.accessibility?.auditRefs?.map(r => r.id) || [],
      seo: cats.seo?.auditRefs?.map(r => r.id) || [],
      "best-practices": cats["best-practices"]?.auditRefs?.map(r => r.id) || [],
    };
    if (catRefs.accessibility.includes(key)) category = "accessibility";
    else if (catRefs.seo.includes(key)) category = "seo";
    else if (catRefs["best-practices"].includes(key)) category = "bestPractices";

    const severity = audit.score === 0 ? "critical" : audit.score < 0.5 ? "warning" : "info";
    allIssues.push({
      category, severity,
      title: audit.title || key,
      description: audit.description ? audit.description.replace(/\[.*?\]\(.*?\)/g, "").substring(0, 200) : "",
      displayValue: audit.displayValue || "",
      score: audit.score,
    });
  }
  allIssues.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  const cwv = {};
  const parseMetric = (audit, unit = "s") => {
    if (!audit) return null;
    const val = audit.numericValue || 0;
    const score = audit.score || 0;
    return {
      value: unit === "ms" ? Math.round(val) : +(val / 1000).toFixed(2),
      unit,
      status: score >= 0.9 ? "good" : score >= 0.5 ? "needs-improvement" : "poor",
      display: audit.displayValue || "",
    };
  };
  cwv.lcp = parseMetric(audits["largest-contentful-paint"], "s");
  cwv.fcp = parseMetric(audits["first-contentful-paint"], "s");
  cwv.cls = audits["cumulative-layout-shift"] ? {
    value: +(audits["cumulative-layout-shift"].numericValue || 0).toFixed(3),
    unit: "", status: (audits["cumulative-layout-shift"].score || 0) >= 0.9 ? "good" : (audits["cumulative-layout-shift"].score || 0) >= 0.5 ? "needs-improvement" : "poor",
    display: audits["cumulative-layout-shift"].displayValue || "",
  } : null;
  cwv.tbt = parseMetric(audits["total-blocking-time"], "ms");
  cwv.speedIndex = parseMetric(audits["speed-index"], "s");
  cwv.tti = parseMetric(audits["interactive"], "s");

  return { scores, issues: allIssues.slice(0, 15), coreWebVitals: cwv };
}

// POST /api/phantom/audit — Run new audit (optionalAuth so marketing page works too)
router.post("/audit", optionalAuth, async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'url' est requis." });
  }
  if (url.length > 2000) {
    return res.status(400).json({ error: "L'URL est trop longue (max 2000 caracteres)." });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

  // Validate URL format
  try {
    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "URL invalide. Utilisez http ou https." });
    }
  } catch {
    return res.status(400).json({ error: "URL invalide. Exemple : https://exemple.fr" });
  }

  try {
    console.log(`[Phantom] Auditing: ${targetUrl}`);
    const psiData = await fetchLighthouse(targetUrl, "mobile");
    const { scores, issues, coreWebVitals } = extractDetailedAudits(psiData);

    // AI enrichment
    const issuesSummary = issues.slice(0, 8).map(i =>
      `[${i.severity}] ${i.category}: ${i.title} ${i.displayValue ? `(${i.displayValue})` : ""}`
    ).join("\n");

    const prompt = `Tu es un expert UX/CRO francais. REPONDS UNIQUEMENT EN FRANCAIS. Voici les VRAIS resultats Lighthouse pour "${targetUrl}" :

SCORES : Performance ${scores.performance}, Accessibilite ${scores.accessibility}, SEO ${scores.seo}, Bonnes Pratiques ${scores.bestPractices}
CORE WEB VITALS : LCP=${coreWebVitals.lcp?.display || "N/A"}, FCP=${coreWebVitals.fcp?.display || "N/A"}, CLS=${coreWebVitals.cls?.display || "N/A"}, TBT=${coreWebVitals.tbt?.display || "N/A"}

PROBLEMES REELS DETECTES :
${issuesSummary}

Pour chaque probleme, donne un titre EN FRANCAIS, une explication EN FRANCAIS et une solution concrete EN FRANCAIS. Retourne un JSON :
{
  "issues": [
    {
      "category": "performance|accessibility|seo|bestPractices",
      "severity": "critical|warning|info",
      "title": "[titre EN FRANCAIS, ex: 'Reduire le CSS inutilise', 'Optimiser les images']",
      "description": "[explication en 1-2 phrases EN FRANCAIS]",
      "fix": "[solution concrete en 1 phrase EN FRANCAIS]",
      "impact": "+[X]% [metrique]"
    }
  ],
  "summary": "[Resume en 2 phrases EN FRANCAIS avec priorites]"
}

Genere exactement 8 issues basees sur les VRAIS problemes ci-dessus. TOUT EN FRANCAIS. Retourne UNIQUEMENT le JSON.`;

    let enrichedIssues = issues.slice(0, 8).map(i => ({
      category: i.category, severity: i.severity, title: i.title,
      description: i.displayValue || i.description.substring(0, 100),
      fix: "Optimiser selon les recommandations Lighthouse",
      impact: i.severity === "critical" ? "+15% performance" : "+5% performance"
    }));
    let summary = `Score global : Performance ${scores.performance}/100, SEO ${scores.seo}/100. ${issues.filter(i => i.severity === "critical").length} problemes critiques detectes.`;

    try {
      const aiText = await generateWithAI(prompt);
      const aiData = JSON.parse(aiText);
      if (aiData.issues?.length > 0) enrichedIssues = aiData.issues;
      if (aiData.summary) summary = aiData.summary;
    } catch (aiErr) {
      console.error("[Phantom] AI enrichment failed, using raw data:", aiErr.message);
    }

    // Save to DB if authenticated
    let auditId = null;
    if (req.user) {
      try {
        const uid = req.userId;
        const audit = await Audit.create({
          userId: uid,
          url: targetUrl,
          domain: extractDomain(targetUrl),
          scores,
          coreWebVitals,
          issues: enrichedIssues,
          aiSummary: summary,
          realData: true,
        });
        auditId = audit._id;
      } catch (dbErr) {
        console.error("[Phantom] DB save failed:", dbErr.message);
      }
    }

    res.json({
      auditId,
      scores,
      issues: enrichedIssues,
      summary,
      coreWebVitals,
      provider: "lighthouse+ai",
      realData: true,
    });

  } catch (err) {
    console.error("[Phantom] Lighthouse Error:", err.message);
    res.status(503).json({
      error: "Impossible d'auditer ce site. Verifiez l'URL et reessayez.",
      fallback: true,
    });
  }
});

// GET /api/phantom/history — Get audit history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const { domain, limit = 20 } = req.query;
    const query = { userId: req.userId };
    if (domain && typeof domain === "string") query.domain = domain.substring(0, 253);

    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const audits = await Audit.find(query)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .select("url domain scores.global scores.performance scores.seo scores.accessibility scores.bestPractices createdAt");

    // Get unique domains for filter
    const domains = await Audit.distinct("domain", { userId: req.userId });

    res.json({ audits, domains });
  } catch (err) {
    console.error("[Phantom] History error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/phantom/audit/:id — Get single audit detail
router.get("/audit/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const audit = await Audit.findOne({ _id: req.params.id, userId: req.userId });
    if (!audit) return res.status(404).json({ error: "Audit non trouve" });
    res.json(audit);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/phantom/evolution — Score evolution over time for a domain
router.get("/evolution", requireAuth, async (req, res) => {
  try {
    const { domain } = req.query;
    const query = { userId: req.userId };
    if (domain) query.domain = domain;

    const audits = await Audit.find(query)
      .sort({ createdAt: 1 })
      .limit(50)
      .select("url domain scores createdAt");

    res.json({ audits });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/phantom/recommendations — Top recommendations across all audits
router.get("/recommendations", requireAuth, async (req, res) => {
  try {
    // Get latest audit per domain
    const domains = await Audit.distinct("domain", { userId: req.userId });
    const recommendations = [];

    for (const domain of domains) {
      const latest = await Audit.findOne({ userId: req.userId, domain })
        .sort({ createdAt: -1 });
      if (!latest) continue;

      for (const issue of latest.issues) {
        recommendations.push({
          domain,
          url: latest.url,
          auditDate: latest.createdAt,
          ...issue.toObject(),
        });
      }
    }

    // Sort by severity
    const order = { critical: 0, warning: 1, info: 2 };
    recommendations.sort((a, b) => order[a.severity] - order[b.severity]);

    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
