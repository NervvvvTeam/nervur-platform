const mongoose = require("mongoose");

const alertConfigSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, unique: true },
  enabled: { type: Boolean, default: true },
  emailTo: { type: String, trim: true },
  thresholdRating: { type: Number, default: 2, min: 1, max: 5 },
  alertOnNegative: { type: Boolean, default: true },
  alertOnPositive: { type: Boolean, default: false },
  dailyDigest: { type: Boolean, default: false },
  weeklyReport: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AlertConfig", alertConfigSchema);
