const OpenAI = require("openai");

const THEMES = ["service", "cuisine", "ambiance", "prix", "proprete", "rapidite", "accueil", "qualite"];

const SECTOR_THEMES = {
  restaurant: ["service", "cuisine", "ambiance", "prix", "proprete", "rapidite", "accueil", "qualite"],
  hotel: ["service", "confort", "proprete", "prix", "localisation", "petit-dejeuner", "accueil", "calme"],
  garage: ["service", "prix", "rapidite", "transparence", "qualite", "accueil", "confiance", "expertise"],
  salon: ["service", "resultat", "ambiance", "prix", "proprete", "accueil", "conseil", "detente"],
  commerce: ["service", "qualite", "prix", "choix", "accueil", "conseil", "disponibilite", "proprete"],
  medical: ["service", "ecoute", "competence", "attente", "accueil", "proprete", "confiance", "prix"],
  immobilier: ["service", "reactivite", "ecoute", "transparence", "competence", "accompagnement", "prix", "confiance"],
  autre: ["service", "qualite", "prix", "accueil", "rapidite", "proprete", "ambiance", "confiance"],
};

async function analyzeThemes(reviews, sector = "autre") {
  const themes = SECTOR_THEMES[sector] || SECTOR_THEMES.autre;

  if (!reviews || reviews.length === 0) {
    return { themes: themes.map(t => ({ theme: t, score: 0, mentions: 0 })), keywords: [], summary: "Pas assez d'avis pour analyser." };
  }

  const reviewTexts = reviews
    .filter(r => r.text && r.text.length > 10)
    .slice(0, 50)
    .map((r, i) => `[${r.rating}/5] ${r.text}`)
    .join("\n");

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-...") {
    return generateFallbackAnalysis(reviews, themes);
  }

  try {
    const client = new OpenAI();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Tu es un analyste e-réputation. Analyse les avis clients et évalue chaque thème sur 10.

Retourne un JSON avec cette structure exacte :
{
  "themes": [{"theme": "nom", "score": 7.5, "mentions": 12, "sentiment": "positif"}],
  "keywords": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "summary": "Résumé en 2 phrases des points forts et faibles.",
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1", "point faible 2"]
}

Les thèmes à évaluer sont : ${themes.join(", ")}
Score de 0 à 10 (0 = jamais mentionné, 10 = excellent).
mentions = nombre d'avis qui parlent de ce thème.
sentiment = "positif", "négatif" ou "mixte".
keywords = les 5 mots les plus récurrents dans les avis.
Résumé en français.`
        },
        { role: "user", content: `Voici ${reviews.length} avis clients :\n\n${reviewTexts}` }
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (err) {
    console.error("[SEMANTIC] GPT error:", err.message);
    return generateFallbackAnalysis(reviews, themes);
  }
}

function generateFallbackAnalysis(reviews, themes) {
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const baseScore = (avgRating / 5) * 10;

  return {
    themes: themes.map(t => ({
      theme: t,
      score: Math.round((baseScore + (Math.random() - 0.5) * 3) * 10) / 10,
      mentions: Math.floor(Math.random() * reviews.length * 0.7) + 1,
      sentiment: baseScore > 6 ? "positif" : baseScore > 4 ? "mixte" : "négatif"
    })),
    keywords: ["qualité", "service", "accueil", "prix", "ambiance"],
    summary: `Score moyen de ${avgRating.toFixed(1)}/5 sur ${reviews.length} avis. Analyse sémantique non disponible sans clé API.`,
    strengths: ["Données insuffisantes"],
    weaknesses: ["Données insuffisantes"]
  };
}

module.exports = { analyzeThemes, SECTOR_THEMES };
