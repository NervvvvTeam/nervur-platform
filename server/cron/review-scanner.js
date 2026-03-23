const cron = require("node-cron");
const Business = require("../models/Business");
const Review = require("../models/Review");
const Response = require("../models/Response");
const { generateReviewResponse } = require("../services/ai");

// Scan a single business for new reviews
async function scanBusiness(business) {
  console.log(`[CRON] Scanning: ${business.businessName}...`);

  try {
    const { fetchReviews, postReply } = require("../services/google-business");
    const googleReviews = await fetchReviews(business);

    let newCount = 0;

    for (const gr of googleReviews) {
      // Skip if already replied on Google
      if (gr.hasReply) continue;

      // Deduplicate
      const exists = await Review.findOne({ googleReviewId: gr.reviewId });
      if (exists) continue;

      // Determine sentiment
      let sentiment = "mixed";
      if (gr.rating >= 4) sentiment = "positive";
      else if (gr.rating <= 2) sentiment = "negative";

      // Save review
      const review = await Review.create({
        businessId: business._id,
        googleReviewId: gr.reviewId,
        authorName: gr.authorName,
        rating: gr.rating,
        text: gr.text,
        sentiment,
        publishedAt: new Date(gr.createTime),
        fetchedAt: new Date(),
        hasResponse: false,
        responseStatus: "pending"
      });

      // Generate AI response
      try {
        const aiResult = await generateReviewResponse(review, business);
        const response = await Response.create({
          reviewId: review._id,
          businessId: business._id,
          generatedText: aiResult.response,
          provider: aiResult.provider,
          status: "generated",
          autoPublished: false,
          generatedAt: new Date()
        });

        // Auto mode: publish immediately
        if (business.mode === "auto") {
          try {
            await postReply(business, gr.reviewName, aiResult.response);
            response.status = "published";
            response.autoPublished = true;
            response.finalText = aiResult.response;
            response.publishedAt = new Date();
            await response.save();
            review.responseStatus = "published";
            review.hasResponse = true;
          } catch (pubErr) {
            console.error(`[CRON] Publish error for ${gr.reviewId}:`, pubErr.message);
            response.status = "failed";
            response.publishError = pubErr.message;
            await response.save();
            review.responseStatus = "failed";
          }
        } else {
          review.responseStatus = "generated";
          review.hasResponse = true;
        }

        await review.save();
        newCount++;

        // Small delay between AI calls to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (aiErr) {
        console.error(`[CRON] AI generation error for review ${gr.reviewId}:`, aiErr.message);
        review.responseStatus = "failed";
        await review.save();
      }
    }

    // Update cached stats
    business.lastScanAt = new Date();
    business.totalReviews = await Review.countDocuments({ businessId: business._id });
    const avgResult = await Review.aggregate([
      { $match: { businessId: business._id } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);
    business.averageRating = avgResult[0]?.avg || 0;
    await business.save();

    console.log(`[CRON] ${business.businessName}: ${newCount} new reviews processed`);
  } catch (err) {
    console.error(`[CRON] Error scanning ${business.businessName}:`, err.message);
  }
}

// Initialize the cron scheduler
function initReviewScanner() {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Starting hourly review scan...");

    try {
      const businesses = await Business.find({
        scanEnabled: true,
        googleAccessToken: { $exists: true, $ne: null }
      });

      console.log(`[CRON] Found ${businesses.length} businesses to scan`);

      for (const biz of businesses) {
        await scanBusiness(biz);
      }

      console.log("[CRON] Hourly scan complete.");
    } catch (err) {
      console.error("[CRON] Scanner error:", err.message);
    }
  });

  console.log("[NERVUR API] Review scanner cron initialized (every hour)");
}

module.exports = { initReviewScanner, scanBusiness };
