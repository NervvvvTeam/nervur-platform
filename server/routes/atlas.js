const express = require("express");
const { generateWithAI } = require("../services/ai");
const { authMiddleware } = require("../middleware/auth");
const SeoProject = require("../models/SeoProject");
const router = express.Router();

// ═══════════════════════════════════════════
// MARKETING SITE — PageSpeed Analyzer (existing)
// ═══════════════════════════════════════════

const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

async function fetchPageSpeed(url, strategy = "mobile", retries = 3) {
  const apiKey = process.env.GOOGLE_API_KEY || "";
  const keyParam = apiKey ? `&key=${apiKey}` : "";
  const fullUrl = `${PSI_API}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=seo&category=best-practices${keyParam}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(fullUrl, { signal: AbortSignal.timeout(45000) });
    if (response.status === 429) {
      console.log(`[Atlas] Rate limited (429), retry ${attempt + 1}/${retries} in ${(attempt + 1) * 5}s...`);
      await new Promise(r => setTimeout(r, (attempt + 1) * 5000));
      continue;
    }
    if (!response.ok) throw new Error(`PageSpeed API: ${response.status}`);
    return response.json();
  }
  throw new Error("Google PageSpeed temporairement indisponible (rate limit). Reessayez dans 30 secondes.");
}

function extractScores(psiData) {
  const cats = psiData.lighthouseResult?.categories || {};
  return {
    performance: Math.round((cats.performance?.score || 0) * 100),
    seo: Math.round((cats.seo?.score || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
  };
}

function extractAudits(psiData) {
  const audits = psiData.lighthouseResult?.audits || {};
  const issues = [];
  const details = [];

  const cwv = {
    lcp: audits["largest-contentful-paint"],
    fid: audits["max-potential-fid"],
    cls: audits["cumulative-layout-shift"],
    fcp: audits["first-contentful-paint"],
    si: audits["speed-index"],
    tbt: audits["total-blocking-time"],
    tti: audits["interactive"],
  };

  for (const [key, audit] of Object.entries(cwv)) {
    if (audit && audit.score !== null && audit.score < 0.9) {
      details.push(`${audit.title}: ${audit.displayValue || "N/A"}`);
    }
  }

  for (const [key, audit] of Object.entries(audits)) {
    if (audit && audit.score !== null && audit.score === 0 && audit.title) {
      issues.push(audit.title);
    }
  }

  const warnings = [];
  for (const [key, audit] of Object.entries(audits)) {
    if (audit && audit.score !== null && audit.score > 0 && audit.score < 0.5 && audit.title) {
      warnings.push(audit.title);
    }
  }

  return { issues: issues.slice(0, 10), warnings: warnings.slice(0, 10), coreWebVitals: details };
}

router.post("/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'url' est requis." });
  }
  if (url.length > 2000) {
    return res.status(400).json({ error: "L'URL est trop longue (max 2000 caracteres)." });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

  try {
    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "URL invalide. Utilisez http ou https." });
    }
  } catch {
    return res.status(400).json({ error: "URL invalide. Exemple : https://exemple.fr" });
  }

  try {
    const psiData = await fetchPageSpeed(targetUrl, "mobile");
    const scores = extractScores(psiData);
    const { issues, warnings, coreWebVitals } = extractAudits(psiData);

    const globalScore = Math.round(
      (scores.performance * 0.3 + scores.seo * 0.3 + scores.accessibility * 0.2 + scores.bestPractices * 0.2)
    );

    const prompt = `Tu es un expert SEO. Voici les VRAIS resultats d'audit Lighthouse pour "${targetUrl}" :

SCORES REELS :
- Performance : ${scores.performance}/100
- SEO : ${scores.seo}/100
- Accessibilite : ${scores.accessibility}/100
- Bonnes pratiques : ${scores.bestPractices}/100
- Score global : ${globalScore}/100

PROBLEMES DETECTES : ${issues.length > 0 ? issues.join(", ") : "Aucun critique"}
ALERTES : ${warnings.length > 0 ? warnings.join(", ") : "Aucune"}
CORE WEB VITALS : ${coreWebVitals.length > 0 ? coreWebVitals.join(", ") : "OK"}

Basé sur ces VRAIS résultats, retourne un JSON :
{
  "recommendations": [5 recommandations prioritaires basees sur les vrais problemes, strings],
  "keywords": [5 mots-cles suggeres pour ce type de site basé sur l'URL, strings],
  "summary": "Resume de l'audit en 2 phrases"
}

Retourne UNIQUEMENT le JSON.`;

    let recommendations = [];
    let keywords = [];
    let summary = "";

    try {
      const aiText = await generateWithAI(prompt);
      const aiData = JSON.parse(aiText);
      recommendations = aiData.recommendations || [];
      keywords = aiData.keywords || [];
      summary = aiData.summary || "";
    } catch (aiErr) {
      console.error("[Atlas] AI analysis failed, using scores only:", aiErr.message);
      recommendations = issues.slice(0, 5).map(i => `Corriger : ${i}`);
      if (recommendations.length === 0) recommendations = ["Le site a de bons scores, continuer l'optimisation"];
      keywords = [];
      summary = `Score global : ${globalScore}/100. ${globalScore >= 70 ? "Le site est bien optimise." : "Des ameliorations sont necessaires."}`;
    }

    res.json({
      scores: {
        performance: scores.performance,
        seo: scores.seo,
        content: scores.accessibility,
        technical: scores.bestPractices,
        mobile: scores.performance,
      },
      globalScore,
      issues: issues.slice(0, 5).length > 0 ? issues.slice(0, 5) : ["Aucun probleme critique detecte"],
      recommendations,
      keywords,
      summary,
      coreWebVitals,
      provider: "pagespeed+ai",
      realData: true,
    });

  } catch (err) {
    console.error("[Atlas] PageSpeed Error:", err.message);
    res.status(503).json({
      error: "Impossible d'analyser ce site. Verifiez l'URL et reessayez.",
      fallback: true,
    });
  }
});

// ═══════════════════════════════════════════
// DASHBOARD — SEO Tracking Projects
// ═══════════════════════════════════════════

// Demo mode ranking simulator
function checkKeywordRanking(domain, keyword) {
  const hash = (domain + keyword).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    keyword,
    position: (hash % 50) + 1,
    previousPosition: (hash % 50) + 3,
    url: `https://${domain}/${keyword.replace(/\s/g, "-")}`,
    change: 2,
  };
}

