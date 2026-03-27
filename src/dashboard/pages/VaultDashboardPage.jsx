import { useState, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const VAULT_NAV = [
  { path: "/app/vault", label: "Scanner", end: true },
  { path: "/app/vault/monitoring", label: "Surveillance" },
  { path: "/app/vault/history", label: "Historique" },
  { path: "/app/vault/rgpd", label: "Conformité RGPD" },
];

const ACCENT = "#06b6d4";
const BG_TINT = "rgba(6,182,212,0.08)";
const BORDER_TINT = "rgba(6,182,212,0.2)";

const RISK_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const RISK_LABELS = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible",
};

const RISK_EXPLANATIONS = {
  critical: "Risque critique : Des mots de passe et données sensibles ont été exposés. Action immédiate requise.",
  high: "Risque élevé : Des informations personnelles importantes ont été compromises. Changez vos mots de passe rapidement.",
  medium: "Risque moyen : Certaines informations ont fuité mais le danger reste limité. Restez vigilant.",
  low: "Risque faible : Peu de données exposées. Continuez les bonnes pratiques de sécurité.",
};

const DATA_CLASS_LABELS = {
  "Email addresses": "Adresses email",
  "Passwords": "Mots de passe",
  "Usernames": "Noms d'utilisateur",
  "IP addresses": "Adresses IP",
  "Phone numbers": "Numéros de téléphone",
  "Physical addresses": "Adresses postales",
  "Dates of birth": "Dates de naissance",
  "Credit cards": "Cartes bancaires",
  "Social security numbers": "Numéros de sécurité sociale",
  "Bank account numbers": "Comptes bancaires",
  "Employment": "Données d'emploi",
  "Genders": "Genres",
  "Names": "Noms complets",
  "Geographic locations": "Localisations",
  "Employers": "Employeurs",
  "Job titles": "Postes occupés",
  "Income levels": "Niveaux de revenus",
  "Education levels": "Niveaux d'éducation",
  "Biometric data": "Données biométriques",
  "Browser user agent details": "Données navigateur",
  "Device information": "Infos appareil",
  "Security questions and answers": "Questions de sécurité",
  "Auth tokens": "Jetons d'authentification",
  "Password hints": "Indices de mot de passe",
  "PINs": "Codes PIN",
  "Purchases": "Achats",
  "Avatars": "Photos de profil",
  "Social connections": "Connexions sociales",
  "Private messages": "Messages privés",
  "Chat logs": "Historique de chat",
  "Age groups": "Tranches d'âge",
  "Nationalities": "Nationalités",
  "Political views": "Opinions politiques",
  "Religions": "Religions",
  "Smoking habits": "Habitudes tabagiques",
  "Drinking habits": "Habitudes alcool",
  "Drug habits": "Habitudes drogues",
  "Sexual orientations": "Orientations sexuelles",
  "Relationship statuses": "Statuts relationnels",
  "Fitness levels": "Niveaux de forme",
  "Health insurance information": "Infos assurance santé",
  "Medical conditions": "Conditions médicales",
};

const DATA_CLASS_EXPLANATIONS = {
  "Email addresses": "Votre adresse email peut être utilisée pour du spam ou des tentatives de phishing.",
  "Passwords": "Vos mots de passe sont exposés. Changez-les immédiatement partout o\ù vous les utilisez.",
  "Usernames": "Vos noms d'utilisateur sont connus, ce qui facilite les tentatives de connexion frauduleuses.",
  "IP addresses": "Votre localisation approximative et fournisseur internet sont connus.",
  "Phone numbers": "Votre numéro peut être utilisé pour des appels ou SMS frauduleux.",
  "Physical addresses": "Votre adresse postale est exposée, risque d'usurpation d'identité.",
  "Dates of birth": "Votre date de naissance peut servir à deviner vos mots de passe ou usurper votre identité.",
  "Credit cards": "Vos données bancaires sont compromises. Contactez votre banque immédiatement.",
  "Social security numbers": "Risque majeur d'usurpation d'identité. Contactez les autorités.",
  "Bank account numbers": "Vos coordonnées bancaires sont exposées. Prévenez votre banque.",
  "Names": "Votre nom complet est associé à d'autres données personnelles.",
  "Geographic locations": "Vos lieux fréquentés sont connus.",
  "Security questions and answers": "Vos questions de sécurité sont compromises. Changez-les sur tous vos comptes.",
  "Auth tokens": "Des jetons d'accès à vos comptes ont fuité. Déconnectez toutes les sessions.",
  "Private messages": "Des messages privés ont été exposés publiquement.",
};

