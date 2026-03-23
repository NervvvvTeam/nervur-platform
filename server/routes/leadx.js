const express = require("express");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { sector, budget, objective, timeline, score } = req.body;
  if (!sector || typeof sector !== "string" || sector.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'sector' est requis." });
  }
  if (!objective || typeof objective !== "string" || objective.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'objective' est requis." });
  }
  if (sector.length > 200 || objective.length > 1000) {
    return res.status(400).json({ error: "Un champ depasse la longueur maximale autorisee." });
  }

  const qualified = score >= 50;
  const prompt = `Tu es un expert en qualification de prospects B2B. Un prospect vient de remplir un formulaire :
- Secteur : ${sector}
- Budget digital annuel : ${budget || "Non précisé"}
- Objectif : ${objective}
- Timeline : ${timeline || "Non précisé"}
- Score de qualification : ${score}/100

Le prospect est ${qualified ? "QUALIFIÉ" : "NON QUALIFIÉ"}.

Génère un JSON valide (pas de markdown) :
{
  "recommendation": "[1-2 phrases : action recommandée pour ce prospect]",
  "followUpEmail": "[Email court et personnalisé de suivi, 3-4 phrases max, professionnel et engageant]",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  try {
    const text = await generateWithAI(prompt);
    const result = JSON.parse(text);
    res.json({ ...result, qualified, score, provider: "ai" });
  } catch (err) {
    console.error("[LeadX] Erreur:", err.message);
    res.status(503).json({ error: "IA indisponible, reessayez.", fallback: true });
  }
});

module.exports = router;
