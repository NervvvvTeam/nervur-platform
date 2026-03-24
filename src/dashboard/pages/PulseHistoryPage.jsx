import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PULSE_NAV = [
  { path: "/app/pulse", label: "Moniteur", end: true },
  { path: "/app/pulse/history", label: "\u00c9volution" },
  { path: "/app/pulse/alerts", label: "Alertes" },
  { path: "/app/pulse/status", label: "Page de statut" },
];

const ACCENT = "#ec4899";
const ACCENT_LIGHT = "#f472b6";
const BG_TINT = "rgba(236,72,153,0.06)";
const BORDER_TINT = "rgba(236,72,153,0.18)";

const cardStyle = {
  background: "#1e2029",
  border: "1px solid #2a2d3a",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const HeartPulseIcon = ({ size = 22, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
    <path d="M12 6v4l2 2-2 2v4" />
  </svg>
);

const AlertTriangleIcon = ({ size = 16, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ═══ Score evolution chart (existing, kept) ═══
function ScoreChart({ history, width = 820, height = 180 }) {
  if (!history || history.length < 2) {
    return (
      <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "12px" }}>
        Pas assez de donnees pour afficher le graphique
      </div>
    );
  }

  const points = history.slice(-30);
  const maxScore = 100;
  const padding = { top: 10, bottom: 25, left: 5, right: 5 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (i) => padding.left + (i / (points.length - 1)) * chartW;
  const getY = (score) => padding.top + chartH - (score / maxScore) * chartH;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.score)}`).join(" ");
  const areaD = pathD + ` L ${getX(points.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.3" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={padding.left} y1={getY(v)} x2={width - padding.right} y2={getY(v)} stroke="#2a2d3a" strokeWidth="1" />
          <text x={width - padding.right + 2} y={getY(v) + 3} fill="#6b7280" fontSize="9">{v}</text>
        </g>
      ))}
      <path d={areaD} fill="url(#pulseGrad)" />
      <path d={pathD} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={getX(i)} cy={getY(p.score)} r="3" fill={ACCENT} stroke="#1e2029" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ═══ Response time chart ═══
function ResponseTimeChart({ history, width = 820, height = 160 }) {
  const points = (history || []).slice(-30).filter(p => p.responseTime != null);
  if (points.length < 2) {
    return (
      <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "12px" }}>
        Pas assez de donnees de temps de reponse
      </div>
    );
  }

  const times = points.map(p => p.responseTime);
  const maxT = Math.max(...times, 100);
  const padding = { top: 10, bottom: 25, left: 5, right: 5 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (i) => padding.left + (i / (points.length - 1)) * chartW;
  const getY = (t) => padding.top + chartH - (t / maxT) * chartH;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.responseTime)}`).join(" ");
  const areaD = pathD + ` L ${getX(points.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

  // Grid lines for response time
  const gridValues = [0, Math.round(maxT * 0.25), Math.round(maxT * 0.5), Math.round(maxT * 0.75), maxT];

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="rtGradHist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridValues.map(v => (
        <g key={v}>
          <line x1={padding.left} y1={getY(v)} x2={width - padding.right} y2={getY(v)} stroke="#2a2d3a" strokeWidth="1" />
          <text x={width - padding.right + 2} y={getY(v) + 3} fill="#6b7280" fontSize="9">{v}ms</text>
        </g>
      ))}
      <path d={areaD} fill="url(#rtGradHist)" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const color = p.responseTime < 500 ? "#10b981" : p.responseTime < 1500 ? "#f59e0b" : "#ef4444";
        return (
          <circle key={i} cx={getX(i)} cy={getY(p.responseTime)} r="3" fill={color} stroke="#1e2029" strokeWidth="1.5" />
        );
      })}
    </svg>
  );
}

// ═══ Downtime incidents list ═══
function DowntimeIncidents({ history }) {
  const incidents = (history || []).filter(h => h.uptimeStatus === false);

  if (incidents.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "24px", marginBottom: "8px" }}>&#9989;</div>
        <div style={{ fontSize: "13px", color: "#10b981", fontWeight: 500 }}>Aucun incident detecte</div>
        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
          Tous les checks ont montre le site en ligne.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {incidents.slice(-10).reverse().map((inc, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 16px", background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.12)", borderRadius: "8px",
        }}>
          <AlertTriangleIcon size={16} color="#ef4444" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#f87171" }}>Site hors ligne</div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
              {new Date(inc.checkedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <span style={{
            fontSize: "11px", fontWeight: 600, color: "#ef4444",
            padding: "2px 8px", borderRadius: "4px", background: "rgba(239,68,68,0.1)",
          }}>
            Score : {inc.score}/100
          </span>
        </div>
      ))}
      {incidents.length > 10 && (
        <div style={{ fontSize: "11px", color: "#6b7280", textAlign: "center", paddingTop: "4px" }}>
          ... et {incidents.length - 10} incidents supplementaires
        </div>
      )}
    </div>
  );
}

