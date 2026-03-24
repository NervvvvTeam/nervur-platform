const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Nom, email et message sont requis." });
    }
    if (typeof name !== "string" || name.length > 200) {
      return res.status(400).json({ error: "Nom invalide." });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Email invalide." });
    }
    if (typeof message !== "string" || message.length > 5000) {
      return res.status(400).json({ error: "Message trop long (max 5000 caractères)." });
    }

    // Try Resend first
    if (process.env.RESEND_API_KEY) {
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "NERVÜR Contact <onboarding@resend.dev>",
        to: "contact@nervurpro.com",
        replyTo: email,
        subject: `[NERVÜR] ${subject || "Nouveau message"} — ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #6366f1;">Nouveau message depuis nervur.fr</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold; color: #666;">Nom</td><td style="padding: 8px;">${name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #666;">Email</td><td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Téléphone</td><td style="padding: 8px;">${phone}</td></tr>` : ""}
              <tr><td style="padding: 8px; font-weight: bold; color: #666;">Sujet</td><td style="padding: 8px;">${subject || "Non précisé"}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
              <p style="color: #333; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">Envoyé depuis le formulaire de contact nervur.fr</p>
          </div>
        `,
      });
    } else {
      // Fallback: just log
      console.log("[Contact] No RESEND_API_KEY, logging message:", { name, email, subject, message });
    }

    res.json({ success: true, message: "Message envoyé avec succès." });
  } catch (err) {
    console.error("[Contact] Error:", err.message);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
});

module.exports = router;
