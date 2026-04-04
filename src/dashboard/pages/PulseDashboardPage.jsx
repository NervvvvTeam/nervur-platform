import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import SubNav from "../components/SubNav";

const PULSE_NAV = [
  { path: "/app/pulse", label: "Moniteur", end: true },
  { path: "/app/pulse/history", label: "Évolution" },
  { path: "/app/pulse/alerts", label: "Alertes" },
  { path: "/app/pulse/status", label: "Page de statut" },
];

const ACCENT = "#ec4899";
const ACCENT_LIGHT = "#f472b6";
const BG_TINT = "rgba(236,72,153,0.06)";
const BORDER_TINT = "rgba(236,72,153,0.18)";

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
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={scoreColor}
          strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <span className="font-bold" style={{ fontSize: size > 80 ? "24px" : "18px", color: scoreColor }}>{score}</span>
        <span className="text-[10px] text-[#6b7280]">/100</span>
      </div>
    </div>
  );
}

function StatusBadge({ ok, labelOk, labelFail }) {
  return (
    <span
      className="inline-flex items-center gap-[5px] px-2.5 py-[3px] rounded text-xs font-medium"
      style={{
        color: ok ? "#10b981" : "#ef4444",
        background: ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
        border: `1px solid ${ok ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
      }}
    >
      {ok ? "\u2705" : "\u274C"} {ok ? labelOk : labelFail}
    </span>
  );
}

function Chip({ label, color = "#64748B" }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-xl text-[11px] font-medium"
      style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
    >
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
    <svg width={width} height={height} className="block">
      <defs>
        <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathD + ` L ${getX(points.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`} fill="url(#rtGrad)" />
      <path d={pathD} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={getX(i)} cy={getY(p.responseTime || 0)} r="3" fill={ACCENT} stroke="#F8FAFC" strokeWidth="1.5" />
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

  return (
    <div className="mt-4 p-4 bg-[#1e2029] border border-[#2a2d3a] rounded-lg border-l-[3px] border-l-[#ec4899]">
      <div className="flex items-center gap-2 mb-3.5">
        <BellIcon size={16} color={ACCENT} />
        <span className="text-[13px] font-semibold text-[#f0f0f3]">Configurer les alertes</span>
      </div>

      <div className="mb-3">
        <label className="text-xs text-[#9ca3af] block mb-1.5">Email pour les alertes</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="w-full px-3 py-2 bg-[#141520] border border-[#2a2d3a] rounded-md text-[#f0f0f3] text-[13px] font-[inherit] outline-none box-border"
        />
      </div>

      <div className="flex flex-col gap-2.5 mb-3.5">
        {[
          { label: "Site hors ligne (down)", active: down, toggle: () => setDown(!down) },
          { label: "Certificat SSL expire bientot", active: sslExp, toggle: () => setSslExp(!sslExp) },
          { label: "Domaine expire bientot", active: domainExp, toggle: () => setDomainExp(!domainExp) },
        ].map(({ label, active, toggle }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-[#d1d5db]">{label}</span>
            <button
              onClick={toggle}
              className="w-9 h-5 rounded-[10px] border-none cursor-pointer relative transition-colors duration-200 shrink-0"
              style={{ background: active ? ACCENT : "#E2E8F0" }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-[left] duration-200"
                style={{ left: active ? "18px" : "2px" }}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 rounded-md text-xs font-semibold font-[inherit]"
        style={{
          background: saved ? "rgba(16,185,129,0.15)" : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
          border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
          color: saved ? "#10b981" : "#fff",
          cursor: saving ? "wait" : "pointer",
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
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="w-[600px] max-h-[80vh] overflow-auto bg-[#141520] rounded-xl border border-[#2a2d3a] p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Status page header */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <GlobeIcon size={24} color={ACCENT} />
            <h2 className="text-xl font-bold text-[#f0f0f3] m-0">
              {statusData.domain}
            </h2>
          </div>
          <p className="text-[13px] text-[#9ca3af] m-0">Page de statut publique</p>
        </div>

        {/* Big status indicator */}
        <div
          className="text-center p-6 mb-6 rounded-[10px] border"
          style={{
            background: `${statusColor}10`,
            borderColor: `${statusColor}30`,
          }}
        >
          <div
            className="w-4 h-4 rounded-full mx-auto mb-3"
            style={{ background: statusColor, boxShadow: `0 0 12px ${statusColor}60` }}
          />
          <div className="text-lg font-bold" style={{ color: statusColor }}>{statusLabel}</div>
          <div className="text-[13px] text-[#9ca3af] mt-1.5">
            Disponibilite : {statusData.uptimePercentage}%
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-[#1e2029] rounded-lg text-center">
            <div className="text-[11px] text-[#9ca3af] mb-1.5">Temps de reponse</div>
            <div className="text-xl font-bold text-[#f0f0f3]">
              {statusData.responseTime ? `${statusData.responseTime}ms` : "N/A"}
            </div>
          </div>
          <div className="p-4 bg-[#1e2029] rounded-lg text-center">
            <div className="text-[11px] text-[#9ca3af] mb-1.5">Certificat SSL</div>
            <div className="text-xl font-bold" style={{ color: statusData.ssl?.valid ? "#10b981" : "#ef4444" }}>
              {statusData.ssl?.valid ? `${statusData.ssl.daysLeft}j` : "Invalide"}
            </div>
          </div>
          <div className="p-4 bg-[#1e2029] rounded-lg text-center">
            <div className="text-[11px] text-[#9ca3af] mb-1.5">Uptime</div>
            <div className="text-xl font-bold" style={{ color: statusData.uptimePercentage >= 99 ? "#10b981" : "#f59e0b" }}>
              {statusData.uptimePercentage}%
            </div>
          </div>
        </div>

        {/* Recent history bar */}
        {statusData.recentHistory && statusData.recentHistory.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-[#9ca3af] mb-2.5">Historique recent</div>
            <div className="flex gap-[3px]">
              {statusData.recentHistory.map((h, i) => (
                <div key={i} className="flex-1 h-7 rounded-[3px] cursor-default"
                  style={{
                    background: h.status === "up" ? "#10b981" : "#ef4444",
                    opacity: 0.7 + (i / statusData.recentHistory.length) * 0.3,
                  }}
                  title={`${new Date(h.checkedAt).toLocaleString("fr-FR")} — ${h.status === "up" ? "En ligne" : "Hors ligne"} — ${h.responseTime || "?"}ms`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-[#6b7280]">Ancien</span>
              <span className="text-[10px] text-[#6b7280]">Recent</span>
            </div>
          </div>
        )}

        <div className="text-[11px] text-[#6b7280] text-center">
          Derniere verification : {statusData.lastChecked ? new Date(statusData.lastChecked).toLocaleString("fr-FR") : "N/A"}
        </div>

        <button
          onClick={onClose}
          className="block w-full mt-5 py-2.5 rounded-lg text-[13px] font-semibold bg-transparent border border-[rgba(236,72,153,0.18)] text-[#ec4899] cursor-pointer font-[inherit]"
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
    <div className="bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-3">
      {/* Header row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-4">
          <ScoreGauge score={score} size={64} />
          <div>
            <div className="text-base font-semibold text-[#f0f0f3]">{site.domain}</div>
            <div className="text-xs text-[#6b7280] mt-1">
              {check.checkedAt
                ? `Dernier check : ${new Date(check.checkedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                : "Aucune analyse"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onRecheck(site._id); }}
            disabled={isRechecking}
            className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-md bg-transparent border border-[rgba(236,72,153,0.18)] text-[#ec4899] text-xs font-medium font-[inherit]"
            style={{
              cursor: isRechecking ? "wait" : "pointer",
              opacity: isRechecking ? 0.5 : 1,
            }}
          >
            <RefreshIcon size={14} />
            {isRechecking ? "Analyse..." : "Reverifier"}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(site._id); }}
            className="inline-flex items-center px-2.5 py-[7px] rounded-md bg-transparent border border-[rgba(239,68,68,0.2)] cursor-pointer"
          >
            <TrashIcon size={14} />
          </button>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform duration-200"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expanded health card dashboard */}
      {expanded && (
        <div className="mt-5 pt-5 border-t border-[rgba(236,72,153,0.18)]">
          {/* Score */}
          <div className="text-center mb-6">
            <div className="text-xs text-[#9ca3af] mb-2.5 font-medium">Score de sante</div>
            <ScoreGauge score={score} size={110} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Uptime card with response time graph */}
            <div className="p-4 bg-[#1e2029] border border-[#2a2d3a] rounded-lg" style={{ borderLeft: `3px solid ${check.uptime?.status ? "#10b981" : "#ef4444"}` }}>
              <div className="text-[11px] text-[#9ca3af] mb-2 font-medium">Uptime</div>
              <StatusBadge ok={check.uptime?.status} labelOk="En ligne" labelFail="Hors ligne" />
              {check.uptime?.responseTime && (
                <div className="text-xs text-[#6b7280] mt-1.5">
                  Temps de reponse : <span className="text-[#d1d5db] font-medium">{check.uptime.responseTime}ms</span>
                </div>
              )}
              {check.uptime?.statusCode && (
                <div className="text-xs text-[#6b7280] mt-0.5">
                  Code HTTP : <span className="text-[#d1d5db]">{check.uptime.statusCode}</span>
                </div>
              )}
              {/* Mini response time graph */}
              {history.length >= 2 && (
                <div className="mt-2.5">
                  <div className="text-[10px] text-[#6b7280] mb-1">Temps de reponse (5 derniers)</div>
                  <MiniResponseTimeChart history={history} width={230} height={50} />
                </div>
              )}
            </div>

            {/* SSL card with full details */}
            <div className="p-4 bg-[#1e2029] border border-[#2a2d3a] rounded-lg" style={{ borderLeft: `3px solid ${sslColor}` }}>
              <div className="text-[11px] text-[#9ca3af] mb-2 font-medium">Certificat SSL</div>
              <StatusBadge ok={check.ssl?.valid} labelOk="Valide" labelFail="Invalide" />
              {check.ssl?.valid && (
                <>
                  <div className="text-xs text-[#6b7280] mt-1.5">
                    Expire dans : <span className="font-semibold" style={{ color: sslColor }}>{check.ssl.daysLeft} jours</span>
                  </div>
                  <div className="text-xs text-[#6b7280] mt-0.5">
                    Emetteur : <span className="text-[#d1d5db]">{check.ssl.issuer}</span>
                  </div>
                  {check.ssl.expiryDate && (
                    <div className="text-xs text-[#6b7280] mt-0.5">
                      Date d'expiration : <span className="text-[#d1d5db]">{new Date(check.ssl.expiryDate).toLocaleDateString("fr-FR")}</span>
                    </div>
                  )}
                  {/* Expiry countdown bar */}
                  <div className="mt-2">
                    <div className="h-1 rounded-sm bg-[#2a2d3a] overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-[width] duration-500 ease-in-out"
                        style={{
                          background: sslColor,
                          width: `${Math.min(100, Math.max(0, (check.ssl.daysLeft / 365) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
              {check.ssl?.error && (
                <div className="text-[11px] text-[#ef4444] mt-1.5">{check.ssl.error}</div>
              )}
            </div>

            {/* Domain card */}
            <div className="p-4 bg-[#1e2029] border border-[#2a2d3a] rounded-lg" style={{ borderLeft: `3px solid ${domainColor}` }}>
              <div className="text-[11px] text-[#9ca3af] mb-2 font-medium">Domaine</div>
              <div className="text-xs text-[#6b7280]">
                Expire dans : <span className="font-semibold" style={{ color: domainColor }}>
                  {domainDays || "?"} jours
                </span>
              </div>
              {check.domain?.expiryEstimate && (
                <div className="text-xs text-[#6b7280] mt-1">
                  Estimation : <span className="text-[#d1d5db]">{new Date(check.domain.expiryEstimate).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {/* Expiry countdown bar */}
              <div className="mt-2">
                <div className="h-1 rounded-sm bg-[#2a2d3a] overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-[width] duration-500 ease-in-out"
                    style={{
                      background: domainColor,
                      width: `${Math.min(100, Math.max(0, (domainDays / 365) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* DNS card with chips */}
            <div className="p-4 bg-[#1e2029] border border-[#2a2d3a] rounded-lg" style={{ borderLeft: `3px solid ${check.dns?.aRecords ? "#10b981" : "#ef4444"}` }}>
              <div className="text-[11px] text-[#9ca3af] mb-2 font-medium">DNS</div>
              {check.dns?.aRecords ? (
                <div className="flex flex-wrap gap-1.5">
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
                <div className="text-xs text-[#ef4444]">{check.dns?.error || "Erreur DNS"}</div>
              )}
              {check.dns?.mxRecords?.length > 0 && (
                <div className="text-[11px] text-[#6b7280] mt-2">
                  MX : {check.dns.mxRecords.join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Email deliverability */}
          <div className="mt-3 p-4 bg-[#1e2029] border border-[#2a2d3a] rounded-lg border-l-[3px] border-l-[#ec4899]">
            <div className="text-[11px] text-[#9ca3af] mb-2.5 font-medium">Délivrabilité email</div>
            <div className="flex gap-3 flex-wrap">
              <StatusBadge ok={check.dns?.spf} labelOk="SPF configuré" labelFail="SPF absent" />
              <StatusBadge ok={check.dns?.dmarc} labelOk="DMARC configuré" labelFail="DMARC absent" />
              {check.dns?.dkim !== undefined && (
                <StatusBadge ok={check.dns.dkim} labelOk="DKIM configuré" labelFail="DKIM absent" />
              )}
            </div>
            {(!check.dns?.spf || !check.dns?.dmarc) && (
              <div className="text-xs text-[#f59e0b] mt-2 leading-relaxed">
                {!check.dns?.spf && !check.dns?.dmarc
                  ? "Ni SPF ni DMARC ne sont configurés. Vos emails risquent d'atterrir en spam."
                  : !check.dns?.spf
                    ? "SPF n'est pas configuré. Ajoutez un enregistrement SPF pour améliorer la délivrabilité."
                    : "DMARC n'est pas configuré. Ajoutez un enregistrement DMARC pour protéger votre domaine."}
              </div>
            )}
          </div>

          {/* Security headers */}
          {check.securityHeaders && Object.keys(check.securityHeaders).length > 0 && (
            <div className="mt-3 p-4 bg-[#1e2029] border border-[#2a2d3a] rounded-lg border-l-[3px] border-l-[#ec4899]">
              <div className="flex items-center gap-2 mb-3">
                <ShieldIcon size={14} color={ACCENT} />
                <span className="text-[11px] text-[#9ca3af] font-medium">En-têtes de sécurité</span>
                {(() => {
                  const keys = Object.keys(check.securityHeaders);
                  const present = keys.filter(k => check.securityHeaders[k]?.present).length;
                  return (
                    <span className="text-[11px] font-semibold ml-auto" style={{
                      color: present === keys.length ? "#10b981" : present > keys.length / 2 ? "#f59e0b" : "#ef4444",
                    }}>
                      {present}/{keys.length}
                    </span>
                  );
                })()}
              </div>
              <div className="flex flex-col gap-1.5">
                {Object.entries(check.securityHeaders).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-[#d1d5db] font-mono text-[11px]">{val.label}</span>
                    <span
                      className="px-2 py-0.5 rounded-[3px] text-[11px] font-medium"
                      style={{
                        color: val.present ? "#10b981" : "#ef4444",
                        background: val.present ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      }}
                    >
                      {val.present ? "Present" : "Absent"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HTTP/2 */}
          {check.http2 && (
            <div className="mt-3 px-4 py-3 bg-[#1e2029] border border-[#2a2d3a] rounded-lg flex items-center justify-between">
              <span className="text-xs text-[#9ca3af]">Support HTTP/2</span>
              <StatusBadge ok={check.http2.supported} labelOk="Supporte" labelFail="Non detecte" />
            </div>
          )}

          {/* Alerts config */}
          <AlertsConfig site={site} onSave={onSaveAlerts} />

          {/* Status page button */}
          <button
            onClick={() => onShowStatusPage(site._id)}
            className="flex items-center justify-center gap-2 w-full mt-3 py-3 rounded-lg text-[13px] font-semibold bg-transparent border border-[rgba(236,72,153,0.18)] text-[#ec4899] cursor-pointer font-[inherit]"
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
    <div className="max-w-[1100px]">
      <SubNav color={ACCENT} items={PULSE_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-11 h-11 rounded-[10px] bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] flex items-center justify-center">
          <HeartPulseIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#f0f0f3] m-0">Pulse</h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Surveillance de la sante numerique de vos sites
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] rounded-sm mb-7 mt-4 bg-gradient-to-br from-[#ec4899] to-[#f472b6]" />

      {/* Add site form */}
      <div className="bg-[#1e2029] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-7">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulseIcon size={18} color={ACCENT} />
          <h2 className="text-[15px] font-semibold text-[#f0f0f3] m-0">
            Ajouter un site
          </h2>
        </div>
        <div className="flex gap-2.5">
          <input
            type="text"
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="exemple.com"
            onKeyDown={e => e.key === "Enter" && !adding && addSite()}
            className="flex-1 px-4 py-3 bg-[#141520] border border-[#2a2d3a] rounded-lg text-[#f0f0f3] text-sm font-[inherit] outline-none box-border transition-[border-color,box-shadow] duration-200 focus:border-[#ec4899] focus:shadow-[0_0_0_3px_rgba(236,72,153,0.18)]"
          />
          <button
            onClick={addSite}
            disabled={adding || !domain.trim()}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-gradient-to-br from-[#ec4899] to-[#f472b6] border-none text-white text-sm font-semibold font-[inherit] shadow-[0_4px_16px_rgba(236,72,153,0.25)] whitespace-nowrap"
            style={{
              cursor: adding ? "wait" : "pointer",
              opacity: adding || !domain.trim() ? 0.5 : 1,
            }}
          >
            <HeartPulseIcon size={16} color="#fff" />
            {adding ? "Analyse..." : "Analyser"}
          </button>
        </div>
        <div className="text-[11px] text-[#6b7280] mt-2">
          Entrez un nom de domaine sans https:// ni www. Le premier scan sera lance automatiquement.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 mb-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] rounded-lg text-[13px] text-[#f87171]">
          {error}
          <button onClick={() => setError("")} className="float-right bg-transparent border-none text-[#f87171] cursor-pointer text-base leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && sites.length === 0 && (
        <div className="bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 border-[3px] border-[rgba(236,72,153,0.18)] border-t-[#ec4899] rounded-full animate-[pulse-spin_1s_linear_infinite]" />
          <div className="text-sm text-[#9ca3af]">Chargement de vos sites...</div>
          <style>{`@keyframes pulse-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Sites list */}
      {!loading && sites.length === 0 && (
        <div className="bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.18)] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-center py-12">
          <HeartPulseIcon size={48} color={ACCENT} />
          <div className="text-base font-semibold text-[#f0f0f3] mt-4 mb-2">
            Aucun site surveille
          </div>
          <div className="text-[13px] text-[#9ca3af] leading-relaxed max-w-[400px] mx-auto">
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
