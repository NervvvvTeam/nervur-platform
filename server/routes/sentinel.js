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
      let sentiment = "mixed";
      if (r.rating >= 4) sentiment = "positive";
      else if (r.rating <= 2) sentiment = "negative";

      const result = await Review.updateOne(
        { googleReviewId: r.googleReviewId },
        {
          $setOnInsert: {
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
          }
        },
        { upsert: true }
      );
      if (result.upsertedCount > 0) newCount++;
      else updatedCount++;
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

// GET /oauth/url — Returns the Google OAuth URL for the client to click
router.get("/oauth/url", authMiddleware, (req, res) => {
  try {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: "GOOGLE_OAUTH_CLIENT_ID non configuré" });
    const redirectUri = encodeURIComponent("https://nervurapi-production.up.railway.app/api/sentinel/oauth/callback");
    const scope = encodeURIComponent("https://www.googleapis.com/auth/business.manage");
    const state = req.userId;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
    res.json({ url });
  } catch (err) {
    console.error("[OAUTH URL]", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /oauth/callback — Google redirects here after user authorizes
router.get("/oauth/callback", async (req, res) => {
  const { code, state } = req.query;
  const userId = state;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: "https://nervurapi-production.up.railway.app/api/sentinel/oauth/callback",
        grant_type: "authorization_code"
      })
    });

    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    await Business.findOneAndUpdate(
      { userId },
      {
        $set: {
          "googleOAuth.accessToken": tokens.access_token,
          "googleOAuth.refreshToken": tokens.refresh_token,
          "googleOAuth.expiresAt": new Date(Date.now() + tokens.expires_in * 1000),
          "googleOAuth.connected": true
        }
      },
      { upsert: false }
    );

    res.redirect("https://nervur.fr/app/sentinel?oauth=success");
  } catch (err) {
    console.error("[OAUTH] Error:", err.message);
    res.redirect("https://nervur.fr/app/sentinel?oauth=error");
  }
});

// POST /scan-reviews-oauth — Scan reviews using OAuth (all reviews, not just 5)
router.post("/scan-reviews-oauth", authMiddleware, async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.userId });
    if (!business?.googleOAuth?.connected) {
      return res.status(400).json({ error: "Google Business non connecté" });
    }

    let accessToken = business.googleOAuth.accessToken;

    // Refresh token if expired
    if (new Date() >= business.googleOAuth.expiresAt) {
      const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          refresh_token: business.googleOAuth.refreshToken,
          client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
          client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
          grant_type: "refresh_token"
        })
      });
      const newTokens = await refreshRes.json();
      accessToken = newTokens.access_token;
      business.googleOAuth.accessToken = accessToken;
      business.googleOAuth.expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
      await business.save();
    }

    // List accounts
    const accountsRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const accountsData = await accountsRes.json();
    const accounts = accountsData.accounts || [];
    if (accounts.length === 0) return res.status(404).json({ error: "Aucun compte Google Business trouvé" });

    const accountName = accounts[0].name;

    // List locations
    const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,metadata`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const locationsData = await locationsRes.json();
    const locations = locationsData.locations || [];
    if (locations.length === 0) return res.status(404).json({ error: "Aucun établissement trouvé" });

    const location = locations[0];

    // Get reviews for the location (paginated)
    let allReviews = [];
    let pageToken = null;
    do {
      const url = `https://mybusiness.googleapis.com/v4/${location.name}/reviews${pageToken ? '?pageToken=' + pageToken : ''}`;
      const reviewsRes = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const reviewsData = await reviewsRes.json();
      if (reviewsData.reviews) allReviews = allReviews.concat(reviewsData.reviews);
      pageToken = reviewsData.nextPageToken || null;
    } while (pageToken);

    // Save reviews to database
    let imported = 0;
    for (const r of allReviews) {
      const existing = await Review.findOne({ googleReviewId: r.reviewId, businessId: business._id });
      if (!existing) {
        await Review.create({
          businessId: business._id,
          userId: req.userId,
          googleReviewId: r.reviewId,
          authorName: r.reviewer?.displayName || "Anonyme",
          authorPhoto: r.reviewer?.profilePhotoUrl || null,
          rating: {"ONE":1,"TWO":2,"THREE":3,"FOUR":4,"FIVE":5}[r.starRating] || 3,
          text: r.comment || "",
          publishedAt: r.createTime ? new Date(r.createTime) : new Date(),
          language: "fr",
          sentiment: r.starRating === "FOUR" || r.starRating === "FIVE" ? "positif" : r.starRating === "THREE" ? "mixte" : "negatif",
          status: "pending"
        });
        imported++;
      }
    }

    res.json({ success: true, total: allReviews.length, imported, existing: allReviews.length - imported });
  } catch (err) {
    console.error("[OAUTH SCAN]", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /reset — Reset all Sentinel data for current user
router.delete("/reset", authMiddleware, async (req, res) => {
  try {
    const Review = require("../models/Review");
    const reviews = await Review.deleteMany({ userId: req.userId });
    const businesses = await Business.deleteMany({ userId: req.userId });

    res.json({
      success: true,
      deleted: {
        reviews: reviews.deletedCount,
        responses: 0,
        businesses: businesses.deletedCount
      }
    });
  } catch (err) {
    console.error("[RESET]", err);
    res.status(500).json({ error: err.message });
  }
});

// ═══ DEMO ENDPOINT (no auth, rate limited) ═══
const demoRateLimit = new Map(); // IP -> { count, resetAt }

router.get("/demo", async (req, res) => {
  try {
    // Rate limit: 5 requests per hour per IP
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    let entry = demoRateLimit.get(ip);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + hourMs };
      demoRateLimit.set(ip, entry);
    }

    if (entry.count >= 5) {
      return res.status(429).json({ error: "Limite atteinte. Reessayez dans une heure ou contactez-nous pour un acces complet." });
    }
    entry.count++;

    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({ error: "Parametre 'q' requis (nom de l'entreprise ou URL Google Maps)." });
    }

    if (q.trim().length > 300) {
      return res.status(400).json({ error: "Requete trop longue (max 300 caracteres)." });
    }

    // Use the existing fetchGoogleReviews function
    const { place, reviews } = await fetchGoogleReviews(q.trim(), null);

    if (!place) {
      return res.status(404).json({ error: "Etablissement introuvable sur Google Maps. Verifiez le nom ou l'URL." });
    }

    // Return limited data for demo (name, rating, total reviews, max 3 reviews)
    const demoReviews = (reviews || []).slice(0, 3).map(r => ({
      authorName: r.authorName || "Anonyme",
      rating: r.rating,
      text: r.text ? r.text.slice(0, 250) : "",
    }));

    res.json({
      name: place.name || q.trim(),
      rating: place.rating || 0,
      totalReviews: place.totalReviews || 0,
      reviews: demoReviews,
    });
  } catch (err) {
    console.error("[SENTINEL DEMO] Error:", err.message);
    res.status(500).json({ error: "Erreur lors de l'analyse. Reessayez." });
  }
});

// Clean up rate limit map periodically (every 30 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of demoRateLimit) {
    if (now > entry.resetAt) demoRateLimit.delete(ip);
  }
}, 30 * 60 * 1000);

module.exports = router;
