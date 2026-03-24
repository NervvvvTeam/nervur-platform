import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      minHeight: "100vh", display: "flex",
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Left — Branding panel */}
      <div style={{
        flex: 1, background: "#09090B", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", padding: "60px",
        position: "relative", overflow: "hidden"
      }}>
        {/* Subtle gradient accent */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <img src="/logo-nav.png" alt="NERVÜR" style={{
          height: "72px", width: "auto", marginBottom: "36px",
          filter: "invert(1) brightness(1.15)", mixBlendMode: "screen", objectFit: "contain",
          position: "relative"
        }} />

        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#FAFAFA", textAlign: "center", marginBottom: "12px", position: "relative" }}>
          Bienvenue sur NERVÜR
        </h1>
        <p style={{ fontSize: "15px", color: "#71717A", textAlign: "center", maxWidth: "360px", lineHeight: 1.6, position: "relative" }}>
          Gérez votre réputation, auditez vos performances, surveillez votre sécurité et boostez votre SEO.
        </p>

        {/* Tool pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "40px", position: "relative", justifyContent: "center" }}>
          {[
            { name: "Sentinel", color: "#ef4444" },
            { name: "Phantom", color: "#8b5cf6" },
            { name: "Vault", color: "#06b6d4" },
            { name: "Atlas", color: "#f59e0b" },
            { name: "Pulse", color: "#ec4899" },
          ].map(t => (
            <div key={t.name} style={{
              padding: "6px 14px", borderRadius: "20px",
              border: `1px solid ${t.color}30`, background: `${t.color}10`,
              fontSize: "12px", color: t.color, fontWeight: 500
            }}>
              {t.name}
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <div style={{ position: "absolute", bottom: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#3f3f46" }}>
            © 2026 NERVÜR — Éditeur de Technologies de Croissance
          </p>
        </div>
      </div>

      {/* Right — Login form */}
      <div style={{
        width: "480px", background: "#111318", display: "flex",
        flexDirection: "column", justifyContent: "center", padding: "60px",
        borderLeft: "1px solid #1e1e2a"
      }}>
        <div style={{ maxWidth: "340px", width: "100%", margin: "0 auto" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "8px" }}>
            Connexion
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "32px" }}>
            Accédez à votre espace client
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: "12px 16px", marginBottom: "20px", borderRadius: "8px",
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171", fontSize: "13px", lineHeight: 1.5
              }}>{error}</div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>
                Adresse email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="nom@entreprise.com"
                style={{
                  width: "100%", padding: "12px 16px", background: "#1e2029",
                  border: "1px solid #2a2d3a", borderRadius: "10px",
                  color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}
                onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#2a2d3a"; e.target.style.boxShadow = "none"; }} />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>
                Mot de passe
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 16px", background: "#1e2029",
                  border: "1px solid #2a2d3a", borderRadius: "10px",
                  color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}
                onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#2a2d3a"; e.target.style.boxShadow = "none"; }} />
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: "#6366f1", color: "#fff",
                border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600, cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit", opacity: loading ? 0.6 : 1,
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#818CF8"; }}
              onMouseLeave={e => { e.target.style.background = "#6366f1"; }}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #2a2d3a" }}>
            <p style={{ fontSize: "12px", color: "#4b5563", lineHeight: 1.6 }}>
              Votre compte est créé par l'équipe NERVÜR lors de votre souscription.
            </p>
            <a href="/contact" style={{
              fontSize: "13px", color: "#6366f1", textDecoration: "none", fontWeight: 500,
              display: "inline-block", marginTop: "8px"
            }}>
              Pas encore client ? Contactez-nous →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
