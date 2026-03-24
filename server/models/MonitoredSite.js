const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  domain: { type: String, required: true },
  lastCheck: {
    score: Number,
    uptime: mongoose.Schema.Types.Mixed,
    ssl: mongoose.Schema.Types.Mixed,
    dns: mongoose.Schema.Types.Mixed,
    domain: mongoose.Schema.Types.Mixed,
    securityHeaders: mongoose.Schema.Types.Mixed,
    http2: mongoose.Schema.Types.Mixed,
    checkedAt: Date,
  },
  history: [{
    score: Number,
    responseTime: Number,
    uptimeStatus: Boolean,
    checkedAt: Date,
  }],
  alertEmail: String,
  alerts: {
    down: { type: Boolean, default: false },
    sslExpiring: { type: Boolean, default: false },
    domainExpiring: { type: Boolean, default: false },
  },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

schema.index({ userId: 1 });
schema.index({ userId: 1, domain: 1 }, { unique: true });

module.exports = mongoose.model("MonitoredSite", schema);
