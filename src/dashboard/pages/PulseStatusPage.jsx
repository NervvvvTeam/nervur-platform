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
const BG_TINT = "rgba(236,72,153,0.06)";
const BORDER_TINT = "rgba(236,72,153,0.18)";

export default function PulseStatusPage() {
  const { get } = useApi();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusEnabled, setStatusEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadSites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get("/api/pulse/sites");
      setSites(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { loadSites(); }, [loadSites]);

  const embedCode = `<iframe
  src="${window.location.origin}/status-embed"
  width="100%"
  height="400"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #2a2d3a;"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-[900px]">
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div className="mb-8">
        <div className="h-[3px] w-10 rounded-sm mb-4 bg-gradient-to-br from-[#ec4899] to-[#f472b6]" />
        <h1 className="text-[22px] font-semibold text-[#f0f0f3] mb-1.5">
          Page de statut publique
        </h1>
        <p className="text-sm text-[#9ca3af]">
          Générez une page de statut publique pour vos clients.
        </p>
      </div>

      {loading && (
        <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center py-12">
          <div
            className="w-12 h-12 mx-auto mb-4 border-[3px] border-[rgba(236,72,153,0.18)] border-t-[#ec4899] rounded-full animate-[pulse-status-spin_1s_linear_infinite]"
          />
          <div className="text-sm text-[#9ca3af]">Chargement...</div>
          <style>{`@keyframes pulse-status-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && sites.length === 0 && (
        <div className="bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center py-12">
          <div className="text-base font-semibold text-[#f0f0f3] mb-2">
            Aucun site surveillé
          </div>
          <div className="text-[13px] text-[#9ca3af]">
            Ajoutez un site depuis l'onglet Moniteur pour créer une page de statut.
          </div>
        </div>
      )}

      {!loading && sites.length > 0 && (
        <>
          {/* Toggle activation */}
          <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#f0f0f3]">
                Activer la page de statut publique
              </div>
              <div className="text-xs text-[#9ca3af] mt-0.5">
                Permet à vos clients de consulter le statut de vos services en temps réel.
              </div>
            </div>
            <button
              onClick={() => setStatusEnabled(!statusEnabled)}
              className="w-11 h-6 rounded-xl border-none cursor-pointer relative transition-colors duration-200"
              style={{ background: statusEnabled ? ACCENT : "#2a2d3a" }}
            >
              <div
                className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-[left] duration-200"
                style={{ left: statusEnabled ? "23px" : "3px" }}
              />
            </button>
          </div>

          {/* Preview */}
          <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
                Aperçu de la page de statut
              </h2>
              <span
                className="text-[11px] font-medium px-2.5 py-[3px] rounded"
                style={{
                  background: statusEnabled ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.12)",
                  color: statusEnabled ? "#10b981" : "#6b7280",
                }}
              >
                {statusEnabled ? "Activée" : "Désactivée"}
              </span>
            </div>

            {/* Mock status page */}
            <div
              className="bg-[#161820] rounded-xl border border-[#2a2d3a] p-7 transition-opacity duration-300"
              style={{ opacity: statusEnabled ? 1 : 0.5 }}
            >
              {/* Status page header */}
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-[10px] mx-auto mb-3 bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/>
                    <path d="M12 6v4l2 2-2 2v4"/>
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#f0f0f3] m-0 mb-1">
                  Statut des services
                </h3>
                <div className="text-xs text-[#9ca3af]">
                  Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Overall status */}
              {(() => {
                const allUp = sites.every(s => s.lastCheck?.uptimeStatus !== false);
                return (
                  <div
                    className="py-3.5 px-5 rounded-lg mb-5 text-center border"
                    style={{
                      background: allUp ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                      borderColor: allUp ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: allUp ? "#10b981" : "#ef4444" }}
                    >
                      {allUp ? "Tous les systèmes sont opérationnels" : "Certains systèmes rencontrent des problèmes"}
                    </span>
                  </div>
                );
              })()}

              {/* Service list */}
              <div className="flex flex-col gap-2">
                {sites.map(site => {
                  const isUp = site.lastCheck?.uptimeStatus !== false;
                  const score = site.lastCheck?.score || 0;
                  return (
                    <div key={site._id} className="flex items-center justify-between py-3.5 px-[18px] bg-[#1e2029] rounded-lg border border-[#2a2d3a]">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: isUp ? "#10b981" : "#ef4444" }}
                        />
                        <span className="text-[13px] text-[#d1d5db] font-medium">
                          {site.domain}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-medium"
                          style={{ color: isUp ? "#10b981" : "#ef4444" }}
                        >
                          {isUp ? "Opérationnel" : "Hors ligne"}
                        </span>
                        <span
                          className="text-[11px] px-2 py-0.5 rounded font-semibold"
                          style={{
                            background: (score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444") + "15",
                            color: score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {score}/100
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Uptime bar (last 30 days mock) */}
              <div className="mt-5">
                <div className="text-xs text-[#9ca3af] mb-2">
                  Disponibilité (30 derniers jours)
                </div>
                <div className="flex gap-0.5 h-6">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const isGreen = Math.random() > 0.05;
                    return (
                      <div key={i} className="flex-1 rounded-sm" style={{
                        background: isGreen ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.5)",
                      }} />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-[#6b7280] mt-1">
                  <span>30 jours</span>
                  <span>Aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>

          {/* Embed code */}
          <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            <h2 className="text-[15px] font-semibold text-[#f0f0f3] mb-2">
              Code d'intégration
            </h2>
            <p className="text-xs text-[#9ca3af] mb-4">
              Copiez ce code et intégrez-le dans le site de votre client pour afficher le statut en temps réel.
            </p>

            <div className="relative">
              <pre className="p-4 bg-[#161820] rounded-lg border border-[#2a2d3a] text-[#a78bfa] text-xs overflow-auto leading-relaxed m-0">
                {embedCode}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-3 py-1.5 text-white border-none rounded-md text-[11px] font-medium cursor-pointer font-[inherit] transition-colors duration-200"
                style={{ background: copied ? "#10b981" : ACCENT }}
              >
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
