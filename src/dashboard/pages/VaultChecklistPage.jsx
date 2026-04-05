import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import SubNav from "../components/SubNav";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";

const ChecklistIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const CHECKLIST_DATA = [
  {
    category: "RGPD",
    color: "#06b6d4",
    items: [
      { id: "rgpd-1", label: "Mentions légales présentes", tooltip: "Obligatoire pour tout site web professionnel selon la LCEN. Doit contenir l'identité de l'éditeur, le directeur de publication et l'hébergeur." },
      { id: "rgpd-2", label: "Politique de confidentialité", tooltip: "Document obligatoire décrivant comment vous collectez, utilisez et protégez les données personnelles de vos utilisateurs (RGPD Art. 13-14)." },
      { id: "rgpd-3", label: "Bandeau cookies conforme", tooltip: "Le bandeau doit permettre d'accepter ou refuser les cookies, avec un bouton de refus aussi visible que celui d'acceptation (CNIL)." },
      { id: "rgpd-4", label: "Formulaire de consentement", tooltip: "Tout formulaire collectant des données doit inclure une case de consentement non pré-cochée et un lien vers la politique de confidentialité." },
      { id: "rgpd-5", label: "Registre des traitements", tooltip: "Obligatoire pour les entreprises de plus de 250 salariés, et recommandé pour toutes. Recense toutes les activités de traitement de données." },
      { id: "rgpd-6", label: "DPO désigné ou justification", tooltip: "Un Délégué à la Protection des Données doit être désigné si vous traitez des données sensibles à grande échelle, ou justifier pourquoi ce n'est pas nécessaire." },
    ],
  },
  {
    category: "Site web",
    color: "#8b5cf6",
    items: [
      { id: "web-1", label: "CGV accessibles", tooltip: "Les Conditions Générales de Vente doivent être facilement accessibles depuis toutes les pages du site, généralement dans le pied de page." },
      { id: "web-2", label: "Conditions d'utilisation", tooltip: "Document définissant les règles d'utilisation de votre site web. Protège juridiquement votre entreprise en cas de litige." },
      { id: "web-3", label: "Formulaire de contact fonctionnel", tooltip: "Un moyen de contact doit être facilement accessible pour permettre aux utilisateurs d'exercer leurs droits." },
      { id: "web-4", label: "Page \"Qui sommes-nous\"", tooltip: "Renforce la confiance et la transparence. Recommandée pour la conformité et le référencement." },
      { id: "web-5", label: "Hébergeur mentionné", tooltip: "L'identité de l'hébergeur (raison sociale, adresse, numéro de téléphone) doit figurer dans les mentions légales." },
    ],
  },
  {
    category: "E-commerce",
    color: "#f59e0b",
    items: [
      { id: "ecom-1", label: "Droit de rétractation mentionné", tooltip: "Le consommateur dispose de 14 jours pour se rétracter. Cette information doit être clairement affichée avant et après l'achat." },
      { id: "ecom-2", label: "Processus de réclamation", tooltip: "Un processus clair de réclamation et de médiation doit être accessible aux consommateurs en cas de litige." },
      { id: "ecom-3", label: "Moyens de paiement sécurisés", tooltip: "Les moyens de paiement doivent être sécurisés (HTTPS, 3D Secure) et clairement indiqués avant la transaction." },
      { id: "ecom-4", label: "Livraison et retours détaillés", tooltip: "Les conditions de livraison (délais, coûts) et de retour doivent être clairement indiquées dans les CGV." },
      { id: "ecom-5", label: "Factures conformes", tooltip: "Les factures doivent contenir toutes les mentions obligatoires : numéro, date, identité des parties, TVA, etc." },
    ],
  },
  {
    category: "Sécurité",
    color: "#22c55e",
    items: [
      { id: "secu-1", label: "HTTPS actif", tooltip: "Le certificat SSL/TLS est indispensable pour sécuriser les échanges de données entre le navigateur et le serveur." },
      { id: "secu-2", label: "Mots de passe sécurisés", tooltip: "Les mots de passe doivent être stockés de manière chiffrée (bcrypt, argon2) et une politique de complexité doit être appliquée." },
      { id: "secu-3", label: "Sauvegardes régulières", tooltip: "Des sauvegardes automatiques et régulières doivent être mises en place pour prévenir la perte de données." },
      { id: "secu-4", label: "Mises à jour logicielles", tooltip: "Le CMS, les plugins et les dépendances doivent être régulièrement mis à jour pour corriger les failles de sécurité." },
    ],
  },
];

