import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useParams, useNavigate } from "react-router-dom";
import { VaultResults } from "./VaultDashboardPage";

const ACCENT = "#06b6d4";
const BG_TINT = "rgba(6,182,212,0.08)";
const BORDER_TINT = "rgba(6,182,212,0.2)";

const ShieldIcon = ({ size = 28, color = ACCENT }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ArrowLeftIcon = ({ size = 16, color = "#A1A1AA" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function VaultScanDetailPage() {
  const { id } = useParams();
  const { get } = useApi();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get(`/api/vault/scan/${id}`);
      setScan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [get, id]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  return (
    <div style={{ maxWidth: "860px" }}>
      {/* Back button */}
      <button
        onClick={() => navigate("/app/vault/history")}
        style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "7px 14px", borderRadius: "6px",
          background: "transparent", border: `1px solid ${BORDER_TINT}`,
          color: ACCENT, fontSize: "12px", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
          marginBottom: "24px",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = BG_TINT; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <ArrowLeftIcon size={14} color={ACCENT} />
        Retour à l'historique
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: BG_TINT, border: `1px solid ${BORDER_TINT}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ShieldIcon size={24} color={ACCENT} />
        </div>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#FAFAFA", margin: 0 }}>
            {scan ? scan.domain : "Détails de l'analyse"}
          </h1>
          <p style={{ fontSize: "13px", color: "#71717A", margin: 0, marginTop: "2px" }}>
            {scan ? `Analyse du ${formatDate(scan.createdAt || scan.date)}` : "Chargement..."}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{
            width: "36px", height: "36px", margin: "0 auto 12px",
            border: "3px solid rgba(6,182,212,0.2)", borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "vault-spin 1s linear infinite",
          }} />
          <div style={{ fontSize: "13px", color: "#71717A" }}>Chargement de l'analyse...</div>
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

      {/* Results */}
      {scan && !loading && <VaultResults scan={scan} />}
    </div>
  );
}
