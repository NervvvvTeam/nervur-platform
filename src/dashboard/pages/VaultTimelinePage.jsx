import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";
import { VAULT_NAV } from "./vaultNav";

const DEMO_TIMELINE = [
  {
    _id: "t1",
    action: "rgpd_scan",
    title: "Scan RGPD — monsite.fr",
    description: "Score de conformité : 68/100. 3 points d'amélioration détectés.",
    icon: "scan",
    color: "#06b6d4",
    metadata: { domain: "monsite.fr", score: 68 },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "t2",
    action: "document_generated",
    title: "Politique de confidentialité générée",
    description: "Document généré automatiquement pour monsite.fr — conforme RGPD Art. 13-14.",
    icon: "doc",
    color: "#8b5cf6",
    metadata: { documentType: "Politique de confidentialité" },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "t3",
    action: "ssl_checked",
    title: "Vérification SSL — monsite.fr",
    description: "Certificat valide. Expire dans 12 jours — renouvellement recommandé.",
    icon: "shield",
    color: "#f59e0b",
    metadata: { domain: "monsite.fr", daysUntilExpiry: 12 },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "t4",
    action: "document_generated",
    title: "Mentions légales générées",
    description: "Document juridique complet généré pour monsite.fr.",
    icon: "doc",
    color: "#8b5cf6",
    metadata: { documentType: "Mentions légales" },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "t5",
    action: "monitoring_enabled",
    title: "Surveillance activée — monsite.fr",
    description: "Monitoring automatique SSL + RGPD activé. Fréquence : hebdomadaire.",
    icon: "shield",
    color: "#22c55e",
    metadata: { domain: "monsite.fr", frequency: "weekly" },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "t6",
    action: "alert_resolved",
    title: "Alerte traitée : CGV manquantes",
    description: "Les conditions générales ont été ajoutées au site monsite.fr.",
    icon: "check",
    color: "#22c55e",
    metadata: {},
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "t7",
    action: "rgpd_scan",
    title: "Premier scan RGPD — monsite.fr",
    description: "Score initial : 42/100. Plan d'action recommandé.",
    icon: "scan",
    color: "#ef4444",
    metadata: { domain: "monsite.fr", score: 42 },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "t8",
    action: "compliance_milestone",
    title: "Compte Vault créé",
    description: "Bienvenue ! Votre espace de conformité juridique est prêt.",
    icon: "milestone",
    color: "#6366f1",
    metadata: {},
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ACCENT = "#06b6d4";
const BG = "#0f1117";
const CARD_BG = "#1e2029";
const CARD_BORDER = "rgba(255,255,255,0.06)";

const ICON_MAP = {
  scan: { d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: ACCENT },
  doc: { d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", extra: "M14 2v6h6", color: "#8b5cf6" },
  shield: { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", color: "#22c55e" },
  check: { d: "M22 11.08V12a10 10 0 11-5.93-9.14", extra: "M22 4L12 14.01l-3-3.01", color: "#22c55e" },
  alert: { d: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9", extra: "M13.73 21a2 2 0 01-3.46 0", color: "#f59e0b" },
  milestone: { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", extra: "M4 22V15", color: "#ef4444" },
};

const TimelineIcon = ({ type = "check", size = 18 }) => {
  const icon = ICON_MAP[type] || ICON_MAP.check;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={icon.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icon.d} />
      {icon.extra && <path d={icon.extra} />}
    </svg>
  );
};

const ClockIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const InfoIcon = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
    <div style={{ width: 32, height: 32, border: `2px solid rgba(6,182,212,0.15)`, borderTop: `2px solid ${ACCENT}`, borderRadius: "50%", animation: "vaultTlSpin 0.8s linear infinite" }} />
    <style>{`@keyframes vaultTlSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const MONTHS_FR = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

function formatRelative(d) {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 3600000) return `il y a ${Math.max(1, Math.floor(diff / 60000))} min`;
  if (diff < 86400000) return `il y a ${Math.floor(diff / 3600000)} heures`;
  if (diff < 172800000) return "hier";
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()].toLowerCase()} ${date.getFullYear()} a ${h}h${m}`;
}

function groupByMonth(events) {
  const groups = [];
  let currentKey = "";
  for (const ev of events) {
    const d = new Date(ev.createdAt);
    const key = `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
    if (key !== currentKey) {
      currentKey = key;
      groups.push({ month: key, events: [] });
    }
    groups[groups.length - 1].events.push(ev);
  }
  return groups;
}

export default function VaultTimelinePage() {
  const { get } = useApi();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchEvents = useCallback(async (p = 1) => {
    try {
      const data = await get(`/api/vault/timeline?page=${p}&limit=30`);
      if (p === 1) {
        setEvents(data.events || []);
      } else {
        setEvents((prev) => [...prev, ...(data.events || [])]);
      }
      setTotalPages(data.pages || 1);
      setPage(p);
    } catch {
      if (p === 1) {
        setEvents(DEMO_TIMELINE);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [get]);

  useEffect(() => { fetchEvents(1); }, [fetchEvents]);

  const loadMore = () => {
    if (page < totalPages) {
      setLoadingMore(true);
      fetchEvents(page + 1);
    }
  };

  const groups = groupByMonth(events);

  return (
    <div className="max-w-[1100px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Gradient bar */}
      <div style={{ width: 40, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${ACCENT}, #22d3ee)`, marginBottom: 16 }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{ background: `rgba(6,182,212,0.1)`, borderRadius: 12, padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ClockIcon size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>Timeline de conformite</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0 0" }}>Historique complet de vos actions RGPD -- preuve d'accountability</p>
        </div>
      </div>

      {/* Accountability banner */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(6,182,212,0.05)", border: `1px solid rgba(6,182,212,0.15)`,
        borderRadius: 10, padding: "12px 16px", margin: "18px 0 22px", fontSize: 12, color: "#94a3b8", lineHeight: 1.5,
      }}>
        <InfoIcon size={16} color={ACCENT} />
        <span>Cette timeline constitue votre preuve d'accountability RGPD (Article 5.2). Conservez-la precieusement.</span>
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: CARD_BG, borderRadius: 12, border: `1px solid ${CARD_BORDER}` }}>
          <div style={{ background: "rgba(6,182,212,0.08)", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ClockIcon size={24} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>Votre timeline est vide</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Lancez un premier scan pour commencer</div>
        </div>
      ) : (
        <div>
          {groups.map((group, gi) => (
            <div key={group.month}>
              {/* Month marker */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: gi === 0 ? "0 0 16px" : "28px 0 16px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.01em" }}>{group.month}</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              </div>

              {/* Timeline entries */}
              <div style={{ position: "relative", paddingLeft: 36 }}>
                {/* Vertical line */}
                <div style={{
                  position: "absolute", left: 11, top: 0, bottom: 0, width: 2, borderRadius: 1,
                  background: `linear-gradient(180deg, ${ACCENT}40 0%, ${ACCENT}10 70%, transparent 100%)`,
                }} />

                {group.events.map((ev, ei) => {
                  const iconType = ev.icon || "check";
                  const dotColor = (ICON_MAP[iconType] || ICON_MAP.check).color;
                  return (
                    <div key={ev._id} style={{ position: "relative", marginBottom: ei === group.events.length - 1 ? 0 : 14 }}>
                      {/* Dot */}
                      <div style={{
                        position: "absolute", left: -36 + 4, top: 14, width: 16, height: 16, borderRadius: "50%",
                        background: BG, border: `2px solid ${dotColor}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor }} />
                      </div>

                      {/* Card */}
                      <div style={{
                        background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: "14px 16px",
                        transition: "border-color 0.2s ease",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <TimelineIcon type={iconType} size={16} />
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#e2e8f0" }}>{ev.title}</span>
                        </div>
                        {ev.description && (
                          <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5, marginBottom: 8 }}>{ev.description}</div>
                        )}

                        {/* Metadata badges + timestamp */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {ev.metadata && Object.entries(ev.metadata).map(([k, v]) => (
                            <span key={k} style={{
                              fontSize: 10, fontWeight: 600, color: ACCENT, background: "rgba(6,182,212,0.08)",
                              border: `1px solid rgba(6,182,212,0.2)`, borderRadius: 6, padding: "2px 8px", textTransform: "capitalize",
                            }}>
                              {k}: {v}
                            </span>
                          ))}
                          <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }}>
                            {formatRelative(ev.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load more */}
          {page < totalPages && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  fontSize: 13, fontWeight: 600, color: ACCENT, background: "rgba(6,182,212,0.08)",
                  border: `1px solid rgba(6,182,212,0.2)`, borderRadius: 10, padding: "10px 28px",
                  cursor: loadingMore ? "default" : "pointer", opacity: loadingMore ? 0.6 : 1, transition: "opacity 0.15s ease",
                }}
              >
                {loadingMore ? "Chargement..." : "Charger plus"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
