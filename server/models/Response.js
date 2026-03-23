const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  generatedText: { type: String, required: true },
  editedText: { type: String, default: null },
  finalText: { type: String, default: null },
  provider: { type: String, enum: ["claude", "openai"], default: "claude" },
  status: {
    type: String,
    enum: ["generated", "approved", "published", "failed"],
    default: "generated"
  },
  autoPublished: { type: Boolean, default: false },
  generatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  publishError: { type: String }
});

responseSchema.index({ businessId: 1, status: 1 });
responseSchema.index({ reviewId: 1 });

module.exports = mongoose.model("Response", responseSchema);
