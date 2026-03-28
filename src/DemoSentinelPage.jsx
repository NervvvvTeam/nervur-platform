import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSEO from "./useSEO";

const API = import.meta.env.VITE_API_URL || "";

const useIsMobile = (bp = 768) => {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.innerWidth <= bp : false);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
};

export default function DemoSentinelPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [alreadyUsed, setAlreadyUsed] = useState(false);

  useSEO(
    "Demo Sentinel - Analyse E-reputation Gratuite | NERVUR",
    "Testez gratuitement l'analyse e-reputation de votre entreprise. Note Google, avis clients et analyse IA.",
    { path: "/demo/sentinel", keywords: "demo e-reputation, analyse avis google, sentinel nervur" }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (localStorage.getItem("nervur_demo_sentinel_used")) {
      setAlreadyUsed(true);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    if (alreadyUsed) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API}/api/sentinel/demo?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'analyse.");
        return;
      }

      setResult(data);
      localStorage.setItem("nervur_demo_sentinel_used", "true");
      setAlreadyUsed(true);
    } catch (err) {
      setError("Impossible de contacter le serveur. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<span key={i} style={{ color: "#facc15", fontSize: "20px" }}>&#9733;</span>);
      else if (i === full && half) stars.push(<span key={i} style={{ color: "#facc15", fontSize: "20px" }}>&#9733;</span>);
      else stars.push(<span key={i} style={{ color: "#3f3f46", fontSize: "20px" }}>&#9733;</span>);
    }
    return stars;
  };

  return (
    <div style={{
      background: "#0f1117", color: "#FAFAFA",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      minHeight: "100vh",
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .demo-input:focus { outline: none; border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.2); }
        .blur-overlay { filter: blur(6px); pointer-events: none; user-select: none; }
      `}</style>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <img src="/logo-nervur.svg" alt="NERVUR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "40px" : "70px", width: "auto", cursor: "pointer" }} />
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/")} style={{
            background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#A1A1AA",
            padding: "8px 20px", fontSize: "11px", fontWeight: 600, letterSpacing: "2px",
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s",
          }}>Accueil</button>
          <button onClick={() => navigate("/contact")} style={{
            background: "#ef4444", border: "none", color: "#fff",
            padding: "8px 20px", fontSize: "11px", fontWeight: 600, letterSpacing: "2px",
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "4px",
          }}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 20px 60px" : "140px 48px 80px", maxWidth: "800px", margin: "0 auto" }}>

        {/* HERO */}
        <section style={{ animation: "fadeInUp 0.6s ease both", textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "20px", padding: "6px 16px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Sentinel Demo</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "28px" : "42px", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: "16px" }}>
            Analysez votre <span style={{ color: "#ef4444" }}>e-reputation</span> en 30 secondes
          </h1>
          <p style={{ fontSize: "16px", color: "#71717A", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            Entrez le nom de votre entreprise et decouvrez instantanement votre note Google, vos derniers avis et un apercu de l'analyse IA.
          </p>
        </section>

        {/* ALREADY USED MESSAGE */}
        {alreadyUsed && !result && (
          <div style={{
            animation: "fadeInUp 0.6s ease both",
            textAlign: "center", padding: "40px 24px",
            border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px",
            background: "rgba(239,68,68,0.05)", marginBottom: "32px",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" style={{ marginBottom: "16px" }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Vous avez deja utilise votre essai gratuit.</h3>
            <p style={{ fontSize: "14px", color: "#71717A", marginBottom: "24px", lineHeight: 1.7, maxWidth: "400px", margin: "0 auto 24px" }}>
              Contactez-nous pour acceder a l'outil complet avec toutes les fonctionnalites Sentinel.
            </p>
            <button onClick={() => navigate("/contact")} style={{
              padding: "14px 36px", background: "#ef4444", border: "none", borderRadius: "10px",
              color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.3s",
            }}>
              Debloquer Sentinel &mdash; 29&#8364;/mois
            </button>
          </div>
        )}

        {/* INPUT FORM */}
        {!alreadyUsed && !result && (
          <section style={{ animation: "fadeInUp 0.6s ease 0.15s both" }}>
            <div style={{
              padding: isMobile ? "24px" : "40px",
              border: "1px solid rgba(239,68,68,0.15)", borderRadius: "16px",
              background: "rgba(24,24,27,0.6)", backdropFilter: "blur(12px)",
            }}>
              <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", fontWeight: 600, marginBottom: "10px", letterSpacing: "0.5px" }}>
                Nom de l'entreprise ou URL Google Maps
              </label>
              <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column" : "row" }}>
                <input
                  className="demo-input"
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                  placeholder="Ex: Restaurant Le Petit Chef Paris"
                  style={{
                    flex: 1, padding: "14px 18px", fontSize: "15px",
                    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px", color: "#FAFAFA", fontFamily: "inherit",
                    transition: "all 0.3s",
                  }}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !query.trim()}
                  style={{
                    padding: "14px 32px", background: loading ? "#71717A" : "#ef4444",
                    border: "none", borderRadius: "10px", color: "#fff",
                    fontSize: "14px", fontWeight: 700, cursor: loading ? "wait" : "pointer",
                    transition: "all 0.3s", whiteSpace: "nowrap", opacity: !query.trim() ? 0.5 : 1,
                  }}>
                  {loading ? "Analyse en cours..." : "Analyser"}
                </button>
              </div>
              {error && (
                <p style={{ marginTop: "12px", fontSize: "13px", color: "#ef4444" }}>{error}</p>
              )}
            </div>
          </section>
        )}

        {/* LOADING ANIMATION */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", animation: "fadeInUp 0.4s ease both" }}>
            <div style={{ width: "48px", height: "48px", border: "3px solid rgba(239,68,68,0.2)", borderTop: "3px solid #ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#71717A", fontSize: "14px" }}>Analyse de votre e-reputation...</p>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div style={{ animation: "fadeInUp 0.6s ease both" }}>
            {/* Rating Card */}
            <div style={{
              padding: isMobile ? "24px" : "36px", borderRadius: "16px",
              border: "1px solid rgba(239,68,68,0.2)", background: "rgba(24,24,27,0.6)",
              textAlign: "center", marginBottom: "24px",
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#A1A1AA" }}>{result.name}</h2>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "52px", fontWeight: 800, color: "#ef4444" }}>{result.rating}</span>
                <div>
                  <div style={{ display: "flex", gap: "2px" }}>{renderStars(result.rating)}</div>
                  <p style={{ fontSize: "13px", color: "#71717A", marginTop: "4px" }}>{result.totalReviews} avis Google</p>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "#A1A1AA" }}>Derniers avis</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(result.reviews || []).map((review, i) => (
                  <div key={i} style={{
                    padding: "20px", borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)", background: "rgba(24,24,27,0.5)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{review.authorName}</span>
                      <div style={{ display: "flex", gap: "1px" }}>{renderStars(review.rating)}</div>
                    </div>
                    <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.6 }}>
                      {review.text ? (review.text.length > 200 ? review.text.slice(0, 200) + "..." : review.text) : <em style={{ color: "#52525B" }}>Aucun commentaire</em>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis Teaser (blurred) */}
            <div style={{ position: "relative", marginBottom: "40px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "#A1A1AA" }}>Analyse IA</h3>
              <div style={{
                padding: "24px", borderRadius: "12px",
                border: "1px solid rgba(239,68,68,0.15)", background: "rgba(24,24,27,0.5)",
              }}>
                <p style={{ fontSize: "14px", color: "#A1A1AA", lineHeight: 1.7, marginBottom: "12px" }}>
                  Votre etablissement affiche une note de <strong style={{ color: "#FAFAFA" }}>{result.rating}/5</strong> basee sur <strong style={{ color: "#FAFAFA" }}>{result.totalReviews} avis</strong>.
                  {result.rating >= 4 ? " C'est un excellent signal de confiance pour vos prospects." : result.rating >= 3 ? " Il y a du potentiel d'amelioration." : " Des actions correctives sont recommandees."}
                </p>
                {/* Blurred content */}
                <div className="blur-overlay">
                  <p style={{ fontSize: "14px", color: "#A1A1AA", lineHeight: 1.7, marginBottom: "8px" }}>
                    Analyse semantique detaillee : les themes les plus mentionnes dans vos avis sont la qualite du service, l'accueil et le rapport qualite-prix. Tendances sur 6 mois : votre note progresse de +0.3 points.
                  </p>
                  <p style={{ fontSize: "14px", color: "#A1A1AA", lineHeight: 1.7 }}>
                    Recommandations personnalisees : 4 actions prioritaires pour ameliorer votre e-reputation et repondre strategiquement aux avis negatifs.
                  </p>
                </div>
              </div>
              {/* Lock overlay */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "70%",
                background: "linear-gradient(transparent, rgba(15,17,23,0.95) 60%)",
                display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "20px",
                borderRadius: "0 0 12px 12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontSize: "13px", fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Contenu verrouille &mdash; Passez a Sentinel pour l'analyse complete
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              textAlign: "center", padding: isMobile ? "32px 20px" : "48px 40px",
              border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))",
            }}>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.5px" }}>
                Debloquez l'analyse complete
              </h2>
              <p style={{ fontSize: "14px", color: "#71717A", marginBottom: "24px", maxWidth: "460px", margin: "0 auto 24px", lineHeight: 1.7 }}>
                Reponses IA automatiques, veille concurrentielle, alertes en temps reel, rapports PDF, QR Code et bien plus.
              </p>
              <button onClick={() => navigate("/contact")} style={{
                padding: "16px 44px", background: "#ef4444", border: "none", borderRadius: "12px",
                color: "#fff", fontSize: "16px", fontWeight: 800, cursor: "pointer",
                transition: "all 0.3s", letterSpacing: "0.3px",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(239,68,68,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                Debloquez l'analyse complete &mdash; 29&#8364;/mois
              </button>
              <p style={{ fontSize: "12px", color: "#52525B", marginTop: "12px" }}>Sans engagement. Annulez a tout moment.</p>
            </div>
          </div>
        )}
      </main>

      <footer style={{
        padding: isMobile ? "30px 20px" : "40px 48px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexDirection: isMobile ? "column" : "row", gap: "12px",
      }}>
        <span style={{ fontSize: "11px", color: "#52525B", letterSpacing: "1px" }}>NERVUR &copy; 2026</span>
        <span style={{ fontSize: "11px", color: "#52525B" }}>Editeur de Technologies de Croissance</span>
      </footer>
    </div>
  );
}