const TOTAL_ITEMS = CHECKLIST_DATA.reduce((acc, cat) => acc + cat.items.length, 0);

export default function VaultChecklistPage() {
  const { get, post } = useApi();
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tooltipId, setTooltipId] = useState(null);

  const fetchChecklist = useCallback(async () => {
    try {
      const data = await get("/api/vault/checklist");
      if (data && data.items) {
        setCheckedItems(data.items);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const toggleItem = async (itemId) => {
    const updated = { ...checkedItems, [itemId]: !checkedItems[itemId] };
    setCheckedItems(updated);

    setSaving(true);
    try {
      await post("/api/vault/checklist", { items: updated });
    } catch {
      // revert on error
      setCheckedItems(checkedItems);
    } finally {
      setSaving(false);
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const percentage = TOTAL_ITEMS > 0 ? Math.round((completedCount / TOTAL_ITEMS) * 100) : 0;

  const getScoreColor = () => {
    if (percentage >= 80) return "#22c55e";
    if (percentage >= 60) return "#eab308";
    if (percentage >= 40) return "#f97316";
    return "#ef4444";
  };

  const scoreColor = getScoreColor();

  return (
    <div className="max-w-[1100px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <ChecklistIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#0A2540] m-0">
            Checklist de conformité
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Les 20 obligations légales de votre site web
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-6 mt-4" />

      {/* Score card */}
      <div className="bg-white border border-[rgba(6,182,212,0.2)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] mb-7">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Progress bar */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#9ca3af]">Progression globale</span>
              <span className="text-[13px] font-semibold" style={{ color: scoreColor }}>
                {completedCount}/{TOTAL_ITEMS} ({percentage}%)
              </span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#E3E8EE]">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-[#6b7280]">
                {saving ? "Sauvegarde..." : loading ? "Chargement..." : "Auto-sauvegardé"}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{
                color: scoreColor,
                background: `${scoreColor}15`,
                border: `1px solid ${scoreColor}30`,
              }}>
                {percentage >= 80 ? "Excellent" : percentage >= 60 ? "Correct" : percentage >= 40 ? "Insuffisant" : "Critique"}
              </span>
            </div>
          </div>

          {/* Score circle */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#E3E8EE" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - percentage / 100)}`}
                  className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: scoreColor }}>{percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {CHECKLIST_DATA.map(cat => {
        const catCompleted = cat.items.filter(item => checkedItems[item.id]).length;
        return (
          <div key={cat.category} className="mb-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
              <h2 className="text-[15px] font-semibold text-[#0A2540] m-0">{cat.category}</h2>
              <span className="text-[12px] text-[#6b7280] ml-auto">{catCompleted}/{cat.items.length}</span>
            </div>

            <div className="flex flex-col gap-2">
              {cat.items.map(item => {
                const checked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-white border rounded-lg px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.15)] flex items-start gap-3 transition-all duration-150"
                    style={{
                      borderColor: checked ? `${cat.color}40` : "rgba(42,45,58,0.8)",
                      background: checked ? `${cat.color}08` : "#FFFFFF",
                    }}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 transition-all duration-150"
                      style={{
                        borderColor: checked ? cat.color : "#8898AA",
                        background: checked ? cat.color : "transparent",
                      }}
                    >
                      {checked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f0f11" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-medium transition-all duration-150 ${checked ? "text-[#9ca3af] line-through" : "text-[#0A2540]"}`}>
                          {item.label}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setTooltipId(tooltipId === item.id ? null : item.id)}
                            className="w-4 h-4 rounded-full bg-[rgba(107,114,128,0.2)] flex items-center justify-center cursor-pointer border-none text-[10px] text-[#6b7280] hover:bg-[rgba(107,114,128,0.3)] hover:text-[#9ca3af] transition-all duration-150"
                          >
                            ?
                          </button>
                          {tooltipId === item.id && (
                            <div className="absolute left-6 top-0 z-50 w-[280px] p-3 bg-[#1a1b26] border border-[#E3E8EE] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-[12px] text-[#d1d5db] leading-relaxed">
                              {item.tooltip}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
