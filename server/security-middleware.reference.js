// ═══════════════════════════════════════════════════════════════
// NERVÜR — Express Security Middleware
// À utiliser quand tu mets en place le backend Node.js/Express
//
// Installation requise :
//   npm install helmet express-rate-limit cors hpp
//
// Usage dans ton serveur Express :
//   import { applySecurityMiddleware } from './security-middleware.js'
//   const app = express();
//   applySecurityMiddleware(app);
// ═══════════════════════════════════════════════════════════════

// ─── 1. SECURITY HEADERS (helmet) ─────────────────────────────
// Protection : XSS, Clickjacking, MIME sniffing, CSP, HSTS
export function securityHeaders(app) {
  // Si helmet est installé, l'utiliser
  try {
    const helmet = (await import('helmet')).default;
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],       // Anti-clickjacking
          baseUri: ["'self'"],              // Anti-base tag injection
          formAction: ["'self'"],           // Formulaires uniquement sur le même domaine
          upgradeInsecureRequests: [],      // Force HTTPS
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
    }));
  } catch {
    // Fallback si helmet pas installé
    app.use((req, res, next) => {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
      next();
    });
  }
}


// ─── 2. RATE LIMITING ─────────────────────────────────────────
// Protection : DDoS, Brute force, Spam API, Budget API exhaustion
export function rateLimiting(app) {
  try {
    const rateLimit = (await import('express-rate-limit')).default;

    // Global : 100 requêtes / 15 min par IP
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { error: 'Trop de requêtes. Réessayez dans 15 minutes.' },
      standardHeaders: true,
      legacyHeaders: false,
    }));

    // Strict pour le formulaire de contact : 5 / heure
    app.use('/api/contact', rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 5,
      message: { error: 'Trop de messages envoyés. Réessayez dans 1 heure.' },
    }));

    // Strict pour l'authentification (si implémentée) : 10 / 15 min
    app.use('/api/auth', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { error: 'Trop de tentatives de connexion.' },
    }));
  } catch {
    console.warn('[SECURITY] express-rate-limit not installed. Run: npm install express-rate-limit');
  }
}


// ─── 3. CORS CONFIGURATION ────────────────────────────────────
// Protection : CORS Misconfiguration, Data leakage
export function corsConfig(app) {
  try {
    const cors = (await import('cors')).default;
    app.use(cors({
      origin: process.env.ALLOWED_ORIGIN || 'https://nervur.com',
      methods: ['GET', 'POST'],          // Pas de PUT, DELETE sauf si nécessaire
      allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
      credentials: false,                // Pas de cookies cross-origin
      maxAge: 86400,
    }));
  } catch {
    console.warn('[SECURITY] cors not installed. Run: npm install cors');
  }
}


// ─── 4. INPUT SANITIZATION MIDDLEWARE ──────────────────────────
// Protection : SQL Injection, NoSQL Injection, XSS, Command Injection
export function inputSanitization() {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      sanitizeObject(req.params);
    }
    next();
  };
}

function sanitizeObject(obj) {
  for (const key of Object.keys(obj)) {
    // Protection Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      delete obj[key];
      continue;
    }
    if (typeof obj[key] === 'string') {
      // Strip HTML tags
      obj[key] = obj[key].replace(/<[^>]*>/g, '');
      // Supprimer les null bytes
      obj[key] = obj[key].replace(/\0/g, '');
      // MongoDB NoSQL injection : bloquer $gt, $ne, $where, etc.
      obj[key] = obj[key].replace(/\$[a-zA-Z]+/g, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // NoSQL injection via objets : { "$gt": "" }
      if (Object.keys(obj[key]).some(k => k.startsWith('$'))) {
        obj[key] = '';
      } else {
        sanitizeObject(obj[key]);
      }
    }
  }
}


// ─── 5. HTTP PARAMETER POLLUTION ──────────────────────────────
// Protection : HPP (dupliquer des paramètres pour bypass les filtres)
export function hppProtection(app) {
  try {
    const hpp = (await import('hpp')).default;
    app.use(hpp());
  } catch {
    console.warn('[SECURITY] hpp not installed. Run: npm install hpp');
  }
}


