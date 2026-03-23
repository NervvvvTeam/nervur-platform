const express = require("express");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

router.post("/generate", async (req, res) => {
  const { companyName, sector, budget, need } = req.body;

  if (!companyName || typeof companyName !== "string" || companyName.trim().length === 0) {
    return res.status(400).json({ error: "Le nom de l'entreprise est requis." });
  }
  if (!sector || typeof sector !== "string" || sector.trim().length === 0) {
    return res.status(400).json({ error: "Le secteur est requis." });
  }
  if (!need || typeof need !== "string" || need.trim().length === 0) {
    return res.status(400).json({ error: "Le besoin est requis." });
  }
  if (companyName.length > 200 || sector.length > 200 || need.length > 2000) {
    return res.status(400).json({ error: "Un ou plusieurs champs depassent la longueur maximale autorisee." });
  }

  const safeBudget = budget && typeof budget === "string" ? budget.slice(0, 100) : "Non precise";

  const prompt = `Tu es un consultant digital senior. Genere une proposition commerciale structuree pour :
- Entreprise : ${companyName.trim()}
- Secteur : ${sector.trim()}
- Budget : ${safeBudget}
- Besoin : ${need.trim()}

Retourne un JSON valide (pas de markdown, juste le JSON) avec cette structure exacte :
{
  "title": "Proposition — [titre adapte au besoin]",
  "sections": [
    { "heading": "Analyse & Diagnostic", "content": "[2-3 phrases sur l'analyse du besoin]" },
    { "heading": "Solution Proposee", "content": "[2-3 phrases sur la solution technique]" },
    { "heading": "Planning & Livrables", "content": "[2-3 phrases sur le planning]" },
    { "heading": "Investissement", "content": "[2-3 phrases sur le budget et ROI attendu]" }
  ]
}`;

  try {
    const text = await generateWithAI(prompt);
    const proposal = JSON.parse(text);
    res.json({ proposal, provider: "ai" });
  } catch (err) {
    console.error("[Vertex] Erreur:", err.message);
    res.status(503).json({ error: "IA indisponible, reessayez.", fallback: true });
  }
});

module.exports = router;