// POST /api/atlas/projects — Create a tracking project
router.post("/projects", authMiddleware, async (req, res) => {
  try {
    const { domain, keywords } = req.body;
    if (!domain || typeof domain !== "string" || domain.trim().length === 0) {
      return res.status(400).json({ error: "Le domaine est requis." });
    }
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: "Au moins un mot-clé est requis." });
    }
    if (keywords.length > 50) {
      return res.status(400).json({ error: "Maximum 50 mots-clés par projet." });
    }

    const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const cleanKeywords = keywords
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .slice(0, 50);

    // Check existing projects count for this user
    const count = await SeoProject.countDocuments({ userId: req.user._id });
    if (count >= 10) {
      return res.status(400).json({ error: "Maximum 10 projets SEO autorisés." });
    }

    const project = await SeoProject.create({
      userId: req.user._id,
      domain: cleanDomain,
      keywords: cleanKeywords,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("[Atlas] Create project error:", err.message);
    res.status(500).json({ error: "Erreur lors de la création du projet." });
  }
});

// GET /api/atlas/projects — List user's projects
router.get("/projects", authMiddleware, async (req, res) => {
  try {
    const projects = await SeoProject.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    const enriched = projects.map(p => {
      const avgPos = p.rankings && p.rankings.length > 0
        ? Math.round(p.rankings.reduce((s, r) => s + r.position, 0) / p.rankings.length)
        : null;
      const totalChange = p.rankings && p.rankings.length > 0
        ? p.rankings.reduce((s, r) => s + (r.change || 0), 0)
        : 0;
      return { ...p, averagePosition: avgPos, totalChange };
    });

    res.json(enriched);
  } catch (err) {
    console.error("[Atlas] List projects error:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des projets." });
  }
});

// GET /api/atlas/projects/:id — Get project details with rankings
router.get("/projects/:id", authMiddleware, async (req, res) => {
  try {
    const project = await SeoProject.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé." });
    }

    const avgPos = project.rankings && project.rankings.length > 0
      ? Math.round(project.rankings.reduce((s, r) => s + r.position, 0) / project.rankings.length)
      : null;
    const totalChange = project.rankings && project.rankings.length > 0
      ? project.rankings.reduce((s, r) => s + (r.change || 0), 0)
      : 0;

    res.json({ ...project, averagePosition: avgPos, totalChange });
  } catch (err) {
    console.error("[Atlas] Get project error:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération du projet." });
  }
});

// POST /api/atlas/projects/:id/check — Trigger keyword ranking check
router.post("/projects/:id/check", authMiddleware, async (req, res) => {
  try {
    const project = await SeoProject.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé." });
    }

    // Check rankings for each keyword
    const rankings = project.keywords.map(keyword => {
      const result = checkKeywordRanking(project.domain, keyword);
      // If previous ranking exists, calculate change
      const prev = project.rankings.find(r => r.keyword === keyword);
      if (prev) {
        result.previousPosition = prev.position;
        result.change = prev.position - result.position; // positive = improved
      }
      result.checkedAt = new Date();
      return result;
    });

    // Calculate average position
    const avgPos = Math.round(rankings.reduce((s, r) => s + r.position, 0) / rankings.length);

    // Update project
    project.rankings = rankings;
    project.lastCheckAt = new Date();
    project.history.push({
      date: new Date(),
      averagePosition: avgPos,
      keywordCount: rankings.length,
    });

    // Keep only last 90 history entries
    if (project.history.length > 90) {
      project.history = project.history.slice(-90);
    }

    await project.save();

    const totalChange = rankings.reduce((s, r) => s + (r.change || 0), 0);

    res.json({
      ...project.toObject(),
      averagePosition: avgPos,
      totalChange,
    });
  } catch (err) {
    console.error("[Atlas] Check rankings error:", err.message);
    res.status(500).json({ error: "Erreur lors de la vérification des positions." });
  }
});

// DELETE /api/atlas/projects/:id — Delete project
router.delete("/projects/:id", authMiddleware, async (req, res) => {
  try {
    const project = await SeoProject.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé." });
    }

    res.json({ success: true, message: "Projet supprimé." });
  } catch (err) {
    console.error("[Atlas] Delete project error:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression du projet." });
  }
});

module.exports = router;
