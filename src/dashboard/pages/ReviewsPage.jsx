import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import ReviewCard from "../components/ReviewCard";
import SubNav from "../components/SubNav";

const SENTINEL_NAV = [
  { path: "/app/sentinel", label: "Dashboard", end: true },
  { path: "/app/reviews", label: "Avis clients" },
  { path: "/app/analytics", label: "Analyse IA" },
  { path: "/app/competitors", label: "Concurrents" },
  { path: "/app/reports", label: "Rapports" },
  { path: "/app/qrcode", label: "QR Code" },
  { path: "/app/widget", label: "Widget" },
  { path: "/app/alerts", label: "Alertes" },
  { path: "/app/settings", label: "Paramètres" },
];

const FILTERS = [
  { key: "all", label: "Tous", color: "#6366f1" },
  { key: "positive", label: "Positifs", color: "#22c55e" },
  { key: "negative", label: "Négatifs", color: "#ef4444" },
  { key: "mixed", label: "Mixtes", color: "#f59e0b" },
];

const STATUS_FILTERS = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "generated", label: "Réponse prête" },
  { key: "published", label: "Publiés" },
];

export default function ReviewsPage() {
  const { get } = useApi();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadBusiness();
  }, []);

  useEffect(() => {
    if (business) loadReviews();
  }, [business, sentiment, status, page]);

  async function loadBusiness() {
    try {
      const res = await get("/api/sentinel-app/businesses");
      if (res.businesses[0]) setBusiness(res.businesses[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews() {
    try {
      const params = new URLSearchParams({ page, limit: 20, sentiment, status });
      const res = await get(`/api/sentinel-app/reviews/${business._id}?${params}`);
      setReviews(res.reviews);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#d1d5db" }}>Chargement...</div>;
  if (!business) return <div style={{ padding: "60px", textAlign: "center", color: "#d1d5db" }}>Aucune entreprise configurée</div>;

  return (
    <div style={{ maxWidth: "900px" }}>
      <SubNav color="#ef4444" items={SENTINEL_NAV} />
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 500 }}>Sentinel</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#f0f0f3" }}>Avis clients</h1>
          <span style={{ fontSize: "12px", color: "#d1d5db" }}>{pagination?.total || 0} avis au total</span>
        </div>
        <p style={{ fontSize: "14px", color: "#9ca3af" }}>Consultez et gérez les avis de vos clients.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => { setSentiment(f.key); setPage(1); }}
              style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 500,
                background: sentiment === f.key ? `${f.color}22` : "transparent",
                border: `1px solid ${sentiment === f.key ? `${f.color}45` : "#2a2d3a"}`,
                borderRadius: "6px", color: sentiment === f.key ? f.color : "#9ca3af",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                boxShadow: sentiment === f.key ? `0 0 8px ${f.color}15` : "none"
              }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {STATUS_FILTERS.map(f => (
            <button key={f.key} onClick={() => { setStatus(f.key); setPage(1); }}
              style={{
                padding: "6px 14px", fontSize: "12px", fontWeight: 500,
                background: status === f.key ? "rgba(99,102,241,0.15)" : "transparent",
                border: `1px solid ${status === f.key ? "rgba(99,102,241,0.35)" : "#2a2d3a"}`,
                borderRadius: "6px", color: status === f.key ? "#818CF8" : "#9ca3af",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                boxShadow: status === f.key ? "0 0 8px rgba(99,102,241,0.1)" : "none"
              }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {reviews.length > 0 ? reviews.map(r => (
          <ReviewCard key={r._id} review={r} businessId={business._id} />
        )) : (
          <div style={{ padding: "60px", textAlign: "center", color: "#d1d5db", border: "1px dashed #e5e7eb", borderRadius: "10px" }}>
            Aucun avis avec ces filtres
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{
                width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${page === i + 1 ? "#6366f150" : "#2a2d3a"}`,
                background: page === i + 1 ? "linear-gradient(135deg, #6366f1, #818CF8)" : "transparent",
                color: page === i + 1 ? "#ffffff" : "#9ca3af",
                cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 500,
                transition: "all 0.2s"
              }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
