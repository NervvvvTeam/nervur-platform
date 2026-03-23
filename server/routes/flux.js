const express = require("express");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

router.post("/generate", async (req, res) => {
  const { companyName, sector, platforms, tone } = req.body;
  if (!sector || typeof sector !== "string" || sector.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'sector' est requis." });
  }
  if (sector.length > 200) {
    return res.status(400).json({ error: "Le secteur ne doit pas depasser 200 caracteres." });
  }
  if (platforms && (!Array.isArray(platforms) || platforms.length > 10)) {
    return res.status(400).json({ error: "Les plateformes doivent etre un tableau de 10 elements maximum." });
  }

  const prompt = `Tu es un expert en social media marketing. Crée un calendrier de contenu sur 7 jours pour :
- Entreprise : ${companyName || "Entreprise"}
- Secteur : ${sector}
- Plateformes : ${(platforms || ["LinkedIn"]).join(", ")}
- Ton : ${tone || "Professionnel"}

Retourne un JSON avec cette structure exacte :
{
  "calendar": [
    {
      "day": "Lundi",
      "platform": "<plateforme>",
      "type": "<type de contenu: Post carousel, Story, Article, Reel, Thread>",
      "content": "<résumé du contenu en 1-2 phrases>",
      "time": "<heure de publication optimale HH:MM>",
      "hashtags": "<3-5 hashtags>"
    }
  ],
  "strategy": "<résumé de la stratégie en 2 phrases>",
  "bestDays": "<les 2 meilleurs jours pour publier>"
}

Génère exactement 7 entrées (une par jour, du lundi au dimanche). Varie les plateformes et les types de contenu. Retourne UNIQUEMENT le JSON.`;

  try {
    const text = await generateWithAI(prompt);
    const data = JSON.parse(text);
    res.json({ ...data, provider: "ai" });
  } catch (err) {
    console.error("[Flux] Erreur:", err.message);
    res.status(503).json({ error: "IA indisponible, reessayez.", fallback: true });
  }
});

module.exports = router;
