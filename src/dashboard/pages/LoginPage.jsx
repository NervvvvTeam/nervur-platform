import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LogoNervur from "../../components/LogoNervur";

const C = {
  bg: "#FFFFFF", bgAlt: "#F8FAFC", text: "#0F172A", body: "#334155",
  muted: "#64748B", accent: "#4F46E5", accentHover: "#4338CA",
  accentLight: "#EEF2FF", border: "#E2E8F0",
};
const FONT = "'Inter', system-ui, -apple-system, sans-serif";

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

  const inputStyle = {
    width: "100%", padding: "12px 14px", background: C.bg,
    border: `1px solid ${C.border}`, borderRadius: "10px",
    color: C.text, fontSize: "14px", fontFamily: FONT,
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      flexDirection: isWide ? "row" : "column",
      fontFamily: FONT, background: C.bg,
    }}>

      {/* Left — Branding */}
      <div style={{
        background: C.text, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: isWide ? "60px" : "48px 20px",
        position: "relative",
        ...(isWide ? { flex: 1 } : { minHeight: "200px" }),
      }}>
        <button onClick={() => navigate("/")} style={{
          position: "absolute", top: isWide ? 24 : 16, left: isWide ? 24 : 16,
          background: "#E2E8F0", border: "1px solid #E2E8F0",
          borderRadius: "8px", color: "rgba(255,255,255,0.5)", fontSize: "13px",
          padding: "8px 16px", cursor: "pointer", fontFamily: FONT, transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.target.style.background = "#E2E8F0"; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.background = "#E2E8F0"; e.target.style.color = "rgba(255,255,255,0.5)"; }}
        >&#8592; Retour au site</button>

        <LogoNervur height={isWide ? 56 : 40} onClick={() => navigate("/")} variant="dark" style={{ marginBottom: isWide ? 24 : 12 }} />
        <h1 style={{ fontSize: isWide ? "28px" : "20px", fontWeight: 700, color: "#FFFFFF", textAlign: "center", marginBottom: "8px" }}>
          Bienvenue sur NERVÜR
        </h1>
        <p style={{ fontSize: isWide ? "15px" : "13px", color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: "340px", lineHeight: 1.6, margin: 0 }}>
          Gerez votre reputation et votre conformite juridique.
        </p>
        <div style={{ display: "flex", gap: "8px", marginTop: isWide ? "24px" : "16px" }}>
          {[{ name: "Sentinel", color: "#DC2626" }, { name: "Vault", color: "#0891B2" }].map(t => (
            <span key={t.name} style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, border: `1px solid ${t.color}40`, background: `${t.color}15`, color: t.color }}>{t.name}</span>
          ))}
        </div>
        {isWide && <p style={{ position: "absolute", bottom: "24px", fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>NERVÜR 2026</p>}
      </div>

      {/* Right — Login Form */}
      <div style={{
        ...(isWide ? { width: "480px" } : { flex: 1 }),
        background: C.bgAlt, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: isWide ? "60px" : "36px 20px",
        borderLeft: isWide ? `1px solid ${C.border}` : "none",
      }}>
        <div style={{ maxWidth: "340px", width: "100%", margin: "0 auto" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>Connexion</h2>
          <p style={{ fontSize: "14px", color: C.muted, marginBottom: "28px" }}>Accedez a votre espace client</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: "10px 14px", marginBottom: "18px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#DC2626", fontSize: "13px", lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", color: C.body, marginBottom: "6px", fontWeight: 500 }}>Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="nom@entreprise.com" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", color: C.body, marginBottom: "6px", fontWeight: 500 }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px 0", background: C.accent, color: "#fff",
              border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
              fontFamily: FONT, cursor: loading ? "wait" : "pointer",
              transition: "background 0.2s, opacity 0.2s", opacity: loading ? 0.6 : 1,
            }}
              onMouseEnter={e => !loading && (e.target.style.background = C.accentHover)}
              onMouseLeave={e => !loading && (e.target.style.background = C.accent)}
            >{loading ? "Connexion..." : "Se connecter"}</button>
          </form>

          <div style={{ marginTop: "28px", paddingTop: "18px", borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: "12px", color: C.muted, lineHeight: 1.6, margin: 0 }}>
              Votre compte est cree par l'equipe NERVÜR lors de votre souscription.
            </p>
            <a href="/contact" style={{ fontSize: "13px", color: C.accent, textDecoration: "none", fontWeight: 500, display: "inline-block", marginTop: "8px" }}>
              Pas encore client ? Contactez-nous &#8594;
            </a>
            <p style={{ fontSize: "11px", color: C.muted, lineHeight: 1.6, marginTop: "12px" }}>
              En vous connectant, vos donnees sont traitees conformement a notre{" "}
              <a href="/confidentialite" style={{ color: C.accent, textDecoration: "underline", textUnderlineOffset: "3px" }}>politique de confidentialite</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
