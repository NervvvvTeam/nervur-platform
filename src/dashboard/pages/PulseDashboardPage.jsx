import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PULSE_NAV = [
  { path: "/app/pulse", label: "Moniteur", end: true },
  { path: "/app/pulse/history", label: "\u00c9volution" },
];

const ACCENT = "#ec4899";
const ACCENT_LIGHT = "#f472b6";
const BG_TINT = "rgba(236,72,153,0.06)";
const BORDER_TINT = "rgba(236,72,153,0.18)";

const cardStyle = {
  background: "#1e2029",
  border: "1px solid #2a2d3a",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const HeartPulseIcon = ({ size = 22, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
    <path d="M12 6v4l2 2-2 2v4" />
  </svg>
);

const TrashIcon = ({ size = 16, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const RefreshIcon = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

function ScoreGauge({ score, size = 100 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2a2d3a" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={scoreColor}
          strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: size > 80 ? "24px" : "18px", fontWeight: 700, color: scoreColor }}>{score}</span>
        <span style={{ fontSize: "10px", color: "#6b7280" }}>/100</span>
      </div>
    </div>
  );
}

function StatusBadge({ ok, labelOk, labelFail }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 500,
      color: ok ? "#10b981" : "#ef4444",
      background: ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
      border: `1px solid ${ok ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
    }}>
      {ok ? "\u2705" : "\u274C"} {ok ? labelOk : labelFail}
    </span>
  );
}

function SiteCard({ site, onRecheck, onDelete, recheckingId }) {
  const [expanded, setExpanded] = useState(false);
  const check = site.lastCheck || {};
  const score = check.score ?? 0;
  const isRechecking = recheckingId === site._id;

  return (
    <div style={{
      ...cardStyle,
      border: `1px solid ${BORDER_TINT}`,
      background: BG_TINT,
      marginBottom: "12px",
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ScoreGauge score={score} size={64} />
          <div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3" }}>{site.domain}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
              {check.checkedAt
                ? `Dernier check : ${new Date(check.checkedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                : "Aucune analyse"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={e => { e.stopPropagation(); onRecheck(site._id); }}
            disabled={isRechecking}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "6px",
              background: "transparent", border: `1px solid ${BORDER_TINT}`,
              color: ACCENT, fontSize: "12px", fontWeight: 500,
              cursor: isRechecking ? "wait" : "pointer", fontFamily: "inherit",
              opacity: isRechecking ? 0.5 : 1,
            }}
          >
            <RefreshIcon size={14} />
            {isRechecking ? "Analyse..." : "Revérifier"}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(site._id); }}
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "7px 10px", borderRadius: "6px",
              background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
              cursor: "pointer",
            }}
          >
            <TrashIcon size={14} />
          </button>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${BORDER_TINT}` }}>
          {/* Score */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px", fontWeight: 500 }}>Score de sante</div>
            <ScoreGauge score={score} size={110} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* Uptime */}
            <div style={{
              padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${check.uptime?.status ? "#10b981" : "#ef4444"}`,
            }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Uptime</div>
              <StatusBadge ok={check.uptime?.status} labelOk="En ligne" labelFail="Hors ligne" />
              {check.uptime?.responseTime && (
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                  Temps de reponse : <span style={{ color: "#d1d5db", fontWeight: 500 }}>{check.uptime.responseTime}ms</span>
                </div>
              )}
              {check.uptime?.statusCode && (
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                  Code HTTP : <span style={{ color: "#d1d5db" }}>{check.uptime.statusCode}</span>
                </div>
              )}
            </div>

            {/* SSL */}
            <div style={{
              padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${check.ssl?.valid ? "#10b981" : "#ef4444"}`,
            }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Certificat SSL</div>
              <StatusBadge ok={check.ssl?.valid} labelOk="Valide" labelFail="Invalide" />
              {check.ssl?.valid && (
                <>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                    Expire dans : <span style={{ color: check.ssl.daysLeft > 30 ? "#10b981" : "#f59e0b", fontWeight: 500 }}>{check.ssl.daysLeft} jours</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    Emetteur : <span style={{ color: "#d1d5db" }}>{check.ssl.issuer}</span>
                  </div>
                </>
              )}
              {check.ssl?.error && (
                <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "6px" }}>{check.ssl.error}</div>
              )}
            </div>

            {/* Domain */}
            <div style={{
              padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${check.domain?.daysUntilExpiry > 30 ? "#10b981" : "#f59e0b"}`,
            }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Domaine</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Expire dans : <span style={{ color: check.domain?.daysUntilExpiry > 60 ? "#10b981" : "#f59e0b", fontWeight: 500 }}>
                  {check.domain?.daysUntilExpiry || "?"} jours
                </span>
              </div>
            </div>

            {/* DNS */}
            <div style={{
              padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${check.dns?.aRecords ? "#10b981" : "#ef4444"}`,
            }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>DNS</div>
              {check.dns?.aRecords ? (
                <>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                    Enregistrements A : <span style={{ color: "#d1d5db" }}>{check.dns.aRecords.length}</span>
                  </div>
                  {check.dns.mxRecords?.length > 0 && (
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                      MX : <span style={{ color: "#d1d5db" }}>{check.dns.mxRecords.join(", ")}</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: "12px", color: "#ef4444" }}>{check.dns?.error || "Erreur DNS"}</div>
              )}
            </div>
          </div>

          {/* Email deliverability (SPF + DMARC) */}
          <div style={{
            marginTop: "12px", padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
            borderRadius: "8px", borderLeft: `3px solid ${ACCENT}`,
          }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px", fontWeight: 500 }}>Delivrabilite email</div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <StatusBadge ok={check.dns?.spf} labelOk="SPF configure" labelFail="SPF absent" />
              <StatusBadge ok={check.dns?.dmarc} labelOk="DMARC configure" labelFail="DMARC absent" />
            </div>
            {(!check.dns?.spf || !check.dns?.dmarc) && (
              <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "8px", lineHeight: 1.5 }}>
                {!check.dns?.spf && !check.dns?.dmarc
                  ? "Ni SPF ni DMARC ne sont configures. Vos emails risquent d'atterrir en spam."
                  : !check.dns?.spf
                    ? "SPF n'est pas configure. Ajoutez un enregistrement SPF pour ameliorer la delivrabilite."
                    : "DMARC n'est pas configure. Ajoutez un enregistrement DMARC pour proteger votre domaine."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PulseDashboardPage() {
  const { get, post, del } = useApi();
  const [sites, setSites] = useState([]);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [recheckingId, setRecheckingId] = useState(null);
  const [error, setError] = useState("");

  const loadSites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get("/api/pulse/sites");
      setSites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { loadSites(); }, [loadSites]);

  const addSite = async () => {
    if (!domain.trim()) return;
    setAdding(true);
    setError("");
    try {
      const site = await post("/api/pulse/sites", { domain: domain.trim() });
      setSites(prev => [site, ...prev]);
      setDomain("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const recheckSite = async (id) => {
    setRecheckingId(id);
    try {
      const updated = await post(`/api/pulse/sites/${id}/check`);
      setSites(prev => prev.map(s => s._id === id ? updated : s));
    } catch (err) {
      setError(err.message);
    } finally {
      setRecheckingId(null);
    }
  };

  const deleteSite = async (id) => {
    try {
      await del(`/api/pulse/sites/${id}`);
      setSites(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: BG_TINT, border: `1px solid ${BORDER_TINT}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <HeartPulseIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>Pulse</h1>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, marginTop: "2px" }}>
            Surveillance de la sante numerique de vos sites
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div style={{
        height: "3px", borderRadius: "2px", marginBottom: "28px", marginTop: "16px",
        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
      }} />

      {/* Add site form */}
      <div style={{
        ...cardStyle,
        border: `1px solid ${BORDER_TINT}`,
        marginBottom: "28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <HeartPulseIcon size={18} color={ACCENT} />
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
            Ajouter un site
          </h2>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="exemple.com"
            onKeyDown={e => e.key === "Enter" && !adding && addSite()}
            style={{
              flex: 1, padding: "12px 16px", background: "#141520",
              border: "1px solid #2a2d3a", borderRadius: "8px",
              color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${BORDER_TINT}`; }}
            onBlur={e => { e.target.style.borderColor = "#2a2d3a"; e.target.style.boxShadow = "none"; }}
          />
          <button
            onClick={addSite}
            disabled={adding || !domain.trim()}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 28px", borderRadius: "8px",
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`, border: "none",
              color: "#fff", fontSize: "14px", fontWeight: 600,
              cursor: adding ? "wait" : "pointer", fontFamily: "inherit",
              opacity: adding || !domain.trim() ? 0.5 : 1,
              boxShadow: `0 4px 16px rgba(236,72,153,0.25)`,
              whiteSpace: "nowrap",
            }}
          >
            <HeartPulseIcon size={16} color="#fff" />
            {adding ? "Analyse..." : "Analyser"}
          </button>
        </div>
        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "8px" }}>
          Entrez un nom de domaine sans https:// ni www. Le premier scan sera lance automatiquement.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px", marginBottom: "16px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: "8px", fontSize: "13px", color: "#f87171",
        }}>
          {error}
          <button onClick={() => setError("")} style={{
            float: "right", background: "none", border: "none", color: "#f87171",
            cursor: "pointer", fontSize: "16px", lineHeight: 1,
          }}>&times;</button>
        </div>
      )}

      {/* Loading */}
      {loading && sites.length === 0 && (
        <div style={{
          ...cardStyle, border: `1px solid ${BORDER_TINT}`, background: BG_TINT,
          textAlign: "center", padding: "48px 24px",
        }}>
          <div style={{
            width: "48px", height: "48px", margin: "0 auto 16px",
            border: `3px solid ${BORDER_TINT}`, borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "pulse-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "14px", color: "#9ca3af" }}>Chargement de vos sites...</div>
          <style>{`@keyframes pulse-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Sites list */}
      {!loading && sites.length === 0 && (
        <div style={{
          ...cardStyle, border: `1px solid ${BORDER_TINT}`, background: BG_TINT,
          textAlign: "center", padding: "48px 24px",
        }}>
          <HeartPulseIcon size={48} color={ACCENT} />
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", marginTop: "16px", marginBottom: "8px" }}>
            Aucun site surveille
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto" }}>
            Ajoutez votre premier domaine ci-dessus pour lancer une analyse de sante complete : uptime, SSL, DNS, et plus.
          </div>
        </div>
      )}

      {sites.map(site => (
        <SiteCard
          key={site._id}
          site={site}
          onRecheck={recheckSite}
          onDelete={deleteSite}
          recheckingId={recheckingId}
        />
      ))}
    </div>
  );
}
