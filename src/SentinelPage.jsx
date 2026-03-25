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

// ═══════════════════════════════════════════
// RÉPUTATION DATA
// ═══════════════════════════════════════════
const RESPONSES = {
  negative: [
    "Bonjour et merci pour votre retour. Nous sommes sincèrement désolés que votre expérience n'ait pas été à la hauteur de vos attentes. Votre satisfaction est notre priorité absolue, et nous prenons ce commentaire très au sérieux. Notre responsable qualité va vous contacter personnellement dans les 24h pour trouver une solution adaptée. Nous tenons à transformer cette expérience négative en une opportunité de vous démontrer notre engagement.",
    "Merci d'avoir pris le temps de partager votre avis. Nous comprenons votre frustration et l'entendons pleinement. Ce type de situation ne reflète pas nos standards habituels. Nous avons immédiatement lancé une investigation interne et aimerions échanger avec vous directement. Pourriez-vous nous contacter à satisfaction@client.com ? Nous nous engageons à résoudre ce problème sous 48h.",
  ],
  positive: [
    "Un immense merci pour ce retour chaleureux ! Toute l'équipe est ravie de savoir que vous avez vécu une expérience aussi positive. C'est exactement ce pour quoi nous travaillons chaque jour. Au plaisir de vous accueillir à nouveau très bientôt !",
    "Merci infiniment pour ces mots qui nous touchent sincèrement. Savoir que nous avons pu répondre à vos attentes est notre plus belle récompense. Nous avons hâte de vous retrouver !",
  ],
  mixed: [
    "Merci pour ce retour nuancé et constructif. Nous sommes heureux que certains aspects vous aient satisfait, et prenons bonne note des points d'amélioration que vous mentionnez. Votre feedback est précieux — il nous aide à progresser continuellement. Notre équipe travaille déjà sur les ajustements nécessaires. N'hésitez pas à revenir constater les améliorations !",
  ],
};

const FAKE_REVIEWS = [
  { stars: 1, name: "Marc D.", date: "Il y a 2h", text: "Service catastrophique. Attente de 45 minutes, personnel désagréable. Plus jamais.", sentiment: "negative", source: "Google" },
  { stars: 5, name: "Sophie L.", date: "Il y a 5h", text: "Expérience incroyable du début à la fin. L'équipe est aux petits soins. Je recommande à 100% !", sentiment: "positive", source: "Google" },
  { stars: 3, name: "Thomas R.", date: "Il y a 1j", text: "Correct dans l'ensemble, mais le rapport qualité/prix pourrait être amélioré. Le produit est bien mais le service client moyen.", sentiment: "mixed", source: "Trustpilot" },
  { stars: 2, name: "Julie P.", date: "Il y a 1j", text: "Très déçue par la qualité. La livraison a pris 3 semaines au lieu de 5 jours. Aucun suivi.", sentiment: "negative", source: "Google" },
  { stars: 5, name: "Antoine M.", date: "Il y a 2j", text: "Rapport qualité/prix imbattable. L'équipe support est réactive et compétente. Bravo !", sentiment: "positive", source: "Facebook" },
];

// ═══════════════════════════════════════════
// VEILLE CONCURRENTIELLE DATA (ex-Signal)
// ═══════════════════════════════════════════
const SIGNALS = [
  { id: 1, type: "opportunity", source: "LinkedIn", time: "Il y a 12 min", title: "Concurrent X lance une refonte complète", detail: "Votre concurrent principal a annoncé une refonte de sa plateforme. Fenêtre d'opportunité de 3-6 mois pendant leur transition.", score: 92, tags: ["Compétitif", "Urgent"] },
  { id: 2, type: "trend", source: "Google Trends", time: "Il y a 1h", title: "Recherches \"automatisation PME\" +340%", detail: "Explosion des requêtes liées à l'automatisation pour PME dans votre secteur géographique. Pic saisonnier confirmé.", score: 87, tags: ["Tendance", "SEO"] },
  { id: 3, type: "regulation", source: "Journal Officiel", time: "Il y a 3h", title: "Nouvelle réglementation RGPD — impact e-commerce", detail: "Mise à jour des obligations de consentement pour les sites e-commerce. Échéance de mise en conformité : 6 mois.", score: 78, tags: ["Réglementaire", "Conformité"] },
  { id: 4, type: "funding", source: "Crunchbase", time: "Il y a 5h", title: "Série B — NovaTech lève 12M€", detail: "NovaTech, acteur dans votre verticale, vient de lever 12M€. Expansion prévue sur votre segment de marché.", score: 71, tags: ["Financement", "Compétitif"] },
  { id: 5, type: "opportunity", source: "Twitter/X", time: "Il y a 8h", title: "Client cible exprime une frustration publique", detail: "Le CEO d'une entreprise target (CA 50M€) se plaint publiquement de son prestataire actuel. Opportunité de prospection directe.", score: 95, tags: ["Prospection", "Chaud"] },
  { id: 6, type: "trend", source: "Statista", time: "Il y a 12h", title: "Marché IA conversationnelle : +67% en 2026", detail: "Le marché des chatbots IA pour entreprises atteint 15.5Md$ en 2026. Adoption accélérée dans le retail et la santé.", score: 64, tags: ["Marché", "IA"] },
  { id: 7, type: "partnership", source: "Communiqué", time: "Il y a 1j", title: "Alliance stratégique dans votre écosystème", detail: "Deux acteurs complémentaires annoncent un partenariat. Impact potentiel sur votre chaîne de valeur.", score: 58, tags: ["Partenariat", "Stratégique"] },
];

