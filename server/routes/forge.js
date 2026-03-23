const express = require("express");
const jwt = require("jsonwebtoken");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  }
  next();
}

// POST /api/forge/generate — Generate a complete landing page
router.post("/generate", optionalAuth, async (req, res) => {
  const { businessName, sector, objective, description, style, colorScheme } = req.body;
  if (!businessName || typeof businessName !== "string" || businessName.trim().length === 0) {
    return res.status(400).json({ error: "Le nom de l'entreprise est requis." });
  }
  if (!objective || typeof objective !== "string" || objective.trim().length === 0) {
    return res.status(400).json({ error: "L'objectif est requis." });
  }
  if (businessName.length > 200 || (sector && sector.length > 200) || objective.length > 1000) {
    return res.status(400).json({ error: "Un ou plusieurs champs depassent la longueur maximale autorisee." });
  }
  if (description && description.length > 2000) {
    return res.status(400).json({ error: "La description ne doit pas depasser 2000 caracteres." });
  }

  const prompt = `Tu es un expert web designer et developpeur front-end. Cree une landing page COMPLETE et PROFESSIONNELLE en HTML/CSS pour :

ENTREPRISE : ${businessName}
SECTEUR : ${sector || "Non precis\u00e9"}
OBJECTIF : ${objective}
DESCRIPTION : ${description || ""}
STYLE : ${style || "Moderne et clean"}
COULEURS : ${colorScheme || "Sombre avec accent color\u00e9"}

REGLES STRICTES :
1. Genere un fichier HTML complet avec tous les styles inline et en <style> dans le <head>
2. Design RESPONSIVE (mobile-first)
3. SECTIONS obligatoires :
   - Hero avec titre accrocheur, sous-titre, CTA
   - Section benefices (3-4 points forts avec icones Unicode)
   - Section temoignages (2-3 faux temoignages realistes)
   - Section tarifs ou offre
   - CTA final
   - Footer avec coordonnees
4. Typographie : font-family: 'Inter', 'Segoe UI', sans-serif
5. Animations CSS subtiles (fade-in au scroll)
6. Boutons avec hover effects
7. Tout le texte en FRANCAIS
8. Le HTML doit etre COMPLET (de <!DOCTYPE html> a </html>)
9. Pas de JavaScript externe, pas de CDN, tout en inline
10. Design niveau professionnel, pas un template basique

Retourne UNIQUEMENT le code HTML complet, rien d'autre. Pas de \`\`\`html, pas de commentaires avant/apres.`;

  try {
    const html = await generateWithAI(prompt);

    // Clean up potential markdown wrapping
    let cleanHtml = html.trim();
    if (cleanHtml.startsWith("```")) {
      cleanHtml = cleanHtml.replace(/^```html?\n?/, "").replace(/\n?```$/, "");
    }

    res.json({
      html: cleanHtml,
      businessName,
      objective,
      provider: "ai",
    });
  } catch (err) {
    console.error("[Forge] Error:", err.message);
    res.status(503).json({ error: "IA indisponible, r\u00e9essayez." });
  }
});

// POST /api/forge/generate-quote — Generate a professional quote (legacy)
router.post("/generate-quote", optionalAuth, async (req, res) => {
  const { clientName, projectType, items, notes } = req.body;
  if (!clientName || typeof clientName !== "string" || clientName.trim().length === 0) {
    return res.status(400).json({ error: "Le nom du client est requis." });
  }
  if (!projectType || typeof projectType !== "string" || projectType.trim().length === 0) {
    return res.status(400).json({ error: "Le type de projet est requis." });
  }
  if (clientName.length > 200 || projectType.length > 200) {
    return res.status(400).json({ error: "Un champ depasse la longueur maximale autorisee (200 caracteres)." });
  }

  const prompt = `Tu es un expert en gestion commerciale. G\u00e9n\u00e8re un devis professionnel pour :
- Client : ${clientName}
- Type de projet : ${projectType}
- Prestations demand\u00e9es : ${items || "Non pr\u00e9cis\u00e9"}
- Notes : ${notes || "Aucune"}

Retourne un JSON valide :
{
  "reference": "DEV-2026-[nombre aleatoire 4 chiffres]",
  "client": "${clientName}",
  "date": "${new Date().toLocaleDateString('fr-FR')}",
  "validite": "30 jours",
  "lines": [
    { "description": "[prestation]", "quantity": [nombre], "unitPrice": [prix], "total": [quantity * unitPrice] }
  ],
  "subtotal": [somme des totaux],
  "tax": [20% TVA],
  "total": [TTC],
  "conditions": "[conditions de paiement en 1 phrase]"
}

G\u00e9n\u00e8re 3-5 lignes de prestations r\u00e9alistes. Prix en euros. UNIQUEMENT le JSON.`;

  try {
    const text = await generateWithAI(prompt);
    const quote = JSON.parse(text);
    res.json({ quote, provider: "ai" });
  } catch (err) {
    console.error("[Forge] Quote error:", err.message);
    res.status(503).json({ error: "IA indisponible, reessayez.", fallback: true });
  }
});

module.exports = router;
