const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const BreachScan = require("../models/BreachScan");
const VaultMonitoring = require("../models/VaultMonitoring");
const RgpdScan = require("../models/RgpdScan");
const { authMiddleware } = require("../middleware/auth");

// Data class translations for non-technical users
const DATA_CLASS_FR = {
  "Email addresses": { label: "Adresses email", icon: "email", risk: "medium", explanation: "Votre adresse email est connue des spammeurs et peut être utilisée pour du phishing." },
  "Passwords": { label: "Mots de passe", icon: "lock", risk: "critical", explanation: "Un mot de passe a été exposé. Si vous l'utilisez ailleurs, ces comptes sont aussi en danger." },
  "Usernames": { label: "Noms d'utilisateur", icon: "user", risk: "low", explanation: "Votre identifiant est public. Risque faible seul, mais facilite le ciblage." },
  "Phone numbers": { label: "Numéros de téléphone", icon: "phone", risk: "medium", explanation: "Peut être utilisé pour des arnaques par SMS ou appels frauduleux." },
  "IP addresses": { label: "Adresses IP", icon: "network", risk: "low", explanation: "Révèle votre localisation approximative. Risque faible pour la plupart des gens." },
  "Physical addresses": { label: "Adresses postales", icon: "home", risk: "medium", explanation: "Votre adresse physique est exposée. Risque d'usurpation d'identité." },
  "Dates of birth": { label: "Dates de naissance", icon: "calendar", risk: "medium", explanation: "Souvent utilisée comme question de sécurité. Changez vos questions de récupération." },
  "Credit status data": { label: "Données bancaires", icon: "card", risk: "critical", explanation: "Des informations financières sont exposées. Surveillez vos relevés bancaires." },
  "Payment histories": { label: "Historique de paiements", icon: "card", risk: "high", explanation: "Vos habitudes de paiement sont visibles. Risque d'ingénierie sociale." },
  "Names": { label: "Noms complets", icon: "user", risk: "low", explanation: "Votre nom est public. Risque faible seul." },
  "Genders": { label: "Genre", icon: "user", risk: "low", explanation: "Information personnelle exposée. Risque faible." },
  "Geographic locations": { label: "Localisation", icon: "map", risk: "low", explanation: "Votre zone géographique est connue." },
  "Social media profiles": { label: "Profils sociaux", icon: "social", risk: "medium", explanation: "Vos comptes sociaux peuvent être ciblés par des arnaques." },
  "Job titles": { label: "Postes professionnels", icon: "work", risk: "low", explanation: "Utilisé pour du phishing ciblé (spear phishing) en se faisant passer pour un collègue." },
  "Employers": { label: "Employeurs", icon: "work", risk: "low", explanation: "Information professionnelle exposée." },
  "Auth tokens": { label: "Jetons d'authentification", icon: "lock", risk: "critical", explanation: "Un jeton d'accès a fuité. Les sessions liées doivent être révoquées immédiatement." },
  "Security questions and answers": { label: "Questions de sécurité", icon: "lock", risk: "high", explanation: "Vos réponses secrètes sont connues. Changez-les sur tous vos comptes." },
};

// Helper: calculate risk level
function calculateRiskLevel(results) {
  let criticalCount = 0;
  let highCount = 0;
  const allDataClasses = new Set();

  for (const r of results) {
    if (!r.isCompromised) continue;
    for (const b of r.breaches) {
      for (const dc of b.dataClasses) {
        allDataClasses.add(dc);
        const info = DATA_CLASS_FR[dc];
        if (info?.risk === "critical") criticalCount++;
        if (info?.risk === "high") highCount++;
      }
    }
  }

  if (criticalCount > 0) return "critical";
  if (highCount > 0) return "high";
  if (allDataClasses.size > 3) return "medium";
  return "low";
}

// Helper: generate AI recommendations
async function generateRecommendations(domain, summary, results) {
  const compromised = results.filter(r => r.isCompromised);
  if (compromised.length === 0) return "Aucune fuite détectée. Continuez à surveiller régulièrement.";

  const dataTypes = summary.dataTypesExposed.join(", ");
  const breachNames = summary.topBreaches.join(", ");

  const prompt = `Tu es un expert en cybersécurité. Analyse ce rapport de fuites de données pour le domaine ${domain} et donne des recommandations claires et actionnables en français, adaptées à une PME non technique.

Résumé :
- ${summary.compromisedEmails} emails compromis sur ${summary.totalEmails}
- ${summary.totalBreaches} fuites détectées
- Niveau de risque : ${summary.riskLevel}
- Types de données exposées : ${dataTypes}
- Principales fuites : ${breachNames}

Donne exactement 5 recommandations numérotées, courtes (2-3 phrases max chacune), avec un titre en gras. Commence par les actions les plus urgentes. Utilise un langage simple, pas de jargon technique. Si des mots de passe sont exposés, insiste sur le changement immédiat.`;

  try {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.4,
    });
    return completion.choices[0]?.message?.content || "Recommandations non disponibles.";
  } catch (err) {
    console.error("Erreur IA Vault:", err.message);
    return generateFallbackRecommendations(summary);
  }
}

function generateFallbackRecommendations(summary) {
  const recs = [];
  if (summary.dataTypesExposed.includes("Passwords")) {
    recs.push("**Changez vos mots de passe immédiatement** — Tous les comptes utilisant les mêmes identifiants que ceux exposés doivent être mis à jour avec des mots de passe uniques et complexes.");
  }
  recs.push("**Activez l'authentification à deux facteurs (2FA)** — Ajoutez une couche de sécurité supplémentaire sur tous vos comptes professionnels (email, banque, outils métier).");
  if (summary.dataTypesExposed.includes("Phone numbers")) {
    recs.push("**Méfiez-vous des appels et SMS suspects** — Vos numéros sont exposés. Ne communiquez jamais d'informations sensibles par téléphone.");
  }
  recs.push("**Utilisez un gestionnaire de mots de passe** — Des outils comme Bitwarden (gratuit) ou 1Password génèrent et stockent des mots de passe uniques pour chaque compte.");
  recs.push("**Planifiez un scan régulier** — Relancez Vault chaque mois pour détecter de nouvelles fuites rapidement.");
  return recs.join("\n\n");
}

