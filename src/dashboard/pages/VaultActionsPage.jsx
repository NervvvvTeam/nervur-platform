import { useState, useEffect } from "react";
import { VAULT_NAV, VAULT_ACCENT as ACCENT } from "./vaultNav";
import SubNav from "../components/SubNav";

/* ── localStorage keys ── */
const LS_ACTIONS = "vault_actions";
const LS_COLUMNS = "vault_columns";
const LS_INCIDENTS = "vault_incidents";

/* ── Default data ── */
const DEFAULT_COLUMNS = [
  { id: "todo", label: "À faire" },
  { id: "in_progress", label: "En cours" },
  { id: "done", label: "Terminé" },
];

const DEFAULT_ACTIONS = [];

const DEFAULT_INCIDENTS = [];

/* ── Helpers ── */
const uid = () => Date.now().toString(36);

const PRIORITY_OPTIONS = ["critique", "haute", "moyenne", "basse"];
const CATEGORY_OPTIONS = ["RGPD", "Sécurité", "Juridique", "Technique", "Autre"];

const PRIORITY_COLORS = {
  critique: "#ef4444",
  haute: "#f97316",
  moyenne: "#f59e0b",
  basse: "#64748B",
};

const PRIORITY_LABELS = {
  critique: "Critique",
  haute: "Haute",
  moyenne: "Moyenne",
  basse: "Basse",
};

const CATEGORY_COLORS = {
  RGPD: { bg: "rgba(6,182,212,0.12)", text: "#06b6d4" },
  "Sécurité": { bg: "rgba(168,85,247,0.12)", text: "#a855f7" },
  Juridique: { bg: "rgba(249,115,22,0.12)", text: "#f97316" },
  Technique: { bg: "rgba(34,197,94,0.12)", text: "#22c55e" },
  Autre: { bg: "rgba(107,114,128,0.12)", text: "#64748B" },
};

