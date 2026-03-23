const express = require("express");
const { generateWithAI } = require("../services/ai");
const { authMiddleware } = require("../middleware/auth");
const Contact = require("../models/Contact");
const Campaign = require("../models/Campaign");
const mongoose = require("mongoose");
const router = express.Router();

router.use(authMiddleware);

// ═══ Helpers ═══

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeString(str, maxLen = 200) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLen);
}

function getUserId(req) {
  return req.userId;
}

// ═══════════════════════════════════
// CONTACTS
// ═══════════════════════════════════

// GET /contacts — List all contacts
router.get("/contacts", async (req, res) => {
  try {
    const uid = getUserId(req);
    const { list, status, search } = req.query;
    const query = { userId: uid };

    if (list && typeof list === "string") {
      query.listName = sanitizeString(list, 100);
    }
    if (status && typeof status === "string") {
      const validStatuses = ["active", "unsubscribed", "bounced"];
      if (validStatuses.includes(status)) {
        query.status = status;
      }
    }
    if (search && typeof search === "string") {
      const safeSearch = escapeRegex(sanitizeString(search, 100));
      if (safeSearch.length > 0) {
        query.$or = [
          { email: { $regex: safeSearch, $options: "i" } },
          { firstName: { $regex: safeSearch, $options: "i" } },
          { lastName: { $regex: safeSearch, $options: "i" } },
          { company: { $regex: safeSearch, $options: "i" } },
        ];
      }
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 }).limit(500);
    const lists = await Contact.distinct("listName", { userId: uid });
    const total = await Contact.countDocuments({ userId: uid });
    const active = await Contact.countDocuments({ userId: uid, status: "active" });

    res.json({ contacts, lists, total, active });
  } catch (err) {
    console.error("[Nexus Email] Contacts list error:", err.message);
    res.status(500).json({ error: "Erreur lors de la recuperation des contacts" });
  }
});

// POST /contacts — Add single contact
router.post("/contacts", async (req, res) => {
  try {
    const uid = getUserId(req);
    const { email, firstName, lastName, company, listName, tags } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email requis" });
    }
    const trimmedEmail = email.toLowerCase().trim();
    if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({ error: "Format d'email invalide" });
    }

    const contact = await Contact.findOneAndUpdate(
      { userId: uid, email: trimmedEmail },
      {
        userId: uid,
        email: trimmedEmail,
        firstName: sanitizeString(firstName || "", 100),
        lastName: sanitizeString(lastName || "", 100),
        company: sanitizeString(company || "", 200),
        listName: sanitizeString(listName || "Tous les contacts", 100),
        tags: Array.isArray(tags) ? tags.slice(0, 20).map(t => sanitizeString(String(t), 50)) : [],
        status: "active",
      },
      { upsert: true, new: true }
    );

    res.json(contact);
  } catch (err) {
    console.error("[Nexus Email] Contact create error:", err.message);
    res.status(500).json({ error: "Erreur lors de l'ajout du contact" });
  }
});

// POST /contacts/import — Import CSV contacts
router.post("/contacts/import", async (req, res) => {
  try {
    const uid = getUserId(req);
    const { contacts, listName } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: "Liste de contacts requise (tableau)" });
    }
    if (contacts.length > 5000) {
      return res.status(400).json({ error: "Maximum 5000 contacts par import" });
    }

    let imported = 0;
    let skipped = 0;
    const safeListName = sanitizeString(listName || "Tous les contacts", 100);

    for (const c of contacts) {
      if (!c.email || typeof c.email !== "string") { skipped++; continue; }
      const trimmedEmail = c.email.toLowerCase().trim();
      if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        skipped++;
        continue;
      }
      try {
        await Contact.findOneAndUpdate(
          { userId: uid, email: trimmedEmail },
          {
            userId: uid,
            email: trimmedEmail,
            firstName: sanitizeString(c.firstName || c.prenom || c.first_name || "", 100),
            lastName: sanitizeString(c.lastName || c.nom || c.last_name || "", 100),
            company: sanitizeString(c.company || c.entreprise || "", 200),
            listName: safeListName,
            tags: Array.isArray(c.tags) ? c.tags.slice(0, 20).map(t => sanitizeString(String(t), 50)) : [],
            status: "active",
          },
          { upsert: true }
        );
        imported++;
      } catch { skipped++; }
    }

    res.json({ imported, skipped, total: contacts.length });
  } catch (err) {
    console.error("[Nexus Email] Import error:", err.message);
    res.status(500).json({ error: "Erreur lors de l'import" });
  }
});

