import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
// VaultResults removed — using inline display

const ACCENT = "#06b6d4";
const BG_TINT = "rgba(6,182,212,0.08)";
const BORDER_TINT = "rgba(6,182,212,0.2)";

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

const ArrowLeftIcon = ({ size = 16, color = "#64748B" }) => (
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

/* --- Radar Chart (SVG) --- */
function RadarChart({ scores }) {
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

  const gridLevels = [25, 50, 75, 100];
  const dataPoints = labels.map((l, i) => getPoint(i, scores[l.key] || 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg width="260" height="260" viewBox="0 0 260 260">
      {gridLevels.map(level => {
        const points = labels.map((_, i) => getPoint(i, level));
        const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="#E2E8F0" strokeWidth="1" />;
      })}
      {labels.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth="1" />;
      })}
      <path d={dataPath} fill="rgba(6,182,212,0.15)" stroke={ACCENT} strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={ACCENT} stroke="#F8FAFC" strokeWidth="2" />
      ))}
      {labels.map((l, i) => {
        const p = getPoint(i, 120);
        const anchor = p.x < cx - 10 ? "end" : p.x > cx + 10 ? "start" : "middle";
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle"
            fill="#334155" fontSize="11" fontWeight="500" fontFamily="inherit">
            {l.label}
          </text>
        );
      })}
    </svg>
  );
}

/* --- Score Badge --- */
function ScoreBadge({ score }) {
  let color = "#ef4444", label = "Critique";
  if (score >= 80) { color = "#22c55e"; label = "Excellent"; }
  else if (score >= 60) { color = "#eab308"; label = "Correct"; }
  else if (score >= 40) { color = "#f97316"; label = "Insuffisant"; }

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2" style={{
        border: `4px solid ${color}`,
        background: `${color}10`,
      }}>
        <span className="text-[26px] font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="inline-flex px-3 py-[3px] rounded-md text-xs font-semibold" style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}>
        {label}
      </div>
    </div>
  );
}