// GET /api/vault/data-classes — reference data for frontend
router.get("/data-classes", authMiddleware, (req, res) => {
  res.json(DATA_CLASS_FR);
});

// POST /api/vault/scan — launch a breach scan
router.post("/scan", authMiddleware, async (req, res) => {
  try {
    const { domain, emails } = req.body;

    if (!domain || typeof domain !== "string" || domain.length > 200) {
      return res.status(400).json({ error: "Domaine invalide." });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain.trim())) {
      return res.status(400).json({ error: "Format de domaine invalide. Exemple : monentreprise.fr" });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "Fournissez au moins une adresse email." });
    }

    if (emails.length > 50) {
      return res.status(400).json({ error: "Maximum 50 emails par scan." });
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(e => typeof e === "string" && emailRegex.test(e.trim())).map(e => e.trim().toLowerCase());

    if (validEmails.length === 0) {
      return res.status(400).json({ error: "Aucune adresse email valide fournie." });
    }

    // Create scan record
    const scan = new BreachScan({
      userId: req.userId,
      domain: domain.trim().toLowerCase(),
      emails: validEmails,
      status: "scanning",
    });
    await scan.save();

    // Scan emails against HIBP API (or demo mode)
    const results = [];
    const useDemo = !process.env.HIBP_API_KEY;

    for (const email of validEmails) {
      if (useDemo) {
        // Demo mode — simulate realistic breach data
        const demoResult = generateDemoBreachData(email);
        results.push(demoResult);
      } else {
        // Real HIBP API
        try {
          const hibpResult = await checkHIBP(email);
          results.push(hibpResult);
          // HIBP rate limit: 1 request per 1.5 seconds
          await new Promise(resolve => setTimeout(resolve, 1600));
        } catch (err) {
          results.push({ email, breaches: [], pasteCount: 0, isCompromised: false });
        }
      }
    }

    // Calculate summary
    const compromisedResults = results.filter(r => r.isCompromised);
    const allBreachNames = new Set();
    const allDataClasses = new Set();
    let totalBreaches = 0;

    for (const r of compromisedResults) {
      for (const b of r.breaches) {
        allBreachNames.add(b.title || b.name);
        totalBreaches++;
        for (const dc of b.dataClasses) {
          allDataClasses.add(dc);
        }
      }
    }

    const summary = {
      totalEmails: validEmails.length,
      compromisedEmails: compromisedResults.length,
      totalBreaches,
      riskLevel: calculateRiskLevel(results),
      topBreaches: Array.from(allBreachNames).slice(0, 10),
      dataTypesExposed: Array.from(allDataClasses),
    };

    // Generate AI recommendations
    const aiRecommendations = await generateRecommendations(domain, summary, results);

    // Update scan
    scan.results = results;
    scan.summary = summary;
    scan.aiRecommendations = aiRecommendations;
    scan.status = "completed";
    await scan.save();

    res.json(scan);
  } catch (err) {
    console.error("Erreur scan Vault:", err);
    res.status(500).json({ error: "Erreur lors du scan. Réessayez." });
  }
});

// GET /api/vault/history — list past scans
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const scans = await BreachScan.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-results");
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique." });
  }
});

// GET /api/vault/scan/:id — get full scan details
router.get("/scan/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    const scan = await BreachScan.findOne({ _id: req.params.id, userId: req.userId });
    if (!scan) return res.status(404).json({ error: "Scan introuvable." });
    res.json(scan);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du scan." });
  }
});

// DELETE /api/vault/scan/:id
router.delete("/scan/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    await BreachScan.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// Real HIBP API call
async function checkHIBP(email) {
  const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
    headers: {
      "hibp-api-key": process.env.HIBP_API_KEY,
      "user-agent": "NERVUR-Vault-Scanner",
    },
  });

  if (response.status === 404) {
    return { email, breaches: [], pasteCount: 0, isCompromised: false };
  }

  if (!response.ok) {
    throw new Error(`HIBP API error: ${response.status}`);
  }

  const breaches = await response.json();
  return {
    email,
    breaches: breaches.map(b => ({
      name: b.Name,
      title: b.Title,
      domain: b.Domain,
      breachDate: b.BreachDate,
      dataClasses: b.DataClasses,
      description: b.Description,
      pwnCount: b.PwnCount,
      isVerified: b.IsVerified,
      isSensitive: b.IsSensitive,
    })),
    pasteCount: 0,
    isCompromised: breaches.length > 0,
  };
}

// Demo breach data generator
function generateDemoBreachData(email) {
  const demoBreaches = [
    { name: "LinkedIn", title: "LinkedIn", domain: "linkedin.com", breachDate: "2021-06-22", dataClasses: ["Email addresses", "Passwords", "Names", "Phone numbers", "Job titles", "Employers"], pwnCount: 700000000, isVerified: true, isSensitive: false },
    { name: "Adobe", title: "Adobe", domain: "adobe.com", breachDate: "2013-10-04", dataClasses: ["Email addresses", "Passwords", "Usernames"], pwnCount: 153000000, isVerified: true, isSensitive: false },
    { name: "Dropbox", title: "Dropbox", domain: "dropbox.com", breachDate: "2012-07-01", dataClasses: ["Email addresses", "Passwords"], pwnCount: 68648009, isVerified: true, isSensitive: false },
    { name: "Canva", title: "Canva", domain: "canva.com", breachDate: "2019-05-24", dataClasses: ["Email addresses", "Names", "Usernames", "Geographic locations"], pwnCount: 137272116, isVerified: true, isSensitive: false },
    { name: "Facebook", title: "Facebook", domain: "facebook.com", breachDate: "2019-09-28", dataClasses: ["Email addresses", "Phone numbers", "Names", "Dates of birth", "Genders", "Geographic locations"], pwnCount: 509458528, isVerified: true, isSensitive: false },
    { name: "MyFitnessPal", title: "MyFitnessPal", domain: "myfitnesspal.com", breachDate: "2018-02-01", dataClasses: ["Email addresses", "Passwords", "Usernames", "IP addresses"], pwnCount: 143606147, isVerified: true, isSensitive: false },
  ];

  // Deterministic "random" based on email — same email always gets same results
  const hash = email.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const isCompromised = hash % 3 !== 0; // ~66% chance of being compromised (realistic)

  if (!isCompromised) {
    return { email, breaches: [], pasteCount: 0, isCompromised: false };
  }

  const numBreaches = (hash % 3) + 1;
  const startIdx = hash % demoBreaches.length;
  const selectedBreaches = [];
  for (let i = 0; i < numBreaches; i++) {
    selectedBreaches.push(demoBreaches[(startIdx + i) % demoBreaches.length]);
  }

  return {
    email,
    breaches: selectedBreaches,
    pasteCount: hash % 5,
    isCompromised: true,
  };
}

