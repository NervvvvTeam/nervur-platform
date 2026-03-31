const mongoose = require("mongoose");

const vaultDsarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requesterName: { type: String, required: true },
  requesterEmail: { type: String, required: true },
  requestType: {
    type: String,
    enum: ["acces", "rectification", "suppression", "portabilite", "opposition", "limitation"],
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ["recu", "en_cours", "traite", "refuse"],
    default: "recu",
  },
  receivedAt: { type: Date, required: true, default: Date.now },
  deadline: { type: Date },
  treatedAt: Date,
  response: String,
  notes: String,
}, { timestamps: true });

// Auto-set deadline to 30 days after receivedAt
vaultDsarSchema.pre("save", function (next) {
  if (!this.deadline && this.receivedAt) {
    this.deadline = new Date(this.receivedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("VaultDsar", vaultDsarSchema);
