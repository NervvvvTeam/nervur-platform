const express = require("express");
const { generateWithAI } = require("../services/ai");
const router = express.Router();

// Scrape real data from competitor website
async function scrapeWebsite(url) {
  const data = {
    title: "",
    description: "",
    technologies: [],
    headers: {},
    statusCode: 0,
    redirectUrl: null,
    contentLength: 0,
    hasSSL: url.startsWith("https"),
    loadTime: 0,
    metaTags: {},
    links: { internal: 0, external: 0 },
    socialLinks: [],
    structuredData: false,
  };

  const start = Date.now();

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NervurBot/1.0; +https://nervur.fr)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    data.loadTime = Date.now() - start;
    data.statusCode = response.status;
    data.headers = Object.fromEntries(response.headers.entries());
    data.contentLength = parseInt(data.headers["content-length"] || "0");
    data.redirectUrl = response.url !== url ? response.url : null;

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch) data.title = titleMatch[1].trim().substring(0, 200);

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is);
    if (descMatch) data.description = descMatch[1].trim().substring(0, 300);

    // Extract meta keywords
    const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["'](.*?)["']/is);
    if (kwMatch) data.metaTags.keywords = kwMatch[1].trim();

    // Detect technologies from HTML
    const techPatterns = [
      { pattern: /react/i, name: "React" },
      { pattern: /vue\.?js|v-app|v-bind/i, name: "Vue.js" },
      { pattern: /angular/i, name: "Angular" },
      { pattern: /next\.?js|__next/i, name: "Next.js" },
      { pattern: /nuxt/i, name: "Nuxt" },
      { pattern: /wordpress|wp-content/i, name: "WordPress" },
      { pattern: /shopify/i, name: "Shopify" },
      { pattern: /wix\.com/i, name: "Wix" },
      { pattern: /squarespace/i, name: "Squarespace" },
      { pattern: /webflow/i, name: "Webflow" },
      { pattern: /tailwind/i, name: "Tailwind CSS" },
      { pattern: /bootstrap/i, name: "Bootstrap" },
      { pattern: /jquery/i, name: "jQuery" },
      { pattern: /google-analytics|gtag|ga\(/i, name: "Google Analytics" },
      { pattern: /google tag manager|gtm\.js/i, name: "Google Tag Manager" },
      { pattern: /hotjar/i, name: "Hotjar" },
      { pattern: /hubspot/i, name: "HubSpot" },
      { pattern: /intercom/i, name: "Intercom" },
      { pattern: /crisp/i, name: "Crisp" },
      { pattern: /stripe/i, name: "Stripe" },
      { pattern: /cloudflare/i, name: "Cloudflare" },
      { pattern: /vercel/i, name: "Vercel" },
      { pattern: /netlify/i, name: "Netlify" },
    ];
    data.technologies = techPatterns.filter(t => t.pattern.test(html)).map(t => t.name);

    // Server header
    if (data.headers.server) data.technologies.push(`Server: ${data.headers.server}`);

    // Count links
    const linkMatches = html.match(/<a[^>]*href=["'](.*?)["']/gi) || [];
    const domain = new URL(url).hostname;
    linkMatches.forEach(link => {
      const hrefMatch = link.match(/href=["'](.*?)["']/i);
      if (hrefMatch) {
        if (hrefMatch[1].includes(domain) || hrefMatch[1].startsWith("/")) data.links.internal++;
        else if (hrefMatch[1].startsWith("http")) data.links.external++;
      }
    });

    // Social links
    const socialPatterns = [
      { pattern: /linkedin\.com/i, name: "LinkedIn" },
      { pattern: /twitter\.com|x\.com/i, name: "Twitter/X" },
      { pattern: /facebook\.com|fb\.com/i, name: "Facebook" },
      { pattern: /instagram\.com/i, name: "Instagram" },
      { pattern: /youtube\.com/i, name: "YouTube" },
      { pattern: /tiktok\.com/i, name: "TikTok" },
    ];
    socialPatterns.forEach(s => {
      if (s.pattern.test(html)) data.socialLinks.push(s.name);
    });

    // Structured data
    data.structuredData = /application\/ld\+json/i.test(html);

    // Open Graph
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/is);
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/is);
    data.metaTags.ogTitle = ogTitle ? ogTitle[1] : null;
    data.metaTags.hasOgImage = !!ogImage;

  } catch (err) {
    data.error = err.message;
    data.loadTime = Date.now() - start;
  }

  return data;
}

router.post("/scan", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return res.status(400).json({ error: "Le champ 'url' est requis." });
  }
  if (url.length > 2000) {
    return res.status(400).json({ error: "L'URL est trop longue (max 2000 caracteres)." });
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

  // Validate URL format
  try {
    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "URL invalide. Utilisez http ou https." });
    }
  } catch {
    return res.status(400).json({ error: "URL invalide. Exemple : https://exemple.fr" });
  }

  const domain = targetUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  try {

    // REAL scraping of the competitor website
    const siteData = await scrapeWebsite(targetUrl);

    if (siteData.statusCode === 0 && siteData.error) {
      return res.status(503).json({
        error: `Impossible d'acceder a ${domain}: ${siteData.error}`,
        fallback: true,
      });
    }

    // Build a REAL data summary for AI analysis
    const prompt = `Tu es un analyste en veille concurrentielle. Voici les VRAIES donnees scrapees du site "${domain}" :

DONNEES REELLES :
- Titre : ${siteData.title || "Non detecte"}
- Description : ${siteData.description || "Non detectee"}
- Status HTTP : ${siteData.statusCode}
- Temps de chargement : ${siteData.loadTime}ms
- SSL : ${siteData.hasSSL ? "Oui" : "Non"}
- Technologies detectees : ${siteData.technologies.length > 0 ? siteData.technologies.join(", ") : "Aucune detectee"}
- Liens internes : ${siteData.links.internal} | Liens externes : ${siteData.links.external}
- Reseaux sociaux : ${siteData.socialLinks.length > 0 ? siteData.socialLinks.join(", ") : "Aucun detecte"}
- Donnees structurees (JSON-LD) : ${siteData.structuredData ? "Oui" : "Non"}
- Open Graph : ${siteData.metaTags.hasOgImage ? "Image OG presente" : "Pas d'image OG"}
- Redirection : ${siteData.redirectUrl || "Aucune"}
${siteData.contentLength > 0 ? `- Taille page : ${Math.round(siteData.contentLength / 1024)}KB` : ""}

Base sur ces VRAIS donnees, genere un JSON de veille concurrentielle :
{
  "signals": [
    {
      "type": "tech|content|marketing|seo|performance",
      "text": "[signal base sur les VRAIS donnees ci-dessus, 1-2 phrases]",
      "importance": "haute|moyenne|faible",
      "recommendation": "[action recommandee, 1 phrase]"
    }
  ],
  "summary": "[Resume strategique base sur les vrais donnees en 2 phrases]",
  "techStack": "[Resume des technologies detectees]",
  "strengths": [2-3 points forts detectes, strings],
  "weaknesses": [2-3 faiblesses detectees, strings]
}

Genere exactement 5 signaux bases UNIQUEMENT sur les donnees reelles ci-dessus. Ne rien inventer.
Retourne UNIQUEMENT le JSON.`;

    let signals = [];
    let summary = "";
    let techStack = siteData.technologies.join(", ") || "Non detecte";
    let strengths = [];
    let weaknesses = [];

    try {
      const aiText = await generateWithAI(prompt);
      const aiData = JSON.parse(aiText);
      signals = aiData.signals || [];
      summary = aiData.summary || "";
      techStack = aiData.techStack || techStack;
      strengths = aiData.strengths || [];
      weaknesses = aiData.weaknesses || [];
    } catch (aiErr) {
      console.error("[Signal] AI analysis failed, building from raw data:", aiErr.message);
      // Build signals from raw data without AI
      if (siteData.loadTime > 3000) signals.push({ type: "performance", text: `Le site met ${siteData.loadTime}ms a charger — lent par rapport aux standards.`, importance: "haute", recommendation: "Opportunite : leur site est lent, mettez en avant votre rapidite." });
      if (!siteData.hasSSL) signals.push({ type: "seo", text: "Le site n'utilise pas HTTPS — probleme de securite et de SEO.", importance: "haute", recommendation: "Mentionnez la securite comme avantage concurrentiel." });
      if (!siteData.description) signals.push({ type: "seo", text: "Aucune meta description detectee — mauvais pour le SEO.", importance: "moyenne", recommendation: "Assurez-vous que vos metas sont optimisees." });
      if (siteData.socialLinks.length === 0) signals.push({ type: "marketing", text: "Aucun lien vers les reseaux sociaux detecte.", importance: "moyenne", recommendation: "Investissez les reseaux sociaux ou ils sont absents." });
      summary = `${domain} utilise ${techStack || "des technologies non identifiees"}. Temps de chargement : ${siteData.loadTime}ms.`;
    }

    res.json({
      domain,
      signals,
      summary,
      techStack,
      strengths,
      weaknesses,
      rawData: {
        title: siteData.title,
        description: siteData.description,
        statusCode: siteData.statusCode,
        loadTime: siteData.loadTime,
        technologies: siteData.technologies,
        socialLinks: siteData.socialLinks,
        links: siteData.links,
        hasSSL: siteData.hasSSL,
        structuredData: siteData.structuredData,
      },
      provider: "scraping+ai",
      realData: true,
    });

  } catch (err) {
    console.error("[Signal] Erreur:", err.message);
    res.status(503).json({
      error: "Erreur lors de l'analyse du concurrent.",
      fallback: true,
    });
  }
});

module.exports = router;
