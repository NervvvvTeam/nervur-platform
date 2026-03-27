import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import SubNav from "../components/SubNav";

const VAULT_NAV = [
  { path: "/app/vault", label: "Dashboard", end: true },
  { path: "/app/vault/generateur", label: "Générateur" },
  { path: "/app/vault/registre", label: "Registre" },
  { path: "/app/vault/checklist", label: "Checklist" },
  { path: "/app/vault/badge", label: "Badge" },
  { path: "/app/vault/veille", label: "Veille" },
  { path: "/app/vault/historique", label: "Historique" },
];

const ACCENT = "#06b6d4";

const ShieldBadgeIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
);

const CopyIcon = ({ size = 15, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CheckIcon = ({ size = 15, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const BADGE_STYLES = [
  {
    key: "light",
    label: "Clair",
    bg: "#ffffff",
    text: "#1a1a2e",
    border: "#e2e8f0",
    accent: "#06b6d4",
    shieldFill: "#06b6d4",
    shieldStroke: "#06b6d4",
  },
  {
    key: "dark",
    label: "Sombre",
    bg: "#1a1b26",
    text: "#f0f0f3",
    border: "#2a2d3a",
    accent: "#22d3ee",
    shieldFill: "#06b6d4",
    shieldStroke: "#22d3ee",
  },
  {
    key: "minimal",
    label: "Minimal",
    bg: "transparent",
    text: "#6b7280",
    border: "#d1d5db",
    accent: "#06b6d4",
    shieldFill: "none",
    shieldStroke: "#06b6d4",
  },
];

const EMBED_CODE = `<a href="https://nervur.fr" target="_blank" rel="noopener noreferrer"><img src="https://nervur.fr/badge/compliance.svg" alt="Conforme RGPD - NERVÜR" style="height:40px" /></a>`;
const BADGE_URL = "https://nervur.fr/badge/compliance.svg";

function BadgePreview({ style, score }) {
  const scoreColor = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div
      className="inline-flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill={style.shieldFill} stroke={style.shieldStroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4" fill="none" stroke={style.bg === "#ffffff" ? "#ffffff" : style.bg === "transparent" ? style.accent : "#1a1b26"} strokeWidth="2"/>
      </svg>
      <div>
        <div className="text-[13px] font-semibold leading-tight" style={{ color: style.text }}>
          Site conforme RGPD
        </div>
        <div className="text-[11px] leading-tight mt-0.5" style={{ color: style.accent }}>
          Vérifié par NERVÜR — <span style={{ color: scoreColor, fontWeight: 600 }}>{score}%</span>
        </div>
      </div>
    </div>
  );
}

export default function VaultBadgePage() {
  const { get } = useApi();
  const [selectedStyle, setSelectedStyle] = useState("dark");
  const [copied, setCopied] = useState(null); // "embed" | "url" | null
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchScore = useCallback(async () => {
    try {
      const data = await get("/api/vault/rgpd-history");
      if (data && data.length > 0) {
        const recent = data.find(s => s.status === "completed");
        if (recent && recent.score != null) {
          setScore(recent.score);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeStyle = BADGE_STYLES.find(s => s.key === selectedStyle) || BADGE_STYLES[1];

  return (
    <div className="max-w-[860px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <ShieldBadgeIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">
            Badge de conformité
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Affichez votre conformité RGPD sur votre site web
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-6 mt-4" />

      {/* Badge preview */}
      <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
        <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0 mb-4">Aperçu du badge</h2>

        <div className="flex items-center justify-center py-8 px-4 bg-[#141520] rounded-lg border border-[#2a2d3a] mb-5"
          style={{
            backgroundImage: selectedStyle === "light" ? "linear-gradient(45deg, #f8fafc 25%, #f1f5f9 25%, #f1f5f9 50%, #f8fafc 50%, #f8fafc 75%, #f1f5f9 75%, #f1f5f9 100%)" : undefined,
            backgroundSize: selectedStyle === "light" ? "20px 20px" : undefined,
            background: selectedStyle === "light" ? undefined : "#141520",
          }}>
          {loading ? (
            <div className="text-[13px] text-[#6b7280]">Chargement du score...</div>
          ) : (
            <BadgePreview style={activeStyle} score={score} />
          )}
        </div>

        {/* Style selector */}
        <div className="mb-5">
          <label className="block text-[13px] font-medium text-[#d1d5db] mb-2">Style du badge</label>
          <div className="flex flex-wrap gap-2">
            {BADGE_STYLES.map(style => (
              <button
                key={style.key}
                onClick={() => setSelectedStyle(style.key)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer font-[inherit] transition-all duration-150 border"
                style={{
                  background: selectedStyle === style.key ? "rgba(6,182,212,0.15)" : "transparent",
                  borderColor: selectedStyle === style.key ? "#06b6d4" : "#2a2d3a",
                  color: selectedStyle === style.key ? "#22d3ee" : "#9ca3af",
                }}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Score info */}
        <div className="px-4 py-3 bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-lg text-[12px] text-[#9ca3af] leading-relaxed">
          Le badge affiche dynamiquement votre score de conformité issu du dernier scan RGPD.
          {score > 0 ? (
            <span> Votre score actuel est de <span className="font-semibold text-[#22d3ee]">{score}%</span>.</span>
          ) : (
            <span> Lancez un scan RGPD depuis le Dashboard pour obtenir votre score.</span>
          )}
        </div>
      </div>

      {/* Embed code */}
      <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
        <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0 mb-4">Code d'intégration</h2>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#d1d5db] mb-2">Code HTML à copier</label>
          <div className="relative">
            <pre className="p-4 bg-[#141520] border border-[#2a2d3a] rounded-lg text-[12px] text-[#d1d5db] font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed m-0">
              {EMBED_CODE}
            </pre>
            <button
              onClick={() => handleCopy(EMBED_CODE, "embed")}
              className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[rgba(6,182,212,0.2)] bg-[#1e2029] text-[#06b6d4] text-[11px] font-medium cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.08)]"
            >
              {copied === "embed" ? <CheckIcon size={12} color="#22c55e" /> : <CopyIcon size={12} color="#06b6d4" />}
              {copied === "embed" ? "Copié !" : "Copier"}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#d1d5db] mb-2">URL du badge</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={BADGE_URL}
              readOnly
              className="flex-1 px-3.5 py-2.5 bg-[#141520] border border-[#2a2d3a] rounded-lg text-[#e4e4e7] text-sm font-mono outline-none"
            />
            <button
              onClick={() => handleCopy(BADGE_URL, "url")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[rgba(6,182,212,0.2)] bg-transparent text-[#06b6d4] text-[13px] font-medium cursor-pointer font-[inherit] transition-all duration-150 hover:bg-[rgba(6,182,212,0.08)]"
            >
              {copied === "url" ? <CheckIcon size={14} color="#22c55e" /> : <CopyIcon size={14} color="#06b6d4" />}
              {copied === "url" ? "Copié !" : "Copier l'URL"}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#1e2029] border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0 mb-4">Comment ajouter le badge à votre site</h2>

        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[rgba(6,182,212,0.15)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center shrink-0 text-[13px] font-semibold text-[#22d3ee]">1</div>
            <div>
              <div className="text-[13px] font-medium text-[#f0f0f3]">Copiez le code d'intégration</div>
              <div className="text-[12px] text-[#6b7280] mt-0.5">Cliquez sur le bouton "Copier" ci-dessus pour copier le code HTML.</div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[rgba(6,182,212,0.15)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center shrink-0 text-[13px] font-semibold text-[#22d3ee]">2</div>
            <div>
              <div className="text-[13px] font-medium text-[#f0f0f3]">Collez dans votre site</div>
              <div className="text-[12px] text-[#6b7280] mt-0.5">
                Ajoutez le code dans le pied de page de votre site web (footer), dans votre page de mentions légales, ou à tout autre endroit visible.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[rgba(6,182,212,0.15)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center shrink-0 text-[13px] font-semibold text-[#22d3ee]">3</div>
            <div>
              <div className="text-[13px] font-medium text-[#f0f0f3]">Maintenez votre conformité</div>
              <div className="text-[12px] text-[#6b7280] mt-0.5">
                Le badge reflète votre dernier score de conformité. Lancez des scans réguliers pour maintenir un score élevé et rassurer vos visiteurs.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 px-4 py-2.5 bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.2)] rounded-md text-[12px] text-[#fbbf24] leading-relaxed">
          Le badge est un gage de transparence envers vos utilisateurs. Il ne constitue pas une certification juridique officielle.
        </div>
      </div>
    </div>
  );
}
