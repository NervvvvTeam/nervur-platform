import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const ATLAS_COLOR = "#f59e0b";

const ATLAS_NAV = [
  { path: "/app/atlas", label: "Projets", end: true },
  { path: "/app/atlas/history", label: "\u00c9volution" },
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
      {up ? "\u2191" : "\u2193"} {Math.abs(change)}
    </span>
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

  // Overall stats
  const totalKeywords = projects.reduce((s, p) => s + (p.keywords?.length || 0), 0);
  const avgPosition = projects.length > 0
    ? Math.round(projects.filter(p => p.averagePosition).reduce((s, p) => s + p.averagePosition, 0) / (projects.filter(p => p.averagePosition).length || 1))
    : null;
  const totalGained = projects.reduce((s, p) => s + (p.totalChange || 0), 0);

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

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Mots-cles suivis", value: totalKeywords, suffix: "" },
          { label: "Position moyenne", value: avgPosition || "--", suffix: "" },
          { label: "Positions gagnees", value: totalGained > 0 ? `+${totalGained}` : totalGained, suffix: "", color: totalGained > 0 ? "#22c55e" : totalGained < 0 ? "#ef4444" : "#9ca3af" },
          { label: "Projets actifs", value: projects.length, suffix: "" },
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
                        onClick={() => handleDelete(project._id)}
                        disabled={deleting === project._id}
                        style={{
                          padding: "8px 16px", borderRadius: "8px",
                          border: "1px solid rgba(239,68,68,0.3)", background: "transparent",
                          color: "#ef4444", fontSize: "12px", fontWeight: 500,
                          cursor: deleting === project._id ? "default" : "pointer",
                          fontFamily: "inherit",
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
                              {["Mot-cle", "Position", "Variation", "URL"].map(h => (
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
                                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "12px", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
    </div>
  );
}
