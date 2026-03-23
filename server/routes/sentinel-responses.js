const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Response = require("../models/Response");
const Business = require("../models/Business");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /:reviewId/generate — Générer une réponse IA
router.post("/:reviewId/generate", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.reviewId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ error: "Avis introuvable" });

    const business = await Business.findById(review.businessId);
    if (!business) return res.status(404).json({ error: "Business introuvable" });

    const { generateReviewResponse } = require("../services/ai");
    const aiResult = await generateReviewResponse(review, business);

    const response = await Response.create({
      reviewId: review._id,
      businessId: business._id,
      generatedText: aiResult.response,
      provider: aiResult.provider || "claude",
      status: "generated",
      autoPublished: false,
      generatedAt: new Date()
    });

    review.responseStatus = "generated";
    review.hasResponse = true;
    await review.save();

    res.status(201).json({ response });
  } catch (err) {
    console.error("[RESPONSE] Generate error:", err.message);
    res.status(500).json({ error: "Erreur lors de la génération de la réponse" });
  }
});

// POST /:reviewId/regenerate — Regénérer une réponse alternative
router.post("/:reviewId/regenerate", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.reviewId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ error: "Avis introuvable" });

    const business = await Business.findById(review.businessId);
    if (!business) return res.status(404).json({ error: "Business introuvable" });

    const { generateReviewResponse } = require("../services/ai");
    const aiResult = await generateReviewResponse(review, business);

    // Replace existing response
    await Response.deleteMany({ reviewId: review._id, status: { $ne: "published" } });

    const response = await Response.create({
      reviewId: review._id,
      businessId: business._id,
      generatedText: aiResult.response,
      provider: aiResult.provider || "claude",
      status: "generated",
      autoPublished: false,
      generatedAt: new Date()
    });

    review.responseStatus = "generated";
    await review.save();

    res.status(201).json({ response });
  } catch (err) {
    console.error("[RESPONSE] Regenerate error:", err.message);
    res.status(500).json({ error: "Erreur lors de la regénération" });
  }
});

// PUT /:responseId/edit — Modifier le texte d'une réponse
router.put("/:responseId/edit", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.responseId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const response = await Response.findById(req.params.responseId);
    if (!response) return res.status(404).json({ error: "Réponse introuvable" });
    if (response.status === "published") {
      return res.status(400).json({ error: "Impossible de modifier une réponse déjà publiée" });
    }

    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Texte requis" });
    }
    if (text.length > 5000) {
      return res.status(400).json({ error: "Le texte ne doit pas depasser 5000 caracteres" });
    }

    response.editedText = text.trim();
    response.status = "approved";
    await response.save();

    // Update review status
    await Review.findByIdAndUpdate(response.reviewId, { responseStatus: "approved" });

    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /:responseId/approve — Approuver une réponse sans modification
router.post("/:responseId/approve", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.responseId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const response = await Response.findById(req.params.responseId);
    if (!response) return res.status(404).json({ error: "Réponse introuvable" });

    response.status = "approved";
    await response.save();

    await Review.findByIdAndUpdate(response.reviewId, { responseStatus: "approved" });

    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /:responseId/publish — Publier la réponse sur Google
router.post("/:responseId/publish", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.responseId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const response = await Response.findById(req.params.responseId);
    if (!response) return res.status(404).json({ error: "Réponse introuvable" });
    if (response.status === "published") {
      return res.status(400).json({ error: "Déjà publiée" });
    }

    const business = await Business.findById(response.businessId);
    const review = await Review.findById(response.reviewId);

    const finalText = response.editedText || response.generatedText;

    // Try to publish via Google API if connected
    if (business.googleAccessToken && review.googleReviewId) {
      try {
        const { postReply } = require("../services/google-business");
        await postReply(business, review.googleReviewId, finalText);

        response.status = "published";
        response.finalText = finalText;
        response.publishedAt = new Date();
        await response.save();

        review.responseStatus = "published";
        await review.save();

        return res.json({ response, published: true });
      } catch (pubErr) {
        response.publishError = pubErr.message;
        await response.save();
        // Fall through to manual mode
      }
    }

    // Manual mode: mark as published (client will copy-paste)
    response.status = "published";
    response.finalText = finalText;
    response.publishedAt = new Date();
    await response.save();

    review.responseStatus = "published";
    await review.save();

    res.json({
      response,
      published: false,
      message: "Réponse marquée comme publiée. Copiez-la et postez-la manuellement sur Google."
    });
  } catch (err) {
    console.error("[RESPONSE] Publish error:", err.message);
    res.status(500).json({ error: "Erreur lors de la publication" });
  }
});

module.exports = router;
