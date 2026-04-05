import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const ATLAS_COLOR = "#f59e0b";

const ATLAS_NAV = [
  { path: "/app/atlas", label: "Projets", end: true },
  { path: "/app/atlas/history", label: "Évolution" },
  { path: "/app/atlas/suggestions", label: "Suggestions IA" },
  { path: "/app/atlas/reports", label: "Rapports" },
];

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: "14px",
  padding: "24px",
  border: "1px solid #2a2d3a",
};

function CompetitionBadge({ level }) {
  const config = {
    low: { label: "Faible", color: "#10b981" },
    medium: { label: "Moyen", color: "#f59e0b" },
    high: { label: "Élevé", color: "#ef4444" },
  };
  const c = config[level] || config.medium;
  return (
    <span style={{
      fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px",
      background: `${c.color}15`, color: c.color,
    }}>
      {c.label}
    </span>
  );
}

export default function AtlasSuggestionsPage() {
  const api = useApi();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addedKeywords, setAddedKeywords] = useState(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/api/atlas/projects");
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGetSuggestions = async () => {
    if (!selectedProject) return;
    setLoadingSuggestions(true);
    setError("");
    setSuggestions([]);
    setAddedKeywords(new Set());
    try {
      const data = await api.post(`/api/atlas/projects/${selectedProject}/suggestions`);
      setSuggestions(data.suggestions || data || []);
    } catch (err) {
      console.error("Suggestions error:", err);
      setError("Impossible de récupérer les suggestions. Veuillez réessayer.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddKeyword = async (keyword) => {
    try {
      await api.post(`/api/atlas/projects/${selectedProject}/keywords`, { keyword: keyword.keyword || keyword.term });
      setAddedKeywords(prev => new Set([...prev, keyword.keyword || keyword.term]));
    } catch (err) {
      console.error("Add keyword error:", err);
    }
  };

  const currentProject = projects.find(p => p._id === selectedProject);

  return (
    <div>
      <SubNav items={ATLAS_NAV} color={ATLAS_COLOR} />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))",
        borderRadius: "14px", padding: "28px 32px", marginBottom: "28px",
        border: "1px solid rgba(245,158,11,0.15)", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0A2540", margin: 0, marginBottom: "6px" }}>
          Suggestions de mots-clés IA
        </h1>
        <p style={{ color: "#6B7C93", fontSize: "13px", margin: 0 }}>
          Découvrez de nouvelles opportunités de mots-clés grâce à l'intelligence artificielle.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7C93" }}>Chargement...</div>
      ) : projects.length === 0 ? (
        <div style={{
          ...cardStyle, textAlign: "center", padding: "60px 32px",
        }}>
          <h3 style={{ color: "#0A2540", fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>Aucun projet</h3>
          <p style={{ color: "#6B7C93", fontSize: "13px", margin: 0 }}>
            Créez un projet dans l'onglet Projets pour obtenir des suggestions.
          </p>
        </div>
      ) : (
        <>
          {/* Project selector + action */}
          <div style={{
            ...cardStyle, marginBottom: "24px",
            display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#6B7C93", marginBottom: "8px" }}>
                Projet
              </label>
              <select
                value={selectedProject || ""}
                onChange={e => setSelectedProject(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", background: "#161820",
                  border: "1px solid #2a2d3a", borderRadius: "8px", color: "#0A2540",
                  fontSize: "13px", fontFamily: "inherit", outline: "none",
                }}
              >
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.domain} ({p.keywords?.length || 0} mots-clés)</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions || !selectedProject}
              style={{
                padding: "10px 24px",
                background: loadingSuggestions ? "#E3E8EE" : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                color: loadingSuggestions ? "#6B7C93" : "#FFFFFF",
                border: "none", borderRadius: "8px",
                fontSize: "13px", fontWeight: 600,
                cursor: loadingSuggestions ? "wait" : "pointer",
                fontFamily: "inherit",
                boxShadow: loadingSuggestions ? "none" : "0 4px 16px rgba(245,158,11,0.4)",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              {loadingSuggestions && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "atlas-sug-spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              {loadingSuggestions ? "Analyse en cours..." : "Obtenir des suggestions"}
            </button>
          </div>

          {error && (
            <div style={{
              padding: "14px 20px", marginBottom: "20px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "10px", fontSize: "13px", color: "#ef4444",
            }}>
              {error}
            </div>
          )}

          {/* Suggestions list */}
          {suggestions.length > 0 && (
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <div style={{
                padding: "18px 24px", borderBottom: "1px solid #2a2d3a",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#0A2540", margin: 0 }}>
                  Suggestions pour {currentProject?.domain}
                </h2>
                <span style={{
                  fontSize: "12px", color: ATLAS_COLOR, fontWeight: 500,
                  padding: "3px 10px", background: `${ATLAS_COLOR}15`, borderRadius: "6px",
                }}>
                  {suggestions.length} suggestion{suggestions.length > 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Mot-clé", "Volume", "Concurrence", "Score", "Action"].map(h => (
                        <th key={h} style={{
                          textAlign: h === "Action" ? "center" : "left", padding: "12px 24px",
                          fontSize: "11px", color: "#6B7C93", fontWeight: 500,
                          textTransform: "uppercase", letterSpacing: "0.5px",
                          borderBottom: "1px solid #2a2d3a",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map((sug, i) => {
                      const keyword = sug.keyword || sug.term || sug;
                      const keywordStr = typeof keyword === "string" ? keyword : keyword;
                      const isAdded = addedKeywords.has(keywordStr);
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #2a2d3a20" }}>
                          <td style={{ padding: "14px 24px", color: "#0A2540", fontSize: "13px", fontWeight: 500 }}>
                            {keywordStr}
                          </td>
                          <td style={{ padding: "14px 24px", color: "#425466", fontSize: "13px" }}>
                            {sug.volume ? sug.volume.toLocaleString("fr-FR") : "--"}
                          </td>
                          <td style={{ padding: "14px 24px" }}>
                            <CompetitionBadge level={sug.competition || "medium"} />
                          </td>
                          <td style={{ padding: "14px 24px" }}>
                            {sug.score != null ? (
                              <span style={{
                                fontSize: "13px", fontWeight: 600,
                                color: sug.score >= 70 ? "#10b981" : sug.score >= 40 ? "#f59e0b" : "#ef4444",
                              }}>
                                {sug.score}
                              </span>
                            ) : "--"}
                          </td>
                          <td style={{ padding: "14px 24px", textAlign: "center" }}>
                            <button
                              onClick={() => handleAddKeyword(sug)}
                              disabled={isAdded}
                              style={{
                                padding: "6px 16px", borderRadius: "6px", border: "none",
                                fontSize: "12px", fontWeight: 500, cursor: isAdded ? "default" : "pointer",
                                fontFamily: "inherit",
                                background: isAdded ? "rgba(16,185,129,0.12)" : `${ATLAS_COLOR}20`,
                                color: isAdded ? "#10b981" : ATLAS_COLOR,
                              }}
                            >
                              {isAdded ? "Ajouté" : "Ajouter"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state after request */}
          {!loadingSuggestions && suggestions.length === 0 && !error && (
            <div style={{ ...cardStyle, textAlign: "center", padding: "48px 32px" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E3E8EE" strokeWidth="1.5" style={{ marginBottom: "12px" }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <div style={{ fontSize: "14px", color: "#6B7C93" }}>
                Sélectionnez un projet et cliquez sur "Obtenir des suggestions" pour découvrir de nouveaux mots-clés.
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes atlas-sug-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
