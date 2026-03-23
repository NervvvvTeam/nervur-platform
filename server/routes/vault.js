const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const BreachScan = require("../models/BreachScan");
const VaultMonitoring = require("../models/VaultMonitoring");
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
      userId: req.user.userId,
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
    const scans = await BreachScan.find({ userId: req.user.userId })
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
    const scan = await BreachScan.findOne({ _id: req.params.id, userId: req.user.userId });
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
    await BreachScan.deleteOne({ _id: req.params.id, userId: req.user.userId });
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
      userId: req.user.userId,
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
      userId: req.user.userId,
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
    const configs = await VaultMonitoring.find({ userId: req.user.userId })
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
    const config = await VaultMonitoring.findOne({ _id: req.params.id, userId: req.user.userId });
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
    const result = await VaultMonitoring.deleteOne({ _id: req.params.id, userId: req.user.userId });
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

    const scan = await BreachScan.findOne({ _id: req.params.id, userId: req.user.userId });
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

module.exports = router;