// DELETE /contacts/:id — Delete contact
router.delete("/contacts/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const uid = getUserId(req);
    await Contact.deleteOne({ _id: req.params.id, userId: uid });
    res.json({ success: true });
  } catch (err) {
    console.error("[Nexus Email] Contact delete error:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// GET /contacts/lists — Get all list names with counts
router.get("/contacts/lists", async (req, res) => {
  try {
    const uid = getUserId(req);
    const lists = await Contact.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(uid) } },
      { $group: { _id: "$listName", count: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ lists: lists.map(l => ({ name: l._id, count: l.count, active: l.active })) });
  } catch (err) {
    console.error("[Nexus Email] Lists error:", err.message);
    res.status(500).json({ error: "Erreur lors de la recuperation des listes" });
  }
});

// ═══════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════

// GET /campaigns — List all campaigns
router.get("/campaigns", async (req, res) => {
  try {
    const uid = getUserId(req);
    const campaigns = await Campaign.find({ userId: uid }).sort({ createdAt: -1 }).limit(50);
    res.json({ campaigns });
  } catch (err) {
    console.error("[Nexus Email] Campaigns list error:", err.message);
    res.status(500).json({ error: "Erreur lors de la recuperation des campagnes" });
  }
});

// POST /campaigns — Create campaign (draft)
router.post("/campaigns", async (req, res) => {
  try {
    const uid = getUserId(req);
    const { name, subject, htmlContent, textContent, fromName, listName } = req.body;

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return res.status(400).json({ error: "Sujet requis" });
    }
    if (!htmlContent || typeof htmlContent !== "string" || htmlContent.trim().length === 0) {
      return res.status(400).json({ error: "Contenu HTML requis" });
    }
    if (subject.length > 200) {
      return res.status(400).json({ error: "Le sujet ne doit pas depasser 200 caracteres" });
    }
    if (htmlContent.length > 500000) {
      return res.status(400).json({ error: "Le contenu est trop volumineux" });
    }

    const campaign = await Campaign.create({
      userId: uid,
      name: sanitizeString(name || subject, 200),
      subject: subject.trim(),
      htmlContent,
      textContent: typeof textContent === "string" ? textContent.slice(0, 500000) : "",
      fromName: sanitizeString(fromName || "NERVUR", 100),
      listName: sanitizeString(listName || "Tous les contacts", 100),
      status: "draft",
    });

    res.json(campaign);
  } catch (err) {
    console.error("[Nexus Email] Campaign create error:", err.message);
    res.status(500).json({ error: "Erreur lors de la creation de la campagne" });
  }
});

