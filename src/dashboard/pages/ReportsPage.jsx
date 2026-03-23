import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

export default function ReportsPage() {
  const { get } = useApi();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadBusiness(); }, []);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      if (res.businesses[0]) setBusiness(res.businesses[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function downloadReport() {
    setGenerating(true);
    try {
      const token = localStorage.getItem("sentinel_token");
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/sentinel-app/tools/${business._id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erreur de génération");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-${business.businessName.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du rapport");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Chargement...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Aucune entreprise configurée</div>;

  const now = new Date();
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #ef4444, #f97316)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>Rapports</h1>
        <p style={{ fontSize: "14px", color: "#71717A" }}>
          Générez un rapport PDF complet de votre e-réputation.
        </p>
      </div>

      {/* Current month report */}
      <div style={{
        padding: "18px", borderRadius: "10px",
        border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.06)",
        marginBottom: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#FAFAFA" }}>
              Rapport {months[now.getMonth()]} {now.getFullYear()}
            </h3>
            <p style={{ fontSize: "14px", color: "#71717A", lineHeight: 1.6 }}>
              Vue d'ensemble, analyse sémantique, sentiments, points forts et axes d'amélioration.
            </p>
          </div>
          <button onClick={downloadReport} disabled={generating}
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #ef4444, #f97316)",
              color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px",
              fontWeight: 600, cursor: generating ? "wait" : "pointer", fontFamily: "inherit",
              opacity: generating ? 0.7 : 1, whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: "0 4px 16px rgba(239,68,68,0.4)"
            }}>
            {generating ? "Génération..." : "Télécharger PDF"}
          </button>
        </div>
      </div>

      {/* Report contents info */}
      <div style={{
        padding: "18px", borderRadius: "10px",
        border: "1px solid #1e1e22", background: "#141416"
      }}>
        <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#71717A", marginBottom: "20px" }}>
          Contenu du rapport
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { icon: "1", title: "Vue d'ensemble", desc: "Score global, total avis, taux de réponse" },
            { icon: "2", title: "Répartition des sentiments", desc: "Positifs, négatifs, mixtes avec pourcentages" },
            { icon: "3", title: "Analyse sémantique", desc: "Scores par thème (service, cuisine, ambiance...)" },
            { icon: "4", title: "Points forts & axes d'amélioration", desc: "Identifiés automatiquement par l'IA" },
            { icon: "5", title: "Derniers avis", desc: "Les 5 avis les plus récents avec détails" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{
                width: "26px", height: "26px", borderRadius: "6px",
                background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "12px", fontWeight: 600,
                color: "#ef4444", flexShrink: 0
              }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#D4D4D8", marginBottom: "2px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "#71717A" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto report info */}
      <div style={{
        marginTop: "20px", padding: "18px", borderRadius: "10px",
        border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.06)",
        display: "flex", gap: "12px", alignItems: "center"
      }}>
        <span style={{ fontSize: "14px", color: "#ef4444", flexShrink: 0 }}>i</span>
        <p style={{ fontSize: "13px", color: "#A1A1AA", lineHeight: 1.6, margin: 0 }}>
          {"Le rapport mensuel automatique sera bientôt disponible. Il sera envoyé par email le 1er de chaque mois."}
        </p>
      </div>
    </div>
  );
}
