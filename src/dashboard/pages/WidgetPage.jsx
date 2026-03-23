import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

export default function WidgetPage() {
  const { get } = useApi();
  const [business, setBusiness] = useState(null);
  const [embedData, setEmbedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadBusiness(); }, []);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      if (res.businesses[0]) {
        setBusiness(res.businesses[0]);
        await loadEmbed(res.businesses[0]._id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function loadEmbed(bizId) {
    try {
      const res = await get(`/api/sentinel-app/tools/${bizId}/widget/embed`);
      setEmbedData(res);
    } catch (err) { console.error(err); }
  }

  function copyCode() {
    if (embedData?.embedCode) {
      navigator.clipboard.writeText(embedData.embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Chargement...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center", color: "#52525B" }}>Aucune entreprise configurée</div>;

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>Sentinel</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "8px", color: "#FAFAFA" }}>Widget Avis</h1>
        <p style={{ fontSize: "14px", color: "#71717A", lineHeight: 1.6 }}>
          {"Intégrez vos meilleurs avis directement sur votre site web. Le widget affiche automatiquement vos avis 4 et 5 étoiles."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Embed code */}
        <div style={{
          padding: "18px", borderRadius: "10px",
          border: "1px solid #1e1e22", background: "#141416"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#71717A" }}>
              Code d'intégration
            </h3>
            <button onClick={copyCode}
              style={{
                padding: "6px 16px", fontSize: "12px", fontWeight: 600,
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "6px", color: "#6366f1",
                cursor: "pointer", fontFamily: "inherit"
              }}>
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
          <pre style={{
            background: "#0f0f11", borderRadius: "8px", padding: "16px",
            fontSize: "11px", color: "#A1A1AA", overflow: "auto", maxHeight: "400px",
            lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all",
            border: "1px solid #1e1e22"
          }}>
            {embedData?.embedCode || "Chargement..."}
          </pre>
        </div>

        {/* Preview */}
        <div style={{
          padding: "18px", borderRadius: "10px",
          border: "1px solid #1e1e22", background: "#141416"
        }}>
          <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#71717A", marginBottom: "16px" }}>
            Aperçu
          </h3>
          <div style={{
            background: "#FFFFFF", borderRadius: "10px", padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px", fontWeight: 600, color: "#1a1a1a" }}>
                {business.averageRating || "3.7"}/5
              </span>
              <span style={{ color: "#6366f1", fontSize: "18px" }}>&#9733;&#9733;&#9733;&#9733;&#9734;</span>
            </div>
            {[
              { name: "Marie D.", rating: 5, text: "Un vrai coup de coeur ! Les plats sont raffines..." },
              { name: "Thomas B.", rating: 5, text: "Diner exceptionnel pour notre anniversaire..." },
              { name: "Sophie M.", rating: 4, text: "Tres bonne experience dans l'ensemble..." },
            ].map((r, i) => (
              <div key={i} style={{ padding: "10px 0", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>
                  {r.name} — {"★".repeat(r.rating)}
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px", lineHeight: 1.5 }}>{r.text}</div>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "10px", color: "#aaa" }}>
              Propulsé par NERVÜR
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: "24px", padding: "18px", borderRadius: "10px",
        border: "1px solid #1e1e22", background: "#141416"
      }}>
        <h3 style={{ fontSize: "12px", fontWeight: 500, color: "#71717A", marginBottom: "16px" }}>
          Comment intégrer
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            "Copiez le code d'integration ci-dessus",
            "Collez-le dans le HTML de votre site, a l'endroit souhaite",
            "Le widget se charge automatiquement et affiche vos meilleurs avis",
            "Les avis se mettent a jour en temps reel",
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "12px", fontWeight: 600,
                color: "#6366f1", flexShrink: 0
              }}>{i + 1}</span>
              <span style={{ fontSize: "14px", color: "#D4D4D8" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
