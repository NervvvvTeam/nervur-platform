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
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#101118", padding: "20px", fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-block", padding: "24px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", marginBottom: "4px" }}>
            <img src="/logo-nav.png" alt="NERVÜR" style={{
              height: "56px", width: "auto",
              filter: "invert(1) brightness(1.15)", mixBlendMode: "screen", objectFit: "contain"
            }} />
          </div>
          <div style={{ fontSize: "16px", color: "rgba(99,102,241,0.35)", fontWeight: 700, letterSpacing: "3px", marginBottom: "8px" }}>NERVÜR</div>
          <div style={{ fontSize: "13px", color: "#818CF8", fontWeight: 400 }}>Espace client</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: "12px 16px", marginBottom: "20px", borderRadius: "8px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
              color: "#f87171", fontSize: "13px"
            }}>{error}</div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "6px", fontWeight: 500 }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="nom@entreprise.com"
              style={{
                width: "100%", padding: "10px 14px", background: "#0c0d14",
                border: "1px solid #27272A", borderRadius: "8px",
                color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s"
              }}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "#27272A"; e.target.style.boxShadow = "none"; }} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "#A1A1AA", marginBottom: "6px", fontWeight: 500 }}>
              Mot de passe
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: "100%", padding: "10px 14px", background: "#0c0d14",
                border: "1px solid #27272A", borderRadius: "8px",
                color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s"
              }}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "#27272A"; e.target.style.boxShadow = "none"; }} />
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "10px",
              background: "linear-gradient(135deg, #6366f1, #818CF8)", color: "#fff", border: "none", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500, cursor: loading ? "wait" : "pointer",
              fontFamily: "inherit", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s",
              boxShadow: "0 4px 16px rgba(99,102,241,0.25)"
            }}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#52525B", marginTop: "28px" }}>
          {"Votre compte est créé par l'équipe NERVÜR."}
        </p>
      </div>
    </div>
  );
}
