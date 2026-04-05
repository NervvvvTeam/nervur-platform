import { useState, useEffect } from "react";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";
import SubNav from "../components/SubNav";
import { useApi } from "../hooks/useApi";

/* ─── Constants ──────────────────────────────────────────────── */
const CARD_BG = "#FFFFFF";
const CARD_BORDER = "#E5E5EA";

const TYPE_CONFIG = {
  acces:         { label: "Droit d'accès", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)" },
  rectification: { label: "Rectification",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
  suppression:   { label: "Suppression",    color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)"  },
  portabilite:   { label: "Portabilité",    color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)" },
  opposition:    { label: "Opposition",     color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)" },
  limitation:    { label: "Limitation",     color: "#86868B", bg: "rgba(107,114,128,0.08)",border: "rgba(107,114,128,0.25)"},
};

const STATUS_CONFIG = {
  recu:     { label: "Reçue",    color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)" },
  en_cours: { label: "En cours", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)" },
  traite:   { label: "Traitée",  color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)"  },
  refuse:   { label: "Refusée",  color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)"  },
};

const FILTER_TABS = [
  { key: "all",      label: "Toutes" },
  { key: "recu",     label: "Reçues" },
  { key: "en_cours", label: "En cours" },
  { key: "traite",   label: "Traitées" },
  { key: "refuse",   label: "Refusées" },
];

const TYPE_OPTIONS = ["acces", "rectification", "suppression", "portabilite", "opposition", "limitation"];

/* ─── SVG Icons ──────────────────────────────────────────────── */
const ShieldIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UserIcon = ({ size = 16, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const ClockIcon = ({ size = 14, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const PlusIcon = ({ size = 14, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = ({ size = 18, color = "#94a3b8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = ({ size = 14, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

/* ─── Keyframes ──────────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes dsarFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dsarOverlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes dsarModalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
`;

/* ─── Helpers ────────────────────────────────────────────────── */
function computeCountdown(receivedAt) {
  const deadline = new Date(receivedAt);
  deadline.setDate(deadline.getDate() + 30);
  const diff = deadline - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: `J+${Math.abs(days)}`, expired: true, days };
  if (days === 0) return { text: "J-0", expired: false, urgent: true, days };
  return { text: `J-${days}`, expired: false, urgent: days <= 5, days };
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

/* ─── Styles ─────────────────────────────────────────────────── */
const cardStyle = {
  background: CARD_BG,
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: 12,
  padding: "16px 18px",
  animation: "dsarFadeIn 0.3s ease",
};

const inputStyle = {
  width: "100%",
  fontSize: 13,
  padding: "9px 12px",
  borderRadius: 8,
  border: `1px solid ${CARD_BORDER}`,
  background: "#161822",
  color: "#e2e8f0",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#94a3b8",
  marginBottom: 6,
  display: "block",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  animation: "dsarOverlayIn 0.2s ease",
};

const modalStyle = {
  background: "#1a1c2b",
  border: `1px solid ${CARD_BORDER}`,
  borderRadius: 16,
  padding: "28px 32px",
  width: "100%",
  maxWidth: 540,
  maxHeight: "90vh",
  overflowY: "auto",
  animation: "dsarModalIn 0.25s ease",
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function VaultDsarPage() {
  const api = useApi();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, enCours: 0, traitees: 0, enRetard: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [, setTick] = useState(0);

  // Inject keyframes once
  useEffect(() => {
    if (!document.getElementById("vault-dsar-keyframes")) {
      const style = document.createElement("style");
      style.id = "vault-dsar-keyframes";
      style.textContent = KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  // Live countdown ticker
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  /* ── API calls ──────────────────────────────────────────────── */
  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, statsRes] = await Promise.all([
        api.get("/api/vault/dsar"),
        api.get("/api/vault/dsar/stats"),
      ]);
      setRequests(reqRes.requests || []);
      setStats(statsRes || { total: 0, enCours: 0, traitees: 0, enRetard: 0 });
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, []);

  const handleCreate = async (formData) => {
    try {
      await api.post("/api/vault/dsar", formData);
      setShowNewModal(false);
      loadData();
    } catch { /* ignore */ }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/api/vault/dsar/${id}`, updates);
      setDetailModal(null);
      loadData();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id) => {
    try {
      await api.del(`/api/vault/dsar/${id}`);
      loadData();
    } catch { /* ignore */ }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/api/vault/dsar/${id}`, { status });
      loadData();
    } catch { /* ignore */ }
  };

  /* ── Derived ───────────────────────────────────────────────── */
  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 1100 }}>
      <SubNav color={ACCENT} items={VAULT_NAV} />

      {/* Gradient bar */}
      <div style={{ width: 40, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${ACCENT}, #22d3ee)`, marginBottom: 16 }} />

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{ background: "rgba(6,182,212,0.1)", borderRadius: 12, padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldIcon size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
            Gestion des droits (DSAR)
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "2px 0 0 0" }}>
            Suivi des demandes d'exercice des droits des personnes
          </p>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, margin: "20px 0 18px" }}>
        {[
          { label: "Total demandes", value: stats.total, color: ACCENT },
          { label: "En cours",       value: stats.enCours, color: "#3b82f6" },
          { label: "Traitées",       value: stats.traitees, color: "#22c55e" },
          { label: "En retard",      value: stats.enRetard, color: "#ef4444" },
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

      {/* ── Filter tabs + action button ───────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                fontSize: 12, fontWeight: 600, padding: "6px 16px", borderRadius: 8, cursor: "pointer",
                border: "1px solid",
                background: filter === t.key ? "rgba(6,182,212,0.12)" : "transparent",
                color: filter === t.key ? ACCENT : "#64748b",
                borderColor: filter === t.key ? "rgba(6,182,212,0.3)" : "rgba(0,0,0,0.06)",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          style={{
            fontSize: 12, fontWeight: 600, color: "#fff",
            background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`,
            border: "none", borderRadius: 8, padding: "8px 18px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <PlusIcon size={13} /> Nouvelle demande
        </button>
      </div>

      {/* ── Loading ───────────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b", fontSize: 13 }}>
          Chargement...
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 20px", background: CARD_BG,
          borderRadius: 12, border: `1px solid ${CARD_BORDER}`,
        }}>
          <div style={{
            background: "rgba(6,182,212,0.08)", width: 56, height: 56, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <UserIcon size={24} color={ACCENT} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
            Aucune demande
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Les demandes d'exercice des droits apparaitront ici
          </div>
        </div>
      )}

      {/* ── Request cards ─────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((req) => {
            const typeConf = TYPE_CONFIG[req.requestType] || TYPE_CONFIG.acces;
            const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.recu;
            const countdown = computeCountdown(req.receivedAt || req.createdAt);
            const isTerminal = req.status === "traite" || req.status === "refuse";

            return (
              <div
                key={req._id}
                style={{
                  ...cardStyle,
                  cursor: "pointer",
                  borderLeft: `3px solid ${typeConf.color}`,
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onClick={() => setDetailModal(req)}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 16px ${typeConf.color}15`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Top row: type badge + status badge + countdown */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  {/* Type badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                    color: typeConf.color, background: typeConf.bg, border: `1px solid ${typeConf.border}`,
                    borderRadius: 6, padding: "3px 10px",
                  }}>
                    {typeConf.label}
                  </span>

                  {/* Status badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
                    color: statusConf.color, background: statusConf.bg, border: `1px solid ${statusConf.border}`,
                    borderRadius: 6, padding: "3px 10px",
                  }}>
                    {statusConf.label}
                  </span>

                  {/* Countdown */}
                  {!isTerminal && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 700,
                      color: countdown.expired ? "#ef4444" : countdown.urgent ? "#f59e0b" : "#94a3b8",
                      background: countdown.expired ? "rgba(239,68,68,0.08)" : countdown.urgent ? "rgba(245,158,11,0.08)" : "rgba(148,163,184,0.08)",
                      borderRadius: 6, padding: "3px 10px",
                    }}>
                      <ClockIcon size={11} color={countdown.expired ? "#ef4444" : countdown.urgent ? "#f59e0b" : "#94a3b8"} />
                      {countdown.text}
                    </span>
                  )}

                  {/* Date */}
                  <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                    <ClockIcon size={11} color="#475569" />
                    {formatDate(req.receivedAt || req.createdAt)}
                  </span>
                </div>

                {/* Requester info */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <UserIcon size={14} color="#64748b" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                    {req.requesterName}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {req.requesterEmail}
                  </span>
                </div>

                {/* Description */}
                {req.description && (
                  <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5, marginBottom: 10 }}>
                    {req.description.length > 160 ? req.description.slice(0, 160) + "..." : req.description}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                  {req.status === "recu" && (
                    <button
                      onClick={() => handleStatusChange(req._id, "en_cours")}
                      style={{
                        fontSize: 12, fontWeight: 600, color: "#fff",
                        background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`,
                        border: "none", borderRadius: 8, padding: "6px 14px",
                        cursor: "pointer", transition: "opacity 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      Traiter
                    </button>
                  )}
                  {req.status === "en_cours" && (
                    <button
                      onClick={() => handleStatusChange(req._id, "traite")}
                      style={{
                        fontSize: 12, fontWeight: 600, color: "#fff",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        border: "none", borderRadius: 8, padding: "6px 14px",
                        cursor: "pointer", transition: "opacity 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      Marquer traitee
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(req._id)}
                    style={{
                      fontSize: 12, fontWeight: 500, color: "#64748b",
                      background: "transparent", border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                      e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#64748b";
                      e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <TrashIcon size={12} color="currentColor" /> Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Modal: Nouvelle demande ═══════════════════════════ */}
      {showNewModal && (
        <NewRequestModal
          onClose={() => setShowNewModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* ═══ Modal: Detail / Edit ═════════════════════════════ */}
      {detailModal && (
        <DetailModal
          request={detailModal}
          onClose={() => setDetailModal(null)}
          onSave={(updates) => handleUpdate(detailModal._id, updates)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEW REQUEST MODAL
   ═══════════════════════════════════════════════════════════════ */
function NewRequestModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    requesterName: "",
    requesterEmail: "",
    requestType: "",
    description: "",
    receivedAt: todayISO(),
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.requesterName.trim() && form.requesterEmail.trim() && form.requestType;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Nouvelle demande DSAR</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Nom */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nom du demandeur *</label>
          <input
            type="text"
            value={form.requesterName}
            onChange={(e) => set("requesterName", e.target.value)}
            placeholder="Jean Dupont"
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email du demandeur *</label>
          <input
            type="email"
            value={form.requesterEmail}
            onChange={(e) => set("requesterEmail", e.target.value)}
            placeholder="jean.dupont@email.com"
            style={inputStyle}
          />
        </div>

        {/* Type de demande */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Type de demande *</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TYPE_OPTIONS.map((key) => {
              const conf = TYPE_CONFIG[key];
              const active = form.requestType === key;
              return (
                <button
                  key={key}
                  onClick={() => set("requestType", key)}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8,
                    cursor: "pointer", transition: "all 0.15s ease",
                    background: active ? conf.bg : "transparent",
                    color: active ? conf.color : "#64748b",
                    border: `1px solid ${active ? conf.border : "rgba(0,0,0,0.06)"}`,
                  }}
                >
                  {conf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Description (optionnelle)</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Details de la demande..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {/* Date de reception */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Date de reception</label>
          <input
            type="date"
            value={form.receivedAt}
            onChange={(e) => set("receivedAt", e.target.value)}
            style={{ ...inputStyle, maxWidth: 200 }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!valid || submitting}
          style={{
            width: "100%", fontSize: 13, fontWeight: 700, color: "#fff",
            background: valid ? `linear-gradient(135deg, ${ACCENT}, #0891b2)` : "#E5E5EA",
            border: "none", borderRadius: 10, padding: "11px 0",
            cursor: valid ? "pointer" : "not-allowed", opacity: submitting ? 0.6 : 1,
            transition: "all 0.15s ease",
          }}
        >
          {submitting ? "Enregistrement..." : "Enregistrer la demande"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL / EDIT MODAL
   ═══════════════════════════════════════════════════════════════ */
function DetailModal({ request, onClose, onSave }) {
  const [status, setStatus] = useState(request.status || "recu");
  const [response, setResponse] = useState(request.response || "");
  const [notes, setNotes] = useState(request.notes || "");
  const [saving, setSaving] = useState(false);

  const typeConf = TYPE_CONFIG[request.requestType] || TYPE_CONFIG.acces;
  const countdown = computeCountdown(request.receivedAt || request.createdAt);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ status, response, notes });
    setSaving(false);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Detail de la demande</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            color: typeConf.color, background: typeConf.bg, border: `1px solid ${typeConf.border}`,
            borderRadius: 6, padding: "4px 12px",
          }}>
            {typeConf.label}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 700,
            color: countdown.expired ? "#ef4444" : countdown.urgent ? "#f59e0b" : "#94a3b8",
            background: countdown.expired ? "rgba(239,68,68,0.08)" : "rgba(148,163,184,0.08)",
            borderRadius: 6, padding: "4px 12px",
          }}>
            <ClockIcon size={11} color={countdown.expired ? "#ef4444" : "#94a3b8"} />
            {countdown.text} {countdown.expired ? "(en retard)" : ""}
          </span>
        </div>

        {/* Info fields */}
        <div style={{ background: "#161822", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Demandeur</div>
              <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{request.requesterName}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</div>
              <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{request.requesterEmail}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date de reception</div>
              <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{formatDate(request.receivedAt || request.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Echeance (30 jours)</div>
              <div style={{ fontSize: 13, color: countdown.expired ? "#ef4444" : "#e2e8f0", fontWeight: 500 }}>
                {(() => {
                  const d = new Date(request.receivedAt || request.createdAt);
                  d.setDate(d.getDate() + 30);
                  return formatDate(d);
                })()}
              </div>
            </div>
          </div>
          {request.description && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${CARD_BORDER}` }}>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{request.description}</div>
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ ...inputStyle, maxWidth: 220, cursor: "pointer" }}
          >
            {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
              <option key={key} value={key}>{conf.label}</option>
            ))}
          </select>
        </div>

        {/* Response */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Reponse au demandeur</label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Documentez votre reponse a la demande..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Notes internes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes internes (non visibles par le demandeur)..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", fontSize: 13, fontWeight: 700, color: "#fff",
            background: `linear-gradient(135deg, ${ACCENT}, #0891b2)`,
            border: "none", borderRadius: 10, padding: "11px 0",
            cursor: "pointer", opacity: saving ? 0.6 : 1,
            transition: "all 0.15s ease",
          }}
        >
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