// POST /campaigns/:id/send — Send campaign
router.post("/campaigns/:id/send", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const uid = getUserId(req);
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: uid });
    if (!campaign) return res.status(404).json({ error: "Campagne non trouvee" });
    if (campaign.status === "sent") return res.status(400).json({ error: "Campagne deja envoyee" });

    // Get contacts from the list
    const contacts = await Contact.find({
      userId: uid,
      listName: campaign.listName,
      status: "active",
    });

    if (contacts.length === 0) return res.status(400).json({ error: "Aucun contact actif dans cette liste" });

    // Send via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(503).json({ error: "Cle Resend non configuree. Ajoutez RESEND_API_KEY dans .env" });
    }

    const { Resend } = require("resend");
    const resend = new Resend(resendKey);
    const resendIds = [];
    let sentCount = 0;
    let failedCount = 0;

    // Send in batches of 10
    for (let i = 0; i < contacts.length; i += 10) {
      const batch = contacts.slice(i, i + 10);
      const promises = batch.map(async (contact) => {
        try {
          const personalizedHtml = campaign.htmlContent
            .replace(/\{\{prenom\}\}/g, contact.firstName || "")
            .replace(/\{\{nom\}\}/g, contact.lastName || "")
            .replace(/\{\{entreprise\}\}/g, contact.company || "")
            .replace(/\{\{email\}\}/g, contact.email);

          const personalizedSubject = campaign.subject
            .replace(/\{\{prenom\}\}/g, contact.firstName || "")
            .replace(/\{\{nom\}\}/g, contact.lastName || "");

          const result = await resend.emails.send({
            from: `${campaign.fromName} <onboarding@resend.dev>`,
            to: contact.email,
            subject: personalizedSubject,
            html: personalizedHtml,
          });

          if (result.data?.id) {
            resendIds.push(result.data.id);
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (sendErr) {
          console.error(`[Nexus Email] Envoi echoue pour ${contact.email}:`, sendErr.message);
          failedCount++;
        }
      });

      await Promise.all(promises);
    }

    // Update campaign
    campaign.status = "sent";
    campaign.sentAt = new Date();
    campaign.resendIds = resendIds;
    campaign.stats.sent = sentCount;
    campaign.stats.delivered = sentCount;
    await campaign.save();

    res.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: contacts.length,
    });
  } catch (err) {
    console.error("[Nexus Email] Erreur d'envoi:", err.message);
    res.status(500).json({ error: "Erreur lors de l'envoi" });
  }
});

// GET /campaigns/:id — Get campaign detail
router.get("/campaigns/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const uid = getUserId(req);
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: uid });
    if (!campaign) return res.status(404).json({ error: "Campagne non trouvee" });
    res.json(campaign);
  } catch (err) {
    console.error("[Nexus Email] Campaign get error:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /campaigns/:id — Delete campaign
router.delete("/campaigns/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const uid = getUserId(req);
    await Campaign.deleteOne({ _id: req.params.id, userId: uid });
    res.json({ success: true });
  } catch (err) {
    console.error("[Nexus Email] Campaign delete error:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ═══════════════════════════════════
// AI EMAIL GENERATION
// ═══════════════════════════════════

// POST /generate-email — Generate email content with AI
router.post("/generate-email", async (req, res) => {
  try {
    const { objective, companyName, audience, tone, product } = req.body;
    if (!objective || typeof objective !== "string" || objective.trim().length === 0) {
      return res.status(400).json({ error: "Objectif requis" });
    }
    if (objective.length > 500) {
      return res.status(400).json({ error: "L'objectif ne doit pas depasser 500 caracteres" });
    }

    const prompt = `Tu es un expert en email marketing francais. Genere un email professionnel :
- Entreprise : ${sanitizeString(companyName || "Entreprise", 200)}
- Objectif : ${sanitizeString(objective, 500)}
- Audience : ${sanitizeString(audience || "Prospects", 200)}
- Ton : ${sanitizeString(tone || "Professionnel", 50)}
${product ? `- Produit/Service : ${sanitizeString(product, 200)}` : ""}

Retourne un JSON :
{
  "subject": "[objet accrocheur, max 60 caracteres]",
  "html": "[contenu HTML complet de l'email avec mise en forme, bouton CTA. Utilise des styles inline. Variables disponibles: {{prenom}}, {{nom}}, {{entreprise}}. Design clean, mobile-friendly.]",
  "textContent": "[version texte brut de l'email]"
}

Le HTML doit etre un email complet avec :
- Header avec logo/nom entreprise
- Corps du message structure
- Bouton CTA visible
- Footer avec lien de desinscription
- Design responsive, styles inline
- Couleurs : fond blanc, texte sombre, CTA en couleur

Retourne UNIQUEMENT le JSON valide.`;

    const text = await generateWithAI(prompt);
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error("[Nexus Email] Generate error:", err.message);
    res.status(503).json({ error: "IA indisponible, reessayez." });
  }
});

module.exports = router;