// ═══════════════════════════════════════════════════
// MONITORING — surveillance automatique de domaines
// ═══════════════════════════════════════════════════

// POST /api/vault/monitoring — activer/modifier la surveillance
router.post("/monitoring", authMiddleware, async (req, res) => {
  try {
    const { domain, emails, frequency, alertEmail, enabled } = req.body;

    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ error: "Domaine requis." });
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain.trim())) {
      return res.status(400).json({ error: "Format de domaine invalide. Exemple : monentreprise.fr" });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "Fournissez au moins une adresse email à surveiller." });
    }

    if (emails.length > 50) {
      return res.status(400).json({ error: "Maximum 50 emails par surveillance." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter(e => typeof e === "string" && emailRegex.test(e.trim())).map(e => e.trim().toLowerCase());
    if (validEmails.length === 0) {
      return res.status(400).json({ error: "Aucune adresse email valide fournie." });
    }

    if (frequency && !["weekly", "monthly"].includes(frequency)) {
      return res.status(400).json({ error: "Fréquence invalide. Choisissez 'weekly' ou 'monthly'." });
    }

    // Check for existing monitoring on same domain
    const existing = await VaultMonitoring.findOne({
      userId: req.userId,
      domain: domain.trim().toLowerCase(),
    });

    if (existing) {
      // Update existing config
      existing.emails = validEmails;
      existing.frequency = frequency || existing.frequency;
      existing.alertEmail = alertEmail || existing.alertEmail;
      existing.enabled = enabled !== undefined ? enabled : existing.enabled;
      await existing.save();
      return res.json(existing);
    }

    // Create new monitoring config
    const monitoring = new VaultMonitoring({
      userId: req.userId,
      domain: domain.trim().toLowerCase(),
      emails: validEmails,
      frequency: frequency || "weekly",
      enabled: enabled !== undefined ? enabled : true,
      alertEmail: alertEmail || "",
    });
    await monitoring.save();
    res.json(monitoring);
  } catch (err) {
    console.error("Erreur monitoring Vault:", err);
    res.status(500).json({ error: "Erreur lors de la configuration de la surveillance." });
  }
});

// GET /api/vault/monitoring — liste des surveillances actives
router.get("/monitoring", authMiddleware, async (req, res) => {
  try {
    const configs = await VaultMonitoring.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate("lastScanId", "summary status createdAt");
    res.json(configs);
  } catch (err) {
    console.error("Erreur listing monitoring:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des surveillances." });
  }
});

// PATCH /api/vault/monitoring/:id — toggle enabled/disabled
router.patch("/monitoring/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    const config = await VaultMonitoring.findOne({ _id: req.params.id, userId: req.userId });
    if (!config) return res.status(404).json({ error: "Surveillance introuvable." });

    if (req.body.enabled !== undefined) config.enabled = req.body.enabled;
    if (req.body.frequency) config.frequency = req.body.frequency;
    if (req.body.alertEmail !== undefined) config.alertEmail = req.body.alertEmail;
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
});

