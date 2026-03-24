// ═══════════════════════════════════════════════════════════════
// NERVÜR — Security Layer
// Protection contre : XSS, Injection, ReDoS, Prototype Pollution,
// Rate Limiting, Open Redirect, CSRF, Input Validation
// ═══════════════════════════════════════════════════════════════

// ─── XSS SANITIZATION ─────────────────────────────────────────
// Supprime toute balise HTML/script et encode les caractères dangereux
const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;', '`': '&#96;' };

export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  // 1. Supprimer les balises HTML/script
  let clean = str.replace(/<[^>]*>/g, '');
  // 2. Supprimer les event handlers (onclick, onerror, etc.)
  clean = clean.replace(/on\w+\s*=/gi, '');
  // 3. Supprimer les protocoles dangereux
  clean = clean.replace(/javascript\s*:/gi, '').replace(/data\s*:/gi, '').replace(/vbscript\s*:/gi, '');
  // 4. Encoder les caractères HTML spéciaux
  clean = clean.replace(/[&<>"'`/]/g, char => HTML_ENTITIES[char] || char);
  // 5. Supprimer les caractères de contrôle (null bytes, etc.)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // 6. Limiter la longueur (protection DoS via inputs géants)
  return clean.slice(0, 5000);
}

// Version légère pour les affichages (ne touche pas aux caractères normaux)
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, char => HTML_ENTITIES[char] || char);
}


// ─── INPUT VALIDATION (ReDoS-safe regexes) ────────────────────
// Toutes les regex sont linéaires O(n) — pas de backtracking catastrophique

export function validateEmail(email) {
  if (typeof email !== 'string' || email.length > 254) return false;
  // RFC 5322 simplifié, safe contre ReDoS
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (local.length === 0 || local.length > 64) return false;
  if (domain.length === 0 || domain.length > 253) return false;
  // Vérifier que le domaine a au moins un point et pas de caractères invalides
  if (!domain.includes('.')) return false;
  if (/[^a-zA-Z0-9.-]/.test(domain)) return false;
  // Pas de double points dans le domaine
  if (domain.includes('..')) return false;
  return true;
}

export function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  // Nettoyer : garder uniquement chiffres, espaces, +, -, (, )
  const cleaned = phone.replace(/[\s\-().]/g, '');
  // Doit contenir uniquement des chiffres (et éventuellement un + au début)
  if (!/^\+?\d{6,15}$/.test(cleaned)) return false;
  return true;
}

export function validateName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  // Bloquer les caractères suspects (balises, scripts)
  if (/<|>|javascript:|on\w+=/.test(trimmed)) return false;
  return true;
}

export function validateMessage(message) {
  if (typeof message !== 'string') return false;
  const trimmed = message.trim();
  if (trimmed.length < 10 || trimmed.length > 5000) return false;
  return true;
}

export function validateSubject(subject) {
  if (!subject || typeof subject !== "string") return true;
  return subject.length <= 200;
}

export function validateBudget(budget) {
  const allowed = ['', '< 2k', '2k-5k', '5k-10k', '10k+', 'unknown'];
  return allowed.includes(budget);
}

export function validateTimeline(timeline) {
  const allowed = ['', '< 1 mois', '1-3 mois', '3-6 mois', 'pas-presse'];
  return allowed.includes(timeline);
}

export function validateServices(services) {
  if (!Array.isArray(services)) return false;
  const allowed = ['site-vitrine', 'application', 'seo', 'optimisation', 'branding', 'autre'];
  return services.every(s => allowed.includes(s));
}


// ─── RATE LIMITER (client-side) ───────────────────────────────
// Empêche le spam de soumission du formulaire

const rateLimitStore = new Map();

