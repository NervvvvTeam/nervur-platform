const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  businessName: { type: String, required: true, trim: true },
  sector: {
    type: String,
    enum: ["restaurant", "hotel", "garage", "salon", "commerce", "medical", "immobilier", "autre"],
    default: "autre"
  },
  googleBusinessUrl: { type: String, trim: true },
  googlePlaceId: { type: String, trim: true },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  googleAccountId: { type: String },
  googleLocationId: { type: String },
  googleOAuth: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    connected: { type: Boolean, default: false }
  },
  mode: { type: String, enum: ["auto", "manual"], default: "manual" },
  scanEnabled: { type: Boolean, default: false },
  lastScanAt: { type: Date },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  googleRating: { type: Number, default: 0 },
  googleTotalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

businessSchema.index({ userId: 1 });

module.exports = mongoose.model("Business", businessSchema);