// DELETE /api/vault/monitoring/:id — supprimer une surveillance
router.delete("/monitoring/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    const result = await VaultMonitoring.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Surveillance introuvable." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// ═══════════════════════════════════════════════════
// PDF REPORT — rapport professionnel de scan
// ═══════════════════════════════════════════════════

const RISK_COLORS = {
  critical: [220, 38, 38],
  high: [234, 88, 12],
  medium: [202, 138, 4],
  low: [22, 163, 74],
};

const RISK_LABELS = {
  critical: "CRITIQUE",
  high: "ÉLEVÉ",
  medium: "MOYEN",
  low: "FAIBLE",
};

// GET /api/vault/scan/:id/pdf — générer un rapport PDF
router.get("/scan/:id/pdf", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalide." });
    }

    const scan = await BreachScan.findOne({ _id: req.params.id, userId: req.userId });
    if (!scan) return res.status(404).json({ error: "Scan introuvable." });
    if (scan.status !== "completed") return res.status(400).json({ error: "Le scan n'est pas terminé." });

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="rapport-vault-${scan.domain}-${Date.now()}.pdf"`);
    doc.pipe(res);

    const riskColor = RISK_COLORS[scan.summary?.riskLevel] || RISK_COLORS.low;
    const riskLabel = RISK_LABELS[scan.summary?.riskLevel] || "INCONNU";
    const scanDate = scan.createdAt
      ? new Date(scan.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Date inconnue";

    // ─── Header bar ───
    doc.rect(0, 0, 595.28, 80).fill("#0e7490");
    doc.fontSize(26).fill("#ffffff").text("NERVÜR VAULT", 50, 22, { continued: false });
    doc.fontSize(11).fill("rgba(255,255,255,0.85)").text("Rapport d'analyse de fuites de données", 50, 52);

    doc.moveDown(2);
    doc.y = 100;

    // ─── Domain + date ───
    doc.fontSize(18).fill("#1a1a2e").text(scan.domain, 50);
    doc.fontSize(10).fill("#6b7280").text(`Analyse du ${scanDate}`, 50);
    doc.moveDown(1.2);

    // ─── Risk level badge ───
    const badgeY = doc.y;
    doc.roundedRect(50, badgeY, 180, 36, 6).fill(`rgb(${riskColor.join(",")})`);
    doc.fontSize(13).fill("#ffffff").text(`Niveau de risque : ${riskLabel}`, 58, badgeY + 10, { width: 164, align: "center" });
    doc.moveDown(2.5);

    // ─── Summary stats ───
    const statsY = doc.y;
    doc.fontSize(12).fill("#1a1a2e").text("Résumé de l'analyse", 50, statsY);
    doc.moveDown(0.6);

    const summary = scan.summary || {};
    const stats = [
      ["Emails analysés", `${summary.totalEmails || 0}`],
      ["Emails compromis", `${summary.compromisedEmails || 0}`],
      ["Fuites détectées", `${summary.totalBreaches || 0}`],
      ["Niveau de risque", riskLabel],
    ];

    const tableTop = doc.y;
    const colW = 245;
    stats.forEach((row, i) => {
      const rowY = tableTop + i * 26;
      const bgColor = i % 2 === 0 ? "#f3f4f6" : "#ffffff";
      doc.rect(50, rowY, colW * 2, 24).fill(bgColor);
      doc.fontSize(10).fill("#374151").text(row[0], 58, rowY + 7, { width: colW - 16 });
      doc.fontSize(10).fill("#111827").text(row[1], 58 + colW, rowY + 7, { width: colW - 16, align: "right" });
    });
    doc.y = tableTop + stats.length * 26 + 16;

    // ─── Data types exposed ───
    if (summary.dataTypesExposed && summary.dataTypesExposed.length > 0) {
      doc.fontSize(12).fill("#1a1a2e").text("Types de données exposées", 50);
      doc.moveDown(0.4);
      const dataLabels = summary.dataTypesExposed.map(dc => {
        const info = DATA_CLASS_FR[dc];
        return info ? info.label : dc;
      });
      doc.fontSize(10).fill("#4b5563").text(dataLabels.join("  •  "), 50, doc.y, { width: 495 });
      doc.moveDown(1.2);
    }

    // ─── Compromised emails list ───
    const compromised = (scan.results || []).filter(r => r.isCompromised);
    if (compromised.length > 0) {
      doc.fontSize(12).fill("#1a1a2e").text("Emails compromis", 50);
      doc.moveDown(0.5);

      for (const result of compromised) {
        // Check for page overflow
        if (doc.y > 700) { doc.addPage(); doc.y = 50; }

        doc.fontSize(10).fill("#dc2626").text(`● ${result.email}`, 58);
        doc.moveDown(0.2);
        for (const breach of result.breaches) {
          if (doc.y > 720) { doc.addPage(); doc.y = 50; }
          const breachDate = breach.breachDate || "Date inconnue";
          doc.fontSize(9).fill("#6b7280").text(`  — ${breach.title || breach.name} (${breachDate})`, 70, doc.y, { width: 470 });
          const classes = (breach.dataClasses || []).map(dc => {
            const info = DATA_CLASS_FR[dc];
            return info ? info.label : dc;
          }).join(", ");
          if (classes) {
            doc.fontSize(8).fill("#9ca3af").text(`    Données : ${classes}`, 78, doc.y, { width: 460 });
          }
        }
        doc.moveDown(0.6);
      }
    }

    // ─── Safe emails ───
    const safe = (scan.results || []).filter(r => !r.isCompromised);
    if (safe.length > 0) {
      if (doc.y > 680) { doc.addPage(); doc.y = 50; }
      doc.moveDown(0.5);
      doc.fontSize(12).fill("#1a1a2e").text("Emails non compromis", 50);
      doc.moveDown(0.4);
      for (const result of safe) {
        if (doc.y > 720) { doc.addPage(); doc.y = 50; }
        doc.fontSize(10).fill("#16a34a").text(`✓ ${result.email}`, 58);
      }
      doc.moveDown(1);
    }

    // ─── AI Recommendations ───
    if (scan.aiRecommendations) {
      if (doc.y > 580) { doc.addPage(); doc.y = 50; }
      doc.fontSize(12).fill("#1a1a2e").text("Recommandations", 50);
      doc.moveDown(0.5);
      // Clean markdown bold markers for PDF
      const cleanRecs = scan.aiRecommendations.replace(/\*\*/g, "");
      doc.fontSize(9).fill("#374151").text(cleanRecs, 50, doc.y, { width: 495 });
      doc.moveDown(1);
    }

    // ─── Footer ───
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fill("#9ca3af").text(
        "Rapport généré par NERVÜR Vault — Confidentiel",
        50, 780, { width: 495, align: "center" }
      );
    }

    doc.end();
  } catch (err) {
    console.error("Erreur génération PDF Vault:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erreur lors de la génération du rapport PDF." });
    }
  }
});

// ═══════════════════════════════════════════════════
// RGPD COMPLIANCE SCANNING — Shield
// ═══════════════════════════════════════════════════

// Helper: analyze HTML for RGPD compliance
function analyzeRgpdCompliance(html, url) {
  const htmlLower = html.toLowerCase();
  const results = {};

  // 1. Mentions légales
  const mentionsPatterns = ["mentions légales", "mentions legales", "legal notice", "mentions-legales", "mentions_legales"];
  const mentionsFound = mentionsPatterns.some(p => htmlLower.includes(p));
  results.mentionsLegales = {
    found: mentionsFound,
    details: mentionsFound
      ? "Page de mentions légales détectée ou lien vers les mentions légales trouvé."
      : "Aucune mention légale détectée. Obligatoire pour tout site professionnel en France.",
  };

  // 2. Politique de confidentialité
  const privacyPatterns = ["politique de confidentialité", "politique de confidentialite", "privacy policy", "politique-de-confidentialite", "données personnelles", "donnees personnelles", "personal data policy"];
  const privacyFound = privacyPatterns.some(p => htmlLower.includes(p));
  results.politiqueConfidentialite = {
    found: privacyFound,
    details: privacyFound
      ? "Politique de confidentialité détectée sur le site."
      : "Aucune politique de confidentialité trouvée. Obligatoire selon le RGPD (Art. 13-14).",
  };

  // 3. Cookie banner / consent
  const cookiePatterns = ["cookie", "consent", "rgpd", "gdpr", "tarteaucitron", "axeptio", "cookiebot", "onetrust", "didomi", "quantcast", "cc-banner", "cookie-banner", "cookie-consent", "cookie-notice"];
  const cookieFound = cookiePatterns.some(p => htmlLower.includes(p));
  results.cookieBanner = {
    found: cookieFound,
    details: cookieFound
      ? "Bannière de cookies ou système de consentement détecté."
      : "Aucune bannière de cookies détectée. Obligatoire si le site utilise des cookies non essentiels.",
  };

  // 4. CGV / CGU
  const cgvPatterns = ["conditions générales", "conditions generales", "cgu", "cgv", "terms of service", "terms and conditions", "conditions-generales"];
  const cgvFound = cgvPatterns.some(p => htmlLower.includes(p));
  results.cgv = {
    found: cgvFound,
    details: cgvFound
      ? "Conditions générales (CGV/CGU) détectées sur le site."
      : "Aucune page de conditions générales trouvée. Recommandé pour les sites e-commerce et services.",
  };

  // 5. Contact information
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phonePattern = /(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g;
  const emailsFound = html.match(emailPattern) || [];
  const phonesFound = html.match(phonePattern) || [];
  const hasAddress = /\d{5}\s+[A-Za-zÀ-ÿ\s-]+|cedex|rue\s|avenue\s|boulevard\s/i.test(html);
  const contactFound = emailsFound.length > 0 || phonesFound.length > 0 || hasAddress;
  const contactDetails = [];
  if (emailsFound.length > 0) contactDetails.push(`${emailsFound.length} email(s) trouvé(s)`);
  if (phonesFound.length > 0) contactDetails.push(`${phonesFound.length} numéro(s) de téléphone trouvé(s)`);
  if (hasAddress) contactDetails.push("Adresse postale détectée");
  results.contactInfo = {
    found: contactFound,
    details: contactFound
      ? `Informations de contact détectées : ${contactDetails.join(", ")}.`
      : "Aucune information de contact trouvée. Obligatoire dans les mentions légales.",
  };

  // 6. SSL
  const isHttps = url.startsWith("https://") || url.startsWith("https:");
  results.ssl = {
    found: isHttps,
    details: isHttps
      ? "Le site utilise HTTPS (certificat SSL actif). Les données transitent de manière chiffrée."
      : "Le site n'utilise pas HTTPS. Le chiffrement SSL est fortement recommandé pour protéger les données des visiteurs.",
  };

  // 7. Third-party trackers
  const trackerPatterns = [
    { name: "Google Analytics", patterns: ["google-analytics.com", "googletagmanager.com", "gtag(", "ga('", "analytics.js", "gtm.js"] },
    { name: "Facebook Pixel", patterns: ["facebook.net/en_US/fbevents.js", "fbq(", "connect.facebook.net", "facebook-jssdk"] },
    { name: "Google Ads", patterns: ["googleads.g.doubleclick.net", "googlesyndication.com", "adservice.google"] },
    { name: "Hotjar", patterns: ["hotjar.com", "hj(", "hjSiteSettings"] },
    { name: "LinkedIn Insight", patterns: ["snap.licdn.com", "linkedin.com/insight"] },
    { name: "Twitter Pixel", patterns: ["static.ads-twitter.com", "twq("] },
    { name: "TikTok Pixel", patterns: ["analytics.tiktok.com", "ttq."] },
    { name: "Mixpanel", patterns: ["mixpanel.com", "mixpanel.init"] },
    { name: "Segment", patterns: ["cdn.segment.com", "analytics.js"] },
    { name: "HubSpot", patterns: ["js.hs-scripts.com", "hs-analytics.net", "hubspot.com"] },
    { name: "Matomo/Piwik", patterns: ["matomo", "piwik"] },
    { name: "Crisp", patterns: ["client.crisp.chat"] },
    { name: "Intercom", patterns: ["widget.intercom.io", "intercom.com"] },
  ];
  const trackersFound = [];
  for (const tracker of trackerPatterns) {
    if (tracker.patterns.some(p => htmlLower.includes(p.toLowerCase()))) {
      trackersFound.push(tracker.name);
    }
  }
  results.thirdPartyTrackers = {
    found: trackersFound.length > 0,
    trackers: trackersFound,
    details: trackersFound.length > 0
      ? `${trackersFound.length} tracker(s) tiers détecté(s) : ${trackersFound.join(", ")}. Le consentement utilisateur est requis avant leur activation.`
      : "Aucun tracker tiers majeur détecté.",
  };

  // 8. Form consent
  const hasForm = /<form[\s>]/i.test(html);
  const hasCheckbox = /<input[^>]*type\s*=\s*["']checkbox["'][^>]*>/i.test(html);
  const consentTerms = ["j'accepte", "jaccepte", "i agree", "i consent", "consentement", "accepter les conditions", "j'ai lu", "données personnelles"];
  const hasConsentText = consentTerms.some(t => htmlLower.includes(t));
  const formConsentFound = hasForm && hasCheckbox && hasConsentText;
  results.formConsent = {
    found: formConsentFound,
    details: hasForm
      ? (formConsentFound
        ? "Formulaires avec cases de consentement détectés. Bonne pratique RGPD."
        : "Formulaires détectés mais sans mécanisme de consentement explicite. Le consentement doit être recueilli via une case à cocher non pré-cochée.")
      : "Aucun formulaire détecté sur la page analysée.",
  };

  return results;
}

// Helper: calculate RGPD score
function calculateRgpdScore(results) {
  const weights = {
    mentionsLegales: 15,
    politiqueConfidentialite: 20,
    cookieBanner: 15,
    cgv: 10,
    contactInfo: 10,
    ssl: 15,
    thirdPartyTrackers: 5,  // Inverted: found = trackers present = lower score
    formConsent: 10,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (key === "thirdPartyTrackers") {
      // If trackers found but no cookie banner, penalize
      if (!results.thirdPartyTrackers.found) {
        score += weight; // No trackers = good
      } else if (results.cookieBanner.found) {
        score += weight; // Trackers but consent present = ok
      }
      // Trackers without consent = 0 points
    } else if (key === "formConsent") {
      // Only penalize if forms exist without consent
      const details = results.formConsent.details || "";
      if (results.formConsent.found) {
        score += weight;
      } else if (details.includes("Aucun formulaire")) {
        score += weight; // No forms = no penalty
      }
    } else {
      if (results[key]?.found) score += weight;
    }
  }

  return Math.min(100, Math.max(0, score));
}

// Helper: generate RGPD AI recommendations
async function generateRgpdRecommendations(url, score, results) {
  const issues = [];
  if (!results.mentionsLegales.found) issues.push("Mentions légales absentes");
  if (!results.politiqueConfidentialite.found) issues.push("Politique de confidentialité absente");
  if (!results.cookieBanner.found) issues.push("Bannière cookies absente");
  if (!results.cgv.found) issues.push("CGV/CGU absentes");
  if (!results.contactInfo.found) issues.push("Informations de contact absentes");
  if (!results.ssl.found) issues.push("Pas de HTTPS");
  if (results.thirdPartyTrackers.found && !results.cookieBanner.found) issues.push("Trackers sans consentement");
  if (!results.formConsent.found && !results.formConsent.details?.includes("Aucun formulaire")) issues.push("Formulaires sans consentement");

  if (issues.length === 0) {
    return "Votre site semble conforme aux principales exigences du RGPD. Continuez à surveiller régulièrement la conformité et assurez-vous que vos pratiques internes (registre des traitements, DPO, etc.) sont également à jour.";
  }

  const prompt = `Tu es un expert en conformité RGPD et droit numérique français. Analyse ce rapport de conformité RGPD pour le site ${url} et donne des recommandations claires et actionnables en français.

Score de conformité : ${score}/100
Problèmes détectés :
${issues.map(i => `- ${i}`).join("\n")}

${results.thirdPartyTrackers.found ? `Trackers détectés : ${results.thirdPartyTrackers.trackers.join(", ")}` : ""}

Donne exactement 5 recommandations numérotées, courtes (2-3 phrases max chacune), avec un titre en gras. Commence par les actions les plus urgentes. Utilise un langage simple et accessible. Mentionne les articles du RGPD pertinents quand c'est utile.`;

  try {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 900,
      temperature: 0.4,
    });
    return completion.choices[0]?.message?.content || "Recommandations non disponibles.";
  } catch (err) {
    console.error("Erreur IA RGPD:", err.message);
    // Fallback recommendations
    const recs = [];
    if (!results.mentionsLegales.found) recs.push("**Ajoutez des mentions légales** — Obligatoire en France (Loi pour la Confiance dans l'Économie Numérique). Incluez : identité de l'éditeur, hébergeur, directeur de publication.");
    if (!results.politiqueConfidentialite.found) recs.push("**Créez une politique de confidentialité** — Obligatoire selon les articles 13 et 14 du RGPD. Détaillez les données collectées, leur finalité, la durée de conservation et les droits des utilisateurs.");
    if (!results.cookieBanner.found) recs.push("**Installez une bannière de cookies** — La CNIL exige un consentement explicite avant le dépôt de cookies non essentiels. Utilisez une solution comme Tarteaucitron ou Axeptio.");
    if (!results.ssl.found) recs.push("**Passez votre site en HTTPS** — Le chiffrement SSL protège les données en transit et est un signal de confiance pour vos visiteurs.");
    if (!results.contactInfo.found) recs.push("**Ajoutez vos coordonnées de contact** — Email, téléphone et adresse doivent figurer dans les mentions légales pour permettre l'exercice des droits RGPD.");
    if (recs.length === 0) recs.push("**Maintenez votre conformité** — Planifiez des audits réguliers et tenez votre registre des traitements à jour.");
    return recs.join("\n\n");
  }
}

