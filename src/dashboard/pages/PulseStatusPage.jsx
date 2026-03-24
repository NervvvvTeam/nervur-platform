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
    <div style={{ maxWidth: "900px" }}>
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          height: "3px", width: "40px", borderRadius: "2px", marginBottom: "16px",
          background: `linear-gradient(135deg, ${ACCENT}, #f472b6)`,
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          Page de statut publique
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          Générez une page de statut publique pour vos clients.
        </p>
      </div>

      {loading && (
        <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, textAlign: "center", padding: "48px 24px" }}>
          <div style={{
            width: "48px", height: "48px", margin: "0 auto 16px",
            border: `3px solid ${BORDER_TINT}`, borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "pulse-status-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "14px", color: "#9ca3af" }}>Chargement...</div>
          <style>{`@keyframes pulse-status-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && sites.length === 0 && (
        <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, background: BG_TINT, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", marginBottom: "8px" }}>
            Aucun site surveillé
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            Ajoutez un site depuis l'onglet Moniteur pour créer une page de statut.
          </div>
        </div>
      )}

      {!loading && sites.length > 0 && (
        <>
          {/* Toggle activation */}
          <div style={{
            ...cardStyle, border: `1px solid ${BORDER_TINT}`, marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#f0f0f3" }}>
                Activer la page de statut publique
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                Permet à vos clients de consulter le statut de vos services en temps réel.
              </div>
            </div>
            <button
              onClick={() => setStatusEnabled(!statusEnabled)}
              style={{
                width: "44px", height: "24px", borderRadius: "12px", border: "none",
                background: statusEnabled ? ACCENT : "#2a2d3a",
                cursor: "pointer", position: "relative", transition: "background 0.2s",
              }}
            >
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                position: "absolute", top: "3px",
                left: statusEnabled ? "23px" : "3px",
                transition: "left 0.2s",
              }} />
            </button>
          </div>

          {/* Preview */}
          <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, marginBottom: "20px" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "20px",
            }}>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
                Aperçu de la page de statut
              </h2>
              <span style={{
                fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "4px",
                background: statusEnabled ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.12)",
                color: statusEnabled ? "#10b981" : "#6b7280",
              }}>
                {statusEnabled ? "Activée" : "Désactivée"}
              </span>
            </div>

            {/* Mock status page */}
            <div style={{
              background: "#161820", borderRadius: "12px", border: "1px solid #2a2d3a",
              padding: "28px", opacity: statusEnabled ? 1 : 0.5,
              transition: "opacity 0.3s",
            }}>
              {/* Status page header */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px", margin: "0 auto 12px",
                  background: BG_TINT, border: `1px solid ${BORDER_TINT}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/>
                    <path d="M12 6v4l2 2-2 2v4"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: "0 0 4px" }}>
                  Statut des services
                </h3>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>
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
                  <div style={{
                    padding: "14px 20px", borderRadius: "8px", marginBottom: "20px",
                    background: allUp ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${allUp ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                    textAlign: "center",
                  }}>
                    <span style={{
                      fontSize: "14px", fontWeight: 600,
                      color: allUp ? "#10b981" : "#ef4444",
                    }}>
                      {allUp ? "Tous les systèmes sont opérationnels" : "Certains systèmes rencontrent des problèmes"}
                    </span>
                  </div>
                );
              })()}

              {/* Service list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {sites.map(site => {
                  const isUp = site.lastCheck?.uptimeStatus !== false;
                  const score = site.lastCheck?.score || 0;
                  return (
                    <div key={site._id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 18px", background: "#1e2029", borderRadius: "8px",
                      border: "1px solid #2a2d3a",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: isUp ? "#10b981" : "#ef4444",
                        }} />
                        <span style={{ fontSize: "13px", color: "#d1d5db", fontWeight: 500 }}>
                          {site.domain}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{
                          fontSize: "12px", color: isUp ? "#10b981" : "#ef4444",
                          fontWeight: 500,
                        }}>
                          {isUp ? "Opérationnel" : "Hors ligne"}
                        </span>
                        <span style={{
                          fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                          background: (score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444") + "15",
                          color: score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444",
                          fontWeight: 600,
                        }}>
                          {score}/100
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Uptime bar (last 30 days mock) */}
              <div style={{ marginTop: "20px" }}>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
                  Disponibilité (30 derniers jours)
                </div>
                <div style={{ display: "flex", gap: "2px", height: "24px" }}>
                  {Array.from({ length: 30 }).map((_, i) => {
                    const isGreen = Math.random() > 0.05;
                    return (
                      <div key={i} style={{
                        flex: 1, borderRadius: "2px",
                        background: isGreen ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.5)",
                      }} />
                    );
                  })}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "10px", color: "#6b7280", marginTop: "4px",
                }}>
                  <span>30 jours</span>
                  <span>Aujourd'hui</span>
                </div>
              </div>
            </div>
          </div>

          {/* Embed code */}
          <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}` }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", marginBottom: "8px" }}>
              Code d'intégration
            </h2>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "16px" }}>
              Copiez ce code et intégrez-le dans le site de votre client pour afficher le statut en temps réel.
            </p>

            <div style={{ position: "relative" }}>
              <pre style={{
                padding: "16px", background: "#161820", borderRadius: "8px",
                border: "1px solid #2a2d3a", color: "#a78bfa", fontSize: "12px",
                overflow: "auto", lineHeight: 1.6, margin: 0,
              }}>
                {embedCode}
              </pre>
              <button
                onClick={handleCopy}
                style={{
                  position: "absolute", top: "8px", right: "8px",
                  padding: "6px 12px", background: copied ? "#10b981" : ACCENT,
                  color: "#fff", border: "none", borderRadius: "6px",
                  fontSize: "11px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "inherit", transition: "background 0.2s",
                }}
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
