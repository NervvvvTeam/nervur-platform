import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
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

const ArrowLeftIcon = ({ size = 16, color = "#6b7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const DownloadIcon = ({ size = 15, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function VaultScanDetailPage() {
  const { id } = useParams();
  const { get } = useApi();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const res = await fetch(`${API}/api/vault/scan/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur lors du telechargement du rapport.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-vault-${scan?.domain || "scan"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div style={{ maxWidth: "860px" }}>
      {/* Top actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/app/vault/history")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "7px 14px", borderRadius: "6px",
            background: "transparent", border: `1px solid ${BORDER_TINT}`,
            color: ACCENT, fontSize: "12px", fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = BG_TINT; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <ArrowLeftIcon size={14} color={ACCENT} />
          Retour
        </button>

        {scan && scan.status === "completed" && (
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "6px",
              background: downloadingPdf ? "#2a2d3a" : "linear-gradient(135deg, #06b6d4, #22d3ee)",
              border: "none",
              color: "#fff", fontSize: "12px", fontWeight: 500,
              cursor: downloadingPdf ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              opacity: downloadingPdf ? 0.7 : 1,
            }}
          >
            {downloadingPdf ? (
              <>
                <div style={{
                  width: "13px", height: "13px",
                  border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
                  borderRadius: "50%", animation: "vault-spin 0.8s linear infinite",
                }} />
                Generation...
              </>
            ) : (
              <>
                <DownloadIcon size={14} />
                Telecharger le rapport PDF
              </>
            )}
          </button>
        )}
      </div>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          width: "40px", height: "3px", borderRadius: "2px",
          background: "linear-gradient(135deg, #06b6d4, #22d3ee)",
          marginBottom: "16px"
        }} />
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3", marginBottom: "6px" }}>
          {scan ? scan.domain : "Détails de l'analyse"}
        </h1>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>
          {scan ? `Analyse du ${formatDate(scan.createdAt || scan.date)}` : "Chargement..."}
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
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>Chargement de l'analyse...</div>
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
