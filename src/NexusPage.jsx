import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

const V = "#FFFFFF", V2 = "#D4D4D8", V3 = "#A1A1AA";
const VG = (a) => `rgba(255,255,255,${a})`;
const A1 = "#818CF8", A2 = "#4ADE80", A3 = "#F472B6";

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

const CONTENT_TYPES = ["Post LinkedIn", "Email Marketing", "Description Produit", "Post Instagram"];
const TONES = ["Professionnel", "Décontracté", "Inspirant", "Persuasif"];

const FALLBACK_TEMPLATES = {
  "Post LinkedIn": {
    "Professionnel": "Chez {company}, nous croyons que {topic} est un levier stratégique incontournable.\n\nAprès 6 mois d'analyse terrain, voici ce que nous avons constaté :\n- Les entreprises qui investissent dans {topic} voient leur productivité augmenter de 34%\n- 78% des décideurs considèrent {topic} comme priorité n.1 en 2026\n- Le ROI moyen constaté est de x2.8 sur 12 mois\n\nNotre approche ? Combiner expertise humaine et intelligence artificielle pour maximiser chaque action.\n\nEt vous, où en êtes-vous sur {topic} ?\n\n#Innovation #Stratégie #IA",
    "Décontracté": "On ne va pas se mentir... {topic}, ça change la donne.\n\nChez {company}, on a testé. On a itéré. Et les résultats parlent d'eux-mêmes.\n\nLe secret ? Pas de formule magique - juste une exécution solide et une équipe qui y croit.\n\nSi {topic} est sur votre radar, on devrait en parler.\n\n#Business #Growth #LetsGo",
    "Inspirant": "Il y a 12 mois, {company} a fait un pari audacieux sur {topic}.\n\nAujourd'hui, les résultats dépassent toutes nos projections.\n\nCe que cette expérience nous a appris : le courage de transformer précède toujours la récompense. Chaque entreprise qui ose repenser ses fondamentaux autour de {topic} ouvre la porte à un potentiel inexploité.\n\nLe futur appartient à ceux qui agissent maintenant.\n\n#Transformation #Vision #Leadership",
    "Persuasif": "93% des entreprises qui ignorent {topic} perdent des parts de marché chaque trimestre.\n\nChez {company}, nous avons développé une méthodologie propriétaire qui transforme {topic} en avantage concurrentiel mesurable.\n\nRésultats clients :\n- +47% de leads qualifiés\n- -30% de coût d'acquisition\n- x2.1 de taux de conversion\n\nPrêt à passer à l'action ? Lien en commentaire.",
  },
  "Email Marketing": {
    "Professionnel": "Objet : {topic} - Une opportunité stratégique pour votre entreprise\n\nBonjour,\n\nL'équipe {company} se permet de vous contacter car nous savons que {topic} est un enjeu majeur pour les entreprises de votre secteur.\n\nNous avons accompagné plus de 120 entreprises dans leur transformation, avec un taux de satisfaction de 96%.\n\nSeriez-vous disponible pour un échange de 15 minutes cette semaine ?\n\nCordialement,\nL'équipe {company}",
    "Décontracté": "Objet : {topic} - On en parle ?\n\nHey !\n\nOn sait que votre temps est précieux, alors on va droit au but : {company} aide les entreprises comme la vôtre à tirer le meilleur de {topic}.\n\nPas de blabla, juste des résultats concrets.\n\nUn café virtuel pour en discuter ?\n\nÀ très vite,\n{company}",
    "Inspirant": "Objet : Imaginez ce que {topic} pourrait transformer dans votre entreprise\n\nBonjour,\n\nEt si {topic} devenait votre plus grand atout ?\n\nChez {company}, nous avons vu des entreprises passer de l'incertitude à la croissance exponentielle en adoptant une approche innovante de {topic}.\n\nChaque grande transformation commence par une conversation.\n\nPrêt à écrire le prochain chapitre ?\n\nAvec ambition,\n{company}",
    "Persuasif": "Objet : Vos concurrents investissent déjà dans {topic}. Et vous ?\n\nBonjour,\n\nLes chiffres sont sans appel : les entreprises qui n'investissent pas dans {topic} perdent en moyenne 23% de compétitivité par an.\n\n{company} propose une solution clé en main avec :\n- Déploiement en 48h\n- ROI mesurable dès le 1er mois\n- Accompagnement dédié\n\nNe laissez pas la concurrence prendre de l'avance.\n\nRéservez votre démo : [lien]\n\n{company}",
  },
  "Description Produit": {
    "Professionnel": "Découvrez {topic} par {company} - la solution de référence pour les professionnels exigeants.\n\nConçu pour répondre aux besoins des entreprises modernes, {topic} combine performance, fiabilité et simplicité d'utilisation.\n\nCaractéristiques clés :\n- Architecture de dernière génération\n- Interface intuitive et personnalisable\n- Support premium 24/7\n- Intégrations natives avec vos outils existants\n\nRejoignez les 2 400+ entreprises qui font confiance à {company}.",
    "Décontracté": "{topic} by {company} - Enfin un produit qui fait ce qu'il promet.\n\nOn l'a conçu pour être simple, efficace et agréable à utiliser. Pas de menus cachés, pas de fonctionnalités inutiles. Juste ce dont vous avez besoin, quand vous en avez besoin.\n\nTestez-le 14 jours gratuitement - on est sûrs que vous allez l'adopter.",
    "Inspirant": "{topic} - Repensez ce qui est possible.\n\n{company} a imaginé un produit qui ne se contente pas de résoudre vos problèmes : il vous donne les moyens de viser plus haut.\n\nChaque détail a été pensé pour libérer votre potentiel et transformer votre façon de travailler.\n\nLe futur de votre productivité commence ici.",
    "Persuasif": "Pourquoi 2 400+ entreprises choisissent {topic} par {company} ?\n\n- 98.7% de disponibilité garantie\n- Déploiement 3x plus rapide que la concurrence\n- ROI positif en moins de 30 jours\n- Note clients : 4.9/5\n\nChaque minute sans {topic}, c'est de la valeur perdue. Demandez votre démo personnalisée maintenant.",
  },
  "Post Instagram": {
    "Professionnel": "La performance n'est pas un hasard. C'est une stratégie.\n\n{company} transforme {topic} en résultats mesurables pour les entreprises ambitieuses.\n\n+47% de croissance moyenne chez nos clients\n\n- Lien en bio pour en savoir plus\n\n#Business #Performance #{company}",
    "Décontracté": "POV : tu découvres enfin une solution pour {topic} qui marche vraiment.\n\n{company} a craqué le code. Et on est prêts à partager nos secrets.\n\nSwipe pour découvrir les résultats.\n\n#GameChanger #Innovation #{company}",
    "Inspirant": "\"Le meilleur moment pour commencer, c'était hier. Le deuxième meilleur moment, c'est maintenant.\"\n\n{company} vous accompagne dans votre transformation avec {topic}.\n\nChaque jour est une opportunité de construire quelque chose d'exceptionnel.\n\n#Motivation #Vision #{company}",
    "Persuasif": "RÉSULTATS CLIENTS {company}\n\nAvant {topic} / Après {topic}\n- Processus manuels / Tout automatisé\n- 3h/jour perdues / Gain de 89% de temps\n- ROI incertain / x3.2 de retour\n\nVotre entreprise mérite ces résultats.\nDM pour votre audit gratuit.\n\n#Résultats #Croissance #{company}",
  },
};

