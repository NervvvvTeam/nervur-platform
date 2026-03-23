const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  domain: { type: String },
  scores: {
    performance: { type: Number, default: 0 },
    accessibility: { type: Number, default: 0 },
    seo: { type: Number, default: 0 },
    bestPractices: { type: Number, default: 0 },
    global: { type: Number, default: 0 },
  },
  coreWebVitals: {
    lcp: { value: Number, unit: String, status: String },
    fcp: { value: Number, unit: String, status: String },
    cls: { value: Number, unit: String, status: String },
    tbt: { value: Number, unit: String, status: String },
    speedIndex: { value: Number, unit: String, status: String },
    tti: { value: Number, unit: String, status: String },
  },
  issues: [{
    title: String,
    description: String,
    severity: { type: String, enum: ["critical", "warning", "info"] },
    category: String,
    fix: String,
    impact: String,
  }],
  aiSummary: { type: String },
  realData: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

auditSchema.index({ userId: 1, createdAt: -1 });
auditSchema.index({ userId: 1, domain: 1 });

module.exports = mongoose.model("Audit", auditSchema);
