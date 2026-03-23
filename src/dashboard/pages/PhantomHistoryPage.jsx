import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import SubNav from "../components/SubNav";

const PHANTOM_NAV = [
  { path: "/app/phantom", label: "Audit", end: true },
  { path: "/app/phantom/history", label: "Historique" },
  { path: "/app/phantom/recommendations", label: "Recommandations" },
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

export default function PhantomHistoryPage() {
  const api = useApi();
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [evolution, setEvolution] = useState([]);
  const [updatingDomain, setUpdatingDomain] = useState(null);

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

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Group audits by domain for the "update" buttons
  const uniqueDomains = [...new Set(audits.map(a => a.domain))];

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
          Suivez l'évolution de vos scores au fil du temps.
        </p>
      </div>

      {/* Domain cards with update buttons */}
      {!loading && uniqueDomains.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
          {uniqueDomains.map(domain => {
            const latestAudit = audits.find(a => a.domain === domain);
            const domainAudits = audits.filter(a => a.domain === domain);
            const isUpdating = updatingDomain === domain;
            return (
              <div key={domain} style={{
                padding: "18px 22px", background: "#1e2029", border: "1px solid #2a2d3a",
                borderRadius: "10px", borderLeft: "3px solid #8b5cf6",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 500, color: "#d1d5db" }}>{domain}</div>
                      <div style={{ fontSize: "12px", color: "#d1d5db" }}>
                        {domainAudits.length} audit{domainAudits.length > 1 ? "s" : ""} — Dernier : {formatDate(latestAudit?.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <ScoreBadge score={latestAudit?.scores?.global || 0} />
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
                          Mettre à jour
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Score bars */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Performance</div>
                    <MiniBar value={latestAudit?.scores?.performance || 0} color="#8b5cf6" />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Accessibilité</div>
                    <MiniBar value={latestAudit?.scores?.accessibility || 0} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>SEO</div>
                    <MiniBar value={latestAudit?.scores?.seo || 0} color="#10b981" />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Bonnes pratiques</div>
                    <MiniBar value={latestAudit?.scores?.bestPractices || 0} color="#f59e0b" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Domain filter tabs */}
      {domains.length > 1 && (
        <div style={{ marginBottom: "20px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
            Aucun audit enregistré
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

      {/* Evolution chart */}
      {!loading && evolution.length >= 2 && (
        <div style={{
          padding: "24px", background: "#1e2029", border: "1px solid #2a2d3a",
          borderRadius: "10px", marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
            Évolution du score global
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