/* ─── Flux data (calendrier social media) ─── */
const PLATFORMS = ["LinkedIn", "Instagram", "Facebook", "Twitter"];
const FLUX_TONES = ["Professionnel", "Décontracté", "Inspirant"];
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const PLATFORM_ICONS = { LinkedIn: "\u{1F4BC}", Instagram: "\u{1F4F7}", Facebook: "\u{1F30D}", Twitter: "\u{1D54F}" };

const generateFallbackCalendar = (companyName, sector, platforms, tone) => {
  const templates = {
    LinkedIn: [
      { type: "Post carousel", content: `5 tendances ${sector} que ${companyName} surveille de près`, time: "09:00" },
      { type: "Article", content: `Comment ${companyName} révolutionne le ${sector} en 2026`, time: "08:30" },
      { type: "Sondage", content: `Quel est votre plus grand défi en ${sector} cette année ?`, time: "12:00" },
      { type: "Post texte", content: `Les coulisses de ${companyName} : notre approche du ${sector}`, time: "10:00" },
      { type: "Vidéo native", content: `3 conseils d'expert ${sector} par l'équipe ${companyName}`, time: "11:00" },
      { type: "Infographie", content: `${sector} en chiffres : les stats clés à connaître`, time: "09:30" },
      { type: "Témoignage client", content: `Comment notre client a transformé son ${sector} avec ${companyName}`, time: "14:00" },
    ],
    Instagram: [
      { type: "Reel", content: `Behind the scenes chez ${companyName} — ${sector} edition`, time: "12:00" },
      { type: "Carousel", content: `5 mythes sur le ${sector} démystifiés par ${companyName}`, time: "11:00" },
      { type: "Story interactive", content: `Quiz : testez vos connaissances en ${sector}`, time: "18:00" },
      { type: "Post visuel", content: `L'innovation ${sector} vue par ${companyName}`, time: "13:00" },
      { type: "Reel éducatif", content: `En 30 secondes : comprendre le ${sector} avec ${companyName}`, time: "17:00" },
      { type: "Carousel tips", content: `4 astuces ${sector} que personne ne vous dit`, time: "10:00" },
      { type: "Story sondage", content: `Votre avis compte : l'avenir du ${sector} selon vous ?`, time: "20:00" },
    ],
    Facebook: [
      { type: "Post engageant", content: `${companyName} partage ses prédictions ${sector} pour 2026`, time: "10:00" },
      { type: "Vidéo live", content: `Live Q&A : vos questions sur le ${sector} avec ${companyName}`, time: "14:00" },
      { type: "Article partagé", content: `Analyse ${sector} : ce que les données révèlent pour ${companyName}`, time: "09:00" },
      { type: "Post communauté", content: `Rejoignez la conversation : le futur du ${sector}`, time: "11:00" },
      { type: "Événement", content: `Webinaire ${companyName} : maîtriser le ${sector} en 2026`, time: "15:00" },
      { type: "Post photo", content: `L'équipe ${companyName} en action sur un projet ${sector}`, time: "12:00" },
      { type: "Sondage", content: `Quelle innovation ${sector} vous enthousiasme le plus ?`, time: "16:00" },
    ],
    Twitter: [
      { type: "Thread", content: `Thread : 7 insights ${sector} que ${companyName} a découverts ce mois-ci`, time: "08:00" },
      { type: "Tweet actu", content: `Hot take de ${companyName} sur les dernières news ${sector}`, time: "13:00" },
      { type: "Tweet question", content: `Question pour notre communauté ${sector} :`, time: "17:00" },
      { type: "Tweet stat", content: `Le saviez-vous ? Le ${sector} a évolué de 40% cette année — ${companyName}`, time: "09:00" },
      { type: "Thread éducatif", content: `Mini-cours : les bases du ${sector} par ${companyName}`, time: "10:00" },
      { type: "Tweet engagement", content: `RT si vous pensez que le ${sector} va tout changer en 2026`, time: "14:00" },
      { type: "Tweet citation", content: `"L'avenir du ${sector} appartient à ceux qui innovent" — ${companyName}`, time: "11:00" },
    ],
  };
  const calendar = DAYS.map((day, i) => {
    const platform = platforms[i % platforms.length];
    const items = templates[platform] || templates.LinkedIn;
    const item = items[i % items.length];
    return { day, platform, type: item.type, content: item.content, time: item.time };
  });
  return { calendar };
};