// ─── 6. DIRECTORY TRAVERSAL PROTECTION ────────────────────────
// Protection : Path Traversal, LFI (Local File Inclusion)
export function pathTraversalProtection() {
  return (req, res, next) => {
    const suspicious = /(\.\.[/\\]|%2e%2e|%252e)/i;
    if (suspicious.test(req.url) || suspicious.test(decodeURIComponent(req.url))) {
      return res.status(403).json({ error: 'Accès interdit.' });
    }
    next();
  };
}


// ─── 7. CSRF PROTECTION ──────────────────────────────────────
// Protection : Cross-Site Request Forgery
export function csrfProtection() {
  const tokens = new Map();

  return {
    generateToken: (req, res, next) => {
      const token = crypto.randomUUID();
      tokens.set(token, { created: Date.now(), used: false });
      res.cookie('csrf-token', token, {
        httpOnly: false,     // Le JS frontend doit pouvoir le lire
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,     // 1 heure
      });
      next();
    },

    validateToken: (req, res, next) => {
      const token = req.headers['x-csrf-token'] || req.body?._csrf;
      if (!token || !tokens.has(token)) {
        return res.status(403).json({ error: 'Token CSRF invalide.' });
      }
      const entry = tokens.get(token);
      if (entry.used || Date.now() - entry.created > 3600000) {
        tokens.delete(token);
        return res.status(403).json({ error: 'Token CSRF expiré.' });
      }
      entry.used = true;
      // Nettoyage des tokens expirés
      for (const [key, val] of tokens) {
        if (Date.now() - val.created > 3600000) tokens.delete(key);
      }
      next();
    },
  };
}


// ─── 8. SSRF PROTECTION ──────────────────────────────────────
// Protection : Server-Side Request Forgery
const BLOCKED_HOSTS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^localhost$/i,
  /^metadata\.google\.internal$/i,
  /^169\.254\./,
];

export function isBlockedHost(hostname) {
  return BLOCKED_HOSTS.some(pattern => pattern.test(hostname));
}


// ─── 9. CONTACT FORM ENDPOINT EXAMPLE ─────────────────────────
// Route sécurisée pour le formulaire de contact
export function contactFormRoute(app) {
  app.post('/api/contact', (req, res) => {
    const { nom, email, tel, sujet, message, _csrf } = req.body;

    // Validation stricte côté serveur (NE JAMAIS faire confiance au frontend)
    if (!nom || typeof nom !== 'string' || nom.length < 2 || nom.length > 100) {
      return res.status(400).json({ error: 'Nom invalide.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return res.status(400).json({ error: 'Email invalide.' });
    }
    if (tel && (typeof tel !== 'string' || tel.length > 20)) {
      return res.status(400).json({ error: 'Téléphone invalide.' });
    }
    const allowedSubjects = ['site-vitrine', 'application', 'seo', 'optimisation', 'autre'];
    if (sujet && !allowedSubjects.includes(sujet)) {
      return res.status(400).json({ error: 'Sujet invalide.' });
    }
    if (!message || typeof message !== 'string' || message.length < 10 || message.length > 5000) {
      return res.status(400).json({ error: 'Message invalide (10-5000 caractères).' });
    }

    // Tout est validé et sanitized (via le middleware inputSanitization)
    // → Envoyer l'email, sauvegarder en DB, etc.
    res.json({ success: true, message: 'Message reçu.' });
  });
}


// ─── APPLY ALL ────────────────────────────────────────────────
// Fonction principale : applique toutes les protections d'un coup
export async function applySecurityMiddleware(app) {
  // Parser le body avec limite de taille (protection DoS via gros payloads)
  const express = (await import('express')).default;
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));

  await securityHeaders(app);
  await rateLimiting(app);
  await corsConfig(app);
  await hppProtection(app);
  app.use(pathTraversalProtection());
  app.use(inputSanitization());

  const csrf = csrfProtection();
  app.get('/api/csrf-token', csrf.generateToken, (req, res) => res.json({ ok: true }));
  // Appliquer la validation CSRF sur toutes les routes POST
  app.post('*', csrf.validateToken);
}