const TYPE_CONFIG = {
  opportunity: { color: "#4ADE80", icon: "◎", label: "OPPORTUNITÉ" },
  trend: { color: "#60a5fa", icon: "◈", label: "TENDANCE" },
  regulation: { color: "#fbbf24", icon: "⬡", label: "RÉGLEMENTATION" },
  funding: { color: "#c084fc", icon: "◆", label: "FINANCEMENT" },
  partnership: { color: "#f472b6", icon: "◇", label: "PARTENARIAT" },
};

const SIGNAL_FILTERS = ["Tous", "Opportunités", "Tendances", "Réglementation", "Financement"];

// ═══════════════════════════════════════════
// PRIX & MARCHÉ DATA
// ═══════════════════════════════════════════
const COMPETITORS = [
  { name: "Concurrent A", color: "#8b5cf6", prices: [149, 149, 145, 145, 139, 139, 135, 130, 130, 128, 125, 125, 119, 119, 115, 115, 112, 112, 109, 109, 105, 105, 102, 102, 99, 99, 99, 95, 95, 127] },
  { name: "Concurrent B", color: "#3b82f6", prices: [129, 129, 129, 132, 132, 135, 135, 135, 138, 138, 138, 140, 140, 142, 142, 142, 145, 145, 145, 148, 148, 148, 150, 150, 150, 152, 152, 155, 155, 155] },
  { name: "Votre prix", color: "#4ADE80", prices: Array(30).fill(139) },
];

const PRICE_ALERTS = [
  { day: 27, text: "Concurrent A a baissé de -15%", type: "danger" },
  { day: 12, text: "Concurrent A passe sous votre prix", type: "warning" },
  { day: 5, text: "Concurrent B augmente de +8%", type: "info" },
];

// ═══════════════════════════════════════════
// FEATURES (fusionnées)
// ═══════════════════════════════════════════
const FEATURES = [
  { icon: "shield", title: "Monitoring Google Avis", desc: "Surveillance en continu de tous vos avis Google. Chaque nouveau commentaire est détecté et analysé en temps réel." },
  { icon: "brain", title: "Analyse de sentiment IA", desc: "Notre IA classe automatiquement chaque avis en positif, négatif ou neutre avec un score de confiance." },
  { icon: "bell", title: "Alertes email instantanées", desc: "Recevez une alerte dès qu'un avis négatif est publié ou qu'un signal marché critique est détecté." },
  { icon: "pen", title: "Suggestions de réponses IA", desc: "L'IA génère des réponses professionnelles adaptées au ton et au contenu de chaque avis. Vous validez, on publie." },
  { icon: "chart", title: "Dashboard & score de réputation", desc: "Tableau de bord en temps réel avec votre score global, l'évolution mensuelle et les tendances par catégorie." },
  { icon: "eye", title: "Veille concurrentielle IA", desc: "Scannez vos concurrents automatiquement : stack technique, performance, backlinks, réseaux sociaux." },
  { icon: "radar", title: "Détection d'opportunités", desc: "L'IA scanne 156+ sources pour identifier les opportunités, tendances et menaces de votre marché en temps réel." },
  { icon: "file", title: "Rapports PDF hebdomadaires", desc: "Chaque semaine, un rapport complet : avis reçus, signaux marché, sentiment global, actions recommandées." },
  { icon: "price", title: "Veille tarifaire", desc: "Suivez l'évolution des prix de vos concurrents sur 30 jours. Alertes automatiques en cas de changement significatif." },
  { icon: "zap", title: "Réponse en moins de 2 secondes", desc: "L'IA analyse et génère une réponse en temps réel. Votre temps de réaction passe de jours à secondes." },
];

function detectSentiment(text) {
  const lower = text.toLowerCase();
  const negWords = ["catastroph", "déçu", "nul", "horrible", "mauvais", "pire", "jamais", "attente", "désagréable", "problème", "erreur", "inacceptable", "scandale", "honte", "arnaque", "voleur"];
  const posWords = ["super", "excellent", "parfait", "incroyable", "bravo", "merci", "génial", "top", "recommande", "satisfait", "ravie", "magnifique", "exceptionnel"];
  const negCount = negWords.filter(w => lower.includes(w)).length;
  const posCount = posWords.filter(w => lower.includes(w)).length;
  if (negCount > posCount) return "negative";
  if (posCount > negCount) return "positive";
  if (negCount === 0 && posCount === 0) return "negative";
  return "mixed";
}

function FeatureIcon({ type }) {
  const s = { stroke: "#ef4444", strokeWidth: 1.5, fill: "none" };
  if (type === "shield") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M12 2L4 6v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"/></svg>;
  if (type === "brain") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><path d="M12 2a7.5 7.5 0 0 1 0 15M12 2a7.5 7.5 0 0 0 0 15M2 12h20M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10"/></svg>;
  if (type === "bell") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
  if (type === "pen") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  if (type === "chart") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
  if (type === "file") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
  if (type === "eye") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  if (type === "zap") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if (type === "radar") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="6"/></svg>;
  if (type === "price") return <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" {...s}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  return null;
}

