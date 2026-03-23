const mongoose = require("mongoose");

const generatedContentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  topic: { type: String, required: true },
  tone: { type: String, default: "Professionnel" },
  companyName: { type: String, default: "" },
  content: { type: String, required: true },
  favorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

generatedContentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("GeneratedContent", generatedContentSchema);
