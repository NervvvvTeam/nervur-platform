import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import SubNav from "../components/SubNav";

const VAULT_NAV = [
  { path: "/app/vault", label: "Dashboard", end: true },
  { path: "/app/vault/generateur", label: "Générateur" },
  { path: "/app/vault/registre", label: "Registre" },
  { path: "/app/vault/veille", label: "Veille" },
  { path: "/app/vault/historique", label: "Historique" },
];

const ACCENT = "#06b6d4";

const ClockIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const GlobeIcon = ({ size = 16, color = "#6b7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const TrashIcon = ({ size = 14, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getScoreColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getScoreLabel(score) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Correct";
  if (score >= 40) return "Insuffisant";
  return "Critique";
}

export default function VaultHistoriquePage() {
  const { get, del } = useApi();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await get("/api/vault/rgpd-history");
      setHistory(data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette analyse ?")) return;
    try {
      await del(`/api/vault/rgpd-scan/${id}`);
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch {
      // silently fail
    }
  };

  const handleView = (id) => {
    navigate("/app/vault/rgpd", { state: { loadScanId: id } });
  };

  // Group scans by domain for evolution tracking
  const domainGroups = {};
  for (const scan of history) {
    const domain = scan.domain || "inconnu";
    if (!domainGroups[domain]) domainGroups[domain] = [];
    domainGroups[domain].push(scan);
  }

  return (
    <div className="max-w-[860px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <ClockIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">
            Historique des analyses
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Suivez l'évolution de la conformité de vos sites
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-6 mt-4" />

      {/* Loading */}
      {loading && (
        <div className="text-[13px] text-[#6b7280] text-center py-8">Chargement de l'historique...</div>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <div className="bg-[#1e2029] border border-[#2a2d3a] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center">
          <ClockIcon size={40} color="#6b7280" />
          <div className="text-base font-semibold text-[#6b7280] mt-3 mb-1.5">
            Aucune analyse effectuée
          </div>
          <div className="text-[13px] text-[#52525b] leading-relaxed max-w-[400px] mx-auto mb-4">
            Lancez votre première analyse de conformité depuis l'onglet Scan RGPD pour commencer à suivre l'évolution de votre site.
          </div>
          <button
            onClick={() => navigate("/app/vault/rgpd")}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border-none text-sm font-semibold font-[inherit] cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #22d3ee)`, color: "#0f0f11" }}
          >
            Lancer un scan
          </button>
        </div>
      )}

      {/* History by domain */}
      {!loading && Object.keys(domainGroups).length > 0 && (
        <div className="flex flex-col gap-6">
          {Object.entries(domainGroups).map(([domain, scans]) => (
            <div key={domain}>
              <div className="flex items-center gap-2 mb-3">
                <GlobeIcon size={16} color={ACCENT} />
                <h3 className="text-[15px] font-semibold text-[#f0f0f3] m-0">{domain}</h3>
                <span className="text-[11px] text-[#6b7280] bg-[rgba(107,114,128,0.15)] px-2 py-0.5 rounded">
                  {scans.length} analyse{scans.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Score evolution mini chart */}
              {scans.filter(s => s.status === "completed" && s.score != null).length >= 2 && (
                <div className="bg-[rgba(6,182,212,0.04)] border border-[rgba(6,182,212,0.12)] rounded-lg px-5 py-3 mb-3">
                  <div className="text-[11px] text-[#6b7280] mb-2 font-medium">Évolution du score</div>
                  <div className="flex items-end gap-1 h-[40px]">
                    {scans.filter(s => s.status === "completed" && s.score != null).reverse().map((s, i) => {
                      const height = Math.max(4, (s.score / 100) * 36);
                      const color = getScoreColor(s.score);
                      return (
                        <div key={s._id} title={`${s.score}/100 — ${formatDate(s.createdAt)}`}
                          className="flex-1 max-w-[40px] rounded-t-sm transition-all duration-300 cursor-help"
                          style={{ height: `${height}px`, background: color, opacity: 0.8 }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scan list */}
              <div className="flex flex-col gap-2">
                {scans.map(scan => (
                  <div
                    key={scan._id}
                    onClick={() => handleView(scan._id)}
                    className="bg-[#1e2029] rounded-[10px] px-[18px] py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-150 flex items-center justify-between border border-[#2a2d3a] hover:border-[rgba(6,182,212,0.3)] hover:bg-[rgba(6,182,212,0.04)]"
                  >
                    <div className="flex items-center gap-3">
                      <GlobeIcon size={16} color="#6b7280" />
                      <div>
                        <div className="text-[13px] font-semibold text-[#f0f0f3]">
                          {scan.url || scan.domain}
                        </div>
                        <div className="text-[11px] text-[#6b7280] mt-0.5">
                          {formatDate(scan.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {scan.status === "completed" && scan.score != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#6b7280]">
                            {getScoreLabel(scan.score)}
                          </span>
                          <span className="text-sm font-bold" style={{ color: getScoreColor(scan.score) }}>
                            {scan.score}/100
                          </span>
                        </div>
                      )}
                      {scan.status === "error" && (
                        <span className="text-[11px] text-[#ef4444]">Erreur</span>
                      )}
                      {scan.status === "scanning" && (
                        <span className="text-[11px] text-[#eab308]">En cours</span>
                      )}
                      <button
                        onClick={(e) => handleDelete(scan._id, e)}
                        className="p-1.5 rounded-md bg-transparent border-none cursor-pointer transition-all duration-150 hover:bg-[rgba(239,68,68,0.1)]"
                        title="Supprimer"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
