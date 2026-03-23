const mongoose = require("mongoose");

const rgpdScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  domain: String,
  score: Number, // 0-100
  results: {
    mentionsLegales: { found: Boolean, details: String },
    politiqueConfidentialite: { found: Boolean, details: String },
    cookieBanner: { found: Boolean, details: String },
    cgv: { found: Boolean, details: String },
    contactInfo: { found: Boolean, details: String },
    ssl: { found: Boolean, details: String },
    thirdPartyTrackers: { found: Boolean, trackers: [String], details: String },
    formConsent: { found: Boolean, details: String },
  },
  aiRecommendations: String,
  status: { type: String, enum: ["scanning", "completed", "error"], default: "scanning" },
}, { timestamps: true });

module.exports = mongoose.model("RgpdScan", rgpdScanSchema);