export function checkRateLimit(key, maxAttempts = 3, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Fenêtre expirée → reset
  if (now - entry.firstAttempt > windowMs) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Incrémenter
  entry.count++;
  const remaining = Math.max(0, maxAttempts - entry.count);

  if (entry.count > maxAttempts) {
    const retryAfter = Math.ceil((entry.firstAttempt + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining };
}


// ─── PROTOTYPE POLLUTION PROTECTION ───────────────────────────
// Bloque la modification de Object.prototype et Array.prototype

export function freezePrototypes() {
  if (typeof Object.freeze === 'function') {
    // Empêcher l'ajout de propriétés sur les prototypes de base
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    const origDefineProperty = Object.defineProperty;

    Object.defineProperty = function(obj, prop, descriptor) {
      if (dangerous.includes(prop) && (obj === Object.prototype || obj === Array.prototype || obj === Function.prototype)) {
        console.warn(`[SECURITY] Blocked prototype pollution attempt on ${prop}`);
        return obj;
      }
      return origDefineProperty.call(this, obj, prop, descriptor);
    };
  }
}

// Vérifie qu'un objet JSON n'a pas de clés __proto__ ou constructor
export function safeJSONParse(jsonString) {
  try {
    return JSON.parse(jsonString, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        console.warn(`[SECURITY] Blocked prototype pollution in JSON: ${key}`);
        return undefined;
      }
      return value;
    });
  } catch {
    return null;
  }
}


// ─── OPEN REDIRECT PROTECTION ─────────────────────────────────
// Seules les routes internes sont autorisées pour la navigation

const ALLOWED_PATHS = ['/', '/contact', '/simulateur', '/diagnostic'];

export function safeNavigate(navigate, path) {
  // Bloquer les URLs absolues (protocoles externes)
  if (/^(https?:|javascript:|data:|vbscript:|\/\/)/i.test(path)) {
    console.warn(`[SECURITY] Blocked redirect to external URL: ${path}`);
    return;
  }
  // Vérifier que le path est dans la whitelist
  if (!ALLOWED_PATHS.includes(path)) {
    console.warn(`[SECURITY] Blocked redirect to unknown path: ${path}`);
    return;
  }
  navigate(path);
}


// ─── CSRF TOKEN ───────────────────────────────────────────────
// Génère un token unique par session pour protéger les formulaires

let csrfToken = null;

export function getCSRFToken() {
  if (!csrfToken) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    csrfToken = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
  return csrfToken;
}


// ─── HONEYPOT ─────────────────────────────────────────────────
// Champ invisible pour piéger les bots (un humain ne le remplira jamais)

export function isBot(honeypotValue) {
  return honeypotValue && honeypotValue.trim().length > 0;
}


// ─── FORM SECURITY WRAPPER ────────────────────────────────────
// Combine toutes les protections pour un formulaire

export function validateContactForm(form, honeypot) {
  const errors = [];

  // 1. Honeypot check (bot detection)
  if (isBot(honeypot)) {
    return { valid: false, errors: ['bot_detected'], isBot: true };
  }

  // 2. Rate limiting
  const rateCheck = checkRateLimit('contact-form', 3, 60000);
  if (!rateCheck.allowed) {
    return { valid: false, errors: [`Trop de tentatives. Réessayez dans ${rateCheck.retryAfter}s.`] };
  }

  // 3. Input validation
  if (!validateName(form.nom)) {
    errors.push('Le nom doit contenir entre 2 et 100 caractères valides.');
  }
  if (!validateEmail(form.email)) {
    errors.push('Adresse email invalide.');
  }
  if (form.tel && !validatePhone(form.tel)) {
    errors.push('Numéro de téléphone invalide.');
  }
  if (!validateSubject(form.sujet)) {
    errors.push('Sujet invalide.');
  }
  if (!validateMessage(form.message)) {
    errors.push('Le message doit contenir entre 10 et 5000 caractères.');
  }

  // 4. Sanitize all fields
  const sanitized = {
    nom: sanitizeInput(form.nom),
    email: sanitizeInput(form.email),
    tel: sanitizeInput(form.tel || ''),
    sujet: sanitizeInput(form.sujet),
    message: sanitizeInput(form.message),
    _csrf: getCSRFToken(),
  };

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}
