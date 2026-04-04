import { useState } from "react";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";
import SubNav from "../components/SubNav";

const DROIT_TYPES = {
  acces: { label: "Droit d\u2019acc\u00e8s", color: "#06b6d4" },
  rectification: { label: "Rectification", color: "#f59e0b" },
  suppression: { label: "Suppression", color: "#ef4444" },
  portabilite: { label: "Portabilit\u00e9", color: "#8b5cf6" },
  opposition: { label: "Opposition", color: "#f97316" },
};

const STATUS_CONFIG = {
  recue: { label: "Re\u00e7ue", color: "#6b7280" },
  en_cours: { label: "En cours", color: "#06b6d4" },
  traitee: { label: "Trait\u00e9e", color: "#22c55e" },
  refusee: { label: "Refus\u00e9e", color: "#ef4444" },
};

const DEMO_DSARS = [
  { id: "d1", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), demandeur: "J. Dupont", type: "acces", status: "en_cours", receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "d2", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), demandeur: "M. Martin", type: "suppression", status: "en_cours", receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "d3", date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), demandeur: "S. Bernard", type: "portabilite", status: "en_cours", receivedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "d4", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), demandeur: "L. Petit", type: "rectification", status: "traitee", receivedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "d5", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), demandeur: "A. Moreau", type: "opposition", status: "recue", receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const CARD_BG = "#1e2029";
const CARD_BORDER = "rgba(255,255,255,0.06)";
const DEADLINE_DAYS = 30;

const FILTER_TABS = [
  { key: "all", label: "Toutes" },
  { key: "en_cours", label: "En cours" },
  { key: "traitee", label: "Trait\u00e9es" },
  { key: "en_retard", label: "En retard" },
];

/* Icons */

const UserShieldIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </svg>
);