// POST /api/vault/rgpd-scan — scan a website for RGPD compliance
router.post("/rgpd-scan", authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string" || url.length > 500) {
      return res.status(400).json({ error: "URL invalide." });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return res.status(400).json({ error: "Format d'URL invalide. Exemple : https://monsite.fr" });
    }

    const domain = parsedUrl.hostname;

    // Create scan record
    const scan = new RgpdScan({
      userId: req.userId,
      url: normalizedUrl,
      domain,
      status: "scanning",
    });
    await scan.save();

    // Fetch the page
    let html;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(normalizedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NERVUR-RGPD-Scanner/1.0)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!response.ok) {
        scan.status = "error";
        await scan.save();
        return res.status(400).json({ error: `Impossible d'accéder au site (HTTP ${response.status}). Vérifiez l'URL.` });
      }

      html = await response.text();
    } catch (fetchErr) {
      scan.status = "error";
      await scan.save();
      return res.status(400).json({
        error: fetchErr.name === "AbortError"
          ? "Le site met trop de temps à répondre (timeout 15s)."
          : `Impossible d'accéder au site : ${fetchErr.message}`,
      });
    }

    // Analyze RGPD compliance
    const results = analyzeRgpdCompliance(html, normalizedUrl);
    const score = calculateRgpdScore(results);

    // Generate AI recommendations
    const aiRecommendations = await generateRgpdRecommendations(normalizedUrl, score, results);

    // Update scan
    scan.results = results;
    scan.score = score;
    scan.aiRecommendations = aiRecommendations;
    scan.status = "completed";
    await scan.save();

    res.json(scan);
  } catch (err) {
    console.error("Erreur scan RGPD:", err);
    res.status(500).json({ error: "Erreur lors de l'analyse RGPD. Réessayez." });
  }
});

