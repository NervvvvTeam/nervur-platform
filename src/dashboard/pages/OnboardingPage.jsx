import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

const SECTORS = [
  { value: "restaurant", label: "Restaurant", desc: "Restauration, cafe, brasserie" },
  { value: "hotel", label: "Hôtel", desc: "Hébergement, B&B, gîte" },
  { value: "garage", label: "Garage", desc: "Automobile, mecanique" },
  { value: "salon", label: "Salon", desc: "Coiffure, esthétique, beauté" },
  { value: "commerce", label: "Commerce", desc: "Boutique, retail, e-commerce" },
  { value: "medical", label: "Médical", desc: "Cabinet, clinique, dentaire" },
  { value: "immobilier", label: "Immobilier", desc: "Agence, gestion locative" },
  { value: "autre", label: "Autre", desc: "Autre secteur" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [sector, setSector] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { post, get } = useApi();
  const navigate = useNavigate();

  const handleFinish = async (connectGoogle = false) => {
    setLoading(true);
    try {
      const result = await post("/api/sentinel-app/businesses", {
        businessName, sector, googleBusinessUrl: googleUrl
      });
      if (connectGoogle && result.business?._id) {
        // Get Google OAuth URL and redirect
        const authRes = await get(`/api/sentinel-app/businesses/${result.business._id}/google-auth-url`);
        if (authRes.url) {
          window.location.href = authRes.url;
          return;
        }
      }
      navigate("/app/sentinel");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "520px", margin: "0 auto", padding: "40px 20px"
    }}>
      {/* Progress */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "48px" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "2px",
            background: i <= step ? "linear-gradient(135deg, #6366f1, #818cf8)" : "#E5E5EA",
            transition: "background 0.5s"
          }} />
        ))}
      </div>

      {/* Step 0: Business name */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#1D1D1F" }}>Comment s'appelle votre entreprise ?</h2>
          <p style={{ color: "#86868B", marginBottom: "32px", fontSize: "14px" }}>Ce nom apparaîtra dans les réponses IA aux avis clients.</p>
          <input value={businessName} onChange={e => setBusinessName(e.target.value)}
            placeholder="Ex: Restaurant Le Bon Gout"
            autoFocus
            style={{
              width: "100%", padding: "16px", background: "#FFFFFF", border: "1px solid #2a2d3a",
              borderRadius: "8px", color: "#1D1D1F", fontSize: "16px", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box", marginBottom: "24px"
            }}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; }}
            onBlur={e => { e.target.style.borderColor = "#E5E5EA"; }}
            onKeyDown={e => { if (e.key === "Enter" && businessName.trim()) setStep(1); }} />
          <button onClick={() => setStep(1)} disabled={!businessName.trim()}
            style={nextBtnStyle(!businessName.trim())}>
            Continuer →
          </button>
        </div>
      )}

      {/* Step 1: Sector */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#1D1D1F" }}>Quel est votre secteur d'activité ?</h2>
          <p style={{ color: "#86868B", marginBottom: "32px", fontSize: "14px" }}>L'IA adaptera le vocabulaire des réponses à votre métier.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "24px" }}>
            {SECTORS.map(s => (
              <button key={s.value} onClick={() => { setSector(s.value); setStep(2); }}
                style={{
                  padding: "16px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                  background: sector === s.value ? "rgba(99,102,241,0.1)" : "transparent",
                  border: `1px solid ${sector === s.value ? "rgba(99,102,241,0.25)" : "#E5E5EA"}`,
                  textAlign: "left", transition: "all 0.2s"
                }}
                onMouseEnter={e => { if (sector !== s.value) e.currentTarget.style.borderColor = "#E5E5EA"; }}
                onMouseLeave={e => { if (sector !== s.value) e.currentTarget.style.borderColor = "#E5E5EA"; }}>
                <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px", color: "#1D1D1F" }}>{s.label}</div>
                <div style={{ fontSize: "12px", color: "#424245" }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Google URL */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#1D1D1F" }}>Connectez votre fiche Google</h2>
          <p style={{ color: "#86868B", marginBottom: "32px", fontSize: "14px", lineHeight: 1.6 }}>
            Sentinel scannera automatiquement vos avis Google pour analyser votre e-réputation.
          </p>

          {/* Option 1: Paste URL */}
          <div style={{
            padding: "20px", borderRadius: "10px", border: "1px solid #2a2d3a",
            background: "#FFFFFF", marginBottom: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1D1D1F" }}>Coller le lien Google Maps</div>
                <div style={{ fontSize: "12px", color: "#86868B" }}>Recherchez votre entreprise sur Google Maps et copiez le lien</div>
              </div>
            </div>
            <input value={googleUrl} onChange={e => setGoogleUrl(e.target.value)}
              placeholder="https://www.google.com/maps/place/..."
              style={{
                width: "100%", padding: "14px 16px", background: "#FFFFFF", border: "1px solid #2a2d3a",
                borderRadius: "8px", color: "#1D1D1F", fontSize: "14px", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box"
              }}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; }}
              onBlur={e => { e.target.style.borderColor = "#E5E5EA"; }} />
          </div>

          {/* Option 2: Google OAuth */}
          <div onClick={() => handleFinish(true)} style={{
            padding: "20px", borderRadius: "10px", border: "1px solid rgba(234,67,53,0.3)",
            background: "#FFFFFF", marginBottom: "24px", cursor: "pointer", transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(234,67,53,0.6)"; e.currentTarget.style.background = "rgba(234,67,53,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(234,67,53,0.3)"; e.currentTarget.style.background = "#FFFFFF"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "rgba(234,67,53,0.1)", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1D1D1F" }}>Se connecter avec Google</div>
                <div style={{ fontSize: "12px", color: "#86868B" }}>Accès direct à tous vos avis Google</div>
              </div>
              <span style={{
                marginLeft: "auto", fontSize: "10px", fontWeight: 600,
                padding: "3px 8px", borderRadius: "4px",
                background: "rgba(52,168,83,0.1)", color: "#34A853"
              }}>RECOMMANDÉ</span>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "#86868B", marginBottom: "24px", textAlign: "center" }}>
            Vous pourrez ajouter ou modifier le lien plus tard dans les Paramètres.
          </p>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleFinish} disabled={loading}
              style={nextBtnStyle(loading)}>
              {loading ? "Création..." : googleUrl ? "Terminer la configuration →" : "Continuer sans Google →"}
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)}
          style={{
            marginTop: "24px", background: "none", border: "none", color: "#424245",
            fontSize: "13px", cursor: "pointer", fontFamily: "inherit", padding: 0
          }}>
          ← Retour
        </button>
      )}
    </div>
  );
}

const nextBtnStyle = (disabled) => ({
  padding: "14px 28px", background: disabled ? "#E5E5EA" : "#6366f1", color: "#ffffff",
  border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px",
  cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
  transition: "all 0.2s", opacity: disabled ? 0.5 : 1
});
