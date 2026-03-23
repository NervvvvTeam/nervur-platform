const express = require("express");
const { generateResponse } = require("../services/ai");

const router = express.Router();

router.post("/generate", async (req, res) => {
  const { review, businessName, tone } = req.body;

  if (!review || typeof review !== "string" || review.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'review' est requis." });
  }

  if (review.length > 2000) {
    return res.status(400).json({ error: "L'avis ne doit pas dépasser 2000 caractères." });
  }

  const validTones = ["professional", "friendly", "empathetic"];
  const safeTone = validTones.includes(tone) ? tone : "professional";

  try {
    const result = await generateResponse(
      review.trim(),
      businessName || "Votre Entreprise",
      safeTone
    );
    res.json(result);
  } catch (err) {
    if (err.message === "NO_API_AVAILABLE") {
      return res.status(503).json({
        error: "Aucune API IA configurée. Ajoutez ANTHROPIC_API_KEY ou OPENAI_API_KEY dans .env",
        fallback: true,
      });
    }
    console.error("[Sentinel] Unexpected error:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;
