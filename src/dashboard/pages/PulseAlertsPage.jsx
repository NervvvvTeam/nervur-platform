import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PULSE_NAV = [
  { path: "/app/pulse", label: "Moniteur", end: true },
  { path: "/app/pulse/history", label: "Évolution" },
  { path: "/app/pulse/alerts", label: "Alertes" },
  { path: "/app/pulse/status", label: "Page de statut" },
];

const ACCENT = "#ec4899";
const BORDER_TINT = "rgba(236,72,153,0.18)";

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
    <div className="max-w-[1100px]">
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div className="mb-8">
        <div className="h-[3px] w-10 rounded-sm mb-4 bg-gradient-to-br from-[#ec4899] to-[#f472b6]" />
        <h1 className="text-[22px] font-semibold text-[#0F172A] mb-1.5">
          Configuration des alertes
        </h1>
        <p className="text-sm text-[#9ca3af]">
          Configurez les alertes pour vos sites surveillés.
        </p>
      </div>

      {loading && (
        <div className="bg-[#F8FAFC] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center py-12">
          <div
            className="w-12 h-12 mx-auto mb-4 border-[3px] border-[rgba(236,72,153,0.18)] border-t-[#ec4899] rounded-full animate-[pulse-alert-spin_1s_linear_infinite]"
          />
          <div className="text-sm text-[#9ca3af]">Chargement...</div>
          <style>{`@keyframes pulse-alert-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && sites.length === 0 && (
        <div className="bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center py-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 mx-auto">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className="text-base font-semibold text-[#0F172A] mb-2">
            Aucun site surveillé
          </div>
          <div className="text-[13px] text-[#9ca3af]">
            Ajoutez un site depuis l'onglet Moniteur pour configurer des alertes.
          </div>
        </div>
      )}

      {!loading && sites.length > 0 && (
        <>
          {/* Email notification toggle */}
          <div className="bg-[#F8FAFC] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#0F172A]">
                Notifications par email
              </div>
              <div className="text-xs text-[#9ca3af] mt-0.5">
                Recevez les alertes directement dans votre boîte mail.
              </div>
            </div>
            <button
              onClick={() => setEmailNotif(!emailNotif)}
              className="w-11 h-6 rounded-xl border-none cursor-pointer relative transition-colors duration-200"
              style={{ background: emailNotif ? ACCENT : "#E2E8F0" }}
            >
              <div
                className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-[left] duration-200"
                style={{ left: emailNotif ? "23px" : "3px" }}
              />
            </button>
          </div>

          {/* Per-site alert config */}
          <div className="flex flex-col gap-3 mb-6">
            {sites.map(site => (
              <div key={site._id} className="bg-[#F8FAFC] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E2E8F0]">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: site.lastCheck?.uptimeStatus !== false ? "#10b981" : "#ef4444" }}
                  />
                  <div className="text-[15px] font-medium text-[#d1d5db]">
                    {site.domain}
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
                  {ALERT_TYPES.map(alert => (
                    <div key={alert.key} className="p-3.5 bg-[#161820] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-medium text-[#d1d5db]">
                          {alert.label}
                        </div>
                        <div className="text-[11px] text-[#6b7280] mt-0.5">
                          {alert.desc}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAlert(site._id, alert.key)}
                        className="w-9 h-5 rounded-[10px] border-none cursor-pointer relative transition-colors duration-200 shrink-0 ml-3"
                        style={{ background: alertConfigs[site._id]?.[alert.key] ? ACCENT : "#E2E8F0" }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-[left] duration-200"
                          style={{ left: alertConfigs[site._id]?.[alert.key] ? "19px" : "3px" }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Alert history log */}
          <div className="bg-[#F8FAFC] border border-[rgba(236,72,153,0.18)] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] p-0 overflow-hidden">
            <div className="px-[22px] py-[18px] border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#0F172A] m-0">
                Historique des alertes
              </h2>
              <span className="text-xs text-[#ec4899] font-medium px-2.5 py-[3px] bg-[rgba(236,72,153,0.08)] rounded-md">
                {alertLog.length} alerte{alertLog.length > 1 ? "s" : ""}
              </span>
            </div>

            {alertLog.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="text-sm text-[#9ca3af]">
                  Aucune alerte enregistrée
                </div>
                <div className="text-xs text-[#6b7280] mt-1">
                  Les alertes apparaîtront ici lorsqu'un événement sera détecté.
                </div>
              </div>
            ) : (
              <div>
                {alertLog.map((log, idx) => (
                  <div key={idx} className={`px-[22px] py-3.5 flex items-center gap-3 ${idx < alertLog.length - 1 ? "border-b border-[#E2E8F0]" : ""}`}>
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: alertTypeColors[log.type] || "#64748B" }}
                    />
                    <div className="flex-1">
                      <div className="text-[13px] text-[#d1d5db]">
                        {log.message}
                      </div>
                      <div className="text-[11px] text-[#6b7280] mt-0.5">
                        {new Date(log.date).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-medium px-2 py-[3px] rounded"
                      style={{
                        background: `${alertTypeColors[log.type] || "#64748B"}15`,
                        color: alertTypeColors[log.type] || "#64748B",
                      }}
                    >
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
