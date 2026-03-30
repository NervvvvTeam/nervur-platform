import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";

const BellIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const ExternalLinkIcon = ({ size = 13, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const RefreshIcon = ({ size = 14, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const CATEGORIES = [
  { key: "all", label: "Toutes", color: "#6b7280" },
  { key: "RGPD", label: "RGPD", color: "#06b6d4" },
  { key: "Droit commercial", label: "Droit commercial", color: "#8b5cf6" },
  { key: "E-commerce", label: "E-commerce", color: "#f59e0b" },
  { key: "Droit du travail", label: "Droit du travail", color: "#22c55e" },
  { key: "Fiscalité", label: "Fiscalité", color: "#ef4444" },
];

const IMPACT_CONFIG = {
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  attention: { label: "Attention", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  info: { label: "Info", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)" },
};

export default function VaultVeillePage() {
  const { get } = useApi();
  const [alerts, setAlerts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("vault_veille_read") || "[]")); }
    catch { return new Set(); }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchVeille = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const data = await get("/api/vault/veille");
      setAlerts(data.articles || []);
      setLastUpdated(data.lastUpdated);
      if (data.notice) setNotice(data.notice);
    } catch (err) {
      console.error("Erreur veille:", err);
      setNotice("Impossible de charger la veille juridique.");
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { fetchVeille(); }, [fetchVeille]);

  const toggleRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("vault_veille_read", JSON.stringify([...next]));
      return next;
    });
  };

  const isRead = (id) => readIds.has(id);

  const filteredAlerts = activeCategory === "all"
    ? alerts
    : alerts.filter(a => a.category === activeCategory);

  const unreadCount = alerts.filter(a => !isRead(a.id)).length;

  const getCategoryInfo = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const aRead = isRead(a.id);
    const bRead = isRead(b.id);
    if (aRead !== bRead) return aRead ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="max-w-[1100px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="relative w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <BellIcon size={24} color={ACCENT} />
          {unreadCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center text-[10px] font-bold text-white">
              {unreadCount}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">
            Veille juridique
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Actualités et évolutions juridiques pour votre entreprise
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-4 mt-4" />

      {/* Agent IA branding */}
      <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-lg">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 7.27 19H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
        </svg>
        <span className="text-[12px] text-[#06b6d4] font-medium">
          Alimenté par notre Agent Juridique IA — surveillance continue des sources officielles (CNIL, Legifrance, DILA)
        </span>
      </div>

      {/* Notice banner */}
      {notice && (
        <div className="px-3.5 py-2.5 mb-4 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] rounded-md text-[13px] text-[#fbbf24]">
          {notice}
        </div>
      )}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer font-[inherit] transition-all duration-150 border"
            style={{
              background: activeCategory === cat.key ? `${cat.color}20` : "transparent",
              borderColor: activeCategory === cat.key ? cat.color : "#2a2d3a",
              color: activeCategory === cat.key ? cat.color : "#6b7280",
            }}
          >
            {cat.label}
            {cat.key !== "all" && (
              <span className="ml-1.5 text-[11px] opacity-60">
                {alerts.filter(a => a.category === cat.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts count + last updated */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] text-[#6b7280]">
          {sortedAlerts.length} alerte{sortedAlerts.length !== 1 ? "s" : ""}
          {unreadCount > 0 && activeCategory === "all" && (
            <span className="ml-1.5 text-[#ef4444]">({unreadCount} non lue{unreadCount !== 1 ? "s" : ""})</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-[#52525b]">
              Dernière mise à jour : {new Date(lastUpdated).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={fetchVeille}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer font-[inherit] transition-all duration-150 border border-[#2a2d3a] bg-transparent text-[#6b7280] hover:border-[#06b6d4] hover:text-[#06b6d4]"
          >
            <RefreshIcon size={12} color="currentColor" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && alerts.length === 0 && (
        <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center">
          <div className="w-10 h-10 mx-auto border-[3px] border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[vault-spin_1s_linear_infinite] mb-4" />
          <div className="text-[14px] text-[#9ca3af]">Chargement de la veille juridique...</div>
        </div>
      )}

      {/* Alerts list */}
      {!loading && sortedAlerts.length === 0 ? (
        <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center">
          <BellIcon size={48} color={ACCENT} />
          <div className="text-base font-semibold text-[#f0f0f3] mt-4 mb-2">
            Aucune alerte dans cette catégorie
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedAlerts.map(alert => {
            const catInfo = getCategoryInfo(alert.category);
            const impactInfo = IMPACT_CONFIG[alert.impact] || IMPACT_CONFIG.info;
            const read = isRead(alert.id);

            return (
              <div
                key={alert.id}
                className="bg-[#1e2029] border rounded-[10px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-150"
                style={{
                  borderColor: read ? "rgba(42,45,58,0.8)" : `${impactInfo.color}30`,
                  opacity: read ? 0.7 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Unread indicator */}
                  <div className="mt-1.5 shrink-0">
                    {!read && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: impactInfo.color }} />
                    )}
                    {read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2a2d3a]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] text-[#6b7280]">
                        {new Date(alert.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{
                        color: catInfo.color, background: `${catInfo.color}15`, border: `1px solid ${catInfo.color}30`,
                      }}>
                        {catInfo.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{
                        color: impactInfo.color, background: impactInfo.bg, border: `1px solid ${impactInfo.border}`,
                      }}>
                        {impactInfo.label}
                      </span>
                      {alert.source && (
                        <span className="text-[10px] text-[#52525b] italic">
                          {alert.source}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className={`text-[14px] font-semibold mb-2 ${read ? "text-[#9ca3af]" : "text-[#f0f0f3]"}`}>
                      {alert.title}
                    </div>

                    {/* Summary */}
                    <div className="text-[13px] text-[#9ca3af] leading-relaxed mb-3">
                      {alert.summary}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      {alert.url && (
                        <a
                          href={alert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium no-underline transition-colors duration-150 hover:opacity-80"
                          style={{ color: ACCENT }}
                        >
                          En savoir plus
                          <ExternalLinkIcon size={12} color={ACCENT} />
                        </a>
                      )}
                      <button
                        onClick={() => toggleRead(alert.id)}
                        className="text-[12px] text-[#6b7280] bg-transparent border-none cursor-pointer font-[inherit] hover:text-[#9ca3af] transition-colors duration-150"
                      >
                        {read ? "Marquer comme non lu" : "Marquer comme lu"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
