import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";
import SubNav from "../components/SubNav";

/* ─── Demo data ──────────────────────────────────────────────── */
const DEFAULT_ALERTS = [];

/* ─── Severity config ────────────────────────────────────────── */
const SEVERITY = {
  critical: { label: "CRITIQUE", color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)" },
  warning:  { label: "ATTENTION", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
  info:     { label: "INFO", color: "#06b6d4", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.25)" },
};

const FILTER_TABS = [
  { key: "all", label: "Toutes" },
  { key: "critical", label: "Critiques" },
  { key: "warning", label: "Attention" },
  { key: "info", label: "Info" },
];

const CARD_BG = "#E8E9EC";
const CARD_BORDER = "#E2E8F0";
const LS_KEY = "vault_alerts";
const LS_RESOLVED = "vault_alerts_resolved_count";

/* ─── SVG Icons ──────────────────────────────────────────────── */
const ShieldIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BellIcon = ({ size = 18, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckIcon = ({ size = 14, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = ({ size = 14, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────── */
function formatCountdown(deadline) {
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return { text: "Expiré", urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { text: `${days}j ${hours}h`, urgent: days < 7 };
  return { text: `${hours}h`, urgent: true };
}

function formatDate(d) {
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 3600000) return `Il y a ${Math.max(1, Math.floor(diff / 60000))} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function loadAlerts() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_ALERTS;
}

function saveAlerts(alerts) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(alerts)); } catch { /* ignore */ }
}

function loadResolved() {
  try { return parseInt(localStorage.getItem(LS_RESOLVED) || "0", 10) || 0; } catch { return 0; }
}

function saveResolved(n) {
  try { localStorage.setItem(LS_RESOLVED, String(n)); } catch { /* ignore */ }
}

/* ─── Keyframes (injected once) ──────────────────────────────── */
const KEYFRAMES = `
@keyframes vaultPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(239,68,68,0); }
}
@keyframes vaultPulseWarning {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(245,158,11,0); }
}
@keyframes vaultPulseCyan {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(6,182,212,0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(6,182,212,0); }
}
@keyframes vaultSpin {
  to { transform: rotate(360deg); }
}
@keyframes vaultFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const PULSE_ANIM = {
  critical: "vaultPulse 1.5s ease-in-out infinite",
  warning: "vaultPulseWarning 1.5s ease-in-out infinite",
  info: "vaultPulseCyan 1.5s ease-in-out infinite",
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function VaultAlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(() => loadAlerts());
  const [filter, setFilter] = useState("all");
  const [mailbox, setMailbox] = useState("inbox"); // "inbox" or "treated"
  const [dismissing, setDismissing] = useState(new Set());
  const [resolvedCount, setResolvedCount] = useState(() => loadResolved());
  const [, setTick] = useState(0);
  const timersRef = useRef({});

  // Inject keyframes once
  useEffect(() => {
    if (!document.getElementById("vault-alerts-keyframes")) {
      const style = document.createElement("style");
      style.id = "vault-alerts-keyframes";
      style.textContent = KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => { saveAlerts(alerts); }, [alerts]);

  // Save resolved count
  useEffect(() => { saveResolved(resolvedCount); }, [resolvedCount]);

  // Live countdown ticker — every 60s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  /* ── Actions ──────────────────────────────────────────────── */
  const handleTraiter = (id) => {
    // Step 1: green border + checkmark overlay
    setDismissing((prev) => new Set(prev).add(id));

    // Step 2: after 1.5s, mark as treated and move to "Traitées" tab
    timersRef.current[id] = setTimeout(() => {
      setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, treated: true, treatedAt: new Date().toISOString() } : a));
      setDismissing((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setResolvedCount((c) => c + 1);
      delete timersRef.current[id];
    }, 1500);
  };

  const handleUntreat = (id) => {
    setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, treated: false, treatedAt: null } : a));
    setResolvedCount((c) => Math.max(0, c - 1));
  };

  const handleAction = (url) => {
    if (!url) return;
    if (url.startsWith("/")) navigate(url);
    else window.open(url, "_blank");
  };

  /* ── Derived ──────────────────────────────────────────────── */
  const inboxAlerts = alerts.filter((a) => !a.treated);
  const treatedAlerts = alerts.filter((a) => a.treated);
  const unreadCount = inboxAlerts.length;
  const currentAlerts = mailbox === "inbox" ? inboxAlerts : treatedAlerts;
  const filtered = filter === "all" ? currentAlerts : currentAlerts.filter((a) => a.severity === filter);
  const stats = {
    total: inboxAlerts.length,
    critical: inboxAlerts.filter((a) => a.severity === "critical").length,
    warning: inboxAlerts.filter((a) => a.severity === "warning").length,
    resolved: treatedAlerts.length,
  };

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="max-w-[1100px]">
      <SubNav color={ACCENT} items={VAULT_NAV} />

      {/* Gradient bar */}
      <div style={{ width: 40, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${ACCENT}, #22d3ee)`, marginBottom: 16 }} />

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{ background: "rgba(6,182,212,0.1)", borderRadius: 12, padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldIcon size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 10 }}>
            Alertes intelligentes
            {unreadCount > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: "#fff", background: "#ef4444",
                borderRadius: 10, padding: "2px 8px", minWidth: 20, textAlign: "center",
                lineHeight: "18px", display: "inline-block",
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0 0" }}>Surveillance automatisée de votre conformité</p>
        </div>
      </div>

      {/* ── Mailbox tabs (Inbox / Traitées) ──────────────────── */}
      <div style={{ display: "flex", gap: 0, margin: "16px 0 0", borderBottom: "1px solid #E2E8F0" }}>
        {[
          { key: "inbox", label: "Boîte de réception", count: inboxAlerts.length },
          { key: "treated", label: "Traitées", count: treatedAlerts.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setMailbox(tab.key); setFilter("all"); }}
            style={{
              fontSize: 13, fontWeight: mailbox === tab.key ? 600 : 400, padding: "10px 20px",
              cursor: "pointer", border: "none", background: "transparent",
              color: mailbox === tab.key ? ACCENT : "#64748b",
              borderBottom: mailbox === tab.key ? `2px solid ${ACCENT}` : "2px solid transparent",
              transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {tab.label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10,
              background: mailbox === tab.key ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.05)",
              color: mailbox === tab.key ? ACCENT : "#64748b",
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Stats bar ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, margin: "20px 0 18px" }}>
        {[
          { label: "Total alertes", value: stats.total, color: ACCENT },
          { label: "Critiques", value: stats.critical, color: "#ef4444" },
          { label: "Attention", value: stats.warning, color: "#f59e0b" },
          { label: "Résolues ce mois", value: stats.resolved, color: "#22c55e" },
        ].map((s) => (
          <div key={s.label} style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 10,
            padding: "14px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              fontSize: 12, fontWeight: 600, padding: "6px 16px", borderRadius: 8, cursor: "pointer",
              border: "1px solid",
              background: filter === t.key ? "rgba(6,182,212,0.12)" : "transparent",
              color: filter === t.key ? ACCENT : "#64748b",
              borderColor: filter === t.key ? "rgba(6,182,212,0.3)" : "#E2E8F0",
              transition: "all 0.15s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Alert cards ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px", background: CARD_BG,
          borderRadius: 12, border: `1px solid ${CARD_BORDER}`,
        }}>
          <div style={{
            background: "rgba(34,197,94,0.08)", width: 56, height: 56, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <CheckIcon size={24} color="#22c55e" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
            {mailbox === "treated" ? "Aucune alerte traitée" : "Aucune alerte"}
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {mailbox === "treated" ? "Les alertes que vous traitez apparaîtront ici" : "Votre conformité est sous contrôle"}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((alert) => {
            const sev = SEVERITY[alert.severity] || SEVERITY.info;
            const isDismissing = dismissing.has(alert._id);
            const isSliding = false;
            const countdown = alert.deadline ? formatCountdown(alert.deadline) : null;

            return (
              <div
                key={alert._id}
                style={{
                  background: isDismissing ? "rgba(34,197,94,0.05)" : alert.treated ? "rgba(34,197,94,0.02)" : CARD_BG,
                  border: `1px solid ${isDismissing ? "#22c55e" : alert.treated ? "rgba(34,197,94,0.2)" : sev.border}`,
                  borderLeft: alert.treated && !isDismissing ? "3px solid #22c55e" : undefined,
                  borderRadius: 12,
                  padding: isSliding ? "0 18px" : "16px 18px",
                  position: "relative",
                  transition: "all 0.5s ease",
                  boxShadow: isDismissing
                    ? "0 0 20px rgba(34,197,94,0.15)"
                    : (!alert.read && alert.severity === "critical" ? "0 0 20px rgba(239,68,68,0.08)" : "none"),
                  opacity: isSliding ? 0 : (alert.read && !isDismissing ? 0.6 : 1),
                  maxHeight: isSliding ? 0 : 500,
                  marginBottom: isSliding ? 0 : undefined,
                  overflow: isSliding ? "hidden" : "visible",
                  animation: !isDismissing && !isSliding ? "vaultFadeIn 0.3s ease" : undefined,
                }}
              >
                {/* ── Dismiss overlay ── */}
                {isDismissing && !isSliding && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(34,197,94,0.08)", zIndex: 10,
                    transition: "opacity 0.3s ease", opacity: 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", background: "rgba(34,197,94,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckIcon size={20} color="#22c55e" />
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#22c55e", letterSpacing: "-0.01em" }}>
                        Traitée ✓
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Unread pulsing dot ── */}
                {!alert.read && !isDismissing && (
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    transition: "opacity 0.3s ease",
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", background: sev.color,
                      animation: PULSE_ANIM[alert.severity] || PULSE_ANIM.info,
                    }} />
                  </div>
                )}

                {/* ── Top row: severity + timestamp ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                    color: sev.color, background: sev.bg, border: `1px solid ${sev.border}`,
                    borderRadius: 6, padding: "3px 10px",
                  }}>
                    {sev.label}
                  </span>
                  <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                    <ClockIcon size={11} color="#475569" /> {formatDate(alert.createdAt)}
                  </span>
                </div>

                {/* ── Title ── */}
                <div style={{
                  fontSize: 14, fontWeight: 600, marginBottom: 4,
                  color: alert.read ? "#94a3b8" : "#e2e8f0",
                }}>
                  {alert.title}
                </div>

                {/* ── Message ── */}
                <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5, marginBottom: 10 }}>
                  {alert.message}
                </div>

                {/* ── Countdown badge ── */}
                {countdown && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 11, fontWeight: 600,
                    color: countdown.urgent ? "#ef4444" : "#f59e0b",
                    background: countdown.urgent ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                    borderRadius: 6, padding: "4px 10px", marginBottom: 10,
                  }}>
                    <ClockIcon size={11} color={countdown.urgent ? "#ef4444" : "#f59e0b"} />
                    {countdown.text} restants
                  </div>
                )}

                {/* ── Action buttons ── */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {/* Primary action */}
                  {alert.actionLabel && (
                    <button
                      onClick={() => handleAction(alert.actionUrl)}
                      style={{
                        fontSize: 12, fontWeight: 600, color: "#fff",
                        background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`,
                        border: "none", borderRadius: 8, padding: "7px 16px",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                        transition: "opacity 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      {alert.actionLabel}
                    </button>
                  )}

                  {/* Traiter (inbox) or Restaurer (treated) */}
                  {!isDismissing && mailbox === "inbox" && (
                    <button
                      onClick={() => handleTraiter(alert._id)}
                      style={{
                        fontSize: 12, fontWeight: 500, color: "#64748b",
                        background: "transparent",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#22c55e";
                        e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)";
                        e.currentTarget.style.background = "rgba(34,197,94,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#64748b";
                        e.currentTarget.style.borderColor = "#E2E8F0";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Traiter
                    </button>
                  )}
                  {mailbox === "treated" && (
                    <button
                      onClick={() => handleUntreat(alert._id)}
                      style={{
                        fontSize: 12, fontWeight: 500, color: "#64748b",
                        background: "transparent",
                        border: "1px solid #E2E8F0",
                        borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#f59e0b";
                        e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                        e.currentTarget.style.background = "rgba(245,158,11,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#64748b";
                        e.currentTarget.style.borderColor = "#E2E8F0";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Restaurer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
