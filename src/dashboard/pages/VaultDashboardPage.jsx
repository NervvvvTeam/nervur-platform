import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import SubNav from "../components/SubNav";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";

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

const FileIcon = ({ size = 20, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const ArrowRight = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

function ScoreGauge({ score }) {
  const radius = 80;
  const stroke = 12;
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
        <circle stroke="#2a2d3a" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
        <circle
          stroke={color} fill="transparent" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius} cx={radius} cy={radius}
          className="transition-[stroke-dashoffset] duration-[0.8s] ease-out"
        />
      </svg>
      <div className="relative -mt-[125px] text-center mb-12">
        <div className="text-5xl font-bold" style={{ color }}>{score}</div>
        <div className="text-xs text-[#9ca3af]">/100</div>
      </div>
      <div className="inline-flex px-4 py-1.5 rounded-md text-[13px] font-semibold" style={{
        color, background: `${color}15`, border: `1px solid ${color}30`,
      }}>
        {label}
      </div>
    </div>
  );
}

const COMPLIANCE_AREAS = [
  { key: "rgpd", label: "RGPD", description: "Protection des données personnelles", icon: "shield" },
  { key: "mentionsLegales", label: "Mentions légales", description: "Obligations légales LCEN", icon: "file" },
  { key: "cgv", label: "CGV / CGU", description: "Conditions générales", icon: "doc" },
  { key: "cookies", label: "Cookies", description: "Consentement et bannière", icon: "cookie" },
];

const MODULES = [
  { label: "Registre", path: "/app/vault/registre", stat: "12 traitements", icon: "list", color: "#06b6d4" },
  { label: "Audit (AIPD)", path: "/app/vault/aipd", stat: "3 analyses", icon: "scale", color: "#8b5cf6" },
  { label: "Plan d'action", path: "/app/vault/actions", stat: "5/12 terminées", icon: "clipboard", color: "#22c55e" },
  { label: "Incidents", path: "/app/vault/actions", stat: "0 actif", icon: "alert", color: "#ef4444" },
  { label: "Checklist", path: "/app/vault/checklist", stat: "72% complété", icon: "check", color: "#06b6d4" },
];

