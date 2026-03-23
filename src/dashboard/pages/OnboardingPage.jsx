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
  const { post } = useApi();
  const navigate = useNavigate();

  const handleFinish = async () => {
    setLoading(true);
    try {
      await post("/api/sentinel-app/businesses", {
        businessName, sector, googleBusinessUrl: googleUrl
      });
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
            background: i <= step ? "linear-gradient(135deg, #6366f1, #818cf8)" : "#2a2d3a",
            transition: "background 0.5s"
          }} />
        ))}
      </div>

      {/* Step 0: Business name */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#f0f0f3" }}>Comment s'appelle votre entreprise ?</h2>
          <p style={{ color: "#9ca3af", marginBottom: "32px", fontSize: "14px" }}>Ce nom apparaîtra dans les réponses IA aux avis clients.</p>
          <input value={businessName} onChange={e => setBusinessName(e.target.value)}
            placeholder="Ex: Restaurant Le Bon Gout"
            autoFocus
            style={{
              width: "100%", padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", color: "#f0f0f3", fontSize: "16px", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box", marginBottom: "24px"
            }}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; }}
            onBlur={e => { e.target.style.borderColor = "#2a2d3a"; }}
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
          <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#f0f0f3" }}>Quel est votre secteur d'activité ?</h2>
          <p style={{ color: "#9ca3af", marginBottom: "32px", fontSize: "14px" }}>L'IA adaptera le vocabulaire des réponses à votre métier.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "24px" }}>
            {SECTORS.map(s => (
              <button key={s.value} onClick={() => { setSector(s.value); setStep(2); }}
                style={{
                  padding: "16px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                  background: sector === s.value ? "rgba(99,102,241,0.1)" : "transparent",
                  border: `1px solid ${sector === s.value ? "rgba(99,102,241,0.25)" : "#2a2d3a"}`,
                  textAlign: "left", transition: "all 0.2s"
                }}
                onMouseEnter={e => { if (sector !== s.value) e.currentTarget.style.borderColor = "#2a2d3a"; }}
                onMouseLeave={e => { if (sector !== s.value) e.currentTarget.style.borderColor = "#2a2d3a"; }}>
                <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px", color: "#f0f0f3" }}>{s.label}</div>
                <div style={{ fontSize: "12px", color: "#d1d5db" }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Google URL */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#f0f0f3" }}>Votre fiche Google Business</h2>
          <p style={{ color: "#9ca3af", marginBottom: "32px", fontSize: "14px", lineHeight: 1.6 }}>
            Collez le lien de votre fiche Google Business. Sentinel l'utilisera pour scanner vos avis automatiquement.
          </p>
          <input value={googleUrl} onChange={e => setGoogleUrl(e.target.value)}
            placeholder="https://www.google.com/maps/place/..."
            style={{
              width: "100%", padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box", marginBottom: "16px"
            }}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; }}
            onBlur={e => { e.target.style.borderColor = "#2a2d3a"; }} />
          <p style={{ fontSize: "12px", color: "#d1d5db", marginBottom: "24px" }}>
            Pas de lien ? Vous pourrez l'ajouter plus tard dans les parametres.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleFinish} disabled={loading}
              style={nextBtnStyle(loading)}>
              {loading ? "Creation..." : "Terminer la configuration →"}
            </button>
            <button onClick={handleFinish}
              style={{
                padding: "14px 20px", background: "transparent", border: "1px solid #2a2d3a",
                borderRadius: "8px", color: "#9ca3af", fontSize: "13px", cursor: "pointer",
                fontFamily: "inherit"
              }}>
              Passer
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      {step > 0 && (
        <button onClick={() => setStep(s => s - 1)}
          style={{
            marginTop: "24px", background: "none", border: "none", color: "#d1d5db",
            fontSize: "13px", cursor: "pointer", fontFamily: "inherit", padding: 0
          }}>
          ← Retour
        </button>
      )}
    </div>
  );
}

const nextBtnStyle = (disabled) => ({
  padding: "14px 28px", background: disabled ? "#2a2d3a" : "#6366f1", color: "#ffffff",
  border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px",
  cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
  transition: "all 0.2s", opacity: disabled ? 0.5 : 1
});
