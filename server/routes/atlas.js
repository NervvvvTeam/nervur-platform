const express = require("express");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

// Google PageSpeed Insights API (FREE — no key needed)
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

  // Core Web Vitals
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

  // Failed audits = real issues
  for (const [key, audit] of Object.entries(audits)) {
    if (audit && audit.score !== null && audit.score === 0 && audit.title) {
      issues.push(audit.title);
    }
  }

  // Warnings
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

  // Normalize URL
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

    // Fetch REAL PageSpeed data (mobile)
    const psiData = await fetchPageSpeed(targetUrl, "mobile");
    const scores = extractScores(psiData);
    const { issues, warnings, coreWebVitals } = extractAudits(psiData);

    const globalScore = Math.round(
      (scores.performance * 0.3 + scores.seo * 0.3 + scores.accessibility * 0.2 + scores.bestPractices * 0.2)
    );

    // Now ask AI to analyze the REAL data and give recommendations
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
        mobile: scores.performance, // Mobile score = performance on mobile strategy
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
    // If PageSpeed fails (invalid URL, timeout), return error
    res.status(503).json({
      error: "Impossible d'analyser ce site. Verifiez l'URL et reessayez.",
      fallback: true,
    });
  }
});

module.exports = router;
