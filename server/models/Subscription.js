const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toolId: { type: String, enum: ["sentinel", "phantom", "nexus", "forge", "vault"], required: true },
  plan: { type: String, enum: ["starter", "pro", "enterprise"], default: "starter" },
  status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

subscriptionSchema.index({ userId: 1, toolId: 1 });
subscriptionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