// GET /api/vault/rgpd-history — list past RGPD scans
router.get("/rgpd-history", authMiddleware, async (req, res) => {
  try {
    const scans = await RgpdScan.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("url domain score status createdAt");
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique RGPD." });
  }
});

// GET /api/vault/rgpd-scan/:id — get full RGPD scan details
router.get("/rgpd-scan/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    const scan = await RgpdScan.findOne({ _id: req.params.id, userId: req.userId });
    if (!scan) return res.status(404).json({ error: "Scan RGPD introuvable." });
    res.json(scan);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du scan RGPD." });
  }
});

// DELETE /api/vault/rgpd-scan/:id
router.delete("/rgpd-scan/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalide." });
    }
    await RgpdScan.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// ═══════════════════════════════════════════════════
// PASSWORD CHECK — k-anonymity via HIBP Passwords API
// ═══════════════════════════════════════════════════

// POST /api/vault/password-check — check password strength + breach status
router.post("/password-check", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length === 0) {
      return res.status(400).json({ error: "Mot de passe requis." });
    }

    if (password.length > 256) {
      return res.status(400).json({ error: "Mot de passe trop long." });
    }

    // Calculate strength
    const strength = calculatePasswordStrength(password);

    // Check HIBP using k-anonymity model
    let breachCount = 0;
    let breached = false;
    try {
      const crypto = require("crypto");
      const sha1Hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { "User-Agent": "NERVUR-Vault-PasswordCheck" },
      });

      if (response.ok) {
        const text = await response.text();
        const lines = text.split("\n");
        for (const line of lines) {
          const [hashSuffix, count] = line.trim().split(":");
          if (hashSuffix === suffix) {
            breachCount = parseInt(count, 10) || 0;
            breached = true;
            break;
          }
        }
      }
    } catch (err) {
      console.error("Erreur HIBP password check:", err.message);
      // Continue without breach data — strength still useful
    }

    res.json({
      strength,
      breached,
      breachCount,
    });
  } catch (err) {
    console.error("Erreur password check:", err);
    res.status(500).json({ error: "Erreur lors de la vérification." });
  }
});

