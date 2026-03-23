import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";

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

const ShieldIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ClockIcon = ({ size = 18, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const TrashIcon = ({ size = 15, color = "#71717A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const cardStyle = {
  background: "#141416",
  border: "1px solid #1e1e22",
  borderRadius: "10px",
  padding: "24px",
};

export default function VaultHistoryPage() {
  const { get, del } = useApi();
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get("/api/vault/history");
      setScans(data.scans || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = useCallback(async (e, scanId) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette analyse ? Cette action est irréversible.")) return;
    try {
      setDeletingId(scanId);
      await del(`/api/vault/scan/${scanId}`);
      setScans(prev => prev.filter(s => (s._id || s.id) !== scanId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }, [del]);

  return (
    <div style={{ maxWidth: "860px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #06b6d4, #22d3ee)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", marginBottom: "6px" }}>
          Historique des analyses
        </h1>
        <p style={{ fontSize: "14px", color: "#71717A" }}>
          Retrouvez toutes vos analyses de sécurité passées
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{
            width: "36px", height: "36px", margin: "0 auto 12px",
            border: "3px solid rgba(6,182,212,0.2)", borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "vault-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "13px", color: "#71717A" }}>Chargement...</div>
          <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

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

      {/* Empty state */}
      {!loading && !error && scans.length === 0 && (
        <div style={{
          ...cardStyle,
          border: `1px solid ${BORDER_TINT}`,
          background: BG_TINT,
          textAlign: "center",
          padding: "48px 24px",
        }}>
          <ShieldIcon size={48} color="#3f3f46" />
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#71717A", marginTop: "16px", marginBottom: "8px" }}>
            Aucune analyse effectuée
          </div>
          <div style={{ fontSize: "13px", color: "#52525B", lineHeight: 1.6, marginBottom: "20px" }}>
            Vous n'avez pas encore lancé d'analyse de sécurité.
            <br />Commencez par scanner les emails de votre entreprise.
          </div>
          <button
            onClick={() => navigate("/app/vault")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", borderRadius: "8px",
              background: "linear-gradient(135deg, #06b6d4, #22d3ee)", border: "none",
              color: "#0f0f11", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(6,182,212,0.4)",
            }}
          >
            <ShieldIcon size={16} color="#0f0f11" />
            Lancer une analyse
          </button>
        </div>
      )}

      {/* Scan list */}
      {!loading && scans.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {scans.map(scan => {
            const scanId = scan._id || scan.id;
            const riskLevel = scan.riskLevel || "low";
            const riskColor = RISK_COLORS[riskLevel];
            const compromised = scan.compromisedCount ?? scan.compromised ?? 0;

            return (
              <div
                key={scanId}
                onClick={() => navigate(`/app/vault/scan/${scanId}`)}
                style={{
                  ...cardStyle,
                  border: `1px solid ${BORDER_TINT}`,
                  borderLeft: `3px solid ${ACCENT}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = BG_TINT; e.currentTarget.style.borderColor = ACCENT + "40"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#141416"; e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)"; }}
              >
                {/* Shield icon */}
                <div style={{
                  width: "40px", height: "40px", borderRadius: "8px",
                  background: `${riskColor}12`,
                  border: `1px solid ${riskColor}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <ShieldIcon size={20} color={riskColor} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#FAFAFA" }}>
                      {scan.domain}
                    </span>
                    <span style={{
                      fontSize: "11px", fontWeight: 600,
                      color: riskColor,
                      background: `${riskColor}15`,
                      padding: "2px 8px", borderRadius: "4px",
                      border: `1px solid ${riskColor}30`,
                    }}>
                      {RISK_LABELS[riskLevel] || riskLevel}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#71717A" }}>
                    <span>{formatDate(scan.createdAt || scan.date)}</span>
                    <span>{compromised} email{compromised > 1 ? "s" : ""} compromis</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, scanId)}
                  disabled={deletingId === scanId}
                  style={{
                    background: "transparent", border: "1px solid transparent",
                    borderRadius: "6px", padding: "6px",
                    cursor: deletingId === scanId ? "wait" : "pointer",
                    opacity: deletingId === scanId ? 0.4 : 0.6,
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
                  title="Supprimer cette analyse"
                >
                  <TrashIcon color="#ef4444" />
                </button>

                {/* Arrow */}
                <span style={{ color: ACCENT, fontSize: "16px", flexShrink: 0 }}>&#8594;</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
