const express = require("express");
const { generateResponse } = require("../services/ai");
const { fetchGoogleReviews } = require("../services/google-places");
const { authMiddleware } = require("../middleware/auth");
const Business = require("../models/Business");
const Review = require("../models/Review");
const { analyzeSentiment } = require("../services/semantic-analysis");

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

// POST /scan-reviews — Scan Google reviews for a business (uses Places API)
router.post("/scan-reviews", authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ error: "businessId requis" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business introuvable" });
    }

    // Fetch reviews from Google Places API
    const { place, reviews } = await fetchGoogleReviews(
      business.businessName,
      business.googleBusinessUrl
    );

    if (!place) {
      return res.status(404).json({ error: "Établissement introuvable sur Google Maps. Vérifiez le nom ou l'URL." });
    }

    // Save place info to business
    if (place.placeId) business.googlePlaceId = place.placeId;
    if (place.rating) business.googleRating = place.rating;
    if (place.totalReviews) business.googleTotalReviews = place.totalReviews;
    business.lastScanAt = new Date();
    business.scanEnabled = true;
    await business.save();

    // Upsert reviews into database
    let newCount = 0;
    let updatedCount = 0;
    for (const r of reviews) {
      const existing = await Review.findOne({
        businessId: business._id,
        googleReviewId: r.googleReviewId
      });

      if (!existing) {
        // Analyze sentiment
        let sentiment = "mixed";
        if (r.rating >= 4) sentiment = "positive";
        else if (r.rating <= 2) sentiment = "negative";

        await Review.create({
          businessId: business._id,
          googleReviewId: r.googleReviewId,
          authorName: r.authorName,
          authorPhoto: r.authorPhoto,
          rating: r.rating,
          text: r.text,
          sentiment,
          publishedAt: r.publishedAt,
          fetchedAt: new Date(),
          responseStatus: "pending"
        });
        newCount++;
      } else {
        updatedCount++;
      }
    }

    res.json({
      success: true,
      place,
      scanned: reviews.length,
      new: newCount,
      existing: updatedCount,
      message: `${newCount} nouvel(s) avis importé(s), ${updatedCount} déjà en base.`
    });
  } catch (err) {
    console.error("[SENTINEL] Scan error:", err.message);
    res.status(500).json({ error: "Erreur lors du scan: " + err.message });
  }
});

module.exports = router;
