const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listName: { type: String, default: "Tous les contacts" },
  email: { type: String, required: true },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  company: { type: String, default: "" },
  tags: [String],
  status: { type: String, enum: ["active", "unsubscribed", "bounced"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

contactSchema.index({ userId: 1, email: 1 }, { unique: true });
contactSchema.index({ userId: 1, listName: 1 });

module.exports = mongoose.model("Contact", contactSchema);
