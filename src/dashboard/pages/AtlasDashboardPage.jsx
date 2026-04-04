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

function PositionBadge({ position }) {
  const color = position <= 10 ? "#22c55e" : position <= 30 ? "#f59e0b" : "#ef4444";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: "32px", padding: "2px 8px", borderRadius: "6px",
      background: `${color}18`, color, fontSize: "13px", fontWeight: 600,
    }}>
      {position}
    </span>
  );
}

function ChangeBadge({ change }) {
  if (!change || change === 0) return <span style={{ color: "#6b7280", fontSize: "12px" }}>--</span>;
  const up = change > 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "2px",
      color: up ? "#22c55e" : "#ef4444", fontSize: "12px", fontWeight: 500,
    }}>
      {up ? "\↑" : "\↓"} {Math.abs(change)}
    </span>
  );
}

function CompetitionBadge({ level }) {
  if (!level) return <span style={{ color: "#6b7280", fontSize: "12px" }}>--</span>;
  const colors = {
    low: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Faible" },
    medium: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Moyen" },
    high: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", label: "Élevé" },
  };
  const c = colors[level] || colors.medium;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      borderRadius: "6px", background: c.bg, color: c.color,
      fontSize: "11px", fontWeight: 500,
    }}>
      {c.label}
    </span>
  );
}

