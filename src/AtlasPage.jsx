import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";
import LogoNervur from "./components/LogoNervur";

const V = "#FFFFFF", V2 = "#425466", V3 = "#6B7C93";
const VG = (a) => `rgba(255,255,255,${a})`;
const A1 = "#635BFF", A2 = "#4ADE80", A3 = "#F472B6";

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};


function ScoreGauge({ label, score, delay }) {
  const color = score >= 80 ? "#4ADE80" : score >= 60 ? "#fbbf24" : "#f87171";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ textAlign: "center", animation: `fadeInUp 0.5s ease ${delay}s both` }}>
      <svg width="90" height="90" viewBox="0 0 80 80" role="img" aria-label={`Score ${label}: ${score} sur 100`}>
        <circle cx="40" cy="40" r="36" fill="none" stroke={VG(0.08)} strokeWidth="5" />
        <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
        <text x="40" y="44" textAnchor="middle" fill={V} fontSize="18" fontWeight="800">{score}</text>
      </svg>
      <div style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#6B7C93", marginTop: "6px" }}>{label}</div>
    </div>
  );
}

export default function AtlasPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const glowRef = useRef(null);
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [displayedIssues, setDisplayedIssues] = useState([]);
  const [displayedRecs, setDisplayedRecs] = useState([]);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
      glowRef.current.style.opacity = 1;
    }
  };

  useSEO("ATLAS — Analyse SEO IA | NERVÜR", "Audit SEO complet en 30 secondes. Analysez performance, contenu, technique et mobile de votre site web.", { path: "/technologies" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Staggered reveal for issues and recommendations
  useEffect(() => {
    if (!result) return;
    setDisplayedIssues([]);
    setDisplayedRecs([]);
    setIsTyping(true);
    setTypingText("");

    // Typewriter for summary line
    const summary = `Audit terminé — Score global : ${Math.round((result.performance + result.seo + result.content + result.technical + result.mobile) / 5)}/100`;
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < summary.length) {
        setTypingText(summary.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 20);

    // Stagger issues
    result.issues.forEach((_, idx) => {
      setTimeout(() => setDisplayedIssues(prev => [...prev, result.issues[idx]]), 800 + idx * 300);
    });
    // Stagger recommendations
    result.recommendations.forEach((_, idx) => {
      setTimeout(() => setDisplayedRecs(prev => [...prev, result.recommendations[idx]]), 800 + result.issues.length * 300 + idx * 300);
    });

    return () => clearInterval(typeInterval);
  }, [result]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const launchAudit = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setDisplayedIssues([]);
    setDisplayedRecs([]);
    setTypingText("");

    try {
      const res = await fetch(`${API_URL}/api/atlas/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setIsAnalyzing(false);
        return;
      }
      if (data.scores || data.performance !== undefined) {
        // Handle new format (scores object) and old format (flat)
        const normalized = data.scores ? {
          performance: data.scores.performance,
          seo: data.scores.seo,
          content: data.scores.content,
          technical: data.scores.technical,
          mobile: data.scores.mobile,
          issues: data.issues || [],
          recommendations: data.recommendations || [],
          keywords: data.keywords || [],
          globalScore: data.globalScore,
          coreWebVitals: data.coreWebVitals || [],
          realData: data.realData || false,
          summary: data.summary || "",
        } : data;
        setResult(normalized);
        setIsAnalyzing(false);
        return;
      }
    } catch (err) {
      setError("Impossible d'analyser ce site. Vérifiez l'URL et réessayez.");
      setIsAnalyzing(false);
      return;
    }

    setError("Ce site n'a pas pu être analysé. Vérifiez que l'URL est valide et accessible.");
    setIsAnalyzing(false);
  };

  return (
    <div onMouseMove={handleMouseMove} style={{ background: "#FFFFFF", color: "#0A2540", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh", position: "relative" }}>
      <div ref={glowRef} style={{ position: "fixed", left: -100, top: -100, width: "150px", height: "150px", borderRadius: "50%", pointerEvents: "none", zIndex: 9999, background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.02) 40%, transparent 70%)", transform: "translate(-50%, -50%)", transition: "left 0.15s ease-out, top 0.15s ease-out, opacity 0.4s", opacity: 0, mixBlendMode: "screen" }} />


      <style>{`
        .nav-btn { cursor: pointer; background: transparent; border: 1.5px solid rgba(129,140,248,0.25); color: #a1a1aa; font-weight: 600; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; padding: 8px 22px; font-family: inherit; transition: all 0.3s; }
        .nav-btn:hover { color: #fafafa; border-color: #818CF8; box-shadow: 0 0 16px rgba(129,140,248,0.2); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseBlue { 0%, 100% { box-shadow: 0 0 0 rgba(59,130,246,0); } 50% { box-shadow: 0 0 12px rgba(59,130,246,0.3); } }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "12px 20px" : "20px 48px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${VG(0.08)}` }}>
        <LogoNervur height={28} onClick={() => navigate("/")} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="nav-btn" aria-label="Retour aux outils" onClick={() => navigate("/technologies")}>← Outils</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>Contact</button>
        </div>
      </nav>

      {/* HERO */}
      <main style={{ padding: isMobile ? "100px 20px 60px" : "160px 48px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ animation: "fadeInUp 0.8s ease both", marginBottom: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <svg width="32" height="32" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <defs><linearGradient id="hero-atlas" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
              <circle cx="13" cy="13" r="10" fill="none" stroke="url(#hero-atlas)" strokeWidth="1.5" />
              <ellipse cx="13" cy="13" rx="4" ry="10" fill="none" stroke="url(#hero-atlas)" strokeWidth="1" />
              <line x1="3" y1="13" x2="23" y2="13" stroke="url(#hero-atlas)" strokeWidth="1" />
              <circle cx="18" cy="8" r="3" fill="none" stroke="url(#hero-atlas)" strokeWidth="1.2" />
              <line x1="20.5" y1="10.5" x2="23" y2="13" stroke="url(#hero-atlas)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#3b82f6", fontWeight: 700, padding: "4px 12px", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "2px" }}>ANALYSE SEO</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "36px" : "clamp(42px, 5vw, 64px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "20px" }}>ATLAS</h1>
          <p style={{ fontSize: "18px", color: "#6B7C93", lineHeight: 1.8, maxWidth: "600px" }}>
            L'IA qui décortique votre référencement. Audit SEO complet en 30 secondes.
          </p>
        </div>

        {/* STATS BAR */}
        <section aria-label="Statistiques clés" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px", marginBottom: "48px", animation: "fadeInUp 0.8s ease 0.2s both" }}>
          {[
            { label: "Facteurs analysés", value: "147" },
            { label: "Visibilité moyenne", value: "x2.8" },
            { label: "Précision", value: "94%" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "20px 24px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.7)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: V, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#6B7C93" }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* DEMO */}
        <section aria-label="Outil d'analyse SEO" style={{ animation: "fadeInUp 0.8s ease 0.4s both" }}>
          <div style={{ border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.75)", borderRadius: "12px", overflow: "hidden", backdropFilter: "blur(12px)" }}>
            {/* Browser header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${VG(0.08)}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
                <span style={{ fontSize: "11px", color: "#6B7C93", marginLeft: "12px", letterSpacing: "1px" }}>atlas-seo.nervur.com</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", animation: "pulseBlue 2s ease infinite" }} />
                <span style={{ fontSize: "9px", color: "#60a5fa", letterSpacing: "1px" }}>READY</span>
              </div>
            </div>

            <div style={{ padding: isMobile ? "20px" : "32px" }}>
              {/* Input zone */}
              <div style={{ padding: isMobile ? "20px" : "28px", border: `1px solid ${VG(0.12)}`, background: "rgba(255,255,255,0.02)", borderRadius: "10px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: V, display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                    <line x1="18" y1="18" x2="23" y2="23" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Analysez votre site
                </h3>
                <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column" : "row" }}>
                  <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="URL du site à analyser (ex: https://monsite.com)"
                    style={{
                      flex: 1, padding: "14px 16px", background: VG(0.04), border: `1px solid ${VG(0.1)}`,
                      borderRadius: "6px", color: V, fontSize: "14px", fontFamily: "inherit",
                      outline: "none", transition: "border-color 0.3s", boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = VG(0.25)}
                    onBlur={e => e.target.style.borderColor = VG(0.1)}
                    onKeyDown={e => e.key === "Enter" && launchAudit()}
                  />
                  <button onClick={launchAudit} disabled={isAnalyzing || !url.trim()}
                    style={{
                      padding: "14px 28px", whiteSpace: "nowrap",
                      background: url.trim() ? "linear-gradient(135deg, #3b82f6, #60a5fa)" : VG(0.06),
                      border: "none", color: url.trim() ? V : "#6B7C93", fontWeight: 700, fontSize: "12px",
                      letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "inherit",
                      cursor: url.trim() && !isAnalyzing ? "pointer" : "not-allowed",
                      transition: "all 0.3s ease", opacity: !url.trim() ? 0.4 : 1, borderRadius: "6px",
                    }}>
                    {isAnalyzing ? "Analyse en cours..." : "Lancer l'audit SEO →"}
                  </button>
                </div>
              </div>

              {/* Loading state */}
              {isAnalyzing && (
                <div style={{ textAlign: "center", padding: "40px 0", animation: "fadeInUp 0.4s ease both" }}>
                  <div style={{ width: "40px", height: "40px", border: "3px solid rgba(59,130,246,0.2)", borderTop: "3px solid #3b82f6", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ fontSize: "13px", color: "#6B7C93", letterSpacing: "1px" }}>Analyse de {url} en cours...</p>
                </div>
              )}

              {/* Error */}
              {error && !isAnalyzing && (
                <div style={{ animation: "fadeInUp 0.4s ease both", textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ display: "inline-block", padding: "20px 32px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "28px", marginBottom: "12px", color: "#ef4444" }}>X</div>
                    <p style={{ fontSize: "14px", color: "#fca5a5", marginBottom: "8px", fontWeight: 600 }}>Analyse impossible</p>
                    <p style={{ fontSize: "12px", color: "#6B7C93", lineHeight: 1.6, maxWidth: "400px" }}>{error}</p>
                    <button onClick={() => { setError(null); setUrl(""); }} style={{ marginTop: "16px", padding: "8px 20px", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", color: "#a1a1aa", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>Réessayer</button>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && !isAnalyzing && (
                <div style={{ animation: "fadeInUp 0.5s ease both" }}>
                  {/* Typewriter summary */}
                  <div style={{ marginBottom: "24px", padding: "16px 20px", border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.03)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "9px", letterSpacing: "1.5px", fontWeight: 700, color: "#3b82f6", padding: "3px 8px", border: "1px solid rgba(59,130,246,0.3)" }}>ATLAS</span>
                      {result.realData && <span style={{ fontSize: "8px", letterSpacing: "1px", fontWeight: 700, color: "#4ADE80", padding: "3px 8px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>GOOGLE PAGESPEED</span>}
                      <span style={{ fontSize: "10px", color: "#6B7C93" }}>Rapport généré</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#E4E4E7", lineHeight: 1.8 }}>
                      {typingText}
                      {isTyping && <span style={{ display: "inline-block", width: "2px", height: "14px", background: "#3b82f6", marginLeft: "2px", animation: "blink 0.8s ease infinite" }} />}
                    </p>
                    <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
                  </div>

                  {/* Score gauges */}
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? "16px" : "28px", marginBottom: "32px" }}>
                    <ScoreGauge label="Performance" score={result.performance} delay={0.1} />
                    <ScoreGauge label="SEO" score={result.seo} delay={0.2} />
                    <ScoreGauge label="Contenu" score={result.content} delay={0.3} />
                    <ScoreGauge label="Technique" score={result.technical} delay={0.4} />
                    <ScoreGauge label="Mobile" score={result.mobile} delay={0.5} />
                  </div>

                  {/* Issues */}
                  <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#f87171", marginBottom: "12px", fontWeight: 700 }}>
                      Problèmes détectés ({result.issues.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {displayedIssues.map((issue, i) => (
                        <div key={i} style={{
                          padding: "12px 16px", border: "1px solid rgba(248,113,113,0.15)",
                          background: "rgba(248,113,113,0.04)", borderRadius: "6px",
                          display: "flex", alignItems: "center", gap: "10px",
                          animation: "fadeInUp 0.3s ease both",
                        }}>
                          <span style={{ color: "#f87171", fontSize: "14px", flexShrink: 0 }}>✕</span>
                          <span style={{ fontSize: "13px", color: "#E4E4E7", lineHeight: 1.5 }}>{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#4ADE80", marginBottom: "12px", fontWeight: 700 }}>
                      Recommandations ({result.recommendations.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {displayedRecs.map((rec, i) => (
                        <div key={i} style={{
                          padding: "12px 16px", border: "1px solid rgba(74,222,128,0.15)",
                          background: "rgba(74,222,128,0.04)", borderRadius: "6px",
                          display: "flex", alignItems: "center", gap: "10px",
                          animation: "fadeInUp 0.3s ease both",
                        }}>
                          <span style={{ color: "#4ADE80", fontSize: "14px", flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: "13px", color: "#E4E4E7", lineHeight: 1.5 }}>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Appel à l'action" style={{ marginTop: "80px", textAlign: "center", padding: isMobile ? "40px 20px" : "60px 48px", border: `1px solid ${VG(0.1)}`, background: "rgba(255,255,255,0.6)", borderRadius: "12px", animation: "fadeInUp 0.8s ease 0.6s both" }}>
          <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, marginBottom: "16px", letterSpacing: "-1px" }}>
            Boostez votre référencement avec Atlas
          </h2>
          <p style={{ fontSize: "15px", color: "#6B7C93", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            Obtenez un audit SEO complet et des recommandations personnalisées pour dominer les résultats de recherche.
          </p>
          <button onClick={() => navigate('/contact?outil=atlas')} style={{
            padding: "16px 40px", background: V, color: "#FFFFFF", border: "none",
            fontWeight: 800, fontSize: "13px", letterSpacing: "1.5px", textTransform: "uppercase",
            cursor: "pointer", transition: "all 0.3s ease" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Réserver un appel →
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: isMobile ? "30px 20px" : "40px 48px", borderTop: `1px solid ${VG(0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "#6B7C93", letterSpacing: "1px" }}>La structure derrière l'impact. © 2026</span>
        <span style={{ fontSize: "11px", color: "#6B7C93" }}>ATLAS — Analyse SEO IA</span>
      </footer>
    </div>
  );
}