function calculatePasswordStrength(password) {
  let score = 0;
  const len = password.length;

  // Length scoring
  if (len >= 8) score += 1;
  if (len >= 12) score += 1;
  if (len >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Common patterns penalty
  const lower = password.toLowerCase();
  const commonPatterns = ["password", "123456", "qwerty", "azerty", "motdepasse", "admin", "letmein", "welcome", "monkey", "dragon", "master"];
  if (commonPatterns.some(p => lower.includes(p))) score = Math.max(0, score - 3);

  // Sequential/repeated chars penalty
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1);
  if (/(?:012|123|234|345|456|567|678|789|abc|bcd|cde|def)/.test(lower)) score = Math.max(0, score - 1);

  if (score <= 2) return { level: "weak", label: "Faible", score: Math.round((score / 7) * 100) };
  if (score <= 4) return { level: "medium", label: "Moyen", score: Math.round((score / 7) * 100) };
  return { level: "strong", label: "Fort", score: Math.round((score / 7) * 100) };
}

// ═══════════════════════════════════════════════════
// SECURITY SCORE — score global basé sur fuites + RGPD
// ═══════════════════════════════════════════════════

// GET /api/vault/security-score/:domain — overall security score
router.get("/security-score/:domain", authMiddleware, async (req, res) => {
  try {
    const domain = req.params.domain.trim().toLowerCase();

    if (!domain || domain.length > 200) {
      return res.status(400).json({ error: "Domaine invalide." });
    }

    // Find latest breach scan for this domain
    const latestBreachScan = await BreachScan.findOne({
      userId: req.userId,
      domain,
      status: "completed",
    }).sort({ createdAt: -1 });

    // Find latest RGPD scan for this domain
    const latestRgpdScan = await RgpdScan.findOne({
      userId: req.userId,
      domain,
      status: "completed",
    }).sort({ createdAt: -1 });

    // Calculate breach score (100 = no breaches, 0 = critical)
    let breachScore = 100;
    let breachDetails = { totalEmails: 0, compromised: 0, totalBreaches: 0, riskLevel: "low" };
    if (latestBreachScan && latestBreachScan.summary) {
      const s = latestBreachScan.summary;
      breachDetails = {
        totalEmails: s.totalEmails || 0,
        compromised: s.compromisedEmails || 0,
        totalBreaches: s.totalBreaches || 0,
        riskLevel: s.riskLevel || "low",
      };
      if (s.riskLevel === "critical") breachScore = 15;
      else if (s.riskLevel === "high") breachScore = 35;
      else if (s.riskLevel === "medium") breachScore = 60;
      else if (s.compromisedEmails > 0) breachScore = 75;
      else breachScore = 100;
    }

    // RGPD score
    let rgpdScore = null;
    let rgpdDetails = {};
    if (latestRgpdScan) {
      rgpdScore = latestRgpdScan.score || 0;
      rgpdDetails = latestRgpdScan.results || {};
    }

    // Email security score (based on breach data classes)
    let emailScore = 100;
    if (latestBreachScan && latestBreachScan.summary) {
      const dataTypes = latestBreachScan.summary.dataTypesExposed || [];
      if (dataTypes.includes("Passwords")) emailScore -= 40;
      if (dataTypes.includes("Auth tokens")) emailScore -= 30;
      if (dataTypes.includes("Security questions and answers")) emailScore -= 20;
      if (dataTypes.includes("Phone numbers")) emailScore -= 10;
      emailScore = Math.max(0, emailScore);
    }

    // Password exposure score
    let passwordScore = 100;
    if (latestBreachScan && latestBreachScan.summary) {
      const dataTypes = latestBreachScan.summary.dataTypesExposed || [];
      if (dataTypes.includes("Passwords")) passwordScore = 20;
      else if (dataTypes.includes("Password hints") || dataTypes.includes("PINs")) passwordScore = 50;
    }

    // Overall weighted score
    const weights = { breaches: 0.35, rgpd: 0.25, emails: 0.20, passwords: 0.20 };
    const effectiveRgpd = rgpdScore !== null ? rgpdScore : 50; // default 50 if no scan
    const overallScore = Math.round(
      breachScore * weights.breaches +
      effectiveRgpd * weights.rgpd +
      emailScore * weights.emails +
      passwordScore * weights.passwords
    );

    // Generate recommended actions
    const actions = [];
    if (breachScore < 50) {
      actions.push({ priority: "critical", label: "Changer tous les mots de passe compromis", description: "Des données sensibles ont été exposées dans des fuites. Changez immédiatement les mots de passe des comptes affectés.", category: "breaches" });
    }
    if (breachScore < 80 && breachScore >= 50) {
      actions.push({ priority: "high", label: "Vérifier les comptes exposés", description: "Certaines informations ont fuité. Vérifiez les comptes associés et activez la double authentification.", category: "breaches" });
    }
    if (rgpdScore !== null && rgpdScore < 60) {
      actions.push({ priority: "high", label: "Améliorer la conformité RGPD", description: "Votre site ne respecte pas plusieurs critères RGPD obligatoires. Consultez le détail de l'analyse RGPD.", category: "rgpd" });
    }
    if (emailScore < 60) {
      actions.push({ priority: "critical", label: "Sécuriser les comptes email", description: "Des identifiants email ont été exposés avec des données sensibles. Activez la 2FA et changez les mots de passe.", category: "emails" });
    }
    if (passwordScore < 50) {
      actions.push({ priority: "critical", label: "Renouveler les mots de passe exposés", description: "Des mots de passe ont été trouvés dans des fuites de données. Utilisez un gestionnaire de mots de passe.", category: "passwords" });
    }
    if (breachScore === 100 && emailScore === 100) {
      actions.push({ priority: "low", label: "Continuer la surveillance", description: "Aucune fuite détectée. Planifiez des scans réguliers pour rester protégé.", category: "general" });
    }
    if (rgpdScore !== null && rgpdScore >= 80) {
      actions.push({ priority: "low", label: "Maintenir la conformité RGPD", description: "Bonne conformité RGPD. Effectuez un audit régulier pour rester à jour.", category: "rgpd" });
    }

    res.json({
      domain,
      overallScore,
      scores: {
        breaches: breachScore,
        rgpd: effectiveRgpd,
        emails: emailScore,
        passwords: passwordScore,
      },
      breachDetails,
      rgpdAvailable: rgpdScore !== null,
      actions,
      lastBreachScan: latestBreachScan?.createdAt || null,
      lastRgpdScan: latestRgpdScan?.createdAt || null,
    });
  } catch (err) {
    console.error("Erreur security score:", err);
    res.status(500).json({ error: "Erreur lors du calcul du score de sécurité." });
  }
});

