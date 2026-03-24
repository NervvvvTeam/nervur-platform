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

const AUDIT_CATEGORIES = [
  { name: "Performance", icon: "PERF", weight: 25 },
  { name: "Accessibilité", icon: "A11Y", weight: 20, displayName: "Accessibilité" },
  { name: "SEO", icon: "SEO", weight: 25 },
  { name: "Conversion", icon: "CRO", weight: 30 },
];

const ISSUES = [
  { category: "Performance", severity: "critical", title: "LCP > 4.2s sur mobile", description: "La plus grande image visible met 4.2 secondes à charger. Seuil recommandé : < 2.5s. Cause probable : images non optimisées (PNG au lieu de WebP).", fix: "Convertir en WebP + lazy loading", impact: "+23% vitesse" },
  { category: "Performance", severity: "warning", title: "JavaScript non-minifié (2.3MB)", description: "Le bundle JS principal pèse 2.3MB sans compression. Augmente le Time to Interactive de 3.1s sur 3G.", fix: "Code splitting + tree shaking", impact: "-1.8s TTI" },
  { category: "Conversion", severity: "critical", title: "CTA principal invisible sans scroll", description: "Le bouton d'action principal n'apparaît qu'après 2 scrolls. 68% des visiteurs ne scrollent pas aussi loin.", fix: "Remonter le CTA above the fold", impact: "+35% clics CTA" },
  { category: "Conversion", severity: "critical", title: "Formulaire : 12 champs requis", description: "Le formulaire de contact demande 12 informations obligatoires. Taux d'abandon estimé : 84%. Benchmark secteur : 4-5 champs.", fix: "Réduire à 4 champs essentiels", impact: "+52% soumissions" },
  { category: "SEO", severity: "warning", title: "Balises H1 multiples (3 par page)", description: "Plusieurs H1 détectés sur les pages principales. Confusion pour les moteurs de recherche sur le sujet principal.", fix: "1 seul H1 par page", impact: "+15% crawl" },
  { category: "SEO", severity: "critical", title: "Aucune balise meta description", description: "12 pages n'ont pas de meta description. Google génère un extrait aléatoire, réduisant le CTR de ~30%.", fix: "Rédiger des méta uniques", impact: "+30% CTR" },
  { category: "Accessibilité", severity: "warning", title: "Contraste insuffisant (ratio 2.8:1)", description: "Le texte gris clair sur fond blanc n'atteint pas le ratio minimum WCAG AA de 4.5:1. Affecte ~15% des utilisateurs.", fix: "Augmenter contraste à 4.5:1+", impact: "Conformité AA" },
  { category: "Accessibilité", severity: "info", title: "Images sans attribut alt (23)", description: "23 images décoratives et informatives n'ont pas d'attribut alt. Invisible pour les lecteurs d'écran.", fix: "Ajouter alt descriptif", impact: "Accessibilité +" },
  { category: "Performance", severity: "info", title: "Pas de cache navigateur configuré", description: "Les ressources statiques sont re-téléchargées à chaque visite. Aucun header Cache-Control détecté.", fix: "Cache-Control: max-age=31536000", impact: "-40% requêtes" },
  { category: "Conversion", severity: "warning", title: "Aucun social proof visible", description: "Pas de témoignages, avis clients, ou logos partenaires visibles sur la page d'accueil. Réduit la confiance.", fix: "Ajouter section témoignages", impact: "+18% confiance" },
];

