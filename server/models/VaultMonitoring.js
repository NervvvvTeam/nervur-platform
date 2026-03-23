const mongoose = require("mongoose");

const vaultMonitoringSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  domain: { type: String, required: true },
  emails: [String],
  frequency: { type: String, enum: ["weekly", "monthly"], default: "weekly" },
  enabled: { type: Boolean, default: true },
  lastScanId: { type: mongoose.Schema.Types.ObjectId, ref: "BreachScan" },
  lastScanAt: Date,
  alertEmail: String,
}, { timestamps: true });

vaultMonitoringSchema.index({ userId: 1, domain: 1 });

module.exports = mongoose.model("VaultMonitoring", vaultMonitoringSchema);
