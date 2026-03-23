const mongoose = require("mongoose");

const competitorSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  name: { type: String, required: true, trim: true },
  googlePlaceId: { type: String, trim: true },
  googleUrl: { type: String, trim: true },
  platform: { type: String, enum: ["google", "tripadvisor", "facebook", "trustpilot"], default: "google" },
  currentRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  lastCheckedAt: { type: Date },
  history: [{
    date: { type: Date, default: Date.now },
    rating: Number,
    totalReviews: Number,
  }],
  createdAt: { type: Date, default: Date.now },
});

competitorSchema.index({ businessId: 1 });

module.exports = mongoose.model("Competitor", competitorSchema);
