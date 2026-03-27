import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const ATLAS_COLOR = "#f59e0b";

const ATLAS_NAV = [
  { path: "/app/atlas", label: "Projets", end: true },
  { path: "/app/atlas/history", label: "\Évolution" },
  { path: "/app/atlas/suggestions", label: "Suggestions IA" },
  { path: "/app/atlas/reports", label: "Rapports" },
];

const cardStyle = {
  background: "#1e2029",
  borderRadius: "14px",
  padding: "24px",
  border: "1px solid #2a2d3a",
};

function ScoreMeter({ score, label }) {
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 8px" }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#2a2d3a" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          fontSize: "18px", fontWeight: 700, color,
        }}>
          {score}
        </div>
      </div>
      <div style={{ fontSize: "12px", color: "#9ca3af" }}>{label}</div>
    </div>
  );
}

export default function AtlasReportsPage() {
  const api = useApi();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
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

  const handleGenerateReport = async () => {
    if (!selectedProject) return;
    setLoadingReport(true);
    setError("");
    setReport(null);
    try {
      const data = await api.get(`/api/atlas/projects/${selectedProject}/report`);
      setReport(data);
    } catch (err) {
      console.error("Report error:", err);
      setError("Impossible de générer le rapport. Veuillez réessayer.");
    } finally {
      setLoadingReport(false);
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
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f3", margin: 0, marginBottom: "6px" }}>
          Rapports SEO
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
          Générez des rapports d'analyse SEO détaillés pour vos projets.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>Chargement...</div>
      ) : projects.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "60px 32px" }}>
          <h3 style={{ color: "#f0f0f3", fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>Aucun projet</h3>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Créez un projet dans l'onglet Projets pour générer un rapport.
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
              <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
                Projet
              </label>
              <select
                value={selectedProject || ""}
                onChange={e => setSelectedProject(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", background: "#161820",
                  border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3",
                  fontSize: "13px", fontFamily: "inherit", outline: "none",
                }}
              >
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.domain} ({p.keywords?.length || 0} mots-clés)</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleGenerateReport}
                disabled={loadingReport || !selectedProject}
                style={{
                  padding: "10px 24px",
                  background: loadingReport ? "#2a2d3a" : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  color: loadingReport ? "#9ca3af" : "#1e2029",
                  border: "none", borderRadius: "8px",
                  fontSize: "13px", fontWeight: 600,
                  cursor: loadingReport ? "wait" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: loadingReport ? "none" : "0 4px 16px rgba(245,158,11,0.4)",
                  display: "flex", alignItems: "center", gap: "8px",
                }}
              >
                {loadingReport && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "atlas-rep-spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                )}
                {loadingReport ? "Génération..." : "Générer un rapport"}
              </button>
            </div>
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

          {/* Report display */}
          {report && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Score overview */}
              <div style={cardStyle}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "20px",
                }}>
                  <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
                    Rapport SEO — {currentProject?.domain}
                  </h2>
                  <button
                    style={{
                      padding: "8px 16px", background: "#2a2d3a", color: "#9ca3af",
                      border: "1px solid #3a3d4a", borderRadius: "6px",
                      fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger PDF
                  </button>
                </div>

                <div style={{
                  display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap",
                  padding: "20px 0",
                }}>
                  <ScoreMeter score={report.score || report.overallScore || 0} label="Score global" />
                  {report.technicalScore != null && <ScoreMeter score={report.technicalScore} label="Technique" />}
                  {report.contentScore != null && <ScoreMeter score={report.contentScore} label="Contenu" />}
                  {report.authorityScore != null && <ScoreMeter score={report.authorityScore} label="Autorité" />}
                </div>
              </div>

              {/* Strengths */}
              {(report.strengths || []).length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{
                    fontSize: "14px", fontWeight: 600, color: "#10b981",
                    margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Points forts
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {report.strengths.map((s, i) => (
                      <div key={i} style={{
                        padding: "12px 16px", background: "rgba(16,185,129,0.06)",
                        border: "1px solid rgba(16,185,129,0.12)", borderRadius: "8px",
                        fontSize: "13px", color: "#d1d5db",
                      }}>
                        {typeof s === "string" ? s : s.text || s.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {(report.weaknesses || []).length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{
                    fontSize: "14px", fontWeight: 600, color: "#ef4444",
                    margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Points faibles
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {report.weaknesses.map((w, i) => (
                      <div key={i} style={{
                        padding: "12px 16px", background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.12)", borderRadius: "8px",
                        fontSize: "13px", color: "#d1d5db",
                      }}>
                        {typeof w === "string" ? w : w.text || w.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {(report.actions || report.recommendations || []).length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{
                    fontSize: "14px", fontWeight: 600, color: ATLAS_COLOR,
                    margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ATLAS_COLOR} strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Actions recommandées
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(report.actions || report.recommendations || []).map((a, i) => (
                      <div key={i} style={{
                        padding: "14px 16px", background: "#161820",
                        border: "1px solid #2a2d3a", borderRadius: "8px",
                        borderLeft: `3px solid ${ATLAS_COLOR}`,
                        display: "flex", alignItems: "flex-start", gap: "10px",
                      }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                          background: `${ATLAS_COLOR}15`, color: ATLAS_COLOR,
                          fontSize: "11px", fontWeight: 700,
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: "13px", color: "#d1d5db", lineHeight: 1.5 }}>
                          {typeof a === "string" ? a : a.text || a.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forecast */}
              {report.forecast && (
                <div style={cardStyle}>
                  <h3 style={{
                    fontSize: "14px", fontWeight: 600, color: "#3b82f6",
                    margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Prévisions
                  </h3>
                  <div style={{
                    padding: "16px", background: "rgba(59,130,246,0.06)",
                    border: "1px solid rgba(59,130,246,0.12)", borderRadius: "8px",
                    fontSize: "13px", color: "#d1d5db", lineHeight: 1.6,
                  }}>
                    {typeof report.forecast === "string" ? report.forecast : report.forecast.text || report.forecast.description}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loadingReport && !report && !error && (
            <div style={{ ...cardStyle, textAlign: "center", padding: "48px 32px" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2a2d3a" strokeWidth="1.5" style={{ marginBottom: "12px" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                Sélectionnez un projet et cliquez sur "Générer un rapport" pour obtenir une analyse SEO complète.
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes atlas-rep-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
