import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const SENTINEL_NAV = [
  { path: "/app/sentinel", label: "Dashboard", end: true },
  { path: "/app/reviews", label: "Avis clients" },
  { path: "/app/analytics", label: "Analyse IA" },
  { path: "/app/competitors", label: "Concurrents" },
  { path: "/app/reports", label: "Rapports" },
  { path: "/app/qrcode", label: "QR Code" },
  { path: "/app/widget", label: "Widget" },
  { path: "/app/alerts", label: "Alertes" },
  { path: "/app/settings", label: "Paramètres" },
];

const SECTORS = [
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hôtel" },
  { value: "garage", label: "Garage auto" },
  { value: "salon", label: "Salon coiffure/beauté" },
  { value: "commerce", label: "Commerce" },
  { value: "medical", label: "Médical / Dentaire" },
  { value: "immobilier", label: "Immobilier" },
  { value: "autre", label: "Autre" },
];

export default function SettingsPage() {
  const { get, put, del } = useApi();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ businessName: "", sector: "autre", googleBusinessUrl: "" });

  useEffect(() => { loadBusiness(); }, []);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      const biz = res.businesses[0];
      if (biz) {
        setBusiness(biz);
        setForm({ businessName: biz.businessName, sector: biz.sector, googleBusinessUrl: biz.googleBusinessUrl || "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!business) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await put(`/api/sentinel-app/businesses/${business._id}`, form);
      setBusiness(res.business);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function toggleMode() {
    if (!business) return;
    const newMode = business.mode === "auto" ? "manual" : "auto";
    try {
      const res = await put(`/api/sentinel-app/businesses/${business._id}/mode`, { mode: newMode });
      setBusiness(res.business);
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleScan() {
    if (!business) return;
    try {
      const res = await put(`/api/sentinel-app/businesses/${business._id}`, { scanEnabled: !business.scanEnabled });
      setBusiness(res.business);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#334155" }}>Chargement...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center", color: "#334155" }}>Aucune entreprise configurée. <a href="/app/onboarding" style={{ color: "#6C5CE7" }}>Configurer →</a></div>;

  return (
    <div style={{ maxWidth: "600px" }}>
      <SubNav color="#ef4444" items={SENTINEL_NAV} />
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #ef4444, #f97316)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>Paramètres</h1>
        <p style={{ fontSize: "14px", color: "#64748B" }}>Configurez votre entreprise et vos préférences.</p>
      </div>

      <Section title="Informations entreprise">
        <Field label="Nom de l'entreprise" value={form.businessName}
          onChange={v => setForm(f => ({ ...f, businessName: v }))} />
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Secteur d'activité</label>
          <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <Field label="URL Google Business" value={form.googleBusinessUrl}
          onChange={v => setForm(f => ({ ...f, googleBusinessUrl: v }))}
          placeholder="https://www.google.com/maps/place/..." />
        <button onClick={handleSave} disabled={saving}
          style={{
            padding: "10px 24px", background: "#6C5CE7", color: "#ffffff",
            border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px",
            cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
            transition: "all 0.3s"
          }}>
          {saving ? "Sauvegarde..." : saved ? "Sauvegardé" : "Sauvegarder"}
        </button>
      </Section>

      <Section title="Mode de réponse">
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <ModeButton active={business.mode === "manual"} label="Manuel" desc="L'IA genere, vous decidez" onClick={() => business.mode !== "manual" && toggleMode()} />
          <ModeButton active={business.mode === "auto"} label="Automatique" desc="L'IA repond 24/7" onClick={() => business.mode !== "auto" && toggleMode()} />
        </div>
        <p style={{ fontSize: "12px", color: "#334155", lineHeight: 1.6 }}>
          {business.mode === "auto"
            ? "Les réponses sont générées et publiées automatiquement sur Google. Vous pouvez toujours les modifier après."
            : "Les réponses IA sont générées automatiquement. Vous les validez et publiez manuellement depuis le dashboard."
          }
        </p>
      </Section>

      <Section title="Scan automatique">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "4px", color: "#334155" }}>Scanner les avis toutes les heures</div>
            <div style={{ fontSize: "12px", color: "#334155" }}>
              {business.lastScanAt ? `Dernier scan : ${new Date(business.lastScanAt).toLocaleString("fr-FR")}` : "Jamais scanné"}
            </div>
          </div>
          <button onClick={toggleScan}
            style={{
              width: "48px", height: "28px", borderRadius: "14px", border: "none", cursor: "pointer",
              background: business.scanEnabled ? "#6C5CE7" : "#3a3d4a",
              position: "relative", transition: "background 0.3s"
            }}>
            <div style={{
              width: "22px", height: "22px", borderRadius: "11px", background: "#0F172A",
              position: "absolute", top: "3px",
              left: business.scanEnabled ? "23px" : "3px",
              transition: "left 0.3s"
            }} />
          </button>
        </div>
      </Section>

      <Section title="Connexion Google Business">
        <div style={{
          padding: "18px", borderRadius: "8px", background: "#E8E9EC",
          border: "1px solid #2a2d3a", boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "4px",
              background: business.googleAccessToken ? "#6C5CE7" : "#ef4444"
            }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
              {business.googleAccessToken ? "Connecté" : "Non connecté"}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "#334155", marginBottom: "16px", lineHeight: 1.6 }}>
            Connectez votre compte Google Business pour scanner automatiquement les avis et publier les réponses.
          </p>
          <button onClick={async () => {
            try {
              const res = await get(`/api/sentinel/oauth/url`);
              window.location.href = res.url;
            } catch (err) { console.error(err); }
          }}
            style={{
              padding: "10px 20px", background: business.googleAccessToken ? "transparent" : "#6C5CE7",
              border: business.googleAccessToken ? "1px solid #2a2d3a" : "none",
              borderRadius: "8px", color: "#ffffff", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit"
            }}>
            {business.googleAccessToken ? "Reconnecter Google" : "Connecter Google"}
          </button>
        </div>
      </Section>

      <Section title="Réinitialiser les données">
        <p style={{ fontSize: "12px", color: "#64748B", marginBottom: "16px", lineHeight: 1.6 }}>
          Supprimer tous les avis, réponses et historiques de votre compte. Cette action est irréversible.
        </p>
        <button onClick={async () => {
          if (!window.confirm("⚠️ Êtes-vous sûr ? Toutes les données Sentinel seront supprimées définitivement.")) return;
          try {
            const res = await del(`/api/sentinel/reset`);
            alert(`✅ Données réinitialisées : ${res.deleted?.reviews || 0} avis, ${res.deleted?.responses || 0} réponses supprimés.`);
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert("Erreur lors de la réinitialisation");
          }
        }}
          style={{
            padding: "10px 20px", background: "transparent",
            border: "1px solid #ef4444", borderRadius: "8px",
            color: "#ef4444", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit"
          }}>
          🗑️ Réinitialiser toutes les données
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      border: "1px solid #2a2d3a", borderRadius: "10px", padding: "18px",
      background: "#E8E9EC", marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    }}>
      <div style={{ fontSize: "12px", fontWeight: 500, color: "#64748B", marginBottom: "20px" }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = "#6C5CE7"; }}
        onBlur={e => { e.target.style.borderColor = "#E2E8F0"; }} />
    </div>
  );
}

function ModeButton({ active, label, desc, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "16px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
      background: active ? "rgba(99,102,241,0.1)" : "transparent",
      border: `1px solid ${active ? "rgba(99,102,241,0.25)" : "#E2E8F0"}`,
      textAlign: "left", transition: "all 0.3s"
    }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: active ? "#6C5CE7" : "#64748B", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "#334155" }}>{desc}</div>
    </button>
  );
}

const labelStyle = { display: "block", fontSize: "12px", fontWeight: 500, color: "#64748B", marginBottom: "8px" };
const inputStyle = {
  width: "100%", padding: "12px 14px", background: "#E8E9EC", border: "1px solid #2a2d3a",
  borderRadius: "8px", color: "#334155", fontSize: "14px", fontFamily: "inherit",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
};
