const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");

const SYSTEM_PROMPT = `Tu es un expert en e-réputation et gestion d'avis clients. Tu travailles pour l'entreprise "{businessName}".

Ton rôle : générer une réponse professionnelle à un avis client.

Règles :
- Ton {tone} (professionnel, amical ou empathique)
- Toujours remercier le client pour son retour
- Si avis négatif : montrer de l'empathie, proposer une solution concrète, inviter à reprendre contact
- Si avis positif : remercier chaleureusement, valoriser la fidélité
- Si avis mixte : reconnaître les points positifs, adresser les points négatifs
- Ne jamais être agressif ou condescendant
- Réponse en français, 80-150 mots maximum
- Ne pas utiliser de formules génériques type "Cher client"
- Signer avec le prénom "L'équipe {businessName}"`;

function detectSentiment(text) {
  const lower = text.toLowerCase();
  const negWords = ["catastroph", "déçu", "nul", "horrible", "mauvais", "pire", "jamais", "désagréable", "problème", "erreur", "inacceptable", "scandale", "honte", "arnaque", "voleur", "attente", "froid", "sale", "lent", "cher"];
  const posWords = ["super", "excellent", "parfait", "incroyable", "bravo", "merci", "génial", "top", "recommande", "satisfait", "ravie", "magnifique", "exceptionnel", "délicieux", "agréable", "accueil"];

  const negCount = negWords.filter(w => lower.includes(w)).length;
  const posCount = posWords.filter(w => lower.includes(w)).length;

  if (negCount > posCount) return "negative";
  if (posCount > negCount) return "positive";
  if (negCount === 0 && posCount === 0) return "negative";
  return "mixed";
}

async function generateWithClaude(review, businessName, tone) {
  const client = new Anthropic();
  const systemPrompt = SYSTEM_PROMPT
    .replace(/\{businessName\}/g, businessName)
    .replace(/\{tone\}/g, tone);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: "user", content: `Voici l'avis client à traiter :\n\n"${review}"` }],
  });

  return message.content[0].text;
}

async function generateWithOpenAI(review, businessName, tone) {
  const client = new OpenAI();
  const systemPrompt = SYSTEM_PROMPT
    .replace(/\{businessName\}/g, businessName)
    .replace(/\{tone\}/g, tone);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Voici l'avis client à traiter :\n\n"${review}"` },
    ],
  });

  return completion.choices[0].message.content;
}

async function generateResponse(review, businessName = "Votre Entreprise", tone = "professional") {
  const sentiment = detectSentiment(review);
  let response;
  let provider;

  // Try Claude first
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "sk-ant-...") {
    try {
      response = await generateWithClaude(review, businessName, tone);
      provider = "claude";
    } catch (err) {
      console.error("[Sentinel] Claude API error:", err.message);
    }
  }

  // Fallback to OpenAI
  if (!response && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-...") {
    try {
      response = await generateWithOpenAI(review, businessName, tone);
      provider = "openai";
    } catch (err) {
      console.error("[Sentinel] OpenAI API error:", err.message);
    }
  }

  // If both fail, throw
  if (!response) {
    throw new Error("NO_API_AVAILABLE");
  }

  return { response, provider, sentiment };
}

// Generic AI generation function (used by all tools)
async function generateWithAI(prompt) {
  let result;

  // Try Claude first
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "sk-ant-...") {
    try {
      const client = new Anthropic();
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      result = message.content[0].text;
    } catch (err) {
      console.error("[AI] Claude error:", err.message);
    }
  }

  // Fallback to OpenAI
  if (!result && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-...") {
    try {
      const client = new OpenAI();
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      result = completion.choices[0].message.content;
    } catch (err) {
      console.error("[AI] OpenAI error:", err.message);
    }
  }

  if (!result) throw new Error("NO_API_AVAILABLE");

  // Clean markdown code blocks if present
  result = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return result;
}

// ═══ SENTINEL DASHBOARD — Réponses IA adaptées au secteur ═══

const SECTOR_CONTEXT = {
  restaurant: "Tu travailles pour un restaurant. Utilise un vocabulaire culinaire approprié (plats, saveurs, service en salle, chef). Propose de revenir déguster un nouveau plat si pertinent.",
  hotel: "Tu travailles pour un hôtel. Mentionne le confort, le séjour, le bien-être des clients. Propose une attention particulière lors du prochain séjour.",
  garage: "Tu travailles pour un garage automobile. Utilise un ton technique mais accessible. Mentionne la sécurité et la fiabilité du véhicule.",
  salon: "Tu travailles pour un salon de coiffure/beauté. Mentionne le bien-être, la détente, le résultat. Propose un soin complémentaire.",
  commerce: "Tu travailles pour un commerce de détail. Mentionne la qualité des produits et le conseil personnalisé.",
  medical: "Tu travailles pour un cabinet médical/dentaire. Ton empathique et rassurant. Mentionne la prise en charge, l'écoute, la santé.",
  immobilier: "Tu travailles pour une agence immobilière. Mentionne l'accompagnement, la confiance, le projet de vie.",
  autre: "Adapte ton vocabulaire au contexte professionnel de l'entreprise."
};

async function generateReviewResponse(review, business) {
  const sectorCtx = SECTOR_CONTEXT[business.sector] || SECTOR_CONTEXT.autre;

  const systemPrompt = `Tu es un expert en e-réputation. Tu travailles pour "${business.businessName}" (secteur : ${business.sector}).

${sectorCtx}

Règles :
- Analyse le sentiment de l'avis (positif, négatif, mixte)
- Génère une réponse professionnelle et personnalisée
- Avis négatif : empathie + solution concrète + invitation à reprendre contact
- Avis positif : remerciement chaleureux + valorisation de la fidélité
- Avis mixte : reconnaître le positif + adresser le négatif constructivement
- Français, 80-150 mots maximum
- Ne pas utiliser "Cher client" ni formules génériques
- Signer "L'équipe ${business.businessName}"
- Ne JAMAIS inventer de faits sur l'entreprise`;

  const userMsg = `Avis client (${review.rating}/5 étoiles) par ${review.authorName} :\n\n"${review.text || "(Avis sans texte, uniquement une note)"}"`;

  let response, provider;

  // Try OpenAI (GPT) first for review responses
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-...") {
    try {
      const client = new OpenAI();
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
      });
      response = completion.choices[0].message.content;
      provider = "openai";
    } catch (err) {
      console.error("[SENTINEL-APP] OpenAI error:", err.message);
    }
  }

  // Fallback Claude
  if (!response && process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "sk-ant-...") {
    try {
      const client = new Anthropic();
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      });
      response = message.content[0].text;
      provider = "claude";
    } catch (err) {
      console.error("[SENTINEL-APP] Claude error:", err.message);
    }
  }

  if (!response) throw new Error("NO_API_AVAILABLE");

  return { response, provider };
}

module.exports = { generateResponse, detectSentiment, generateWithAI, generateReviewResponse };
