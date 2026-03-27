const mongoose = require("mongoose");
const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  domain: { type: String, required: true },
  url: { type: String },
  frequency: { type: String, enum: ["weekly", "monthly"], default: "weekly" },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });
scheduleSchema.index({ userId: 1, domain: 1 }, { unique: true });
module.exports = mongoose.model("Schedule", scheduleSchema);
