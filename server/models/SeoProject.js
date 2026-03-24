const mongoose = require("mongoose");

const seoProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  domain: { type: String, required: true },
  keywords: [String],
  rankings: [{
    keyword: String,
    position: Number,
    previousPosition: Number,
    url: String,
    change: Number,
    searchVolume: Number,
    competition: { type: String, enum: ["low", "medium", "high"] },
    estimatedTraffic: Number,
    checkedAt: { type: Date, default: Date.now }
  }],
  lastCheckAt: Date,
  history: [{
    date: Date,
    averagePosition: Number,
    keywordCount: Number,
    estimatedTraffic: Number,
    inTop10: Number,
    inTop30: Number,
  }],
}, { timestamps: true });

seoProjectSchema.index({ userId: 1 });

module.exports = mongoose.model("SeoProject", seoProjectSchema);
