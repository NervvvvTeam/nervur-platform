const express = require("express");
const Subscription = require("../models/Subscription");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// GET /me — Subscriptions actives de l'utilisateur connecté
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.userId,
      status: "active"
    }).select("toolId plan status startDate endDate");

    res.json({ subscriptions });
  } catch (err) {
    console.error("[SUBSCRIPTIONS] Error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
