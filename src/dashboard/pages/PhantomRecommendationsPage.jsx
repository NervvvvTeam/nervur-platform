import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

const CATEGORY_LABELS = {
  performance: "Performance",
  accessibility: "Accessibilité",
  seo: "SEO",
  bestPractices: "Bonnes pratiques",
};

const CATEGORY_COLORS = {
  performance: "#8b5cf6",
  accessibility: "#3b82f6",
  seo: "#10b981",
  bestPractices: "#f59e0b",
};

const SEVERITY_COLORS = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#8b5cf6",
};

export default function PhantomRecommendationsPage() {
  const api = useApi();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await api.get("/api/phantom/recommendations");
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error("Recommendations error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = recommendations.filter(r => {
    if (filterSeverity !== "all" && r.severity !== filterSeverity) return false;
    if (filterCategory !== "all" && r.category !== filterCategory) return false;
    return true;
  });

  const criticalCount = recommendations.filter(r => r.severity === "critical").length;
  const warningCount = recommendations.filter(r => r.severity === "warning").length;
  const infoCount = recommendations.filter(r => r.severity === "info").length;

  const categories = [...new Set(recommendations.map(r => r.category))];

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
          Recommandations
        </h1>
        <p style={{ fontSize: "14px", color: "#71717A" }}>
          Actions priorisées par impact pour améliorer vos sites.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Critiques", count: criticalCount, color: "#ef4444" },
          { label: "Attention", count: warningCount, color: "#f59e0b" },
          { label: "Info", count: infoCount, color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} style={{
            padding: "18px 20px", background: "#141416", border: "1px solid #1e1e22", borderRadius: "10px",
            borderLeft: `3px solid ${s.color}`
          }}>
            <div style={{ fontSize: "24px", fontWeight: 600, color: s.color, marginBottom: "4px" }}>{s.count}</div>
            <div style={{ fontSize: "13px", color: "#71717A" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "18px", flexWrap: "wrap", gap: "10px"
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "critical", "warning", "info"].map(f => (
            <button key={f} onClick={() => setFilterSeverity(f)}
              style={{
                padding: "5px 14px", borderRadius: "6px", border: "none",
                fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                background: filterSeverity === f ? (f === "all" ? "#27272A" : SEVERITY_COLORS[f] + "20") : "transparent",
                color: filterSeverity === f ? (f === "all" ? "#FAFAFA" : SEVERITY_COLORS[f]) : "#71717A",
              }}>
              {f === "all" ? "Tous" : f === "critical" ? "Critiques" : f === "warning" ? "Attention" : "Info"}
            </button>
          ))}
        </div>
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => setFilterCategory("all")}
              style={{
                padding: "5px 14px", borderRadius: "6px", border: "none",
                fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                background: filterCategory === "all" ? "#27272A" : "transparent",
                color: filterCategory === "all" ? "#FAFAFA" : "#71717A",
              }}>Toutes</button>
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCategory(c)}
                style={{
                  padding: "5px 14px", borderRadius: "6px", border: "none",
                  fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                  background: filterCategory === c ? (CATEGORY_COLORS[c] || "#27272A") + "20" : "transparent",
                  color: filterCategory === c ? (CATEGORY_COLORS[c] || "#FAFAFA") : "#71717A",
                }}>
                {CATEGORY_LABELS[c] || c}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#71717A", fontSize: "14px" }}>
          Chargement...
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div style={{
          padding: "60px 24px", textAlign: "center",
          background: "#141416", border: "1px solid #1e1e22", borderRadius: "10px"
        }}>
          <div style={{ fontSize: "16px", color: "#71717A", marginBottom: "8px" }}>
            Aucune recommandation
          </div>
          <p style={{ fontSize: "14px", color: "#52525B" }}>
            Lancez un audit depuis le dashboard Phantom pour obtenir des recommandations.
          </p>
        </div>
      )}

      {/* Recommendations list */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((rec, i) => (
            <div key={i} style={{
              padding: "18px 22px", background: "#141416", border: "1px solid #1e1e22",
              borderRadius: "10px", borderLeft: `3px solid ${SEVERITY_COLORS[rec.severity] || "#71717A"}`
            }}>
              {/* Meta row */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px",
                  background: (SEVERITY_COLORS[rec.severity] || "#71717A") + "18",
                  color: SEVERITY_COLORS[rec.severity] || "#71717A",
                }}>
                  {rec.severity === "critical" ? "Critique" : rec.severity === "warning" ? "Attention" : "Info"}
                </span>
                <span style={{
                  fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                  background: (CATEGORY_COLORS[rec.category] || "#71717A") + "14",
                  color: CATEGORY_COLORS[rec.category] || "#71717A",
                }}>
                  {CATEGORY_LABELS[rec.category] || rec.category}
                </span>
                <span style={{ fontSize: "11px", color: "#52525B" }}>{rec.domain}</span>
                {rec.impact && (
                  <span style={{ fontSize: "11px", color: "#10b981", marginLeft: "auto", fontWeight: 500 }}>
                    {rec.impact}
                  </span>
                )}
              </div>

              {/* Title */}
              <div style={{ fontSize: "15px", fontWeight: 500, color: "#E4E4E7", marginBottom: "6px" }}>
                {rec.title}
              </div>

              {/* Description */}
              {rec.description && (
                <div style={{ fontSize: "13px", color: "#71717A", lineHeight: 1.6, marginBottom: rec.fix ? "8px" : 0 }}>
                  {rec.description}
                </div>
              )}

              {/* Fix */}
              {rec.fix && (
                <div style={{
                  fontSize: "13px", color: "#D4D4D8", lineHeight: 1.6,
                  padding: "10px 14px", background: "#0f0f11",
                  borderRadius: "6px", border: "1px solid #1e1e22", marginTop: "8px"
                }}>
                  <span style={{ color: "#8b5cf6", fontWeight: 500 }}>Solution : </span>
                  {rec.fix}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
