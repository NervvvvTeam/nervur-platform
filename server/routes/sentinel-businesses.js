const express = require("express");
const mongoose = require("mongoose");
const Business = require("../models/Business");
const Review = require("../models/Review");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ═══ Public route (no auth — Google redirects here) ═══
// GET /google-callback — OAuth callback from Google
router.get("/google-callback", async (req, res) => {
  try {
    const { code, state: businessId } = req.query;
    if (!code || !businessId) {
      return res.status(400).send("Param\u00E8tres manquants");
    }

    const { exchangeCode } = require("../services/google-business");
    const tokens = await exchangeCode(code);

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).send("Business introuvable");
    }

    business.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) {
      business.googleRefreshToken = tokens.refresh_token;
    }
    business.scanEnabled = true;
    await business.save();

    const dashboardUrl = process.env.DASHBOARD_URL || "https://app.nervur.fr";
    res.redirect(`${dashboardUrl}/settings?google=connected`);
  } catch (err) {
    console.error("[GOOGLE] OAuth callback error:", err.message);
    const dashboardUrl = process.env.DASHBOARD_URL || "https://app.nervur.fr";
    res.redirect(`${dashboardUrl}/settings?google=error`);
  }
});

// ═══ Protected routes (auth required) ═══
router.use(authMiddleware);

// GET / — Liste des businesses de l'utilisateur
router.get("/", async (req, res) => {
  try {
    const filter = req.userRole === "admin" ? {} : { userId: req.userId };
    const businesses = await Business.find(filter).sort({ createdAt: -1 });
    res.json({ businesses });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST / — Créer un business (onboarding)
router.post("/", async (req, res) => {
  try {
    const { businessName, sector, googleBusinessUrl } = req.body;
    if (!businessName || typeof businessName !== "string" || businessName.trim().length === 0) {
      return res.status(400).json({ error: "Nom de l'entreprise requis" });
    }
    if (businessName.length > 200) {
      return res.status(400).json({ error: "Le nom ne doit pas depasser 200 caracteres" });
    }
    const validSectors = ["restaurant", "hotel", "garage", "salon", "commerce", "medical", "immobilier", "autre"];
    const safeSector = validSectors.includes(sector) ? sector : "autre";
    if (googleBusinessUrl && (typeof googleBusinessUrl !== "string" || googleBusinessUrl.length > 500)) {
      return res.status(400).json({ error: "URL Google Business invalide" });
    }

    const business = await Business.create({
      userId: req.userId,
      businessName: businessName.trim(),
      sector: safeSector,
      googleBusinessUrl: googleBusinessUrl?.trim() || ""
    });

    res.status(201).json({ business });
  } catch (err) {
    console.error("[BUSINESS] Create error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /:id — Modifier un business
router.put("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ error: "Business introuvable" });
    if (business.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { businessName, sector, googleBusinessUrl, scanEnabled } = req.body;
    if (businessName) business.businessName = businessName.trim();
    if (sector) business.sector = sector;
    if (googleBusinessUrl !== undefined) business.googleBusinessUrl = googleBusinessUrl.trim();
    if (scanEnabled !== undefined) business.scanEnabled = scanEnabled;

    await business.save();
    res.json({ business });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /:id/mode — Toggle auto/manual
router.put("/:id/mode", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ error: "Business introuvable" });
    if (business.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const { mode } = req.body;
    if (!["auto", "manual"].includes(mode)) {
      return res.status(400).json({ error: "Mode invalide (auto ou manual)" });
    }

    business.mode = mode;
    await business.save();
    res.json({ business });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /:id/stats — Stats agrégées
router.get("/:id/stats", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ error: "Business introuvable" });

    const totalReviews = await Review.countDocuments({ businessId: business._id });
    const positiveCount = await Review.countDocuments({ businessId: business._id, sentiment: "positive" });
    const negativeCount = await Review.countDocuments({ businessId: business._id, sentiment: "negative" });
    const mixedCount = await Review.countDocuments({ businessId: business._id, sentiment: "mixed" });
    const publishedResponses = await Review.countDocuments({ businessId: business._id, responseStatus: "published" });
    const pendingResponses = await Review.countDocuments({ businessId: business._id, responseStatus: { $in: ["pending", "generated"] } });

    // Average rating
    const avgResult = await Review.aggregate([
      { $match: { businessId: business._id } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);

    // Reviews this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthCount = await Review.countDocuments({
      businessId: business._id,
      fetchedAt: { $gte: startOfMonth }
    });

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await Review.aggregate([
      { $match: { businessId: business._id, publishedAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$publishedAt" } },
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalReviews,
      averageRating: avgResult[0]?.avg ? Math.round(avgResult[0].avg * 10) / 10 : 0,
      thisMonthCount,
      sentiments: { positive: positiveCount, negative: negativeCount, mixed: mixedCount },
      responseRate: totalReviews > 0 ? Math.round((publishedResponses / totalReviews) * 100) : 0,
      pendingResponses,
      monthlyTrend,
      mode: business.mode,
      scanEnabled: business.scanEnabled,
      lastScanAt: business.lastScanAt
    });
  } catch (err) {
    console.error("[STATS] Error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /:id/google-auth-url — URL d'autorisation Google OAuth
router.get("/:id/google-auth-url", async (req, res) => {
  try {
    const { getAuthUrl } = require("../services/google-business");
    const url = getAuthUrl(req.params.id);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la génération de l'URL Google" });
  }
});

module.exports = router;
