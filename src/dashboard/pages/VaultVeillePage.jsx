import { useState } from "react";
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

const BellIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const ExternalLinkIcon = ({ size = 13, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const CATEGORIES = [
  { key: "all", label: "Toutes", color: "#6b7280" },
  { key: "rgpd", label: "RGPD", color: "#06b6d4" },
  { key: "commercial", label: "Droit commercial", color: "#8b5cf6" },
  { key: "ecommerce", label: "E-commerce", color: "#f59e0b" },
  { key: "travail", label: "Droit du travail", color: "#22c55e" },
  { key: "fiscalite", label: "Fiscalité", color: "#ef4444" },
];

const IMPACT_CONFIG = {
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  attention: { label: "Attention", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  info: { label: "Info", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)" },
};

const SAMPLE_ALERTS = [
  {
    id: "v1",
    date: "2026-03-25",
    title: "Nouvelles obligations RGPD pour les sous-traitants",
    category: "rgpd",
    summary: "Les sous-traitants doivent désormais documenter toutes les instructions reçues du responsable de traitement et effectuer une analyse d'impact systématique pour les traitements à risque.",
    impact: "urgent",
    link: "https://www.cnil.fr",
    read: false,
  },
  {
    id: "v2",
    date: "2026-03-20",
    title: "Renforcement des sanctions CNIL pour non-conformité cookies",
    category: "rgpd",
    summary: "La CNIL intensifie ses contrôles sur les bannières cookies. Les amendes peuvent désormais atteindre 2% du chiffre d'affaires pour les sites ne respectant pas le consentement préalable.",
    impact: "urgent",
    link: "https://www.cnil.fr",
    read: false,
  },
  {
    id: "v3",
    date: "2026-03-15",
    title: "DMA : nouvelles obligations pour les marketplaces",
    category: "ecommerce",
    summary: "Le Digital Markets Act impose de nouvelles règles de transparence pour les places de marché en ligne, notamment sur le classement des offres et l'accès aux données des vendeurs.",
    impact: "attention",
    link: "https://eur-lex.europa.eu",
    read: false,
  },
  {
    id: "v4",
    date: "2026-02-18",
    title: "Évolution du droit de rétractation en e-commerce",
    category: "ecommerce",
    summary: "Le délai de rétractation reste de 14 jours mais les modalités de remboursement sont précisées : le remboursement doit désormais intervenir sous 7 jours ouvrés après réception du retour.",
    impact: "attention",
    link: "https://www.legifrance.gouv.fr",
    read: false,
  },
  {
    id: "v5",
    date: "2026-01-28",
    title: "Mise à jour des mentions obligatoires sur les factures",
    category: "fiscalite",
    summary: "De nouvelles mentions sont obligatoires sur les factures depuis le 1er janvier 2026 : numéro SIREN du client, adresse de livraison si différente de la facturation, et référence de la commande.",
    impact: "attention",
    link: "https://www.economie.gouv.fr",
    read: false,
  },
  {
    id: "v6",
    date: "2026-01-15",
    title: "Obligation de médiation de la consommation étendue",
    category: "commercial",
    summary: "Tous les professionnels vendant aux consommateurs doivent désormais afficher les coordonnées d'un médiateur de la consommation sur leur site web et dans leurs CGV.",
    impact: "info",
    link: "https://www.economie.gouv.fr",
    read: false,
  },
  {
    id: "v7",
    date: "2026-09-01",
    title: "Nouvelles règles de facturation électronique",
    category: "fiscalite",
    summary: "À compter de septembre 2026, toutes les entreprises assujetties à la TVA devront être en mesure de recevoir des factures électroniques. L'obligation d'émission sera progressive selon la taille de l'entreprise.",
    impact: "attention",
    link: "https://www.impots.gouv.fr",
    read: false,
  },
  {
    id: "v8",
    date: "2025-06-28",
    title: "Accessibilité numérique obligatoire pour les PME",
    category: "commercial",
    summary: "Les PME de plus de 10 salariés doivent rendre leurs sites web conformes au RGAA (Référentiel Général d'Amélioration de l'Accessibilité) avant fin 2025.",
    impact: "info",
    link: "https://www.numerique.gouv.fr",
    read: true,
  },
];

export default function VaultVeillePage() {
  const [alerts, setAlerts] = useState(SAMPLE_ALERTS);
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredAlerts = activeCategory === "all"
    ? alerts
    : alerts.filter(a => a.category === activeCategory);

  const unreadCount = alerts.filter(a => !a.read).length;

  const toggleRead = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: !a.read } : a));
  };

  const getCategoryInfo = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // Unread first, then by date descending
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="max-w-[860px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="relative w-11 h-11 rounded-[10px] bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center">
          <BellIcon size={24} color={ACCENT} />
          {unreadCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center text-[10px] font-bold text-white">
              {unreadCount}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">
            Veille juridique
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Actualités et évolutions juridiques pour votre entreprise
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-6 mt-4" />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer font-[inherit] transition-all duration-150 border"
            style={{
              background: activeCategory === cat.key ? `${cat.color}20` : "transparent",
              borderColor: activeCategory === cat.key ? cat.color : "#2a2d3a",
              color: activeCategory === cat.key ? cat.color : "#6b7280",
            }}
          >
            {cat.label}
            {cat.key !== "all" && (
              <span className="ml-1.5 text-[11px] opacity-60">
                {alerts.filter(a => a.category === cat.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts count */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] text-[#6b7280]">
          {sortedAlerts.length} alerte{sortedAlerts.length !== 1 ? "s" : ""}
          {unreadCount > 0 && activeCategory === "all" && (
            <span className="ml-1.5 text-[#ef4444]">({unreadCount} non lue{unreadCount !== 1 ? "s" : ""})</span>
          )}
        </div>
      </div>

      {/* Alerts list */}
      {sortedAlerts.length === 0 ? (
        <div className="bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.15)] rounded-[10px] px-6 py-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center">
          <BellIcon size={48} color={ACCENT} />
          <div className="text-base font-semibold text-[#f0f0f3] mt-4 mb-2">
            Aucune alerte dans cette catégorie
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedAlerts.map(alert => {
            const catInfo = getCategoryInfo(alert.category);
            const impactInfo = IMPACT_CONFIG[alert.impact] || IMPACT_CONFIG.info;

            return (
              <div
                key={alert.id}
                className="bg-[#1e2029] border rounded-[10px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-150"
                style={{
                  borderColor: alert.read ? "rgba(42,45,58,0.8)" : `${impactInfo.color}30`,
                  opacity: alert.read ? 0.7 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Unread indicator */}
                  <div className="mt-1.5 shrink-0">
                    {!alert.read && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: impactInfo.color }} />
                    )}
                    {alert.read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2a2d3a]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] text-[#6b7280]">
                        {new Date(alert.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{
                        color: catInfo.color, background: `${catInfo.color}15`, border: `1px solid ${catInfo.color}30`,
                      }}>
                        {catInfo.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{
                        color: impactInfo.color, background: impactInfo.bg, border: `1px solid ${impactInfo.border}`,
                      }}>
                        {impactInfo.label}
                      </span>
                    </div>

                    {/* Title */}
                    <div className={`text-[14px] font-semibold mb-2 ${alert.read ? "text-[#9ca3af]" : "text-[#f0f0f3]"}`}>
                      {alert.title}
                    </div>

                    {/* Summary */}
                    <div className="text-[13px] text-[#9ca3af] leading-relaxed mb-3">
                      {alert.summary}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={alert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium no-underline transition-colors duration-150 hover:opacity-80"
                        style={{ color: ACCENT }}
                      >
                        En savoir plus
                        <ExternalLinkIcon size={12} color={ACCENT} />
                      </a>
                      <button
                        onClick={() => toggleRead(alert.id)}
                        className="text-[12px] text-[#6b7280] bg-transparent border-none cursor-pointer font-[inherit] hover:text-[#9ca3af] transition-colors duration-150"
                      >
                        {alert.read ? "Marquer comme non lu" : "Marquer comme lu"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