const ClockIcon = ({ size = 14, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = ({ size = 14, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon = ({ size = 14, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

/* Helpers */

function formatDateFR(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function getDaysRemaining(receivedAt) {
  const elapsed = Math.floor((Date.now() - new Date(receivedAt).getTime()) / 86400000);
  return DEADLINE_DAYS - elapsed;
}

function getCountdownColor(daysLeft) {
  if (daysLeft < 0) return "#ef4444";
  if (daysLeft < 10) return "#ef4444";
  if (daysLeft <= 20) return "#f59e0b";
  return "#22c55e";
}

function getCountdownLabel(daysLeft) {
  if (daysLeft < 0) return "D\u00e9pass\u00e9 (" + Math.abs(daysLeft) + "j)";
  return daysLeft + "j restants";
}

/* Component */

export default function VaultDroitsPage() {
  const [dsars] = useState(DEMO_DSARS);
  const [filter, setFilter] = useState("all");

  const filtered = (() => {
    switch (filter) {
      case "en_cours":
        return dsars.filter((d) => d.status === "en_cours");
      case "traitee":
        return dsars.filter((d) => d.status === "traitee");
      case "en_retard":
        return dsars.filter((d) => d.status !== "traitee" && d.status !== "refusee" && getDaysRemaining(d.receivedAt) < 0);
      default:
        return dsars;
    }
  })();

  const stats = {
    total: dsars.length,
    enCours: dsars.filter((d) => d.status === "en_cours").length,
    traitees: dsars.filter((d) => d.status === "traitee").length,
  };

  const gradientBg = "linear-gradient(90deg, " + ACCENT + ", #22d3ee)";
  const gradientBtn = "linear-gradient(135deg, " + ACCENT + ", #0891b2)";

  return (
    <div className="max-w-[1100px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{ background: "rgba(6,182,212,0.1)", borderRadius: 12, padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <UserShieldIcon size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>Droits des personnes</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0 0" }}>G&eacute;rez les demandes d&#39;exercice de droits RGPD (Articles 15-22)</p>
        </div>
      </div>

      {/* Gradient bar */}
      <div style={{ width: 40, height: 3, borderRadius: 2, background: gradientBg, marginBottom: 16 }} />

      {/* Info banner */}
      <div style={{
        background: "rgba(6,182,212,0.06)",
        border: "1px solid rgba(6,182,212,0.18)",
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 18,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <InfoIcon size={16} color={ACCENT} />
        <span style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>
          <strong style={{ color: "#e2e8f0" }}>D&eacute;lai l&eacute;gal de r&eacute;ponse : 30 jours</strong> (RGPD Art. 12). Les demandes en retard sont signal&eacute;es automatiquement.
        </span>
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
        {[
          { label: "Total demandes", value: stats.total, color: ACCENT },
          { label: "En cours", value: stats.enCours, color: "#06b6d4" },
          { label: "Trait\u00e9es", value: stats.traitees, color: "#22c55e" },
          { label: "D\u00e9lai moyen", value: "8 jours", color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} style={{ background: CARD_BG, border: "1px solid " + CARD_BORDER, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {FILTER_TABS.map((t) => {
          const isActive = filter === t.key;
          const enRetardCount = t.key === "en_retard"
            ? dsars.filter((d) => d.status !== "traitee" && d.status !== "refusee" && getDaysRemaining(d.receivedAt) < 0).length
            : 0;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                fontSize: 12, fontWeight: 600, padding: "6px 16px", borderRadius: 8, cursor: "pointer", border: "1px solid",
                background: isActive ? "rgba(6,182,212,0.12)" : "transparent",
                color: isActive ? ACCENT : "#64748b",
                borderColor: isActive ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.06)",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
              {t.key === "en_retard" && enRetardCount > 0 && (
                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: 6, padding: "2px 6px" }}>{enRetardCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: CARD_BG, borderRadius: 12, border: "1px solid " + CARD_BORDER }}>
          <div style={{ background: "rgba(34,197,94,0.08)", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckIcon size={24} color="#22c55e" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>Aucune demande</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>Aucune demande ne correspond &agrave; ce filtre</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((dsar) => {
            const dtype = DROIT_TYPES[dsar.type] || DROIT_TYPES.acces;
            const sconf = STATUS_CONFIG[dsar.status] || STATUS_CONFIG.recue;
            const daysLeft = getDaysRemaining(dsar.receivedAt);
            const cdColor = getCountdownColor(daysLeft);
            const isOverdue = daysLeft < 0;
            const isActiveDsar = dsar.status !== "traitee" && dsar.status !== "refusee";

            return (
              <div
                key={dsar.id}
                style={{
                  background: CARD_BG,
                  border: "1px solid " + (isOverdue && isActiveDsar ? "rgba(239,68,68,0.25)" : CARD_BORDER),
                  borderRadius: 12,
                  padding: "16px 18px",
                  position: "relative",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: isOverdue && isActiveDsar ? "0 0 20px rgba(239,68,68,0.08)" : "none",
                }}
              >
                {/* Overdue pulse dot */}
                {isOverdue && isActiveDsar && (
                  <div style={{ position: "absolute", top: 16, right: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "vaultDroitPulse 1.5s ease-in-out infinite" }} />
                    <style>{"@keyframes vaultDroitPulse { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(239,68,68,0); } }"}</style>
                  </div>
                )}

                {/* Top row: date + badges */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                    <ClockIcon size={11} color="#475569" /> {formatDateFR(dsar.date)}
                  </span>

                  {/* Type badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                    color: dtype.color,
                    background: dtype.color + "14",
                    border: "1px solid " + dtype.color + "40",
                    borderRadius: 6, padding: "3px 10px",
                  }}>
                    {dtype.label}
                  </span>

                  {/* Status badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                    color: sconf.color,
                    background: sconf.color + "14",
                    border: "1px solid " + sconf.color + "40",
                    borderRadius: 6, padding: "3px 10px",
                  }}>
                    {sconf.label}
                  </span>
                </div>

                {/* Demandeur name */}
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
                  {dsar.demandeur}
                </div>

                {/* Countdown -- prominent */}
                {isActiveDsar && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 700,
                    color: cdColor,
                    background: cdColor + "14",
                    border: "1px solid " + cdColor + "30",
                    borderRadius: 8,
                    padding: "6px 14px",
                    marginBottom: 12,
                    animation: isOverdue ? "vaultDroitPulse 1.5s ease-in-out infinite" : "none",
                  }}>
                    <ClockIcon size={13} color={cdColor} />
                    {getCountdownLabel(daysLeft)}
                  </div>
                )}

                {dsar.status === "traitee" && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 12, fontWeight: 600, color: "#22c55e",
                    background: "rgba(34,197,94,0.08)",
                    borderRadius: 6, padding: "4px 10px",
                    marginBottom: 12,
                  }}>
                    <CheckIcon size={12} color="#22c55e" /> Demande trait&eacute;e
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {isActiveDsar && (
                    <button style={{
                      fontSize: 12, fontWeight: 600, color: "#fff",
                      background: gradientBtn,
                      border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer",
                    }}>
                      Traiter
                    </button>
                  )}
                  <button style={{
                    fontSize: 12, fontWeight: 500, color: "#94a3b8",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                  }}>
                    D&eacute;tails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
