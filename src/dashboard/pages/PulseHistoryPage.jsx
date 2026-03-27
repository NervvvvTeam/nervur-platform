import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PULSE_NAV = [
  { path: "/app/pulse", label: "Moniteur", end: true },
  { path: "/app/pulse/history", label: "\Évolution" },
  { path: "/app/pulse/alerts", label: "Alertes" },
  { path: "/app/pulse/status", label: "Page de statut" },
];

const ACCENT = "#ec4899";
const ACCENT_LIGHT = "#f472b6";
const BG_TINT = "rgba(236,72,153,0.06)";
const BORDER_TINT = "rgba(236,72,153,0.18)";

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

// Score evolution chart (SVG - kept with minimal inline styles for computed coords)
function ScoreChart({ history, width = 820, height = 180 }) {
  if (!history || history.length < 2) {
    return (
      <div className="flex items-center justify-center text-[#6b7280] text-xs" style={{ width, height }}>
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
    <svg width={width} height={height} className="block">
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

// Response time chart (SVG)
function ResponseTimeChart({ history, width = 820, height = 160 }) {
  const points = (history || []).slice(-30).filter(p => p.responseTime != null);
  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center text-[#6b7280] text-xs" style={{ width, height }}>
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

  const gridValues = [0, Math.round(maxT * 0.25), Math.round(maxT * 0.5), Math.round(maxT * 0.75), maxT];

  return (
    <svg width={width} height={height} className="block">
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

// Downtime incidents list
function DowntimeIncidents({ history }) {
  const incidents = (history || []).filter(h => h.uptimeStatus === false);

  if (incidents.length === 0) {
    return (
      <div className="p-5 text-center">
        <div className="text-2xl mb-2">&#9989;</div>
        <div className="text-[13px] text-[#10b981] font-medium">Aucun incident detecte</div>
        <div className="text-xs text-[#6b7280] mt-1">
          Tous les checks ont montre le site en ligne.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {incidents.slice(-10).reverse().map((inc, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.12)] rounded-lg">
          <AlertTriangleIcon size={16} color="#ef4444" />
          <div className="flex-1">
            <div className="text-xs font-medium text-[#f87171]">Site hors ligne</div>
            <div className="text-[11px] text-[#6b7280] mt-0.5">
              {new Date(inc.checkedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#ef4444] px-2 py-0.5 rounded bg-[rgba(239,68,68,0.1)]">
            Score : {inc.score}/100
          </span>
        </div>
      ))}
      {incidents.length > 10 && (
        <div className="text-[11px] text-[#6b7280] text-center pt-1">
          ... et {incidents.length - 10} incidents supplementaires
        </div>
      )}
    </div>
  );
}

// SSL / Domain expiry timeline
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
      <div className="p-5 text-center text-[#6b7280] text-xs">
        Aucune donnee d'expiration disponible.
      </div>
    );
  }

  const maxDays = 365;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#d1d5db] font-medium">{item.label}</span>
            <span className="text-xs font-semibold" style={{ color: item.color }}>
              {item.days} jours
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 rounded bg-[#2a2d3a] overflow-hidden">
            <div
              className="h-full rounded transition-[width] duration-500 ease-in-out"
              style={{
                background: item.color,
                width: `${Math.min(100, Math.max(2, (item.days / maxDays) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {item.date && (
              <span className="text-[10px] text-[#6b7280]">Expiration : {item.date}</span>
            )}
            {item.detail && (
              <span className="text-[10px] text-[#6b7280]">{item.detail}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// History table
function HistoryTable({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-[#6b7280] text-[13px]">
        Aucun historique disponible pour ce site.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="text-left px-3.5 py-2.5 text-[#9ca3af] font-medium border-b border-[#2a2d3a] text-xs">Date</th>
            <th className="text-center px-3.5 py-2.5 text-[#9ca3af] font-medium border-b border-[#2a2d3a] text-xs">Statut</th>
            <th className="text-center px-3.5 py-2.5 text-[#9ca3af] font-medium border-b border-[#2a2d3a] text-xs">Score</th>
            <th className="text-center px-3.5 py-2.5 text-[#9ca3af] font-medium border-b border-[#2a2d3a] text-xs">Temps de reponse</th>
            <th className="text-right px-3.5 py-2.5 text-[#9ca3af] font-medium border-b border-[#2a2d3a] text-xs">Tendance</th>
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
              <tr key={i} className="border-b border-[#2a2d3a]/[0.12]" style={{ background: isDown ? "rgba(239,68,68,0.04)" : "transparent" }}>
                <td className="px-3.5 py-2.5 text-[#d1d5db]">
                  {new Date(entry.checkedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-3.5 py-2.5 text-center">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                    style={{
                      color: isDown ? "#ef4444" : "#10b981",
                      background: isDown ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                    }}
                  >
                    {isDown ? "Hors ligne" : "En ligne"}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-center">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded text-[13px] font-semibold"
                    style={{ color: scoreColor, background: `${scoreColor}15` }}
                  >
                    {entry.score}/100
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-center text-xs font-medium" style={{ color: rtColor }}>
                  {entry.responseTime != null ? `${entry.responseTime}ms` : "\u2014"}
                </td>
                <td className="px-3.5 py-2.5 text-right text-xs font-medium" style={{ color: diff > 0 ? "#10b981" : diff < 0 ? "#ef4444" : "#6b7280" }}>
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
    <div className="max-w-[900px]">
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] flex items-center justify-center">
          <HeartPulseIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">Evolution</h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Suivez l'evolution du score de sante de vos sites
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] rounded-sm mb-7 mt-4 bg-gradient-to-br from-[#ec4899] to-[#f472b6]" />

      {/* Loading */}
      {loading && (
        <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 border-[3px] border-[rgba(236,72,153,0.18)] border-t-[#ec4899] rounded-full animate-[pulse-hist-spin_1s_linear_infinite]" />
          <div className="text-sm text-[#9ca3af]">Chargement...</div>
          <style>{`@keyframes pulse-hist-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* No sites */}
      {!loading && sites.length === 0 && (
        <div className="bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center py-12">
          <HeartPulseIcon size={48} color={ACCENT} />
          <div className="text-base font-semibold text-[#f0f0f3] mt-4 mb-2">
            Aucun site surveille
          </div>
          <div className="text-[13px] text-[#9ca3af]">
            Ajoutez un site depuis l'onglet Moniteur pour voir son evolution ici.
          </div>
        </div>
      )}

      {/* Site selector */}
      {!loading && sites.length > 0 && (
        <>
          <div className="mb-5">
            <div className="flex gap-2 flex-wrap">
              {sites.map(site => (
                <button
                  key={site._id}
                  onClick={() => setSelectedSite(site._id)}
                  className="px-4 py-2 rounded-md text-[13px] font-medium cursor-pointer font-[inherit]"
                  style={{
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
              <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#ec4899] inline-block" />
                  <span className="text-[13px] text-[#9ca3af]">Evolution du score — {currentSite.domain}</span>
                </div>
                <ScoreChart history={currentSite.history || []} width={820} height={180} />
              </div>

              {/* Response time chart */}
              <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#3b82f6] inline-block" />
                  <span className="text-[13px] text-[#9ca3af]">Temps de reponse — {currentSite.domain}</span>
                  {(() => {
                    const pts = (currentSite.history || []).filter(h => h.responseTime != null);
                    if (pts.length === 0) return null;
                    const avg = Math.round(pts.reduce((s, p) => s + p.responseTime, 0) / pts.length);
                    return (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded ml-auto"
                        style={{
                          color: avg < 500 ? "#10b981" : avg < 1500 ? "#f59e0b" : "#ef4444",
                          background: `${avg < 500 ? "#10b981" : avg < 1500 ? "#f59e0b" : "#ef4444"}15`,
                        }}
                      >
                        Moyenne : {avg}ms
                      </span>
                    );
                  })()}
                </div>
                <ResponseTimeChart history={currentSite.history || []} width={820} height={160} />
              </div>

              {/* Two-column: Downtime incidents + SSL/Domain expiry */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Downtime incidents */}
                <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangleIcon size={14} color="#ef4444" />
                    <span className="text-[13px] text-[#9ca3af]">Incidents de downtime</span>
                    {(() => {
                      const count = (currentSite.history || []).filter(h => h.uptimeStatus === false).length;
                      return count > 0 ? (
                        <span className="text-[11px] font-semibold text-[#ef4444] bg-[rgba(239,68,68,0.1)] px-2 py-0.5 rounded ml-auto">
                          {count}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <DowntimeIncidents history={currentSite.history || []} />
                </div>

                {/* SSL / Domain expiry timeline */}
                <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#10b981] inline-block" />
                    <span className="text-[13px] text-[#9ca3af]">Expiration SSL / Domaine</span>
                  </div>
                  <ExpiryTimeline site={currentSite} />
                </div>
              </div>

              {/* History table */}
              <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#ec4899] inline-block" />
                  <span className="text-[13px] text-[#9ca3af]">Historique des analyses</span>
                  <span className="text-[11px] font-semibold text-[#ec4899] bg-[rgba(236,72,153,0.08)] px-2 py-0.5 rounded ml-auto">
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