export default function SentinelPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);

  // Réputation state
  const [userReview, setUserReview] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [visibleFeatures, setVisibleFeatures] = useState(0);

  // Veille state (ex-Signal)
  const [signalFilter, setSignalFilter] = useState("Tous");
  const [expandedSignal, setExpandedSignal] = useState(null);
  const [monitoring, setMonitoring] = useState(false);
  const [monitorUrl, setMonitorUrl] = useState("");
  const [monitorResults, setMonitorResults] = useState(null);
  const [monitorError, setMonitorError] = useState(null);
  const [visibleSignals, setVisibleSignals] = useState(0);
  const [chartAnimated, setChartAnimated] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("reputation");

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("SENTINEL — Bouclier E-Réputation & Veille IA | NERVÜR", "Surveillez votre e-réputation, analysez le sentiment IA, scannez vos concurrents et détectez les opportunités marché. Le bouclier complet.", { path: "/sentinel", keywords: "e-réputation PME, veille IA, surveillance avis, analyse sentiment, NERVÜR Sentinel" });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Feature reveal
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleFeatures(i);
      if (i >= FEATURES.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect
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

  // Signal animations on tab switch
  useEffect(() => {
    if (activeTab === "veille") {
      setVisibleSignals(0);
      SIGNALS.forEach((_, i) => {
        setTimeout(() => setVisibleSignals(i + 1), (i + 1) * 200);
      });
    }
    if (activeTab === "prix") {
      setChartAnimated(false);
      setTimeout(() => setChartAnimated(true), 300);
    }
  }, [activeTab]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Reputation: generate AI response
  const generateResponse = async (text) => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setDisplayedText("");
    setGeneratedResponse("");

    try {
      const res = await fetch(`${API_URL}/api/sentinel/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: text, businessName: "Votre Entreprise", tone: "professional" }),
      });
      const data = await res.json();
      if (data.response) { setGeneratedResponse(data.response); return; }
    } catch (err) { /* fallback */ }

    const sentiment = detectSentiment(text);
    const pool = RESPONSES[sentiment];
    const response = pool[Math.floor(Math.random() * pool.length)];
    setGeneratedResponse(response);
  };

  // Veille: scan competitor
  const startMonitor = async () => {
    if (!monitorUrl) return;
    setMonitoring(true);
    setMonitorResults(null);
    setMonitorError(null);

    try {
      const res = await fetch(`${API_URL}/api/signal/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: monitorUrl }),
      });
      const data = await res.json();
      if (data.error) { setMonitoring(false); setMonitorError(data.error); return; }
      if (data.signals) { setTimeout(() => { setMonitoring(false); setMonitorResults(data); }, 2500); return; }
    } catch (err) {
      setMonitoring(false);
      setMonitorError("Impossible d'analyser ce concurrent. Vérifiez l'URL et réessayez.");
      return;
    }
    setMonitoring(false);
    setMonitorError("Ce site n'a pas pu être analysé. Vérifiez que l'URL est valide et accessible.");
  };

  const sentimentColor = (s) => s === "positive" ? "#4ADE80" : s === "negative" ? "#ef4444" : "#fbbf24";
  const sentimentLabel = (s) => s === "positive" ? "POSITIF" : s === "negative" ? "NÉGATIF" : "MIXTE";

  const filteredSignals = SIGNALS.filter(s => {
    if (signalFilter === "Tous") return true;
    if (signalFilter === "Opportunités") return s.type === "opportunity";
    if (signalFilter === "Tendances") return s.type === "trend";
    if (signalFilter === "Réglementation") return s.type === "regulation";
    if (signalFilter === "Financement") return s.type === "funding";
    return true;
  });

  // Chart helpers
  const minPrice = 80, maxPrice = 170, chartW = 600, chartH = 200;
  const getY = (price) => chartH - ((price - minPrice) / (maxPrice - minPrice)) * chartH;
  const getX = (day) => (day / 29) * chartW;

  const TABS = [
    { key: "reputation", label: "Réputation", color: "#ef4444" },
    { key: "veille", label: "Veille Concurrence", color: "#10b981" },
    { key: "prix", label: "Prix & Marché", color: "#8b5cf6" },
  ];

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#0f1117", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: "100vh", position: "relative" }} role="document">

      <div ref={glowRef} aria-hidden="true" style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />

      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 12px rgba(239,68,68,0.3); } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes livePulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes scanSweep { 0% { left: -30%; } 100% { left: 130%; } }
        @keyframes pulseAlert { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.5); opacity: 0.3; } }
        .sentinel-feature:hover { border-color: rgba(239,68,68,0.3) !important; background: rgba(239,68,68,0.04) !important; }
      `}</style>

      {/* NAV */}
      <nav aria-label="Navigation principale" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" alt="NERVÜR" onClick={() => navigate("/")} style={{ height: isMobile ? "40px" : "70px", width: "auto", filter: "invert(1) brightness(1.15)", objectFit: "contain", mixBlendMode: "screen", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" aria-label="Retour aux outils" onClick={() => navigate("/technologies")}>← Outils</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 20px 60px" : "160px 48px 80px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ═══════════════ HERO ═══════════════ */}
        <div style={{ animation: "fadeInUp 0.8s ease both", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <svg aria-hidden="true" width="32" height="32" viewBox="0 0 26 26" fill="none">
              <defs><linearGradient id="hero-sentinel" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#ef4444" /></linearGradient></defs>
              <path d="M13 2L4 6v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="none" stroke="url(#hero-sentinel)" strokeWidth="1.5" />
              <path d="M9 13l2.5 2.5L17 10" fill="none" stroke="url(#hero-sentinel)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#ef4444", fontWeight: 700, padding: "4px 12px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "2px" }}>E-RÉPUTATION</span>
            <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#10b981", fontWeight: 700, padding: "4px 12px", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", animation: "livePulse 2s ease infinite" }} />
              VEILLE MARCHÉ
            </span>
          </div>
          <h1 style={{ fontSize: isMobile ? "36px" : "clamp(42px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "20px" }}>SENTINEL</h1>
          <p style={{ fontSize: "18px", color: "#71717A", lineHeight: 1.8, maxWidth: "680px" }}>
            Votre bouclier complet. Sentinel surveille votre e-réputation, scanne vos concurrents et détecte les opportunités de votre marché — le tout propulsé par l'IA.
          </p>
        </div>

        {/* ═══════════════ STATS BAR ═══════════════ */}
        <section aria-label="Statistiques clés" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, 1fr)", gap: "12px", marginBottom: "32px", animation: "fadeInUp 0.8s ease 0.2s both" }}>
          {[
            { label: "Avis analysés / mois", value: "847", color: V },
            { label: "Temps de réponse IA", value: "< 2s", color: V },
            { label: "Score clients", value: "4.7/5", color: "#4ADE80" },
            { label: "Signaux / 24h", value: "47", color: "#10b981" },
            { label: "Sources actives", value: "156", color: "#60a5fa" },
            { label: "Avis interceptés", value: "94%", color: "#fbbf24" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "16px 12px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: s.color, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "8px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#52525B" }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* ═══════════════ TABS ═══════════════ */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", animation: "fadeInUp 0.8s ease 0.3s both", flexWrap: "wrap" }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "10px 24px", fontSize: "11px", letterSpacing: "1.5px",
              textTransform: "uppercase", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              background: activeTab === tab.key ? `${tab.color}20` : "transparent",
              border: `1px solid ${activeTab === tab.key ? `${tab.color}60` : VG(0.1)}`,
              color: activeTab === tab.key ? tab.color : "#52525B",
              transition: "all 0.3s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ═══════════════ TAB: RÉPUTATION ═══════════════ */}
        {activeTab === "reputation" && (
          <section aria-label="Démonstration e-réputation" style={{ animation: "fadeInUp 0.6s ease both", marginBottom: "80px" }}>
            <div style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.5)", borderRadius: "12px", overflow: "hidden", backdropFilter: "blur(12px)" }}>

              {/* Dashboard header */}
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
                  <span style={{ fontSize: "11px", color: "#52525B", marginLeft: "12px", letterSpacing: "1px" }}>sentinel-dashboard.nervur.com</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", animation: "pulseGlow 2s ease infinite" }} />
                  <span style={{ fontSize: "9px", color: "#4ADE80", letterSpacing: "1px" }}>LIVE</span>
                </div>
              </div>

              <div style={{ padding: isMobile ? "20px" : "32px" }}>

                {/* Score de réputation */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "28px" }}>
                  <div style={{ padding: "16px", border: `1px solid ${VG(0.08)}`, background: VG(0.02), borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: "#4ADE80" }}>4.7</div>
                    <div style={{ fontSize: "9px", color: "#52525B", letterSpacing: "1.5px", textTransform: "uppercase" }}>Score global</div>
                    <div style={{ marginTop: "6px", display: "flex", justifyContent: "center", gap: "2px" }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= 4 ? "#fbbf24" : VG(0.2), fontSize: "14px" }}>★</span>)}
                    </div>
                  </div>
                  <div style={{ padding: "16px", border: `1px solid ${VG(0.08)}`, background: VG(0.02), borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: "#ef4444" }}>3</div>
                    <div style={{ fontSize: "9px", color: "#52525B", letterSpacing: "1.5px", textTransform: "uppercase" }}>Alertes cette semaine</div>
                    <div style={{ marginTop: "8px", display: "flex", justifyContent: "center", gap: "4px" }}>
                      {["negative","negative","mixed"].map((s,i) => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: sentimentColor(s), animation: "pulseDot 2s ease infinite", animationDelay: `${i*0.3}s` }} />)}
                    </div>
                  </div>
                  <div style={{ padding: "16px", border: `1px solid ${VG(0.08)}`, background: VG(0.02), borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: V }}>+12%</div>
                    <div style={{ fontSize: "9px", color: "#52525B", letterSpacing: "1.5px", textTransform: "uppercase" }}>Évolution ce mois</div>
                    <div style={{ marginTop: "8px", height: "16px", display: "flex", alignItems: "end", justifyContent: "center", gap: "3px" }}>
                      {[30,45,35,55,60,50,70,65,80,75,85,90].map((h,i) => <div key={i} style={{ width: "4px", height: `${h*0.16}px`, background: `rgba(74,222,128,${0.3+i*0.05})`, borderRadius: "1px" }} />)}
                    </div>
                  </div>
                </div>

                {/* Reviews feed */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: V3, letterSpacing: "1.5px", textTransform: "uppercase" }}>Flux d'avis en temps réel</h3>
                    <span style={{ fontSize: "9px", color: "#52525B", letterSpacing: "1px" }}>{FAKE_REVIEWS.length} NOUVEAUX</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {FAKE_REVIEWS.map((review, i) => (
                      <div key={i} onClick={() => { setSelectedReview(i); setUserReview(review.text); }}
                        style={{
                          padding: "14px 18px", border: `1px solid ${selectedReview === i ? VG(0.3) : VG(0.08)}`,
                          background: selectedReview === i ? VG(0.04) : "transparent",
                          borderRadius: "8px", cursor: "pointer", transition: "all 0.3s ease",
                          borderLeft: `3px solid ${sentimentColor(review.sentiment)}`,
                        }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "1px" }}>
                              {[1,2,3,4,5].map(s => (
                                <span key={s} style={{ color: s <= review.stars ? "#fbbf24" : VG(0.15), fontSize: "11px" }}>★</span>
                              ))}
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: V }}>{review.name}</span>
                            <span style={{ fontSize: "8px", letterSpacing: "1px", fontWeight: 700, color: sentimentColor(review.sentiment), padding: "2px 6px", border: `1px solid ${sentimentColor(review.sentiment)}40`, borderRadius: "2px" }}>{sentimentLabel(review.sentiment)}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "9px", color: "#52525B", letterSpacing: "0.5px" }}>{review.source}</span>
                            <span style={{ fontSize: "9px", color: "#3f3f46" }}>{review.date}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.6, margin: 0 }}>{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive zone */}
                <div style={{ padding: isMobile ? "20px" : "24px", border: `1px solid ${VG(0.12)}`, background: "rgba(239,68,68,0.02)", borderRadius: "10px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "14px", color: V, display: "flex", alignItems: "center", gap: "8px", letterSpacing: "1px", textTransform: "uppercase" }}>
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 26 26" fill="none">
                      <path d="M13 2L4 6v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                    </svg>
                    Testez Sentinel — Collez un avis
                  </h3>
                  <textarea
                    value={userReview}
                    onChange={e => setUserReview(e.target.value)}
                    placeholder="Collez un avis client ici (ou cliquez sur un avis ci-dessus)..."
                    style={{
                      width: "100%", minHeight: "70px", padding: "14px 16px",
                      background: VG(0.03), border: `1px solid ${VG(0.1)}`,
                      borderRadius: "6px", color: V, fontSize: "14px", lineHeight: 1.6,
                      resize: "vertical", outline: "none", fontFamily: "inherit",
                      transition: "border-color 0.3s", boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = VG(0.25)}
                    onBlur={e => e.target.style.borderColor = VG(0.1)}
                  />
                  <button onClick={() => generateResponse(userReview)}
                    disabled={isGenerating || !userReview.trim()}
                    style={{
                      marginTop: "12px", padding: "12px 28px",
                      background: userReview.trim() ? "linear-gradient(135deg, #ef4444, #dc2626)" : VG(0.06),
                      border: "none", color: userReview.trim() ? V : "#52525B", fontWeight: 700, fontSize: "12px",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                      cursor: isGenerating || !userReview.trim() ? "not-allowed" : "pointer",
                      transition: "all 0.3s ease", opacity: !userReview.trim() ? 0.4 : 1,
                      fontFamily: "inherit",
                    }}>
                    {isGenerating ? "Analyse IA en cours..." : "Analyser & répondre →"}
                  </button>
                </div>

                {/* Generated response */}
                {displayedText && (
                  <div style={{ marginTop: "20px", padding: isMobile ? "20px" : "24px", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.03)", borderRadius: "10px", animation: "fadeInUp 0.4s ease both" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "9px", letterSpacing: "1.5px", fontWeight: 700, color: "#ef4444", padding: "3px 8px", border: "1px solid rgba(239,68,68,0.3)" }}>IA SENTINEL</span>
                      <span style={{ fontSize: "10px", color: "#52525B" }}>Réponse suggérée — prête à publier</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#E4E4E7", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>
                      {displayedText}
                      {isGenerating && <span style={{ display: "inline-block", width: "2px", height: "14px", background: "#ef4444", marginLeft: "2px", animation: "pulseDot 0.8s ease infinite" }} />}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ TAB: VEILLE CONCURRENCE ═══════════════ */}
        {activeTab === "veille" && (
          <section aria-label="Veille concurrentielle" style={{ animation: "fadeInUp 0.6s ease both", marginBottom: "80px" }}>

            {/* Signal filters */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
              {SIGNAL_FILTERS.map(f => (
                <button key={f} onClick={() => setSignalFilter(f)} style={{
                  padding: "6px 16px", fontSize: "11px", letterSpacing: "1px", cursor: "pointer", fontFamily: "inherit",
                  background: signalFilter === f ? "rgba(16,185,129,0.15)" : "transparent",
                  border: `1px solid ${signalFilter === f ? "rgba(16,185,129,0.4)" : VG(0.1)}`,
                  color: signalFilter === f ? "#6ee7b7" : "#52525B", transition: "all 0.3s"
                }}>{f}</button>
              ))}
            </div>

            {/* Signal feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "40px" }}>
              {filteredSignals.map((s, i) => {
                const cfg = TYPE_CONFIG[s.type];
                const isVisible = i < visibleSignals;
                return (
                  <div key={s.id} onClick={() => setExpandedSignal(expandedSignal === s.id ? null : s.id)}
                    style={{
                      border: `1px solid ${expandedSignal === s.id ? `${cfg.color}40` : VG(0.08)}`, background: "rgba(24,24,27,0.4)",
                      padding: "16px 20px", cursor: "pointer", transition: "all 0.4s",
                      opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(12px)",
                      borderLeft: `3px solid ${cfg.color}`
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: "16px", color: cfg.color }}>{cfg.icon}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                          <div style={{ fontSize: "10px", color: "#52525B", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                            <span>·</span>
                            <span>{s.source}</span>
                            <span>·</span>
                            <span>{s.time}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {!isMobile && s.tags.map(t => (
                          <span key={t} style={{ fontSize: "8px", padding: "2px 8px", border: `1px solid ${VG(0.1)}`, color: "#52525B", letterSpacing: "0.5px" }}>{t}</span>
                        ))}
                        <span style={{ fontSize: "13px", fontWeight: 800, color: s.score >= 80 ? "#4ADE80" : s.score >= 60 ? "#fbbf24" : "#71717A", minWidth: "36px", textAlign: "right" }}>{s.score}</span>
                      </div>
                    </div>
                    {expandedSignal === s.id && (
                      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${VG(0.06)}` }}>
                        <p style={{ fontSize: "13px", color: V3, lineHeight: 1.8 }}>{s.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Monitor tool */}
            <div style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)", padding: isMobile ? "24px" : "32px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#10b981", marginBottom: "16px" }}>SCANNER UN CONCURRENT</div>
              <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
                <input value={monitorUrl} onChange={e => setMonitorUrl(e.target.value)} placeholder="Entrez un nom de domaine (ex: concurrent.com)" aria-label="URL du concurrent"
                  style={{ flex: 1, padding: "12px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "14px", fontFamily: "inherit", outline: "none" }} />
                <button onClick={startMonitor} disabled={monitoring || !monitorUrl}
                  style={{ padding: "12px 24px", background: !monitorUrl ? VG(0.06) : "linear-gradient(135deg, #10b981, #059669)", border: "none", color: !monitorUrl ? "#52525B" : V, fontWeight: 700, fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: !monitorUrl ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  {monitoring ? "Scan..." : "Analyser"}
                </button>
              </div>
              {monitoring && (
                <div style={{ marginTop: "16px", height: "3px", background: VG(0.06), overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", width: "30%", height: "100%", background: "linear-gradient(90deg, transparent, #10b981, transparent)", animation: "scanSweep 1.5s ease infinite" }} />
                </div>
              )}
              {monitorError && !monitoring && (
                <div style={{ marginTop: "20px", animation: "fadeInUp 0.4s ease both", textAlign: "center", padding: "20px" }}>
                  <div style={{ display: "inline-block", padding: "20px 32px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", borderRadius: "8px" }}>
                    <p style={{ fontSize: "14px", color: "#fca5a5", marginBottom: "8px", fontWeight: 600 }}>Analyse impossible</p>
                    <p style={{ fontSize: "12px", color: "#71717A", lineHeight: 1.6, maxWidth: "400px" }}>{monitorError}</p>
                    <button onClick={() => { setMonitorError(null); setMonitorUrl(""); }} style={{ marginTop: "16px", padding: "8px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#a1a1aa", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>Réessayer</button>
                  </div>
                </div>
              )}

              {monitorResults && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "16px" }}>Résultats pour <span style={{ color: "#10b981" }}>{monitorResults.domain}</span>
                    {monitorResults.realData && <span style={{ marginLeft: "8px", fontSize: "8px", padding: "2px 6px", background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ADE80", letterSpacing: "1px" }}>DONNÉES RÉELLES</span>}
                  </div>

                  {monitorResults.rawData && (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                      <div style={{ padding: "10px", background: VG(0.03), border: `1px solid ${VG(0.06)}`, textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: monitorResults.rawData.loadTime < 2000 ? "#4ADE80" : monitorResults.rawData.loadTime < 4000 ? "#fbbf24" : "#ef4444" }}>{monitorResults.rawData.loadTime}ms</div>
                        <div style={{ fontSize: "8px", color: "#52525B", letterSpacing: "1px", marginTop: "2px" }}>CHARGEMENT</div>
                      </div>
                      <div style={{ padding: "10px", background: VG(0.03), border: `1px solid ${VG(0.06)}`, textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: monitorResults.rawData.hasSSL ? "#4ADE80" : "#ef4444" }}>{monitorResults.rawData.hasSSL ? "HTTPS" : "HTTP"}</div>
                        <div style={{ fontSize: "8px", color: "#52525B", letterSpacing: "1px", marginTop: "2px" }}>SÉCURITÉ</div>
                      </div>
                      <div style={{ padding: "10px", background: VG(0.03), border: `1px solid ${VG(0.06)}`, textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: V }}>{monitorResults.rawData.links?.internal || 0}</div>
                        <div style={{ fontSize: "8px", color: "#52525B", letterSpacing: "1px", marginTop: "2px" }}>LIENS INT.</div>
                      </div>
                      <div style={{ padding: "10px", background: VG(0.03), border: `1px solid ${VG(0.06)}`, textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: V }}>{(monitorResults.rawData.socialLinks || []).length}</div>
                        <div style={{ fontSize: "8px", color: "#52525B", letterSpacing: "1px", marginTop: "2px" }}>RÉSEAUX</div>
                      </div>
                    </div>
                  )}

                  {monitorResults.techStack && (
                    <div style={{ marginBottom: "16px", padding: "10px 14px", background: VG(0.03), border: `1px solid ${VG(0.06)}` }}>
                      <div style={{ fontSize: "9px", color: "#52525B", letterSpacing: "1px", marginBottom: "6px" }}>STACK TECHNIQUE DÉTECTÉE</div>
                      <div style={{ fontSize: "12px", color: V2, lineHeight: 1.6 }}>{monitorResults.techStack}</div>
                    </div>
                  )}

                  {(monitorResults.strengths?.length > 0 || monitorResults.weaknesses?.length > 0) && (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                      {monitorResults.strengths?.length > 0 && (
                        <div style={{ padding: "12px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)" }}>
                          <div style={{ fontSize: "9px", color: "#4ADE80", letterSpacing: "1px", marginBottom: "8px" }}>POINTS FORTS</div>
                          {monitorResults.strengths.map((s, i) => <div key={i} style={{ fontSize: "11px", color: V3, marginBottom: "4px", lineHeight: 1.5 }}>+ {s}</div>)}
                        </div>
                      )}
                      {monitorResults.weaknesses?.length > 0 && (
                        <div style={{ padding: "12px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                          <div style={{ fontSize: "9px", color: "#ef4444", letterSpacing: "1px", marginBottom: "8px" }}>FAIBLESSES</div>
                          {monitorResults.weaknesses.map((w, i) => <div key={i} style={{ fontSize: "11px", color: V3, marginBottom: "4px", lineHeight: 1.5 }}>- {w}</div>)}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: "9px", color: "#52525B", letterSpacing: "1px", marginBottom: "8px" }}>SIGNAUX DÉTECTÉS</div>
                  {monitorResults.signals.map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${VG(0.05)}`, gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "12px", color: V2, lineHeight: 1.5 }}>{s.text}</span>
                        {s.recommendation && <div style={{ fontSize: "10px", color: "#10b981", marginTop: "4px" }}>{s.recommendation}</div>}
                      </div>
                      <span style={{ fontSize: "9px", padding: "2px 8px", border: `1px solid ${s.importance === "haute" ? "rgba(239,68,68,0.3)" : s.importance === "moyenne" ? "rgba(251,191,36,0.3)" : VG(0.1)}`, color: s.importance === "haute" ? "#ef4444" : s.importance === "moyenne" ? "#fbbf24" : "#52525B", whiteSpace: "nowrap", flexShrink: 0 }}>{(s.importance || "").toUpperCase()}</span>
                    </div>
                  ))}

                  {monitorResults.summary && (
                    <div style={{ marginTop: "16px", padding: "12px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                      <div style={{ fontSize: "9px", color: "#10b981", letterSpacing: "1px", marginBottom: "6px" }}>SYNTHÈSE</div>
                      <div style={{ fontSize: "12px", color: V2, lineHeight: 1.6 }}>{monitorResults.summary}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══════════════ TAB: PRIX & MARCHÉ ═══════════════ */}
        {activeTab === "prix" && (
          <section aria-label="Tableau de bord prix et marché" style={{ animation: "fadeInUp 0.6s ease both", marginBottom: "80px" }}>
            <div style={{
              border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.5)",
              overflow: "hidden", backdropFilter: "blur(12px)" }}>

              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${VG(0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
                  <span style={{ fontSize: "11px", color: "#52525B", marginLeft: "12px" }}>sentinel-prix.nervur.com</span>
                </div>
                <span style={{ fontSize: "9px", color: "#8b5cf6", letterSpacing: "1px" }}>30 JOURS</span>
              </div>

              <div style={{ padding: isMobile ? "20px" : "32px" }}>
                <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {COMPETITORS.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: 12, height: 3, borderRadius: "2px", background: c.color }} />
                      <span style={{ fontSize: "10px", color: V3, letterSpacing: "0.5px" }}>{c.name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ width: "100%", overflow: "hidden" }}>
                  <svg role="img" aria-label="Graphique d'évolution des prix sur 30 jours" viewBox={`0 0 ${chartW} ${chartH + 20}`} style={{ width: "100%", height: "auto" }}>
                    {[90, 110, 130, 150].map(p => (
                      <g key={p}>
                        <line x1="0" y1={getY(p)} x2={chartW} y2={getY(p)} stroke={VG(0.05)} strokeWidth="1" />
                        <text x={chartW + 5} y={getY(p) + 4} fill="#52525B" fontSize="9">€{p}</text>
                      </g>
                    ))}
                    {COMPETITORS.map((comp, ci) => (
                      <polyline key={ci}
                        points={comp.prices.map((p, d) => `${getX(d)},${getY(p)}`).join(" ")}
                        fill="none" stroke={comp.color} strokeWidth={ci === 2 ? "2" : "1.5"}
                        strokeDasharray={ci === 2 ? "6,3" : "none"}
                        style={{
                          strokeDashoffset: chartAnimated ? 0 : 1000,
                          transition: "stroke-dashoffset 2s ease",
                          ...(chartAnimated ? {} : { strokeDasharray: "1000", strokeDashoffset: "1000" })
                        }}
                      />
                    ))}
                    {PRICE_ALERTS.map((a, i) => (
                      <circle key={i} cx={getX(a.day)} cy={getY(COMPETITORS[0].prices[a.day])}
                        r="5" fill={a.type === "danger" ? "#ef4444" : a.type === "warning" ? "#fbbf24" : "#3b82f6"}
                        style={{ animation: "pulseAlert 2s ease infinite" }} />
                    ))}
                  </svg>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, color: V3, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>Alertes récentes</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {PRICE_ALERTS.map((a, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                        border: `1px solid ${a.type === "danger" ? "rgba(239,68,68,0.2)" : VG(0.08)}`,
                        background: a.type === "danger" ? "rgba(239,68,68,0.03)" : "transparent",
                      }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: a.type === "danger" ? "#ef4444" : a.type === "warning" ? "#fbbf24" : "#3b82f6",
                        }} />
                        <span style={{ fontSize: "12px", color: a.type === "danger" ? "#fca5a5" : V3, flex: 1 }}>{a.text}</span>
                        <span style={{ fontSize: "10px", color: "#52525B" }}>Jour {a.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ FEATURES ═══════════════ */}
        <section aria-label="Fonctionnalités incluses" style={{ marginBottom: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>Tout ce qui est inclus</h2>
            <p style={{ fontSize: "15px", color: "#71717A", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>Un seul abonnement, zéro surprise. Réputation + veille concurrentielle + alertes marché.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="sentinel-feature" style={{
                padding: "24px", border: `1px solid ${VG(0.08)}`, background: VG(0.02),
                borderRadius: "10px", transition: "all 0.3s ease", cursor: "default",
                opacity: i < visibleFeatures ? 1 : 0, transform: i < visibleFeatures ? "translateY(0)" : "translateY(12px)",
                transitionProperty: "opacity, transform, border-color, background",
                transitionDuration: "0.4s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ minWidth: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", background: "rgba(239,68,68,0.05)" }}>
                    <FeatureIcon type={f.icon} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", color: V }}>{f.title}</h3>
                    <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ PRICING ═══════════════ */}
        <section aria-label="Tarification" style={{ marginBottom: "80px", animation: "fadeInUp 0.8s ease 0.6s both" }}>
          <div style={{
            maxWidth: "520px", margin: "0 auto", padding: isMobile ? "32px 24px" : "48px 40px",
            border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.03)",
            borderRadius: "16px", textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "-1px", left: "40px", right: "40px", height: "2px", background: "linear-gradient(90deg, transparent, #ef4444, transparent)" }} />

            <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#ef4444", fontWeight: 700, marginBottom: "24px" }}>ABONNEMENT UNIQUE</div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
              <span style={{ fontSize: isMobile ? "48px" : "64px", fontWeight: 800, color: V, lineHeight: 1 }}>99€</span>
              <span style={{ fontSize: "16px", color: "#52525B", fontWeight: 600 }}>/mois</span>
            </div>
            <p style={{ fontSize: "13px", color: "#71717A", marginBottom: "28px" }}>Sans engagement · Setup offert · Résultats dès le 1er jour</p>

            <div style={{ textAlign: "left", marginBottom: "32px" }}>
              {[
                "Monitoring Google Avis en continu",
                "Analyse de sentiment IA automatique",
                "Alertes email avis négatifs en temps réel",
                "Suggestions de réponses IA personnalisées",
                "Dashboard live & score de réputation",
                "Veille concurrentielle IA (scans illimités)",
                "Détection d'opportunités marché 24/7",
                "Veille tarifaire 30 jours",
                "Rapports PDF hebdomadaires",
                "Support prioritaire",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < 9 ? `1px solid ${VG(0.06)}` : "none" }}>
                  <span style={{ color: "#4ADE80", fontSize: "14px", minWidth: "18px" }}>✓</span>
                  <span style={{ fontSize: "13px", color: V2 }}>{item}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/contact?outil=sentinel')} style={{
              width: "100%", padding: "16px", background: "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none", color: V, fontWeight: 800, fontSize: "13px", letterSpacing: "1.5px",
              textTransform: "uppercase", cursor: "pointer", borderRadius: "8px",
              transition: "all 0.3s ease", fontFamily: "inherit",
            }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(239,68,68,0.3)"; }}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
              Activer Sentinel →
            </button>

            <p style={{ fontSize: "11px", color: "#52525B", marginTop: "16px" }}>Paiement sécurisé · Annulation à tout moment</p>
          </div>
        </section>

        {/* ═══════════════ CTA FINAL ═══════════════ */}
        <section aria-label="Appel à l'action" style={{
          textAlign: "center", padding: isMobile ? "40px 20px" : "60px 48px",
          border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.3)", borderRadius: "12px" }}>
          <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>
            Protégez votre réputation. Devancez vos concurrents.
          </h2>
          <p style={{ fontSize: "15px", color: "#71717A", marginBottom: "32px", maxWidth: "560px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            Sentinel combine e-réputation et veille marché dans un seul outil propulsé par l'IA. Chaque avis, chaque mouvement concurrent — détecté et traité automatiquement.
          </p>
          <button onClick={() => navigate('/contact?outil=sentinel')} style={{
            padding: "16px 40px", background: V, color: "#0f1117", border: "none",
            fontWeight: 800, fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.3s ease", fontFamily: "inherit" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Réserver une démo gratuite →
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: isMobile ? "30px 20px" : "40px 48px", borderTop: `1px solid ${VG(0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "#52525B", letterSpacing: "1px" }}>NERVÜR © 2026</span>
        <span style={{ fontSize: "11px", color: "#52525B" }}>SENTINEL — Bouclier E-Réputation & Veille IA</span>
      </footer>
    </div>
  );
}
