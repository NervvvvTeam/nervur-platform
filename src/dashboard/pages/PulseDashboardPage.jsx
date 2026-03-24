import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PULSE_NAV = [
  { path: "/app/pulse", label: "Moniteur", end: true },
  { path: "/app/pulse/history", label: "\u00c9volution" },
];

const ACCENT = "#ec4899";
const ACCENT_LIGHT = "#f472b6";
const BG_TINT = "rgba(236,72,153,0.06)";
const BORDER_TINT = "rgba(236,72,153,0.18)";

const cardStyle = {
  background: "#1e2029",
  border: "1px solid #2a2d3a",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

const HeartPulseIcon = ({ size = 22, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
    <path d="M12 6v4l2 2-2 2v4" />
  </svg>
);

const TrashIcon = ({ size = 16, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const RefreshIcon = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ShieldIcon = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BellIcon = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const GlobeIcon = ({ size = 16, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

function ScoreGauge({ score, size = 100 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2a2d3a" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={scoreColor}
          strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: size > 80 ? "24px" : "18px", fontWeight: 700, color: scoreColor }}>{score}</span>
        <span style={{ fontSize: "10px", color: "#6b7280" }}>/100</span>
      </div>
    </div>
  );
}

function StatusBadge({ ok, labelOk, labelFail }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 500,
      color: ok ? "#10b981" : "#ef4444",
      background: ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
      border: `1px solid ${ok ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
    }}>
      {ok ? "\u2705" : "\u274C"} {ok ? labelOk : labelFail}
    </span>
  );
}

function Chip({ label, color = "#9ca3af" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 500,
      color, background: `${color}15`, border: `1px solid ${color}30`,
    }}>
      {label}
    </span>
  );
}

function MiniResponseTimeChart({ history, width = 260, height = 60 }) {
  const points = (history || []).slice(-5);
  if (points.length < 2) return null;

  const times = points.map(p => p.responseTime || 0);
  const maxT = Math.max(...times, 1);
  const padding = { top: 4, bottom: 4, left: 4, right: 4 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (i) => padding.left + (i / (points.length - 1)) * chartW;
  const getY = (t) => padding.top + chartH - (t / maxT) * chartH;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.responseTime || 0)}`).join(" ");

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathD + ` L ${getX(points.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`} fill="url(#rtGrad)" />
      <path d={pathD} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={getX(i)} cy={getY(p.responseTime || 0)} r="3" fill={ACCENT} stroke="#1e2029" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function AlertsConfig({ site, onSave }) {
  const [email, setEmail] = useState(site.alertEmail || "");
  const [down, setDown] = useState(site.alerts?.down || false);
  const [sslExp, setSslExp] = useState(site.alerts?.sslExpiring || false);
  const [domainExp, setDomainExp] = useState(site.alerts?.domainExpiring || false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await onSave(site._id, {
      alertEmail: email,
      alerts: { down, sslExpiring: sslExp, domainExpiring: domainExp },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleStyle = (active) => ({
    width: "36px", height: "20px", borderRadius: "10px",
    background: active ? ACCENT : "#2a2d3a",
    border: "none", cursor: "pointer", position: "relative",
    transition: "background 0.2s", flexShrink: 0,
  });
  const toggleDot = (active) => ({
    position: "absolute", top: "2px", width: "16px", height: "16px", borderRadius: "50%",
    background: "#fff", transition: "left 0.2s",
    left: active ? "18px" : "2px",
  });

  return (
    <div style={{
      marginTop: "16px", padding: "16px", background: "#1e2029",
      border: "1px solid #2a2d3a", borderRadius: "8px", borderLeft: `3px solid ${ACCENT}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <BellIcon size={16} color={ACCENT} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#f0f0f3" }}>Configurer les alertes</span>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ fontSize: "12px", color: "#9ca3af", display: "block", marginBottom: "6px" }}>Email pour les alertes</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="votre@email.com"
          style={{
            width: "100%", padding: "8px 12px", background: "#141520",
            border: "1px solid #2a2d3a", borderRadius: "6px",
            color: "#f0f0f3", fontSize: "13px", fontFamily: "inherit",
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
        {[
          { label: "Site hors ligne (down)", active: down, toggle: () => setDown(!down) },
          { label: "Certificat SSL expire bientot", active: sslExp, toggle: () => setSslExp(!sslExp) },
          { label: "Domaine expire bientot", active: domainExp, toggle: () => setDomainExp(!domainExp) },
        ].map(({ label, active, toggle }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#d1d5db" }}>{label}</span>
            <button onClick={toggle} style={toggleStyle(active)}>
              <div style={toggleDot(active)} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "8px 20px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
          background: saved ? "rgba(16,185,129,0.15)" : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
          border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
          color: saved ? "#10b981" : "#fff",
          cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
          opacity: saving ? 0.5 : 1,
        }}
      >
        {saving ? "Enregistrement..." : saved ? "Enregistre !" : "Enregistrer les alertes"}
      </button>
    </div>
  );
}

function StatusPagePreview({ site, statusData, onClose }) {
  if (!statusData) return null;

  const statusColor = statusData.status === "operational" ? "#10b981" : "#ef4444";
  const statusLabel = statusData.status === "operational" ? "Operationnel" : "Hors ligne";

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
    }} onClick={onClose}>
      <div style={{
        width: "600px", maxHeight: "80vh", overflow: "auto",
        background: "#141520", borderRadius: "12px", border: "1px solid #2a2d3a",
        padding: "32px",
      }} onClick={e => e.stopPropagation()}>
        {/* Status page header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
            <GlobeIcon size={24} color={ACCENT} />
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f0f0f3", margin: 0 }}>
              {statusData.domain}
            </h2>
          </div>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>Page de statut publique</p>
        </div>

        {/* Big status indicator */}
        <div style={{
          textAlign: "center", padding: "24px", marginBottom: "24px",
          background: `${statusColor}10`, border: `1px solid ${statusColor}30`,
          borderRadius: "10px",
        }}>
          <div style={{
            width: "16px", height: "16px", borderRadius: "50%",
            background: statusColor, margin: "0 auto 12px",
            boxShadow: `0 0 12px ${statusColor}60`,
          }} />
          <div style={{ fontSize: "18px", fontWeight: 700, color: statusColor }}>{statusLabel}</div>
          <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "6px" }}>
            Disponibilite : {statusData.uptimePercentage}%
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <div style={{ padding: "16px", background: "#1e2029", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>Temps de reponse</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#f0f0f3" }}>
              {statusData.responseTime ? `${statusData.responseTime}ms` : "N/A"}
            </div>
          </div>
          <div style={{ padding: "16px", background: "#1e2029", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>Certificat SSL</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: statusData.ssl?.valid ? "#10b981" : "#ef4444" }}>
              {statusData.ssl?.valid ? `${statusData.ssl.daysLeft}j` : "Invalide"}
            </div>
          </div>
          <div style={{ padding: "16px", background: "#1e2029", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>Uptime</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: statusData.uptimePercentage >= 99 ? "#10b981" : "#f59e0b" }}>
              {statusData.uptimePercentage}%
            </div>
          </div>
        </div>

        {/* Recent history bar */}
        {statusData.recentHistory && statusData.recentHistory.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>Historique recent</div>
            <div style={{ display: "flex", gap: "3px" }}>
              {statusData.recentHistory.map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: "28px", borderRadius: "3px",
                  background: h.status === "up" ? "#10b981" : "#ef4444",
                  opacity: 0.7 + (i / statusData.recentHistory.length) * 0.3,
                  cursor: "default",
                }} title={`${new Date(h.checkedAt).toLocaleString("fr-FR")} — ${h.status === "up" ? "En ligne" : "Hors ligne"} — ${h.responseTime || "?"}ms`} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              <span style={{ fontSize: "10px", color: "#6b7280" }}>Ancien</span>
              <span style={{ fontSize: "10px", color: "#6b7280" }}>Recent</span>
            </div>
          </div>
        )}

        <div style={{ fontSize: "11px", color: "#6b7280", textAlign: "center" }}>
          Derniere verification : {statusData.lastChecked ? new Date(statusData.lastChecked).toLocaleString("fr-FR") : "N/A"}
        </div>

        <button
          onClick={onClose}
          style={{
            display: "block", width: "100%", marginTop: "20px",
            padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
            background: "transparent", border: `1px solid ${BORDER_TINT}`,
            color: ACCENT, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function SiteCard({ site, onRecheck, onDelete, onSaveAlerts, onShowStatusPage, recheckingId }) {
  const [expanded, setExpanded] = useState(false);
  const check = site.lastCheck || {};
  const score = check.score ?? 0;
  const isRechecking = recheckingId === site._id;
  const history = site.history || [];

  // SSL color coding
  const sslDays = check.ssl?.daysLeft;
  const sslColor = !check.ssl?.valid ? "#ef4444" : sslDays > 30 ? "#10b981" : sslDays > 7 ? "#f59e0b" : "#ef4444";

  // Domain color coding
  const domainDays = check.domain?.daysUntilExpiry;
  const domainColor = domainDays > 60 ? "#10b981" : domainDays > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{
      ...cardStyle,
      border: `1px solid ${BORDER_TINT}`,
      background: BG_TINT,
      marginBottom: "12px",
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ScoreGauge score={score} size={64} />
          <div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3" }}>{site.domain}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
              {check.checkedAt
                ? `Dernier check : ${new Date(check.checkedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                : "Aucune analyse"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={e => { e.stopPropagation(); onRecheck(site._id); }}
            disabled={isRechecking}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "6px",
              background: "transparent", border: `1px solid ${BORDER_TINT}`,
              color: ACCENT, fontSize: "12px", fontWeight: 500,
              cursor: isRechecking ? "wait" : "pointer", fontFamily: "inherit",
              opacity: isRechecking ? 0.5 : 1,
            }}
          >
            <RefreshIcon size={14} />
            {isRechecking ? "Analyse..." : "Reverifier"}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(site._id); }}
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "7px 10px", borderRadius: "6px",
              background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
              cursor: "pointer",
            }}
          >
            <TrashIcon size={14} />
          </button>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expanded health card dashboard */}
      {expanded && (
        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${BORDER_TINT}` }}>
          {/* Score */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px", fontWeight: 500 }}>Score de sante</div>
            <ScoreGauge score={score} size={110} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {/* Uptime card with response time graph */}
            <div style={{
              padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${check.uptime?.status ? "#10b981" : "#ef4444"}`,
            }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Uptime</div>
              <StatusBadge ok={check.uptime?.status} labelOk="En ligne" labelFail="Hors ligne" />
              {check.uptime?.responseTime && (
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                  Temps de reponse : <span style={{ color: "#d1d5db", fontWeight: 500 }}>{check.uptime.responseTime}ms</span>
                </div>
              )}
              {check.uptime?.statusCode && (
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                  Code HTTP : <span style={{ color: "#d1d5db" }}>{check.uptime.statusCode}</span>
                </div>
              )}
              {/* Mini response time graph */}
              {history.length >= 2 && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px" }}>Temps de reponse (5 derniers)</div>
                  <MiniResponseTimeChart history={history} width={230} height={50} />
                </div>
              )}
            </div>

            {/* SSL card with full details */}
            <div style={{
              padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${sslColor}`,
            }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Certificat SSL</div>
              <StatusBadge ok={check.ssl?.valid} labelOk="Valide" labelFail="Invalide" />
              {check.ssl?.valid && (
                <>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                    Expire dans : <span style={{ color: sslColor, fontWeight: 600 }}>{check.ssl.daysLeft} jours</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    Emetteur : <span style={{ color: "#d1d5db" }}>{check.ssl.issuer}</span>
                  </div>
                  {check.ssl.expiryDate && (
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                      Date d'expiration : <span style={{ color: "#d1d5db" }}>{new Date(check.ssl.expiryDate).toLocaleDateString("fr-FR")}</span>
                    </div>
                  )}
                  {/* Expiry countdown bar */}
                  <div style={{ marginTop: "8px" }}>
                    <div style={{
                      height: "4px", borderRadius: "2px", background: "#2a2d3a", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "2px", background: sslColor,
                        width: `${Math.min(100, Math.max(0, (check.ssl.daysLeft / 365) * 100))}%`,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                </>
              )}
              {check.ssl?.error && (
                <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "6px" }}>{check.ssl.error}</div>
              )}
            </div>

            {/* Domain card */}
            <div style={{
              padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${domainColor}`,
            }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>Domaine</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Expire dans : <span style={{ color: domainColor, fontWeight: 600 }}>
                  {domainDays || "?"} jours
                </span>
              </div>
              {check.domain?.expiryEstimate && (
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                  Estimation : <span style={{ color: "#d1d5db" }}>{new Date(check.domain.expiryEstimate).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {/* Expiry countdown bar */}
              <div style={{ marginTop: "8px" }}>
                <div style={{
                  height: "4px", borderRadius: "2px", background: "#2a2d3a", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: "2px", background: domainColor,
                    width: `${Math.min(100, Math.max(0, (domainDays / 365) * 100))}%`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            </div>

            {/* DNS card with chips */}
            <div style={{
              padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${check.dns?.aRecords ? "#10b981" : "#ef4444"}`,
            }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "8px", fontWeight: 500 }}>DNS</div>
              {check.dns?.aRecords ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <Chip label={`A : ${check.dns.aRecords.length}`} color="#10b981" />
                  {check.dns.mxRecords?.length > 0 && (
                    <Chip label={`MX : ${check.dns.mxRecords.length}`} color="#3b82f6" />
                  )}
                  <Chip label={check.dns.spf ? "SPF" : "SPF absent"} color={check.dns.spf ? "#10b981" : "#ef4444"} />
                  <Chip label={check.dns.dmarc ? "DMARC" : "DMARC absent"} color={check.dns.dmarc ? "#10b981" : "#ef4444"} />
                  {check.dns.dkim !== undefined && (
                    <Chip label={check.dns.dkim ? "DKIM" : "DKIM absent"} color={check.dns.dkim ? "#10b981" : "#ef4444"} />
                  )}
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#ef4444" }}>{check.dns?.error || "Erreur DNS"}</div>
              )}
              {check.dns?.mxRecords?.length > 0 && (
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "8px" }}>
                  MX : {check.dns.mxRecords.join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Email deliverability */}
          <div style={{
            marginTop: "12px", padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
            borderRadius: "8px", borderLeft: `3px solid ${ACCENT}`,
          }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "10px", fontWeight: 500 }}>Delivrabilite email</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <StatusBadge ok={check.dns?.spf} labelOk="SPF configure" labelFail="SPF absent" />
              <StatusBadge ok={check.dns?.dmarc} labelOk="DMARC configure" labelFail="DMARC absent" />
              {check.dns?.dkim !== undefined && (
                <StatusBadge ok={check.dns.dkim} labelOk="DKIM configure" labelFail="DKIM absent" />
              )}
            </div>
            {(!check.dns?.spf || !check.dns?.dmarc) && (
              <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "8px", lineHeight: 1.5 }}>
                {!check.dns?.spf && !check.dns?.dmarc
                  ? "Ni SPF ni DMARC ne sont configures. Vos emails risquent d'atterrir en spam."
                  : !check.dns?.spf
                    ? "SPF n'est pas configure. Ajoutez un enregistrement SPF pour ameliorer la delivrabilite."
                    : "DMARC n'est pas configure. Ajoutez un enregistrement DMARC pour proteger votre domaine."}
              </div>
            )}
          </div>

          {/* Security headers */}
          {check.securityHeaders && Object.keys(check.securityHeaders).length > 0 && (
            <div style={{
              marginTop: "12px", padding: "16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", borderLeft: `3px solid ${ACCENT}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <ShieldIcon size={14} color={ACCENT} />
                <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>En-tetes de securite</span>
                {(() => {
                  const keys = Object.keys(check.securityHeaders);
                  const present = keys.filter(k => check.securityHeaders[k]?.present).length;
                  return (
                    <span style={{
                      fontSize: "11px", fontWeight: 600, marginLeft: "auto",
                      color: present === keys.length ? "#10b981" : present > keys.length / 2 ? "#f59e0b" : "#ef4444",
                    }}>
                      {present}/{keys.length}
                    </span>
                  );
                })()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {Object.entries(check.securityHeaders).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#d1d5db", fontFamily: "monospace", fontSize: "11px" }}>{val.label}</span>
                    <span style={{
                      padding: "2px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: 500,
                      color: val.present ? "#10b981" : "#ef4444",
                      background: val.present ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    }}>
                      {val.present ? "Present" : "Absent"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HTTP/2 */}
          {check.http2 && (
            <div style={{
              marginTop: "12px", padding: "12px 16px", background: "#1e2029", border: "1px solid #2a2d3a",
              borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>Support HTTP/2</span>
              <StatusBadge ok={check.http2.supported} labelOk="Supporte" labelFail="Non detecte" />
            </div>
          )}

          {/* Alerts config */}
          <AlertsConfig site={site} onSave={onSaveAlerts} />

          {/* Status page button */}
          <button
            onClick={() => onShowStatusPage(site._id)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              width: "100%", marginTop: "12px", padding: "12px",
              borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              background: "transparent", border: `1px solid ${BORDER_TINT}`,
              color: ACCENT, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <GlobeIcon size={16} color={ACCENT} />
            Generer une page de statut publique
          </button>
        </div>
      )}
    </div>
  );
}

export default function PulseDashboardPage() {
  const { get, post, del } = useApi();
  const [sites, setSites] = useState([]);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [recheckingId, setRecheckingId] = useState(null);
  const [error, setError] = useState("");
  const [statusPageData, setStatusPageData] = useState(null);
  const [statusPageSite, setStatusPageSite] = useState(null);

  const loadSites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get("/api/pulse/sites");
      setSites(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { loadSites(); }, [loadSites]);

  const addSite = async () => {
    if (!domain.trim()) return;
    setAdding(true);
    setError("");
    try {
      const site = await post("/api/pulse/sites", { domain: domain.trim() });
      setSites(prev => [site, ...prev]);
      setDomain("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const recheckSite = async (id) => {
    setRecheckingId(id);
    try {
      const updated = await post(`/api/pulse/sites/${id}/check`);
      setSites(prev => prev.map(s => s._id === id ? updated : s));
    } catch (err) {
      setError(err.message);
    } finally {
      setRecheckingId(null);
    }
  };

  const deleteSite = async (id) => {
    try {
      await del(`/api/pulse/sites/${id}`);
      setSites(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const saveAlerts = async (id, config) => {
    try {
      const updated = await post(`/api/pulse/sites/${id}/alert`, config);
      setSites(prev => prev.map(s => s._id === id ? updated : s));
    } catch (err) {
      setError(err.message);
    }
  };

  const showStatusPage = async (id) => {
    try {
      const data = await get(`/api/pulse/sites/${id}/status-page`);
      setStatusPageData(data);
      setStatusPageSite(id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: BG_TINT, border: `1px solid ${BORDER_TINT}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <HeartPulseIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>Pulse</h1>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, marginTop: "2px" }}>
            Surveillance de la sante numerique de vos sites
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div style={{
        height: "3px", borderRadius: "2px", marginBottom: "28px", marginTop: "16px",
        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
      }} />

      {/* Add site form */}
      <div style={{
        ...cardStyle,
        border: `1px solid ${BORDER_TINT}`,
        marginBottom: "28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <HeartPulseIcon size={18} color={ACCENT} />
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f3", margin: 0 }}>
            Ajouter un site
          </h2>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="exemple.com"
            onKeyDown={e => e.key === "Enter" && !adding && addSite()}
            style={{
              flex: 1, padding: "12px 16px", background: "#141520",
              border: "1px solid #2a2d3a", borderRadius: "8px",
              color: "#f0f0f3", fontSize: "14px", fontFamily: "inherit",
              outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${BORDER_TINT}`; }}
            onBlur={e => { e.target.style.borderColor = "#2a2d3a"; e.target.style.boxShadow = "none"; }}
          />
          <button
            onClick={addSite}
            disabled={adding || !domain.trim()}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 28px", borderRadius: "8px",
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`, border: "none",
              color: "#fff", fontSize: "14px", fontWeight: 600,
              cursor: adding ? "wait" : "pointer", fontFamily: "inherit",
              opacity: adding || !domain.trim() ? 0.5 : 1,
              boxShadow: `0 4px 16px rgba(236,72,153,0.25)`,
              whiteSpace: "nowrap",
            }}
          >
            <HeartPulseIcon size={16} color="#fff" />
            {adding ? "Analyse..." : "Analyser"}
          </button>
        </div>
        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "8px" }}>
          Entrez un nom de domaine sans https:// ni www. Le premier scan sera lance automatiquement.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px", marginBottom: "16px",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: "8px", fontSize: "13px", color: "#f87171",
        }}>
          {error}
          <button onClick={() => setError("")} style={{
            float: "right", background: "none", border: "none", color: "#f87171",
            cursor: "pointer", fontSize: "16px", lineHeight: 1,
          }}>&times;</button>
        </div>
      )}

      {/* Loading */}
      {loading && sites.length === 0 && (
        <div style={{
          ...cardStyle, border: `1px solid ${BORDER_TINT}`, background: BG_TINT,
          textAlign: "center", padding: "48px 24px",
        }}>
          <div style={{
            width: "48px", height: "48px", margin: "0 auto 16px",
            border: `3px solid ${BORDER_TINT}`, borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "pulse-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "14px", color: "#9ca3af" }}>Chargement de vos sites...</div>
          <style>{`@keyframes pulse-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Sites list */}
      {!loading && sites.length === 0 && (
        <div style={{
          ...cardStyle, border: `1px solid ${BORDER_TINT}`, background: BG_TINT,
          textAlign: "center", padding: "48px 24px",
        }}>
          <HeartPulseIcon size={48} color={ACCENT} />
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f3", marginTop: "16px", marginBottom: "8px" }}>
            Aucun site surveille
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto" }}>
            Ajoutez votre premier domaine ci-dessus pour lancer une analyse de sante complete : uptime, SSL, DNS, et plus.
          </div>
        </div>
      )}

      {sites.map(site => (
        <SiteCard
          key={site._id}
          site={site}
          onRecheck={recheckSite}
          onDelete={deleteSite}
          onSaveAlerts={saveAlerts}
          onShowStatusPage={showStatusPage}
          recheckingId={recheckingId}
        />
      ))}

      {/* Status page modal */}
      {statusPageData && (
        <StatusPagePreview
          site={sites.find(s => s._id === statusPageSite)}
          statusData={statusPageData}
          onClose={() => { setStatusPageData(null); setStatusPageSite(null); }}
        />
      )}
    </div>
  );
}
