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

// GET /:businessId — Liste des avis (paginée + filtres)
router.get("/:businessId", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const { page = 1, limit = 20, sentiment, status, sort = "publishedAt" } = req.query;
    const safePage = Math.max(parseInt(page) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const filter = { businessId: req.params.businessId };
    const validSentiments = ["positive", "negative", "mixed"];
    if (sentiment && validSentiments.includes(sentiment)) filter.sentiment = sentiment;
    const validStatuses = ["pending", "generated", "approved", "published", "failed"];
    if (status && validStatuses.includes(status)) filter.responseStatus = status;

    const sortObj = sort === "rating" ? { rating: -1 } : { publishedAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter).sort(sortObj).skip(skip).limit(safeLimit),
      Review.countDocuments(filter)
    ]);

    // Fetch associated responses
    const reviewIds = reviews.map(r => r._id);
    const responses = await Response.find({ reviewId: { $in: reviewIds } });
    const responseMap = {};
    responses.forEach(r => { responseMap[r.reviewId.toString()] = r; });

    const reviewsWithResponses = reviews.map(r => ({
      ...r.toObject(),
      response: responseMap[r._id.toString()] || null
    }));

    res.json({
      reviews: reviewsWithResponses,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit)
      }
    });
  } catch (err) {
    console.error("[REVIEWS] List error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /:businessId/:reviewId — Détail d'un avis
router.get("/:businessId/:reviewId", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId) || !isValidObjectId(req.params.reviewId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const review = await Review.findOne({
      _id: req.params.reviewId,
      businessId: req.params.businessId
    });
    if (!review) return res.status(404).json({ error: "Avis introuvable" });

    const response = await Response.findOne({ reviewId: review._id }).sort({ generatedAt: -1 });

    res.json({ review: { ...review.toObject(), response: response || null } });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /:businessId/scan — Déclencher un scan manuel
router.post("/:businessId/scan", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ error: "Business introuvable" });

    if (!business.googleAccessToken) {
      return res.status(400).json({ error: "Google Business non connecté. Connectez votre compte dans les paramètres." });
    }

    // Trigger scan asynchronously
    const { scanBusiness } = require("../cron/review-scanner");
    scanBusiness(business).catch(err => console.error("[SCAN] Manual scan error:", err.message));

    res.json({ message: "Scan lancé. Les nouveaux avis apparaîtront dans quelques instants." });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /:businessId/add-review — Ajout manuel d'un avis (pour le MVP sans Google API)
router.post("/:businessId/add-review", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const { authorName, rating, text, publishedAt } = req.body;
    const numRating = parseInt(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Note entre 1 et 5 requise" });
    }
    if (authorName && (typeof authorName !== "string" || authorName.length > 200)) {
      return res.status(400).json({ error: "Nom d'auteur invalide (max 200 caracteres)" });
    }
    if (text && (typeof text !== "string" || text.length > 5000)) {
      return res.status(400).json({ error: "Texte de l'avis trop long (max 5000 caracteres)" });
    }

    // Determine sentiment
    let sentiment = "mixed";
    if (rating >= 4) sentiment = "positive";
    else if (rating <= 2) sentiment = "negative";

    const review = await Review.create({
      businessId: req.params.businessId,
      authorName: authorName?.trim() || "Anonyme",
      rating: numRating,
      text: text?.trim() || "",
      sentiment,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      fetchedAt: new Date(),
      hasResponse: false,
      responseStatus: "pending"
    });

    res.status(201).json({ review });
  } catch (err) {
    console.error("[REVIEWS] Add error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