/* ─── Echo data (séquences email) ─── */
const OBJECTIVES = ["Prospection", "Nurturing", "Relance", "Onboarding"];
const EMAIL_COUNTS = [3, 5, 7];

const FALLBACK_SEQUENCES = {
  Prospection: [
    { number: 1, subject: "Bonjour {prénom}, une question rapide...", preview: "Nous avons remarqué que votre entreprise évolue rapidement dans votre secteur. Chez {company}, nous aidons des organisations comme la vôtre à accélérer leur croissance.", delay: "Jour 1", type: "Introduction" },
    { number: 2, subject: "La méthode qui a doublé le CA de nos clients", preview: "Saviez-vous que 73% des entreprises qui adoptent notre approche voient leurs résultats doubler en 90 jours ? Voici comment nous procédons...", delay: "Jour 3", type: "Valeur" },
    { number: 3, subject: "Étude de cas : +147% de croissance en 6 mois", preview: "Une entreprise de votre secteur a transformé sa stratégie avec notre solution. Découvrez les résultats concrets et la méthodologie utilisée.", delay: "Jour 5", type: "Preuve sociale" },
    { number: 4, subject: "15 minutes qui peuvent tout changer", preview: "Je vous propose un échange rapide pour analyser votre situation actuelle et identifier les leviers de croissance les plus impactants.", delay: "Jour 7", type: "Appel à l'action" },
    { number: 5, subject: "Dernière chance : offre exclusive cette semaine", preview: "Notre programme d'accompagnement est disponible à tarif préférentiel jusqu'à vendredi. Ne laissez pas passer cette opportunité.", delay: "Jour 10", type: "Urgence" },
    { number: 6, subject: "Ce que vos concurrents font déjà...", preview: "Le marché n'attend pas. Découvrez pourquoi les leaders de votre industrie ont déjà fait le choix de l'automatisation.", delay: "Jour 14", type: "FOMO" },
    { number: 7, subject: "On reste en contact ?", preview: "Même si le timing n'est pas idéal aujourd'hui, je souhaitais vous partager notre dernière ressource gratuite sur la croissance.", delay: "Jour 21", type: "Relance douce" },
  ],
  Nurturing: [
    { number: 1, subject: "Bienvenue ! Voici votre guide de démarrage", preview: "Merci de votre intérêt pour {company}. Voici les 3 premières étapes pour tirer le maximum de notre solution.", delay: "Jour 0", type: "Bienvenue" },
    { number: 2, subject: "Astuce #1 : Optimisez vos résultats dès le premier jour", preview: "Nos clients les plus performants commencent tous par cette étape simple mais puissante. Découvrez comment.", delay: "Jour 2", type: "Éducation" },
    { number: 3, subject: "Comment {client} a multiplié ses résultats par 3", preview: "Découvrez le parcours inspirant d'une entreprise qui a transformé son approche grâce à notre méthodologie.", delay: "Jour 5", type: "Témoignage" },
    { number: 4, subject: "Votre checklist personnalisée", preview: "Nous avons préparé une checklist sur-mesure pour vous aider à atteindre vos objectifs plus rapidement.", delay: "Jour 8", type: "Ressource" },
    { number: 5, subject: "Prêt pour la prochaine étape ?", preview: "Vous avez maintenant toutes les clés en main. Voici comment passer au niveau supérieur avec un accompagnement dédié.", delay: "Jour 12", type: "Conversion" },
    { number: 6, subject: "Webinaire exclusif : les secrets des top performers", preview: "Rejoignez notre prochain webinaire et découvrez les stratégies avancées de nos meilleurs clients.", delay: "Jour 16", type: "Engagement" },
    { number: 7, subject: "Votre bilan personnalisé est prêt", preview: "Après 3 semaines, voici un récapitulatif de votre progression et nos recommandations pour la suite.", delay: "Jour 21", type: "Bilan" },
  ],
  Relance: [
    { number: 1, subject: "Suite à notre échange...", preview: "Je reviens vers vous suite à notre conversation. Avez-vous eu le temps de réfléchir à notre proposition ?", delay: "Jour 1", type: "Rappel" },
    { number: 2, subject: "Une nouveauté qui pourrait vous intéresser", preview: "Depuis notre dernier échange, nous avons lancé une fonctionnalité qui répond exactement à votre besoin.", delay: "Jour 4", type: "Nouveauté" },
    { number: 3, subject: "Ils hésitaient aussi... puis ils ont dit oui", preview: "Beaucoup de nos clients avaient les mêmes interrogations. Voici ce qui les a convaincus de passer à l'action.", delay: "Jour 7", type: "Réassurance" },
    { number: 4, subject: "Votre accès prioritaire expire bientôt", preview: "L'offre que nous vous avions réservée arrive à expiration. Profitez-en avant qu'il ne soit trop tard.", delay: "Jour 10", type: "Urgence" },
    { number: 5, subject: "On fait le point ensemble ?", preview: "Un rapide appel de 10 minutes pour répondre à vos questions et lever les derniers freins.", delay: "Jour 14", type: "Appel" },
    { number: 6, subject: "Ce que vous perdez chaque mois sans agir", preview: "Chaque mois qui passe sans optimisation représente un manque à gagner estimé. Voici les chiffres.", delay: "Jour 18", type: "Impact" },
    { number: 7, subject: "Dernier message : on reste en contact", preview: "Je ne veux pas vous déranger. Si le projet n'est plus d'actualité, je comprends. Mais si jamais...", delay: "Jour 25", type: "Clôture" },
  ],
  Onboarding: [
    { number: 1, subject: "Bienvenue chez {company} ! Commençons.", preview: "Félicitations pour votre inscription ! Voici les 3 étapes pour démarrer en moins de 5 minutes.", delay: "Jour 0", type: "Activation" },
    { number: 2, subject: "Avez-vous configuré votre espace ?", preview: "Un rappel amical : votre configuration initiale ne prend que 2 minutes et débloque toutes les fonctionnalités.", delay: "Jour 1", type: "Setup" },
    { number: 3, subject: "Votre premier succès avec {company}", preview: "Suivez ce tutoriel pas-à-pas pour obtenir votre premier résultat concret en moins de 10 minutes.", delay: "Jour 3", type: "Quick win" },
    { number: 4, subject: "3 fonctionnalités cachées que vous allez adorer", preview: "Nos utilisateurs avancés ne jurent que par ces fonctionnalités. Découvrez-les avant tout le monde.", delay: "Jour 5", type: "Découverte" },
    { number: 5, subject: "Besoin d'aide ? Notre équipe est là", preview: "Si vous avez la moindre question, notre équipe support est disponible 24/7. N'hésitez pas à nous contacter.", delay: "Jour 7", type: "Support" },
    { number: 6, subject: "Vous faites partie du top 20% des utilisateurs", preview: "Bravo ! Votre utilisation est au-dessus de la moyenne. Voici comment aller encore plus loin.", delay: "Jour 14", type: "Engagement" },
    { number: 7, subject: "Votre premier mois : les résultats", preview: "Après 30 jours, voici un bilan complet de votre utilisation et des recommandations personnalisées.", delay: "Jour 30", type: "Bilan" },
  ],
};

