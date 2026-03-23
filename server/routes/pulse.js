const express = require("express");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { clients } = req.body;
  if (!clients || !Array.isArray(clients) || clients.length === 0) {
    return res.status(400).json({ error: "Un tableau 'clients' est requis." });
  }
  if (clients.length > 50) {
    return res.status(400).json({ error: "Maximum 50 clients par analyse." });
  }

  const clientSummary = clients.map(c =>
    `${c.name}: risque ${c.risk}%, usage ${c.usage}%, satisfaction ${c.satisfaction}/10`
  ).join("\n");

  const prompt = `Tu es un expert en rétention client et prédiction de churn. Voici les données clients :

${clientSummary}

Analyse chaque client et génère un JSON valide (pas de markdown) :
{
  "analyses": [
    {
      "name": "[nom du client]",
      "riskLevel": "critical|attention|sain",
      "factors": ["facteur de risque 1", "facteur de risque 2"],
      "action": "[action recommandée concrète en 1 phrase]",
      "prediction": "[prédiction de churn en 1 phrase]"
    }
  ],
  "globalInsight": "[1-2 phrases sur la tendance globale du portefeuille]"
}`;

  try {
    const text = await generateWithAI(prompt);
    const result = JSON.parse(text);
    res.json({ ...result, provider: "ai" });
  } catch (err) {
    console.error("[Pulse] Erreur:", err.message);
    res.status(503).json({ error: "IA indisponible, reessayez.", fallback: true });
  }
});

module.exports = router;
