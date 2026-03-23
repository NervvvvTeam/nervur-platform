import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

export default function AlertsPage() {
  const { get, put } = useApi();
  const [business, setBusiness] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadBusiness(); }, []);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      if (res.businesses[0]) {
        setBusiness(res.businesses[0]);
        await loadAlerts(res.businesses[0]._id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function loadAlerts(bizId) {
    try {
      const res = await get(`/api/sentinel-app/tools/${bizId}/alerts`);
      setConfig(res.config);
    } catch (err) { console.error(err); }
  }

  async function saveConfig() {
    setSaving(true);
    try {
      const res = await put(`/api/sentinel-app/tools/${business._id}/alerts`, config);
      setConfig(res.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  function toggle(key) {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Chargement...</div>;
  if (!business || !config) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Aucune entreprise configurée</div>;

  const Toggle = ({ value, onToggle, label, desc }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 0", borderBottom: "1px solid #1e1e22"
    }}>
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "#D4D4D8", marginBottom: "4px" }}>{label}</div>
        {desc && <div style={{ fontSize: "12px", color: "#52525B" }}>{desc}</div>}
      </div>
      <div onClick={onToggle} style={{
        width: "44px", height: "24px", borderRadius: "12px", cursor: "pointer",
        background: value ? "#6366f1" : "#27272A",
        position: "relative", transition: "background 0.2s"
      }}>
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%", background: "#FAFAFA",
          position: "absolute", top: "3px",
          left: value ? "23px" : "3px", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>Sentinel</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#FAFAFA" }}>Alertes</h1>
        <p style={{ fontSize: "14px", color: "#71717A" }}>
          Recevez des notifications par email quand un nouvel avis est publie.
        </p>
      </div>

      {/* Email */}
      <div style={{
        padding: "18px", borderRadius: "10px",
        border: "1px solid #1e1e22", background: "#141416",
        marginBottom: "20px"
      }}>
        <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#71717A", marginBottom: "16px" }}>
          Adresse email
        </h3>
        <input value={config.emailTo || ""} onChange={e => setConfig(prev => ({ ...prev, emailTo: e.target.value }))}
          placeholder="votre@email.com" type="email"
          style={{
            width: "100%", padding: "14px 16px", background: "#0f0f11",
            border: "1px solid #27272A", borderRadius: "8px",
            color: "#FAFAFA", fontSize: "14px", fontFamily: "inherit", outline: "none",
            boxSizing: "border-box", transition: "border-color 0.2s"
          }}
          onFocus={e => e.target.style.borderColor = "#ef4444"}
          onBlur={e => e.target.style.borderColor = "#27272A"} />
      </div>

      {/* Toggles */}
      <div style={{
        padding: "18px", borderRadius: "10px",
        border: "1px solid #1e1e22", background: "#141416",
        marginBottom: "20px"
      }}>
        <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#71717A", marginBottom: "8px" }}>
          Notifications
        </h3>

        <Toggle value={config.enabled} onToggle={() => toggle("enabled")}
          label="Alertes activées" desc="Activer ou désactiver toutes les alertes" />

        <Toggle value={config.alertOnNegative} onToggle={() => toggle("alertOnNegative")}
          label="Alerte avis négatif" desc={`Notification immédiate pour les avis de ${config.thresholdRating} étoiles ou moins`} />

        <Toggle value={config.alertOnPositive} onToggle={() => toggle("alertOnPositive")}
          label="Alerte avis positif" desc="Notification pour les avis 4-5 étoiles" />

        <Toggle value={config.dailyDigest} onToggle={() => toggle("dailyDigest")}
          label="Résumé quotidien" desc="Un email par jour récapitulant les nouveaux avis" />

        <Toggle value={config.weeklyReport} onToggle={() => toggle("weeklyReport")}
          label="Rapport hebdomadaire" desc="Un resume chaque lundi avec les stats de la semaine" />
      </div>

      {/* Threshold */}
      <div style={{
        padding: "18px", borderRadius: "10px",
        border: "1px solid #1e1e22", background: "#141416",
        marginBottom: "20px"
      }}>
        <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#71717A", marginBottom: "16px" }}>
          Seuil d'alerte négatif
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => setConfig(prev => ({ ...prev, thresholdRating: n }))}
              style={{
                padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
                background: config.thresholdRating === n ? "rgba(239,68,68,0.1)" : "#0f0f11",
                border: `1px solid ${config.thresholdRating === n ? "rgba(239,68,68,0.3)" : "#27272A"}`,
                color: config.thresholdRating === n ? "#ef4444" : "#71717A",
                cursor: "pointer", fontFamily: "inherit"
              }}>
              {"★".repeat(n) + "☆".repeat(5 - n)} et moins
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={saveConfig} disabled={saving}
        style={{
          padding: "14px 32px", background: saved ? "#6366f1" : "#6366f1",
          color: "#FAFAFA", border: "none", borderRadius: "8px", fontSize: "14px",
          fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
          opacity: saving ? 0.7 : 1
        }}>
        {saved ? "Sauvegardé !" : saving ? "Sauvegarde..." : "Sauvegarder"}
      </button>
    </div>
  );
}
