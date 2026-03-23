const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const Competitor = require("../models/Competitor");
const Business = require("../models/Business");
const Review = require("../models/Review");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/sentinel-app/competitors/:businessId — List competitors
router.get("/:businessId", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const competitors = await Competitor.find({ businessId: business._id }).sort({ createdAt: -1 });

    // Include own business data for comparison
    const reviews = await Review.find({ businessId: business._id });
    const ownRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    res.json({
      business: {
        name: business.businessName,
        rating: Math.round(ownRating * 10) / 10,
        totalReviews: reviews.length,
      },
      competitors,
    });
  } catch (err) {
    console.error("[COMPETITORS] List error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/sentinel-app/competitors/:businessId — Add competitor
router.post("/:businessId", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const existing = await Competitor.countDocuments({ businessId: business._id });
    if (existing >= 5) return res.status(400).json({ error: "Maximum 5 concurrents" });

    const { name, googleUrl, currentRating, totalReviews } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Nom requis" });
    }
    if (name.length > 200) {
      return res.status(400).json({ error: "Le nom ne doit pas depasser 200 caracteres" });
    }

    const competitor = await Competitor.create({
      businessId: business._id,
      name: name.trim(),
      googleUrl: googleUrl || "",
      currentRating: currentRating || (3 + Math.random() * 1.5),
      totalReviews: totalReviews || Math.floor(Math.random() * 200 + 20),
      lastCheckedAt: new Date(),
      history: [{
        date: new Date(),
        rating: currentRating || (3 + Math.random() * 1.5),
        totalReviews: totalReviews || Math.floor(Math.random() * 200 + 20),
      }],
    });

    res.status(201).json({ competitor });
  } catch (err) {
    console.error("[COMPETITORS] Create error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/sentinel-app/competitors/:businessId/:competitorId
router.delete("/:businessId/:competitorId", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId) || !isValidObjectId(req.params.competitorId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    await Competitor.deleteOne({ _id: req.params.competitorId, businessId: business._id });
    res.json({ success: true });
  } catch (err) {
    console.error("[COMPETITORS] Delete error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
