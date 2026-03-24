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
const BG_TINT = "rgba(236,72,153,0.06)";
const BORDER_TINT = "rgba(236,72,153,0.18)";

const cardStyle = {
  background: "#1e2029",
  border: "1px solid #2a2d3a",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const ALERT_TYPES = [
  { key: "siteDown", label: "Site hors ligne", desc: "Alerte quand le site ne répond plus" },
  { key: "sslExpiring", label: "SSL expirant", desc: "Alerte quand le certificat SSL expire bientôt" },
  { key: "domainExpiring", label: "Domaine expirant", desc: "Alerte quand le nom de domaine expire bientôt" },
];

export default function PulseAlertsPage() {
  const { get } = useApi();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertConfigs, setAlertConfigs] = useState({});
  const [emailNotif, setEmailNotif] = useState(true);
  const [alertLog, setAlertLog] = useState([]);

  const loadSites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get("/api/pulse/sites");
      setSites(data || []);
      // Initialize alert configs
      const configs = {};
      (data || []).forEach(site => {
        configs[site._id] = {
          siteDown: true,
          sslExpiring: true,
          domainExpiring: true,
        };
      });
      setAlertConfigs(configs);

      // Build mock alert log from site history
      const logs = [];
      (data || []).forEach(site => {
        (site.history || []).forEach(h => {
          if (h.uptimeStatus === false) {
            logs.push({
              type: "siteDown",
              domain: site.domain,
              date: h.checkedAt,
              message: `${site.domain} est hors ligne`,
            });
          }
        });
        const check = site.lastCheck || {};
        if (check.ssl?.daysLeft != null && check.ssl.daysLeft < 30) {
          logs.push({
            type: "sslExpiring",
            domain: site.domain,
            date: new Date().toISOString(),
            message: `SSL de ${site.domain} expire dans ${check.ssl.daysLeft} jours`,
          });
        }
        if (check.domain?.daysUntilExpiry != null && check.domain.daysUntilExpiry < 60) {
          logs.push({
            type: "domainExpiring",
            domain: site.domain,
            date: new Date().toISOString(),
            message: `Domaine ${site.domain} expire dans ${check.domain.daysUntilExpiry} jours`,
          });
        }
      });
      logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAlertLog(logs.slice(0, 20));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { loadSites(); }, [loadSites]);

  const toggleAlert = (siteId, alertKey) => {
    setAlertConfigs(prev => ({
      ...prev,
      [siteId]: {
        ...prev[siteId],
        [alertKey]: !prev[siteId]?.[alertKey],
      },
    }));
  };

  const alertTypeColors = {
    siteDown: "#ef4444",
    sslExpiring: "#f59e0b",
    domainExpiring: "#3b82f6",
  };

  const alertTypeLabels = {
    siteDown: "Hors ligne",
    sslExpiring: "SSL",
    domainExpiring: "Domaine",
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          height: "3px", width: "40px", borderRadius: "2px", marginBottom: "16px",
          background: `linear-gradient(135deg, ${ACCENT}, #f472b6)`,
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          Configuration des alertes
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          Configurez les alertes pour vos sites surveillés.
        </p>
      </div>

      {loading && (
        <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, textAlign: "center", padding: "48px 24px" }}>
          <div style={{
            width: "48px", height: "48px", margin: "0 auto 16px",
            border: `3px solid ${BORDER_TINT}`, borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "pulse-alert-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "14px", color: "#9ca3af" }}>Chargement...</div>
          <style>{`@keyframes pulse-alert-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && sites.length === 0 && (
        <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, background: BG_TINT, textAlign: "center", padding: "48px 24px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px" }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", marginBottom: "8px" }}>
            Aucun site surveillé
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            Ajoutez un site depuis l'onglet Moniteur pour configurer des alertes.
          </div>
        </div>
      )}

      {!loading && sites.length > 0 && (
        <>
          {/* Email notification toggle */}
          <div style={{
            ...cardStyle, border: `1px solid ${BORDER_TINT}`, marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#f0f0f3" }}>
                Notifications par email
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                Recevez les alertes directement dans votre boîte mail.
              </div>
            </div>
            <button
              onClick={() => setEmailNotif(!emailNotif)}
              style={{
                width: "44px", height: "24px", borderRadius: "12px", border: "none",
                background: emailNotif ? ACCENT : "#2a2d3a",
                cursor: "pointer", position: "relative", transition: "background 0.2s",
              }}
            >
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                position: "absolute", top: "3px",
                left: emailNotif ? "23px" : "3px",
                transition: "left 0.2s",
              }} />
            </button>
          </div>

          {/* Per-site alert config */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {sites.map(site => (
              <div key={site._id} style={{
                ...cardStyle, border: `1px solid ${BORDER_TINT}`, padding: "20px",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
                  paddingBottom: "12px", borderBottom: "1px solid #2a2d3a",
                }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: site.lastCheck?.uptimeStatus !== false ? "#10b981" : "#ef4444",
                  }} />
                  <div style={{ fontSize: "15px", fontWeight: 500, color: "#d1d5db" }}>
                    {site.domain}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  {ALERT_TYPES.map(alert => (
                    <div key={alert.key} style={{
                      padding: "14px", background: "#161820", borderRadius: "8px",
                      border: "1px solid #2a2d3a",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#d1d5db" }}>
                          {alert.label}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                          {alert.desc}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAlert(site._id, alert.key)}
                        style={{
                          width: "36px", height: "20px", borderRadius: "10px", border: "none",
                          background: alertConfigs[site._id]?.[alert.key] ? ACCENT : "#2a2d3a",
                          cursor: "pointer", position: "relative", transition: "background 0.2s",
                          flexShrink: 0, marginLeft: "12px",
                        }}
                      >
                        <div style={{
                          width: "14px", height: "14px", borderRadius: "50%", background: "#fff",
                          position: "absolute", top: "3px",
                          left: alertConfigs[site._id]?.[alert.key] ? "19px" : "3px",
                          transition: "left 0.2s",
                        }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Alert history log */}
          <div style={{
            ...cardStyle, border: `1px solid ${BORDER_TINT}`, padding: 0, overflow: "hidden",
          }}>
            <div style={{
              padding: "18px 22px", borderBottom: "1px solid #2a2d3a",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
                Historique des alertes
              </h2>
              <span style={{
                fontSize: "12px", color: ACCENT, fontWeight: 500,
                padding: "3px 10px", background: `${ACCENT}15`, borderRadius: "6px",
              }}>
                {alertLog.length} alerte{alertLog.length > 1 ? "s" : ""}
              </span>
            </div>

            {alertLog.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                  Aucune alerte enregistrée
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                  Les alertes apparaîtront ici lorsqu'un événement sera détecté.
                </div>
              </div>
            ) : (
              <div>
                {alertLog.map((log, idx) => (
                  <div key={idx} style={{
                    padding: "14px 22px",
                    borderBottom: idx < alertLog.length - 1 ? "1px solid #2a2d3a" : "none",
                    display: "flex", alignItems: "center", gap: "12px",
                  }}>
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: alertTypeColors[log.type] || "#9ca3af",
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", color: "#d1d5db" }}>
                        {log.message}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                        {new Date(log.date).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 500, padding: "3px 8px", borderRadius: "4px",
                      background: `${alertTypeColors[log.type] || "#9ca3af"}15`,
                      color: alertTypeColors[log.type] || "#9ca3af",
                    }}>
                      {alertTypeLabels[log.type] || log.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