export default function PhantomPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [results, setResults] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [scores, setScores] = useState({});
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [realData, setRealData] = useState(false);
  const [error, setError] = useState(null);
  const [coreWebVitals, setCoreWebVitals] = useState(null);
  const [summary, setSummary] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("PHANTOM — Audit UX & Performance | NERVÜR", "Audit automatisé de votre site web. Performance, SEO, accessibilité et conversion analysés en profondeur.", { path: "/phantom", keywords: "audit web, performance site, audit SEO, accessibilité web, Core Web Vitals, NERVÜR Phantom" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const startAudit = () => {
    if (!url) return;
    setScanning(true);
    setResults(null);
    setError(null);
    setScanPhase(0);
    setScores({});
    setCoreWebVitals(null);
    setSummary("");
    setScanProgress(0);

    const phases = ["Connexion au site", "Google Lighthouse", "Analyse performance", "Test accessibilité", "Audit SEO", "Analyse IA"];
    let progressInterval;
    phases.forEach((_, i) => {
      setTimeout(() => setScanPhase(i + 1), (i + 1) * 800);
    });
    progressInterval = setInterval(() => {
      setScanProgress(p => p >= 95 ? 95 : p + Math.random() * 8);
    }, 400);

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/phantom/audit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        clearInterval(progressInterval);
        setScanProgress(100);
        if (data.error) {
          setScanning(false);
          setError(data.error);
          return;
        }
        if (data.scores && data.issues) {
          setScanning(false);
          setScores({
            Performance: data.scores.performance,
            Accessibilité: data.scores.accessibility,
            SEO: data.scores.seo,
            Conversion: data.scores.conversion,
          });
          setResults(data.issues);
          setRealData(data.realData || false);
          if (data.coreWebVitals) setCoreWebVitals(data.coreWebVitals);
          if (data.summary) setSummary(data.summary);
          return;
        }
      } catch (err) {
        clearInterval(progressInterval);
        setScanning(false);
        setError("Impossible d'auditer ce site. Vérifiez l'URL et réessayez.");
        return;
      }

      clearInterval(progressInterval);
      setScanning(false);
      setError("Ce site n'a pas pu être audité. Vérifiez que l'URL est valide et accessible.");
    }, 5500);
  };

  const getScoreColor = (s) => s >= 80 ? "#4ADE80" : s >= 50 ? "#fbbf24" : "#ef4444";
  const globalScore = Object.values(scores).length ? Math.round(Object.entries(scores).reduce((a, [cat, s]) => a + s * (AUDIT_CATEGORIES.find(c => c.name === cat)?.weight || 25) / 100, 0)) : 0;

  const filteredIssues = results ? (activeCategory === "all" ? results : results.filter(i => i.category === activeCategory)) : [];
  const criticalCount = results ? results.filter(i => i.severity === "critical").length : 0;
  const warningCount = results ? results.filter(i => i.severity === "warning").length : 0;

  const SEV_CONFIG = {
    critical: { color: "#ef4444", label: "CRITIQUE", bg: "rgba(239,68,68,0.1)" },
    warning: { color: "#fbbf24", label: "ATTENTION", bg: "rgba(251,191,36,0.1)" },
    info: { color: "#60a5fa", label: "INFO", bg: "rgba(96,165,250,0.1)" },
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#09090B", color: "#FAFAFA", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", minHeight: "100vh", position: "relative" }}>
      <div ref={glowRef} aria-hidden="true" style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />

      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scanSweep { 0% { left: -30%; } 100% { left: 130%; } }
        @keyframes scoreReveal { from { stroke-dashoffset: 251; } }
      `}</style>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <img src="/logo-nav.png" alt="NERVÜR" onClick={() => navigate("/")} style={{ height: isMobile ? "40px" : "70px", width: "auto", filter: "invert(1) brightness(1.15)", objectFit: "contain", mixBlendMode: "screen", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" aria-label="Retour aux outils" onClick={() => navigate("/technologies")}>← Outils</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 16px 60px" : "140px 48px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ animation: "fadeInUp 0.6s ease both", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <svg width="32" height="32" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="gph" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f9a8d4" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
              <rect x="3" y="3" width="20" height="20" rx="2" fill="none" stroke="url(#gph)" strokeWidth="1.5" />
              <path d="M8 10h10M8 14h7M8 18h4" fill="none" stroke="url(#gph)" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="20" cy="6" r="3" fill="#ec4899" opacity="0.6" />
            </svg>
            <h1 style={{ fontSize: isMobile ? "28px" : "42px", fontWeight: 800, letterSpacing: "-2px" }}>PHANTOM</h1>
            <span style={{ fontSize: "9px", letterSpacing: "1.5px", color: "#ec4899", border: "1px solid rgba(236,72,153,0.3)", padding: "3px 10px", textTransform: "uppercase" }}>Audit UX Auto</span>
          </div>
          <p style={{ fontSize: "15px", color: "#71717A", maxWidth: "600px", lineHeight: 1.8 }}>
            L'agent invisible qui crawle votre site et trouve les tueurs de conversion. Performance, SEO, accessibilité — tout est scanné.
          </p>
        </div>

        {/* URL INPUT */}
        <section aria-label="Formulaire d'audit" style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.4)", padding: isMobile ? "24px" : "32px", marginBottom: "32px", animation: "fadeInUp 0.6s ease 0.1s both" }}>
          <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#ec4899", marginBottom: "16px" }}>ENTREZ L'URL À AUDITER</div>
          <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://votre-site.com" aria-label="URL du site à auditer"
              style={{ flex: 1, padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`, color: V, fontSize: "15px", fontFamily: "inherit", outline: "none" }}
              onKeyDown={e => e.key === "Enter" && startAudit()} />
            <button onClick={startAudit} disabled={scanning || !url}
              style={{ padding: "14px 28px", background: !url ? VG(0.06) : "linear-gradient(135deg, #ec4899, #be185d)", border: "none", color: !url ? "#52525B" : V, fontWeight: 700, fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: !url ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {scanning ? "Scan en cours..." : "Lancer l'audit"}
            </button>
          </div>
          {scanning && (
            <div style={{ marginTop: "20px" }}>
              {/* Progress bar */}
              <div style={{ height: "4px", background: VG(0.06), overflow: "hidden", position: "relative", marginBottom: "8px", borderRadius: "2px" }}>
                <div style={{ width: `${scanProgress}%`, height: "100%", background: "linear-gradient(90deg, #ec4899, #818CF8)", transition: "width 0.4s ease", borderRadius: "2px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "10px", color: "#52525B" }}>Analyse en cours...</span>
                <span style={{ fontSize: "10px", color: "#ec4899", fontWeight: 700 }}>{Math.round(scanProgress)}%</span>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                {["Connexion", "Lighthouse", "Performance", "Accessibilité", "SEO", "Analyse IA"].map((p, i) => (
                  <span key={i} style={{ fontSize: "10px", letterSpacing: "0.5px", color: scanPhase > i ? "#ec4899" : scanPhase === i ? V3 : "#52525B", transition: "color 0.3s", fontWeight: scanPhase === i ? 700 : 400 }}>
                    {scanPhase > i ? "✓" : scanPhase === i ? "◉" : "○"} {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ERROR */}
        {error && !scanning && (
          <div style={{ animation: "fadeInUp 0.4s ease both", textAlign: "center", padding: "40px 20px" }}>
            <div style={{ display: "inline-block", padding: "20px 32px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", borderRadius: "8px" }}>
              <div style={{ fontSize: "28px", marginBottom: "12px", color: "#ef4444" }}>X</div>
              <p style={{ fontSize: "14px", color: "#fca5a5", marginBottom: "8px", fontWeight: 600 }}>Audit impossible</p>
              <p style={{ fontSize: "12px", color: "#71717A", lineHeight: 1.6, maxWidth: "400px" }}>{error}</p>
              <button onClick={() => { setError(null); setUrl(""); }} style={{ marginTop: "16px", padding: "8px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#a1a1aa", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>Réessayer</button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {results && (
          <section aria-label="Résultats de l'audit" style={{ animation: "fadeInUp 0.5s ease both" }}>
            {realData && (
              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "8px", letterSpacing: "1px", fontWeight: 700, color: "#4ADE80", padding: "3px 8px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>DONNÉES RÉELLES — GOOGLE LIGHTHOUSE</span>
              </div>
            )}
            {/* SCORE CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: "12px", marginBottom: "28px" }}>
              {/* Global Score */}
              <div style={{ padding: "20px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.5)", textAlign: "center", gridColumn: isMobile ? "span 2" : "span 1" }}>
                <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 8px" }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
                    <circle cx="40" cy="40" r="36" fill="none" stroke={VG(0.06)} strokeWidth="4" />
                    <circle cx="40" cy="40" r="36" fill="none" stroke={getScoreColor(globalScore)} strokeWidth="4"
                      strokeDasharray="226" strokeDashoffset={226 - (226 * globalScore / 100)} strokeLinecap="round"
                      transform="rotate(-90 40 40)" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "22px", fontWeight: 800, color: getScoreColor(globalScore) }}>{globalScore}</span>
                  </div>
                </div>
                <div style={{ fontSize: "8px", letterSpacing: "1.5px", color: "#52525B" }}>SCORE GLOBAL</div>
              </div>
              {/* Category Scores */}
              {AUDIT_CATEGORIES.map(cat => (
                <div key={cat.name} style={{ padding: "16px", border: `1px solid ${VG(0.08)}`, background: "rgba(24,24,27,0.5)", textAlign: "center" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", marginBottom: "4px", color: "#71717A" }}>{cat.icon}</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: getScoreColor(scores[cat.name] || 0), marginBottom: "4px" }}>{scores[cat.name] || 0}</div>
                  <div style={{ fontSize: "8px", letterSpacing: "1px", color: "#52525B" }}>{cat.name.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* CORE WEB VITALS */}
            {coreWebVitals && (
              <div style={{ marginBottom: "28px", padding: isMobile ? "20px" : "24px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.5)", borderRadius: "8px" }}>
                <h3 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", color: "#ec4899", textTransform: "uppercase", marginBottom: "16px" }}>Core Web Vitals</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "12px" }}>
                  {[
                    { key: "lcp", label: "LCP", unit: "s", good: 2.5, poor: 4 },
                    { key: "fcp", label: "FCP", unit: "s", good: 1.8, poor: 3 },
                    { key: "cls", label: "CLS", unit: "", good: 0.1, poor: 0.25 },
                    { key: "tbt", label: "TBT", unit: "ms", good: 200, poor: 600 },
                    { key: "si", label: "Speed Index", unit: "s", good: 3.4, poor: 5.8 },
                    { key: "tti", label: "TTI", unit: "s", good: 3.8, poor: 7.3 },
                  ].map(metric => {
                    const val = coreWebVitals[metric.key];
                    if (val === undefined || val === null) return null;
                    const numVal = parseFloat(val);
                    const status = numVal <= metric.good ? "good" : numVal <= metric.poor ? "needs-work" : "poor";
                    const statusColor = status === "good" ? "#4ADE80" : status === "needs-work" ? "#fbbf24" : "#ef4444";
                    return (
                      <div key={metric.key} style={{ padding: "12px", border: `1px solid ${statusColor}20`, background: `${statusColor}08`, textAlign: "center" }}>
                        <div style={{ fontSize: "8px", letterSpacing: "1.5px", color: "#52525B", marginBottom: "6px" }}>{metric.label}</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: statusColor }}>{val}{metric.unit}</div>
                        <div style={{ fontSize: "8px", letterSpacing: "1px", color: statusColor, marginTop: "2px" }}>
                          {status === "good" ? "BON" : status === "needs-work" ? "À AMÉLIORER" : "MAUVAIS"}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}

            {/* AI SUMMARY */}
            {summary && (
              <div style={{ marginBottom: "28px", padding: isMobile ? "20px" : "24px", border: "1px solid rgba(236,72,153,0.2)", background: "rgba(236,72,153,0.03)", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "1.5px", fontWeight: 700, color: "#ec4899", padding: "3px 8px", border: "1px solid rgba(236,72,153,0.3)" }}>ANALYSE IA</span>
                </div>
                <p style={{ fontSize: "13px", color: V2, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{summary}</p>
              </div>
            )}

            {/* ISSUE COUNTS + RESET */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ padding: "6px 14px", fontSize: "11px", fontWeight: 700, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>{criticalCount} Critiques</span>
              <span style={{ padding: "6px 14px", fontSize: "11px", fontWeight: 700, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>{warningCount} Alertes</span>
              <button onClick={() => { setResults(null); setScores({}); setCoreWebVitals(null); setSummary(""); setUrl(""); setRealData(false); setScanProgress(0); }}
                style={{ marginLeft: "auto", padding: "6px 16px", fontSize: "10px", letterSpacing: "1px", background: "transparent", border: `1px solid ${VG(0.15)}`, color: V3, cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase" }}>
                Nouvel audit
              </button>
            </div>

            {/* CATEGORY FILTER */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <button onClick={() => setActiveCategory("all")} style={{ padding: "6px 16px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", background: activeCategory === "all" ? "rgba(236,72,153,0.15)" : "transparent", border: `1px solid ${activeCategory === "all" ? "rgba(236,72,153,0.4)" : VG(0.1)}`, color: activeCategory === "all" ? "#f9a8d4" : "#52525B", transition: "all 0.3s" }}>Tout</button>
              {AUDIT_CATEGORIES.map(c => (
                <button key={c.name} onClick={() => setActiveCategory(c.name)} style={{ padding: "6px 16px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", background: activeCategory === c.name ? "rgba(236,72,153,0.15)" : "transparent", border: `1px solid ${activeCategory === c.name ? "rgba(236,72,153,0.4)" : VG(0.1)}`, color: activeCategory === c.name ? "#f9a8d4" : "#52525B", transition: "all 0.3s" }}>{c.icon} {c.name}</button>
              ))}
            </div>

            {/* ISSUES LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "40px" }}>
              {filteredIssues.map((issue, i) => {
                const sev = SEV_CONFIG[issue.severity];
                return (
                  <div key={i} onClick={() => setExpandedIssue(expandedIssue === i ? null : i)}
                    style={{ border: `1px solid ${VG(0.08)}`, background: "rgba(24,24,27,0.4)", padding: "14px 20px", cursor: "pointer", transition: "all 0.3s", borderLeft: `3px solid ${sev.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "2px" }}>{issue.title}</div>
                        <span style={{ fontSize: "9px", color: "#52525B" }}>{issue.category}</span>
                      </div>
                      <span style={{ fontSize: "9px", fontWeight: 700, padding: "3px 8px", background: sev.bg, border: `1px solid ${sev.color}30`, color: sev.color }}>{sev.label}</span>
                    </div>
                    {expandedIssue === i && (
                      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${VG(0.06)}` }}>
                        <p style={{ fontSize: "12px", color: V3, lineHeight: 1.8, marginBottom: "12px" }}>{issue.description}</p>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                          <div style={{ padding: "8px 14px", background: "rgba(74,222,128,0.06)", border: `1px solid rgba(74,222,128,0.15)` }}>
                            <div style={{ fontSize: "8px", color: "#52525B", letterSpacing: "1px", marginBottom: "4px" }}>CORRECTION</div>
                            <div style={{ fontSize: "12px", color: "#4ADE80" }}>{issue.fix}</div>
                          </div>
                          <div style={{ padding: "8px 14px", background: "rgba(96,165,250,0.06)", border: `1px solid rgba(96,165,250,0.15)` }}>
                            <div style={{ fontSize: "8px", color: "#52525B", letterSpacing: "1px", marginBottom: "4px" }}>IMPACT ESTIMÉ</div>
                            <div style={{ fontSize: "12px", color: "#60a5fa", fontWeight: 700 }}>{issue.impact}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section aria-label="Appel à l'action" style={{ marginTop: results ? "20px" : "60px", textAlign: "center", padding: isMobile ? "32px 20px" : "48px", border: `1px solid ${VG(0.1)}`, background: "rgba(24,24,27,0.3)", animation: "fadeInUp 0.6s ease 0.4s both" }}>
          <h2 style={{ fontSize: isMobile ? "20px" : "28px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-1px" }}>Votre site perd des clients chaque jour.</h2>
          <p style={{ fontSize: "14px", color: "#71717A", marginBottom: "28px", maxWidth: "450px", margin: "0 auto 28px", lineHeight: 1.7 }}>Phantom identifie les fuites. On les colmate. Résultats en 30 jours.</p>
          <button onClick={() => navigate('/contact?outil=phantom')} style={{ padding: "14px 36px", background: V, color: "#09090B", border: "none", fontWeight: 800, fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Auditer mon site →
          </button>
        </section>
      </main>
    </div>
  );
}