function SuggestionsModal({ suggestions, loading, onClose, onAdd }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: "20px",
    }}>
      <div style={{
        background: "#1e2029", borderRadius: "16px", padding: "28px",
        border: "1px solid #2a2d3a", maxWidth: "560px", width: "100%",
        maxHeight: "80vh", overflow: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ color: "#f0f0f3", fontSize: "16px", fontWeight: 600, margin: 0 }}>
            Suggestions IA
          </h3>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: "#6b7280",
            fontSize: "20px", cursor: "pointer", padding: "4px",
          }}>&times;</button>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "13px" }}>
            <div style={{ marginBottom: "12px", fontSize: "20px" }}>&#x1f9e0;</div>
            Analyse IA en cours...
          </div>
        ) : suggestions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: "13px" }}>
            Aucune suggestion disponible.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", background: "#16171f", borderRadius: "10px",
                border: "1px solid #2a2d3a", gap: "12px",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#f0f0f3", fontSize: "13px", fontWeight: 500 }}>{s.keyword}</div>
                  <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>{s.reason}</div>
                </div>
                <button onClick={() => onAdd(s.keyword)} style={{
                  padding: "6px 12px", borderRadius: "6px", border: "none",
                  background: "rgba(245,158,11,0.15)", color: "#f59e0b",
                  fontSize: "11px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                }}>
                  + Ajouter
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportModal({ report, loading, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: "20px",
    }}>
      <div style={{
        background: "#1e2029", borderRadius: "16px", padding: "28px",
        border: "1px solid #2a2d3a", maxWidth: "640px", width: "100%",
        maxHeight: "85vh", overflow: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ color: "#f0f0f3", fontSize: "16px", fontWeight: 600, margin: 0 }}>
            Rapport SEO
          </h3>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: "#6b7280",
            fontSize: "20px", cursor: "pointer", padding: "4px",
          }}>&times;</button>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "13px" }}>
            <div style={{ marginBottom: "12px", fontSize: "20px" }}>&#x1f4ca;</div>
            Generation du rapport IA...
          </div>
        ) : !report ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: "13px" }}>
            Erreur lors de la generation du rapport.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Score */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "80px", height: "80px", borderRadius: "50%",
                background: report.score >= 70 ? "rgba(34,197,94,0.12)" : report.score >= 40 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                border: `3px solid ${report.score >= 70 ? "#22c55e" : report.score >= 40 ? "#f59e0b" : "#ef4444"}`,
              }}>
                <span style={{
                  fontSize: "24px", fontWeight: 700,
                  color: report.score >= 70 ? "#22c55e" : report.score >= 40 ? "#f59e0b" : "#ef4444",
                }}>{report.score}</span>
              </div>
              <div style={{ color: "#9ca3af", fontSize: "11px", marginTop: "8px" }}>Score SEO global</div>
            </div>

            {/* Summary */}
            <div style={{ background: "#16171f", borderRadius: "10px", padding: "16px", border: "1px solid #2a2d3a" }}>
              <div style={{ color: "#d1d5db", fontSize: "13px", lineHeight: "1.6" }}>{report.summary}</div>
            </div>

            {/* Stats row */}
            {report.stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
                {[
                  { label: "Mots-cles", value: report.stats.totalKeywords },
                  { label: "Pos. moy.", value: report.stats.avgPos || "--" },
                  { label: "Top 10", value: report.stats.inTop10 },
                  { label: "Trafic est.", value: report.stats.totalTraffic },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: "#16171f", borderRadius: "8px", padding: "12px",
                    border: "1px solid #2a2d3a", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#f0f0f3" }}>{s.value}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths */}
            <ReportSection title="Points forts" items={report.strengths} color="#22c55e" icon="\u2713" />

            {/* Weaknesses */}
            <ReportSection title="Axes d'amelioration" items={report.weaknesses} color="#ef4444" icon="!" />

            {/* Actions */}
            <ReportSection title="Actions prioritaires" items={report.actions} color="#f59e0b" icon="\u2192" />

            {/* Forecast */}
            {report.forecast && (
              <div style={{ background: "rgba(245,158,11,0.08)", borderRadius: "10px", padding: "16px", border: "1px solid rgba(245,158,11,0.15)" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#f59e0b", marginBottom: "6px" }}>Prevision a 3 mois</div>
                <div style={{ color: "#d1d5db", fontSize: "13px", lineHeight: "1.5" }}>{report.forecast}</div>
              </div>
            )}

            {report.generatedAt && (
              <div style={{ textAlign: "right", fontSize: "10px", color: "#4b5563" }}>
                Genere le {new Date(report.generatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportSection({ title, items, color, icon }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#f0f0f3", marginBottom: "8px" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "8px",
            padding: "8px 12px", background: "#16171f", borderRadius: "8px",
            border: "1px solid #2a2d3a",
          }}>
            <span style={{ color, fontSize: "12px", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>{icon}</span>
            <span style={{ color: "#d1d5db", fontSize: "12px", lineHeight: "1.4" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AtlasDashboardPage() {
  const { get, post, del } = useApi();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [checking, setChecking] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formDomain, setFormDomain] = useState("");
  const [formKeywords, setFormKeywords] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Suggestions state
  const [suggestionsProjectId, setSuggestionsProjectId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Report state
  const [reportProjectId, setReportProjectId] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await get("/api/atlas/projects");
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    const keywords = formKeywords.split("\n").map(k => k.trim()).filter(k => k.length > 0);
    if (!formDomain.trim()) { setError("Le domaine est requis."); return; }
    if (keywords.length === 0) { setError("Ajoutez au moins un mot-cle."); return; }

    setCreating(true);
    try {
      await post("/api/atlas/projects", { domain: formDomain.trim(), keywords });
      setFormDomain("");
      setFormKeywords("");
      setShowForm(false);
      await fetchProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCheck = async (id) => {
    setChecking(id);
    try {
      const updated = await post(`/api/atlas/projects/${id}/check`);
      setProjects(prev => prev.map(p => p._id === id ? updated : p));
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(null);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await del(`/api/atlas/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSuggestions = async (id) => {
    setSuggestionsProjectId(id);
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const data = await post(`/api/atlas/projects/${id}/suggestions`);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddSuggestion = async (keyword) => {
    if (!suggestionsProjectId) return;
    const project = projects.find(p => p._id === suggestionsProjectId);
    if (!project) return;
    if (project.keywords.includes(keyword)) return;

    try {
      // Re-create project keywords with new one added
      const updatedKeywords = [...project.keywords, keyword];
      // We update locally and refetch
      setProjects(prev => prev.map(p =>
        p._id === suggestionsProjectId
          ? { ...p, keywords: updatedKeywords }
          : p
      ));
      setSuggestions(prev => prev.filter(s => s.keyword !== keyword));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (id) => {
    setReportProjectId(id);
    setLoadingReport(true);
    setReport(null);
    try {
      const data = await get(`/api/atlas/projects/${id}/report`);
      setReport(data.report || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  };

  // Overall stats
  const totalKeywords = projects.reduce((s, p) => s + (p.keywords?.length || 0), 0);
  const projectsWithPos = projects.filter(p => p.averagePosition);
  const avgPosition = projectsWithPos.length > 0
    ? Math.round(projectsWithPos.reduce((s, p) => s + p.averagePosition, 0) / projectsWithPos.length)
    : null;
  const totalGained = projects.reduce((s, p) => s + (p.totalChange || 0), 0);

  // Compute estimated monthly traffic across all projects
  const totalEstimatedTraffic = projects.reduce((s, p) => {
    if (!p.rankings) return s;
    return s + p.rankings.reduce((rs, r) => rs + (r.estimatedTraffic || 0), 0);
  }, 0);

  // Keywords in top 10
  const keywordsInTop10 = projects.reduce((s, p) => {
    if (!p.rankings) return s;
    return s + p.rankings.filter(r => r.position <= 10).length;
  }, 0);

  const inputStyle = {
    width: "100%", padding: "10px 14px", background: "#1e2029",
    border: "1px solid #2a2d3a", borderRadius: "8px", color: "#f0f0f3",
    fontSize: "13px", fontFamily: "inherit", outline: "none",
  };

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f3", margin: 0, marginBottom: "6px" }}>
              Atlas — Suivi SEO
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
              Suivez vos positions Google et surveillez vos mots-cles
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: "10px 20px", borderRadius: "8px", border: "none",
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#000",
            fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>
            {showForm ? "Annuler" : "+ Nouveau projet"}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Mots-cles suivis", value: totalKeywords, suffix: "" },
          { label: "Position moyenne", value: avgPosition || "--", suffix: "" },
          { label: "Trafic mensuel est.", value: totalEstimatedTraffic > 0 ? totalEstimatedTraffic.toLocaleString("fr-FR") : "--", suffix: "", color: "#f59e0b" },
          { label: "Mots-cles Top 10", value: keywordsInTop10, suffix: "", color: keywordsInTop10 > 0 ? "#22c55e" : "#9ca3af" },
        ].map((stat, i) => (
          <div key={i} style={{
            background: "#1e2029", borderRadius: "12px", padding: "20px",
            border: "1px solid #2a2d3a",
          }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: stat.color || "#f0f0f3" }}>{stat.value}{stat.suffix}</div>
          </div>
        ))}
      </div>

      {/* New Project Form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{
          background: "#1e2029", borderRadius: "14px", padding: "24px",
          border: "1px solid #2a2d3a", marginBottom: "28px",
        }}>
          <h3 style={{ color: "#f0f0f3", fontSize: "15px", fontWeight: 600, margin: "0 0 16px" }}>Nouveau projet SEO</h3>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#ef4444", fontSize: "13px" }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Domaine</label>
            <input
              type="text" value={formDomain} onChange={e => setFormDomain(e.target.value)}
              placeholder="exemple.fr" style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Mots-cles (un par ligne)</label>
            <textarea
              value={formKeywords} onChange={e => setFormKeywords(e.target.value)}
              placeholder={"agence web paris\nreferencement naturel\ncreation site internet"}
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <button type="submit" disabled={creating} style={{
            padding: "10px 24px", borderRadius: "8px", border: "none",
            background: creating ? "#4b5563" : "linear-gradient(135deg, #f59e0b, #fbbf24)",
            color: creating ? "#9ca3af" : "#000", fontSize: "13px", fontWeight: 600,
            cursor: creating ? "default" : "pointer", fontFamily: "inherit",
          }}>
            {creating ? "Creation..." : "Creer le projet"}
          </button>
        </form>
      )}

      {/* Projects List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>Chargement...</div>
      ) : projects.length === 0 ? (
        <div style={{
          background: "#1e2029", borderRadius: "14px", padding: "60px 32px",
          border: "1px solid #2a2d3a", textAlign: "center",
        }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
            </svg>
          </div>
          <h3 style={{ color: "#f0f0f3", fontSize: "16px", fontWeight: 600, margin: "0 0 8px" }}>Aucun projet SEO</h3>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Creez votre premier projet pour commencer le suivi de vos positions Google.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {projects.map(project => {
            const isExpanded = expandedId === project._id;
            const projectTraffic = (project.rankings || []).reduce((s, r) => s + (r.estimatedTraffic || 0), 0);
            return (
              <div key={project._id} style={{
                background: "#1e2029", borderRadius: "14px",
                border: isExpanded ? "1px solid rgba(245,158,11,0.3)" : "1px solid #2a2d3a",
                overflow: "hidden", transition: "border-color 0.2s",
              }}>
                {/* Project Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : project._id)}
                  style={{
                    padding: "20px 24px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      background: "rgba(245,158,11,0.12)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ color: "#f0f0f3", fontSize: "14px", fontWeight: 600 }}>{project.domain}</div>
                      <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>
                        {project.keywords?.length || 0} mots-cles
                        {project.lastCheckAt && ` \u2022 Dernier check: ${new Date(project.lastCheckAt).toLocaleDateString("fr-FR")}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {project.averagePosition && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>Pos. moy.</div>
                        <PositionBadge position={project.averagePosition} />
                      </div>
                    )}
                    {projectTraffic > 0 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>Trafic est.</div>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b" }}>{projectTraffic.toLocaleString("fr-FR")}</span>
                      </div>
                    )}
                    {project.totalChange !== 0 && (
                      <ChangeBadge change={project.totalChange} />
                    )}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded View */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #2a2d3a", padding: "20px 24px" }}>
                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleCheck(project._id)}
                        disabled={checking === project._id}
                        style={{
                          padding: "8px 16px", borderRadius: "8px", border: "none",
                          background: checking === project._id ? "#4b5563" : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                          color: checking === project._id ? "#9ca3af" : "#000",
                          fontSize: "12px", fontWeight: 600, cursor: checking === project._id ? "default" : "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {checking === project._id ? "Verification..." : "Verifier les positions"}
                      </button>
                      <button
                        onClick={() => handleSuggestions(project._id)}
                        style={{
                          padding: "8px 16px", borderRadius: "8px",
                          border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)",
                          color: "#f59e0b", fontSize: "12px", fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        Suggestions IA
                      </button>
                      <button
                        onClick={() => handleReport(project._id)}
                        style={{
                          padding: "8px 16px", borderRadius: "8px",
                          border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)",
                          color: "#818cf8", fontSize: "12px", fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        Rapport SEO
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        disabled={deleting === project._id}
                        style={{
                          padding: "8px 16px", borderRadius: "8px",
                          border: "1px solid rgba(239,68,68,0.3)", background: "transparent",
                          color: "#ef4444", fontSize: "12px", fontWeight: 500,
                          cursor: deleting === project._id ? "default" : "pointer",
                          fontFamily: "inherit", marginLeft: "auto",
                        }}
                      >
                        {deleting === project._id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>

                    {/* Rankings Table */}
                    {project.rankings && project.rankings.length > 0 ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {["Mot-cle", "Position", "Variation", "Volume", "Competition", "Trafic est.", "URL"].map(h => (
                                <th key={h} style={{
                                  textAlign: "left", padding: "10px 12px",
                                  fontSize: "11px", color: "#6b7280", fontWeight: 500,
                                  textTransform: "uppercase", letterSpacing: "0.5px",
                                  borderBottom: "1px solid #2a2d3a",
                                }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {project.rankings.map((r, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid #2a2d3a20" }}>
                                <td style={{ padding: "10px 12px", color: "#f0f0f3", fontSize: "13px", fontWeight: 500 }}>
                                  {r.keyword}
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                  <PositionBadge position={r.position} />
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                  <ChangeBadge change={r.change} />
                                </td>
                                <td style={{ padding: "10px 12px", color: "#d1d5db", fontSize: "12px" }}>
                                  {r.searchVolume ? r.searchVolume.toLocaleString("fr-FR") : "--"}
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                  <CompetitionBadge level={r.competition} />
                                </td>
                                <td style={{ padding: "10px 12px", color: "#f59e0b", fontSize: "12px", fontWeight: 500 }}>
                                  {r.estimatedTraffic ? r.estimatedTraffic.toLocaleString("fr-FR") : "--"}
                                </td>
                                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "12px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {r.url}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "24px 0", color: "#6b7280", fontSize: "13px" }}>
                        Aucun resultat. Cliquez sur "Verifier les positions" pour lancer un check.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Suggestions Modal */}
      {suggestionsProjectId && (
        <SuggestionsModal
          suggestions={suggestions}
          loading={loadingSuggestions}
          onClose={() => setSuggestionsProjectId(null)}
          onAdd={handleAddSuggestion}
        />
      )}

      {/* Report Modal */}
      {reportProjectId && (
        <ReportModal
          report={report}
          loading={loadingReport}
          onClose={() => setReportProjectId(null)}
        />
      )}
    </div>
  );
}
