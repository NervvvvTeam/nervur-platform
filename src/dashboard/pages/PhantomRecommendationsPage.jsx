import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PHANTOM_NAV = [
  { path: "/app/phantom", label: "Audit", end: true },
  { path: "/app/phantom/history", label: "Historique" },
  { path: "/app/phantom/recommendations", label: "Recommandations" },
  { path: "/app/phantom/competitors", label: "Concurrents" },
  { path: "/app/phantom/schedule", label: "Planification" },
];

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

const CATEGORY_ICONS = {
  performance: "\u26a1",
  accessibility: "\u267f",
  seo: "\ud83d\udd0d",
  bestPractices: "\u2705",
};

const SEVERITY_COLORS = {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#8b5cf6",
};

const PRIORITY_CONFIG = {
  critical: { label: "Critique", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  warning: { label: "Important", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  info: { label: "Optionnel", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
};

function getEstimatedImpact(severity, impact) {
  // Parse the impact string if available, otherwise derive from severity
  if (impact) {
    const num = parseInt(impact.replace(/[^0-9]/g, ""));
    if (num >= 10) return { label: "Impact élevé", color: "#ef4444", bg: "rgba(239,68,68,0.10)" };
    if (num >= 5) return { label: "Impact moyen", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" };
    return { label: "Impact faible", color: "#10b981", bg: "rgba(16,185,129,0.10)" };
  }
  if (severity === "critical") return { label: "Impact élevé", color: "#ef4444", bg: "rgba(239,68,68,0.10)" };
  if (severity === "warning") return { label: "Impact moyen", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" };
  return { label: "Impact faible", color: "#10b981", bg: "rgba(16,185,129,0.10)" };
}

export default function PhantomRecommendationsPage() {
  const api = useApi();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState("category"); // "category" or "list"

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

  // Group filtered recommendations by category
  const groupedByCategory = {};
  const categoryOrder = ["performance", "seo", "accessibility", "bestPractices"];
  categoryOrder.forEach(cat => { groupedByCategory[cat] = []; });
  filtered.forEach(r => {
    const cat = r.category || "performance";
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(r);
  });

  const renderRecCard = (rec, i) => {
    const priority = PRIORITY_CONFIG[rec.severity] || PRIORITY_CONFIG.info;
    const impact = getEstimatedImpact(rec.severity, rec.impact);

    return (
      <div key={`${rec.domain}-${i}`} style={{
        padding: "18px 22px", background: "#1e2029", border: "1px solid #2a2d3a",
        borderRadius: "10px", borderLeft: `3px solid ${SEVERITY_COLORS[rec.severity] || "#9ca3af"}`
      }}>
        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
          {/* Priority badge */}
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "4px",
            background: priority.bg, color: priority.color, border: `1px solid ${priority.border}`,
          }}>
            {priority.label}
          </span>

          {/* Category badge */}
          <span style={{
            fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
            background: (CATEGORY_COLORS[rec.category] || "#9ca3af") + "14",
            color: CATEGORY_COLORS[rec.category] || "#9ca3af",
          }}>
            {CATEGORY_LABELS[rec.category] || rec.category}
          </span>

          {/* Domain */}
          <span style={{ fontSize: "11px", color: "#d1d5db" }}>{rec.domain}</span>

          {/* Impact badge */}
          <span style={{
            fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px",
            background: impact.bg, color: impact.color, marginLeft: "auto",
          }}>
            {impact.label}
          </span>

          {/* Raw impact value */}
          {rec.impact && (
            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 500 }}>
              {rec.impact}
            </span>
          )}
        </div>

        {/* Title */}
        <div style={{ fontSize: "15px", fontWeight: 500, color: "#d1d5db", marginBottom: "6px" }}>
          {rec.title}
        </div>

        {/* Description */}
        {rec.description && (
          <div style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.6, marginBottom: rec.fix ? "8px" : 0 }}>
            {rec.description}
          </div>
        )}

        {/* Fix */}
        {rec.fix && (
          <div style={{
            fontSize: "13px", color: "#d1d5db", lineHeight: 1.6,
            padding: "10px 14px", background: "#161820",
            borderRadius: "6px", border: "1px solid #2a2d3a", marginTop: "8px"
          }}>
            <span style={{ color: "#8b5cf6", fontWeight: 500 }}>Solution : </span>
            {rec.fix}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      <SubNav color="#8b5cf6" items={PHANTOM_NAV} />
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          Recommandations
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          Actions priorisées par impact pour améliorer vos sites.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Critique", sublabel: "Impact élevé", count: criticalCount, color: "#ef4444" },
          { label: "Important", sublabel: "Impact moyen", count: warningCount, color: "#f59e0b" },
          { label: "Optionnel", sublabel: "Impact faible", count: infoCount, color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{
            padding: "18px 20px", background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px",
            borderLeft: `3px solid ${s.color}`
          }}>
            <div style={{ fontSize: "24px", fontWeight: 600, color: s.color, marginBottom: "4px" }}>{s.count}</div>
            <div style={{ fontSize: "13px", color: "#d1d5db", fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>{s.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Filters + view toggle */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "18px", flexWrap: "wrap", gap: "10px"
      }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["all", "critical", "warning", "info"].map(f => (
            <button key={f} onClick={() => setFilterSeverity(f)}
              style={{
                padding: "5px 14px", borderRadius: "6px", border: "none",
                fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                background: filterSeverity === f ? (f === "all" ? "#2a2d3a" : SEVERITY_COLORS[f] + "20") : "transparent",
                color: filterSeverity === f ? (f === "all" ? "#f0f0f3" : SEVERITY_COLORS[f]) : "#9ca3af",
              }}>
              {f === "all" ? "Tous" : f === "critical" ? "Critique" : f === "warning" ? "Important" : "Optionnel"}
            </button>
          ))}

          <div style={{ width: "1px", background: "#2a2d3a", margin: "0 4px" }} />

          {categories.length > 1 && categories.map(c => (
            <button key={c} onClick={() => setFilterCategory(filterCategory === c ? "all" : c)}
              style={{
                padding: "5px 14px", borderRadius: "6px", border: "none",
                fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                background: filterCategory === c ? (CATEGORY_COLORS[c] || "#d1d5db") + "20" : "transparent",
                color: filterCategory === c ? (CATEGORY_COLORS[c] || "#f0f0f3") : "#9ca3af",
              }}>
              {CATEGORY_LABELS[c] || c}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => setViewMode("category")}
            style={{
              padding: "5px 12px", borderRadius: "6px", border: "none",
              fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
              background: viewMode === "category" ? "#8b5cf6" : "#2a2d3a",
              color: viewMode === "category" ? "#fff" : "#6b7280",
            }}>Par catégorie</button>
          <button onClick={() => setViewMode("list")}
            style={{
              padding: "5px 12px", borderRadius: "6px", border: "none",
              fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
              background: viewMode === "list" ? "#8b5cf6" : "#2a2d3a",
              color: viewMode === "list" ? "#fff" : "#6b7280",
            }}>Liste</button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
          Chargement...
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div style={{
          padding: "60px 24px", textAlign: "center",
          background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px"
        }}>
          <div style={{ fontSize: "16px", color: "#9ca3af", marginBottom: "8px" }}>
            Aucune recommandation
          </div>
          <p style={{ fontSize: "14px", color: "#d1d5db" }}>
            Lancez un audit depuis le dashboard Phantom pour obtenir des recommandations.
          </p>
        </div>
      )}

      {/* Category grouped view */}
      {!loading && viewMode === "category" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {categoryOrder.map(cat => {
            const items = groupedByCategory[cat] || [];
            if (items.length === 0) return null;

            return (
              <div key={cat}>
                {/* Category header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  marginBottom: "12px", padding: "10px 16px",
                  background: (CATEGORY_COLORS[cat] || "#9ca3af") + "08",
                  border: `1px solid ${(CATEGORY_COLORS[cat] || "#9ca3af")}20`,
                  borderRadius: "8px",
                }}>
                  <span style={{ fontSize: "16px" }}>{CATEGORY_ICONS[cat] || ""}</span>
                  <span style={{
                    fontSize: "14px", fontWeight: 600,
                    color: CATEGORY_COLORS[cat] || "#f0f0f3",
                  }}>
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                  <span style={{
                    fontSize: "12px", color: "#9ca3af",
                    padding: "2px 8px", background: "#2a2d3a", borderRadius: "10px",
                  }}>
                    {items.length}
                  </span>
                  {/* Count by severity within category */}
                  <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                    {items.filter(i => i.severity === "critical").length > 0 && (
                      <span style={{ fontSize: "11px", color: "#ef4444" }}>
                        {items.filter(i => i.severity === "critical").length} critique{items.filter(i => i.severity === "critical").length > 1 ? "s" : ""}
                      </span>
                    )}
                    {items.filter(i => i.severity === "warning").length > 0 && (
                      <span style={{ fontSize: "11px", color: "#f59e0b" }}>
                        {items.filter(i => i.severity === "warning").length} important{items.filter(i => i.severity === "warning").length > 1 ? "s" : ""}
                      </span>
                    )}
                    {items.filter(i => i.severity === "info").length > 0 && (
                      <span style={{ fontSize: "11px", color: "#10b981" }}>
                        {items.filter(i => i.severity === "info").length} optionnel{items.filter(i => i.severity === "info").length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {items.map((rec, i) => renderRecCard(rec, i))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Flat list view */}
      {!loading && viewMode === "list" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map((rec, i) => renderRecCard(rec, i))}
        </div>
      )}
    </div>
  );
}
