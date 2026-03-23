import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const VAULT_NAV = [
  { path: "/app/vault", label: "Scanner", end: true },
  { path: "/app/vault/monitoring", label: "Surveillance" },
  { path: "/app/vault/history", label: "Historique" },
  { path: "/app/vault/rgpd", label: "Conformit\u00e9 RGPD" },
];

const ACCENT = "#06b6d4";
const BG_TINT = "rgba(6,182,212,0.08)";
const BORDER_TINT = "rgba(6,182,212,0.2)";

const cardStyle = {
  background: "#1e2029",
  border: "1px solid #2a2d3a",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "#141520",
  border: "1px solid #2a2d3a",
  borderRadius: "8px",
  color: "#e4e4e7",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const ShieldIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const CheckCircle = ({ size = 18, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const XCircle = ({ size = 18, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const GlobeIcon = ({ size = 20, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const ClockIcon = ({ size = 14, color = "#9ca3af" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const COMPLIANCE_LABELS = {
  mentionsLegales: { label: "Mentions l\u00e9gales", icon: "doc", description: "Obligation l\u00e9gale pour tout site professionnel (LCEN)" },
  politiqueConfidentialite: { label: "Politique de confidentialit\u00e9", icon: "lock", description: "Obligatoire selon les articles 13-14 du RGPD" },
  cookieBanner: { label: "Banni\u00e8re cookies", icon: "cookie", description: "Consentement requis avant d\u00e9p\u00f4t de cookies (CNIL)" },
  cgv: { label: "CGV / CGU", icon: "file", description: "Conditions g\u00e9n\u00e9rales de vente ou d'utilisation" },
  contactInfo: { label: "Informations de contact", icon: "phone", description: "Coordonn\u00e9es obligatoires dans les mentions l\u00e9gales" },
  ssl: { label: "Certificat SSL (HTTPS)", icon: "shield", description: "Chiffrement des donn\u00e9es en transit" },
  thirdPartyTrackers: { label: "Trackers tiers", icon: "eye", description: "D\u00e9tection de scripts de suivi tiers" },
  formConsent: { label: "Consentement formulaires", icon: "check", description: "Cases de consentement dans les formulaires" },
};

function ScoreGauge({ score }) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "#ef4444";
  let label = "Critique";
  if (score >= 80) { color = "#22c55e"; label = "Excellent"; }
  else if (score >= 60) { color = "#eab308"; label = "Correct"; }
  else if (score >= 40) { color = "#f97316"; label = "Insuffisant"; }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg height={radius * 2} width={radius * 2} style={{ transform: "rotate(-90deg)" }}>
        <circle
          stroke="#2a2d3a"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div style={{
        position: "relative",
        marginTop: "-110px",
        textAlign: "center",
        marginBottom: "40px",
      }}>
        <div style={{ fontSize: "36px", fontWeight: 700, color }}>{score}</div>
        <div style={{ fontSize: "12px", color: "#9ca3af" }}>/100</div>
      </div>
      <div style={{
        display: "inline-flex",
        padding: "4px 14px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 600,
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}>
        {label}
      </div>
    </div>
  );
}

function ComplianceCard({ keyName, result }) {
  const info = COMPLIANCE_LABELS[keyName];
  if (!info || !result) return null;

  const isPass = keyName === "thirdPartyTrackers" ? !result.found : result.found;
  const borderColor = isPass ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)";
  const bgColor = isPass ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)";

  return (
    <div style={{
      ...cardStyle,
      border: `1px solid ${borderColor}`,
      background: bgColor,
      padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flexShrink: 0, marginTop: "2px" }}>
          {isPass ? <CheckCircle size={20} /> : <XCircle size={20} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#f0f0f3" }}>
              {info.label}
            </span>
            <span style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "4px",
              color: isPass ? "#22c55e" : "#ef4444",
              background: isPass ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            }}>
              {isPass ? "Conforme" : "Non conforme"}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px" }}>
            {info.description}
          </div>
          <div style={{ fontSize: "12px", color: "#d1d5db", lineHeight: 1.6 }}>
            {result.details}
          </div>
          {keyName === "thirdPartyTrackers" && result.trackers && result.trackers.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
              {result.trackers.map((t, i) => (
                <span key={i} style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#f97316",
                  background: "rgba(249,115,22,0.12)",
                  border: "1px solid rgba(249,115,22,0.25)",
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getScoreColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export default function VaultRgpdPage() {
  const { get, post } = useApi();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scan, setScan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await get("/api/vault/rgpd-history");
      setHistory(data);
    } catch {
      // silently fail
    } finally {
      setLoadingHistory(false);
    }
  }, [get]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleScan = useCallback(async () => {
    if (!url.trim()) {
      setError("Veuillez saisir une URL.");
      return;
    }
    setError(null);
    setLoading(true);
    setScan(null);
    setSelectedHistoryId(null);

    try {
      const result = await post("/api/vault/rgpd-scan", { url: url.trim() });
      setScan(result);
      fetchHistory(); // refresh history
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  }, [url, post, fetchHistory]);

  const loadScanDetail = useCallback(async (id) => {
    try {
      setSelectedHistoryId(id);
      setLoading(true);
      setError(null);
      const result = await get(`/api/vault/rgpd-scan/${id}`);
      setScan(result);
      setUrl(result.url || "");
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du scan.");
    } finally {
      setLoading(false);
    }
  }, [get]);

  const complianceKeys = [
    "mentionsLegales",
    "politiqueConfidentialite",
    "cookieBanner",
    "cgv",
    "contactInfo",
    "ssl",
    "thirdPartyTrackers",
    "formConsent",
  ];

  return (
    <div style={{ maxWidth: "860px" }}>
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: BG_TINT, border: `1px solid ${BORDER_TINT}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ShieldIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
            Conformit\u00e9 RGPD
          </h1>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, marginTop: "2px" }}>
            Analysez la conformit\u00e9 RGPD de n'importe quel site web
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div style={{
        height: "3px",
        background: `linear-gradient(90deg, ${ACCENT}, #22d3ee, transparent)`,
        borderRadius: "2px",
        marginBottom: "24px",
        marginTop: "16px",
      }} />

      {/* Info banner */}
      <div style={{
        padding: "16px 20px",
        background: "rgba(6,182,212,0.06)",
        border: `1px solid ${BORDER_TINT}`,
        borderLeft: `3px solid ${ACCENT}`,
        borderRadius: "10px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
      }}>
        <div style={{ flexShrink: 0, marginTop: "2px" }}>
          <GlobeIcon size={20} color={ACCENT} />
        </div>
        <div style={{ fontSize: "13px", color: "#d1d5db", lineHeight: 1.7 }}>
          <strong style={{ color: "#f0f0f3" }}>Shield \u2014 Analyse RGPD</strong>
          <br />
          Entrez l'URL d'un site web pour v\u00e9rifier sa conformit\u00e9 RGPD. L'outil analyse 8 crit\u00e8res
          cl\u00e9s : mentions l\u00e9gales, politique de confidentialit\u00e9, cookies, CGV, contacts, SSL, trackers et consentement.
          <br />
          <span style={{ color: "#6b7280" }}>
            L'analyse porte sur la page d'accueil du site. Pour une conformit\u00e9 compl\u00e8te, un audit approfondi est recommand\u00e9.
          </span>
        </div>
      </div>

      {/* Scan form */}
      <div style={{ ...cardStyle, border: `1px solid ${BORDER_TINT}`, marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <GlobeIcon size={18} color={ACCENT} />
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
            Analyser un site
          </h2>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://monsite.fr"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = ACCENT; }}
              onBlur={e => { e.target.style.borderColor = "#2a2d3a"; }}
              onKeyDown={e => { if (e.key === "Enter") handleScan(); }}
            />
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
              URL compl\u00e8te du site \u00e0 analyser (la page d'accueil sera scann\u00e9e)
            </div>
          </div>
          <button
            onClick={handleScan}
            disabled={loading}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 24px", borderRadius: "8px",
              background: loading ? "#2a2d3a" : `linear-gradient(135deg, ${ACCENT}, #22d3ee)`,
              border: "none",
              color: loading ? "#6b7280" : "#0f0f11",
              fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              boxShadow: loading ? "none" : `0 4px 16px rgba(6,182,212,0.25)`,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: "16px", height: "16px",
                  border: "2px solid rgba(107,114,128,0.3)",
                  borderTop: "2px solid #6b7280",
                  borderRadius: "50%",
                  animation: "rgpd-spin 0.8s linear infinite",
                }} />
                Analyse...
              </>
            ) : (
              <>
                <ShieldIcon size={16} color="#0f0f11" />
                Analyser
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", marginTop: "16px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "6px", fontSize: "13px", color: "#fca5a5",
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && !scan && (
        <div style={{
          ...cardStyle, border: `1px solid ${BORDER_TINT}`,
          background: BG_TINT, textAlign: "center", padding: "48px 24px",
        }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{
              width: "64px", height: "64px", margin: "0 auto",
              border: "3px solid rgba(6,182,212,0.2)",
              borderTop: `3px solid ${ACCENT}`,
              borderRadius: "50%",
              animation: "rgpd-spin 1s linear infinite",
            }} />
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", marginBottom: "8px" }}>
            Analyse RGPD en cours...
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.6 }}>
            Nous analysons le site pour v\u00e9rifier sa conformit\u00e9 RGPD.
            <br />Cela peut prendre quelques secondes.
          </div>
          <style>{`@keyframes rgpd-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Results */}
      {scan && scan.status === "completed" && !loading && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldIcon size={18} color={ACCENT} />
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
                R\u00e9sultats \u2014 {scan.domain}
              </h2>
            </div>
            <button
              onClick={() => { setScan(null); setError(null); setSelectedHistoryId(null); }}
              style={{
                padding: "7px 14px", borderRadius: "6px",
                background: "transparent", border: `1px solid ${BORDER_TINT}`,
                color: ACCENT, fontSize: "12px", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              Nouvelle analyse
            </button>
          </div>

          {/* Score gauge */}
          <div style={{
            ...cardStyle, border: `1px solid ${BORDER_TINT}`,
            background: BG_TINT, textAlign: "center", padding: "32px 24px",
            marginBottom: "24px",
          }}>
            <ScoreGauge score={scan.score || 0} />
            <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "12px" }}>
              Score de conformit\u00e9 RGPD
            </div>
          </div>

          {/* Compliance cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "12px", marginBottom: "24px" }}>
            {complianceKeys.map(key => (
              <ComplianceCard key={key} keyName={key} result={scan.results?.[key]} />
            ))}
          </div>

          {/* AI Recommendations */}
          {scan.aiRecommendations && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <ShieldIcon size={18} color={ACCENT} />
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
                  Recommandations IA
                </h3>
              </div>
              <div style={{
                ...cardStyle,
                border: `1px solid ${BORDER_TINT}`,
                background: BG_TINT,
              }}>
                <div style={{
                  fontSize: "13px", color: "#d1d5db", lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}>
                  {scan.aiRecommendations}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History section */}
      <div style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <ClockIcon size={16} color="#9ca3af" />
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
            Historique des analyses
          </h3>
        </div>

        {loadingHistory && (
          <div style={{ fontSize: "13px", color: "#6b7280", padding: "16px" }}>
            Chargement...
          </div>
        )}

        {!loadingHistory && history.length === 0 && (
          <div style={{
            ...cardStyle,
            border: `1px solid #2a2d3a`,
            textAlign: "center",
            padding: "32px 24px",
            color: "#6b7280",
            fontSize: "13px",
          }}>
            Aucune analyse RGPD effectu\u00e9e. Lancez votre premi\u00e8re analyse ci-dessus.
          </div>
        )}

        {!loadingHistory && history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {history.map(h => (
              <div
                key={h._id}
                onClick={() => loadScanDetail(h._id)}
                style={{
                  ...cardStyle,
                  padding: "14px 18px",
                  border: selectedHistoryId === h._id ? `1px solid ${ACCENT}` : "1px solid #2a2d3a",
                  background: selectedHistoryId === h._id ? BG_TINT : "#1e2029",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <GlobeIcon size={16} color="#6b7280" />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#f0f0f3" }}>
                      {h.domain || h.url}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                      {formatDate(h.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {h.status === "completed" && h.score != null && (
                    <span style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: getScoreColor(h.score),
                    }}>
                      {h.score}/100
                    </span>
                  )}
                  {h.status === "error" && (
                    <span style={{ fontSize: "11px", color: "#ef4444" }}>Erreur</span>
                  )}
                  {h.status === "scanning" && (
                    <span style={{ fontSize: "11px", color: "#eab308" }}>En cours</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes rgpd-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
