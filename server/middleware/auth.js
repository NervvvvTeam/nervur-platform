const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("[SECURITY] JWT_SECRET non défini — le serveur ne démarrera pas sans.");
  process.exit(1);
}

// ═══ Verify JWT token middleware ═══
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" });
  }

  const token = header.split(" ")[1];

  // Reject obviously malformed tokens (should have 3 dot-separated parts)
  if (!token || token.split(".").length !== 3) {
    return res.status(401).json({ error: "Token malformé" });
  }

  try {
    // jwt.verify already checks expiry (exp claim) and throws TokenExpiredError if past
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"], // Restrict to expected algorithm — prevents "none" algorithm attack
      maxAge: "24h",         // Additional server-side max age enforcement
    });

    // ── Payload validation: ensure required fields are present and valid ──
    if (!decoded.userId) {
      return res.status(401).json({ error: "Token invalide : userId manquant" });
    }

    // Validate that userId is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ error: "Token invalide : userId malformé" });
    }

    if (!decoded.role || !["admin", "client"].includes(decoded.role)) {
      return res.status(401).json({ error: "Token invalide : rôle manquant ou invalide" });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expiré, veuillez vous reconnecter" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token invalide" });
    }
    return res.status(401).json({ error: "Erreur d'authentification" });
  }
}

// ═══ Admin-only middleware (use after authMiddleware) ═══
function adminOnly(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Accès réservé à l'administrateur" });
  }
  next();
}

// ═══ Generate JWT token ═══
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    {
      expiresIn: "24h",
      algorithm: "HS256", // Explicit algorithm to match verification
    }
  );
}

module.exports = { authMiddleware, adminOnly, generateToken, JWT_SECRET };