const SEVERITY_MAP = {
  1: { label: "Négligeable", color: "#64748B", bg: "rgba(107,114,128,0.15)" },
  2: { label: "Limité", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  3: { label: "Important", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  4: { label: "Maximal", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
};

const INCIDENT_STATUSES = ["detected", "evaluated", "notified_cnil", "resolved"];
const INCIDENT_STATUS_LABELS = {
  detected: "Détecté",
  evaluated: "Évalué",
  notified_cnil: "Notifié CNIL",
  resolved: "Résolu",
};
const INCIDENT_STATUS_COLORS = {
  detected: { bg: "rgba(239,68,68,0.12)", text: "#ef4444" },
  evaluated: { bg: "rgba(249,115,22,0.12)", text: "#f97316" },
  notified_cnil: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  resolved: { bg: "rgba(34,197,94,0.12)", text: "#22c55e" },
};

const COLUMN_TINTS = {
  todo: "rgba(239,68,68,0.03)",
  in_progress: "rgba(6,182,212,0.03)",
  done: "rgba(34,197,94,0.03)",
};

function formatDateFr(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTimeFr(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function get72hRemaining(incidentDate) {
  if (!incidentDate) return null;
  const deadline = new Date(new Date(incidentDate).getTime() + 72 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = deadline - now;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffMs <= 0) {
    return { label: "Délai 72h dépassé", color: "#ef4444", bg: "rgba(239,68,68,0.15)", expired: true };
  }
  if (diffH < 12) {
    return { label: `${diffH}h${diffMin.toString().padStart(2, "0")} restantes`, color: "#ef4444", bg: "rgba(239,68,68,0.15)", expired: false };
  }
  return { label: `${diffH}h restantes`, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", expired: false };
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

/* ── Icons ── */
const ShieldIcon = ({ size = 24, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const GripIcon = ({ size = 14, color = "#94A3B8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" />
  </svg>
);

const AlertTriangleIcon = ({ size = 14, color = "#ef4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ClockIcon = ({ size = 12, color = "#64748B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const PencilIcon = ({ size = 13, color = "#64748B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PlusIcon = ({ size = 14, color = "#64748B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = ({ size = 13, color = "#64748B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowLeftIcon = ({ size = 12, color = "#64748B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const ArrowRightIcon = ({ size = 12, color = "#64748B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ── Shared styles ── */
const cardStyle = {
  background: "#E8E9EC",
  border: "1px solid #2a2d3a",
  borderRadius: 12,
  padding: "14px 16px",
};

const inputStyle = {
  background: "#161820",
  border: "1px solid #2a2d3a",
  borderRadius: 8,
  padding: "8px 12px",
  color: "#e2e4ea",
  fontSize: 13,
  width: "100%",
  outline: "none",
  fontFamily: "inherit",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: 30,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#64748B",
  marginBottom: 4,
  display: "block",
};

const btnPrimary = {
  background: "rgba(6,182,212,0.15)",
  color: ACCENT,
  border: "1px solid rgba(6,182,212,0.3)",
  borderRadius: 8,
  padding: "8px 20px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const btnSecondary = {
  background: "transparent",
  color: "#64748B",
  border: "1px solid #2a2d3a",
  borderRadius: 8,
  padding: "8px 20px",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 3,
  borderRadius: 4,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s",
};

/* ── Modal component ── */
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1c25",
          border: "1px solid #2a2d3a",
          borderRadius: 14,
          padding: "24px 28px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ margin: "0 0 18px 0", fontSize: 16, fontWeight: 600, color: "#0F172A" }}>
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

/* ── Task form fields (used in modal for add/edit) ── */
function TaskForm({ task, setTask, onSave, onCancel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>Titre *</label>
        <input
          style={inputStyle}
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          placeholder="Titre de l'action..."
          autoFocus
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Priorité</label>
          <select style={selectStyle} value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })}>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Catégorie</label>
          <select style={selectStyle} value={task.category} onChange={(e) => setTask({ ...task, category: e.target.value })}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Date d'échéance</label>
        <input
          type="date"
          style={inputStyle}
          value={task.dueDate}
          onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
        />
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          placeholder="Description optionnelle..."
        />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={btnSecondary} onClick={onCancel}>Annuler</button>
        <button
          style={{ ...btnPrimary, opacity: task.title.trim() ? 1 : 0.4 }}
          disabled={!task.title.trim()}
          onClick={onSave}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

/* ── Incident form fields ── */
function IncidentForm({ incident, setIncident, onSave, onCancel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelStyle}>Description *</label>
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
          value={incident.description}
          onChange={(e) => setIncident({ ...incident, description: e.target.value })}
          placeholder="Décrivez l'incident..."
          autoFocus
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Gravité (1-4)</label>
          <select style={selectStyle} value={incident.severity} onChange={(e) => setIncident({ ...incident, severity: Number(e.target.value) })}>
            {[1, 2, 3, 4].map((s) => (
              <option key={s} value={s}>{s} — {SEVERITY_MAP[s].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Personnes affectées</label>
          <input
            type="number"
            style={inputStyle}
            value={incident.affectedCount}
            onChange={(e) => setIncident({ ...incident, affectedCount: Number(e.target.value) || 0 })}
            min="0"
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Données concernées</label>
        <input
          style={inputStyle}
          value={incident.dataTypes}
          onChange={(e) => setIncident({ ...incident, dataTypes: e.target.value })}
          placeholder="Ex: Noms, emails, téléphones..."
        />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <button style={btnSecondary} onClick={onCancel}>Annuler</button>
        <button
          style={{ ...btnPrimary, opacity: incident.description.trim() ? 1 : 0.4 }}
          disabled={!incident.description.trim()}
          onClick={onSave}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

/* ── Action Card ── */
function ActionCard({ action, columns, onMove, onEdit, onDelete }) {
  const pColor = PRIORITY_COLORS[action.priority];
  const catStyle = CATEGORY_COLORS[action.category] || { bg: "rgba(107,114,128,0.12)", text: "#64748B" };
  const colIdx = columns.findIndex((c) => c.id === action.status);
  const canLeft = colIdx > 0;
  const canRight = colIdx < columns.length - 1;

  return (
    <div
      style={{
        background: "#E8E9EC",
        borderRadius: 10,
        border: "1px solid #2a2d3a",
        borderLeft: `3px solid ${pColor}`,
        padding: "12px 14px",
        marginBottom: 8,
        transition: "all 0.15s",
      }}
      className="hover:border-[rgba(6,182,212,0.25)] group"
    >
      {/* Title row */}
      <div className="flex items-start gap-2 mb-2">
        <div className="mt-0.5 opacity-40 group-hover:opacity-70 transition-opacity">
          <GripIcon />
        </div>
        <p className="text-[13px] text-[#e2e4ea] font-medium leading-snug m-0 flex-1">
          {action.title}
        </p>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap ml-[22px]">
        <span
          style={{
            background: pColor + "1a",
            color: pColor,
            padding: "2px 8px",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
        >
          {PRIORITY_LABELS[action.priority]}
        </span>
        <span
          style={{
            background: catStyle.bg,
            color: catStyle.text,
            padding: "2px 8px",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          {action.category}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-[#6b7280] ml-auto">
          <ClockIcon />
          {formatDateFr(action.dueDate)}
        </span>
      </div>

      {/* Description preview */}
      {action.description && (
        <p style={{
          margin: "6px 0 0 22px",
          fontSize: 11,
          color: "#64748B",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}>
          {action.description}
        </p>
      )}

      {/* Action buttons row */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, marginLeft: 22 }}>
        <button
          style={{ ...iconBtn, opacity: canLeft ? 1 : 0.25 }}
          disabled={!canLeft}
          onClick={() => canLeft && onMove(action.id, columns[colIdx - 1].id)}
          title="Déplacer à gauche"
        >
          <ArrowLeftIcon size={12} color={canLeft ? ACCENT : "#94A3B8"} />
        </button>
        <button
          style={{ ...iconBtn, opacity: canRight ? 1 : 0.25 }}
          disabled={!canRight}
          onClick={() => canRight && onMove(action.id, columns[colIdx + 1].id)}
          title="Déplacer à droite"
        >
          <ArrowRightIcon size={12} color={canRight ? ACCENT : "#94A3B8"} />
        </button>
        <div style={{ flex: 1 }} />
        <button
          style={iconBtn}
          onClick={() => onEdit(action)}
          title="Modifier"
          className="hover:bg-[#E2E8F0]"
        >
          <PencilIcon size={13} color="#64748B" />
        </button>
        <button
          style={iconBtn}
          onClick={() => onDelete(action.id)}
          title="Supprimer"
          className="hover:bg-[rgba(239,68,68,0.12)]"
        >
          <XIcon size={13} color="#64748B" />
        </button>
      </div>
    </div>
  );
}

/* ── Kanban Column ── */
function KanbanColumn({ column, actions, columns, onAddClick, onMove, onEdit, onDelete, onDeleteColumn, isCustom }) {
  const bgTint = COLUMN_TINTS[column.id] || "rgba(6,182,212,0.02)";

  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 200,
        background: bgTint,
        borderRadius: 12,
        padding: "14px 12px",
        border: "1px solid #2a2d3a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-[13px] font-semibold text-[#c8cad0]">{column.label}</span>
        <span
          style={{
            background: "#E2E8F0",
            color: "#64748B",
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 10,
            padding: "1px 8px",
          }}
        >
          {actions.length}
        </span>
        <div style={{ flex: 1 }} />
        {isCustom && (
          <button
            style={{ ...iconBtn }}
            onClick={() => onDeleteColumn(column.id)}
            title="Supprimer cette colonne"
            className="hover:bg-[rgba(239,68,68,0.12)]"
          >
            <XIcon size={11} color="#94A3B8" />
          </button>
        )}
        <button
          style={{
            ...iconBtn,
            background: "rgba(6,182,212,0.1)",
            borderRadius: 6,
            padding: 4,
          }}
          onClick={() => onAddClick(column.id)}
          title="Ajouter une action"
          className="hover:bg-[rgba(6,182,212,0.2)]"
        >
          <PlusIcon size={13} color={ACCENT} />
        </button>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, minHeight: 40 }}>
        {actions.map((a) => (
          <ActionCard
            key={a.id}
            action={a}
            columns={columns}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {actions.length === 0 && (
          <p className="text-[12px] text-[#4b5563] text-center py-6 m-0">Aucune action</p>
        )}
      </div>
    </div>
  );
}

/* ── Main page component ── */
export default function VaultActionsPage() {
  const [activeTab, setActiveTab] = useState("actions");

  /* ── Actions state ── */
  const [columns, setColumns] = useState(() => loadJSON(LS_COLUMNS, DEFAULT_COLUMNS));
  const [actions, setActions] = useState(() => loadJSON(LS_ACTIONS, DEFAULT_ACTIONS));

  /* ── Incidents state ── */
  const [incidents, setIncidents] = useState(() => loadJSON(LS_INCIDENTS, DEFAULT_INCIDENTS));

  /* ── Modal state ── */
  const [taskModal, setTaskModal] = useState(null); // null | { mode: "add"|"edit", status, task }
  const [incidentModal, setIncidentModal] = useState(null); // null | { mode: "add" }
  const [editTask, setEditTask] = useState({ title: "", priority: "moyenne", category: "RGPD", dueDate: "", description: "" });
  const [editIncident, setEditIncident] = useState({ description: "", severity: 2, dataTypes: "", affectedCount: 0 });

  /* ── Persist to localStorage ── */
  useEffect(() => { localStorage.setItem(LS_ACTIONS, JSON.stringify(actions)); }, [actions]);
  useEffect(() => { localStorage.setItem(LS_COLUMNS, JSON.stringify(columns)); }, [columns]);
  useEffect(() => { localStorage.setItem(LS_INCIDENTS, JSON.stringify(incidents)); }, [incidents]);

  /* ── Timer for 72h countdown refresh ── */
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  /* ── Action handlers ── */
  const openAddTask = (status) => {
    setEditTask({ title: "", priority: "moyenne", category: "RGPD", dueDate: "", description: "" });
    setTaskModal({ mode: "add", status });
  };

  const openEditTask = (action) => {
    setEditTask({ ...action });
    setTaskModal({ mode: "edit" });
  };

  const saveTask = () => {
    if (!editTask.title.trim()) return;
    if (taskModal.mode === "add") {
      setActions((prev) => [...prev, { ...editTask, id: uid(), status: taskModal.status }]);
    } else {
      setActions((prev) => prev.map((a) => (a.id === editTask.id ? { ...editTask } : a)));
    }
    setTaskModal(null);
  };

  const deleteTask = (id) => {
    if (!window.confirm("Supprimer cette action ?")) return;
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const moveTask = (id, newStatus) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  };

  /* ── Column handlers ── */
  const addColumn = () => {
    const name = window.prompt("Nom de la nouvelle colonne :");
    if (!name || !name.trim()) return;
    const colId = "col_" + uid();
    setColumns((prev) => [...prev, { id: colId, label: name.trim() }]);
  };

  const deleteColumn = (colId) => {
    const col = columns.find((c) => c.id === colId);
    const tasksInCol = actions.filter((a) => a.status === colId);
    if (tasksInCol.length > 0) {
      if (!window.confirm(`La colonne "${col.label}" contient ${tasksInCol.length} action(s). Elles seront déplacées dans la première colonne. Continuer ?`)) return;
      const firstColId = columns[0].id;
      setActions((prev) => prev.map((a) => (a.status === colId ? { ...a, status: firstColId } : a)));
    }
    setColumns((prev) => prev.filter((c) => c.id !== colId));
  };

  /* ── Incident handlers ── */
  const openAddIncident = () => {
    setEditIncident({ description: "", severity: 2, dataTypes: "", affectedCount: 0 });
    setIncidentModal({ mode: "add" });
  };

  const saveIncident = () => {
    if (!editIncident.description.trim()) return;
    const newInc = {
      ...editIncident,
      id: uid(),
      date: new Date().toISOString(),
      status: "detected",
    };
    setIncidents((prev) => [newInc, ...prev]);
    setIncidentModal(null);
  };

  const advanceIncident = (id) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const idx = INCIDENT_STATUSES.indexOf(inc.status);
        if (idx < INCIDENT_STATUSES.length - 1) {
          return { ...inc, status: INCIDENT_STATUSES[idx + 1] };
        }
        return inc;
      })
    );
  };

  const deleteIncident = (id) => {
    if (!window.confirm("Supprimer cet incident ?")) return;
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  };

  /* ── Computed stats ── */
  const totalActions = actions.length;
  const criticalActions = actions.filter((a) => a.priority === "critique").length;
  const doneActions = actions.filter((a) => a.status === "done").length;
  const activeIncidents = incidents.filter((i) => i.status !== "resolved").length;
  const completionRate = totalActions ? Math.round((doneActions / totalActions) * 100) : 0;

  const statsByPriority = PRIORITY_OPTIONS.map((p) => ({
    key: p,
    label: PRIORITY_LABELS[p],
    color: PRIORITY_COLORS[p],
    count: actions.filter((a) => a.priority === p).length,
  }));

  return (
    <div className="max-w-[1100px]">
      <SubNav color={ACCENT} items={VAULT_NAV} />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div
          className="w-11 h-11 rounded-[10px] flex items-center justify-center"
          style={{
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.2)",
          }}
        >
          <ShieldIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 className="text-[22px] font-semibold text-[#0F172A] m-0">
            Plan d'action &amp; Incidents
          </h1>
          <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">
            Gérez vos actions de conformité et déclarez vos incidents
          </p>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-transparent rounded-sm mb-5 mt-4" />

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-4" style={{ fontSize: 13 }}>
        <div style={cardStyle}>
          <p className="text-[11px] text-[#6b7280] m-0 mb-1 uppercase tracking-wider font-medium">Total actions</p>
          <p className="text-[22px] font-bold text-[#0F172A] m-0">{totalActions}</p>
        </div>
        <div style={cardStyle}>
          <p className="text-[11px] text-[#6b7280] m-0 mb-1 uppercase tracking-wider font-medium">Actions critiques</p>
          <p className="text-[22px] font-bold m-0" style={{ color: "#ef4444" }}>{criticalActions}</p>
        </div>
        <div style={cardStyle}>
          <p className="text-[11px] text-[#6b7280] m-0 mb-1 uppercase tracking-wider font-medium">Incidents actifs</p>
          <p className="text-[22px] font-bold m-0" style={{ color: "#f97316" }}>{activeIncidents}</p>
        </div>
        <div style={cardStyle}>
          <p className="text-[11px] text-[#6b7280] m-0 mb-1 uppercase tracking-wider font-medium">Taux de complétion</p>
          <div className="flex items-center gap-2">
            <p className="text-[22px] font-bold m-0" style={{ color: "#22c55e" }}>{completionRate}%</p>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: "#E2E8F0", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completionRate}%`, borderRadius: 4, background: "linear-gradient(90deg, #06b6d4, #22c55e)", transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* Priority breakdown mini-bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {statsByPriority.map((s) => (
          <span
            key={s.key}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: s.color,
              background: s.color + "1a",
              padding: "3px 10px",
              borderRadius: 6,
            }}
          >
            {s.label} : {s.count}
          </span>
        ))}
        {columns.map((col) => (
          <span
            key={col.id}
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#64748B",
              background: "rgba(255,255,255,0.04)",
              padding: "3px 10px",
              borderRadius: 6,
            }}
          >
            {col.label} : {actions.filter((a) => a.status === col.id).length}
          </span>
        ))}
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "actions", label: "Plan d'action" },
          { key: "incidents", label: "Incidents" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-4 py-[7px] rounded-lg text-[13px] font-semibold border cursor-pointer transition-all duration-150 font-[inherit]"
            style={{
              background: activeTab === t.key ? "rgba(6,182,212,0.12)" : "transparent",
              color: activeTab === t.key ? ACCENT : "#64748b",
              borderColor: activeTab === t.key ? "rgba(6,182,212,0.3)" : "#E2E8F0",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ========== PLAN D'ACTION TAB ========== */}
      {activeTab === "actions" && (
        <>
          {/* Add column button */}
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              style={{
                ...btnSecondary,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                padding: "6px 14px",
              }}
              onClick={addColumn}
            >
              <PlusIcon size={12} color="#64748B" />
              Ajouter une colonne
            </button>
          </div>

          {/* Kanban board — scrollable horizontally */}
          <div
            style={{
              display: "flex",
              gap: 10,
              minHeight: 300,
              flexWrap: "wrap",
            }}
          >
            {columns.map((col) => {
              const colActions = actions.filter((a) => a.status === col.id);
              const isCustom = !["todo", "in_progress", "done"].includes(col.id);
              return (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  actions={colActions}
                  columns={columns}
                  onAddClick={openAddTask}
                  onMove={moveTask}
                  onEdit={openEditTask}
                  onDelete={deleteTask}
                  onDeleteColumn={deleteColumn}
                  isCustom={isCustom}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ========== INCIDENTS TAB ========== */}
      {activeTab === "incidents" && (
        <div>
          {/* Declare incident button */}
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              style={{
                ...btnPrimary,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
              onClick={openAddIncident}
            >
              <AlertTriangleIcon size={14} color={ACCENT} />
              Déclarer un incident
            </button>
          </div>

          <div
            style={{
              background: "#E8E9EC",
              border: "1px solid #2a2d3a",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* 72h CNIL warning banner */}
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                borderBottom: "1px solid rgba(239,68,68,0.2)",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertTriangleIcon size={16} color="#ef4444" />
              <span className="text-[12px] font-semibold" style={{ color: "#ef4444" }}>
                Rappel CNIL : notification obligatoire sous 72h après découverte d'une violation de données (Art. 33 RGPD)
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2d3a" }}>
                    {["Date", "Description", "Gravité", "Données", "Affectés", "Statut", "72h", "Actions"].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: "10px 10px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#64748B",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => {
                    const sev = SEVERITY_MAP[inc.severity];
                    const statusStyle = INCIDENT_STATUS_COLORS[inc.status] || { bg: "rgba(107,114,128,0.12)", text: "#64748B" };
                    const cnilStatus = inc.status !== "resolved" ? get72hRemaining(inc.date) : null;
                    const canAdvance = INCIDENT_STATUSES.indexOf(inc.status) < INCIDENT_STATUSES.length - 1;

                    return (
                      <tr key={inc.id} style={{ borderBottom: "1px solid #2a2d3a" }} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td style={{ padding: "12px 10px", fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>
                          {formatDateTimeFr(inc.date)}
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: 13, color: "#e2e4ea", maxWidth: 200 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {inc.description}
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ background: sev.bg, color: sev.color, padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                            {inc.severity} — {sev.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: 12, color: "#64748B", maxWidth: 140 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {inc.dataTypes}
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: 13, color: "#e2e4ea", textAlign: "center" }}>
                          {inc.affectedCount.toLocaleString("fr-FR")}
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                            {INCIDENT_STATUS_LABELS[inc.status]}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          {cnilStatus ? (
                            <span
                              style={{
                                background: cnilStatus.bg,
                                color: cnilStatus.color,
                                padding: "3px 10px",
                                borderRadius: 5,
                                fontSize: 11,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              {cnilStatus.expired && <AlertTriangleIcon size={11} color={cnilStatus.color} />}
                              {cnilStatus.label}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#4b5563]">—</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            {canAdvance && (
                              <button
                                style={{
                                  ...iconBtn,
                                  background: "rgba(6,182,212,0.1)",
                                  borderRadius: 5,
                                  padding: "3px 8px",
                                  fontSize: 11,
                                  color: ACCENT,
                                  fontWeight: 600,
                                  fontFamily: "inherit",
                                  border: "none",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                                onClick={() => advanceIncident(inc.id)}
                                title="Avancer le statut"
                              >
                                <ArrowRightIcon size={11} color={ACCENT} />
                                <span style={{ marginLeft: 3 }}>
                                  {INCIDENT_STATUS_LABELS[INCIDENT_STATUSES[INCIDENT_STATUSES.indexOf(inc.status) + 1]]}
                                </span>
                              </button>
                            )}
                            <button
                              style={iconBtn}
                              onClick={() => deleteIncident(inc.id)}
                              title="Supprimer"
                              className="hover:bg-[rgba(239,68,68,0.12)]"
                            >
                              <XIcon size={12} color="#64748B" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {incidents.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: "30px 10px", textAlign: "center", fontSize: 13, color: "#94A3B8" }}>
                        Aucun incident déclaré
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Incident status pipeline */}
            <div
              style={{
                borderTop: "1px solid #2a2d3a",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span className="text-[11px] text-[#6b7280] font-medium mr-2">Cycle de vie :</span>
              {INCIDENT_STATUSES.map((step, i, arr) => (
                <span key={step} className="flex items-center gap-1.5">
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: i === arr.length - 1 ? "#22c55e" : "#64748B",
                      background: i === arr.length - 1 ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                      padding: "2px 8px",
                      borderRadius: 5,
                    }}
                  >
                    {INCIDENT_STATUS_LABELS[step]}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-[#3a3d4a] text-[10px]">&rarr;</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== TASK MODAL (Add / Edit) ========== */}
      <Modal
        open={taskModal !== null}
        onClose={() => setTaskModal(null)}
        title={taskModal?.mode === "edit" ? "Modifier l'action" : "Nouvelle action"}
      >
        <TaskForm
          task={editTask}
          setTask={setEditTask}
          onSave={saveTask}
          onCancel={() => setTaskModal(null)}
        />
      </Modal>

      {/* ========== INCIDENT MODAL ========== */}
      <Modal
        open={incidentModal !== null}
        onClose={() => setIncidentModal(null)}
        title="Déclarer un incident"
      >
        <IncidentForm
          incident={editIncident}
          setIncident={setEditIncident}
          onSave={saveIncident}
          onCancel={() => setIncidentModal(null)}
        />
      </Modal>
    </div>
  );
}
