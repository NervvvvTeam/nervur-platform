import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PULSE_NAV = [
  { path: "/app/pulse", label: "Moniteur", end: true },
  { path: "/app/pulse/history", label: "\u00c9volution" },
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

function MiniChart({ history, width = 300, height = 120 }) {
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
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={padding.left} y1={getY(v)} x2={width - padding.right} y2={getY(v)} stroke="#2a2d3a" strokeWidth="1" />
          <text x={width - padding.right + 2} y={getY(v) + 3} fill="#6b7280" fontSize="9">{v}</text>
        </g>
      ))}
      {/* Area fill */}
      <path d={areaD} fill="url(#pulseGrad)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={getX(i)} cy={getY(p.score)} r="3" fill={ACCENT} stroke="#1e2029" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

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
            <th style={{ textAlign: "center", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, borderBottom: "1px solid #2a2d3a", fontSize: "12px" }}>Score</th>
            <th style={{ textAlign: "right", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, borderBottom: "1px solid #2a2d3a", fontSize: "12px" }}>Tendance</th>
          </tr>
        </thead>
        <tbody>
          {[...history].reverse().map((entry, i, arr) => {
            const prev = arr[i + 1];
            const diff = prev ? entry.score - prev.score : 0;
            const scoreColor = entry.score >= 80 ? "#10b981" : entry.score >= 50 ? "#f59e0b" : "#ef4444";
            return (
              <tr key={i} style={{ borderBottom: "1px solid #2a2d3a20" }}>
                <td style={{ padding: "10px 14px", color: "#d1d5db" }}>
                  {new Date(entry.checkedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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
                    padding: "8px 16px", borderRadius: "6px", border: "none",
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

          {/* Chart */}
          {currentSite && (
            <>
              <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>Evolution du score — {currentSite.domain}</span>
                </div>
                <MiniChart history={currentSite.history || []} width={820} height={180} />
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
