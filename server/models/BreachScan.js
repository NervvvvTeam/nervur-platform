const mongoose = require("mongoose");

const breachDetailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  breaches: [{
    name: String,
    title: String,
    domain: String,
    breachDate: String,
    dataClasses: [String],
    description: String,
    pwnCount: Number,
    isVerified: Boolean,
    isSensitive: Boolean,
  }],
  pasteCount: { type: Number, default: 0 },
  isCompromised: { type: Boolean, default: false },
}, { _id: false });

const breachScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  domain: { type: String, required: true },
  emails: [String],
  results: [breachDetailSchema],
  summary: {
    totalEmails: { type: Number, default: 0 },
    compromisedEmails: { type: Number, default: 0 },
    totalBreaches: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
    topBreaches: [String],
    dataTypesExposed: [String],
  },
  aiRecommendations: { type: String, default: "" },
  status: { type: String, enum: ["pending", "scanning", "completed", "error"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

breachScanSchema.index({ userId: 1, domain: 1 });
breachScanSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BreachScan", breachScanSchema);
