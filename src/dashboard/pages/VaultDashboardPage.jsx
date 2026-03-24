import { useState, useCallback } from "react";
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
  "Passwords": "Vos mots de passe sont exposés. Changez-les immédiatement partout où vous les utilisez.",
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

const cardStyle = {
  background: "#1e2029",
  border: "1px solid #2a2d3a",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#6b7280",
  marginBottom: "6px",
  display: "block",
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

function formatDate(dateStr) {
  if (!dateStr) return "—";
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
    <div style={{
      padding: "14px 16px",
      background: "rgba(6,182,212,0.04)",
      border: "1px solid rgba(6,182,212,0.1)",
      borderLeft: `3px solid ${RISK_COLORS[breach.riskLevel] || "#f97316"}`,
      borderRadius: "8px",
      marginBottom: "8px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={16} color={RISK_COLORS[breach.riskLevel] || "#f97316"} />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#f0f0f3" }}>{breach.name || breach.Name}</span>
        </div>
        <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#9ca3af" }}>
          <span>{formatDate(breach.date || breach.BreachDate)}</span>
          <span>{formatNumber(breach.pwnCount || breach.PwnCount)} comptes touchés</span>
        </div>
      </div>
      {/* Data classes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {(breach.dataClasses || breach.DataClasses || []).map((dc, i) => {
          const color = getDataClassColor(dc);
          const label = DATA_CLASS_LABELS[dc] || dc;
          const explanation = DATA_CLASS_EXPLANATIONS[dc];
          return (
            <span key={i} title={explanation || label} style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 10px", borderRadius: "4px",
              fontSize: "11px", fontWeight: 500,
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
          <div style={{
            marginTop: "10px", padding: "8px 12px",
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: "6px", fontSize: "12px", color: "#fca5a5", lineHeight: 1.5,
          }}>
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
    <div style={{
      ...cardStyle,
      border: `1px solid ${BORDER_TINT}`,
      background: BG_TINT,
      marginBottom: "12px",
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#f0f0f3" }}>
              {result.email}
            </div>
            <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "2px" }}>
              {breachCount} fuite{breachCount > 1 ? "s" : ""} détectée{breachCount > 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div style={{
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>
          <ChevronDown />
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(6,182,212,0.1)" }}>
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
    <div style={{
      ...cardStyle,
      flex: "1 1 0",
      minWidth: "140px",
      border: `1px solid ${color}30`,
      background: `${color}08`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "-10px", right: "-10px", opacity: 0.08,
        width: "60px", height: "60px",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px", fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function LoadingAnimation() {
  return (
    <div style={{
      ...cardStyle,
      border: `1px solid ${BORDER_TINT}`,
      background: BG_TINT,
      textAlign: "center",
      padding: "48px 24px",
    }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          width: "64px", height: "64px", margin: "0 auto",
          border: `3px solid rgba(6,182,212,0.2)`,
          borderTop: `3px solid ${ACCENT}`,
          borderRadius: "50%",
          animation: "vault-spin 1s linear infinite",
        }} />
      </div>
      <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", marginBottom: "8px" }}>
        Analyse en cours...
      </div>
      <div style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.6 }}>
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
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
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
      <div style={{
        padding: "14px 18px",
        background: `${riskColor}10`,
        border: `1px solid ${riskColor}30`,
        borderRadius: "8px",
        marginBottom: "24px",
        fontSize: "13px",
        color: `${riskColor}`,
        lineHeight: 1.6,
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
      }}>
        <span style={{ flexShrink: 0, marginTop: "1px" }}>
          <ShieldIcon size={18} color={riskColor} />
        </span>
        {RISK_EXPLANATIONS[riskLevel] || "Résultat de l'analyse de sécurité."}
      </div>

      {/* No breaches — celebration */}
      {compromisedCount === 0 && (
        <div style={{
          ...cardStyle,
          border: "1px solid rgba(34,197,94,0.3)",
          background: "rgba(34,197,94,0.08)",
          textAlign: "center",
          padding: "40px 24px",
          marginBottom: "24px",
        }}>
          <ShieldCheckIcon size={56} color="#22c55e" />
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#22c55e", marginTop: "16px", marginBottom: "8px" }}>
            Aucune fuite détectée
          </div>
          <div style={{ fontSize: "14px", color: "#86efac", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto" }}>
            Bonne nouvelle ! Aucune des adresses email analysées n'apparaît dans les bases de données compromises connues.
            Continuez à appliquer les bonnes pratiques de sécurité.
          </div>
        </div>
      )}

      {/* Compromised emails */}
      {compromisedCount > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <LockIcon size={18} color="#ef4444" />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
              Emails compromis
            </h3>
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "#ef4444",
              background: "rgba(239,68,68,0.15)", padding: "2px 8px", borderRadius: "4px",
            }}>
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
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <ShieldCheckIcon size={18} color="#22c55e" />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
              Emails sécurisés
            </h3>
          </div>
          <div style={{
            ...cardStyle,
            border: "1px solid rgba(34,197,94,0.15)",
            background: "rgba(34,197,94,0.04)",
          }}>
            {results.filter(r => !r.breaches || r.breaches.length === 0).map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "6px 0",
                fontSize: "13px", color: "#86efac",
              }}>
                <span style={{ color: "#22c55e" }}>&#10003;</span>
                {r.email}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <ShieldIcon size={18} color={ACCENT} />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
              Recommandations de sécurité
            </h3>
          </div>
          <div style={{
            ...cardStyle,
            border: `1px solid ${BORDER_TINT}`,
            background: BG_TINT,
          }}>
            {recommendations.map((rec, i) => (
              <div key={i} style={{
                display: "flex", gap: "12px",
                padding: "12px 0",
                borderBottom: i < recommendations.length - 1 ? "1px solid rgba(6,182,212,0.1)" : "none",
              }}>
                <span style={{
                  width: "24px", height: "24px", borderRadius: "6px",
                  background: `${ACCENT}20`, color: ACCENT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: "13px", color: "#d1d5db", lineHeight: 1.6 }}>
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
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "10px 20px", borderRadius: "8px",
          background: "#2a2d3a", border: "1px solid #3f3f46",
          color: "#d1d5db", fontSize: "13px", fontWeight: 500,
          cursor: "not-allowed", fontFamily: "inherit",
          opacity: 0.6,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Télécharger le rapport (bientôt disponible)
      </button>
    </div>
  );
}

/* ─── Password Checker Component ─── */
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
    <div style={{
      ...cardStyle,
      border: `1px solid ${BORDER_TINT}`,
      marginBottom: "28px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <LockIcon size={18} color={ACCENT} />
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
          Vérificateur de mot de passe
        </h2>
      </div>
      <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "18px", lineHeight: 1.6 }}>
        Vérifiez la robustesse d'un mot de passe et s'il apparaît dans des fuites de données connues.
      </p>

      {/* k-anonymity explanation */}
      <div style={{
        padding: "10px 14px",
        background: "rgba(6,182,212,0.05)",
        border: `1px solid ${BORDER_TINT}`,
        borderRadius: "6px",
        marginBottom: "16px",
        fontSize: "11px",
        color: "#9ca3af",
        lineHeight: 1.6,
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
      }}>
        <ShieldIcon size={16} color="#06b6d4" />
        <span>
          <strong style={{ color: "#d1d5db" }}>Votre mot de passe reste privé.</strong> Nous utilisons la méthode
          k-anonymity : seuls les 5 premiers caractères du hash SHA-1 sont envoyés au serveur. Le mot de passe
          complet n'est jamais transmis ni stocké.
        </span>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => { setPassword(e.target.value); setResult(null); }}
            placeholder="Entrez un mot de passe à vérifier"
            style={{ ...inputStyle, paddingRight: "40px" }}
            onFocus={e => { e.target.style.borderColor = ACCENT; }}
            onBlur={e => { e.target.style.borderColor = "#2a2d3a"; }}
            onKeyDown={e => { if (e.key === "Enter") handleCheck(); }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", padding: "4px",
              display: "flex", alignItems: "center",
            }}
          >
            {showPassword ? <EyeOffIcon size={16} color="#6b7280" /> : <EyeIcon size={16} color="#6b7280" />}
          </button>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking || !password.trim()}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 20px", borderRadius: "8px",
            background: checking || !password.trim() ? "#2a2d3a" : "linear-gradient(135deg, #06b6d4, #22d3ee)",
            border: "none",
            color: checking || !password.trim() ? "#6b7280" : "#0f0f11",
            fontSize: "13px", fontWeight: 600,
            cursor: checking || !password.trim() ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {checking ? (
            <>
              <div style={{
                width: "14px", height: "14px",
                border: "2px solid rgba(107,114,128,0.3)", borderTop: "2px solid #6b7280",
                borderRadius: "50%", animation: "vault-spin 0.8s linear infinite",
              }} />
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
        <div style={{
          padding: "10px 14px", marginBottom: "12px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "6px", fontSize: "13px", color: "#fca5a5",
        }}>
          {pwError}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{
          padding: "18px 20px",
          background: `${strengthConf.bg}`,
          border: `1px solid ${strengthConf.border}`,
          borderRadius: "8px",
        }}>
          {/* Strength meter */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#f0f0f3" }}>Robustesse</span>
              <span style={{
                fontSize: "12px", fontWeight: 600, color: strengthConf.color,
                padding: "2px 10px", borderRadius: "4px",
                background: `${strengthConf.color}20`,
              }}>
                {strengthConf.label}
              </span>
            </div>
            <div style={{
              height: "6px", borderRadius: "3px",
              background: "#2a2d3a", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: "3px",
                background: strengthConf.color,
                width: `${result.strength?.score || 0}%`,
                transition: "width 0.5s ease-out",
              }} />
            </div>
          </div>

          {/* Breach status */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 14px",
            background: result.breached ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
            border: `1px solid ${result.breached ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
            borderRadius: "6px",
          }}>
            {result.breached ? (
              <AlertTriangle size={18} color="#ef4444" />
            ) : (
              <ShieldCheckIcon size={18} color="#22c55e" />
            )}
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: result.breached ? "#fca5a5" : "#86efac" }}>
                {result.breached
                  ? `Ce mot de passe a été trouvé dans ${result.breachCount.toLocaleString("fr-FR")} fuite${result.breachCount > 1 ? "s" : ""} de données`
                  : "Ce mot de passe n'apparaît dans aucune fuite connue"
                }
              </div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                {result.breached
                  ? "Ne l'utilisez jamais. Choisissez un mot de passe unique et complexe."
                  : "Bonne nouvelle ! Cela ne garantit pas qu'il est sûr — privilégiez un mot de passe long et unique."
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
            Vault
          </h1>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, marginTop: "2px" }}>
            Surveillance des fuites de données
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        padding: "16px 20px",
        background: "rgba(6,182,212,0.06)",
        border: `1px solid ${BORDER_TINT}`,
        borderLeft: `3px solid ${ACCENT}`,
        borderRadius: "10px",
        marginBottom: "28px",
        marginTop: "20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
      }}>
        <div style={{ flexShrink: 0, marginTop: "2px" }}>
          <LockIcon size={20} color={ACCENT} />
        </div>
        <div style={{ fontSize: "13px", color: "#d1d5db", lineHeight: 1.7 }}>
          <strong style={{ color: "#f0f0f3" }}>Comment fonctionne Vault ?</strong>
          <br />
          Vault vérifie si les adresses email de votre entreprise apparaissent dans des bases de données piratées.
          Ces bases contiennent des informations volées lors d'attaques sur des sites comme LinkedIn, Adobe, Facebook, etc.
          <br />
          <span style={{ color: "#6b7280" }}>
            Aucune donnée sensible n'est stockée de notre côté. Seul le résultat de l'analyse est conservé.
          </span>
        </div>
      </div>

      {/* Scan form */}
      {!scan && !loading && (
        <div style={{
          ...cardStyle,
          border: `1px solid ${BORDER_TINT}`,
          marginBottom: "28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <ShieldIcon size={18} color={ACCENT} />
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
              Lancer une analyse
            </h2>
          </div>

          {/* Domain input */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>
              Domaine de votre entreprise
            </label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="monentreprise.fr"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = ACCENT}
              onBlur={e => e.target.style.borderColor = "#2a2d3a"}
            />
            <div style={{ fontSize: "11px", color: "#d1d5db", marginTop: "4px" }}>
              Le domaine principal de votre entreprise (sans www ni https://)
            </div>
          </div>

          {/* Emails textarea */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              Adresses email à vérifier
            </label>
            <textarea
              value={emailsText}
              onChange={e => setEmailsText(e.target.value)}
              placeholder={"contact@monentreprise.fr\ndirection@monentreprise.fr\ncompta@monentreprise.fr"}
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = ACCENT}
              onBlur={e => e.target.style.borderColor = "#2a2d3a"}
            />
            <div style={{ fontSize: "11px", color: "#d1d5db", marginTop: "4px" }}>
              Une adresse email par ligne. Vous pouvez ajouter toutes les adresses de votre entreprise.
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", marginBottom: "16px",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "6px", fontSize: "13px", color: "#fca5a5",
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleScan}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "11px 24px", borderRadius: "8px",
              background: "linear-gradient(135deg, #06b6d4, #22d3ee)", border: "none",
              color: "#0f0f11", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s",
              boxShadow: "0 4px 16px rgba(6,182,212,0.25)",
            }}
            onMouseEnter={e => { e.target.style.boxShadow = "0 4px 20px rgba(6,182,212,0.4)"; }}
            onMouseLeave={e => { e.target.style.boxShadow = "0 4px 16px rgba(6,182,212,0.25)"; }}
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldIcon size={18} color={ACCENT} />
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
                Résultats de l'analyse
              </h2>
            </div>
            <button
              onClick={() => { setScan(null); setError(null); }}
              style={{
                padding: "7px 14px", borderRadius: "6px",
                background: "transparent", border: `1px solid ${BORDER_TINT}`,
                color: ACCENT, fontSize: "12px", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.target.style.background = BG_TINT; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; }}
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
