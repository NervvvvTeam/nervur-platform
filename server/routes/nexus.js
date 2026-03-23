const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { generateWithAI } = require("../services/ai");
const GeneratedContent = require("../models/GeneratedContent");
const router = express.Router();

// Optional auth — saves history if authenticated
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  }
  next();
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Non autorisé" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}

// ═══════════════════════════════════
// CONTENT GENERATION
// ═══════════════════════════════════

router.post("/generate", optionalAuth, async (req, res) => {
  const { type, companyName, topic, tone, platform } = req.body;
  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'topic' est requis." });
  }
  if (topic.length > 2000) {
    return res.status(400).json({ error: "Le sujet ne doit pas depasser 2000 caracteres." });
  }

  const typeLabel = type || "Post LinkedIn";
  const prompt = `Tu es un expert en marketing digital et copywriting francais. Genere du contenu pour :
- Entreprise : ${companyName || "Entreprise"}
- Type : ${typeLabel}
- Sujet : ${topic}
- Ton : ${tone || "Professionnel"}
${platform ? `- Plateforme : ${platform}` : ""}

Regles :
- Contenu en francais, engageant et pret a publier
- Si Post LinkedIn : 150-250 mots, avec des emojis pertinents, des retours a la ligne, un hook accrocheur, un CTA
- Si Email Marketing : objet accrocheur + corps de l'email (150-200 mots), persuasif
- Si Description Produit : 100-150 mots, oriente benefices
- Si Post Instagram : texte court (80-120 mots) + 10 hashtags pertinents
- Si Post Facebook : 100-180 mots, convivial, engageant
- Si Tweet/X : max 280 caracteres, percutant

Retourne UNIQUEMENT le contenu, sans explication ni commentaire.`;

  try {
    const text = await generateWithAI(prompt);

    // Save to history if authenticated
    if (req.user) {
      try {
        await GeneratedContent.create({
          userId: req.user.id || req.user._id,
          type: typeLabel, topic, tone: tone || "Professionnel",
          companyName: companyName || "", content: text,
        });
      } catch {}
    }

    res.json({ content: text, type: typeLabel, provider: "ai" });
  } catch (err) {
    console.error("[Nexus] Generate error:", err.message);
    res.status(503).json({ error: "IA indisponible, réessayez.", fallback: true });
  }
});

// GET /history — Content generation history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const uid = req.user.id || req.user._id;
    const { type, limit = 30 } = req.query;
    const query = { userId: uid };
    if (type) query.type = type;
    const contents = await GeneratedContent.find(query).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ contents });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /history/:id/favorite — Toggle favorite