// ═══════════════════════════════════════════════════
// RGPD PDF REPORT
// ═══════════════════════════════════════════════════

// GET /api/vault/rgpd-scan/:id/pdf — generate RGPD PDF report
router.get("/rgpd-scan/:id/pdf", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalide." });
    }

    const scan = await RgpdScan.findOne({ _id: req.params.id, userId: req.userId });
    if (!scan) return res.status(404).json({ error: "Scan RGPD introuvable." });
    if (scan.status !== "completed") return res.status(400).json({ error: "Le scan n'est pas terminé." });

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="rapport-rgpd-${scan.domain}-${Date.now()}.pdf"`);
    doc.pipe(res);

    const scoreColor = scan.score >= 80 ? [22, 163, 74] : scan.score >= 60 ? [202, 138, 4] : scan.score >= 40 ? [234, 88, 12] : [220, 38, 38];
    const scoreLabel = scan.score >= 80 ? "EXCELLENT" : scan.score >= 60 ? "CORRECT" : scan.score >= 40 ? "INSUFFISANT" : "CRITIQUE";
    const scanDate = scan.createdAt
      ? new Date(scan.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Date inconnue";

    // ─── Header bar ───
    doc.rect(0, 0, 595.28, 80).fill("#0e7490");
    doc.fontSize(26).fill("#ffffff").text("NERVUR VAULT", 50, 22);
    doc.fontSize(11).fill("rgba(255,255,255,0.85)").text("Rapport de conformite RGPD", 50, 52);

    doc.y = 100;

    // ─── Domain + date ───
    doc.fontSize(18).fill("#1a1a2e").text(scan.domain, 50);
    doc.fontSize(10).fill("#6b7280").text(`Analyse du ${scanDate}`, 50);
    doc.moveDown(1.2);

    // ─── Score badge ───
    const badgeY = doc.y;
    doc.roundedRect(50, badgeY, 200, 36, 6).fill(`rgb(${scoreColor.join(",")})`);
    doc.fontSize(13).fill("#ffffff").text(`Score RGPD : ${scan.score}/100 — ${scoreLabel}`, 58, badgeY + 10, { width: 184, align: "center" });
    doc.moveDown(2.5);

    // ─── Compliance items ───
    doc.fontSize(14).fill("#1a1a2e").text("Detail de la conformite", 50);
    doc.moveDown(0.6);

    const complianceLabels = {
      mentionsLegales: "Mentions legales",
      politiqueConfidentialite: "Politique de confidentialite",
      cookieBanner: "Banniere cookies",
      cgv: "CGV / CGU",
      contactInfo: "Informations de contact",
      ssl: "Certificat SSL (HTTPS)",
      thirdPartyTrackers: "Trackers tiers",
      formConsent: "Consentement formulaires",
    };

    const results = scan.results || {};
    for (const [key, label] of Object.entries(complianceLabels)) {
      if (doc.y > 700) { doc.addPage(); doc.y = 50; }
      const r = results[key];
      if (!r) continue;
      const isPass = key === "thirdPartyTrackers" ? !r.found : r.found;
      const statusText = isPass ? "CONFORME" : "NON CONFORME";
      const statusColor = isPass ? [22, 163, 74] : [220, 38, 38];

      doc.fontSize(11).fill("#1a1a2e").text(`${label}`, 50, doc.y, { continued: true });
      doc.fill(`rgb(${statusColor.join(",")})`).text(`  — ${statusText}`, { continued: false });
      doc.fontSize(9).fill("#6b7280").text(r.details || "", 60, doc.y, { width: 480 });
      doc.moveDown(0.6);
    }

    // ─── AI Recommendations ───
    if (scan.aiRecommendations) {
      if (doc.y > 580) { doc.addPage(); doc.y = 50; }
      doc.moveDown(0.5);
      doc.fontSize(14).fill("#1a1a2e").text("Recommandations", 50);
      doc.moveDown(0.5);
      const cleanRecs = scan.aiRecommendations.replace(/\*\*/g, "");
      doc.fontSize(9).fill("#374151").text(cleanRecs, 50, doc.y, { width: 495 });
    }

    // ─── Footer ───
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fill("#9ca3af").text(
        "Rapport genere par NERVUR Vault — Confidentiel",
        50, 780, { width: 495, align: "center" }
      );
    }

    doc.end();
  } catch (err) {
    console.error("Erreur generation PDF RGPD:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erreur lors de la generation du rapport PDF." });
    }
  }
});

module.exports = router;