const ModuleIcon = ({ icon, color, size = 18 }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (icon) {
    case "list":
      return <svg {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case "scale":
      return <svg {...props}><path d="M16 3l-8 0"/><path d="M12 3l0 18"/><path d="M4 14l4-7 4 7"/><path d="M5 14l6 0"/><path d="M12 14l4-7 4 7"/><path d="M13 14l6 0"/></svg>;
    case "user":
      return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "clipboard":
      return <svg {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
    case "alert":
      return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case "check":
      return <svg {...props}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
    default:
      return null;
  }
};

function getAreaStatus(scanResults, areaKey) {
  if (!scanResults) return null;
  switch (areaKey) {
    case "rgpd":
      return scanResults.politiqueConfidentialite?.found && scanResults.contactInfo?.found;
    case "mentionsLegales":
      return scanResults.mentionsLegales?.found;
    case "cgv":
      return scanResults.cgv?.found;
    case "cookies":
      return scanResults.cookieBanner?.found;
    default:
      return null;
  }
}

export default function VaultDashboardPage() {
  const { get, post } = useApi();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastScan, setLastScan] = useState(null);
  const [loadingLast, setLoadingLast] = useState(true);

  // Load last scan on mount
  const fetchLastScan = useCallback(async () => {
    try {
      const data = await get("/api/vault/rgpd-history");
      if (data && data.length > 0) {
        // Load the most recent completed scan
        const recent = data.find(s => s.status === "completed");
        if (recent) {
          const full = await get(`/api/vault/rgpd-scan/${recent._id}`);
          setLastScan(full);
          setUrl(full.url || "");
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingLast(false);
    }
  }, [get]);

  useEffect(() => {
    fetchLastScan();
  }, [fetchLastScan]);

  const handleScan = useCallback(async () => {
    if (!url.trim()) {
      setError("Veuillez saisir l'URL de votre site web.");
      return;
    }
    setError(null);
    setLoading(true);
    setLastScan(null);

    try {
      const result = await post("/api/vault/rgpd-scan", { url: url.trim() });
      setLastScan(result);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  }, [url, post]);

  const score = lastScan?.score || 0;
  const hasResults = lastScan && lastScan.status === "completed";

  return (
    <div className="max-w-[1100px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <ShieldIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">
            Conformité juridique
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Vérifiez et améliorez la conformité légale de votre site web
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-5 mt-4" />

      {/* Agent Juridique IA badge */}
      <div className="flex items-start gap-3 mb-7 px-4 py-3.5 bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.2)] rounded-[10px]">
        <div className="w-9 h-9 rounded-lg bg-[rgba(6,182,212,0.12)] flex items-center justify-center shrink-0 mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 7.27 19H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
          </svg>
        </div>
        <div>
          <div className="text-[14px] font-semibold text-[#06b6d4] mb-1">
            Propulsé par notre Agent Juridique IA
          </div>
          <div className="text-[12px] text-[#71717a] leading-relaxed">
            Surveillance automatisée des évolutions réglementaires &bull; Analyse de conformité en temps réel &bull; Recommandations personnalisées
          </div>
        </div>
      </div>

      {/* Quick scan form */}
      <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
        <div className="flex items-center gap-2 mb-4">
          <GlobeIcon size={18} color={ACCENT} />
          <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
            Scanner mon site
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
              Entrez l'adresse de votre site pour analyser sa conformité
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
                <div className="w-4 h-4 border-2 border-[rgba(107,114,128,0.3)] border-t-[#6b7280] rounded-full animate-[vault-spin_0.8s_linear_infinite]" />
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
      {loading && (
        <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] px-6 py-12 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center mb-7">
          <div className="mb-5">
            <div className="w-16 h-16 mx-auto border-[3px] border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[vault-spin_1s_linear_infinite]" />
          </div>
          <div className="text-base font-semibold text-[#f0f0f3] mb-2">
            Analyse de conformité en cours...
          </div>
          <div className="text-[13px] text-[#9ca3af] leading-relaxed">
            Nous vérifions la conformité juridique de votre site.
            <br />Cela prend quelques secondes.
          </div>
          <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* No scan yet */}
      {!loading && !hasResults && !loadingLast && (
        <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center mb-7">
          <ShieldIcon size={48} color={ACCENT} />
          <div className="text-base font-semibold text-[#f0f0f3] mt-4 mb-2">
            Commencez par scanner votre site
          </div>
          <div className="text-[13px] text-[#9ca3af] leading-relaxed max-w-[440px] mx-auto">
            Vault analyse votre site web et vérifie sa conformité RGPD, la présence de mentions légales, de CGV et d'une bannière cookies.
            Entrez votre URL ci-dessus pour obtenir votre score de conformité.
          </div>
        </div>
      )}

      {/* Loading last scan */}
      {loadingLast && !loading && (
        <div className="text-[13px] text-[#6b7280] text-center py-8">Chargement...</div>
      )}

      {/* Dashboard results */}
      {hasResults && !loading && (
        <div>
          {/* Score section */}
          <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center mb-6">
            <ScoreGauge score={score} />
            <div className="text-[13px] text-[#9ca3af] mt-3">
              Score de conformité global — {lastScan.domain}
            </div>
          </div>

          {/* 4 status cards */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 mb-6">
            {COMPLIANCE_AREAS.map(area => {
              const status = getAreaStatus(lastScan.results, area.key);
              const isPass = status === true;
              const isUnknown = status === null;
              const borderColor = isUnknown ? "rgba(107,114,128,0.25)" : isPass ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)";
              const bgColor = isUnknown ? "rgba(107,114,128,0.04)" : isPass ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)";

              return (
                <div key={area.key} className="rounded-[10px] px-5 py-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.2)]" style={{
                  border: `1px solid ${borderColor}`, background: bgColor,
                }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    {isUnknown ? (
                      <div className="w-5 h-5 rounded-full bg-[rgba(107,114,128,0.2)] flex items-center justify-center">
                        <span className="text-[10px] text-[#6b7280]">?</span>
                      </div>
                    ) : isPass ? (
                      <CheckCircle size={20} />
                    ) : (
                      <XCircle size={20} />
                    )}
                    <span className="text-sm font-semibold text-[#f0f0f3]">{area.label}</span>
                  </div>
                  <div className="text-[11px] text-[#6b7280]">{area.description}</div>
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{
                      color: isUnknown ? "#6b7280" : isPass ? "#22c55e" : "#ef4444",
                      background: isUnknown ? "rgba(107,114,128,0.15)" : isPass ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    }}>
                      {isUnknown ? "Non analysé" : isPass ? "Conforme" : "Non conforme"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick recommendations */}
          {lastScan.aiRecommendations && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3.5">
                <ShieldIcon size={18} color={ACCENT} />
                <h3 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
                  Recommandations prioritaires
                </h3>
              </div>
              <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <div className="text-[13px] text-[#d1d5db] leading-[1.8] whitespace-pre-wrap">
                  {lastScan.aiRecommendations}
                </div>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 mb-6">
            <button
              onClick={() => navigate("/app/vault/rgpd")}
              className="bg-[#1e2029] border border-[rgba(6,182,212,0.15)] rounded-[10px] px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center gap-3.5 cursor-pointer font-[inherit] text-left transition-all duration-150 hover:border-[rgba(6,182,212,0.4)] hover:bg-[rgba(6,182,212,0.04)]"
            >
              <div className="w-10 h-10 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center shrink-0">
                <GlobeIcon size={18} color={ACCENT} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#f0f0f3]">Scan RGPD détaillé</div>
                <div className="text-[11px] text-[#6b7280] mt-0.5">8 critères analysés en profondeur</div>
              </div>
              <ArrowRight size={16} color="#6b7280" />
            </button>

            <button
              onClick={() => navigate("/app/vault/generateur")}
              className="bg-[#1e2029] border border-[rgba(6,182,212,0.15)] rounded-[10px] px-5 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center gap-3.5 cursor-pointer font-[inherit] text-left transition-all duration-150 hover:border-[rgba(6,182,212,0.4)] hover:bg-[rgba(6,182,212,0.04)]"
            >
              <div className="w-10 h-10 rounded-lg bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] flex items-center justify-center shrink-0">
                <FileIcon size={18} color={ACCENT} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#f0f0f3]">Générer vos documents</div>
                <div className="text-[11px] text-[#6b7280] mt-0.5">Mentions légales, CGV, politique cookies...</div>
              </div>
              <ArrowRight size={16} color="#6b7280" />
            </button>
          </div>

          {/* Module status grid */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3.5">
              <ShieldIcon size={18} color={ACCENT} />
              <h3 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
                Vos modules de conformité
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MODULES.map((mod) => (
                <button
                  key={mod.label}
                  onClick={() => navigate(mod.path)}
                  className="bg-[#1e2029] rounded-[10px] px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center gap-3 cursor-pointer font-[inherit] text-left transition-all duration-150 hover:bg-[rgba(255,255,255,0.03)]"
                  style={{
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: `3px solid ${mod.color}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${mod.color}15` }}
                  >
                    <ModuleIcon icon={mod.icon} color={mod.color} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#f0f0f3] truncate">{mod.label}</div>
                    <div className="text-[11px] text-[#6b7280] mt-0.5">{mod.stat}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* All compliant message */}
          {score >= 80 && (
            <div className="bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.25)] rounded-[10px] px-6 py-8 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center mb-6">
              <CheckCircle size={40} color="#22c55e" />
              <div className="text-base font-semibold text-[#22c55e] mt-3 mb-1.5">
                Bonne conformité !
              </div>
              <div className="text-[13px] text-[#86efac] leading-relaxed max-w-[440px] mx-auto">
                Votre site respecte les principaux critères de conformité juridique.
                Continuez à surveiller régulièrement pour maintenir ce niveau.
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