/* --- Metric Bar --- */
function MetricBar({ label, score, icon }) {
  let color = "#ef4444";
  if (score >= 80) color = "#22c55e";
  else if (score >= 60) color = "#eab308";
  else if (score >= 40) color = "#f97316";

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#d1d5db] flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className="text-xs font-semibold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-[5px] rounded-sm bg-[#2a2d3a] overflow-hidden">
        <div className="h-full rounded-sm transition-[width] duration-[0.6s] ease-out" style={{
          background: color,
          width: `${score}%`,
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

  useEffect(() => {
    if (scan && scan.domain && scan.status === "completed") {
      setLoadingScore(true);
      get(`/api/vault/security-score/${encodeURIComponent(scan.domain)}`)
        .then(data => setSecurityScore(data))
        .catch(() => {})
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
    <div className="max-w-[1100px]">
      {/* Top actions */}
      <div className="flex items-center gap-2.5 mb-6 flex-wrap">
        <button
          onClick={() => navigate("/app/vault/history")}
          className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-md bg-transparent border border-[rgba(6,182,212,0.2)] text-[#06b6d4] text-xs font-medium cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.08)]"
        >
          <ArrowLeftIcon size={14} color={ACCENT} />
          Retour
        </button>

        {scan && scan.status === "completed" && (
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-md border-none text-white text-xs font-medium font-[inherit] transition-all duration-150"
            style={{
              background: downloadingPdf ? "#E2E8F0" : "linear-gradient(135deg, #06b6d4, #22d3ee)",
              cursor: downloadingPdf ? "not-allowed" : "pointer",
              opacity: downloadingPdf ? 0.7 : 1,
            }}
          >
            {downloadingPdf ? (
              <>
                <div className="w-[13px] h-[13px] border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-[vault-spin_0.8s_linear_infinite]" />
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
      <div className="mb-8">
        <div className="w-10 h-[3px] rounded-sm bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] mb-4" />
        <h1 className="text-[22px] font-semibold text-[#0F172A] mb-1.5">
          {scan ? scan.domain : "Détails de l'analyse"}
        </h1>
        <p className="text-sm text-[#9ca3af]">
          {scan ? `Analyse du ${formatDate(scan.createdAt || scan.date)}` : "Chargement..."}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-9 h-9 mx-auto mb-3 border-[3px] border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[vault-spin_1s_linear_infinite]" />
          <div className="text-[13px] text-[#9ca3af]">Chargement de l'analyse...</div>
          <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3.5 py-2.5 mb-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-md text-[13px] text-[#fca5a5]">
          {error}
        </div>
      )}

      {/* Security Score Section */}
      {scan && !loading && securityScore && (
        <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
          <div className="flex items-center gap-2 mb-5">
            <ShieldIcon size={20} color={ACCENT} />
            <h2 className="text-base font-semibold text-[#0F172A] m-0">
              Score de sécurité global
            </h2>
          </div>

          <div className="flex gap-6 items-center flex-wrap justify-center">
            {/* Radar Chart */}
            <div className="shrink-0">
              <RadarChart scores={securityScore.scores} />
            </div>

            {/* Score + Metric Bars */}
            <div className="flex-1 min-w-[240px]">
              <div className="mb-5">
                <ScoreBadge score={securityScore.overallScore} />
              </div>
              <MetricBar
                label="Fuites de données"
                score={securityScore.scores.breaches}
                icon={<AlertTriangleIcon size={13} color={securityScore.scores.breaches >= 60 ? "#22c55e" : "#ef4444"} />}
              />
              <MetricBar
                label="Conformité RGPD"
                score={securityScore.scores.rgpd}
                icon={<ShieldIcon size={13} color={securityScore.scores.rgpd >= 60 ? "#22c55e" : "#ef4444"} />}
              />
              <MetricBar
                label="Sécurité emails"
                score={securityScore.scores.emails}
                icon={<ShieldIcon size={13} color={securityScore.scores.emails >= 60 ? "#22c55e" : "#ef4444"} />}
              />
              <MetricBar
                label="Mots de passe"
                score={securityScore.scores.passwords}
                icon={<ShieldIcon size={13} color={securityScore.scores.passwords >= 60 ? "#22c55e" : "#ef4444"} />}
              />
              {!securityScore.rgpdAvailable && (
                <div className="mt-2 px-3 py-2 bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.2)] rounded-md text-[11px] text-[#eab308]">
                  Score RGPD estimé \u2014 lancez une analyse RGPD pour un résultat précis.
                </div>
              )}
            </div>
          </div>

          {/* Recommended Actions */}
          {securityScore.actions && securityScore.actions.length > 0 && (
            <div className="mt-6 border-t border-[rgba(6,182,212,0.2)] pt-5">
              <div className="flex items-center gap-2 mb-3.5">
                <AlertTriangleIcon size={16} color={ACCENT} />
                <h3 className="text-sm font-semibold text-[#0F172A] m-0">
                  Actions recommandées
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {securityScore.actions.map((action, i) => {
                  const conf = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.low;
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg" style={{
                      background: conf.bg,
                      border: `1px solid ${conf.border}`,
                      borderLeft: `3px solid ${conf.color}`,
                    }}>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 mt-0.5" style={{
                        color: conf.color,
                        background: `${conf.color}20`,
                      }}>
                        {conf.label}
                      </span>
                      <div>
                        <div className="text-[13px] font-semibold text-[#0F172A] mb-0.5">
                          {action.label}
                        </div>
                        <div className="text-xs text-[#9ca3af] leading-normal">
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
        <div className="bg-[#F8FAFC] border border-[rgba(6,182,212,0.2)] rounded-[10px] text-center p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
          <div className="w-6 h-6 mx-auto mb-2 border-2 border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[vault-spin_1s_linear_infinite]" />
          <div className="text-xs text-[#9ca3af]">Calcul du score de sécurité...</div>
        </div>
      )}

      {/* Results */}
      {scan && !loading && <div className="text-sm text-gray-400">Détails du scan disponibles dans l'onglet Scan RGPD.</div>}

      <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
