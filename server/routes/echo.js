const express = require("express");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

router.post("/generate", async (req, res) => {
  const { companyName, audience, objective, emailCount } = req.body;
  if (!audience || typeof audience !== "string" || audience.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'audience' est requis." });
  }
  if (audience.length > 500) {
    return res.status(400).json({ error: "L'audience ne doit pas depasser 500 caracteres." });
  }
  if (emailCount !== undefined && (typeof emailCount !== "number" || emailCount < 1 || emailCount > 10)) {
    return res.status(400).json({ error: "Le nombre d'emails doit etre entre 1 et 10." });
  }

  const prompt = `Tu es un expert en email marketing et copywriting. Crée une séquence de ${emailCount || 5} emails pour :
- Entreprise : ${companyName || "Entreprise"}
- Cible : ${audience}
- Objectif : ${objective || "Prospection"}

Retourne un JSON avec cette structure exacte :
{
  "sequence": [
    {
      "number": 1,
      "delay": "Jour 1",
      "type": "<type: Introduction, Valeur, Preuve sociale, Urgence, Relance>",
      "subject": "<objet de l'email, accrocheur>",
      "preview": "<aperçu du contenu, 2-3 phrases>",
      "cta": "<texte du call-to-action>"
    }
  ],
  "expectedOpenRate": "<taux d'ouverture estimé en %>",
  "expectedReplyRate": "<taux de réponse estimé en %>",
  "tips": "<2 conseils pour améliorer les résultats>"
}

Génère exactement ${emailCount || 5} emails. Les objets doivent être courts et créer la curiosité. Retourne UNIQUEMENT le JSON.`;

  try {
    const text = await generateWithAI(prompt);
    const data = JSON.parse(text);
    res.json({ ...data, provider: "ai" });
  } catch (err) {
    console.error("[Echo] Erreur:", err.message);
    res.status(503).json({ error: "IA indisponible, reessayez.", fallback: true });
  }
});

module.exports = router;
