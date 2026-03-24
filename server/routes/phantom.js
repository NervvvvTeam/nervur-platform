const express = require("express");
const { generateWithAI } = require("../services/ai");
const Audit = require("../models/Audit");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
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

// POST /api/phantom/compare/:id — Compare two audits of the same domain
router.post("/compare/:id", requireAuth, async (req, res) => {
  try {
    const { compareWithId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(compareWithId)) {
      return res.status(400).json({ error: "Identifiants invalides" });
    }

    const [current, previous] = await Promise.all([
      Audit.findOne({ _id: req.params.id, userId: req.userId }),
      Audit.findOne({ _id: compareWithId, userId: req.userId }),
    ]);

    if (!current || !previous) {
      return res.status(404).json({ error: "Un ou plusieurs audits introuvables" });
    }

    if (current.domain !== previous.domain) {
      return res.status(400).json({ error: "Les deux audits doivent concerner le meme domaine" });
    }

    const scoreDiff = (key) => ({
      current: current.scores?.[key] || 0,
      previous: previous.scores?.[key] || 0,
      diff: (current.scores?.[key] || 0) - (previous.scores?.[key] || 0),
    });

    const cwvDiff = (key) => {
      const cur = current.coreWebVitals?.[key];
      const prev = previous.coreWebVitals?.[key];
      if (!cur && !prev) return null;
      return {
        current: cur || null,
        previous: prev || null,
        improved: cur && prev ? (key === "cls" ? cur.value <= prev.value : cur.value <= prev.value) : null,
      };
    };

    // Count resolved / new issues
    const currentTitles = new Set((current.issues || []).map(i => i.title));
    const previousTitles = new Set((previous.issues || []).map(i => i.title));
    const resolvedIssues = (previous.issues || []).filter(i => !currentTitles.has(i.title));
    const newIssues = (current.issues || []).filter(i => !previousTitles.has(i.title));

    res.json({
      domain: current.domain,
      current: { id: current._id, url: current.url, date: current.createdAt, scores: current.scores },
      previous: { id: previous._id, url: previous.url, date: previous.createdAt, scores: previous.scores },
      comparison: {
        global: scoreDiff("global"),
        performance: scoreDiff("performance"),
        accessibility: scoreDiff("accessibility"),
        seo: scoreDiff("seo"),
        bestPractices: scoreDiff("bestPractices"),
      },
      coreWebVitals: {
        lcp: cwvDiff("lcp"),
        fcp: cwvDiff("fcp"),
        cls: cwvDiff("cls"),
        tbt: cwvDiff("tbt"),
      },
      resolvedIssues: resolvedIssues.length,
      newIssues: newIssues.length,
      resolvedDetails: resolvedIssues.slice(0, 5),
      newDetails: newIssues.slice(0, 5),
    });
  } catch (err) {
    console.error("[Phantom] Compare error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/phantom/audit/:id/pdf — Generate PDF report for an audit
router.get("/audit/:id/pdf", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const audit = await Audit.findOne({ _id: req.params.id, userId: req.userId });
    if (!audit) return res.status(404).json({ error: "Audit non trouve" });

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="phantom-audit-${audit.domain}-${new Date(audit.createdAt).toISOString().slice(0,10)}.pdf"`);
      res.send(pdfBuffer);
    });
    doc.on("error", (err) => {
      console.error("[Phantom] PDF error:", err.message);
      res.status(500).json({ error: "Erreur generation PDF" });
    });

    const dateStr = new Date(audit.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    // --- Header ---
    doc.fontSize(8).fillColor("#8b5cf6").text("PHANTOM — RAPPORT D'AUDIT", 50, 50);
    doc.fontSize(22).fillColor("#1a1a1a").text("Rapport d'audit web", 50, 72);
    doc.fontSize(12).fillColor("#666").text(`${audit.url} — ${dateStr}`, 50, 100);
    doc.moveTo(50, 125).lineTo(545, 125).strokeColor("#e5e5e5").stroke();

    // --- Scores ---
    doc.fontSize(16).fillColor("#1a1a1a").text("Scores", 50, 140);
    const scoreBoxes = [
      { label: "Global", value: audit.scores?.global || 0, color: "#8b5cf6" },
      { label: "Performance", value: audit.scores?.performance || 0, color: "#8b5cf6" },
      { label: "Accessibilite", value: audit.scores?.accessibility || 0, color: "#3b82f6" },
      { label: "SEO", value: audit.scores?.seo || 0, color: "#10b981" },
      { label: "Bonnes pratiques", value: audit.scores?.bestPractices || 0, color: "#f59e0b" },
    ];
    scoreBoxes.forEach((box, i) => {
      const x = 50 + i * 100;
      const scoreColor = box.value >= 90 ? "#4ADE80" : box.value >= 50 ? "#f59e0b" : "#ef4444";
      doc.roundedRect(x, 165, 90, 55, 6).fillColor("#f8f8f8").fill();
      doc.fontSize(8).fillColor("#888").text(box.label, x + 8, 173, { width: 74 });
      doc.fontSize(22).fillColor(scoreColor).text(`${box.value}`, x + 8, 190, { width: 74 });
    });

    // --- Core Web Vitals ---
    const cwv = audit.coreWebVitals;
    if (cwv) {
      doc.fontSize(16).fillColor("#1a1a1a").text("Core Web Vitals", 50, 240);
      const cwvItems = [
        { label: "LCP", data: cwv.lcp },
        { label: "FCP", data: cwv.fcp },
        { label: "CLS", data: cwv.cls },
        { label: "TBT", data: cwv.tbt },
        { label: "Speed Index", data: cwv.speedIndex },
        { label: "TTI", data: cwv.tti },
      ].filter(c => c.data);

      cwvItems.forEach((item, i) => {
        const x = 50 + (i % 3) * 170;
        const y = 265 + Math.floor(i / 3) * 35;
        const statusColor = item.data.status === "good" ? "#4ADE80" : item.data.status === "needs-improvement" ? "#f59e0b" : "#ef4444";
        doc.fontSize(9).fillColor("#888").text(item.label, x, y);
        doc.fontSize(11).fillColor(statusColor).text(item.data.display || `${item.data.value}${item.data.unit}`, x + 80, y);
      });
    }

    // --- AI Summary ---
    const summaryY = cwv ? 345 : 240;
    if (audit.aiSummary) {
      doc.fontSize(16).fillColor("#1a1a1a").text("Analyse IA", 50, summaryY);
      doc.fontSize(10).fillColor("#555").text(audit.aiSummary, 50, summaryY + 22, { width: 495, lineGap: 4 });
    }

    // --- Issues ---
    const issuesY = audit.aiSummary ? summaryY + 70 : summaryY;
    const issues = audit.issues || [];
    if (issues.length > 0) {
      doc.fontSize(16).fillColor("#1a1a1a").text(`Problemes detectes (${issues.length})`, 50, issuesY);

      const categoryLabels = { performance: "Performance", accessibility: "Accessibilite", seo: "SEO", bestPractices: "Bonnes pratiques" };
      const severityLabels = { critical: "CRITIQUE", warning: "ATTENTION", info: "INFO" };
      const severityColors = { critical: "#ef4444", warning: "#f59e0b", info: "#6366f1" };

      let y = issuesY + 25;
      issues.forEach((issue, i) => {
        if (y > 720) {
          doc.addPage();
          y = 50;
        }
        const sevColor = severityColors[issue.severity] || "#888";
        doc.fontSize(8).fillColor(sevColor).text(`[${severityLabels[issue.severity] || issue.severity}]`, 50, y, { continued: true });
        doc.fillColor("#888").text(` ${categoryLabels[issue.category] || issue.category}`, { continued: false });
        y += 14;
        doc.fontSize(11).fillColor("#1a1a1a").text(issue.title || "", 50, y, { width: 495 });
        y += 16;
        if (issue.description) {
          doc.fontSize(9).fillColor("#666").text(issue.description, 50, y, { width: 495, lineGap: 2 });
          y += doc.heightOfString(issue.description, { width: 495, lineGap: 2 }) + 4;
        }
        if (issue.fix) {
          doc.fontSize(9).fillColor("#8b5cf6").text("Solution : ", 50, y, { continued: true });
          doc.fillColor("#555").text(issue.fix, { width: 440 });
          y += doc.heightOfString("Solution : " + issue.fix, { width: 495 }) + 4;
        }
        y += 10;
      });
    }

    // --- Footer ---
    doc.fontSize(8).fillColor("#aaa").text(
      `Rapport genere par Phantom — ${new Date().toLocaleDateString("fr-FR")}`,
      50, 750, { align: "center", width: 495 }
    );

    doc.end();
  } catch (err) {
    console.error("[Phantom] PDF error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
