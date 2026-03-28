import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import SubNav from "../components/SubNav";

const VAULT_NAV = [
  { path: "/app/vault", label: "Dashboard", end: true },
  { path: "/app/vault/generateur", label: "Générateur" },
  { path: "/app/vault/registre", label: "Registre" },
  { path: "/app/vault/veille", label: "Veille" },
  { path: "/app/vault/historique", label: "Historique" },
];

const ACCENT = "#06b6d4";
const BG_TINT = "rgba(6,182,212,0.08)";
const BORDER_TINT = "rgba(6,182,212,0.2)";

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
  mentionsLegales: { label: "Mentions légales", icon: "doc", description: "Obligation légale pour tout site professionnel (LCEN)" },
  politiqueConfidentialite: { label: "Politique de confidentialité", icon: "lock", description: "Obligatoire selon les articles 13-14 du RGPD" },
  cookieBanner: { label: "Bannière cookies", icon: "cookie", description: "Consentement requis avant dépôt de cookies (CNIL)" },
  cgv: { label: "CGV / CGU", icon: "file", description: "Conditions générales de vente ou d'utilisation" },
  contactInfo: { label: "Informations de contact", icon: "phone", description: "Coordonnées obligatoires dans les mentions légales" },
  ssl: { label: "Certificat SSL (HTTPS)", icon: "shield", description: "Chiffrement des données en transit" },
  thirdPartyTrackers: { label: "Trackers tiers", icon: "eye", description: "Détection de scripts de suivi tiers" },
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
    <div className="flex flex-col items-center gap-2">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
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
          className="transition-[stroke-dashoffset] duration-[0.8s] ease-out"
        />
      </svg>
      <div className="relative -mt-[110px] text-center mb-10">
        <div className="text-4xl font-bold" style={{ color }}>{score}</div>
        <div className="text-xs text-[#9ca3af]">/100</div>
      </div>
      <div className="inline-flex px-3.5 py-1 rounded-md text-[13px] font-semibold" style={{
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
    <div className="rounded-[10px] px-5 py-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.2)]" style={{
      border: `1px solid ${borderColor}`,
      background: bgColor,
    }}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {isPass ? <CheckCircle size={20} /> : <XCircle size={20} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-[#f0f0f3]">
              {info.label}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{
              color: isPass ? "#22c55e" : "#ef4444",
              background: isPass ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            }}>
              {isPass ? "Conforme" : "Non conforme"}
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mb-2">
            {info.description}
          </div>
          <div className="text-xs text-[#d1d5db] leading-relaxed">
            {result.details}
          </div>
          {keyName === "thirdPartyTrackers" && result.trackers && result.trackers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {result.trackers.map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium text-[#f97316] bg-[rgba(249,115,22,0.12)] border border-[rgba(249,115,22,0.25)]">
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
    issue: "Mentions légales absentes ou incomplètes",
    fix: "Créez une page \"Mentions légales\" sur votre site avec : nom/raison sociale, adresse du siège, numéro SIRET, nom du directeur de publication, coordonnées de l'hébergeur. Vous pouvez utiliser un générateur gratuit comme mentions-legales.fr.",
    time: "30 minutes",
  },
  politiqueConfidentialite: {
    issue: "Politique de confidentialité manquante",
    fix: "Rédigez une page dédiée expliquant : quelles données vous collectez, pourquoi, combien de temps vous les conservez, et les droits de vos utilisateurs (accès, rectification, suppression). Ajoutez un lien visible dans le pied de page du site.",
    time: "1 à 2 heures",
  },
  cookieBanner: {
    issue: "Bannière de cookies absente",
    fix: "Installez une solution de gestion des cookies comme Tarteaucitron (gratuit, open source) ou Axeptio. La bannière doit permettre d'accepter ou refuser les cookies non essentiels AVANT leur dépôt.",
    time: "1 heure",
  },
  cgv: {
    issue: "Conditions générales (CGV/CGU) absentes",
    fix: "Rédigez des CGV si vous vendez des produits/services, ou des CGU si votre site propose des fonctionnalités. Incluez : description du service, prix, modalités de paiement, droit de rétractation, et résolution des litiges.",
    time: "2 à 4 heures",
  },
  contactInfo: {
    issue: "Informations de contact introuvables",
    fix: "Ajoutez sur votre site : une adresse email de contact, un numéro de téléphone, et votre adresse postale. Ces informations doivent être facilement accessibles (page contact ou mentions légales).",
    time: "15 minutes",
  },
  ssl: {
    issue: "Site non sécurisé (pas de HTTPS)",
    fix: "Activez le certificat SSL sur votre hébergement. La plupart des hébergeurs (OVH, o2switch, Infomaniak) proposent un certificat Let's Encrypt gratuit. Activez-le depuis votre panneau de gestion, puis forcez la redirection HTTP vers HTTPS.",
    time: "30 minutes à 1 heure",
  },
  thirdPartyTrackers: {
    issue: "Trackers tiers détectés sans consentement",
    fix: "Les scripts de suivi (Google Analytics, Facebook Pixel, etc.) ne doivent se charger qu'APRÈS le consentement de l'utilisateur. Configurez votre bannière cookies pour bloquer ces scripts par défaut et ne les activer qu'après acceptation.",
    time: "1 à 2 heures",
  },
  formConsent: {
    issue: "Formulaires sans case de consentement",
    fix: "Ajoutez une case à cocher (non pré-cochée) sous chaque formulaire avec un texte du type : \"J'accepte que mes données soient traitées conformément à la politique de confidentialité\". Ajoutez un lien vers votre politique de confidentialité.",
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
      fetchHistory();
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
      if (!res.ok) throw new Error("Erreur lors du téléchargement du rapport.");
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
    <div className="max-w-[860px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <ShieldIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">
            Scan RGPD
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Vérifiez la conformité juridique de votre site en quelques secondes
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-6 mt-4" />

      {/* Info banner */}
      <div className="px-5 py-4 bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.2)] border-l-[3px] border-l-[#06b6d4] rounded-[10px] mb-7 flex items-start gap-3.5">
        <div className="shrink-0 mt-0.5">
          <GlobeIcon size={20} color={ACCENT} />
        </div>
        <div className="text-[13px] text-[#d1d5db] leading-[1.7]">
          <strong className="text-[#f0f0f3]">Vault — Scan RGPD</strong>
          <br />
          Entrez l'adresse de votre site web pour vérifier sa conformité juridique. L'outil vérifie 8 points
          essentiels : mentions légales, politique de confidentialité, cookies, CGV, contacts, HTTPS, trackers et consentement.
          <br />
          <span className="text-[#6b7280]">
            L'analyse porte sur la page d'accueil. Pour les documents manquants, utilisez notre générateur automatique.
          </span>
        </div>
      </div>

      {/* Scan form */}
      <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
        <div className="flex items-center gap-2 mb-5">
          <GlobeIcon size={18} color={ACCENT} />
          <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
            Analyser un site
          </h2>
        </div>

        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://monsite.fr"
              className="w-full px-3.5 py-2.5 bg-[#141520] border border-[#2a2d3a] rounded-lg text-[#e4e4e7] text-sm font-[inherit] outline-none transition-colors duration-150 box-border focus:border-[#06b6d4]"
              onKeyDown={e => { if (e.key === "Enter") handleScan(); }}
            />
            <div className="text-[11px] text-[#6b7280] mt-1">
              URL complète du site à analyser (la page d'accueil sera scannée)
            </div>
          </div>
          <button
            onClick={handleScan}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border-none text-sm font-semibold font-[inherit] transition-all duration-150 whitespace-nowrap shrink-0"
            style={{
              background: loading ? "#2a2d3a" : `linear-gradient(135deg, ${ACCENT}, #22d3ee)`,
              color: loading ? "#6b7280" : "#0f0f11",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 16px rgba(6,182,212,0.25)",
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[rgba(107,114,128,0.3)] border-t-[#6b7280] rounded-full animate-[rgpd-spin_0.8s_linear_infinite]" />
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
          <div className="px-3.5 py-2.5 mt-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-md text-[13px] text-[#fca5a5]">
            {error}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && !scan && (
        <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] px-6 py-12 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center">
          <div className="mb-5">
            <div className="w-16 h-16 mx-auto border-[3px] border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[rgpd-spin_1s_linear_infinite]" />
          </div>
          <div className="text-base font-semibold text-[#f0f0f3] mb-2">
            Analyse RGPD en cours...
          </div>
          <div className="text-[13px] text-[#9ca3af] leading-relaxed">
            Nous analysons le site pour vérifier sa conformité RGPD.
            <br />Cela peut prendre quelques secondes.
          </div>
          <style>{`@keyframes rgpd-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Results */}
      {scan && scan.status === "completed" && !loading && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShieldIcon size={18} color={ACCENT} />
              <h2 className="text-base font-semibold text-[#f0f0f3] m-0">
                Résultats \u2014 {scan.domain}
              </h2>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={handleDownloadRgpdPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-md border-none text-white text-xs font-medium font-[inherit] transition-all duration-150"
                style={{
                  background: downloadingPdf ? "#2a2d3a" : "linear-gradient(135deg, #06b6d4, #22d3ee)",
                  cursor: downloadingPdf ? "not-allowed" : "pointer",
                  opacity: downloadingPdf ? 0.7 : 1,
                }}
              >
                {downloadingPdf ? (
                  <>
                    <div className="w-[13px] h-[13px] border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-[rgpd-spin_0.8s_linear_infinite]" />
                    Génération...
                  </>
                ) : (
                  <>
                    <DownloadIcon size={14} />
                    Télécharger le rapport RGPD
                  </>
                )}
              </button>
              <button
                onClick={() => { setScan(null); setError(null); setSelectedHistoryId(null); }}
                className="px-3.5 py-[7px] rounded-md bg-transparent border border-[rgba(6,182,212,0.2)] text-[#06b6d4] text-xs font-medium cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.08)]"
              >
                Nouvelle analyse
              </button>
            </div>
          </div>

          {/* Score gauge */}
          <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center mb-6">
            <ScoreGauge score={scan.score || 0} />
            <div className="text-[13px] text-[#9ca3af] mt-3">
              Score de conformité RGPD
            </div>
          </div>

          {/* Compliance cards */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-3 mb-6">
            {complianceKeys.map(key => (
              <ComplianceCard key={key} keyName={key} result={scan.results?.[key]} />
            ))}
          </div>

          {/* AI Recommendations */}
          {scan.aiRecommendations && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3.5">
                <ShieldIcon size={18} color={ACCENT} />
                <h3 className="text-base font-semibold text-[#f0f0f3] m-0">
                  Recommandations IA
                </h3>
              </div>
              <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <div className="text-[13px] text-[#d1d5db] leading-[1.8] whitespace-pre-wrap">
                  {scan.aiRecommendations}
                </div>
              </div>
            </div>
          )}

          {/* Action Plan */}
          {actionPlanItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3.5">
                <WrenchIcon size={18} color={ACCENT} />
                <h3 className="text-base font-semibold text-[#f0f0f3] m-0">
                  Plan d'action
                </h3>
                <span className="text-[11px] font-semibold text-[#06b6d4] bg-[rgba(6,182,212,0.15)] px-2 py-0.5 rounded">
                  {actionPlanItems.length} {actionPlanItems.length > 1 ? "étapes" : "étape"}
                </span>
              </div>

              <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.2)] p-0">
                {actionPlanItems.map((item, i) => (
                  <div key={item.key} className="px-6 py-5" style={{
                    borderBottom: i < actionPlanItems.length - 1 ? `1px solid ${BORDER_TINT}` : "none",
                  }}>
                    {/* Step number + issue */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] flex items-center justify-center shrink-0 text-[13px] font-bold text-[#0f0f11]">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        {/* Issue title */}
                        <div className="text-sm font-semibold text-[#f0f0f3] mb-2">
                          {item.issue}
                        </div>

                        {/* How to fix */}
                        <div className="px-4 py-3 bg-[rgba(6,182,212,0.04)] border border-[rgba(6,182,212,0.12)] rounded-lg mb-2">
                          <div className="text-[11px] font-semibold text-[#06b6d4] mb-1 uppercase tracking-[0.5px]">
                            Comment corriger
                          </div>
                          <div className="text-[13px] text-[#d1d5db] leading-[1.7]">
                            {item.fix}
                          </div>
                        </div>

                        {/* Estimated time */}
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
                          <ClockIcon size={12} color="#9ca3af" />
                          Temps estimé : {item.time}
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
            <div className="bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.25)] rounded-[10px] px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center mb-6">
              <CheckCircle size={40} color="#22c55e" />
              <div className="text-base font-semibold text-[#22c55e] mt-3 mb-1.5">
                Félicitations !
              </div>
              <div className="text-[13px] text-[#86efac] leading-relaxed max-w-[440px] mx-auto">
                Votre site respecte les principaux critères de conformité RGPD.
                Continuez à surveiller régulièrement pour maintenir cette conformité.
              </div>
            </div>
          )}
        </div>
      )}

      {/* History section */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3.5">
          <ClockIcon size={16} color="#9ca3af" />
          <h3 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
            Historique des analyses
          </h3>
        </div>

        {loadingHistory && (
          <div className="text-[13px] text-[#6b7280] p-4">
            Chargement...
          </div>
        )}

        {!loadingHistory && history.length === 0 && (
          <div className="bg-[#1e2029] border border-[#2a2d3a] rounded-[10px] px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center text-[#6b7280] text-[13px]">
            Aucune analyse RGPD effectuée. Lancez votre première analyse ci-dessus.
          </div>
        )}

        {!loadingHistory && history.length > 0 && (
          <div className="flex flex-col gap-2">
            {history.map(h => (
              <div
                key={h._id}
                onClick={() => loadScanDetail(h._id)}
                className="bg-[#1e2029] rounded-[10px] px-[18px] py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-150 flex items-center justify-between"
                style={{
                  border: selectedHistoryId === h._id ? `1px solid ${ACCENT}` : "1px solid #2a2d3a",
                  background: selectedHistoryId === h._id ? BG_TINT : "#1e2029",
                }}
              >
                <div className="flex items-center gap-3">
                  <GlobeIcon size={16} color="#6b7280" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#f0f0f3]">
                      {h.domain || h.url}
                    </div>
                    <div className="text-[11px] text-[#6b7280] mt-0.5">
                      {formatDate(h.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {h.status === "completed" && h.score != null && (
                    <span className="text-sm font-bold" style={{ color: getScoreColor(h.score) }}>
                      {h.score}/100
                    </span>
                  )}
                  {h.status === "error" && (
                    <span className="text-[11px] text-[#ef4444]">Erreur</span>
                  )}
                  {h.status === "scanning" && (
                    <span className="text-[11px] text-[#eab308]">En cours</span>
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
