import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const TOOLS = [
  { name: "Sentinel", color: "#ef4444" },
  { name: "Vault", color: "#06b6d4" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWide, setIsWide] = useState(window.innerWidth >= 768);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/app/portal");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: isWide ? "row" : "column",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: "relative",
    }}>
      {/* Bouton retour site vitrine */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: "absolute",
          top: isWide ? 24 : 16,
          left: isWide ? 24 : 16,
          zIndex: 10,
          background: "rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 8,
          color: "#86868B",
          fontSize: 13,
          padding: "8px 16px",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.target.style.background = "rgba(0,0,0,0.1)"; e.target.style.color = "#fff"; }}
        onMouseLeave={e => { e.target.style.background = "rgba(0,0,0,0.06)"; e.target.style.color = "#86868B"; }}
      >
        ← Retour au site
      </button>
      {/* Branding Panel */}
      <div style={{
        background: "#F5F5F7",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: isWide ? "60px" : "48px 20px",
        position: "relative",
        overflow: "hidden",
        ...(isWide ? { flex: 1 } : { minHeight: "220px" }),
      }}>
        <div style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <span onClick={() => navigate("/")} style={{ fontSize: "18px", fontWeight: 800, cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "1px" }}>NERV<span style={{ color: "#818CF8" }}>{String.fromCharCode(220)}</span>R</span>

        <h1 style={{
          fontSize: isWide ? 32 : 20,
          fontWeight: 700,
          color: "#1D1D1F",
          textAlign: "center",
          marginBottom: 8,
          position: "relative",
        }}>
          Bienvenue sur NERVÜR
        </h1>
        <p style={{
          fontSize: isWide ? 15 : 13,
          color: "#86868B",
          textAlign: "center",
          maxWidth: 360,
          lineHeight: 1.6,
          position: "relative",
          margin: 0,
        }}>
          Gérez votre réputation et assurez votre conformité juridique.
        </p>

        {/* Tool pills */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: isWide ? 28 : 16,
          justifyContent: "center",
          position: "relative",
        }}>
          {TOOLS.map((t) => (
            <div key={t.name} style={{
              padding: "5px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
              border: `1px solid ${t.color}30`,
              background: `${t.color}10`,
              color: t.color,
            }}>
              {t.name}
            </div>
          ))}
        </div>

        {isWide && (
          <div style={{ position: "absolute", bottom: 28, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#AEAEB2", margin: 0 }}>
              © 2026 NERVÜR — Éditeur de Technologies de Croissance
            </p>
          </div>
        )}
      </div>

      {/* Login Form */}
      <div style={{
        ...(isWide ? { width: 480 } : { flex: 1 }),
        background: "#F5F5F7",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: isWide ? "60px" : "36px 20px",
        borderTop: isWide ? "none" : "1px solid #1e1e2a",
        borderLeft: isWide ? "1px solid #1e1e2a" : "none",
      }}>
        <div style={{ maxWidth: 340, width: "100%", margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1D1D1F", marginBottom: 6 }}>
            Connexion
          </h2>
          <p style={{ fontSize: 14, color: "#86868B", marginBottom: 28 }}>
            Accédez à votre espace client
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: "10px 14px",
                marginBottom: 18,
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, color: "#86868B", marginBottom: 6, fontWeight: 500 }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nom@entreprise.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#FFFFFF",
                  border: "1px solid #2a2d3a",
                  borderRadius: 10,
                  color: "#1D1D1F",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E5EA"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: "#86868B", marginBottom: 6, fontWeight: 500 }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#FFFFFF",
                  border: "1px solid #2a2d3a",
                  borderRadius: 10,
                  color: "#1D1D1F",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E5EA"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 0",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: loading ? "wait" : "pointer",
                transition: "background 0.2s, opacity 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = "#818CF8")}
              onMouseLeave={(e) => !loading && (e.target.style.background = "#6366f1")}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid #2a2d3a" }}>
            <p style={{ fontSize: 12, color: "#86868B", lineHeight: 1.6, margin: 0 }}>
              Votre compte est créé par l'équipe NERVÜR lors de votre souscription.
            </p>
            <a href="/contact" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500, display: "inline-block", marginTop: 8 }}>
              Pas encore client ? Contactez-nous →
            </a>
            <p style={{ fontSize: 11, color: "#86868B", lineHeight: 1.6, marginTop: 12 }}>
              En vous connectant, vos données sont traitées conformément à notre{" "}
              <a href="/politique-de-confidentialite" style={{ color: "#6366f1", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                politique de confidentialité
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
