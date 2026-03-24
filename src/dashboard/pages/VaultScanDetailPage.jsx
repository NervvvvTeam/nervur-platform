import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import { VaultResults } from "./VaultDashboardPage";

const ACCENT = "#06b6d4";
const BG_TINT = "rgba(6,182,212,0.08)";
const BORDER_TINT = "rgba(6,182,212,0.2)";

const cardStyle = {
  background: "#1e2029",
  border: "1px solid #2a2d3a",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const PRIORITY_CONFIG = {
  critical: { color: "#ef4444", label: "Critique", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  high: { color: "#f97316", label: "Urgent", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
  medium: { color: "#eab308", label: "Important", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)" },
  low: { color: "#22c55e", label: "Info", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
};

const ShieldIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ArrowLeftIcon = ({ size = 16, color = "#6b7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const AlertTriangleIcon = ({ size = 16, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const DownloadIcon = ({ size = 15, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

/* ─── Radar Chart (SVG) ─── */
function RadarChart({ scores }) {
  // scores: { breaches, rgpd, emails, passwords } — each 0-100
  const labels = [
    { key: "breaches", label: "Fuites" },
    { key: "rgpd", label: "RGPD" },
    { key: "emails", label: "Emails" },
    { key: "passwords", label: "Mots de passe" },
  ];

  const cx = 130, cy = 130, maxR = 90;
  const angleStep = (2 * Math.PI) / labels.length;

  function getPoint(index, value) {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // Grid circles
  const gridLevels = [25, 50, 75, 100];

  // Data polygon
  const dataPoints = labels.map((l, i) => getPoint(i, scores[l.key] || 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg width="260" height="260" viewBox="0 0 260 260">
      {/* Grid */}
      {gridLevels.map(level => {
        const points = labels.map((_, i) => getPoint(i, level));
        const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="#2a2d3a" strokeWidth="1" />;
      })}
      {/* Axes */}
      {labels.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2a2d3a" strokeWidth="1" />;
      })}
      {/* Data area */}
      <path d={dataPath} fill="rgba(6,182,212,0.15)" stroke={ACCENT} strokeWidth="2" />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={ACCENT} stroke="#1e2029" strokeWidth="2" />
      ))}
      {/* Labels */}
      {labels.map((l, i) => {
        const p = getPoint(i, 120);
        const anchor = p.x < cx - 10 ? "end" : p.x > cx + 10 ? "start" : "middle";
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle"
            fill="#d1d5db" fontSize="11" fontWeight="500" fontFamily="inherit">
            {l.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Score Badge ─── */
function ScoreBadge({ score }) {
  let color = "#ef4444", label = "Critique";
  if (score >= 80) { color = "#22c55e"; label = "Excellent"; }
  else if (score >= 60) { color = "#eab308"; label = "Correct"; }
  else if (score >= 40) { color = "#f97316"; label = "Insuffisant"; }

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        border: `4px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 8px",
        background: `${color}10`,
      }}>
        <span style={{ fontSize: "26px", fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{
        display: "inline-flex", padding: "3px 12px", borderRadius: "6px",
        fontSize: "12px", fontWeight: 600, color,
        background: `${color}15`, border: `1px solid ${color}30`,
      }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Metric Bar ─── */
function MetricBar({ label, score, icon }) {
  let color = "#ef4444";
  if (score >= 80) color = "#22c55e";
  else if (score >= 60) color = "#eab308";
  else if (score >= 40) color = "#f97316";

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "#d1d5db", display: "flex", alignItems: "center", gap: "6px" }}>
          {icon}
          {label}
        </span>
        <span style={{ fontSize: "12px", fontWeight: 600, color }}>{score}/100</span>
      </div>
      <div style={{ height: "5px", borderRadius: "3px", background: "#2a2d3a", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "3px", background: color,
          width: `${score}%`, transition: "width 0.6s ease-out",
        }} />
      </div>
    </div>
  );
}

export default function VaultScanDetailPage() {
  const { id } = useParams();
  const { get } = useApi();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [securityScore, setSecurityScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const fetchScan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get(`/api/vault/scan/${id}`);
      setScan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [get, id]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  // Fetch security score when scan is loaded
  useEffect(() => {
    if (scan && scan.domain && scan.status === "completed") {
      setLoadingScore(true);
      get(`/api/vault/security-score/${encodeURIComponent(scan.domain)}`)
        .then(data => setSecurityScore(data))
        .catch(() => { /* silently fail — score is supplementary */ })
        .finally(() => setLoadingScore(false));
    }
  }, [scan, get]);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API}/api/vault/scan/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du telechargement du rapport.");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `rapport-vault-${scan?.domain || "scan"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px" }}>
      {/* Top actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/app/vault/history")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "7px 14px", borderRadius: "6px",
            background: "transparent", border: `1px solid ${BORDER_TINT}`,
            color: ACCENT, fontSize: "12px", fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = BG_TINT; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <ArrowLeftIcon size={14} color={ACCENT} />
          Retour
        </button>

        {scan && scan.status === "completed" && (
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "6px",
              background: downloadingPdf ? "#2a2d3a" : "linear-gradient(135deg, #06b6d4, #22d3ee)",
              border: "none",
              color: "#fff", fontSize: "12px", fontWeight: 500,
              cursor: downloadingPdf ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              opacity: downloadingPdf ? 0.7 : 1,
            }}
          >
            {downloadingPdf ? (
              <>
                <div style={{
                  width: "13px", height: "13px",
                  border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
                  borderRadius: "50%", animation: "vault-spin 0.8s linear infinite",
                }} />
                Generation...
              </>
            ) : (
              <>
                <DownloadIcon size={14} />
                Telecharger le rapport PDF
              </>
            )}
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #06b6d4, #22d3ee)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          {scan ? scan.domain : "D\u00e9tails de l'analyse"}
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          {scan ? `Analyse du ${formatDate(scan.createdAt || scan.date)}` : "Chargement..."}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{
            width: "36px", height: "36px", margin: "0 auto 12px",
            border: "3px solid rgba(6,182,212,0.2)", borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "vault-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>Chargement de l'analyse...</div>
          <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px 14px", marginBottom: "16px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "6px", fontSize: "13px", color: "#fca5a5",
        }}>
          {error}
        </div>
      )}

      {/* Security Score Section */}
      {scan && !loading && securityScore && (
        <div style={{
          ...cardStyle,
          border: `1px solid ${BORDER_TINT}`,
          background: BG_TINT,
          marginBottom: "28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <ShieldIcon size={20} color={ACCENT} />
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
              Score de s\u00e9curit\u00e9 global
            </h2>
          </div>

          <div style={{
            display: "flex", gap: "24px", alignItems: "center",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            {/* Radar Chart */}
            <div style={{ flexShrink: 0 }}>
              <RadarChart scores={securityScore.scores} />
            </div>

            {/* Score + Metric Bars */}
            <div style={{ flex: 1, minWidth: "240px" }}>
              <div style={{ marginBottom: "20px" }}>
                <ScoreBadge score={securityScore.overallScore} />
              </div>
              <MetricBar
                label="Fuites de donn\u00e9es"
                score={securityScore.scores.breaches}
                icon={<AlertTriangleIcon size={13} color={securityScore.scores.breaches >= 60 ? "#22c55e" : "#ef4444"} />}
              />
              <MetricBar
                label="Conformit\u00e9 RGPD"
                score={securityScore.scores.rgpd}
                icon={<ShieldIcon size={13} color={securityScore.scores.rgpd >= 60 ? "#22c55e" : "#ef4444"} />}
              />
              <MetricBar
                label="S\u00e9curit\u00e9 emails"
                score={securityScore.scores.emails}
                icon={<ShieldIcon size={13} color={securityScore.scores.emails >= 60 ? "#22c55e" : "#ef4444"} />}
              />
              <MetricBar
                label="Mots de passe"
                score={securityScore.scores.passwords}
                icon={<ShieldIcon size={13} color={securityScore.scores.passwords >= 60 ? "#22c55e" : "#ef4444"} />}
              />
              {!securityScore.rgpdAvailable && (
                <div style={{
                  marginTop: "8px", padding: "8px 12px",
                  background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)",
                  borderRadius: "6px", fontSize: "11px", color: "#eab308",
                }}>
                  Score RGPD estim\u00e9 — lancez une analyse RGPD pour un r\u00e9sultat pr\u00e9cis.
                </div>
              )}
            </div>
          </div>

          {/* Recommended Actions */}
          {securityScore.actions && securityScore.actions.length > 0 && (
            <div style={{ marginTop: "24px", borderTop: `1px solid ${BORDER_TINT}`, paddingTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <AlertTriangleIcon size={16} color={ACCENT} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
                  Actions recommand\u00e9es
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {securityScore.actions.map((action, i) => {
                  const conf = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.low;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "12px",
                      padding: "12px 16px",
                      background: conf.bg,
                      border: `1px solid ${conf.border}`,
                      borderLeft: `3px solid ${conf.color}`,
                      borderRadius: "8px",
                    }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, color: conf.color,
                        background: `${conf.color}20`, padding: "2px 8px", borderRadius: "4px",
                        flexShrink: 0, marginTop: "2px",
                      }}>
                        {conf.label}
                      </span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#f0f0f3", marginBottom: "2px" }}>
                          {action.label}
                        </div>
                        <div style={{ fontSize: "12px", color: "#9ca3af", lineHeight: 1.5 }}>
                          {action.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading score indicator */}
      {scan && !loading && loadingScore && (
        <div style={{
          ...cardStyle, border: `1px solid ${BORDER_TINT}`,
          textAlign: "center", padding: "24px", marginBottom: "28px",
        }}>
          <div style={{
            width: "24px", height: "24px", margin: "0 auto 8px",
            border: "2px solid rgba(6,182,212,0.2)", borderTop: `2px solid ${ACCENT}`,
            borderRadius: "50%", animation: "vault-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "12px", color: "#9ca3af" }}>Calcul du score de s\u00e9curit\u00e9...</div>
        </div>
      )}

      {/* Results */}
      {scan && !loading && <VaultResults scan={scan} />}

      <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
