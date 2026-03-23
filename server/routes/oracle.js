const express = require("express");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { businessType, revenue, employees, challenge } = req.body;
  if (!businessType || typeof businessType !== "string" || businessType.trim().length === 0) {
    return res.status(400).json({ error: "Le type d'entreprise est requis." });
  }
  if (!challenge || typeof challenge !== "string" || challenge.trim().length === 0) {
    return res.status(400).json({ error: "Le defi principal est requis." });
  }
  if (businessType.length > 200 || challenge.length > 2000) {
    return res.status(400).json({ error: "Un champ depasse la longueur maximale autorisee." });
  }

  const prompt = `Tu es un consultant stratégique senior avec 20 ans d'expérience. Analyse cette entreprise :
- Type : ${businessType}
- CA : ${revenue || "Non précisé"}
- Employés : ${employees || "Non précisé"}
- Défi principal : ${challenge}

Retourne un JSON valide (pas de markdown) :
{
  "diagnostic": "[2-3 phrases d'analyse du défi]",
  "opportunities": [
    { "title": "[opportunité]", "impact": "fort|moyen|faible", "effort": "faible|moyen|élevé", "description": "[1-2 phrases]" }
  ],
  "actions": [
    { "priority": 1, "action": "[action concrète]", "timeline": "[délai]", "expectedResult": "[résultat attendu]" }
  ],
  "kpis": [
    { "name": "[KPI à suivre]", "target": "[objectif chiffré]", "timeline": "[délai]" }
  ],
  "quote": "[Citation inspirante d'un entrepreneur célèbre, en rapport avec le défi]"
}

Génère 3 opportunités, 4 actions prioritaires et 3 KPIs. Sois concret et actionnable.`;

  try {
    const text = await generateWithAI(prompt);
    const analysis = JSON.parse(text);
    res.json({ analysis, provider: "ai" });
  } catch (err) {
    console.error("[Oracle] Erreur:", err.message);
    res.status(503).json({ error: "IA indisponible, reessayez.", fallback: true });
  }
});

module.exports = router;
