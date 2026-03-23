const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { authMiddleware, adminOnly, generateToken } = require("../middleware/auth");

const router = express.Router();

// ═══ Input validation helpers ═══
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, 200);
}

// POST /login — Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Generic error to prevent user enumeration
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    // Fetch active subscriptions
    const subscriptions = await Subscription.find({
      userId: user._id,
      status: "active"
    }).select("toolId plan status startDate endDate");

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      subscriptions
    });
  } catch (err) {
    console.error("[AUTH] Login error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /me — Profil utilisateur courant
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const subscriptions = await Subscription.find({
      userId: user._id,
      status: "active"
    }).select("toolId plan status startDate endDate");

    res.json({ user, subscriptions });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /create-user — Admin crée un compte client (protégé)
router.post("/create-user", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { email, password, name, role, tools } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, mot de passe et nom requis" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Le mot de passe doit contenir entre 8 et 128 caractères" });
    }

    const cleanName = sanitizeString(name);
    if (!cleanName) {
      return res.status(400).json({ error: "Nom invalide" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: "Cet email existe déjà" });
    }

    // Only allow "client" role when creating users (prevent privilege escalation)
    const safeRole = role === "admin" ? "admin" : "client";

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: cleanName,
      role: safeRole
    });

    // Create initial subscriptions if tools provided
    if (Array.isArray(tools) && tools.length > 0) {
      const validTools = ["sentinel", "phantom", "nexus"];
      const subs = tools
        .filter(t => validTools.includes(t))
        .map(toolId => ({ userId: user._id, toolId, plan: "starter", status: "active" }));
      if (subs.length > 0) {
        await Subscription.insertMany(subs);
      }
    }

    res.status(201).json({
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error("[AUTH] Create user error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /init-admin — Créer le premier admin (une seule fois, bloqué après)
router.post("/init-admin", async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return res.status(403).json({ error: "Un admin existe déjà" });
    }

    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, mot de passe et nom requis" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Le mot de passe doit contenir entre 8 et 128 caractères" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: sanitizeString(name),
      role: "admin"
    });

    const token = generateToken(admin);
    res.status(201).json({
      token,
      user: { id: admin._id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (err) {
    console.error("[AUTH] Init admin error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
