const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const Business = require("../models/Business");
const Review = require("../models/Review");
const AlertConfig = require("../models/AlertConfig");
const { generateQRCode, generateQRBuffer } = require("../services/qr-generator");
const { generateMonthlyReport } = require("../services/pdf-report");
const { analyzeThemes } = require("../services/semantic-analysis");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ═══ QR CODE ═══

// GET /api/sentinel-app/tools/:businessId/qrcode — Generate QR code
router.get("/:businessId/qrcode", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const reviewUrl = business.googleBusinessUrl || `https://search.google.com/local/writereview?placeid=${business.googlePlaceId || "PLACE_ID"}`;
    const qrDataUrl = await generateQRCode(reviewUrl);

    res.json({ qrCode: qrDataUrl, reviewUrl });
  } catch (err) {
    console.error("[TOOLS] QR error:", err.message);
    res.status(500).json({ error: "Erreur de génération QR" });
  }
});

// GET /api/sentinel-app/tools/:businessId/qrcode/download — Download QR as PNG
router.get("/:businessId/qrcode/download", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const reviewUrl = business.googleBusinessUrl || `https://search.google.com/local/writereview?placeid=${business.googlePlaceId || "PLACE_ID"}`;
    const buffer = await generateQRBuffer(reviewUrl);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="qr-avis-${business.businessName.replace(/\s+/g, "-")}.png"`);
    res.send(buffer);
  } catch (err) {
    console.error("[TOOLS] QR download error:", err.message);
    res.status(500).json({ error: "Erreur de téléchargement" });
  }
});

// ═══ PDF REPORT ═══

// GET /api/sentinel-app/tools/:businessId/report — Generate PDF report
router.get("/:businessId/report", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const reviews = await Review.find({ businessId: business._id }).sort({ publishedAt: -1 });
    const Response = require("../models/Response");

    // Calculate stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const thisMonthReviews = reviews.filter(r => r.publishedAt >= thirtyDaysAgo);

    const responses = await Response.find({ businessId: business._id, status: "published" });
    const responseRate = totalReviews > 0 ? Math.round((responses.length / totalReviews) * 100) : 0;

    const sentiments = { positive: 0, negative: 0, mixed: 0 };
    reviews.forEach(r => { if (sentiments.hasOwnProperty(r.sentiment)) sentiments[r.sentiment]++; });

    const stats = {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      thisMonthCount: thisMonthReviews.length,
      responseRate,
      sentiments,
    };

    // Get semantic analysis
    const analysis = await analyzeThemes(reviews, business.sector);

    // Generate PDF
    const pdfBuffer = await generateMonthlyReport(business, stats, reviews, analysis);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="rapport-${business.businessName.replace(/\s+/g, "-")}-${now.toISOString().slice(0, 7)}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[TOOLS] Report error:", err.message);
    res.status(500).json({ error: "Erreur de génération du rapport" });
  }
});

// ═══ WIDGET ═══

// GET /api/sentinel-app/tools/:businessId/widget — Get widget data (public)
router.get("/:businessId/widget", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const reviews = await Review.find({
      businessId: business._id,
      rating: { $gte: 4 },
    }).sort({ publishedAt: -1 }).limit(10);

    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    // CORS for widget embedding
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.json({
      business: business.businessName,
      averageRating: Math.round(avgRating * 10) / 10,
      reviews: reviews.map(r => ({
        authorName: r.authorName,
        rating: r.rating,
        text: r.text ? r.text.substring(0, 200) : "",
        date: r.publishedAt,
      })),
    });
  } catch (err) {
    console.error("[TOOLS] Widget error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/sentinel-app/tools/:businessId/widget/embed — Get embed code
router.get("/:businessId/widget/embed", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const apiUrl = process.env.NODE_ENV === "production"
      ? "https://nervurapi-production.up.railway.app"
      : "http://localhost:3001";

    const embedCode = `<!-- Widget Avis NERVÜR Sentinel -->
<div id="nervur-reviews-widget"></div>
<script>
(function(){
  var w=document.getElementById('nervur-reviews-widget');
  var s=document.createElement('style');
  s.textContent='.nrv-widget{font-family:system-ui,sans-serif;max-width:400px;background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.08)}.nrv-header{display:flex;align-items:center;gap:12px;margin-bottom:16px}.nrv-stars{color:#f59e0b;font-size:18px}.nrv-score{font-size:24px;font-weight:700;color:#1a1a1a}.nrv-review{padding:12px 0;border-top:1px solid #f0f0f0}.nrv-review-author{font-weight:600;font-size:13px;color:#333}.nrv-review-text{font-size:13px;color:#666;margin-top:4px;line-height:1.5}.nrv-powered{text-align:center;margin-top:12px;font-size:10px;color:#aaa}';
  document.head.appendChild(s);
  fetch('${apiUrl}/api/sentinel-app/tools/${business._id}/widget')
    .then(function(r){return r.json()})
    .then(function(d){
      var stars='★'.repeat(Math.round(d.averageRating))+'☆'.repeat(5-Math.round(d.averageRating));
      var html='<div class="nrv-widget"><div class="nrv-header"><span class="nrv-score">'+d.averageRating+'/5</span><span class="nrv-stars">'+stars+'</span></div>';
      d.reviews.slice(0,5).forEach(function(r){
        html+='<div class="nrv-review"><div class="nrv-review-author">'+r.authorName+' — '+'★'.repeat(r.rating)+'</div><div class="nrv-review-text">'+r.text+'</div></div>';
      });
      html+='<div class="nrv-powered">Propulsé par NERVÜR</div></div>';
      w.innerHTML=html;
    });
})();
</script>`;

    res.json({ embedCode, widgetUrl: `${apiUrl}/api/sentinel-app/tools/${business._id}/widget` });
  } catch (err) {
    console.error("[TOOLS] Widget embed error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ═══ ALERTS ═══

// GET /api/sentinel-app/tools/:businessId/alerts — Get alert config
router.get("/:businessId/alerts", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    let config = await AlertConfig.findOne({ businessId: business._id });
    if (!config) {
      config = await AlertConfig.create({
        businessId: business._id,
        emailTo: "",
      });
    }

    res.json({ config });
  } catch (err) {
    console.error("[TOOLS] Alert get error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/sentinel-app/tools/:businessId/alerts — Update alert config
router.put("/:businessId/alerts", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.businessId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const business = await Business.findOne({ _id: req.params.businessId, userId: req.userId });
    if (!business) return res.status(404).json({ error: "Entreprise non trouvée" });

    const updates = {};
    const allowed = ["enabled", "emailTo", "thresholdRating", "alertOnNegative", "alertOnPositive", "dailyDigest", "weeklyReport"];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // Validate types
    if (updates.emailTo !== undefined && typeof updates.emailTo !== "string") {
      return res.status(400).json({ error: "Email invalide" });
    }
    if (updates.emailTo && updates.emailTo.length > 254) {
      return res.status(400).json({ error: "Email trop long" });
    }
    if (updates.thresholdRating !== undefined) {
      const r = Number(updates.thresholdRating);
      if (isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({ error: "Le seuil doit etre entre 1 et 5" });
      }
      updates.thresholdRating = r;
    }

    const config = await AlertConfig.findOneAndUpdate(
      { businessId: business._id },
      updates,
      { new: true, upsert: true }
    );

    res.json({ config });
  } catch (err) {
    console.error("[TOOLS] Alert update error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
