import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import SubNav from "../components/SubNav";

const VAULT_NAV = [
  { path: "/app/vault", label: "Scanner", end: true },
  { path: "/app/vault/monitoring", label: "Surveillance" },
  { path: "/app/vault/history", label: "Historique" },
  { path: "/app/vault/rgpd", label: "Conformité RGPD" },
];

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

const TrashIcon = ({ size = 15, color = "#9ca3af" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

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
    <div className="max-w-[860px]">
      <SubNav color="#06b6d4" items={VAULT_NAV} />
      {/* Header */}
      <div className="mb-8">
        <div className="w-10 h-[3px] rounded-sm bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] mb-4" />
        <h1 className="text-[22px] font-semibold text-[#f0f0f3] mb-1.5">
          Historique des analyses
        </h1>
        <p className="text-sm text-[#9ca3af]">
          Retrouvez toutes vos analyses de sécurité passées
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-9 h-9 mx-auto mb-3 border-[3px] border-[rgba(6,182,212,0.2)] border-t-[#06b6d4] rounded-full animate-[vault-spin_1s_linear_infinite]" />
          <div className="text-[13px] text-[#9ca3af]">Chargement...</div>
          <style>{`@keyframes vault-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3.5 py-2.5 mb-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-md text-[13px] text-[#fca5a5]">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && scans.length === 0 && (
        <div className="bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-[10px] text-center px-6 py-12 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          <ShieldIcon size={48} color="#3f3f46" />
          <div className="text-base font-semibold text-[#9ca3af] mt-4 mb-2">
            Aucune analyse effectuée
          </div>
          <div className="text-[13px] text-[#d1d5db] leading-relaxed mb-5">
            Vous n'avez pas encore lancé d'analyse de sécurité.
            <br />Commencez par scanner les emails de votre entreprise.
          </div>
          <button
            onClick={() => navigate("/app/vault")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#22d3ee] border-none text-[#0f0f11] text-[13px] font-semibold cursor-pointer font-[inherit] shadow-[0_4px_16px_rgba(6,182,212,0.4)]"
          >
            <ShieldIcon size={16} color="#0f0f11" />
            Lancer une analyse
          </button>
        </div>
      )}

      {/* Scan list */}
      {!loading && scans.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {scans.map(scan => {
            const scanId = scan._id || scan.id;
            const riskLevel = scan.riskLevel || "low";
            const riskColor = RISK_COLORS[riskLevel];
            const compromised = scan.compromisedCount ?? scan.compromised ?? 0;

            return (
              <div
                key={scanId}
                onClick={() => navigate(`/app/vault/scan/${scanId}`)}
                className="bg-[#1e2029] rounded-[10px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.2)] cursor-pointer transition-all duration-150 flex items-center gap-4 hover:bg-[rgba(6,182,212,0.08)]"
                style={{
                  border: `1px solid ${BORDER_TINT}`,
                  borderLeft: `3px solid ${ACCENT}`,
                }}
              >
                {/* Shield icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{
                  background: `${riskColor}12`,
                  border: `1px solid ${riskColor}25`,
                }}>
                  <ShieldIcon size={20} color={riskColor} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-[#f0f0f3]">
                      {scan.domain}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{
                      color: riskColor,
                      background: `${riskColor}15`,
                      border: `1px solid ${riskColor}30`,
                    }}>
                      {RISK_LABELS[riskLevel] || riskLevel}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-[#9ca3af]">
                    <span>{formatDate(scan.createdAt || scan.date)}</span>
                    <span>{compromised} email{compromised > 1 ? "s" : ""} compromis</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, scanId)}
                  disabled={deletingId === scanId}
                  className="bg-transparent border border-transparent rounded-md p-1.5 flex items-center justify-center shrink-0 transition-all duration-150 hover:opacity-100 hover:border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.1)]"
                  style={{
                    cursor: deletingId === scanId ? "wait" : "pointer",
                    opacity: deletingId === scanId ? 0.4 : 0.6,
                  }}
                  title="Supprimer cette analyse"
                >
                  <TrashIcon color="#ef4444" />
                </button>

                {/* Arrow */}
                <span className="text-[#06b6d4] text-base shrink-0">&#8594;</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
