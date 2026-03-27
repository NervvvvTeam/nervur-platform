import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import SubNav from "../components/SubNav";

const PHANTOM_NAV = [
  { path: "/app/phantom", label: "Audit", end: true },
  { path: "/app/phantom/history", label: "Historique" },
  { path: "/app/phantom/recommendations", label: "Recommandations" },
  { path: "/app/phantom/competitors", label: "Concurrents" },
  { path: "/app/phantom/schedule", label: "Planification" },
];

function ScoreBadge({ score }) {
  const color = score >= 90 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <span style={{
      fontSize: "14px", fontWeight: 600, color,
      padding: "4px 10px", borderRadius: "6px",
      background: color + "14"
    }}>{score}</span>
  );
}

function MiniBar({ value, max = 100, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
      <div style={{ flex: 1, height: "4px", background: "#2a2d3a", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "2px",
          width: (value / max * 100) + "%",
          background: color || (value >= 90 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444"),
        }} />
      </div>
      <span style={{ fontSize: "12px", color: "#9ca3af", minWidth: "28px", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function TrendArrow({ current, previous }) {
  if (previous === undefined || previous === null) return null;
  const diff = current - previous;
  if (diff === 0) return <span style={{ color: "#9ca3af", fontSize: "11px", marginLeft: "4px" }}>=</span>;
  const isUp = diff > 0;
  return (
    <span style={{ color: isUp ? "#10b981" : "#ef4444", fontSize: "11px", fontWeight: 600, marginLeft: "4px" }}>
      {isUp ? "\u2191" : "\u2193"}{isUp ? "+" : ""}{diff}
    </span>
  );
}

function ScoreWithTrend({ value, prevValue, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      <MiniBar value={value} color={color} />
      <TrendArrow current={value} previous={prevValue} />
    </div>
  );
}

export default function PhantomHistoryPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [evolution, setEvolution] = useState([]);
  const [updatingDomain, setUpdatingDomain] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [comparingId, setComparingId] = useState(null);
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" or "list"

  useEffect(() => {
    loadHistory();
  }, [selectedDomain]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = selectedDomain ? `?domain=${encodeURIComponent(selectedDomain)}` : "";
      const [historyData, evoData] = await Promise.all([
        api.get(`/api/phantom/history${params}`),
        api.get(`/api/phantom/evolution${params}`),
      ]);
      setAudits(historyData.audits || []);
      setDomains(historyData.domains || []);
      setEvolution(evoData.audits || []);
    } catch (err) {
      console.error("History load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (url, domain) => {
    setUpdatingDomain(domain);
    try {
      await api.post("/api/phantom/audit", { url });
      await loadHistory();
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setUpdatingDomain(null);
    }
  };

  const handleDeleteDomain = async (domain) => {
    if (!window.confirm(`Supprimer tous les audits de ${domain} ?`)) return;
    try {
      await api.del('/api/phantom/history/domain/' + encodeURIComponent(domain));
      await loadHistory();
    } catch (err) {
      console.error("Delete domain error:", err);
    }
  };

  const handleCompare = async (currentId, previousId) => {
    if (!currentId || !previousId) return;
    setComparingId(currentId);
    try {
      const data = await api.post(`/api/phantom/compare/${currentId}`, { compareWithId: previousId });
      setCompareResult(data);
    } catch (err) {
      console.error("Compare error:", err);
    } finally {
      setComparingId(null);
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Group audits by domain
  const groupedByDomain = {};
  audits.forEach(a => {
    if (!groupedByDomain[a.domain]) groupedByDomain[a.domain] = [];
    groupedByDomain[a.domain].push(a);
  });

  const uniqueDomains = Object.keys(groupedByDomain);

  const chartHeight = 140;
  const chartWidth = 600;
  const maxScore = 100;

  return (
    <div style={{ maxWidth: "900px" }}>
      <SubNav color="#8b5cf6" items={PHANTOM_NAV} />
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          Historique des audits
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          Suivez l'\u00e9volution de vos scores au fil du temps.
        </p>
      </div>

      {/* View mode toggle */}
      {!loading && audits.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          {/* Domain filter tabs */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {domains.length > 1 && (
              <>
                <button onClick={() => setSelectedDomain("")}
                  style={{
                    padding: "6px 14px", borderRadius: "6px", border: "none",
                    fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                    background: !selectedDomain ? "#8b5cf6" : "#2a2d3a",
                    color: !selectedDomain ? "#fff" : "#6b7280",
                  }}>Tous</button>
                {domains.map(d => (
                  <button key={d} onClick={() => setSelectedDomain(d)}
                    style={{
                      padding: "6px 14px", borderRadius: "6px", border: "none",
                      fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                      background: selectedDomain === d ? "#8b5cf6" : "#2a2d3a",
                      color: selectedDomain === d ? "#fff" : "#6b7280",
                    }}>{d}</button>
                ))}
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={() => setViewMode("grouped")}
              style={{
                padding: "6px 12px", borderRadius: "6px", border: "none",
                fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                background: viewMode === "grouped" ? "#8b5cf6" : "#2a2d3a",
                color: viewMode === "grouped" ? "#fff" : "#6b7280",
              }}>Par domaine</button>
            <button onClick={() => setViewMode("list")}
              style={{
                padding: "6px 12px", borderRadius: "6px", border: "none",
                fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                background: viewMode === "list" ? "#8b5cf6" : "#2a2d3a",
                color: viewMode === "list" ? "#fff" : "#6b7280",
              }}>Liste</button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
          Chargement...
        </div>
      )}

      {!loading && audits.length === 0 && (
        <div style={{
          padding: "60px 24px", textAlign: "center",
          background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontSize: "16px", color: "#9ca3af", marginBottom: "12px" }}>
            Aucun audit enregistr\u00e9
          </div>
          <p style={{ fontSize: "14px", color: "#d1d5db", marginBottom: "20px" }}>
            Lancez votre premier audit depuis la page Audit.
          </p>
          <button onClick={() => navigate("/app/phantom")}
            style={{
              padding: "10px 24px", background: "#8b5cf6", color: "#fff",
              border: "none", borderRadius: "8px", fontSize: "14px",
              fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
            }}>
            Lancer un audit
          </button>
        </div>
      )}

      {/* Grouped view */}
      {!loading && viewMode === "grouped" && uniqueDomains.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          {uniqueDomains.map(domain => {
            const domainAudits = groupedByDomain[domain];
            const latestAudit = domainAudits[0];
            const previousAudit = domainAudits.length > 1 ? domainAudits[1] : null;
            const isUpdating = updatingDomain === domain;

            return (
              <div key={domain} style={{
                background: "#1e2029", border: "1px solid #2a2d3a",
                borderRadius: "10px", borderLeft: "3px solid #8b5cf6",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)", overflow: "hidden",
              }}>
                {/* Domain header */}
                <div style={{
                  padding: "18px 22px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 500, color: "#d1d5db" }}>{domain}</div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {domainAudits.length} audit{domainAudits.length > 1 ? "s" : ""} — Dernier : {formatDate(latestAudit?.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <ScoreBadge score={latestAudit?.scores?.global || 0} />
                    {previousAudit && (
                      <TrendArrow
                        current={latestAudit?.scores?.global || 0}
                        previous={previousAudit?.scores?.global || 0}
                      />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdate(latestAudit?.url || `https://${domain}`, domain); }}
                      disabled={isUpdating}
                      style={{
                        padding: "8px 16px",
                        background: isUpdating ? "#2a2d3a" : "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                        color: "#fff", border: "none", borderRadius: "6px",
                        fontSize: "13px", fontWeight: 500, cursor: isUpdating ? "wait" : "pointer",
                        fontFamily: "inherit", opacity: isUpdating ? 0.6 : 1,
                        display: "flex", alignItems: "center", gap: "6px",
                        boxShadow: isUpdating ? "none" : "0 4px 16px rgba(139,92,246,0.4)",
                      }}>
                      {isUpdating ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                          Analyse...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 0 0-9-9"/><path d="M3 12a9 9 0 0 0 9 9"/><polyline points="21 3 21 12 12 12"/>
                          </svg>
                          Mettre \u00e0 jour
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDomain(domain); }}
                      title={`Supprimer tous les audits de ${domain}`}
                      style={{
                        padding: "8px", background: "transparent",
                        border: "1px solid #3a3d4a", borderRadius: "6px",
                        color: "#ef4444", cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Score bars with trends */}
                <div style={{ padding: "0 22px 16px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  {[
                    { key: "performance", label: "Performance", color: "#8b5cf6" },
                    { key: "accessibility", label: "Accessibilit\u00e9", color: "#3b82f6" },
                    { key: "seo", label: "SEO", color: "#10b981" },
                    { key: "bestPractices", label: "Bonnes pratiques", color: "#f59e0b" },
                  ].map(({ key, label, color }) => (
                    <div key={key}>
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>{label}</div>
                      <ScoreWithTrend
                        value={latestAudit?.scores?.[key] || 0}
                        prevValue={previousAudit?.scores?.[key]}
                        color={color}
                      />
                    </div>
                  ))}
                </div>

                {/* Audit list within domain */}
                {domainAudits.length > 1 && (
                  <div style={{ borderTop: "1px solid #2a2d3a" }}>
                    {domainAudits.map((audit, idx) => {
                      const prevAudit = idx < domainAudits.length - 1 ? domainAudits[idx + 1] : null;
                      return (
                        <div key={audit._id} style={{
                          padding: "12px 22px",
                          borderBottom: idx < domainAudits.length - 1 ? "1px solid #2a2d3a" : "none",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          background: idx === 0 ? "rgba(139,92,246,0.04)" : "transparent",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "12px", color: "#9ca3af", minWidth: "160px" }}>
                              {formatDate(audit.createdAt)}
                            </span>
                            <span style={{ fontSize: "13px", color: "#f0f0f3", fontWeight: 500 }}>
                              {audit.scores?.global || 0}
                            </span>
                            {prevAudit && (
                              <TrendArrow
                                current={audit.scores?.global || 0}
                                previous={prevAudit.scores?.global || 0}
                              />
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>
                              P:{audit.scores?.performance || 0} A:{audit.scores?.accessibility || 0} S:{audit.scores?.seo || 0} BP:{audit.scores?.bestPractices || 0}
                            </span>
                            {prevAudit && (
                              <button
                                onClick={() => handleCompare(audit._id, prevAudit._id)}
                                disabled={comparingId === audit._id}
                                style={{
                                  padding: "4px 10px", background: "#2a2d3a",
                                  border: "1px solid #3a3d4a", borderRadius: "4px",
                                  color: "#a78bfa", fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                                  opacity: comparingId === audit._id ? 0.5 : 1,
                                }}>
                                {comparingId === audit._id ? "..." : "Comparer"}
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/app/phantom?auditId=${audit._id}`)}
                              style={{
                                padding: "4px 10px", background: "#2a2d3a",
                                border: "1px solid #3a3d4a", borderRadius: "4px",
                                color: "#8b5cf6", fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
                              }}>
                              Voir
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List view (flat) */}
      {!loading && viewMode === "list" && audits.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
          {audits.map((audit, idx) => {
            // Find previous audit of same domain
            const samedomainAfter = audits.filter(a => a.domain === audit.domain);
            const myIndex = samedomainAfter.indexOf(audit);
            const prevAudit = myIndex < samedomainAfter.length - 1 ? samedomainAfter[myIndex + 1] : null;

            return (
              <div key={audit._id} style={{
                padding: "16px 20px", background: "#1e2029", border: "1px solid #2a2d3a",
                borderRadius: "10px", borderLeft: "3px solid #8b5cf6",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#d1d5db" }}>{audit.domain}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{formatDate(audit.createdAt)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#6b7280" }}>
                    <span>P:{audit.scores?.performance || 0}{prevAudit && <TrendArrow current={audit.scores?.performance || 0} previous={prevAudit.scores?.performance || 0} />}</span>
                    <span>A:{audit.scores?.accessibility || 0}{prevAudit && <TrendArrow current={audit.scores?.accessibility || 0} previous={prevAudit.scores?.accessibility || 0} />}</span>
                    <span>S:{audit.scores?.seo || 0}{prevAudit && <TrendArrow current={audit.scores?.seo || 0} previous={prevAudit.scores?.seo || 0} />}</span>
                    <span>BP:{audit.scores?.bestPractices || 0}{prevAudit && <TrendArrow current={audit.scores?.bestPractices || 0} previous={prevAudit.scores?.bestPractices || 0} />}</span>
                  </div>
                  <ScoreBadge score={audit.scores?.global || 0} />
                  {prevAudit && (
                    <TrendArrow current={audit.scores?.global || 0} previous={prevAudit.scores?.global || 0} />
                  )}
                  {prevAudit && (
                    <button
                      onClick={() => handleCompare(audit._id, prevAudit._id)}
                      disabled={comparingId === audit._id}
                      style={{
                        padding: "5px 12px", background: "#2a2d3a",
                        border: "1px solid #3a3d4a", borderRadius: "6px",
                        color: "#a78bfa", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                        opacity: comparingId === audit._id ? 0.5 : 1,
                      }}>
                      {comparingId === audit._id ? "..." : "Comparer"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison modal overlay */}
      {compareResult && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }} onClick={() => setCompareResult(null)}>
          <div style={{
            background: "#1e2029", border: "1px solid #2a2d3a", borderRadius: "14px",
            padding: "28px", maxWidth: "600px", width: "100%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3" }}>Comparaison</div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>{compareResult.domain}</div>
              </div>
              <button onClick={() => setCompareResult(null)} style={{
                background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "18px"
              }}>{"\u00d7"}</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "20px" }}>
              {["global", "performance", "accessibility", "seo", "bestPractices"].map(key => {
                const comp = compareResult.comparison?.[key];
                if (!comp) return null;
                const labels = { global: "Global", performance: "Perf.", accessibility: "A11y", seo: "SEO", bestPractices: "BP" };
                return (
                  <div key={key} style={{
                    padding: "12px 8px", background: "#161820", border: "1px solid #2a2d3a",
                    borderRadius: "8px", textAlign: "center"
                  }}>
                    <div style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "6px" }}>{labels[key]}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{comp.previous}</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0" }}>{"\u2193"}</div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3" }}>{comp.current}</div>
                    <div style={{ marginTop: "4px" }}>
                      {comp.diff === 0
                        ? <span style={{ color: "#9ca3af", fontSize: "11px" }}>=</span>
                        : <span style={{ color: comp.diff > 0 ? "#10b981" : "#ef4444", fontSize: "12px", fontWeight: 600 }}>
                            {comp.diff > 0 ? "\u2191+" : "\u2193"}{comp.diff}
                          </span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{
                flex: 1, padding: "12px", background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px", textAlign: "center"
              }}>
                <div style={{ fontSize: "20px", fontWeight: 600, color: "#10b981" }}>{compareResult.resolvedIssues || 0}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>R\u00e9solus</div>
              </div>
              <div style={{
                flex: 1, padding: "12px", background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", textAlign: "center"
              }}>
                <div style={{ fontSize: "20px", fontWeight: 600, color: "#ef4444" }}>{compareResult.newIssues || 0}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>Nouveaux</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evolution chart */}
      {!loading && evolution.length >= 2 && (
        <div style={{
          padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a",
          borderRadius: "10px", marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
            \u00c9volution du score global
          </div>
          <div style={{ position: "relative", height: chartHeight + 30, overflow: "hidden" }}>
            <svg width="100%" height={chartHeight + 30} viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} preserveAspectRatio="xMidYMid meet">
              {[0, 25, 50, 75, 100].map(v => (
                <g key={v}>
                  <line x1="0" y1={chartHeight - (v / maxScore) * chartHeight} x2={chartWidth} y2={chartHeight - (v / maxScore) * chartHeight}
                    stroke="#2a2d3a" strokeWidth="1" />
                  <text x="0" y={chartHeight - (v / maxScore) * chartHeight - 4} fill="#9ca3af" fontSize="13" fontWeight="500">{v}</text>
                </g>
              ))}
              <polyline
                fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round"
                points={evolution.map((a, i) => {
                  const x = (i / (evolution.length - 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - ((a.scores?.global || 0) / maxScore) * chartHeight;
                  return `${x},${y}`;
                }).join(" ")}
              />
              <polygon
                fill="url(#gradient)" opacity="0.3"
                points={[
                  ...evolution.map((a, i) => {
                    const x = (i / (evolution.length - 1)) * (chartWidth - 40) + 20;
                    const y = chartHeight - ((a.scores?.global || 0) / maxScore) * chartHeight;
                    return `${x},${y}`;
                  }),
                  `${(chartWidth - 40) + 20},${chartHeight}`,
                  `20,${chartHeight}`,
                ].join(" ")}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {evolution.map((a, i) => {
                const x = (i / (evolution.length - 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - ((a.scores?.global || 0) / maxScore) * chartHeight;
                return <circle key={i} cx={x} cy={y} r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />;
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