const DATA_CLASS_SEVERITY = {
  "Passwords": "critical",
  "Credit cards": "critical",
  "Social security numbers": "critical",
  "Bank account numbers": "critical",
  "Auth tokens": "critical",
  "Security questions and answers": "high",
  "Phone numbers": "high",
  "Physical addresses": "high",
  "Dates of birth": "high",
  "Private messages": "high",
  "IP addresses": "medium",
  "Usernames": "medium",
  "Names": "medium",
  "Email addresses": "low",
  "Genders": "low",
  "Avatars": "low",
};

const ShieldIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ShieldCheckIcon = ({ size = 48, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const LockIcon = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ChevronDown = ({ size = 16, color = "#6b7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const AlertTriangle = ({ size = 18, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatNumber(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

function getDataClassColor(dataClass) {
  const severity = DATA_CLASS_SEVERITY[dataClass] || "low";
  return RISK_COLORS[severity] || RISK_COLORS.low;
}

function BreachCard({ breach }) {
  return (
    <div className="px-4 py-3.5 bg-[rgba(6,182,212,0.04)] border border-[rgba(6,182,212,0.1)] rounded-lg mb-2" style={{
      borderLeft: `3px solid ${RISK_COLORS[breach.riskLevel] || "#f97316"}`,
    }}>
      <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} color={RISK_COLORS[breach.riskLevel] || "#f97316"} />
          <span className="text-sm font-semibold text-[#f0f0f3]">{breach.name || breach.Name}</span>
        </div>
        <div className="flex gap-3 text-xs text-[#9ca3af]">
          <span>{formatDate(breach.date || breach.BreachDate)}</span>
          <span>{formatNumber(breach.pwnCount || breach.PwnCount)} comptes touchés</span>
        </div>
      </div>
      {/* Data classes */}
      <div className="flex flex-wrap gap-1.5">
        {(breach.dataClasses || breach.DataClasses || []).map((dc, i) => {
          const color = getDataClassColor(dc);
          const label = DATA_CLASS_LABELS[dc] || dc;
          const explanation = DATA_CLASS_EXPLANATIONS[dc];
          return (
            <span key={i} title={explanation || label} className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded text-[11px] font-medium" style={{
              color: color,
              background: `${color}15`,
              border: `1px solid ${color}30`,
              cursor: explanation ? "help" : "default",
            }}>
              {label}
            </span>
          );
        })}
      </div>
      {/* Explanation for most critical data class */}
      {(() => {
        const classes = breach.dataClasses || breach.DataClasses || [];
        const critical = classes.find(dc => DATA_CLASS_EXPLANATIONS[dc]);
        if (!critical) return null;
        return (
          <div className="mt-2.5 px-3 py-2 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] rounded-md text-xs text-[#fca5a5] leading-normal">
            {DATA_CLASS_EXPLANATIONS[critical]}
          </div>
        );
      })()}
    </div>
  );
}

function EmailResultCard({ result }) {
  const [expanded, setExpanded] = useState(false);
  const breaches = result.breaches || [];
  const breachCount = breaches.length;

  if (breachCount === 0) return null;

  return (
    <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-3">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center">
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#f0f0f3]">
              {result.email}
            </div>
            <div className="text-xs text-[#ef4444] mt-0.5">
              {breachCount} fuite{breachCount > 1 ? "s" : ""} détectée{breachCount > 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="transition-transform duration-200" style={{
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          <ChevronDown />
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[rgba(6,182,212,0.1)]">
          {breaches.map((breach, i) => (
            <BreachCard key={i} breach={breach} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, icon }) {
  return (
    <div className="bg-[#1e2029] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex-[1_1_0] min-w-[140px] relative overflow-hidden" style={{
      border: `1px solid ${color}30`,
      background: `${color}08`,
    }}>
      <div className="absolute -top-2.5 -right-2.5 opacity-[0.08] w-[60px] h-[60px]">
        {icon}
      </div>
      <div className="text-xs text-[#6b7280] mb-1.5 font-medium">{label}</div>
      <div className="text-[26px] font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function LoadingAnimation() {
  return (
    <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] px-6 py-12 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center">
      <div className="mb-5">
        <div className="w-16 h-16 mx-auto border-[3px] border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[vault-spin_1s_linear_infinite]" />
      </div>
      <div className="text-base font-semibold text-[#f0f0f3] mb-2">
        Analyse en cours...
      </div>
      <div className="text-[13px] text-[#9ca3af] leading-relaxed">
        Nous vérifions vos adresses email dans les bases de données compromises connues.
        <br />Cela peut prendre quelques secondes.
      </div>
      <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function VaultResults({ scan }) {
  if (!scan) return null;

  const results = scan.results || [];
  const totalEmails = results.length;
  const compromised = results.filter(r => r.breaches && r.breaches.length > 0);
  const compromisedCount = compromised.length;
  const totalBreaches = results.reduce((acc, r) => acc + (r.breaches?.length || 0), 0);
  const riskLevel = scan.riskLevel || "low";
  const riskColor = RISK_COLORS[riskLevel];
  const recommendations = scan.recommendations || [];

  return (
    <div>
      {/* Summary Cards */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <SummaryCard
          label="Emails scannés"
          value={totalEmails}
          color={ACCENT}
          icon={<LockIcon size={60} color={ACCENT} />}
        />
        <SummaryCard
          label="Emails compromis"
          value={compromisedCount}
          color={compromisedCount > 0 ? "#ef4444" : "#22c55e"}
          icon={<AlertTriangle size={60} color={compromisedCount > 0 ? "#ef4444" : "#22c55e"} />}
        />
        <SummaryCard
          label="Fuites détectées"
          value={totalBreaches}
          color={totalBreaches > 0 ? "#f97316" : "#22c55e"}
          icon={<ShieldIcon size={60} color={totalBreaches > 0 ? "#f97316" : "#22c55e"} />}
        />
        <SummaryCard
          label="Niveau de risque"
          value={RISK_LABELS[riskLevel] || riskLevel}
          color={riskColor}
          icon={<ShieldCheckIcon size={60} color={riskColor} />}
        />
      </div>

      {/* Risk explanation */}
      <div className="px-[18px] py-3.5 rounded-lg mb-6 text-[13px] leading-relaxed flex items-start gap-2.5" style={{
        background: `${riskColor}10`,
        border: `1px solid ${riskColor}30`,
        color: riskColor,
      }}>
        <span className="shrink-0 mt-px">
          <ShieldIcon size={18} color={riskColor} />
        </span>
        {RISK_EXPLANATIONS[riskLevel] || "Résultat de l'analyse de sécurité."}
      </div>

      {/* No breaches -- celebration */}
      {compromisedCount === 0 && (
        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center mb-6">
          <ShieldCheckIcon size={56} color="#22c55e" />
          <div className="text-xl font-bold text-[#22c55e] mt-4 mb-2">
            Aucune fuite détectée
          </div>
          <div className="text-sm text-[#86efac] leading-relaxed max-w-[440px] mx-auto">
            Bonne nouvelle ! Aucune des adresses email analysées n'apparaît dans les bases de données compromises connues.
            Continuez à appliquer les bonnes pratiques de sécurité.
          </div>
        </div>
      )}

      {/* Compromised emails */}
      {compromisedCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3.5">
            <LockIcon size={18} color="#ef4444" />
            <h3 className="text-base font-semibold text-[#f0f0f3] m-0">
              Emails compromis
            </h3>
            <span className="text-[11px] font-semibold text-[#ef4444] bg-[rgba(239,68,68,0.15)] px-2 py-0.5 rounded">
              {compromisedCount}
            </span>
          </div>
          {compromised.map((result, i) => (
            <EmailResultCard key={i} result={result} />
          ))}
        </div>
      )}

      {/* Safe emails */}
      {results.filter(r => !r.breaches || r.breaches.length === 0).length > 0 && compromisedCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3.5">
            <ShieldCheckIcon size={18} color="#22c55e" />
            <h3 className="text-base font-semibold text-[#f0f0f3] m-0">
              Emails sécurisés
            </h3>
          </div>
          <div className="bg-[rgba(34,197,94,0.04)] border border-[rgba(34,197,94,0.15)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            {results.filter(r => !r.breaches || r.breaches.length === 0).map((r, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 text-[13px] text-[#86efac]">
                <span className="text-[#22c55e]">&#10003;</span>
                {r.email}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3.5">
            <ShieldIcon size={18} color={ACCENT} />
            <h3 className="text-base font-semibold text-[#f0f0f3] m-0">
              Recommandations de sécurité
            </h3>
          </div>
          <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 py-3" style={{
                borderBottom: i < recommendations.length - 1 ? "1px solid rgba(6,182,212,0.1)" : "none",
              }}>
                <span className="w-6 h-6 rounded-md bg-[rgba(6,182,212,0.12)] text-[#06b6d4] flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-[13px] text-[#d1d5db] leading-relaxed">
                  {rec}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download button (disabled) */}
      <button
        disabled
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2a2d3a] border border-[#3f3f46] text-[#d1d5db] text-[13px] font-medium cursor-not-allowed font-[inherit] opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Télécharger le rapport (bientôt disponible)
      </button>
    </div>
  );
}

/* --- Password Checker Component --- */
const STRENGTH_CONFIG = {
  weak: { color: "#ef4444", label: "Faible", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
  medium: { color: "#eab308", label: "Moyen", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.3)" },
  strong: { color: "#22c55e", label: "Fort", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)" },
};

const EyeIcon = ({ size = 16, color = "#6b7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = ({ size = 16, color = "#6b7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

function PasswordChecker({ post: apiPost }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [pwError, setPwError] = useState(null);

  const handleCheck = useCallback(async () => {
    if (!password.trim()) return;
    setPwError(null);
    setChecking(true);
    setResult(null);
    try {
      const data = await apiPost("/api/vault/password-check", { password });
      setResult(data);
    } catch (err) {
      setPwError(err.message || "Erreur lors de la vérification.");
    } finally {
      setChecking(false);
    }
  }, [password, apiPost]);

  const strengthConf = result ? STRENGTH_CONFIG[result.strength?.level] || STRENGTH_CONFIG.weak : null;

  return (
    <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
      <div className="flex items-center gap-2 mb-1.5">
        <LockIcon size={18} color={ACCENT} />
        <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
          Vérificateur de mot de passe
        </h2>
      </div>
      <p className="text-xs text-[#9ca3af] mb-[18px] leading-relaxed">
        Vérifiez la robustesse d'un mot de passe et s'il apparaît dans des fuites de données connues.
      </p>

      {/* k-anonymity explanation */}
      <div className="px-3.5 py-2.5 bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.2)] rounded-md mb-4 text-[11px] text-[#9ca3af] leading-relaxed flex items-start gap-2">
        <ShieldIcon size={16} color="#06b6d4" />
        <span>
          <strong className="text-[#d1d5db]">Votre mot de passe reste privé.</strong> Nous utilisons la méthode
          k-anonymity : seuls les 5 premiers caractères du hash SHA-1 sont envoyés au serveur. Le mot de passe
          complet n'est jamais transmis ni stocké.
        </span>
      </div>

      {/* Input */}
      <div className="flex gap-2.5 items-start mb-4">
        <div className="flex-1 relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => { setPassword(e.target.value); setResult(null); }}
            placeholder="Entrez un mot de passe à vérifier"
            className="w-full px-3.5 py-2.5 pr-10 bg-[#141520] border border-[#2a2d3a] rounded-lg text-[#e4e4e7] text-sm font-[inherit] outline-none transition-colors duration-150 box-border focus:border-[#06b6d4]"
            onKeyDown={e => { if (e.key === "Enter") handleCheck(); }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 flex items-center"
          >
            {showPassword ? <EyeOffIcon size={16} color="#6b7280" /> : <EyeIcon size={16} color="#6b7280" />}
          </button>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking || !password.trim()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border-none text-[13px] font-semibold font-[inherit] whitespace-nowrap shrink-0"
          style={{
            background: checking || !password.trim() ? "#2a2d3a" : "linear-gradient(135deg, #06b6d4, #22d3ee)",
            color: checking || !password.trim() ? "#6b7280" : "#0f0f11",
            cursor: checking || !password.trim() ? "not-allowed" : "pointer",
          }}
        >
          {checking ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[rgba(107,114,128,0.3)] border-t-[#6b7280] rounded-full animate-[vault-spin_0.8s_linear_infinite]" />
              Vérification...
            </>
          ) : (
            <>
              <LockIcon size={14} color={!password.trim() ? "#6b7280" : "#0f0f11"} />
              Vérifier
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {pwError && (
        <div className="px-3.5 py-2.5 mb-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-md text-[13px] text-[#fca5a5]">
          {pwError}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="px-5 py-[18px] rounded-lg" style={{
          background: strengthConf.bg,
          border: `1px solid ${strengthConf.border}`,
        }}>
          {/* Strength meter */}
          <div className="mb-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold text-[#f0f0f3]">Robustesse</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded" style={{
                color: strengthConf.color,
                background: `${strengthConf.color}20`,
              }}>
                {strengthConf.label}
              </span>
            </div>
            <div className="h-1.5 rounded-sm bg-[#2a2d3a] overflow-hidden">
              <div className="h-full rounded-sm transition-[width] duration-500 ease-out" style={{
                background: strengthConf.color,
                width: `${result.strength?.score || 0}%`,
              }} />
            </div>
          </div>

          {/* Breach status */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-md" style={{
            background: result.breached ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
            border: `1px solid ${result.breached ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
          }}>
            {result.breached ? (
              <AlertTriangle size={18} color="#ef4444" />
            ) : (
              <ShieldCheckIcon size={18} color="#22c55e" />
            )}
            <div>
              <div className="text-[13px] font-semibold" style={{ color: result.breached ? "#fca5a5" : "#86efac" }}>
                {result.breached
                  ? `Ce mot de passe a été trouvé dans ${result.breachCount.toLocaleString("fr-FR")} fuite${result.breachCount > 1 ? "s" : ""} de données`
                  : "Ce mot de passe n'apparaît dans aucune fuite connue"
                }
              </div>
              <div className="text-[11px] text-[#9ca3af] mt-0.5">
                {result.breached
                  ? "Ne l'utilisez jamais. Choisissez un mot de passe unique et complexe."
                  : "Bonne nouvelle ! Cela ne garantit pas qu'il est sûr \u2014 privilégiez un mot de passe long et unique."
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VaultDashboardPage() {
  const { post } = useApi();
  const [domain, setDomain] = useState("");
  const [emailsText, setEmailsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scan, setScan] = useState(null);

  const handleScan = useCallback(async () => {
    const emails = emailsText
      .split(/[\n,;]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes("@"));

    if (!domain.trim()) {
      setError("Veuillez saisir un nom de domaine.");
      return;
    }
    if (emails.length === 0) {
      setError("Veuillez saisir au moins une adresse email valide.");
      return;
    }

    setError(null);
    setLoading(true);
    setScan(null);

    try {
      const result = await post("/api/vault/scan", {
        domain: domain.trim(),
        emails,
      });
      setScan(result);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors du scan.");
    } finally {
      setLoading(false);
    }
  }, [domain, emailsText, post]);

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
            Vault
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Surveillance des fuites de données
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="px-5 py-4 bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.2)] border-l-[3px] border-l-[#06b6d4] rounded-[10px] mb-7 mt-5 flex items-start gap-3.5">
        <div className="shrink-0 mt-0.5">
          <LockIcon size={20} color={ACCENT} />
        </div>
        <div className="text-[13px] text-[#d1d5db] leading-[1.7]">
          <strong className="text-[#f0f0f3]">Comment fonctionne Vault ?</strong>
          <br />
          Vault vérifie si les adresses email de votre entreprise apparaissent dans des bases de données piratées.
          Ces bases contiennent des informations volées lors d'attaques sur des sites comme LinkedIn, Adobe, Facebook, etc.
          <br />
          <span className="text-[#6b7280]">
            Aucune donnée sensible n'est stockée de notre côté. Seul le résultat de l'analyse est conservé.
          </span>
        </div>
      </div>

      {/* Scan form */}
      {!scan && !loading && (
        <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
          <div className="flex items-center gap-2 mb-5">
            <ShieldIcon size={18} color={ACCENT} />
            <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
              Lancer une analyse
            </h2>
          </div>

          {/* Domain input */}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-[#6b7280] mb-1.5">
              Domaine de votre entreprise
            </label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="monentreprise.fr"
              className="w-full px-3.5 py-2.5 bg-[#141520] border border-[#2a2d3a] rounded-lg text-[#e4e4e7] text-sm font-[inherit] outline-none transition-colors duration-150 box-border focus:border-[#06b6d4]"
            />
            <div className="text-[11px] text-[#d1d5db] mt-1">
              Le domaine principal de votre entreprise (sans www ni https://)
            </div>
          </div>

          {/* Emails textarea */}
          <div className="mb-5">
            <label className="block text-[13px] font-medium text-[#6b7280] mb-1.5">
              Adresses email à vérifier
            </label>
            <textarea
              value={emailsText}
              onChange={e => setEmailsText(e.target.value)}
              placeholder={"contact@monentreprise.fr\ndirection@monentreprise.fr\ncompta@monentreprise.fr"}
              rows={5}
              className="w-full px-3.5 py-2.5 bg-[#141520] border border-[#2a2d3a] rounded-lg text-[#e4e4e7] text-sm font-[inherit] outline-none resize-y leading-relaxed transition-colors duration-150 box-border focus:border-[#06b6d4]"
            />
            <div className="text-[11px] text-[#d1d5db] mt-1">
              Une adresse email par ligne. Vous pouvez ajouter toutes les adresses de votre entreprise.
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3.5 py-2.5 mb-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-md text-[13px] text-[#fca5a5]">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleScan}
            className="inline-flex items-center gap-2 px-6 py-[11px] rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] border-none text-[#0f0f11] text-sm font-semibold cursor-pointer font-[inherit] transition-all duration-150 shadow-[0_4px_16px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.4)]"
          >
            <ShieldIcon size={16} color="#0f0f11" />
            Lancer le scan
          </button>
        </div>
      )}

      {/* Password Checker */}
      {!scan && !loading && (
        <PasswordChecker post={post} />
      )}

      {/* Loading */}
      {loading && <LoadingAnimation />}

      {/* Results */}
      {scan && !loading && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShieldIcon size={18} color={ACCENT} />
              <h2 className="text-base font-semibold text-[#f0f0f3] m-0">
                Résultats de l'analyse
              </h2>
            </div>
            <button
              onClick={() => { setScan(null); setError(null); }}
              className="px-3.5 py-[7px] rounded-md bg-transparent border border-[rgba(6,182,212,0.2)] text-[#06b6d4] text-xs font-medium cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.08)]"
            >
              Nouveau scan
            </button>
          </div>
          <VaultResults scan={scan} />
        </div>
      )}
    </div>
  );
}
