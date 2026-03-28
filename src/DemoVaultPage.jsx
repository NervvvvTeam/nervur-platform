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

const CRITERIA_LABELS = {
  mentionsLegales: { label: "Mentions legales", icon: "M" },
  politiqueConfidentialite: { label: "Politique de confidentialite (RGPD)", icon: "R" },
  cgv: { label: "Conditions generales (CGV/CGU)", icon: "C" },
  cookieBanner: { label: "Bandeau de cookies / Consentement", icon: "K" },
};

export default function DemoVaultPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [alreadyUsed, setAlreadyUsed] = useState(false);

  useSEO(
    "Demo Vault - Scan RGPD Gratuit | NERVUR",
    "Testez gratuitement le scan de conformite RGPD de votre site. Score, criteres et recommandations.",
    { path: "/demo/vault", keywords: "demo rgpd, scan conformite, vault nervur, audit rgpd gratuit" }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (localStorage.getItem("nervur_demo_vault_used")) {
      setAlreadyUsed(true);
    }
  }, []);

  const handleScan = async () => {
    if (!url.trim()) return;
    if (alreadyUsed) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API}/api/vault/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors du scan.");
        return;
      }

      setResult(data);
      localStorage.setItem("nervur_demo_vault_used", "true");
      setAlreadyUsed(true);
    } catch (err) {
      setError("Impossible de contacter le serveur. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#4ade80";
    if (score >= 50) return "#facc15";
    if (score >= 25) return "#fb923c";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return "Bonne conformite";
    if (score >= 50) return "Conformite partielle";
    if (score >= 25) return "Conformite insuffisante";
    return "Non conforme";
  };

  return (
    <div style={{
      background: "#0f1117", color: "#FAFAFA",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      minHeight: "100vh",
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .demo-input:focus { outline: none; border-color: #06b6d4 !important; box-shadow: 0 0 0 3px rgba(6,182,212,0.2); }
        .blur-overlay { filter: blur(6px); pointer-events: none; user-select: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 20px" : "20px 48px",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(9,9,11,0.92)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <img src="/logo-nervur.svg" alt="NERVÜR" onClick={() => navigate("/")}
          style={{ height: isMobile ? "40px" : "70px", width: "auto", cursor: "pointer" }} />
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/")} style={{
            background: "transparent", border: "1px solid rgba(6,182,212,0.3)", color: "#A1A1AA",
            padding: "8px 20px", fontSize: "11px", fontWeight: 600, letterSpacing: "2px",
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
          }}>Accueil</button>
          <button onClick={() => navigate("/contact")} style={{
            background: "#06b6d4", border: "none", color: "#fff",
            padding: "8px 20px", fontSize: "11px", fontWeight: 600, letterSpacing: "2px",
            textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit", borderRadius: "4px",
          }}>Contact</button>
        </div>
      </nav>

      <main style={{ padding: isMobile ? "100px 20px 60px" : "140px 48px 80px", maxWidth: "800px", margin: "0 auto" }}>

        {/* HERO */}
        <section style={{ animation: "fadeInUp 0.6s ease both", textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "20px", padding: "6px 16px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ fontSize: "12px", color: "#06b6d4", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Vault Demo</span>
          </div>
          <h1 style={{ fontSize: isMobile ? "28px" : "42px", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: "16px" }}>
            Scannez la <span style={{ color: "#06b6d4" }}>conformite RGPD</span> de votre site
          </h1>
          <p style={{ fontSize: "16px", color: "#71717A", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            Entrez l'URL de votre site web et obtenez instantanement un apercu de votre conformite RGPD : score, criteres et recommandations.
          </p>
        </section>

        {/* ALREADY USED */}
        {alreadyUsed && !result && (
          <div style={{
            animation: "fadeInUp 0.6s ease both",
            textAlign: "center", padding: "40px 24px",
            border: "1px solid rgba(6,182,212,0.2)", borderRadius: "16px",
            background: "rgba(6,182,212,0.05)", marginBottom: "32px",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5" style={{ marginBottom: "16px" }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Vous avez deja utilise votre essai gratuit.</h3>
            <p style={{ fontSize: "14px", color: "#71717A", marginBottom: "24px", lineHeight: 1.7, maxWidth: "400px", margin: "0 auto 24px" }}>
              Contactez-nous pour acceder a l'outil complet avec generateur de documents et suivi RGPD.
            </p>
            <button onClick={() => navigate("/contact")} style={{
              padding: "14px 36px", background: "#06b6d4", border: "none", borderRadius: "10px",
              color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer",
            }}>
              Debloquer Vault &mdash; 19&#8364;/mois
            </button>
          </div>
        )}

        {/* INPUT FORM */}
        {!alreadyUsed && !result && (
          <section style={{ animation: "fadeInUp 0.6s ease 0.15s both" }}>
            <div style={{
              padding: isMobile ? "24px" : "40px",
              border: "1px solid rgba(6,182,212,0.15)", borderRadius: "16px",
              background: "rgba(24,24,27,0.6)", backdropFilter: "blur(12px)",
            }}>
              <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", fontWeight: 600, marginBottom: "10px", letterSpacing: "0.5px" }}>
                URL de votre site web
              </label>
              <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column" : "row" }}>
                <input
                  className="demo-input"
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleScan()}
                  placeholder="Ex: https://www.monsite.fr"
                  style={{
                    flex: 1, padding: "14px 18px", fontSize: "15px",
                    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px", color: "#FAFAFA", fontFamily: "inherit",
                    transition: "all 0.3s",
                  }}
                />
                <button
                  onClick={handleScan}
                  disabled={loading || !url.trim()}
                  style={{
                    padding: "14px 32px", background: loading ? "#71717A" : "#06b6d4",
                    border: "none", borderRadius: "10px", color: "#fff",
                    fontSize: "14px", fontWeight: 700, cursor: loading ? "wait" : "pointer",
                    transition: "all 0.3s", whiteSpace: "nowrap", opacity: !url.trim() ? 0.5 : 1,
                  }}>
                  {loading ? "Scan en cours..." : "Scanner"}
                </button>
              </div>
              {error && (
                <p style={{ marginTop: "12px", fontSize: "13px", color: "#ef4444" }}>{error}</p>
              )}
            </div>
          </section>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", animation: "fadeInUp 0.4s ease both" }}>
            <div style={{ width: "48px", height: "48px", border: "3px solid rgba(6,182,212,0.2)", borderTop: "3px solid #06b6d4", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#71717A", fontSize: "14px" }}>Analyse RGPD en cours...</p>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div style={{ animation: "fadeInUp 0.6s ease both" }}>

            {/* Score Card */}
            <div style={{
              padding: isMobile ? "28px" : "40px", borderRadius: "16px",
              border: "1px solid rgba(6,182,212,0.2)", background: "rgba(24,24,27,0.6)",
              textAlign: "center", marginBottom: "24px",
            }}>
              <p style={{ fontSize: "13px", color: "#71717A", marginBottom: "8px" }}>{result.url}</p>
              <div style={{
                width: "120px", height: "120px", borderRadius: "50%", margin: "0 auto 16px",
                border: `4px solid ${getScoreColor(result.score)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${getScoreColor(result.score)}10`,
              }}>
                <div>
                  <span style={{ fontSize: "40px", fontWeight: 800, color: getScoreColor(result.score) }}>{result.score}</span>
                  <span style={{ fontSize: "16px", color: "#71717A" }}>/100</span>
                </div>
              </div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: getScoreColor(result.score) }}>{getScoreLabel(result.score)}</p>
            </div>

            {/* 4 Criteria - simple check/cross */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "#A1A1AA" }}>Criteres analyses</h3>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                {Object.entries(CRITERIA_LABELS).map(([key, meta]) => {
                  const found = result.criteria?.[key];
                  return (
                    <div key={key} style={{
                      padding: "16px 20px", borderRadius: "12px",
                      border: `1px solid ${found ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}`,
                      background: found ? "rgba(74,222,128,0.05)" : "rgba(239,68,68,0.05)",
                      display: "flex", alignItems: "center", gap: "12px",
                    }}>
                      <span style={{ fontSize: "18px", color: found ? "#4ade80" : "#ef4444" }}>{found ? "\u2713" : "\u2717"}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{meta.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Locked recommendations */}
            <div style={{ position: "relative", marginBottom: "40px" }}>
              <div className="blur-overlay" style={{ padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(24,24,27,0.4)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", color: "#A1A1AA" }}>Recommandations</h3>
                <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7, marginBottom: "8px" }}>Generateur automatique de mentions legales, politique de confidentialite et CGV conformes...</p>
                <p style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.7 }}>Audit RGPD complet avec registre des traitements et plan d'action personnalise.</p>
              </div>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "linear-gradient(transparent 10%, rgba(15,17,23,0.95) 70%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "12px",
              }}>
                <div style={{ textAlign: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" style={{ margin: "0 auto 10px" }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <p style={{ color: "#06b6d4", fontSize: "14px", fontWeight: 700 }}>Debloquez l'outil complet</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              textAlign: "center", padding: isMobile ? "32px 20px" : "48px 40px",
              border: "1px solid rgba(6,182,212,0.2)", borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.02))",
            }}>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.5px" }}>
                Debloquez le rapport complet
              </h2>
              <p style={{ fontSize: "14px", color: "#71717A", marginBottom: "24px", maxWidth: "460px", margin: "0 auto 24px", lineHeight: 1.7 }}>
                Generateur de documents legaux, registre RGPD, veille juridique et recommandations IA.
              </p>
              <button onClick={() => navigate("/contact")} style={{
                padding: "16px 44px", background: "#06b6d4", border: "none", borderRadius: "12px",
                color: "#fff", fontSize: "16px", fontWeight: 800, cursor: "pointer",
                transition: "all 0.3s", letterSpacing: "0.3px",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(6,182,212,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                Contactez-nous
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
