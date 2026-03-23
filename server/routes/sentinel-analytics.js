const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const Review = require("../models/Review");
const Business = require("../models/Business");
const { analyzeThemes } = require("../services/semantic-analysis");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/sentinel-app/analytics/:businessId/semantic — Analyse sémantique
router.get("/:businessId/semantic", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const reviews = await Review.find({ businessId: business._id }).sort({ publishedAt: -1 }).limit(50);
    const analysis = await analyzeThemes(reviews, business.sector);

    res.json({ analysis });
  } catch (err) {
    console.error("[ANALYTICS] Semantic error:", err.message);
    res.status(500).json({ error: "Erreur d'analyse sémantique" });
  }
});

// GET /api/sentinel-app/analytics/:businessId/nps — Score NPS
router.get("/:businessId/nps", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const reviews = await Review.find({ businessId: business._id });

    if (reviews.length === 0) {
      return res.json({ nps: 0, promoters: 0, passives: 0, detractors: 0, total: 0 });
    }

    // NPS: Promoters (4-5 stars) - Detractors (1-2 stars), as percentage
    let promoters = 0, passives = 0, detractors = 0;
    reviews.forEach(r => {
      if (r.rating >= 4) promoters++;
      else if (r.rating === 3) passives++;
      else detractors++;
    });

    const total = reviews.length;
    const nps = Math.round(((promoters - detractors) / total) * 100);

    // Trend: compare last 30 days vs previous 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

    const recentReviews = reviews.filter(r => r.publishedAt >= thirtyDaysAgo);
    const previousReviews = reviews.filter(r => r.publishedAt >= sixtyDaysAgo && r.publishedAt < thirtyDaysAgo);

    let recentNps = 0, previousNps = 0;
    if (recentReviews.length > 0) {
      const rp = recentReviews.filter(r => r.rating >= 4).length;
      const rd = recentReviews.filter(r => r.rating <= 2).length;
      recentNps = Math.round(((rp - rd) / recentReviews.length) * 100);
    }
    if (previousReviews.length > 0) {
      const pp = previousReviews.filter(r => r.rating >= 4).length;
      const pd = previousReviews.filter(r => r.rating <= 2).length;
      previousNps = Math.round(((pp - pd) / previousReviews.length) * 100);
    }

    res.json({
      nps,
      promoters,
      passives,
      detractors,
      total,
      trend: recentNps - previousNps,
      recentNps,
      previousNps,
    });
  } catch (err) {
    console.error("[ANALYTICS] NPS error:", err.message);
    res.status(500).json({ error: "Erreur de calcul NPS" });
  }
});

// GET /api/sentinel-app/analytics/:businessId/trends — Tendances & objectifs
router.get("/:businessId/trends", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

    const allReviews = await Review.find({ businessId: business._id });
    const recentReviews = allReviews.filter(r => r.publishedAt >= thirtyDaysAgo);
    const previousReviews = allReviews.filter(r => r.publishedAt >= sixtyDaysAgo && r.publishedAt < thirtyDaysAgo);

    // Current month avg
    const currentAvg = recentReviews.length > 0
      ? recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length
      : 0;
    const previousAvg = previousReviews.length > 0
      ? previousReviews.reduce((s, r) => s + r.rating, 0) / previousReviews.length
      : 0;

    const scoreTrend = currentAvg - previousAvg;
    const countTrend = recentReviews.length - previousReviews.length;

    // Average response time (time between review publishedAt and response generatedAt)
    const Response = require("../models/Response");
    const responses = await Response.find({ businessId: business._id });
    let totalResponseTime = 0, responseCount = 0;
    for (const resp of responses) {
      if (resp.generatedAt) {
        const review = allReviews.find(r => r._id.toString() === resp.reviewId.toString());
        if (review && review.publishedAt) {
          const diffHours = (resp.generatedAt - review.publishedAt) / (1000 * 60 * 60);
          if (diffHours >= 0 && diffHours < 720) { // max 30 days
            totalResponseTime += diffHours;
            responseCount++;
          }
        }
      }
    }
    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    // Objective: target 4.5 stars
    const targetRating = 4.5;
    const globalAvg = allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : 0;
    const objectiveProgress = Math.min(Math.round((globalAvg / targetRating) * 100), 100);

    res.json({
      scoreTrend: Math.round(scoreTrend * 10) / 10,
      countTrend,
      currentAvg: Math.round(currentAvg * 10) / 10,
      previousAvg: Math.round(previousAvg * 10) / 10,
      avgResponseTime,
      objective: {
        target: targetRating,
        current: Math.round(globalAvg * 10) / 10,
        progress: objectiveProgress,
      },
    });
  } catch (err) {
    console.error("[ANALYTICS] Trends error:", err.message);
    res.status(500).json({ error: "Erreur de calcul des tendances" });
  }
});

module.exports = router;
