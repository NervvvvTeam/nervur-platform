import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
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

const DownloadIcon = ({ size = 15, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const WrenchIcon = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

// Action plan items for each RGPD issue
const RGPD_ACTION_PLANS = {
  mentionsLegales: {
    issue: "Mentions l\u00e9gales absentes ou incompl\u00e8tes",
    fix: "Cr\u00e9ez une page \"Mentions l\u00e9gales\" sur votre site avec : nom/raison sociale, adresse du si\u00e8ge, num\u00e9ro SIRET, nom du directeur de publication, coordonn\u00e9es de l'h\u00e9bergeur. Vous pouvez utiliser un g\u00e9n\u00e9rateur gratuit comme mentions-legales.fr.",
    time: "30 minutes",
  },
  politiqueConfidentialite: {
    issue: "Politique de confidentialit\u00e9 manquante",
    fix: "R\u00e9digez une page d\u00e9di\u00e9e expliquant : quelles donn\u00e9es vous collectez, pourquoi, combien de temps vous les conservez, et les droits de vos utilisateurs (acc\u00e8s, rectification, suppression). Ajoutez un lien visible dans le pied de page du site.",
    time: "1 \u00e0 2 heures",
  },
  cookieBanner: {
    issue: "Banni\u00e8re de cookies absente",
    fix: "Installez une solution de gestion des cookies comme Tarteaucitron (gratuit, open source) ou Axeptio. La banni\u00e8re doit permettre d'accepter ou refuser les cookies non essentiels AVANT leur d\u00e9p\u00f4t.",
    time: "1 heure",
  },
  cgv: {
    issue: "Conditions g\u00e9n\u00e9rales (CGV/CGU) absentes",
    fix: "R\u00e9digez des CGV si vous vendez des produits/services, ou des CGU si votre site propose des fonctionnalit\u00e9s. Incluez : description du service, prix, modalit\u00e9s de paiement, droit de r\u00e9tractation, et r\u00e9solution des litiges.",
    time: "2 \u00e0 4 heures",
  },
  contactInfo: {
    issue: "Informations de contact introuvables",
    fix: "Ajoutez sur votre site : une adresse email de contact, un num\u00e9ro de t\u00e9l\u00e9phone, et votre adresse postale. Ces informations doivent \u00eatre facilement accessibles (page contact ou mentions l\u00e9gales).",
    time: "15 minutes",
  },
  ssl: {
    issue: "Site non s\u00e9curis\u00e9 (pas de HTTPS)",
    fix: "Activez le certificat SSL sur votre h\u00e9bergement. La plupart des h\u00e9bergeurs (OVH, o2switch, Infomaniak) proposent un certificat Let's Encrypt gratuit. Activez-le depuis votre panneau de gestion, puis forcez la redirection HTTP vers HTTPS.",
    time: "30 minutes \u00e0 1 heure",
  },
  thirdPartyTrackers: {
    issue: "Trackers tiers d\u00e9tect\u00e9s sans consentement",
    fix: "Les scripts de suivi (Google Analytics, Facebook Pixel, etc.) ne doivent se charger qu'APR\u00c8S le consentement de l'utilisateur. Configurez votre banni\u00e8re cookies pour bloquer ces scripts par d\u00e9faut et ne les activer qu'apr\u00e8s acceptation.",
    time: "1 \u00e0 2 heures",
  },
  formConsent: {
    issue: "Formulaires sans case de consentement",
    fix: "Ajoutez une case \u00e0 cocher (non pr\u00e9-coch\u00e9e) sous chaque formulaire avec un texte du type : \"J'accepte que mes donn\u00e9es soient trait\u00e9es conform\u00e9ment \u00e0 la politique de confidentialit\u00e9\". Ajoutez un lien vers votre politique de confidentialit\u00e9.",
    time: "30 minutes par formulaire",
  },
};

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

function getActionPlanItems(results) {
  if (!results) return [];
  const items = [];
  const keys = Object.keys(RGPD_ACTION_PLANS);
  for (const key of keys) {
    const r = results[key];
    if (!r) continue;
    const isPass = key === "thirdPartyTrackers" ? !r.found : r.found;
    if (!isPass) {
      items.push({ ...RGPD_ACTION_PLANS[key], key });
    }
  }
  return items;
}

export default function VaultRgpdPage() {
  const { get, post } = useApi();
  const { token } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scan, setScan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const handleDownloadRgpdPdf = async () => {
    if (!scan || !scan._id) return;
    setDownloadingPdf(true);
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API}/api/vault/rgpd-scan/${scan._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du t\u00e9l\u00e9chargement du rapport.");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `rapport-rgpd-${scan.domain || "site"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const actionPlanItems = scan && scan.status === "completed" ? getActionPlanItems(scan.results) : [];

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
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={handleDownloadRgpdPdf}
                disabled={downloadingPdf}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "6px",
                  background: downloadingPdf ? "#2a2d3a" : "linear-gradient(135deg, #06b6d4, #22d3ee)",
                  border: "none",
                  color: "#fff", fontSize: "12px", fontWeight: 500,
                  cursor: downloadingPdf ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  opacity: downloadingPdf ? 0.7 : 1,
                }}
              >
                {downloadingPdf ? (
                  <>
                    <div style={{
                      width: "13px", height: "13px",
                      border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
                      borderRadius: "50%", animation: "rgpd-spin 0.8s linear infinite",
                    }} />
                    G\u00e9n\u00e9ration...
                  </>
                ) : (
                  <>
                    <DownloadIcon size={14} />
                    T\u00e9l\u00e9charger le rapport RGPD
                  </>
                )}
              </button>
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

          {/* Action Plan */}
          {actionPlanItems.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <WrenchIcon size={18} color={ACCENT} />
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
                  Plan d'action
                </h3>
                <span style={{
                  fontSize: "11px", fontWeight: 600, color: ACCENT,
                  background: "rgba(6,182,212,0.15)", padding: "2px 8px", borderRadius: "4px",
                }}>
                  {actionPlanItems.length} {actionPlanItems.length > 1 ? "\u00e9tapes" : "\u00e9tape"}
                </span>
              </div>

              <div style={{
                ...cardStyle,
                border: `1px solid ${BORDER_TINT}`,
                background: BG_TINT,
                padding: "0",
              }}>
                {actionPlanItems.map((item, i) => (
                  <div key={item.key} style={{
                    padding: "20px 24px",
                    borderBottom: i < actionPlanItems.length - 1 ? `1px solid ${BORDER_TINT}` : "none",
                  }}>
                    {/* Step number + issue */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #06b6d4, #22d3ee)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "13px", fontWeight: 700, color: "#0f0f11",
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        {/* Issue title */}
                        <div style={{
                          fontSize: "14px", fontWeight: 600, color: "#f0f0f3",
                          marginBottom: "8px",
                        }}>
                          {item.issue}
                        </div>

                        {/* How to fix */}
                        <div style={{
                          padding: "12px 16px",
                          background: "rgba(6,182,212,0.04)",
                          border: `1px solid rgba(6,182,212,0.12)`,
                          borderRadius: "8px",
                          marginBottom: "8px",
                        }}>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: ACCENT, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Comment corriger
                          </div>
                          <div style={{ fontSize: "13px", color: "#d1d5db", lineHeight: 1.7 }}>
                            {item.fix}
                          </div>
                        </div>

                        {/* Estimated time */}
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          fontSize: "11px", color: "#9ca3af",
                        }}>
                          <ClockIcon size={12} color="#9ca3af" />
                          Temps estim\u00e9 : {item.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All compliant message */}
          {actionPlanItems.length === 0 && scan.score >= 80 && (
            <div style={{
              ...cardStyle,
              border: "1px solid rgba(34,197,94,0.25)",
              background: "rgba(34,197,94,0.06)",
              textAlign: "center",
              padding: "32px 24px",
              marginBottom: "24px",
            }}>
              <CheckCircle size={40} color="#22c55e" />
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#22c55e", marginTop: "12px", marginBottom: "6px" }}>
                F\u00e9licitations !
              </div>
              <div style={{ fontSize: "13px", color: "#86efac", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto" }}>
                Votre site respecte les principaux crit\u00e8res de conformit\u00e9 RGPD.
                Continuez \u00e0 surveiller r\u00e9guli\u00e8rement pour maintenir cette conformit\u00e9.
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