router.post("/history/:id/favorite", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const uid = req.user.id || req.user._id;
    const content = await GeneratedContent.findOne({ _id: req.params.id, userId: uid });
    if (!content) return res.status(404).json({ error: "Contenu non trouvé" });
    content.favorite = !content.favorite;
    await content.save();
    res.json({ favorite: content.favorite });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /history/:id — Delete content
router.delete("/history/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const uid = req.user.id || req.user._id;
    await GeneratedContent.deleteOne({ _id: req.params.id, userId: uid });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ═══════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════

router.get("/templates", (req, res) => {
  res.json({
    templates: [
      {
        id: "launch-product",
        name: "Lancement de produit",
        type: "Post LinkedIn",
        tone: "Inspirant",
        topic: "Annonce du lancement de [PRODUIT] — notre nouvelle solution pour [PROBLÈME]. Après [X] mois de développement, nous sommes fiers de présenter...",
        category: "Marketing",
      },
      {
        id: "promo-email",
        name: "Email promotionnel",
        type: "Email Marketing",
        tone: "Persuasif",
        topic: "Offre spéciale -[X]% sur [SERVICE] pendant [DURÉE]. Profitez de cette offre exclusive réservée à nos clients fidèles.",
        category: "Email",
      },
      {
        id: "testimonial",
        name: "Témoignage client",
        type: "Post LinkedIn",
        tone: "Professionnel",
        topic: "Retour d'expérience de [CLIENT] qui a utilisé [SERVICE] et a obtenu [RÉSULTAT]. Un cas concret de transformation digitale.",
        category: "Social",
      },
      {
        id: "tips-post",
        name: "Conseils experts",
        type: "Post Instagram",
        tone: "Decontracte",
        topic: "5 conseils pour [OBJECTIF] dans le secteur de [SECTEUR]. Des astuces concrètes et applicables immédiatement.",
        category: "Social",
      },
      {
        id: "newsletter",
        name: "Newsletter mensuelle",
        type: "Email Marketing",
        tone: "Professionnel",
        topic: "Les actualités du mois : [NOUVEAUTÉ 1], [NOUVEAUTÉ 2]. Nos conseils pour [SUJET]. Événement à venir : [ÉVÉNEMENT].",
        category: "Email",
      },
      {
        id: "product-desc",
        name: "Fiche produit e-commerce",
        type: "Description Produit",
        tone: "Persuasif",
        topic: "[NOM DU PRODUIT] — [CATÉGORIE]. Caractéristiques : [SPECS]. Idéal pour [USAGE]. Matériaux : [MATÉRIAUX].",
        category: "E-commerce",
      },
      {
        id: "event-invite",
        name: "Invitation événement",
        type: "Email Marketing",
        tone: "Inspirant",
        topic: "Vous êtes invité à [ÉVÉNEMENT] le [DATE] à [LIEU]. Au programme : [ACTIVITÉS]. Places limitées.",
        category: "Email",
      },
      {
        id: "reels-script",
        name: "Script Reels/Story",
        type: "Post Instagram",
        tone: "Decontracte",
        topic: "Script vidéo courte sur [SUJET]. Hook d'ouverture accrocheur, 3 points clés, CTA final.",
        category: "Social",
      },
    ],
  });
});

// ═══════════════════════════════════
// EMAIL SEQUENCES
// ═══════════════════════════════════

router.post("/sequence", async (req, res) => {
  const { companyName, objective, audience, emailCount, tone } = req.body;
  if (!objective || typeof objective !== "string" || objective.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'objective' est requis." });
  }
  if (objective.length > 1000) {
    return res.status(400).json({ error: "L'objectif ne doit pas depasser 1000 caracteres." });
  }

  const count = Math.min(emailCount || 5, 7);
  const prompt = `Tu es un expert en email marketing et automation francais. Cree une sequence de ${count} emails pour :
- Entreprise : ${companyName || "Entreprise"}
- Objectif : ${objective}
- Audience cible : ${audience || "Prospects qualifiés"}
- Ton : ${tone || "Professionnel"}

Pour chaque email, genere :
- Un objet accrocheur
- Le corps du mail (100-150 mots)
- Un CTA clair
- Le delai d'envoi (J+0, J+2, J+5, etc.)

Retourne un JSON :
{
  "sequence": [
    {
      "day": "J+0",
      "subject": "[objet]",
      "body": "[corps du mail]",
      "cta": "[texte du bouton CTA]"
    }
  ],
  "summary": "[resume de la strategie en 1 phrase]"
}

TOUT EN FRANCAIS. Retourne UNIQUEMENT le JSON valide, rien d'autre.`;

  try {
    const text = await generateWithAI(prompt);
    const data = JSON.parse(text);
    res.json({ ...data, provider: "ai" });
  } catch (err) {
    console.error("[Nexus] Sequence error:", err.message);
    res.status(503).json({ error: "IA indisponible, réessayez.", fallback: true });
  }
});

// ═══════════════════════════════════
// SOCIAL CALENDAR
// ═══════════════════════════════════

router.post("/calendar", async (req, res) => {
  const { companyName, sector, platforms, weekCount, tone } = req.body;
  if (!sector || typeof sector !== "string" || sector.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'sector' est requis." });
  }
  if (sector.length > 200) {
    return res.status(400).json({ error: "Le secteur ne doit pas depasser 200 caracteres." });
  }

  const weeks = Math.min(weekCount || 2, 4);
  const platList = (platforms || ["LinkedIn", "Instagram"]).join(", ");
  const prompt = `Tu es un community manager expert francais. Cree un calendrier editorial de ${weeks} semaines pour :
- Entreprise : ${companyName || "Entreprise"}
- Secteur : ${sector}
- Plateformes : ${platList}
- Ton : ${tone || "Professionnel"}

Genere 3-4 posts par semaine par plateforme. Retourne un JSON :
{
  "weeks": [
    {
      "week": 1,
      "posts": [
        {
          "day": "Lundi",
          "platform": "LinkedIn|Instagram|Facebook|Twitter",
          "type": "Post|Story|Carousel|Video",
          "topic": "[sujet]",
          "content": "[texte du post pret a publier, 50-100 mots]",
          "hashtags": "[hashtags si Instagram]"
        }
      ]
    }
  ],
  "strategy": "[resume de la strategie editoriale en 2 phrases]"
}

TOUT EN FRANCAIS. Retourne UNIQUEMENT le JSON valide.`;

  try {
    const text = await generateWithAI(prompt);
    const data = JSON.parse(text);
    res.json({ ...data, provider: "ai" });
  } catch (err) {
    console.error("[Nexus] Calendar error:", err.message);
    res.status(503).json({ error: "IA indisponible, réessayez.", fallback: true });
  }
});

module.exports = router;
