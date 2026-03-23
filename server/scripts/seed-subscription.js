/**
 * Seed script — Crée un admin, un client test, et une subscription Sentinel.
 * Usage: node server/scripts/seed-subscription.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI non défini dans server/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connecté");

  // 1. Create admin if none exists
  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    const hash = await bcrypt.hash("Admin1234!", 12);
    admin = await User.create({
      email: "admin@nervur.fr",
      passwordHash: hash,
      name: "Admin NERVÜR",
      role: "admin"
    });
    console.log("Admin créé: admin@nervur.fr / Admin1234!");
  } else {
    console.log(`Admin existant: ${admin.email}`);
  }

  // 2. Create client if none exists
  let client = await User.findOne({ role: "client" });
  if (!client) {
    const hash = await bcrypt.hash("Client1234!", 12);
    client = await User.create({
      email: "demo@nervur.fr",
      passwordHash: hash,
      name: "Client Démo",
      role: "client"
    });
    console.log("Client créé: demo@nervur.fr / Client1234!");
  } else {
    console.log(`Client existant: ${client.name} (${client.email})`);
  }

  // 3. Create Sentinel subscription if none
  const existing = await Subscription.findOne({ userId: client._id, toolId: "sentinel" });
  if (existing) {
    console.log(`Subscription Sentinel déjà existante (status: ${existing.status})`);
  } else {
    await Subscription.create({
      userId: client._id,
      toolId: "sentinel",
      plan: "starter",
      status: "active",
      startDate: new Date(),
    });
    console.log("Subscription Sentinel créée (active, plan starter)");
  }

  // Show summary
  const subs = await Subscription.find({ userId: client._id });
  console.log("\n=== Résumé ===");
  console.log(`Client: ${client.name} (${client.email})`);
  console.log("Subscriptions:");
  subs.forEach(s => console.log(`  - ${s.toolId}: ${s.status} (${s.plan})`));

  await mongoose.disconnect();
  console.log("\nDone. Connectez-vous avec demo@nervur.fr / Client1234!");
}

seed().catch(err => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
