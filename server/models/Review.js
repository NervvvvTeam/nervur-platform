const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  googleReviewId: { type: String, unique: true, sparse: true },
  authorName: { type: String, default: "Anonyme" },
  authorPhoto: { type: String, default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, default: "" },
  sentiment: { type: String, enum: ["positive", "negative", "mixed"], default: "mixed" },
  publishedAt: { type: Date },
  fetchedAt: { type: Date, default: Date.now },
  hasResponse: { type: Boolean, default: false },
  responseStatus: {
    type: String,
    enum: ["pending", "generated", "approved", "published", "failed"],
    default: "pending"
  }
});

reviewSchema.index({ businessId: 1, publishedAt: -1 });
// Note: unique+sparse index on googleReviewId is already created by the schema field options.
// No separate index call needed — that would cause duplicate index warnings.

module.exports = mongoose.model("Review", reviewSchema);
