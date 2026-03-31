const mongoose = require("mongoose");

const vaultCompanySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  nomEntreprise: { type: String, required: true },
  formeJuridique: String,
  adresse: String,
  siret: String,
  email: { type: String, required: true },
  telephone: String,
  activite: String,
  siteUrl: String,
  hebergeur: String,
  directeurPublication: String,
  capitalSocial: String,
  rcsVille: String,
  dpoName: String,
  dpoEmail: String,
}, { timestamps: true });

module.exports = mongoose.model("VaultCompany", vaultCompanySchema);