export default function NexusPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);

  /* ─── Mode toggle ─── */
  const [mode, setMode] = useState("contenu");

  /* ─── Nexus states (contenu unique) ─── */
  const [contentType, setContentType] = useState("Post LinkedIn");
  const [companyName, setCompanyName] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professionnel");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [displayedText, setDisplayedText] = useState("");

  /* ─── Echo states (séquence email) ─── */
  const [eCompanyName, setECompanyName] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("Prospection");
  const [emailCount, setEmailCount] = useState(5);
  const [eIsGenerating, setEIsGenerating] = useState(false);
  const [sequence, setSequence] = useState(null);
  const [visibleCards, setVisibleCards] = useState(0);

  /* ─── Flux states (calendrier social) ─── */
  const [fCompanyName, setFCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [fPlatforms, setFPlatforms] = useState(["LinkedIn"]);
  const [fTone, setFTone] = useState("Professionnel");
  const [fIsGenerating, setFIsGenerating] = useState(false);
  const [calendar, setCalendar] = useState(null);
  const [calVisibleCards, setCalVisibleCards] = useState(0);

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("NEXUS — Studio de Contenu IA | NERVÜR", "Générez du contenu professionnel avec l'IA. Posts réseaux sociaux, emails marketing et calendrier éditorial automatisés.", { path: "/nexus" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Typewriter effect (contenu mode)
  useEffect(() => {
    if (!generatedResponse) return;
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < generatedResponse.length) {
        setDisplayedText(generatedResponse.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [generatedResponse]);

  // Staggered reveal (sequence mode)
  useEffect(() => {
    if (!sequence) return;
    setVisibleCards(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCards(i);
      if (i >= sequence.length) { clearInterval(interval); setEIsGenerating(false); }
    }, 200);
    return () => clearInterval(interval);
  }, [sequence]);

  // Staggered reveal (calendar mode)
  useEffect(() => {
    if (!calendar) return;
    setCalVisibleCards(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setCalVisibleCards(count);
      if (count >= calendar.length) { clearInterval(interval); setFIsGenerating(false); }
    }, 150);
    return () => clearInterval(interval);
  }, [calendar]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const togglePlatform = (p) => {
    setFPlatforms(prev => prev.includes(p) ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) : [...prev, p]);
  };

  /* ─── Flux generate (calendrier) ─── */
  const generateCalendar = async () => {
    if (!fCompanyName.trim() || !sector.trim()) return;
    setFIsGenerating(true);
    setCalendar(null);
    setCalVisibleCards(0);
    try {
      const res = await fetch(`${API_URL}/api/flux/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: fCompanyName, sector, platforms: fPlatforms, tone: fTone }),
      });
      const data = await res.json();
      if (data.calendar) { setCalendar(data.calendar); return; }
    } catch (err) { /* fallback */ }
    const fallback = generateFallbackCalendar(fCompanyName, sector, fPlatforms, fTone);
    setCalendar(fallback.calendar);
  };

  const canGenerateCalendar = fCompanyName.trim().length > 1 && sector.trim().length > 1;

  /* ─── Nexus generate (contenu) ─── */
  const generateContent = async () => {
    if (!companyName.trim() || !topic.trim()) return;
    setIsGenerating(true);
    setDisplayedText("");
    setGeneratedResponse("");

    try {
      const res = await fetch(`${API_URL}/api/nexus/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contentType, companyName, topic, tone }),
      });
      const data = await res.json();
      if (data.response) { setGeneratedResponse(data.response); return; }
    } catch (err) { /* fallback */ }

    const template = FALLBACK_TEMPLATES[contentType]?.[tone] || FALLBACK_TEMPLATES["Post LinkedIn"]["Professionnel"];
    const filled = template.replace(/\{company\}/g, companyName).replace(/\{topic\}/g, topic);
    setGeneratedResponse(filled);
  };

  /* ─── Echo generate (séquence) ─── */
  const generateSequence = async () => {
    if (!eCompanyName.trim() || !audience.trim()) return;
    setEIsGenerating(true);
    setSequence(null);
    setVisibleCards(0);

    try {
      const res = await fetch(`${API_URL}/api/echo/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: eCompanyName, audience, objective, emailCount }),
      });
      const data = await res.json();
      if (data.sequence) { setSequence(data.sequence.slice(0, emailCount)); return; }
    } catch (err) { /* fallback */ }

    const fallback = (FALLBACK_SEQUENCES[objective] || FALLBACK_SEQUENCES.Prospection).slice(0, emailCount);
    const filled = fallback.map(e => ({
      ...e,
      subject: e.subject.replace(/\{company\}/g, eCompanyName),
      preview: e.preview.replace(/\{company\}/g, eCompanyName).replace(/\{client\}/g, audience),
    }));
    setSequence(filled);
  };

  const canGenerateContent = companyName.trim().length > 1 && topic.trim().length > 1;
  const canGenerateSequence = eCompanyName.trim().length > 1 && audience.trim().length > 1;

  const accentColor = mode === "contenu" ? "#4ADE80" : mode === "sequence" ? "#fb7185" : "#22d3ee";
  const accentDark = mode === "contenu" ? "#22c55e" : mode === "sequence" ? "#f43f5e" : "#06b6d4";

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: "100vh", position: "relative" }}>
      <div ref={glowRef} style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />

      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" style={{ filter: "invert(1) brightness(1.15)" }} alt="NERVÜR" onClick={() => navigate("/")} style={{ height: isMobile ? "34px" : "42px", width: "auto", objectFit: "contain", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" onClick={() => navigate("/technologies")} aria-label="Retour aux outils">← Outils</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      {/* HERO */}
      <main style={{ padding: isMobile ? "100px 20px 60px" : "160px 48px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ animation: "fadeInUp 0.8s ease both", marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <svg width="32" height="32" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="hero-nexus" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#86efac" /><stop offset="100%" stopColor="#22c55e" /></linearGradient></defs>
              <rect x="4" y="4" width="18" height="18" rx="3" fill="none" stroke="url(#hero-nexus)" strokeWidth="1.5" />
              <path d="M9 13h8M13 9v8" fill="none" stroke="url(#hero-nexus)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#4ADE80", fontWeight: 700, padding: "4px 12px", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "2px" }}>STUDIO DE CONTENU</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "36px" : "clamp(42px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "20px" }}>NEXUS</h1>
          <p style={{ fontSize: "18px", color: "#71717A", lineHeight: 1.8, maxWidth: "600px" }}>
            L'IA qui génère du contenu marketing qui convertit. Posts, emails, séquences et calendrier social — en quelques secondes.
          </p>
        </div>

        {/* STATS BAR */}
        <section aria-label="Statistiques Nexus" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "28px", animation: "fadeInUp 0.8s ease 0.2s both" }}>
          {(mode === "contenu" ? [
            { label: "Contenus générés / mois", value: "2.4K" },
            { label: "Engagement moyen", value: "x3.2" },
            { label: "Gain de temps", value: "89%" },
          ] : mode === "sequence" ? [
            { label: "Emails générés / mois", value: "3.2K" },
            { label: "Taux d'ouverture", value: "x2.7" },
            { label: "Taux de réponses", value: "42%" },
          ] : [
            { label: "Posts / mois", value: "120" },
            { label: "Engagement", value: "x4.1" },
            { label: "Gain de temps", value: "87%" },
          ]).map((s, i) => (
            <div key={i} style={{ padding: "20px 24px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: V, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#52525B" }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* MODE TOGGLE */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", animation: "fadeInUp 0.8s ease 0.3s both" }}>
          {[
            { key: "contenu", label: "Contenu unique", color: "#4ADE80" },
            { key: "sequence", label: "Séquence email", color: "#fb7185" },
            { key: "calendrier", label: "Calendrier social", color: "#22d3ee" },
          ].map(tab => {
            const active = mode === tab.key;
            return (
              <button key={tab.key} onClick={() => setMode(tab.key)} style={{
                padding: "10px 24px", fontSize: "11px", letterSpacing: "1.5px",
                textTransform: "uppercase", fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
                background: active ? `${tab.color}20` : "transparent",
                border: `1px solid ${active ? `${tab.color}60` : VG(0.1)}`,
                color: active ? tab.color : "#52525B",
                transition: "all 0.3s",
              }}>{tab.label}</button>
            );
          })}
        </div>

        {/* DEMO */}
        <section aria-label="Générateur de contenu" style={{ animation: "fadeInUp 0.8s ease 0.4s both" }}>
          <div style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.5)", borderRadius: "12px", overflow: "hidden", backdropFilter: "blur(12px)" }}>
            {/* Dashboard header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
                <span style={{ fontSize: "11px", color: "#52525B", marginLeft: "12px", letterSpacing: "1px" }}>nexus-studio.nervur.com</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor }} />
                <span style={{ fontSize: "9px", color: accentColor, letterSpacing: "1px" }}>READY</span>
              </div>
            </div>

            <div style={{ padding: isMobile ? "20px" : "32px" }}>

              {/* ════════════════════ CONTENU UNIQUE MODE ════════════════════ */}
              {mode === "contenu" && (
                <>
                  {/* Content type selector */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "10px" }}>TYPE DE CONTENU</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {CONTENT_TYPES.map(t => (
                        <button key={t} onClick={() => setContentType(t)} style={{
                          padding: "10px 18px", background: contentType === t ? "rgba(74,222,128,0.15)" : VG(0.04),
                          border: `1px solid ${contentType === t ? "rgba(74,222,128,0.5)" : VG(0.1)}`,
                          color: contentType === t ? "#86efac" : V3, fontSize: "13px", cursor: "pointer",
                          transition: "all 0.3s", fontFamily: "inherit",
                        }}>{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                    <div>
                      <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "8px" }}>NOM DE L'ENTREPRISE</label>
                      <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Acme Corp"
                        style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", borderRadius: "6px", transition: "border-color 0.3s" }}
                        onFocus={e => e.target.style.borderColor = VG(0.25)} onBlur={e => e.target.style.borderColor = VG(0.1)} />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "8px" }}>SUJET / PRODUIT</label>
                      <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: automatisation marketing"
                        style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", borderRadius: "6px", transition: "border-color 0.3s" }}
                        onFocus={e => e.target.style.borderColor = VG(0.25)} onBlur={e => e.target.style.borderColor = VG(0.1)} />
                    </div>
                  </div>

                  {/* Tone selector */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "10px" }}>TON</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {TONES.map(t => (
                        <button key={t} onClick={() => setTone(t)} style={{
                          padding: "10px 18px", background: tone === t ? "rgba(74,222,128,0.15)" : VG(0.04),
                          border: `1px solid ${tone === t ? "rgba(74,222,128,0.5)" : VG(0.1)}`,
                          color: tone === t ? "#86efac" : V3, fontSize: "13px", cursor: "pointer",
                          transition: "all 0.3s", fontFamily: "inherit",
                        }}>{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Generate button */}
                  <button onClick={generateContent} disabled={isGenerating || !canGenerateContent}
                    style={{
                      padding: "14px 32px", background: canGenerateContent ? "linear-gradient(135deg, #4ADE80, #22c55e)" : VG(0.06),
                      border: "none", color: canGenerateContent ? "#09090B" : "#52525B", fontWeight: 700, fontSize: "12px",
                      letterSpacing: "1.5px", textTransform: "uppercase", cursor: canGenerateContent && !isGenerating ? "pointer" : "not-allowed",
                      transition: "all 0.3s ease", fontFamily: "inherit", opacity: !canGenerateContent ? 0.4 : 1,
                    }}>
                    {isGenerating ? "Génération en cours..." : "Générer le contenu →"}
                  </button>

                  {/* Generated response */}
                  {displayedText && (
                    <div style={{ marginTop: "24px", padding: isMobile ? "20px" : "28px", border: "1px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.03)", borderRadius: "10px", animation: "fadeInUp 0.4s ease both" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "9px", letterSpacing: "1.5px", fontWeight: 700, color: "#4ADE80", padding: "3px 8px", border: "1px solid rgba(74,222,128,0.3)" }}>IA NEXUS</span>
                        <span style={{ fontSize: "10px", color: "#52525B" }}>{contentType} — {tone}</span>
                      </div>
                      <p style={{ fontSize: "14px", color: "#E4E4E7", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                        {displayedText}
                        {isGenerating && <span style={{ display: "inline-block", width: "2px", height: "14px", background: "#4ADE80", marginLeft: "2px", animation: "blink 0.8s ease infinite" }} />}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ════════════════════ SÉQUENCE EMAIL MODE ════════════════════ */}
              {mode === "sequence" && (
                <>
                  {/* Inputs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                    <div>
                      <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "8px" }}>NOM DE L'ENTREPRISE</label>
                      <input value={eCompanyName} onChange={e => setECompanyName(e.target.value)} placeholder="Ex: Acme Corp"
                        style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", borderRadius: "6px", transition: "border-color 0.3s" }}
                        onFocus={e => e.target.style.borderColor = VG(0.25)} onBlur={e => e.target.style.borderColor = VG(0.1)} />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "8px" }}>CIBLE / AUDIENCE</label>
                      <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Ex: Directeurs marketing B2B"
                        style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", borderRadius: "6px", transition: "border-color 0.3s" }}
                        onFocus={e => e.target.style.borderColor = VG(0.25)} onBlur={e => e.target.style.borderColor = VG(0.1)} />
                    </div>
                  </div>

                  {/* Objective selector */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "10px" }}>OBJECTIF</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {OBJECTIVES.map(o => (
                        <button key={o} onClick={() => setObjective(o)} style={{
                          padding: "10px 18px", background: objective === o ? "rgba(244,63,94,0.15)" : VG(0.04),
                          border: `1px solid ${objective === o ? "rgba(244,63,94,0.5)" : VG(0.1)}`,
                          color: objective === o ? "#fb7185" : V3, fontSize: "13px", cursor: "pointer",
                          transition: "all 0.3s", fontFamily: "inherit",
                        }}>{o}</button>
                      ))}
                    </div>
                  </div>

                  {/* Email count selector */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "10px" }}>NOMBRE D'EMAILS</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {EMAIL_COUNTS.map(n => (
                        <button key={n} onClick={() => setEmailCount(n)} style={{
                          padding: "10px 20px", background: emailCount === n ? "rgba(244,63,94,0.15)" : VG(0.04),
                          border: `1px solid ${emailCount === n ? "rgba(244,63,94,0.5)" : VG(0.1)}`,
                          color: emailCount === n ? "#fb7185" : V3, fontSize: "14px", fontWeight: 700, cursor: "pointer",
                          transition: "all 0.3s", fontFamily: "inherit",
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>

                  {/* Generate button */}
                  <button onClick={generateSequence} disabled={eIsGenerating || !canGenerateSequence}
                    style={{
                      padding: "14px 32px", background: canGenerateSequence ? "linear-gradient(135deg, #f43f5e, #fb7185)" : VG(0.06),
                      border: "none", color: canGenerateSequence ? V : "#52525B", fontWeight: 700, fontSize: "12px",
                      letterSpacing: "1.5px", textTransform: "uppercase", cursor: canGenerateSequence && !eIsGenerating ? "pointer" : "not-allowed",
                      transition: "all 0.3s ease", fontFamily: "inherit", opacity: !canGenerateSequence ? 0.4 : 1,
                    }}>
                    {eIsGenerating ? "Génération en cours..." : "GÉNÉRER LA SÉQUENCE →"}
                  </button>

                  {/* Generated sequence — vertical timeline */}
                  {sequence && (
                    <div style={{ marginTop: "32px", position: "relative", paddingLeft: isMobile ? "24px" : "40px" }}>
                      {/* Timeline line */}
                      <div style={{ position: "absolute", left: isMobile ? "10px" : "16px", top: 0, bottom: 0, width: "2px", background: "linear-gradient(180deg, #f43f5e, #fb7185, rgba(244,63,94,0.1))" }} />

                      {sequence.map((email, i) => (
                        <div key={i} style={{
                          marginBottom: "20px", position: "relative",
                          opacity: i < visibleCards ? 1 : 0, transform: i < visibleCards ? "translateY(0)" : "translateY(16px)",
                          transition: "opacity 0.4s ease, transform 0.4s ease",
                        }}>
                          {/* Timeline dot */}
                          <div style={{ position: "absolute", left: isMobile ? "-20px" : "-32px", top: "18px", width: "12px", height: "12px", borderRadius: "50%", background: "#09090B", border: "2px solid #f43f5e", zIndex: 2 }} />

                          {/* Email card */}
                          <div style={{ padding: isMobile ? "16px" : "20px 24px", border: "1px solid rgba(244,63,94,0.2)", background: "rgba(244,63,94,0.03)", borderRadius: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "#fb7185", minWidth: "24px" }}>#{email.number}</span>
                              <span style={{ fontSize: "9px", letterSpacing: "1.5px", fontWeight: 700, color: "#f43f5e", padding: "3px 8px", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "2px" }}>{email.type}</span>
                              <span style={{ fontSize: "10px", color: "#52525B", letterSpacing: "1px" }}>{email.delay}</span>
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: V2, marginBottom: "8px" }}>{email.subject}</div>
                            <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, margin: 0 }}>{email.preview}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ════════════════════ CALENDRIER SOCIAL MODE ════════════════════ */}
              {mode === "calendrier" && (
                <>
                  {/* Inputs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                    <div>
                      <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "8px" }}>NOM DE L'ENTREPRISE</label>
                      <input value={fCompanyName} onChange={e => setFCompanyName(e.target.value)} placeholder="Ex: Acme Corp"
                        style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", borderRadius: "6px", transition: "border-color 0.3s" }}
                        onFocus={e => e.target.style.borderColor = VG(0.25)} onBlur={e => e.target.style.borderColor = VG(0.1)} />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "8px" }}>SECTEUR D'ACTIVITÉ</label>
                      <input value={sector} onChange={e => setSector(e.target.value)} placeholder="Ex: Tech SaaS, Immobilier, Mode"
                        style={{ width: "100%", padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", borderRadius: "6px", transition: "border-color 0.3s" }}
                        onFocus={e => e.target.style.borderColor = VG(0.25)} onBlur={e => e.target.style.borderColor = VG(0.1)} />
                    </div>
                  </div>

                  {/* Platform selector */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "10px" }}>PLATEFORMES</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {PLATFORMS.map(p => (
                        <button key={p} onClick={() => togglePlatform(p)} style={{
                          padding: "10px 18px", background: fPlatforms.includes(p) ? "rgba(6,182,212,0.15)" : VG(0.04),
                          border: `1px solid ${fPlatforms.includes(p) ? "rgba(34,211,238,0.5)" : VG(0.1)}`,
                          color: fPlatforms.includes(p) ? "#22d3ee" : V3, fontSize: "13px", cursor: "pointer",
                          transition: "all 0.3s", fontFamily: "inherit",
                        }}>{PLATFORM_ICONS[p]} {p}</button>
                      ))}
                    </div>
                  </div>

                  {/* Tone selector */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "11px", letterSpacing: "2px", color: "#52525B", display: "block", marginBottom: "10px" }}>TON</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {FLUX_TONES.map(t => (
                        <button key={t} onClick={() => setFTone(t)} style={{
                          padding: "10px 18px", background: fTone === t ? "rgba(6,182,212,0.15)" : VG(0.04),
                          border: `1px solid ${fTone === t ? "rgba(34,211,238,0.5)" : VG(0.1)}`,
                          color: fTone === t ? "#22d3ee" : V3, fontSize: "13px", cursor: "pointer",
                          transition: "all 0.3s", fontFamily: "inherit",
                        }}>{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Generate button */}
                  <button onClick={generateCalendar} disabled={fIsGenerating || !canGenerateCalendar}
                    style={{
                      padding: "14px 32px", background: canGenerateCalendar ? "linear-gradient(135deg, #06b6d4, #22d3ee)" : VG(0.06),
                      border: "none", color: canGenerateCalendar ? "#09090B" : "#52525B", fontWeight: 700, fontSize: "12px",
                      letterSpacing: "1.5px", textTransform: "uppercase", cursor: canGenerateCalendar && !fIsGenerating ? "pointer" : "not-allowed",
                      transition: "all 0.3s ease", fontFamily: "inherit", opacity: !canGenerateCalendar ? 0.4 : 1,
                    }}>
                    {fIsGenerating ? "Génération en cours..." : "Générer le calendrier →"}
                  </button>

                  {/* Calendar result */}
                  {calendar && (
                    <div style={{ marginTop: "28px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                      {calendar.map((entry, i) => (
                        <div key={i} style={{
                          padding: "18px 20px", border: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.03)",
                          borderRadius: "10px", opacity: i < calVisibleCards ? 1 : 0, transform: i < calVisibleCards ? "translateY(0)" : "translateY(16px)",
                          transition: "opacity 0.4s ease, transform 0.4s ease",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#22d3ee" }}>{entry.day}</span>
                            <span style={{ fontSize: "11px", color: "#52525B" }}>{entry.time}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <span style={{ fontSize: "14px" }}>{PLATFORM_ICONS[entry.platform] || ""}</span>
                            <span style={{ fontSize: "10px", letterSpacing: "1.5px", fontWeight: 600, color: "#06b6d4", padding: "2px 8px", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "2px" }}>{entry.platform}</span>
                            <span style={{ fontSize: "10px", letterSpacing: "1px", color: "#52525B" }}>{entry.type}</span>
                          </div>
                          <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.6, margin: 0 }}>{entry.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Appel à l'action" style={{ marginTop: "80px", textAlign: "center", padding: isMobile ? "40px 20px" : "60px 48px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.3)", borderRadius: "12px", animation: "fadeInUp 0.8s ease 0.6s both" }}>
          <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>
            Intégrez Nexus à votre stratégie de contenu
          </h2>
          <p style={{ fontSize: "15px", color: "#71717A", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            Générez du contenu marketing performant en quelques secondes. Posts, emails, séquences et calendrier social — sur-mesure pour votre marque.
          </p>
          <button onClick={() => navigate('/contact?outil=nexus')} style={{
            padding: "16px 40px", background: V, color: "#09090B", border: "none",
            fontWeight: 800, fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.3s ease" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Réserver un appel →
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: isMobile ? "30px 20px" : "40px 48px", borderTop: `1px solid ${VG(0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "#52525B", letterSpacing: "1px" }}>NERVÜR © 2026</span>
        <span style={{ fontSize: "11px", color: "#52525B" }}>NEXUS — Studio de Contenu IA</span>
      </footer>
    </div>
  );
}
