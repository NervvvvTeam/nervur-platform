const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  textContent: { type: String, default: "" },
  fromName: { type: String, default: "NERVÜR" },
  listName: { type: String, default: "Tous les contacts" },
  status: { type: String, enum: ["draft", "sent", "scheduled"], default: "draft" },
  sentAt: Date,
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
  },
  resendIds: [String],
  createdAt: { type: Date, default: Date.now },
});

campaignSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Campaign", campaignSchema);