// ═══ SSL / Domain expiry timeline ═══
function ExpiryTimeline({ site }) {
  const check = site.lastCheck || {};
  const items = [];

  if (check.ssl?.valid && check.ssl.daysLeft != null) {
    const sslColor = check.ssl.daysLeft > 30 ? "#10b981" : check.ssl.daysLeft > 7 ? "#f59e0b" : "#ef4444";
    items.push({
      label: "Certificat SSL",
      days: check.ssl.daysLeft,
      date: check.ssl.expiryDate ? new Date(check.ssl.expiryDate).toLocaleDateString("fr-FR") : null,
      color: sslColor,
      detail: check.ssl.issuer ? `Emetteur : ${check.ssl.issuer}` : null,
    });
  }

  if (check.domain?.daysUntilExpiry != null) {
    const domainColor = check.domain.daysUntilExpiry > 60 ? "#10b981" : check.domain.daysUntilExpiry > 30 ? "#f59e0b" : "#ef4444";
    items.push({
      label: "Nom de domaine",
      days: check.domain.daysUntilExpiry,
      date: check.domain.expiryEstimate ? new Date(check.domain.expiryEstimate).toLocaleDateString("fr-FR") : null,
      color: domainColor,
      detail: null,
    });
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#6b7280", fontSize: "12px" }}>
        Aucune donnee d'expiration disponible.
      </div>
    );
  }

  const maxDays = 365;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#d1d5db", fontWeight: 500 }}>{item.label}</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: item.color }}>
              {item.days} jours
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: "8px", borderRadius: "4px", background: "#2a2d3a", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "4px", background: item.color,
              width: `${Math.min(100, Math.max(2, (item.days / maxDays) * 100))}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            {item.date && (
              <span style={{ fontSize: "10px", color: "#6b7280" }}>Expiration : {item.date}</span>
            )}
            {item.detail && (
              <span style={{ fontSize: "10px", color: "#6b7280" }}>{item.detail}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══ History table (enhanced with response time column) ═══
function HistoryTable({ history }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
        Aucun historique disponible pour ce site.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, borderBottom: "1px solid #2a2d3a", fontSize: "12px" }}>Date</th>
            <th style={{ textAlign: "center", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, borderBottom: "1px solid #2a2d3a", fontSize: "12px" }}>Statut</th>
            <th style={{ textAlign: "center", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, borderBottom: "1px solid #2a2d3a", fontSize: "12px" }}>Score</th>
            <th style={{ textAlign: "center", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, borderBottom: "1px solid #2a2d3a", fontSize: "12px" }}>Temps de reponse</th>
            <th style={{ textAlign: "right", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, borderBottom: "1px solid #2a2d3a", fontSize: "12px" }}>Tendance</th>
          </tr>
        </thead>
        <tbody>
          {[...history].reverse().map((entry, i, arr) => {
            const prev = arr[i + 1];
            const diff = prev ? entry.score - prev.score : 0;
            const scoreColor = entry.score >= 80 ? "#10b981" : entry.score >= 50 ? "#f59e0b" : "#ef4444";
            const isDown = entry.uptimeStatus === false;
            const rtColor = entry.responseTime == null ? "#6b7280" : entry.responseTime < 500 ? "#10b981" : entry.responseTime < 1500 ? "#f59e0b" : "#ef4444";
            return (
              <tr key={i} style={{
                borderBottom: "1px solid #2a2d3a20",
                background: isDown ? "rgba(239,68,68,0.04)" : "transparent",
              }}>
                <td style={{ padding: "10px 14px", color: "#d1d5db" }}>
                  {new Date(entry.checkedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: "4px",
                    fontSize: "11px", fontWeight: 500,
                    color: isDown ? "#ef4444" : "#10b981",
                    background: isDown ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                  }}>
                    {isDown ? "Hors ligne" : "En ligne"}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 10px", borderRadius: "4px",
                    fontSize: "13px", fontWeight: 600, color: scoreColor,
                    background: `${scoreColor}15`,
                  }}>
                    {entry.score}/100
                  </span>
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 500, color: rtColor }}>
                  {entry.responseTime != null ? `${entry.responseTime}ms` : "—"}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "12px", fontWeight: 500, color: diff > 0 ? "#10b981" : diff < 0 ? "#ef4444" : "#6b7280" }}>
                  {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "="}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function PulseHistoryPage() {
  const { get } = useApi();
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get("/api/pulse/sites");
      setSites(data);
      if (data.length > 0 && !selectedSite) {
        setSelectedSite(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [get, selectedSite]);

  useEffect(() => { loadSites(); }, [loadSites]);

  const currentSite = sites.find(s => s._id === selectedSite);

  return (
    <div style={{ maxWidth: "900px" }}>
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: BG_TINT, border: `1px solid ${BORDER_TINT}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <HeartPulseIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>Evolution</h1>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, marginTop: "2px" }}>
            Suivez l'evolution du score de sante de vos sites
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div style={{
        height: "3px", borderRadius: "2px", marginBottom: "28px", marginTop: "16px",
        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
      }} />

      {/* Loading */}
      {loading && (
        <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, textAlign: "center", padding: "48px 24px" }}>
          <div style={{
            width: "48px", height: "48px", margin: "0 auto 16px",
            border: `3px solid ${BORDER_TINT}`, borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "pulse-hist-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "14px", color: "#9ca3af" }}>Chargement...</div>
          <style>{`@keyframes pulse-hist-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* No sites */}
      {!loading && sites.length === 0 && (
        <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, background: BG_TINT, textAlign: "center", padding: "48px 24px" }}>
          <HeartPulseIcon size={48} color={ACCENT} />
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", marginTop: "16px", marginBottom: "8px" }}>
            Aucun site surveille
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            Ajoutez un site depuis l'onglet Moniteur pour voir son evolution ici.
          </div>
        </div>
      )}

      {/* Site selector */}
      {!loading && sites.length > 0 && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {sites.map(site => (
                <button
                  key={site._id}
                  onClick={() => setSelectedSite(site._id)}
                  style={{
                    padding: "8px 16px", borderRadius: "6px",
                    fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    background: selectedSite === site._id ? `${ACCENT}20` : "#1e2029",
                    color: selectedSite === site._id ? ACCENT : "#9ca3af",
                    border: `1px solid ${selectedSite === site._id ? BORDER_TINT : "#2a2d3a"}`,
                  }}
                >
                  {site.domain}
                </button>
              ))}
            </div>
          </div>

          {currentSite && (
            <>
              {/* Score chart */}
              <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>Evolution du score — {currentSite.domain}</span>
                </div>
                <ScoreChart history={currentSite.history || []} width={820} height={180} />
              </div>

              {/* Response time chart */}
              <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>Temps de reponse — {currentSite.domain}</span>
                  {(() => {
                    const pts = (currentSite.history || []).filter(h => h.responseTime != null);
                    if (pts.length === 0) return null;
                    const avg = Math.round(pts.reduce((s, p) => s + p.responseTime, 0) / pts.length);
                    return (
                      <span style={{
                        fontSize: "11px", fontWeight: 600,
                        color: avg < 500 ? "#10b981" : avg < 1500 ? "#f59e0b" : "#ef4444",
                        background: `${avg < 500 ? "#10b981" : avg < 1500 ? "#f59e0b" : "#ef4444"}15`,
                        padding: "2px 8px", borderRadius: "4px", marginLeft: "auto",
                      }}>
                        Moyenne : {avg}ms
                      </span>
                    );
                  })()}
                </div>
                <ResponseTimeChart history={currentSite.history || []} width={820} height={160} />
              </div>

              {/* Two-column: Downtime incidents + SSL/Domain expiry */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Downtime incidents */}
                <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <AlertTriangleIcon size={14} color="#ef4444" />
                    <span style={{ fontSize: "13px", color: "#9ca3af" }}>Incidents de downtime</span>
                    {(() => {
                      const count = (currentSite.history || []).filter(h => h.uptimeStatus === false).length;
                      return count > 0 ? (
                        <span style={{
                          fontSize: "11px", fontWeight: 600, color: "#ef4444",
                          background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: "4px", marginLeft: "auto",
                        }}>
                          {count}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <DowntimeIncidents history={currentSite.history || []} />
                </div>

                {/* SSL / Domain expiry timeline */}
                <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    <span style={{ fontSize: "13px", color: "#9ca3af" }}>Expiration SSL / Domaine</span>
                  </div>
                  <ExpiryTimeline site={currentSite} />
                </div>
              </div>

              {/* History table */}
              <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>Historique des analyses</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, color: ACCENT,
                    background: `${ACCENT}15`, padding: "2px 8px", borderRadius: "4px", marginLeft: "auto",
                  }}>
                    {currentSite.history?.length || 0} analyses
                  </span>
                </div>
                <HistoryTable history={currentSite.history || []} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
